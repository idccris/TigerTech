import { redirect } from "next/navigation";
import AdminContents from "../../../components/admin-contents";
import { requireAdmin } from "../../../lib/admin-auth";
import { listContentPosts } from "../../../lib/content-posts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conteúdos | Tiger Tech" };

export default async function Page() {
  if (!(await requireAdmin())) redirect("/admin");
  return <AdminContents initialPosts={await listContentPosts(true)} />;
}
