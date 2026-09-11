import { NextRequest } from "next/server";
import {
  findProduct,
  listFeaturedProducts,
  listProducts,
} from "../../../lib/db";
import { publicCatalogProducts } from "../../../lib/public-data";
import type { Product } from "../../../lib/products";
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
      ? (await Promise.all(slugs.map(findProduct))).filter((product): product is Product => product !== null)
      : slug
      ? await findProduct(slug)
      : featured
        ? await listFeaturedProducts()
        : await listProducts(false);
    const lightweight = (product: any) => product ? ({ ...product, imageUrl: product.imageUrl ? `/api/products/image?slug=${encodeURIComponent(product.slug)}&v=${encodeURIComponent(product.updatedAt || "1")}` : "" }) : null;
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
