"use client";
import { useEffect, useMemo, useState } from "react";
import { PrinterVisual } from "./catalog";
import AdminNavbar from "./admin-navbar";
import FilamentFields from "./filament-fields";
import { groupProductsForAdmin, isFilament, productTitle } from "../lib/product-variants";
import type { Product } from "../lib/products";
import FilamentVariantManager from "./filament-variant-manager";
import BrandLogo from "./brand-logo";
import { formatBRLInput, parseBRLToCents } from "../lib/money";
const formatBRLInputFromText = (value: string) => formatBRLInput(parseBRLToCents(value));
const iconOptions = [
  "✦",
  "⚡",
  "✓",
  "★",
  "◆",
  "●",
  "◉",
  "♢",
  "↗",
  "∞",
  "☘",
  "⬢",
];
const defaultBenefits = [
  {
    icon: "✦",
    title: "Qualidade na impressão",
    text: "Resultados consistentes e ótimo acabamento.",
  },
  {
    icon: "⚡",
    title: "Uso simplificado",
    text: "Tecnologia intuitiva para produzir com facilidade.",
  },
  {
    icon: "✓",
    title: "Suporte especializado",
    text: "Orientação para aproveitar melhor o equipamento.",
  },
];
const blank = {
  slug: "",
  sku: "",
  name: "",
  category: "Impressoras 3D",
  brand: "",
  description: "",
  longDescription: "",
  specificationsText: "",
  specs: [],
  tone: "orange",
  imageUrl: "",
  stock: 0,
  pixPrice: "0,00",
  cardPrice: "0,00",
  visible: true,
  featured: false,
  benefits: defaultBenefits,
};
const productFilters = [
  { value: "Impressoras 3D", label: "Impressoras 3D" },
  { value: "Filamentos", label: "Filamentos" },
  { value: "Acessórios", label: "Acessórios" },
] as const;

type ProductFilter = (typeof productFilters)[number]["value"];

const normalizeCategory = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function matchesProductFilter(category: string, filter: ProductFilter) {
  const normalized = normalizeCategory(category);
  if (filter === "Impressoras 3D")
    return normalized === "impressora 3d" || normalized === "impressoras 3d";
  if (filter === "Filamentos")
    return normalized === "filamento" || normalized === "filamentos";
  return normalized === "acessorio" || normalized === "acessorios";
}

