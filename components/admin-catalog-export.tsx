"use client";

import { useMemo, useRef, useState } from "react";
import type { Product } from "../lib/products";
import styles from "./admin-catalog-export.module.css";

export default function AdminCatalogExport({ products }: { products: Product[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const brands = useMemo(() => [...new Set(products.map(p => p.brand || "Sem marca"))].sort(), [products]);
  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);
  const filtered = products.filter(p => (!brand || (p.brand || "Sem marca") === brand)
    && (!category || p.category === category)
    && `${p.name} ${p.filamentModel || ""} ${p.brand || ""}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR").trim()));
  const singleMachine = selected.size === 1 && products.some(p => selected.has(p.slug) && p.category === "Impressoras 3D");

  function toggle(slug: string) {
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }

  async function download() {
    if (busy || !selected.size) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/catalogo-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: [...selected] }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Não foi possível gerar o catálogo. Tente novamente.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `tiger-tech-catalogo-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Erro ao baixar o PDF.");
    } finally { setBusy(false); }
  }

  return <div className={styles.entry}>
    <button type="button" className={styles.launch} onClick={() => { setError(""); dialog.current?.showModal(); }}>Gerar catálogo PDF</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="catalog-export-title"
      onCancel={event => { if (busy) event.preventDefault(); }}>
      <div className={styles.layout}>
        <header className={styles.header}>
          <div><span className={styles.eyebrow}>MATERIAL PARA SEUS CLIENTES</span><h2 id="catalog-export-title">Monte seu catálogo</h2></div>
          <button type="button" disabled={busy} className={styles.close} aria-label="Fechar catálogo" onClick={() => dialog.current?.close()}>×</button>
        </header>
        <div className={styles.content}>
          <p className={styles.intro}>Escolha os produtos que deseja apresentar. O PDF não contém preços, estoque, códigos internos ou controles administrativos.</p>
          <fieldset disabled={busy} className={styles.fieldset}>
            <legend className={styles.legend}>Filtrar produtos</legend>
            <div className={styles.filters}>
              <label>Buscar produto<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome do produto" /></label>
              <label>Marca<select value={brand} onChange={e => setBrand(e.target.value)}><option value="">Todas as marcas</option>{brands.map(value => <option key={value}>{value}</option>)}</select></label>
              <label>Categoria<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas as categorias</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
            </div>
            <div className={styles.actions}>
              <button type="button" disabled={!filtered.length} onClick={() => setSelected(previous => new Set([...previous, ...filtered.map(p => p.slug)]))}>Selecionar resultados ({filtered.length})</button>
              <button type="button" onClick={() => setSelected(new Set(products.map(p => p.slug)))}>Todos os produtos</button>
              <button type="button" disabled={!selected.size} onClick={() => setSelected(new Set())}>Limpar seleção</button>
            </div>
            <p className={styles.note}>A seleção é mantida ao trocar os filtros. Inclui produtos cadastrados mesmo sem estoque; confirme a disponibilidade antes de enviar ao cliente.</p>
            <div className={styles.list}>
              {filtered.length ? filtered.map(product => <label key={product.slug} className={styles.item}>
                <input type="checkbox" checked={selected.has(product.slug)} onChange={() => toggle(product.slug)} />
                <span><strong>{product.filamentModel || product.name}</strong><small>{product.brand || "Sem marca"} · {product.category}</small></span>
              </label>) : <p>Nenhum produto encontrado para estes filtros.</p>}
            </div>
          </fieldset>
        </div>
        <footer className={styles.footer}>
          <div aria-live="polite"><strong>{selected.size} produto(s) selecionado(s)</strong><p>{singleMachine ? "Ficha da máquina com foto, descrição e especificações completas cadastradas." : "Catálogo com fotos principais e descrições dos produtos selecionados."}</p></div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="button" className={styles.download} disabled={busy || !selected.size} onClick={download}>{busy ? "Gerando PDF…" : singleMachine ? "Baixar ficha da máquina" : "Baixar catálogo PDF"}</button>
        </footer>
      </div>
    </dialog>
  </div>;
}
