import { NextRequest } from "next/server";
import {
  findProduct,
  listFeaturedProducts,
  listProducts,
} from "../../../lib/db";
import { publicCatalogProducts } from "../../../lib/public-data";
import type { Product } from "../../../lib/products";
import { storefrontProductImage, storefrontProductImages } from "../../../lib/product-images";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const featured = req.nextUrl.searchParams.get("featured") === "true";
    const catalog = req.nextUrl.searchParams.get("catalog") === "true";
    const slugs = (req.nextUrl.searchParams.get("slugs") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 30);
    const raw = slugs.length
      ? (await Promise.all(slugs.map(findProduct))).filter((product) => product !== null) as Product[]
      : slug
      ? await findProduct(slug)
      : featured
        ? await listFeaturedProducts()
        : await listProducts(false);
    const lightweight = (product: Product | null) => product ? ({ ...product, imageUrl: storefrontProductImage(product), imageUrls: storefrontProductImages(product) }) : null;
    const data = catalog && Array.isArray(raw)
      ? publicCatalogProducts(raw)
      : Array.isArray(raw) ? raw.map(lightweight) : lightweight(raw);
    return Response.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 503 },
    );
  }
}
