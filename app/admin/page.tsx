import AdminPanel from "../../components/admin-panel";
import { redirect } from "next/navigation";
import { requireUser } from "../../lib/admin-auth";
export const metadata = { title: "Administração | Tiger Tech" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireUser();
  if (user?.role === "operator") redirect("/admin/catalogo");
  return <AdminPanel initialLogged={Boolean(user)} />;
}
