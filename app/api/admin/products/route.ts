import { isTrustedMutation, requireUser, verifyAdminPassword } from "../../../../lib/admin-auth";
import { ensureDb, listProducts, sql } from "../../../../lib/db";
import { filamentGroupSlug, isFilament } from "../../../../lib/product-variants";
import { parseBRLToCents } from "../../../../lib/money";
import { storefrontProductImage } from "../../../../lib/product-images";
import { revalidatePath, revalidateTag } from "next/cache";
export async function GET() {
  if (!(await requireUser()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const products = await listProducts(true);
  return Response.json(products.map((product: any) => ({
    ...product,
    imageUrl: storefrontProductImage(product),
  })), { headers: { "Cache-Control": "private, max-age=15" } });
}
export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  const user = await requireUser();
  if (!user)
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  await ensureDb();
  const p = await req.json();
  const sku = String(p.sku || "").trim();
  if (!sku)
    return Response.json({ error: "Informe um SKU para identificar o produto." }, { status: 400 });
  const slugFromSku = `sku-${sku
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
  const slug = String(p.slug || "").trim() || slugFromSku;
  const duplicateSku = await sql()`SELECT slug FROM products WHERE LOWER(sku)=LOWER(${sku}) AND slug<>${slug} LIMIT 1`;
  if (duplicateSku[0])
    return Response.json({ error: "Já existe um produto cadastrado com este SKU." }, { status: 409 });
  const keepStoredImage = String(p.imageUrl || "").startsWith("/api/products/image");
  const submittedImage = keepStoredImage ? "" : String(p.imageUrl || "");
  if (user.role === "operator" && !(await verifyAdminPassword(String(p.adminPassword || ""))))
    return Response.json({ error: "Senha do administrador necessária para publicar." }, { status: 403 });
  if (p.imageUrl && p.imageUrl.length > 4_200_000)
    return Response.json(
      { error: "Imagem muito grande. Use até 3 MB." },
      { status: 413 },
    );
  if (submittedImage && !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(submittedImage))
    return Response.json({ error: "Formato de imagem inválido." }, { status: 400 });
  const name = String(p.name || "").trim().slice(0, 160);
  const category = String(p.category || "").trim().slice(0, 80);
  if (!name || !category)
    return Response.json({ error: "Informe nome e categoria." }, { status: 400 });
  const filament = isFilament({ category: category as "Filamentos" });
  const filamentModel = filament ? String(p.filamentModel || "").trim().replace(/\s+/g, " ").slice(0, 160) : "";
  const colorName = filament ? String(p.colorName || "").trim().slice(0, 60) : "";
  const colorHex = filament ? String(p.colorHex || "").trim() : "";
  const groupSlug = filament ? filamentGroupSlug(String(p.brand || "").trim(), filamentModel) : "";
  if (filament && (!filamentModel || !colorName || !/^#[0-9a-f]{6}$/i.test(colorHex)))
    return Response.json({ error: "Para cadastrar um filamento, selecione o tipo/modelo, informe o nome da cor e escolha a cor da bolinha." }, { status: 400 });
  const benefits = Array.from({ length: 3 }, (_, index) => ({
    icon: p.benefits?.[index]?.icon || "✦",
    title: String(p.benefits?.[index]?.title || "").slice(0, 28),
    text: String(p.benefits?.[index]?.text || "").slice(0, 80),
  }));
  const priceCents = parseBRLToCents(p.pixPrice ?? p.price);
  const cardPriceCents = parseBRLToCents(p.cardPrice ?? p.pixPrice ?? p.price);
  await sql()`INSERT INTO products(slug,group_slug,sku,name,filament_model,color_name,color_hex,category,tag,brand,description,long_description,specifications_text,specs,benefits,tone,image_url,stock,price_cents,card_price_cents,visible,featured,featured_at,updated_at) VALUES(${slug},${groupSlug},${sku},${name},${filamentModel},${colorName},${colorHex},${category},${String(p.brand || "").slice(0, 80)},${String(p.brand || "").slice(0, 80)},${String(p.description || "").slice(0, 500)},${String(p.longDescription || "").slice(0, 10000)},${String(p.specificationsText || "").slice(0, 10000)},${JSON.stringify(Array.isArray(p.specs) ? p.specs.slice(0, 100) : [])},${JSON.stringify(benefits)},${p.tone || "orange"},${submittedImage},${Math.max(0, Math.min(1_000_000, Math.floor(Number(p.stock) || 0)))},${priceCents},${cardPriceCents},${p.visible !== false},${p.featured === true},CASE WHEN ${p.featured === true} THEN NOW() ELSE NULL END,NOW()) ON CONFLICT(slug) DO UPDATE SET group_slug=EXCLUDED.group_slug,sku=EXCLUDED.sku,name=EXCLUDED.name,filament_model=EXCLUDED.filament_model,color_name=EXCLUDED.color_name,color_hex=EXCLUDED.color_hex,category=EXCLUDED.category,tag=EXCLUDED.tag,brand=EXCLUDED.brand,description=EXCLUDED.description,long_description=EXCLUDED.long_description,specifications_text=EXCLUDED.specifications_text,specs=EXCLUDED.specs,benefits=EXCLUDED.benefits,tone=EXCLUDED.tone,image_url=CASE WHEN ${keepStoredImage} THEN products.image_url ELSE EXCLUDED.image_url END,stock=EXCLUDED.stock,price_cents=EXCLUDED.price_cents,card_price_cents=EXCLUDED.card_price_cents,visible=EXCLUDED.visible,featured=EXCLUDED.featured,featured_at=CASE WHEN EXCLUDED.featured=true AND products.featured=false THEN NOW() WHEN EXCLUDED.featured=false THEN NULL ELSE products.featured_at END,updated_at=NOW()`;
  if (p.featured === true)
    await sql()`UPDATE products SET featured=false,featured_at=NULL WHERE slug IN (SELECT slug FROM products WHERE featured=true ORDER BY featured_at DESC NULLS LAST OFFSET 6)`;
  revalidateTag("catalog-products", { expire: 0 });
  revalidatePath("/", "page");
  revalidatePath("/produtos", "page");
  revalidatePath("/produto/[slug]", "page");
  return Response.json({ ok: true });
}
export async function PATCH(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  const user = await requireUser();
  if (!user)
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { groupSlug, featured, adminPassword } = await req.json();
  if (user.role === "operator" && !(await verifyAdminPassword(String(adminPassword || ""))))
    return Response.json({ error: "Senha do administrador necessária para alterar os destaques." }, { status: 403 });
  const slug = String(groupSlug || "").trim();
  if (!slug)
    return Response.json({ error: "Filamento não identificado." }, { status: 400 });
  await ensureDb();
  await sql()`UPDATE products SET featured=false, featured_at=NULL WHERE group_slug=${slug}`;
  if (featured === true) {
    const representative = await sql()`SELECT slug FROM products WHERE group_slug=${slug} AND visible=true ORDER BY stock DESC, updated_at DESC LIMIT 1`;
    if (!representative[0])
      return Response.json({ error: "Nenhuma cor visível foi encontrada para este filamento." }, { status: 400 });
    await sql()`UPDATE products SET featured=true, featured_at=NOW(), updated_at=NOW() WHERE slug=${representative[0].slug}`;
    await sql()`UPDATE products SET featured=false, featured_at=NULL WHERE slug IN (SELECT slug FROM products WHERE featured=true ORDER BY featured_at DESC NULLS LAST OFFSET 6)`;
  }
  revalidateTag("catalog-products", { expire: 0 });
  revalidatePath("/", "page");
  revalidatePath("/produtos", "page");
  revalidatePath("/produto/[slug]", "page");
  return Response.json({ ok: true });
}
export async function DELETE(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  const user = await requireUser();
  if (!user)
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { slug, adminPassword } = await req.json();
  if (user.role === "operator" && !(await verifyAdminPassword(String(adminPassword || ""))))
    return Response.json({ error: "Senha do administrador necessária para excluir." }, { status: 403 });
  await sql()`DELETE FROM products WHERE slug=${slug}`;
  revalidateTag("catalog-products", { expire: 0 });
  revalidatePath("/", "page");
  revalidatePath("/produtos", "page");
  revalidatePath("/produto/[slug]", "page");
  return Response.json({ ok: true });
}
