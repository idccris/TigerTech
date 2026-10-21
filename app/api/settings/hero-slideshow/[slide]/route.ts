import { getSiteSetting } from "../../../../../lib/db";
import { heroSlideImageKey, safeHeroSlideId } from "../../../../../lib/hero-slideshow-content";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/settings/hero-slideshow/[slide]">,
) {
  const { slide } = await context.params;
  const id = safeHeroSlideId(slide, "");
  if (!id || id !== slide) return new Response(null, { status: 404 });
  const value = await getSiteSetting(heroSlideImageKey(id));
  const match = value.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) return new Response(null, { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
