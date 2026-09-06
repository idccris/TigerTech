import {
  requireAdmin,
  isTrustedMutation,
  verifyAdminPassword,
} from "../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PATCH(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id, action } = await req.json();
  if (!id || !["separate", "complete"].includes(action))
    return Response.json({ error: "Ação inválida." }, { status: 400 });

  await ensureDb();
  const db = sql();
  if (action === "separate") {
    const result =
      await db`UPDATE orders SET status='Em separação' WHERE id=${id} AND status='Recebido' RETURNING id,status`;
    if (!result.length)
      return Response.json(
        { error: "O pedido não está mais como recebido." },
        { status: 409 },
      );
    return Response.json(result[0]);
  }

  try {
    const results = await db.transaction((tx) => [
      tx`SELECT id FROM orders WHERE id=${id} AND status='Em separação' FOR UPDATE`,
      tx`SELECT 1 / CASE WHEN EXISTS (
        SELECT 1
        FROM orders o
        CROSS JOIN LATERAL jsonb_array_elements(o.items) item
        LEFT JOIN products p ON p.slug = item->>'slug'
        WHERE o.id=${id} AND o.status='Em separação'
          AND (p.slug IS NULL OR p.stock < (item->>'quantity')::int)
      ) THEN 0 ELSE 1 END AS stock_ok`,
      tx`UPDATE products p
        SET stock = p.stock - order_item.quantity, updated_at=NOW()
        FROM (
          SELECT item->>'slug' AS slug, (item->>'quantity')::int AS quantity
          FROM orders o, jsonb_array_elements(o.items) item
          WHERE o.id=${id} AND o.status='Em separação'
        ) order_item
        WHERE p.slug=order_item.slug AND p.stock >= order_item.quantity
        RETURNING p.slug,p.stock`,
      tx`UPDATE orders SET status='Concluído' WHERE id=${id} AND status='Em separação' RETURNING id,status`,
    ]);
    const completed = results[3];
    if (!completed.length)
      return Response.json(
        { error: "O pedido não está em separação ou já foi concluído." },
        { status: 409 },
      );
    revalidateTag("catalog-products", { expire: 0 });
    revalidatePath("/", "page");
    revalidatePath("/produtos", "page");
    revalidatePath("/produto/[slug]", "page");
    return Response.json(completed[0]);
  } catch (error) {
    const message = String(error);
    if (message.includes("division by zero"))
      return Response.json(
        { error: "Estoque insuficiente para concluir este pedido." },
        { status: 409 },
      );
    return Response.json(
      { error: "Não foi possível concluir o pedido." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const scope = body?.scope;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await verifyAdminPassword(password)))
    return Response.json(
      { error: "Senha administrativa inválida." },
      { status: 403 },
    );

  await ensureDb();
  const db = sql();

  if (scope === "all") {
    if (body?.confirmation !== "EXCLUIR TODOS")
      return Response.json(
        { error: "Confirmação para excluir todos os pedidos inválida." },
        { status: 400 },
      );

    const deleted = await db`DELETE FROM orders RETURNING id`;
    return Response.json({ ok: true, deletedCount: deleted.length });
  }

  if (scope === "single") {
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id)
      return Response.json(
        { error: "Pedido não informado." },
        { status: 400 },
      );

    const deleted = await db`DELETE FROM orders WHERE id=${id} RETURNING id`;
    if (!deleted.length)
      return Response.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    return Response.json({ ok: true, deletedCount: 1 });
  }

  return Response.json({ error: "Ação inválida." }, { status: 400 });
}
