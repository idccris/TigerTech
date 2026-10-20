"use client";

import { useState } from "react";
import { machineCatalogs } from "../lib/machine-catalogs";
import styles from "./admin-catalog-export.module.css";

export default function AdminCatalogExport() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filtered = machineCatalogs.filter(item => item.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR").trim()));

  function toggle(id: string) {
    setSelected(previous => {
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
      const response = await fetch("/api/admin/catalogo-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Não foi possível baixar os catálogos.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = ids.length === 1
        ? machineCatalogs.find(item => item.id === ids[0])!.file
        : "tiger-tech-catalogos.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Erro ao baixar os arquivos.");
    } finally { setBusy(false); }
  }

  return <section className={styles.entry} aria-labelledby="machine-catalog-title">
    <div className={styles.layout}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>MATERIAL PARA SEUS CLIENTES</span><h2 id="machine-catalog-title">Catálogos das máquinas</h2></div>
      </header>
      <div className={styles.content}>
        <p className={styles.intro}>Baixe o PDF de cada modelo para enviar ao cliente. Selecione vários para baixar um ZIP com os PDFs originais separados.</p>
        <fieldset disabled={busy} className={styles.fieldset}>
          <legend className={styles.legend}>Selecionar catálogos</legend>
          <label>Buscar modelo<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Ex.: A1 Mini, H2D ou X1 Carbon" /></label>
          <div className={styles.actions}>
            <button type="button" disabled={!filtered.length} onClick={() => setSelected(previous => new Set([...previous, ...filtered.map(item => item.id)]))}>Selecionar resultados ({filtered.length})</button>
            <button type="button" onClick={() => setSelected(new Set(machineCatalogs.map(item => item.id)))}>Selecionar todos</button>
            <button type="button" disabled={!selected.size} onClick={() => setSelected(new Set())}>Limpar seleção</button>
          </div>
          <div className={styles.list}>
            {filtered.map(item => <div key={item.id} className={styles.item}>
              <label className={styles.catalogChoice}>
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                <span><strong>{item.name}</strong><small>Catálogo em PDF</small></span>
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
        <button type="button" className={styles.download} disabled={busy || !selected.size} onClick={() => download([...selected])}>{busy ? "Preparando download…" : selected.size > 1 ? "Baixar PDFs selecionados (ZIP)" : "Baixar PDF selecionado"}</button>
      </footer>
    </div>
  </section>;
}
