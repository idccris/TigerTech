import { randomUUID } from "crypto";
import { ensureDb, sql } from "../../../lib/db";
import { consumeRateLimit, isTrustedMutation, requestFingerprint } from "../../../lib/admin-auth";

type RequestedItem = { slug?: string; quantity?: number };

export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req))
      return Response.json({ error: "Origem não autorizada" }, { status: 403 });
    if (!(await consumeRateLimit(requestFingerprint(req, "orders"), 10, 60)))
      return Response.json({ error: "Limite de pedidos atingido. Tente novamente mais tarde." }, { status: 429, headers: { "Retry-After": "3600" } });
    const body = await req.json();
    const name = String(body.customer?.name || "")
      .trim()
      .slice(0, 120);
    const email = String(body.customer?.email || "")
      .trim()
      .slice(0, 160);
    const phone = String(body.customer?.phone || "")
      .trim()
      .slice(0, 40);
    const document = String(body.customer?.document || "")
      .trim()
      .slice(0, 40);
    const address = String(body.customer?.address || "")
      .trim()
      .slice(0, 300);
    const rawRequested = Array.isArray(body.items) ? (body.items as RequestedItem[]).slice(0, 50) : [];
    const quantities = new Map<string, number>();
    for (const item of rawRequested) {
      const slug = String(item.slug || "").trim();
      const rawQuantity = Number(item.quantity);
      if (!slug || !Number.isInteger(rawQuantity) || rawQuantity < 1 || rawQuantity > 99)
        return Response.json({ error: "Item ou quantidade inválida." }, { status: 400 });
      quantities.set(slug, (quantities.get(slug) || 0) + rawQuantity);
    }
    const requested = [...quantities].map(([slug, quantity]) => ({ slug, quantity }));
    const paymentMethod = body.paymentMethod === "card" ? "card" : body.paymentMethod === "pix" ? "pix" : "";

    if (!name || !email || !phone)
      return Response.json(
        { error: "Preencha nome, e-mail e telefone." },
        { status: 400 },
      );
    if (!/^\S+@\S+\.\S+$/.test(email))
      return Response.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
    if (!requested.length)
      return Response.json(
        { error: "O carrinho está vazio." },
        { status: 400 },
      );
    if (!paymentMethod)
      return Response.json(
        { error: "Selecione uma forma de pagamento." },
        { status: 400 },
      );

    await ensureDb();
    const items = [];
    let totalCents = 0;
    for (const requestedItem of requested) {
      const slug = String(requestedItem.slug || "");
      const quantity = Number(requestedItem.quantity);
      if (quantity > 99)
        return Response.json({ error: "A quantidade máxima por produto é 99." }, { status: 400 });
      const rows =
        await sql()`SELECT slug,name,sku,category,filament_model,color_name,price_cents,card_price_cents,stock,visible FROM products WHERE slug=${slug} LIMIT 1`;
      const product = rows[0];
      if (!product || !product.visible)
        return Response.json(
          { error: "Um produto do carrinho não está mais disponível." },
          { status: 409 },
        );
      if (Number(product.stock) < quantity)
        return Response.json(
          { error: `${product.name} não possui estoque suficiente.` },
          { status: 409 },
        );
      const unitPriceCents = paymentMethod === "pix"
        ? Number(product.price_cents) || 0
        : Number(product.card_price_cents) || Number(product.price_cents) || 0;
      if (unitPriceCents <= 0)
        return Response.json(
          { error: `${product.name} ainda não possui preço cadastrado.` },
          { status: 409 },
        );
      const subtotalCents = unitPriceCents * quantity;
      totalCents += subtotalCents;
      items.push({
        slug: product.slug,
        sku: product.sku,
        name: product.color_name && product.category.toLowerCase() === "filamentos" ? `${product.filament_model || product.name} — ${product.color_name}` : product.name,
        quantity,
        unitPriceCents,
        subtotalCents,
      });
    }

    const id = `PED-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    await sql()`INSERT INTO orders(id,customer_name,customer_email,customer_phone,customer_document,customer_address,items,total_cents,payment_method,status) VALUES(${id},${name},${email},${phone},${document},${address},${JSON.stringify(items)},${totalCents},${paymentMethod},'Recebido')`;
    return Response.json({ ok: true, orderId: id, totalCents });
  } catch (error) {
    console.error("Order creation failed", error);
    return Response.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }
}
