"use client";

import { useState } from "react";
import type { SnapmakerU1Content } from "../lib/snapmaker-content";

type Props = { initialContent: SnapmakerU1Content };

export default function AdminSnapmakerDesign({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof SnapmakerU1Content>(key: K, value: SnapmakerU1Content[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateHighlight(index: number, field: "title" | "text", value: string) {
    update("highlights", content.highlights.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapmakerU1Content: content }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Não foi possível publicar.");
      setMessage("Landing page da Snapmaker U1 publicada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível publicar.");
    } finally {
      setSaving(false);
    }
  }

  return <form className="snapmaker-admin-workspace" onSubmit={save}>
    {message ? <div className="design-toast" role="status">{message}</div> : null}
    <header className="slideshow-admin-intro">
      <div><span>LANDING PAGE DE PRODUTO</span><h2>Snapmaker U1</h2><p>Edite os textos comerciais da página. Foto, preço e estoque permanecem vinculados ao produto SKU-0014.</p></div>
      <a href="/snapmaker-u1" target="_blank" rel="noreferrer">Visualizar página ↗</a>
    </header>

    <div className="snapmaker-admin-grid">
      <section className="design-panel snapmaker-admin-section">
        <div className="design-panel-heading"><span>01</span><div><h2>Capa e números</h2><p>Primeira mensagem vista pelo visitante.</p></div></div>
        <div className="design-row">
          <label>Texto superior<input maxLength={60} value={content.heroEyebrow} onChange={(event) => update("heroEyebrow", event.target.value)} /></label>
          <label>Primeira linha do título<input maxLength={100} value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} /></label>
        </div>
        <label>Linha destacada do título<input maxLength={100} value={content.heroHighlight} onChange={(event) => update("heroHighlight", event.target.value)} /></label>
        <label>Descrição<textarea maxLength={320} rows={4} value={content.heroDescription} onChange={(event) => update("heroDescription", event.target.value)} /></label>
        <div className="design-row">
          <label>Botão principal<input maxLength={50} value={content.heroPrimaryButton} onChange={(event) => update("heroPrimaryButton", event.target.value)} /></label>
          <label>Botão de contato<input maxLength={50} value={content.heroSecondaryButton} onChange={(event) => update("heroSecondaryButton", event.target.value)} /></label>
        </div>
        <div className="snapmaker-stat-editors">
          {([1, 2, 3] as const).map((number) => {
            const valueKey = `stat${number === 1 ? "One" : number === 2 ? "Two" : "Three"}Value` as const;
            const labelKey = `stat${number === 1 ? "One" : number === 2 ? "Two" : "Three"}Label` as const;
            return <div key={number}><b>NÚMERO {number}</b><label>Valor<input maxLength={30} value={content[valueKey]} onChange={(event) => update(valueKey, event.target.value)} /></label><label>Descrição<input maxLength={70} value={content[labelKey]} onChange={(event) => update(labelKey, event.target.value)} /></label></div>;
          })}
        </div>
      </section>

      <section className="design-panel snapmaker-admin-section">
        <div className="design-panel-heading"><span>02</span><div><h2>Tecnologia</h2><p>Título e quatro argumentos de destaque.</p></div></div>
        <label>Texto superior<input maxLength={80} value={content.technologyEyebrow} onChange={(event) => update("technologyEyebrow", event.target.value)} /></label>
        <label>Título<input maxLength={140} value={content.technologyTitle} onChange={(event) => update("technologyTitle", event.target.value)} /></label>
        <div className="snapmaker-highlight-editors">
          {content.highlights.map((item, index) => <article key={index}><b>{String(index + 1).padStart(2, "0")}</b><label>Título<input maxLength={100} value={item.title} onChange={(event) => updateHighlight(index, "title", event.target.value)} /></label><label>Descrição<textarea maxLength={320} rows={3} value={item.text} onChange={(event) => updateHighlight(index, "text", event.target.value)} /></label></article>)}
        </div>
      </section>

      <section className="design-panel snapmaker-admin-section">
        <div className="design-panel-heading"><span>03</span><div><h2>Troca e precisão</h2><p>Conteúdo técnico e materiais compatíveis.</p></div></div>
        <label>Texto superior — troca<input maxLength={80} value={content.swapEyebrow} onChange={(event) => update("swapEyebrow", event.target.value)} /></label>
        <label>Título — troca<input maxLength={140} value={content.swapTitle} onChange={(event) => update("swapTitle", event.target.value)} /></label>
        <label>Descrição — troca<textarea maxLength={600} rows={4} value={content.swapDescription} onChange={(event) => update("swapDescription", event.target.value)} /></label>
        <div className="design-row"><label>Valor destacado<input maxLength={40} value={content.swapMetricValue} onChange={(event) => update("swapMetricValue", event.target.value)} /></label><label>Descrição do valor<input maxLength={100} value={content.swapMetricLabel} onChange={(event) => update("swapMetricLabel", event.target.value)} /></label></div>
        <hr />
        <label>Texto superior — precisão<input maxLength={80} value={content.precisionEyebrow} onChange={(event) => update("precisionEyebrow", event.target.value)} /></label>
        <label>Título — precisão<input maxLength={140} value={content.precisionTitle} onChange={(event) => update("precisionTitle", event.target.value)} /></label>
        <label>Descrição — precisão<textarea maxLength={600} rows={4} value={content.precisionDescription} onChange={(event) => update("precisionDescription", event.target.value)} /></label>
        <label>Materiais, separados por vírgula<input value={content.materials.join(", ")} onChange={(event) => update("materials", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
      </section>

      <section className="design-panel snapmaker-admin-section">
        <div className="design-panel-heading"><span>04</span><div><h2>Detecção e oferta</h2><p>Bloco de segurança e chamada do produto.</p></div></div>
        <label>Texto superior — detecção<input maxLength={80} value={content.detectionEyebrow} onChange={(event) => update("detectionEyebrow", event.target.value)} /></label>
        <label>Título — detecção<input maxLength={140} value={content.detectionTitle} onChange={(event) => update("detectionTitle", event.target.value)} /></label>
        <label>Descrição — detecção<textarea maxLength={600} rows={4} value={content.detectionDescription} onChange={(event) => update("detectionDescription", event.target.value)} /></label>
        <label>Itens, um por linha<textarea rows={4} value={content.detectionItems.join("\n")} onChange={(event) => update("detectionItems", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} /></label>
        <hr />
        <div className="design-row"><label>Chamada da oferta<input maxLength={80} value={content.offerEyebrow} onChange={(event) => update("offerEyebrow", event.target.value)} /></label><label>Categoria exibida<input maxLength={80} value={content.offerCategory} onChange={(event) => update("offerCategory", event.target.value)} /></label></div>
        <label>Descrição da oferta<input maxLength={180} value={content.offerDescription} onChange={(event) => update("offerDescription", event.target.value)} /></label>
      </section>

      <section className="design-panel snapmaker-admin-section snapmaker-final-editor">
        <div className="design-panel-heading"><span>05</span><div><h2>Chamada final</h2><p>Último convite e destino do contato comercial.</p></div></div>
        <div className="design-row"><label>Texto superior<input maxLength={60} value={content.finalEyebrow} onChange={(event) => update("finalEyebrow", event.target.value)} /></label><label>Texto do botão<input maxLength={60} value={content.finalButton} onChange={(event) => update("finalButton", event.target.value)} /></label></div>
        <label>Título<input maxLength={160} value={content.finalTitle} onChange={(event) => update("finalTitle", event.target.value)} /></label>
        <label>Descrição<textarea maxLength={400} rows={4} value={content.finalDescription} onChange={(event) => update("finalDescription", event.target.value)} /></label>
        <label>Link do WhatsApp<input maxLength={500} type="url" value={content.whatsappUrl} onChange={(event) => update("whatsappUrl", event.target.value)} /></label>
      </section>
    </div>

    <div className="design-publish-bar"><span><strong>Landing Page Snapmaker U1</strong><small>Preço, estoque, foto e descrição do card são editados no cadastro do produto.</small></span><button disabled={saving}>{saving ? "Publicando..." : "Publicar landing page"}</button></div>
  </form>;
}
