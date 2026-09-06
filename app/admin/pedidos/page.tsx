import { redirect } from "next/navigation";
import AdminOrders from "../../../components/admin-orders";
import { requireAdmin } from "../../../lib/admin-auth";
import { getOrdersPage } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedidos | Tiger Tech" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!(await requireAdmin())) redirect("/admin");
  const requestedPage = Math.max(1, Number((await searchParams).page) || 1);
  const { orders, total } = await getOrdersPage(requestedPage, 10);
  const pageCount = Math.max(1, Math.ceil(total / 10));
  const page = Math.min(requestedPage, pageCount);
  if (page !== requestedPage) redirect(`/admin/pedidos?page=${page}`);
  return (
    <AdminOrders
      orders={orders as any}
      total={total}
      page={page}
      pageCount={pageCount}
    />
  );
}
