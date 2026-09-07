import { getSiteSetting } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/settings/slideshow/[slide]">,
) {
  const { slide } = await context.params;
  if (slide !== "1" && slide !== "2")
    return new Response(null, { status: 404 });
  const value = await getSiteSetting(`slideshow_image_${slide}`);
  const match = value.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) return new Response(null, { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
