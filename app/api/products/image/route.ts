import { NextRequest } from "next/server";
import { getProductImage } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  const row = await getProductImage(slug);
  const value = String(row?.image_url || "");
  const match = value.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (match)
    return new Response(Buffer.from(match[2], "base64"), {
      headers: { "Content-Type": match[1], "Cache-Control": "public, max-age=31536000, immutable" },
    });

  try {
    const imageUrl = new URL(value);
    const allowedHosts = new Set(["store.bblcdn.com", "cdn.shopify.com"]);
    if (imageUrl.protocol !== "https:" || !allowedHosts.has(imageUrl.hostname))
      return new Response(null, { status: 404 });
    const response = await fetch(imageUrl, { next: { revalidate: 604800 } });
    const contentType = response.headers.get("content-type") || "";
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (!response.ok || !contentType.startsWith("image/") || contentLength > 10_000_000)
      return new Response(null, { status: 404 });
    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
