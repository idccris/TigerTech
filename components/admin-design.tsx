"use client";

import { useState } from "react";
import type { HomeContent } from "../lib/site-content";
import AdminNavbar from "./admin-navbar";

export default function AdminDesign({ initialImage, initialContent }: { initialImage: string; initialContent: HomeContent }) {
  const [heroImage, setHeroImage] = useState(initialImage);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  type TextKey = Exclude<keyof HomeContent, "faqs">;

  function field(key: TextKey, label: string, maxLength = 80) {
    return <label>{label}<input maxLength={maxLength} value={content[key]} onChange={(event) => setContent({ ...content, [key]: event.target.value })} /></label>;
  }

  function updateFaq(index: number, key: "question" | "answer", value: string) {
    setContent({ ...content, faqs: content.faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, [key]: value } : faq) });
  }

  function moveFaq(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.faqs.length) return;
    const faqs = [...content.faqs];
    [faqs[index], faqs[target]] = [faqs[target], faqs[index]];
    setContent({ ...content, faqs });
  }

  async function pickImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) {
      setMessage("Selecione uma imagem válida de até 20 MB.");
      return;
    }
    try {
      const source = URL.createObjectURL(file);
      const image = new Image();
      image.src = source;
      await image.decode();
      const scale = Math.min(1, 2560 / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      let quality = 0.9;
      let optimized = canvas.toDataURL("image/webp", quality);
      while (optimized.length > 3_800_000 && quality > 0.5) {
        quality -= 0.1;
        optimized = canvas.toDataURL("image/webp", quality);
      }
      if (optimized.length > 4_200_000) throw new Error();
      setHeroImage(optimized);
      setMessage("");
    } catch {
      setMessage("Não foi possível processar esta imagem.");
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ heroImage, homeContent: content }),
    });
    setSaving(false);
    if (!response.ok) {
      setMessage((await response.json()).error || "Não foi possível publicar.");
      return;
    }
    setMessage("Design publicado com sucesso.");
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("site-settings");
      channel.postMessage("refresh");
      channel.close();
    }
  }

  return <main className="admin-design-page">
    <AdminNavbar />
    <header className="admin-design-hero"><span>PERSONALIZAÇÃO DO SITE</span><h1>Design</h1><p>Edite o conteúdo principal e publique as alterações diretamente na página inicial.</p></header>
    <form className="design-editor" onSubmit={save}>
      <section>
        <h2>Capa da página inicial</h2>
        <label>Imagem de fundo
          <span className={`hero-image-upload ${heroImage ? "has-image" : ""}`} style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => pickImage(event.target.files?.[0])} />
            {heroImage ? <em>Trocar imagem</em> : <><b>+</b><small>Adicionar imagem da capa</small></>}
          </span>
          <small>Recomendado: 1920 × 900 px · máximo 20 MB</small>
        </label>
        {heroImage ? <button type="button" className="remove-cover" onClick={() => setHeroImage("")}>Remover imagem</button> : null}
      </section>
      <section>
        <h2>Textos e botões</h2>
        {field("eyebrow", "Texto superior")}
        <div className="design-row">{field("title", "Título")}{field("highlight", "Título em destaque")}</div>
        <label>Descrição<textarea maxLength={240} rows={4} value={content.description} onChange={(event) => setContent({ ...content, description: event.target.value })} /><small>{content.description.length}/240</small></label>
        <div className="design-row">{field("primaryButton", "Botão principal")}{field("secondaryButton", "Botão secundário")}</div>
      </section>
      <section>
        <h2>Informações inferiores</h2>
        <div className="design-stats">
          <div>{field("statOneTitle", "Destaque 1")}{field("statOneText", "Descrição 1")}</div>
          <div>{field("statTwoTitle", "Destaque 2")}{field("statTwoText", "Descrição 2")}</div>
          <div>{field("statThreeTitle", "Destaque 3")}{field("statThreeText", "Descrição 3")}</div>
        </div>
      </section>
      <section className="faq-editor-section">
        <div className="faq-editor-heading">
          <div><h2>Perguntas frequentes</h2><p>Edite o Q&amp;A exibido na parte inferior da página inicial.</p></div>
          <button type="button" disabled={content.faqs.length >= 10} onClick={() => setContent({ ...content, faqs: [...content.faqs, { question: "", answer: "" }] })}>+ Adicionar pergunta</button>
        </div>
        <div className="design-row">{field("faqEyebrow", "Texto superior")}{field("faqTitle", "Título da seção")}</div>
        <label>Introdução<textarea maxLength={240} rows={3} value={content.faqDescription} onChange={(event) => setContent({ ...content, faqDescription: event.target.value })} /></label>
        <div className="faq-editor-list">
          {content.faqs.map((faq, index) => <article key={index}>
            <div className="faq-editor-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="faq-editor-fields">
              <label>Pergunta<input maxLength={140} value={faq.question} onChange={(event) => updateFaq(index, "question", event.target.value)} required /></label>
              <label>Resposta<textarea maxLength={600} rows={3} value={faq.answer} onChange={(event) => updateFaq(index, "answer", event.target.value)} required /></label>
            </div>
            <div className="faq-editor-actions">
              <button type="button" aria-label="Mover pergunta para cima" disabled={index === 0} onClick={() => moveFaq(index, -1)}>↑</button>
              <button type="button" aria-label="Mover pergunta para baixo" disabled={index === content.faqs.length - 1} onClick={() => moveFaq(index, 1)}>↓</button>
              <button type="button" className="danger" onClick={() => setContent({ ...content, faqs: content.faqs.filter((_, faqIndex) => faqIndex !== index) })}>Excluir</button>
            </div>
          </article>)}
        </div>
      </section>
      <button className="design-save" disabled={saving}>{saving ? "Publicando..." : "Confirmar e publicar"}</button>
      {message ? <p className="design-message">{message}</p> : null}
    </form>
  </main>;
}
