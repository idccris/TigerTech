import { NextRequest } from "next/server";
import { getContentPostImage } from "../../../../lib/content-posts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = String(req.nextUrl.searchParams.get("slug") || "").slice(0, 100);
  const index = Math.max(0, Math.min(4, Number(req.nextUrl.searchParams.get("index")) || 0));
  const row = await getContentPostImage(slug, index);
  const match = String(row?.image || "").match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) return new Response(null, { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
