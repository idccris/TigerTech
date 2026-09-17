import fs from "node:fs/promises";
import path from "node:path";
import { listProducts } from "../../../lib/db";
import { buildCatalogPdf } from "../../../lib/catalog-pdf";
import { groupProducts } from "../../../lib/product-variants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const generatedAt = new Date();
    const [products, logo] = await Promise.all([
      listProducts(false),
      fs.readFile(path.join(process.cwd(), "public", "tiger-tech-logo.png")),
    ]);
    const pdf = buildCatalogPdf({
      products: groupProducts(products),
      logo,
      generatedAt,
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
