"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../lib/products";
import AdminNavbar from "./admin-navbar";
import AdminCatalogExport from "./admin-catalog-export";
import ProductImageEditor from "./product-image-editor";
import FilamentFields from "./filament-fields";
import { PrinterVisual } from "./catalog";
import { formatBRLInput, parseBRLToCents } from "../lib/money";
import { groupProductsForAdmin, isFilament, productTitle } from "../lib/product-variants";
import FilamentVariantManager from "./filament-variant-manager";

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
  const [selectedFilter, setSelectedFilter] = useState("Todas");
  const [editing, setEditing] = useState<any>(null);
  const [activeFilamentGroup, setActiveFilamentGroup] = useState<Product | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const blank = { slug: "", sku: "", name: "", category: "Impressoras 3D", brand: "", description: "", longDescription: "", specificationsText: "", specs: [], benefits: [], tone: "orange", imageUrl: "", imageUrls: [], stock: 0, pixPrice: "0,00", cardPrice: "0,00", visible: true, featured: false };

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...editing, adminPassword }) });
    if (!response.ok) return setError((await response.json()).error || "Não foi possível publicar.");
    setEditing(null); setAdminPassword(""); router.refresh();
  }
  async function deleteProduct(product: InventoryProduct) {
    const password = prompt("Digite a senha do administrador para excluir este produto:");
    if (!password) return;
    const response = await fetch("/api/admin/products", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: product.slug, adminPassword: password }) });
    if (!response.ok) setError((await response.json()).error || "Não foi possível excluir.");
    else router.refresh();
  }
  const groupedProducts = useMemo(() => groupProductsForAdmin(products), [products]);
  const brands = useMemo(
    () =>
      Array.from(
        new Set(groupedProducts.map((product) => product.brand || "Sem marca")),
      ).sort(),
    [groupedProducts],
  );
  const filters = ["Todas", ...brands, "Filamento"];
  const visibleProducts =
    selectedFilter === "Todas"
      ? groupedProducts
      : selectedFilter === "Filamento"
        ? groupedProducts.filter(isFilament)
      : groupedProducts.filter(
          (product) => (product.brand || "Sem marca") === selectedFilter,
        );
  const grouped = visibleProducts.reduce<Record<string, Product[]>>(
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
            <strong>{groupedProducts.length}</strong>
            <small>modelos cadastrados</small>
          </article>
          <article>
            <strong>{totalStock}</strong>
            <small>unidades no sistema</small>
          </article>
          <article>
            <strong>{brands.length}</strong>
            <small>marcas cadastradas</small>
          </article>
        </div>
        {role === "operator" ? <button className="operator-new-product" onClick={() => { setEditing(blank); setError(""); }}>+ Novo produto</button> : null}
      </header>
      <AdminCatalogExport products={groupedProducts} />
      <section className="brand-filter" aria-label="Filtrar por marca ou categoria">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            className={selectedFilter === filter ? "active" : ""}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
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
                        <h3>{isFilament(product) ? `${product.brand} ${productTitle(product)}` : product.name}</h3>
                        <small>{product.variants ? `${product.variants.length} cores cadastradas` : `SKU: ${product.sku || "Não informado"}`}</small>
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
                        {role === "operator" ? <div className="operator-product-actions">{product.variants ? <button onClick={() => setActiveFilamentGroup(product)}>Gerenciar produto</button> : <><button onClick={() => setEditing({ ...product, pixPrice: formatBRLInput(product.priceCents || 0), cardPrice: formatBRLInput(product.cardPriceCents || product.priceCents || 0) })}>Editar</button><button onClick={() => deleteProduct(product as InventoryProduct)}>Excluir</button></>}</div> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
      {activeFilamentGroup ? <div className="operator-editor"><FilamentVariantManager
        group={activeFilamentGroup}
        onClose={() => setActiveFilamentGroup(null)}
        onEdit={(variant) => { setActiveFilamentGroup(null); setEditing({ ...variant, pixPrice: formatBRLInput(variant.priceCents || 0), cardPrice: formatBRLInput(variant.cardPriceCents || variant.priceCents || 0) }); }}
        onAdd={(group) => { const source = group.variants?.[0] || group; setActiveFilamentGroup(null); setEditing({ ...source, slug: "", sku: "", colorName: "", colorHex: "#777777", imageUrl: "", imageUrls: [], stock: 0, visible: true, featured: false, pixPrice: formatBRLInput(source.priceCents || 0), cardPrice: formatBRLInput(source.cardPriceCents || source.priceCents || 0) }); }}
        onDelete={(variant) => deleteProduct(variant as InventoryProduct)}
      /></div> : null}
      {editing ? <div className="operator-editor"><form onSubmit={saveProduct}><div className="admin-form-head"><h2>{isFilament(editing) ? (editing.slug ? "Editar cor" : "Adicionar cor") : (editing.slug ? "Editar produto" : "Novo produto")}</h2><button type="button" onClick={() => setEditing(null)}>×</button></div>
        <label>Categoria<select value={editing.category || "Impressoras 3D"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}><option>Impressoras 3D</option><option>Filamentos</option><option>Acessórios</option>{!["Impressoras 3D", "Filamentos", "Acessórios"].includes(editing.category) ? <option>{editing.category}</option> : null}</select></label>
        <FilamentFields value={editing} adminPassword={adminPassword} onChange={(fields) => setEditing({ ...editing, ...fields })} />
        <label>Nome<input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
        <label>Identificador (SKU)<input required value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} /><small>SKU único para diferenciar o produto.</small></label>
        <label>Marca<input value={editing.brand || ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></label>
        {!isFilament(editing) ? <label>Descrição<textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label> : <p className="filament-shared-note">Descrição, especificações e benefícios são editados por tipo na página Design.</p>}
        <ProductImageEditor compact images={editing.imageUrls?.length ? editing.imageUrls : [editing.imageUrl || ""]} onChange={(imageUrls) => setEditing({ ...editing, imageUrl: imageUrls[0] || "", imageUrls })} onError={setError} />
        <label>Quantidade<input type="number" min="0" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label>
        <div className="design-row"><label>Preço no Pix (R$)<input type="text" inputMode="decimal" value={editing.pixPrice || "0,00"} onChange={(e) => setEditing({ ...editing, pixPrice: e.target.value })} onBlur={(e) => setEditing({ ...editing, pixPrice: formatBRLInput(parseBRLToCents(e.target.value)) })} /></label><label>Preço no cartão (R$)<input type="text" inputMode="decimal" value={editing.cardPrice || "0,00"} onChange={(e) => setEditing({ ...editing, cardPrice: e.target.value })} onBlur={(e) => setEditing({ ...editing, cardPrice: formatBRLInput(parseBRLToCents(e.target.value)) })} /></label></div>
        <label className="check"><input type="checkbox" checked={editing.visible !== false} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} /> Produto visível na loja</label>
        <label>Senha do administrador<input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Obrigatória para confirmar" /></label>
        <button className="admin-form-submit" type="submit">Confirmar com senha administrativa</button>{error ? <small>{error}</small> : null}
      </form></div> : null}
      {!editing && error ? <p className="users-message">{error}</p> : null}
    </main>
  );
}
