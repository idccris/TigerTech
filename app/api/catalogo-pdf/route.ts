import fs from "node:fs/promises";
import path from "node:path";
import { getProductImage, listProducts } from "../../../lib/db";
import { buildCatalogPdf, type CatalogImage } from "../../../lib/catalog-pdf";
import { groupProducts } from "../../../lib/product-variants";
import type { Product } from "../../../lib/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function primaryImage(product: Product) {
  if (product.imageUrl) return product.imageUrl;
  return product.variants?.find(
    (variant) => (variant.stock || 0) > 0 && variant.imageUrl,
  )?.imageUrl;
}

async function loadCatalogImages(products: Product[], requestUrl: string) {
  const images: Record<string, CatalogImage> = {};
  const baseUrl = new URL(requestUrl).origin;
  const pending = products
    .map((product) => ({ product, source: primaryImage(product) }))
    .filter((entry): entry is { product: Product; source: string } => Boolean(entry.source));

  for (let index = 0; index < pending.length; index += 8) {
    const batch = pending.slice(index, index + 8);
    await Promise.all(batch.map(async ({ product, source }) => {
      try {
        if (source.startsWith("/api/products/image")) {
          const slug = new URL(source, baseUrl).searchParams.get("slug") || product.slug;
          const row = await getProductImage(slug);
          const stored = String(row?.image_url || "");
          const match = stored.match(/^data:(image\/(?:png|jpeg));base64,(.+)$/);
          if (match) {
            const data = Buffer.from(match[2], "base64");
            if (data.length <= 5_000_000) {
              images[product.slug] = { data, mimeType: match[1] };
            }
            return;
          }
        }

        const imageUrl = new URL("/_next/image", baseUrl);
        imageUrl.searchParams.set("url", source);
        imageUrl.searchParams.set("w", "384");
        imageUrl.searchParams.set("q", "75");
        const response = await fetch(imageUrl, {
          headers: { Accept: "image/jpeg,image/png" },
          next: { revalidate: 86400 },
        });
        if (!response.ok) return;
        const data = Buffer.from(await response.arrayBuffer());
        if (data.length > 5_000_000) return;
        const mimeType =
          data[0] === 0xff && data[1] === 0xd8
            ? "image/jpeg"
            : data.subarray(1, 4).toString("ascii") === "PNG"
              ? "image/png"
              : "";
        if (mimeType) images[product.slug] = { data, mimeType };
      } catch {
        // O item continua no PDF com um marcador visual caso a imagem esteja indisponível.
      }
    }));
  }
  return images;
}

export async function GET(request: Request) {
  try {
    const generatedAt = new Date();
    const [rawProducts, logo] = await Promise.all([
      listProducts(false),
      fs.readFile(path.join(process.cwd(), "public", "tiger-tech-logo.png")),
    ]);
    const products = groupProducts(rawProducts);
    const images = await loadCatalogImages(products, request.url);
    const pdf = buildCatalogPdf({
      products,
      logo,
      generatedAt,
      images,
    });
    const date = generatedAt.toISOString().slice(0, 10);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="catalogo-tiger-tech-${date}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Falha ao gerar catalogo PDF", error);
    return Response.json(
      { error: "Não foi possível gerar o catálogo agora." },
      { status: 500 },
    );
  }
}
