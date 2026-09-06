import { redirect } from "next/navigation";
import AdminDesign from "../../../components/admin-design";
import { requireAdmin } from "../../../lib/admin-auth";
import { getSiteSetting } from "../../../lib/db";
import { parseHomeContent } from "../../../lib/site-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design | Tiger Tech" };

export default async function Page() {
  if (!(await requireAdmin())) redirect("/admin");
  const [heroImage, content] = await Promise.all([getSiteSetting("hero_image"), getSiteSetting("home_content")]);
  return <AdminDesign initialImage={heroImage} initialContent={parseHomeContent(content)} />;
}
