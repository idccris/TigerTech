import { getSiteSetting, getSiteSettingMeta } from "../../../lib/db";
import { parseHomeContent } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [heroMeta, rawContent] = await Promise.all([
      getSiteSettingMeta("hero_image"),
      getSiteSetting("home_content"),
    ]);
    const version = heroMeta?.updated_at ? new Date(heroMeta.updated_at).getTime() : 0;
    const heroImage = Number(heroMeta?.size || 0) > 0 ? `/api/settings/hero?v=${version}` : "";
    return Response.json(
      { heroImage, homeContent: parseHomeContent(rawContent) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro" },
      { status: 503 },
    );
  }
}
