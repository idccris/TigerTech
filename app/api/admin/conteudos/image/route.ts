import { NextRequest } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { getContentPostImage } from "../../../../../lib/content-posts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return new Response(null, { status: 401 });
  const slug = String(req.nextUrl.searchParams.get("slug") || "").slice(0, 100);
  const index = Math.max(0, Math.min(4, Number(req.nextUrl.searchParams.get("index")) || 0));
  const row = await getContentPostImage(slug, index, true);
  const match = String(row?.image || "").match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) return new Response(null, { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: { "Content-Type": match[1], "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}
