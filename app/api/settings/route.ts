import { getSiteSetting, getSiteSettingMeta } from "../../../lib/db";
import { parseHomeContent } from "../../../lib/site-content";
import { legacySlideshowImageKey, parseSlideshowContent, slideshowImageKey } from "../../../lib/slideshow-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [heroMeta, rawContent, rawSlideshowContent] = await Promise.all([
      getSiteSettingMeta("hero_image"),
      getSiteSetting("home_content"),
      getSiteSetting("slideshow_content"),
    ]);
    const version = heroMeta?.updated_at ? new Date(heroMeta.updated_at).getTime() : 0;
    const heroImage = Number(heroMeta?.size || 0) > 0 ? `/api/settings/hero?v=${version}` : "";
    const slideshowContent = parseSlideshowContent(rawSlideshowContent);
    const slideshowMetas = await Promise.all(slideshowContent.slides.map(async (slide) => {
      const meta = await getSiteSettingMeta(slideshowImageKey(slide.id));
      const legacyKey = legacySlideshowImageKey(slide.id);
      return meta || (legacyKey ? getSiteSettingMeta(legacyKey) : null);
    }));
    const slideshowImages = slideshowMetas.map((meta, index) => {
      if (Number(meta?.size || 0) <= 0) return slideshowContent.slides[index].defaultImage;
      const imageVersion = meta?.updated_at ? new Date(meta.updated_at).getTime() : 0;
      return `/api/settings/slideshow/${slideshowContent.slides[index].id}?v=${imageVersion}`;
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
