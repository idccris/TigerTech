"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../lib/products";
import AdminNavbar from "./admin-navbar";
import { PrinterVisual } from "./catalog";
import { formatBRLInput, parseBRLToCents } from "../lib/money";
import PasswordInput from "./password-input";

const iconOptions = ["✦", "⚡", "✓", "★", "◆", "●", "◉", "♢", "↗", "∞", "☘", "⬢"];
const defaultBenefits = [
  { icon: "✦", title: "Qualidade na impressão", text: "Resultados consistentes e ótimo acabamento." },
  { icon: "⚡", title: "Uso simplificado", text: "Tecnologia intuitiva para produzir com facilidade." },
  { icon: "✓", title: "Suporte especializado", text: "Orientação para aproveitar melhor o equipamento." },
];

type InventoryProduct = Product & {
  stock: number;
  visible: boolean;
  sku: string;
  brand: string;
};

export default function AdminCatalog({
  products,
  role,
}: {
  products: InventoryProduct[];
  role: "admin" | "operator";
}) {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [editing, setEditing] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<InventoryProduct | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [error, setError] = useState("");
  const blank = { slug: "", sku: "", name: "", category: "Impressoras 3D", brand: "", description: "", longDescription: "", specificationsText: "", specs: "", benefits: defaultBenefits, tone: "orange", imageUrl: "", stock: 0, pixPrice: "0,00", cardPrice: "0,00", visible: true, featured: false };

  function pickImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) {
      setError("Selecione uma imagem PNG, JPG ou WebP de até 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditing((current: any) => ({ ...current, imageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  function updateBenefit(index: number, field: "icon" | "title" | "text", value: string) {
    const benefits = [...(editing.benefits?.length === 3 ? editing.benefits : defaultBenefits)];
    benefits[index] = { ...benefits[index], [field]: value };
    setEditing({ ...editing, benefits });
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const specs = typeof editing.specs === "string"
      ? editing.specs.split(",").map((item: string) => item.trim()).filter(Boolean)
      : editing.specs;
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...editing, specs, adminPassword }) });
    if (!response.ok) return setError((await response.json()).error || "Não foi possível publicar.");
    setEditing(null); setAdminPassword(""); router.refresh();
  }
  async function deleteProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!deleteTarget) return;
    const response = await fetch("/api/admin/products", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: deleteTarget.slug, adminPassword: deletePassword }) });
    if (!response.ok) setError((await response.json()).error || "Não foi possível excluir.");
    else { setDeleteTarget(null); setDeletePassword(""); router.refresh(); }
  }
  const brands = useMemo(
    () => [
      "Todas",
      ...Array.from(
        new Set(products.map((product) => product.brand || "Sem marca")),
      ).sort(),
    ],
    [products],
  );
  const visibleProducts =
    selectedBrand === "Todas"
      ? products
      : products.filter(
          (product) => (product.brand || "Sem marca") === selectedBrand,
        );
  const grouped = visibleProducts.reduce<Record<string, InventoryProduct[]>>(
    (groups, product) => {
      const brand = product.brand || "Sem marca";
      (groups[brand] ||= []).push(product);
      return groups;
    },
    {},
  );
  const totalStock = products.reduce(
    (total, product) => total + Math.max(0, product.stock || 0),
    0,
  );

  return (
    <main className="admin-catalog-page">
      <AdminNavbar />
      <header className="admin-catalog-hero">
        <div>
          <span>CONTROLE DE ESTOQUE</span>
          <h1>Catálogo</h1>
          <p>Visão completa das máquinas e produtos cadastrados na loja.</p>
        </div>
        <div className="inventory-summary">
          <article>
            <strong>{products.length}</strong>
            <small>modelos cadastrados</small>
          </article>
          <article>
            <strong>{totalStock}</strong>
            <small>unidades no sistema</small>
          </article>
          <article>
            <strong>{brands.length - 1}</strong>
            <small>marcas cadastradas</small>
          </article>
        </div>
        {role === "operator" ? <button className="operator-new-product" onClick={() => { setEditing(blank); setError(""); }}>+ Novo produto</button> : null}
      </header>
      <section className="brand-filter" aria-label="Filtrar por marca">
        {brands.map((brand) => (
          <button
            type="button"
            key={brand}
            className={selectedBrand === brand ? "active" : ""}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </section>
      <div className="inventory-groups">
        {Object.entries(grouped)
          .sort(([brandA], [brandB]) => brandA.localeCompare(brandB))
          .map(([brand, brandProducts]) => {
            const brandStock = brandProducts.reduce(
              (total, product) => total + Math.max(0, product.stock || 0),
              0,
            );
            return (
              <section className="inventory-group" key={brand}>
                <header>
                  <div>
                    <span>MARCA</span>
                    <h2>{brand}</h2>
                  </div>
                  <strong>{brandStock} unidades</strong>
                </header>
                <div className="inventory-grid">
                  {brandProducts.map((product) => (
                    <article className="inventory-card" key={product.slug}>
                      <div
                        className={`inventory-image ${product.tone}`}
                        style={
                          product.imageUrl
                            ? { backgroundImage: `url(${product.imageUrl})` }
                            : undefined
                        }
                      >
                        {!product.imageUrl ? (
                          <PrinterVisual tone={product.tone} />
                        ) : null}
                      </div>
                      <div className="inventory-card-copy">
                        <span>{product.category}</span>
                        <h3>{product.name}</h3>
                        <small>SKU: {product.sku || "Não informado"}</small>
                        <div className="inventory-stock">
                          <strong>{product.stock || 0}</strong>
                          <span>unidades</span>
                        </div>
                        <small
                          className={product.visible ? "visible" : "hidden"}
                        >
                          {product.visible
                            ? "Visível na loja"
                            : "Oculto na loja"}
                        </small>
                        {role === "operator" ? <div className="operator-product-actions"><button onClick={() => setEditing({ ...product, specs: product.specs?.join(", ") || "", benefits: product.benefits?.length === 3 ? product.benefits : defaultBenefits, pixPrice: formatBRLInput(product.priceCents || 0), cardPrice: formatBRLInput(product.cardPriceCents || product.priceCents || 0) })}>Editar</button><button onClick={() => { setDeleteTarget(product); setDeletePassword(""); setError(""); }}>Excluir</button></div> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
      {editing ? <div className="operator-editor"><form onSubmit={saveProduct}><div className="admin-form-head"><h2>{editing.slug ? "Editar produto" : "Novo produto"}</h2><button type="button" onClick={() => setEditing(null)}>×</button></div>
        <label>Nome<input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
        <label>Identificador (SKU)<input required value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} /><small>SKU único para diferenciar o produto.</small></label>
        <label>Categoria<input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></label>
        <label>Marca<input value={editing.brand || ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></label>
        <label>Descrição curta<textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
        <label>Descrição completa<textarea rows={5} value={editing.longDescription || ""} onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} /></label>
        <div className="benefits-editor">
          <div className="benefits-editor-title"><strong>Cards de benefícios</strong><small>Exatamente 3 cards · títulos até 28 caracteres · descrições até 80</small></div>
          {(editing.benefits?.length === 3 ? editing.benefits : defaultBenefits).map((benefit: any, index: number) => <section className="benefit-edit-card" key={index}>
            <span className="benefit-number">{index + 1}</span>
            <label>Ícone<div className="icon-picker">{iconOptions.map((icon) => <button type="button" key={icon} className={benefit.icon === icon ? "active" : ""} onClick={() => updateBenefit(index, "icon", icon)}>{icon}</button>)}</div></label>
            <label>Título <em>{benefit.title.length}/28</em><input maxLength={28} value={benefit.title} onChange={(e) => updateBenefit(index, "title", e.target.value)} /></label>
            <label>Descrição <em>{benefit.text.length}/80</em><textarea maxLength={80} rows={2} value={benefit.text} onChange={(e) => updateBenefit(index, "text", e.target.value)} /></label>
            <div className="benefit-mini-preview"><i>{benefit.icon}</i><span><b>{benefit.title || "Título do card"}</b><small>{benefit.text || "Breve descrição do benefício."}</small></span></div>
          </section>)}
        </div>
        <label>Especificações separadas por vírgula<input value={editing.specs || ""} onChange={(e) => setEditing({ ...editing, specs: e.target.value })} /></label>
        <label>Especificações completas<textarea rows={7} value={editing.specificationsText || ""} onChange={(e) => setEditing({ ...editing, specificationsText: e.target.value })} placeholder="Descreva dimensões, velocidade, materiais compatíveis, conectividade e demais dados técnicos." /><small>Campo opcional. Será exibido no botão Especificações da página do produto.</small></label>
        <label>Imagem do produto<span className={`image-upload ${editing.imageUrl ? "has-image" : ""}`} style={editing.imageUrl ? { backgroundImage: `url(${editing.imageUrl})` } : undefined}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pickImage(e.target.files?.[0])} />{!editing.imageUrl ? <><b>+</b><small>Adicionar imagem</small></> : <em>Trocar imagem</em>}</span><small>PNG, JPG ou WebP · máximo 3 MB</small></label>
        <label>Quantidade<input type="number" min="0" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label>
        <div className="design-row"><label>Preço no Pix (R$)<input type="text" inputMode="decimal" value={editing.pixPrice || "0,00"} onChange={(e) => setEditing({ ...editing, pixPrice: e.target.value })} onBlur={(e) => setEditing({ ...editing, pixPrice: formatBRLInput(parseBRLToCents(e.target.value)) })} /></label><label>Preço no cartão (R$)<input type="text" inputMode="decimal" value={editing.cardPrice || "0,00"} onChange={(e) => setEditing({ ...editing, cardPrice: e.target.value })} onBlur={(e) => setEditing({ ...editing, cardPrice: formatBRLInput(parseBRLToCents(e.target.value)) })} /></label></div>
        <label className="check"><input type="checkbox" checked={editing.visible !== false} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} /> Produto visível na loja</label>
        <label className="check feature-check"><input type="checkbox" checked={editing.featured === true} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /><span><strong>Destacar na página inicial</strong><small>Exibe este produto na seção de destaques.</small></span></label>
        <label>Senha do administrador<PasswordInput required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Obrigatória para confirmar" autoComplete="current-password" /></label>
        <button>Confirmar com senha administrativa</button>{error ? <small>{error}</small> : null}
      </form></div> : null}
      {deleteTarget ? <div className="user-modal"><form onSubmit={deleteProduct}><div><h2>Excluir produto?</h2><button type="button" onClick={() => { setDeleteTarget(null); setDeletePassword(""); }}>×</button></div><p className="recovery-user">Confirme a exclusão de <strong>{deleteTarget.name}</strong>.</p><label>Senha do administrador<PasswordInput required autoFocus autoComplete="current-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} /></label>{error ? <small className="recovery-note">{error}</small> : null}<button>Confirmar exclusão</button></form></div> : null}
      {!editing && error ? <p className="users-message">{error}</p> : null}
    </main>
  );
}
