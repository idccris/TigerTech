"use client";
import { useEffect, useState } from "react";
import { PrinterVisual } from "./catalog";
import AdminNavbar from "./admin-navbar";
import BrandLogo from "./brand-logo";
import { formatBRLInput, parseBRLToCents } from "../lib/money";
import PasswordInput from "./password-input";
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
export default function AdminPanel() {
  const [logged, setLogged] = useState(false),
    [error, setError] = useState(""),
    [items, setItems] = useState<any[]>([]),
    [edit, setEdit] = useState<any>(blank),
    [editorOpen, setEditorOpen] = useState(false),
    [categories, setCategories] = useState<string[]>([
      "Impressoras 3D",
      "Filamentos",
      "Acessórios",
    ]),
    [newCategory, setNewCategory] = useState("");
  async function load() {
    const r = await fetch("/api/admin/products");
    if (r.ok) {
      setLogged(true);
      setItems(await r.json());
      fetch("/api/admin/categories")
        .then((x) => (x.ok ? x.json() : []))
        .then((x) => x.length && setCategories(x));
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
    }
  }
  if (!logged)
    return (
      <main className="admin-login">
        <form onSubmit={login} autoComplete="off">
          <BrandLogo size={62} priority />
          <h1>Área do administrador</h1>
          <p>Entre para gerenciar os produtos da loja.</p>
          <input name="username" placeholder="Usuário" autoComplete="off" required />
          <PasswordInput name="password" placeholder="Senha" autoComplete="current-password" required />
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
          <h1>Produtos</h1>
        </div>
        <div className="admin-header-actions">
          <button
            onClick={() => {
              setEdit(blank);
              setError("");
              setEditorOpen(true);
            }}
          >
            + Novo produto
          </button>
        </div>
      </header>
      <section
        className={`admin-layout ${editorOpen ? "editor-open" : ""}`}
      >
        <div className="admin-list">
          {items.map((p) => (
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
                  {p.category} · Estoque {p.stock}
                </span>
                <strong>{p.name}</strong>
                <small>{p.visible ? "Visível na loja" : "Oculto"}</small>
              </div>
              <button
                onClick={() => {
                  setEdit({
                    ...p,
                    specs: p.specs.join(", "),
                    pixPrice: formatBRLInput(p.priceCents || 0),
                    cardPrice: formatBRLInput(p.cardPriceCents || p.priceCents || 0),
                  });
                  setError("");
                  setEditorOpen(true);
                }}
              >
                Editar
              </button>
              <button onClick={() => del(p.slug)}>Excluir</button>
            </article>
          ))}
        </div>
        {editorOpen ? (
          <form className="admin-form" onSubmit={save}>
            <div className="admin-form-head">
              <h2>{edit.slug ? "Editar produto" : "Novo produto"}</h2>
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
            <label>
              Marca
              <input
                value={edit.brand || ""}
                onChange={(e) => setEdit({ ...edit, brand: e.target.value })}
                placeholder="Ex.: Bambu Lab"
              />
            </label>
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
            <label>
              Imagem do produto
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
            <button type="submit">Confirmar e publicar</button>
            {error && <small>{error}</small>}
          </form>
        ) : null}
      </section>
    </main>
  );
}
