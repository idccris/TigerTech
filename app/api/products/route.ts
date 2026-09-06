import { NextRequest } from "next/server";
import {
  findProduct,
  listFeaturedProducts,
  listProducts,
} from "../../../lib/db";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const featured = req.nextUrl.searchParams.get("featured") === "true";
    const raw = slug
      ? await findProduct(slug)
      : featured
        ? await listFeaturedProducts()
        : await listProducts(false);
    const lightweight = (product: any) => product ? ({ ...product, imageUrl: product.imageUrl ? `/api/products/image?slug=${encodeURIComponent(product.slug)}&v=${encodeURIComponent(product.updatedAt || "1")}` : "" }) : null;
    const data = Array.isArray(raw) ? raw.map(lightweight) : lightweight(raw);
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
