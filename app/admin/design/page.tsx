import { redirect } from "next/navigation";
import AdminDesign from "../../../components/admin-design";
import { requireAdmin } from "../../../lib/admin-auth";
import { getSiteSetting, listFilamentTypes, listProducts } from "../../../lib/db";
import { parseHomeContent } from "../../../lib/site-content";
import { completeFilamentContents, parseFilamentContents } from "../../../lib/filament-content";
import { parseSlideshowContent } from "../../../lib/slideshow-content";
import { parseSnapmakerU1Content } from "../../../lib/snapmaker-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design | Tiger Tech" };

export default async function Page() {
  if (!(await requireAdmin())) redirect("/admin");
  const [heroImage, content, rawFilamentContent, rawSlideshowContent, slideshowImageOne, slideshowImageTwo, rawSnapmakerContent, types, products] = await Promise.all([getSiteSetting("hero_image"), getSiteSetting("home_content"), getSiteSetting("filament_type_content"), getSiteSetting("slideshow_content"), getSiteSetting("slideshow_image_1"), getSiteSetting("slideshow_image_2"), getSiteSetting("snapmaker_u1_content"), listFilamentTypes(), listProducts(true)]);
  return <AdminDesign initialImage={heroImage} initialContent={parseHomeContent(content)} initialFilamentContents={completeFilamentContents(types, products, parseFilamentContents(rawFilamentContent))} initialSlideshow={parseSlideshowContent(rawSlideshowContent)} initialSlideshowImages={[slideshowImageOne, slideshowImageTwo]} initialSnapmakerContent={parseSnapmakerU1Content(rawSnapmakerContent)} />;
}
