"use client";

import { useMemo, useState } from "react";
import type { FilamentCatalogOption } from "../lib/filament-catalogs";
import styles from "./admin-catalog-export.module.css";

export default function AdminFilamentCatalogExport({ options }: { options: FilamentCatalogOption[] }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(() => {
    const query = search.toLocaleLowerCase("pt-BR").trim();
    return options.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(query));
  }, [options, search]);

  function toggle(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function download(ids: string[]) {
    if (busy || !ids.length) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/catalogo-filamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Não foi possível gerar os catálogos de filamentos.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = ids.length === 1
        ? options.find((item) => item.id === ids[0])?.file || "catalogo-filamento.pdf"
        : "tiger-tech-catalogos-filamentos.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Erro ao baixar os arquivos.");
    } finally {
      setBusy(false);
    }
  }

  return <section className={styles.entry} aria-labelledby="filament-catalog-title">
    <div className={styles.layout}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>MATERIAL PARA SEUS CLIENTES</span><h2 id="filament-catalog-title">Catálogos dos filamentos</h2></div>
      </header>
      <div className={styles.content}>
        <p className={styles.intro}>Cada catálogo reúne um modelo de filamento com todas as cores disponíveis para venda.</p>
        <fieldset disabled={busy} className={styles.fieldset}>
          <legend className={styles.legend}>Selecionar catálogos</legend>
          <label>Buscar modelo<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: PLA Silk Bambu Lab" /></label>
          <div className={styles.actions}>
            <button type="button" disabled={!filtered.length} onClick={() => setSelected((previous) => new Set([...previous, ...filtered.map((item) => item.id)]))}>Selecionar resultados ({filtered.length})</button>
            <button type="button" disabled={!options.length} onClick={() => setSelected(new Set(options.map((item) => item.id)))}>Selecionar todos</button>
            <button type="button" disabled={!selected.size} onClick={() => setSelected(new Set())}>Limpar seleção</button>
          </div>
          <div className={styles.list}>
            {filtered.map((item) => <div key={item.id} className={styles.item}>
              <label className={styles.catalogChoice}>
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                <span><strong>{item.name}</strong><small>{item.colorCount} {item.colorCount === 1 ? "cor disponível" : "cores disponíveis"}</small></span>
              </label>
              <button type="button" className={styles.individual} onClick={() => download([item.id])} aria-label={`Baixar PDF de ${item.name}`}>Baixar PDF</button>
            </div>)}
            {!filtered.length ? <p>Nenhum modelo encontrado.</p> : null}
          </div>
        </fieldset>
      </div>
      <footer className={styles.footer}>
        <div aria-live="polite"><strong>{selected.size} catálogo(s) selecionado(s)</strong></div>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <button type="button" className={styles.download} disabled={busy || !selected.size} onClick={() => download([...selected])}>{busy ? "Gerando catálogos…" : selected.size > 1 ? "Baixar PDFs selecionados (ZIP)" : "Baixar PDF selecionado"}</button>
      </footer>
    </div>
  </section>;
}