export default function AdminPanel({ initialLogged = false }: { initialLogged?: boolean }) {
  const [logged, setLogged] = useState(initialLogged),
    [error, setError] = useState(""),
    [items, setItems] = useState<any[]>([]),
    [productFilter, setProductFilter] = useState<ProductFilter | null>(null),
    [edit, setEdit] = useState<any>(blank),
    [editorOpen, setEditorOpen] = useState(false),
    [activeFilamentGroup, setActiveFilamentGroup] = useState<Product | null>(null),
    [categories, setCategories] = useState<string[]>([
      "Impressoras 3D",
      "Filamentos",
      "Acessórios",
    ]),
    [newCategory, setNewCategory] = useState("");
  const groupedItems = useMemo(() => groupProductsForAdmin(items), [items]);
  const filteredItems = productFilter
    ? groupedItems.filter((product) => matchesProductFilter(String(product.category || ""), productFilter))
    : [];
  const categoryCount = (filter: ProductFilter) =>
    groupedItems.filter((product) => matchesProductFilter(String(product.category || ""), filter)).length;
  async function load() {
    try {
      const r = await fetch("/api/admin/products");
      if (r.ok) {
        setLogged(true);
        setItems(await r.json());
        fetch("/api/admin/categories")
          .then((x) => (x.ok ? x.json() : []))
          .then((x) => x.length && setCategories(x));
      } else if (r.status === 401 || r.status === 403) {
        setLogged(false);
      } else {
        setError("Não foi possível atualizar os produtos. Tente novamente.");
      }
    } catch {
      setError("Não foi possível atualizar os produtos. Tente novamente.");
    }
  }
  async function addCategory() {
    if (!newCategory.trim()) return;
    const r = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    if (r.ok) {
      setCategories([...new Set([...categories, newCategory.trim()])].sort());
      setEdit({ ...edit, category: newCategory.trim() });
      setNewCategory("");
    }
  }
  function pickImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEdit({ ...edit, imageUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }
  function updateBenefit(
    index: number,
    field: "icon" | "title" | "text",
    value: string,
  ) {
    const benefits = [
      ...(edit.benefits?.length === 3 ? edit.benefits : defaultBenefits),
    ];
    benefits[index] = { ...benefits[index], [field]: value };
    setEdit({ ...edit, benefits });
  }
  useEffect(() => {
    load();
  }, []);
  async function login(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: f.get("username"),
        password: f.get("password"),
      }),
    });
    const j = await r.json();
    if (!r.ok) setError(j.error);
    else if (j.role === "operator") window.location.assign("/admin/catalogo");
    else load();
  }
  async function save(e: any) {
    e.preventDefault();
    setError("");
    const payload = {
      ...edit,
      specs:
        typeof edit.specs === "string"
          ? edit.specs
              .split(",")
              .map((x: string) => x.trim())
              .filter(Boolean)
          : edit.specs,
    };
    const r = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.ok) {
      setEdit(blank);
      setEditorOpen(false);
      setActiveFilamentGroup(null);
      setError("");
      load();
      localStorage.setItem("catalog-updated", String(Date.now()));
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("catalog-updates");
        channel.postMessage("refresh");
        channel.close();
      }
    } else setError((await r.json()).error);
  }
  async function del(slug: string) {
    if (confirm("Excluir este produto?")) {
      await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      load();
      setActiveFilamentGroup(null);
    }
  }

  function editProduct(product: Product) {
    setEdit({
      ...product,
      specs: product.specs.join(", "),
      pixPrice: formatBRLInput(product.priceCents || 0),
      cardPrice: formatBRLInput(product.cardPriceCents || product.priceCents || 0),
    });
    setError("");
    setActiveFilamentGroup(null);
    setEditorOpen(true);
  }

  function addFilamentColor(group: Product) {
    const source = group.variants?.[0] || group;
    setEdit({
      ...source,
      slug: "",
      sku: "",
      colorName: "",
      colorHex: "#777777",
      imageUrl: "",
      stock: 0,
      visible: true,
      featured: false,
      pixPrice: formatBRLInput(source.priceCents || 0),
      cardPrice: formatBRLInput(source.cardPriceCents || source.priceCents || 0),
    });
    setActiveFilamentGroup(null);
    setEditorOpen(true);
  }
  if (!logged)
    return (
      <main className="admin-login">
        <form onSubmit={login} autoComplete="off">
          <BrandLogo size={62} priority />
          <h1>Área do administrador</h1>
          <p>Entre para gerenciar os produtos da loja.</p>
          <input name="username" placeholder="Usuário" autoComplete="off" required />
          <input name="password" type="password" placeholder="Senha" autoComplete="new-password" required />
          <button>Entrar</button>
          {error && <small>{error}</small>}
        </form>
      </main>
    );
  return (
    <main className="admin-page">
      <AdminNavbar />
      <header>
        <div>
          <span>PAINEL ADMINISTRATIVO</span>
          <h1>{productFilter || "Produtos"}</h1>
        </div>
        {productFilter ? <div className="admin-header-actions">
          <button className="secondary" type="button" onClick={() => { setProductFilter(null); setEditorOpen(false); setActiveFilamentGroup(null); }}>
            ← Categorias
          </button>
          <button
            onClick={() => {
              setEdit({ ...blank, category: productFilter });
              setError("");
              setActiveFilamentGroup(null);
              setEditorOpen(true);
            }}
          >
            + {productFilter === "Filamentos" ? "Novo filamento" : "Novo produto"}
          </button>
        </div> : null}
      </header>
      {!productFilter ? (
        <section className="admin-category-home" aria-label="Escolha uma categoria de produtos">
          <div>
            <span>ESCOLHA O QUE DESEJA GERENCIAR</span>
            <h2>Selecione uma categoria</h2>
            <p>Os produtos ficam organizados por tipo para facilitar o cadastro e o controle de estoque.</p>
          </div>
          <div className="admin-category-grid">
            {productFilters.map((filter) => {
              const count = categoryCount(filter.value);
              const variantCount = filter.value === "Filamentos"
                ? items.filter((product) => matchesProductFilter(String(product.category || ""), filter.value)).length
                : count;
              return (
                <button type="button" key={filter.value} onClick={() => setProductFilter(filter.value)}>
                  <span>{filter.value === "Impressoras 3D" ? "3D" : filter.value === "Filamentos" ? "◉" : "+"}</span>
                  <strong>{filter.label}</strong>
                  <small>{count} {count === 1 ? "modelo" : "modelos"}{filter.value === "Filamentos" ? ` · ${variantCount} cores` : ""}</small>
                  <b>Gerenciar <i>→</i></b>
                </button>
              );
            })}
          </div>
        </section>
      ) : <>
      <nav className="admin-product-filters" aria-label="Trocar categoria de produtos">
        {productFilters.map((filter) => {
          const count = categoryCount(filter.value);
          return (
            <button
              type="button"
              key={filter.value}
              className={productFilter === filter.value ? "active" : ""}
              aria-pressed={productFilter === filter.value}
              onClick={() => setProductFilter(filter.value)}
            >
              {filter.label} <span>{count}</span>
            </button>
          );
        })}
      </nav>
      <section
        className={`admin-layout ${editorOpen || activeFilamentGroup ? "editor-open" : ""}`}
      >
        <div className="admin-list">
          {filteredItems.map((p) => (
            <article key={p.slug}>
              <div
                className={`admin-product-image ${p.tone}`}
                style={
                  p.imageUrl
                    ? { backgroundImage: `url(${p.imageUrl})` }
                    : undefined
                }
                aria-label={`Imagem de ${p.name}`}
              >
                {!p.imageUrl && <PrinterVisual tone={p.tone} />}
              </div>
              <div>
                <span>
                  {p.category} · Estoque {p.stock}{p.variants ? ` · ${p.variants.length} cores` : ""}
                </span>
                <strong>{isFilament(p) ? `${p.brand} ${productTitle(p)}` : p.name}</strong>
                <small>{p.visible ? "Visível na loja" : "Oculto"}</small>
              </div>
              <button
                onClick={() => {
                  if (isFilament(p) && p.variants) {
                    setEditorOpen(false);
                    setActiveFilamentGroup(p);
                  } else editProduct(p);
                }}
              >
                {p.variants ? "Gerenciar cores" : "Editar"}
              </button>
              {!p.variants ? <button onClick={() => del(p.slug)}>Excluir</button> : null}
            </article>
          ))}
          {filteredItems.length === 0 ? (
            <div className="admin-products-empty">
              <strong>Nenhum produto nesta categoria.</strong>
              <span>Escolha outro filtro ou cadastre um novo produto.</span>
            </div>
          ) : null}
        </div>
        {activeFilamentGroup ? (
          <FilamentVariantManager
            group={activeFilamentGroup}
            onClose={() => setActiveFilamentGroup(null)}
            onEdit={editProduct}
            onAdd={addFilamentColor}
            onDelete={(variant) => del(variant.slug)}
          />
        ) : editorOpen ? (
          <form className="admin-form" onSubmit={save}>
            <div className="admin-form-head">
              <h2>{isFilament(edit) ? (edit.slug ? "Editar cor" : "Adicionar cor") : (edit.slug ? "Editar produto" : "Novo produto")}</h2>
              <button
                type="button"
                aria-label="Fechar editor"
                onClick={() => {
                  setEditorOpen(false);
                  setEdit(blank);
                  setError("");
                }}
              >
                ×
              </button>
            </div>
            <label>
              Categoria
              <select
                value={edit.category}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <span className="add-category">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nova categoria"
                />
                <button type="button" onClick={addCategory}>
                  + Adicionar
                </button>
              </span>
            </label>
            <FilamentFields value={edit} onChange={(fields) => setEdit({ ...edit, ...fields })} />
            <label>
              Nome
              <input
                value={edit.name}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    name: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Identificador (SKU)
              <input
                value={edit.sku || ""}
                onChange={(e) => setEdit({ ...edit, sku: e.target.value })}
                required
              />
              <small className="field-note">SKU único: é ele que diferencia cada produto no sistema.</small>
            </label>
            <label>
              Marca
              <input
                value={edit.brand || ""}
                onChange={(e) => setEdit({ ...edit, brand: e.target.value })}
                placeholder="Ex.: Bambu Lab"
              />
            </label>
            {!isFilament(edit) ? <>
            <label>
              Descrição curta
              <textarea
                value={edit.description}
                onChange={(e) =>
                  setEdit({ ...edit, description: e.target.value })
                }
              />
            </label>
            <label>
              Descrição completa
              <textarea
                rows={5}
                value={edit.longDescription}
                onChange={(e) =>
                  setEdit({ ...edit, longDescription: e.target.value })
                }
              />
            </label>
            <div className="benefits-editor">
              <div className="benefits-editor-title">
                <strong>Cards de benefícios</strong>
                <small>
                  Exatamente 3 cards · títulos até 28 caracteres · descrições
                  até 80
                </small>
              </div>
              {(edit.benefits?.length === 3
                ? edit.benefits
                : defaultBenefits
              ).map((benefit: any, index: number) => (
                <section className="benefit-edit-card" key={index}>
                  <span className="benefit-number">{index + 1}</span>
                  <label>
                    Ícone
                    <div className="icon-picker">
                      {iconOptions.map((icon) => (
                        <button
                          type="button"
                          key={icon}
                          className={benefit.icon === icon ? "active" : ""}
                          onClick={() => updateBenefit(index, "icon", icon)}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </label>
                  <label>
                    Título <em>{benefit.title.length}/28</em>
                    <input
                      maxLength={28}
                      value={benefit.title}
                      onChange={(e) =>
                        updateBenefit(index, "title", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Descrição <em>{benefit.text.length}/80</em>
                    <textarea
                      maxLength={80}
                      rows={2}
                      value={benefit.text}
                      onChange={(e) =>
                        updateBenefit(index, "text", e.target.value)
                      }
                    />
                  </label>
                  <div className="benefit-mini-preview">
                    <i>{benefit.icon}</i>
                    <span>
                      <b>{benefit.title || "Título do card"}</b>
                      <small>
                        {benefit.text || "Breve descrição do benefício."}
                      </small>
                    </span>
                  </div>
                </section>
              ))}
            </div>
            <label>
              Especificações separadas por vírgula
              <input
                value={edit.specs}
                onChange={(e) => setEdit({ ...edit, specs: e.target.value })}
              />
            </label>
            <label>
              Especificações completas
              <textarea
                rows={7}
                value={edit.specificationsText || ""}
                onChange={(e) =>
                  setEdit({ ...edit, specificationsText: e.target.value })
                }
                placeholder="Descreva dimensões, velocidade, materiais compatíveis, conectividade e demais dados técnicos."
              />
              <small className="field-note">
                Campo opcional. O texto será exibido no botão Especificações da
                página do produto.
              </small>
            </label>
            </> : <p className="filament-shared-note">As descrições, especificações e os benefícios deste filamento são compartilhados por tipo. Edite esse conteúdo na página Design.</p>}
            <label>
              {isFilament(edit) ? "Foto correspondente à cor" : "Imagem do produto"}
              <span
                className={`image-upload ${edit.imageUrl ? "has-image" : ""}`}
                style={
                  edit.imageUrl
                    ? { backgroundImage: `url(${edit.imageUrl})` }
                    : undefined
                }
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => pickImage(e.target.files?.[0])}
                />
                {!edit.imageUrl && (
                  <>
                    <b>+</b>
                    <small>Adicionar imagem</small>
                  </>
                )}
                {edit.imageUrl && <em>Trocar imagem</em>}
              </span>
              <small className="upload-note">
                PNG, JPG ou WebP · máximo 3 MB
              </small>
            </label>
            <label>
              Quantidade
              <input
                type="number"
                min="0"
                value={edit.stock}
                onChange={(e) =>
                  setEdit({ ...edit, stock: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Preço no Pix (R$)
              <input
                type="text"
                inputMode="decimal"
                value={edit.pixPrice ?? "0,00"}
                onChange={(e) =>
                  setEdit({ ...edit, pixPrice: e.target.value })
                }
                onBlur={(e) => setEdit({ ...edit, pixPrice: formatBRLInputFromText(e.target.value) })}
                placeholder="Ex.: 3.743,10"
              />
              <small className="field-note">Valor com desconto para pagamento via Pix.</small>
            </label>
            <label>
              Preço no cartão (R$)
              <input
                type="text"
                inputMode="decimal"
                value={edit.cardPrice ?? "0,00"}
                onChange={(e) => setEdit({ ...edit, cardPrice: e.target.value })}
                onBlur={(e) => setEdit({ ...edit, cardPrice: formatBRLInputFromText(e.target.value) })}
                placeholder="Ex.: 3.999,90"
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={edit.visible}
                onChange={(e) =>
                  setEdit({ ...edit, visible: e.target.checked })
                }
              />{" "}
              Produto visível na loja
            </label>
            <label className="check feature-check">
              <input
                type="checkbox"
                checked={edit.featured === true}
                onChange={(e) =>
                  setEdit({ ...edit, featured: e.target.checked })
                }
              />
              <span>
                <strong>Destacar na página inicial</strong>
                <small>Exibe este produto na seção de destaques.</small>
              </span>
            </label>
            <button type="submit">{isFilament(edit) ? "Salvar cor do filamento" : "Confirmar e publicar"}</button>
            {error && <small>{error}</small>}
          </form>
        ) : null}
      </section>
      </>}
    </main>
  );
}
