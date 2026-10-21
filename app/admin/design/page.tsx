import { redirect } from "next/navigation";
import AdminDesign from "../../../components/admin-design";
import { requireAdmin } from "../../../lib/admin-auth";
import { getSiteSetting, listFilamentTypes, listProducts } from "../../../lib/db";
import { parseHomeContent } from "../../../lib/site-content";
import { completeFilamentContents, parseFilamentContents } from "../../../lib/filament-content";
import { legacySlideshowImageKey, parseSlideshowContent, slideshowImageKey } from "../../../lib/slideshow-content";
import { heroSlideImageKey, parseHeroSlideshowContent } from "../../../lib/hero-slideshow-content";
import { parseSnapmakerU1Content } from "../../../lib/snapmaker-content";
import { parseLandingPages } from "../../../lib/landing-pages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design | Tiger Tech" };

export default async function Page() {
  if (!(await requireAdmin())) redirect("/admin");
  const [heroImage, content, rawFilamentContent, rawHeroSlideshowContent, rawSlideshowContent, rawSnapmakerContent, rawLandingPages, types, products] = await Promise.all([getSiteSetting("hero_image"), getSiteSetting("home_content"), getSiteSetting("filament_type_content"), getSiteSetting("hero_slideshow_content"), getSiteSetting("slideshow_content"), getSiteSetting("snapmaker_u1_content"), getSiteSetting("landing_pages"), listFilamentTypes(), listProducts(true)]);
  const heroSlideshow = parseHeroSlideshowContent(rawHeroSlideshowContent);
  const heroSlideshowImages = await Promise.all(heroSlideshow.slides.map((slide, index) => getSiteSetting(heroSlideImageKey(slide.id)).then((image) => image || (index === 0 ? heroImage : ""))));
  const slideshow = parseSlideshowContent(rawSlideshowContent);
  const slideshowImages = await Promise.all(slideshow.slides.map((slide) => getSiteSetting(slideshowImageKey(slide.id)).then((image) => image || (legacySlideshowImageKey(slide.id) ? getSiteSetting(legacySlideshowImageKey(slide.id)) : ""))));
  return <AdminDesign initialImage={heroImage} initialContent={parseHomeContent(content)} initialHeroSlideshow={heroSlideshow} initialHeroSlideshowImages={heroSlideshowImages} initialFilamentContents={completeFilamentContents(types, products, parseFilamentContents(rawFilamentContent))} initialSlideshow={slideshow} initialSlideshowImages={slideshowImages} initialSnapmakerContent={parseSnapmakerU1Content(rawSnapmakerContent)} initialLandingPages={parseLandingPages(rawLandingPages)} />;
}
