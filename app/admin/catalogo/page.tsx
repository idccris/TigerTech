import { redirect } from "next/navigation";
import AdminCatalog from "../../../components/admin-catalog";
import { requireUser } from "../../../lib/admin-auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Catálogos das máquinas | Tiger Tech" };
export default async function Page() {
  const user = await requireUser();
  if (!user) redirect("/admin");
  if (user.role !== "admin") redirect("/admin/produtos");
  return <AdminCatalog />;
}
