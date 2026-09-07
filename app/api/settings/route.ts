import { getSiteSetting, getSiteSettingMeta } from "../../../lib/db";
import { parseHomeContent } from "../../../lib/site-content";
import { parseSlideshowContent } from "../../../lib/slideshow-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [heroMeta, rawContent, rawSlideshowContent, slideOneMeta, slideTwoMeta] = await Promise.all([
      getSiteSettingMeta("hero_image"),
      getSiteSetting("home_content"),
      getSiteSetting("slideshow_content"),
      getSiteSettingMeta("slideshow_image_1"),
      getSiteSettingMeta("slideshow_image_2"),
    ]);
    const version = heroMeta?.updated_at ? new Date(heroMeta.updated_at).getTime() : 0;
    const heroImage = Number(heroMeta?.size || 0) > 0 ? `/api/settings/hero?v=${version}` : "";
    const slideshowContent = parseSlideshowContent(rawSlideshowContent);
    const slideshowImages = [slideOneMeta, slideTwoMeta].map((meta, index) => {
      if (Number(meta?.size || 0) <= 0) return slideshowContent.slides[index].defaultImage;
      const imageVersion = meta?.updated_at ? new Date(meta.updated_at).getTime() : 0;
      return `/api/settings/slideshow/${index + 1}?v=${imageVersion}`;
    });
    return Response.json(
      { heroImage, homeContent: parseHomeContent(rawContent), slideshowContent, slideshowImages },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro" },
      { status: 503 },
    );
  }
}
