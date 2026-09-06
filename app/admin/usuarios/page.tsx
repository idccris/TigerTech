import { redirect } from "next/navigation";
import AdminUsers from "../../../components/admin-users";
import { requireAdmin } from "../../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Usuários | Tiger Tech" };
export default async function Page() {
  if (!(await requireAdmin())) redirect("/admin");
  return <AdminUsers />;
}
