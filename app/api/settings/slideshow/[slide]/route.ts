import { getSiteSetting } from "../../../../../lib/db";
import { safeSlideId, slideshowImageKey } from "../../../../../lib/slideshow-content";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/settings/slideshow/[slide]">,
) {
  const { slide } = await context.params;
  const id = safeSlideId(slide, "");
  if (!id || id !== slide)
    return new Response(null, { status: 404 });
  let value = await getSiteSetting(slideshowImageKey(id));
  if (!value && (slide === "snapmaker-u1" || slide === "bambu-lab-a1"))
    value = await getSiteSetting(`slideshow_image_${slide === "snapmaker-u1" ? 1 : 2}`);
  const match = value.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) return new Response(null, { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
