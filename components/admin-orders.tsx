"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminNavbar from "./admin-navbar";

type OrderItem = {
  slug: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};
type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string;
  customer_address: string;
  items: OrderItem[];
  total_cents: number;
  payment_method?: string;
  status: string;
  created_at: string | Date;
};

type DeleteTarget =
  | { scope: "all" }
  | { scope: "single"; order: Order };

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export default function AdminOrders({
  orders,
  total,
  page,
  pageCount,
}: {
  orders: Order[];
  total: number;
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function updateStatus(order: Order) {
    const action = order.status === "Recebido" ? "separate" : "complete";
    setProcessingId(order.id);
    setError("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: order.id, action }),
    });
    const result = await response.json();
    setProcessingId("");
    if (!response.ok) {
      setError(result.error || "Não foi possível atualizar o pedido.");
      return;
    }
    router.refresh();
  }

  function openDelete(target: DeleteTarget) {
    setDeleteTarget(target);
    setDeletePassword("");
    setDeleteError("");
  }

  function closeDelete() {
    if (deleting) return;
    setDeleteTarget(null);
    setDeletePassword("");
    setDeleteError("");
  }

  async function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deleteTarget || !deletePassword) return;

    setDeleting(true);
    setDeleteError("");
    const response = await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        deleteTarget.scope === "all"
          ? {
              scope: "all",
              password: deletePassword,
              confirmation: "EXCLUIR TODOS",
            }
          : {
              scope: "single",
              id: deleteTarget.order.id,
              password: deletePassword,
            },
      ),
    });
    const result = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      setDeleteError(result.error || "Não foi possível excluir o pedido.");
      return;
    }

    setDeleteTarget(null);
    setDeletePassword("");
    router.refresh();
  }

  return (
    <main className="admin-orders-page">
      <AdminNavbar />
      <header className="admin-orders-hero">
        <div>
          <span>GESTÃO COMERCIAL</span>
          <h1>Pedidos</h1>
          <p>Pedidos finalizados pelos clientes através da loja.</p>
        </div>
        <div className="orders-hero-actions">
          <article>
            <strong>{total}</strong>
            <small>
              {total === 1 ? "pedido recebido" : "pedidos recebidos"}
            </small>
          </article>
          <a href="/api/admin/orders/export">
            Exportar últimos 50 pedidos <span>↓</span>
          </a>
          <button
            className="orders-delete-all"
            type="button"
            disabled={total === 0}
            onClick={() => openDelete({ scope: "all" })}
          >
            Excluir todos os pedidos <span>×</span>
          </button>
        </div>
      </header>
      <section className="orders-list">
        {error ? <div className="orders-error">{error}</div> : null}
        {orders.length === 0 ? (
          <div className="orders-empty">
            <strong>Nenhum pedido recebido</strong>
            <p>Os novos pedidos aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          orders.map((order) => (
            <article className="order-card" key={order.id}>
              <header>
                <div>
                  <span>{order.id}</span>
                  <h2>{order.customer_name}</h2>
                  <small>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    }).format(new Date(order.created_at))}
                  </small>
                </div>
                <div className="order-status-area">
                  <em
                    className={`status-${order.status.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    {order.status.toUpperCase()}
                  </em>
                  <strong>{money(Number(order.total_cents))}</strong>
                  {order.status !== "Concluído" ? (
                    <button
                      className="order-status-button"
                      type="button"
                      disabled={processingId === order.id}
                      onClick={() => updateStatus(order)}
                    >
                      {processingId === order.id
                        ? "PROCESSANDO..."
                        : order.status === "Recebido"
                          ? "SEPARAR"
                          : "CONCLUIR"}
                    </button>
                  ) : null}
                  <button
                    className="order-delete-button"
                    type="button"
                    onClick={() => openDelete({ scope: "single", order })}
                  >
                    Excluir pedido
                  </button>
                </div>
              </header>
              <div className="order-customer">
                <span>
                  <b>E-mail</b>
                  {order.customer_email}
                </span>
                <span>
                  <b>Telefone</b>
                  {order.customer_phone}
                </span>
                <span>
                  <b>CPF/CNPJ</b>
                  {order.customer_document || "Não informado"}
                </span>
                <span>
                  <b>Endereço</b>
                  {order.customer_address || "Não informado"}
                </span>
                <span>
                  <b>Pagamento</b>
                  {order.payment_method === "pix" ? "Pix" : order.payment_method === "card" ? "Cartão" : "Não informado"}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.slug}`}>
                    <span>
                      <b>{item.quantity}×</b> {item.name}
                      <small>SKU: {item.sku || "—"}</small>
                    </span>
                    <span>
                      {money(item.unitPriceCents)}
                      <strong>{money(item.subtotalCents)}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
      {pageCount > 1 ? (
        <nav className="orders-pagination" aria-label="Paginação de pedidos">
          <Link
            href={`/admin/pedidos?page=${Math.max(1, page - 1)}`}
            aria-disabled={page === 1}
            className={page === 1 ? "disabled" : ""}
          >
            ← Anterior
          </Link>
          <div>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Link
                  key={pageNumber}
                  href={`/admin/pedidos?page=${pageNumber}`}
                  className={pageNumber === page ? "active" : ""}
                >
                  {pageNumber}
                </Link>
              ),
            )}
          </div>
          <Link
            href={`/admin/pedidos?page=${Math.min(pageCount, page + 1)}`}
            aria-disabled={page === pageCount}
            className={page === pageCount ? "disabled" : ""}
          >
            Próxima →
          </Link>
        </nav>
      ) : null}
      {deleteTarget ? (
        <div
          className="order-delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-delete-title"
        >
          <form onSubmit={confirmDelete}>
            <div className="order-delete-modal-head">
              <div>
                <span>CONFIRMAÇÃO ADMINISTRATIVA</span>
                <h2 id="order-delete-title">
                  {deleteTarget.scope === "all"
                    ? "Excluir todos os pedidos?"
                    : "Excluir este pedido?"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar confirmação"
                onClick={closeDelete}
              >
                ×
              </button>
            </div>
            <p>
              {deleteTarget.scope === "all"
                ? `Os ${total} pedidos serão excluídos permanentemente. Esta ação não pode ser desfeita.`
                : `O pedido ${deleteTarget.order.id}, de ${deleteTarget.order.customer_name}, será excluído permanentemente.`}
            </p>
            <label htmlFor="order-delete-password">
              Senha do administrador
            </label>
            <input
              id="order-delete-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Digite a senha para confirmar"
              required
            />
            {deleteError ? (
              <div className="order-delete-error" role="alert">
                {deleteError}
              </div>
            ) : null}
            <div className="order-delete-modal-actions">
              <button type="button" onClick={closeDelete} disabled={deleting}>
                Cancelar
              </button>
              <button type="submit" disabled={deleting || !deletePassword}>
                {deleting
                  ? "EXCLUINDO..."
                  : deleteTarget.scope === "all"
                    ? "EXCLUIR TODOS"
                    : "EXCLUIR PEDIDO"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
