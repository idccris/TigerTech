"use client";

import { useState } from "react";
import type { HomeContent } from "../lib/site-content";
import { defaultFilamentBenefits, type FilamentContent } from "../lib/filament-content";
import { blankSlideshowSlide, defaultSlideshowContent, type SlideshowContent } from "../lib/slideshow-content";
import type { SnapmakerU1Content } from "../lib/snapmaker-content";
import type { LandingPageRecord } from "../lib/landing-pages";
import AdminNavbar from "./admin-navbar";
import AdminSnapmakerDesign from "./admin-snapmaker-design";

const filamentIcons = ["✦", "⚡", "✓", "★", "◆", "●", "◉", "♢", "↗", "∞", "☘", "⬢"];

export default function AdminDesign({ initialImage, initialContent, initialFilamentContents, initialSlideshow, initialSlideshowImages, initialSnapmakerContent, initialLandingPages }: { initialImage: string; initialContent: HomeContent; initialFilamentContents: FilamentContent[]; initialSlideshow: SlideshowContent; initialSlideshowImages: string[]; initialSnapmakerContent: SnapmakerU1Content; initialLandingPages: LandingPageRecord[] }) {
  const [heroImage, setHeroImage] = useState(initialImage);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filamentContents, setFilamentContents] = useState(initialFilamentContents);
  const [selectedFilament, setSelectedFilament] = useState(initialFilamentContents[0]?.typeName || "");
  const [specDrafts, setSpecDrafts] = useState<Record<string, string>>(() => Object.fromEntries(initialFilamentContents.map((item) => [item.typeName, item.specs.join(", ")])));
  const [slideshow, setSlideshow] = useState(initialSlideshow);
  const [slideshowImages, setSlideshowImages] = useState(() => initialSlideshow.slides.map((slide, index) => initialSlideshowImages[index] || slide.defaultImage));
  const [slideshowImageUpdates, setSlideshowImageUpdates] = useState<(string | null)[]>(() => initialSlideshow.slides.map(() => null));
  const [deletedSlideIds, setDeletedSlideIds] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<"home" | "filaments" | "slideshow" | "snapmaker">("home");
  const selectedContent = filamentContents.find((item) => item.typeName === selectedFilament);
  type TextKey = Exclude<keyof HomeContent, "faqs">;

  function updateFilament(patch: Partial<FilamentContent>) {
    setFilamentContents((current) => current.map((item) => item.typeName === selectedFilament ? { ...item, ...patch } : item));
  }

  function updateFilamentBenefit(index: number, field: "icon" | "title" | "text", value: string) {
    if (!selectedContent) return;
    const benefits = selectedContent.benefits?.length === 3 ? [...selectedContent.benefits] : [...defaultFilamentBenefits];
    benefits[index] = { ...benefits[index], [field]: value };
    updateFilament({ benefits });
  }

  function field(key: TextKey, label: string, maxLength = 80) {
    return <label>{label}<input maxLength={maxLength} value={content[key]} onChange={(event) => setContent({ ...content, [key]: event.target.value })} /></label>;
  }

  function updateFaq(index: number, key: "question" | "answer", value: string) {
    setContent((current) => ({ ...current, faqs: current.faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, [key]: value } : faq) }));
  }

  function moveFaq(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.faqs.length) return;
    const faqs = [...content.faqs];
    [faqs[index], faqs[target]] = [faqs[target], faqs[index]];
    setContent({ ...content, faqs });
  }

  function updateSlide(index: number, patch: Partial<SlideshowContent["slides"][number]>) {
    setSlideshow((current) => ({
      slides: current.slides.map((slide, slideIndex) => slideIndex === index ? { ...slide, ...patch } : slide),
    }));
  }

  function addSlide() {
    if (slideshow.slides.length >= 10) return;
    const slide = blankSlideshowSlide(slideshow.slides.length);
    setSlideshow((current) => ({ slides: [...current.slides, slide] }));
    setSlideshowImages((current) => [...current, ""]);
    setSlideshowImageUpdates((current) => [...current, ""]);
  }

  function removeSlide(index: number) {
    if (slideshow.slides.length <= 1) return;
    const id = slideshow.slides[index].id;
    setDeletedSlideIds((current) => [...current, id]);
    setSlideshow((current) => ({ slides: current.slides.filter((_, slideIndex) => slideIndex !== index) }));
    setSlideshowImages((current) => current.filter((_, slideIndex) => slideIndex !== index));
    setSlideshowImageUpdates((current) => current.filter((_, slideIndex) => slideIndex !== index));
  }

  async function optimizeImage(file: File, maxWidth: number, maxLength: number) {
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024)
      throw new Error("Selecione uma imagem válida de até 20 MB.");
    const source = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = source;
      await image.decode();
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.9;
      let optimized = canvas.toDataURL("image/webp", quality);
      while (optimized.length > maxLength && quality > 0.4) {
        quality -= 0.1;
        optimized = canvas.toDataURL("image/webp", quality);
      }
      if (optimized.length > maxLength) throw new Error("A imagem continua muito grande após a otimização.");
      return optimized;
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  async function pickImage(file?: File) {
    if (!file) return;
    try {
      setHeroImage(await optimizeImage(file, 2560, 3_800_000));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível processar esta imagem.");
    }
  }

  async function pickSlideshowImage(index: number, file?: File) {
    if (!file) return;
    try {
      const optimized = await optimizeImage(file, 2200, 1_800_000);
      setSlideshowImages((current) => current.map((image, imageIndex) => imageIndex === index ? optimized : image));
      setSlideshowImageUpdates((current) => current.map((image, imageIndex) => imageIndex === index ? optimized : image));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível processar esta imagem.");
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(activeSection === "home"
        ? { heroImage, homeContent: content }
        : activeSection === "filaments"
          ? { filamentContents }
          : { slideshowContent: slideshow, slideshowImages: slideshowImageUpdates, deletedSlideIds }),
    });
    setSaving(false);
    if (!response.ok) {
      setMessage((await response.json()).error || "Não foi possível publicar.");
      return;
    }
    setMessage(activeSection === "slideshow" ? "Slideshow publicado com sucesso." : "Design publicado com sucesso.");
    if (activeSection === "slideshow") {
      setSlideshowImageUpdates(slideshow.slides.map(() => null));
      setDeletedSlideIds([]);
    }
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("site-settings");
      channel.postMessage("refresh");
      channel.close();
    }
  }

  return <main className="admin-design-page design-v2">
    <AdminNavbar />
    <header className="design-v2-header">
      <div>
        <span>PERSONALIZAÇÃO DO SITE</span>
        <h1>Design</h1>
        <p>Organize o visual da página inicial e o conteúdo compartilhado dos filamentos.</p>
      </div>
      <div className="design-status"><i /><span>Alterações publicadas diretamente no site</span></div>
    </header>

    <nav className="design-section-tabs" aria-label="Áreas de edição">
      <button type="button" className={activeSection === "home" ? "active" : ""} aria-pressed={activeSection === "home"} onClick={() => { setActiveSection("home"); setMessage(""); }}>
        <b>01</b><span><strong>Página inicial</strong><small>Capa, textos, botões e destaques</small></span>
      </button>
      <button type="button" className={activeSection === "filaments" ? "active" : ""} aria-pressed={activeSection === "filaments"} onClick={() => { setActiveSection("filaments"); setMessage(""); }}>
        <b>02</b><span><strong>Filamentos</strong><small>{filamentContents.length} tipos com conteúdo compartilhado</small></span>
      </button>
      <button type="button" className={activeSection === "slideshow" ? "active" : ""} aria-pressed={activeSection === "slideshow"} onClick={() => { setActiveSection("slideshow"); setMessage(""); }}>
        <b>03</b><span><strong>Slideshow</strong><small>{slideshow.slides.length} banners na página inicial</small></span>
      </button>
      <button type="button" className={activeSection === "snapmaker" ? "active" : ""} aria-pressed={activeSection === "snapmaker"} onClick={() => { setActiveSection("snapmaker"); setMessage(""); }}>
        <b>04</b><span><strong>Landing Page</strong><small>Crie e edite páginas de campanha</small></span>
      </button>
    </nav>

    {message ? <div className="design-toast" role="status">{message}</div> : null}

    {activeSection === "home" ? <form className="design-home-workspace" onSubmit={save}>
      <section className="design-panel design-cover-panel">
        <div className="design-panel-heading"><span>01</span><div><h2>Capa principal</h2><p>Imagem exibida no topo da página inicial.</p></div></div>
        <label className="design-cover-field">
          <span className={`design-cover-preview ${heroImage ? "has-image" : ""}`} style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => pickImage(event.target.files?.[0])} />
            <span className="design-cover-action"><b>{heroImage ? "Trocar imagem" : "+ Adicionar capa"}</b><small>1920 × 900 px recomendado · máximo 20 MB</small></span>
          </span>
        </label>
        {heroImage ? <button type="button" className="design-text-button danger" onClick={() => setHeroImage("")}>Remover imagem atual</button> : null}
      </section>

      <section className="design-panel design-copy-panel">
        <div className="design-panel-heading"><span>02</span><div><h2>Mensagem principal</h2><p>Textos e chamadas apresentados sobre a capa.</p></div></div>
        {field("eyebrow", "Texto superior")}
        <div className="design-row">{field("title", "Título")}{field("highlight", "Palavra em destaque")}</div>
        <label>Descrição<textarea maxLength={240} rows={4} value={content.description} onChange={(event) => setContent({ ...content, description: event.target.value })} /><small>{content.description.length}/240 caracteres</small></label>
        <div className="design-row">{field("primaryButton", "Botão principal")}{field("secondaryButton", "Botão secundário")}</div>
      </section>

      <section className="design-panel design-stats-panel">
        <div className="design-panel-heading"><span>03</span><div><h2>Destaques inferiores</h2><p>Três informações rápidas exibidas abaixo da chamada principal.</p></div></div>
        <div className="design-stats">
          <div><b>DESTAQUE 1</b>{field("statOneTitle", "Título")}{field("statOneText", "Descrição")}</div>
          <div><b>DESTAQUE 2</b>{field("statTwoTitle", "Título")}{field("statTwoText", "Descrição")}</div>
          <div><b>DESTAQUE 3</b>{field("statThreeTitle", "Título")}{field("statThreeText", "Descrição")}</div>
        </div>
      </section>

      <section className="design-panel faq-editor-section">
        <div className="faq-editor-heading">
          <div><h2>Perguntas frequentes</h2><p>Edite as perguntas e respostas exibidas abaixo do slideshow.</p></div>
          <button type="button" disabled={content.faqs.length >= 10} onClick={() => setContent({ ...content, faqs: [...content.faqs, { question: "", answer: "" }] })}>+ Adicionar pergunta</button>
        </div>
        <div className="design-row">{field("faqEyebrow", "Texto superior")}{field("faqTitle", "Título da seção")}</div>
        <label>Introdução<textarea maxLength={240} rows={3} value={content.faqDescription} onChange={(event) => setContent({ ...content, faqDescription: event.target.value })} /><small>{content.faqDescription.length}/240 caracteres</small></label>
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

      <div className="design-publish-bar"><span><strong>Página inicial</strong><small>Salve para atualizar o site público.</small></span><button disabled={saving}>{saving ? "Publicando..." : "Publicar alterações"}</button></div>
    </form> : null}

    {activeSection === "filaments" ? <div className="filament-workspace">
      <aside className="filament-type-sidebar">
        <div><span>TIPOS CADASTRADOS</span><h2>Filamentos</h2><p>Escolha qual conteúdo deseja editar.</p></div>
        <div className="filament-type-list" role="tablist" aria-label="Tipos de filamento">
          {filamentContents.map((item, index) => <button type="button" role="tab" aria-selected={selectedFilament === item.typeName} className={selectedFilament === item.typeName ? "active" : ""} key={item.typeName} onClick={() => { setSelectedFilament(item.typeName); setMessage(""); }}>
            <b>{String(index + 1).padStart(2, "0")}</b><span><strong>{item.typeName}</strong><small>Conteúdo compartilhado</small></span><i>→</i>
          </button>)}
        </div>
        <small className="filament-sidebar-note">Novos tipos são criados na página Produtos e aparecem aqui automaticamente.</small>
      </aside>

      <section className="filament-editor-panel">
        {selectedContent ? <form className="filament-content-editor-v2" onSubmit={save}>
          <header><div><span>EDITANDO TIPO</span><h2>{selectedContent.typeName}</h2><p>Estas informações serão usadas em todas as cores vinculadas a este tipo.</p></div><i>{selectedContent.specs.length} especificações</i></header>

          <div className="filament-form-section">
            <div className="filament-section-title"><b>01</b><span><strong>Textos comerciais</strong><small>Conteúdo exibido nos cards e na página do produto.</small></span></div>
            <label>Descrição na página inicial<textarea maxLength={500} rows={3} value={selectedContent.description} onChange={(event) => updateFilament({ description: event.target.value })} /><small>{selectedContent.description.length}/500 caracteres</small></label>
            <label>Descrição completa do produto<textarea maxLength={10000} rows={5} value={selectedContent.longDescription} onChange={(event) => updateFilament({ longDescription: event.target.value })} /></label>
          </div>

          <div className="filament-form-section">
            <div className="filament-section-title"><b>02</b><span><strong>Informações técnicas</strong><small>Características rápidas e ficha técnica detalhada.</small></span></div>
            <label>Especificações separadas por vírgula<input value={specDrafts[selectedContent.typeName] || ""} onChange={(event) => { const value = event.target.value; setSpecDrafts((current) => ({ ...current, [selectedContent.typeName]: value })); updateFilament({ specs: value.split(",").map((item) => item.trim()).filter(Boolean) }); }} placeholder="1 kg, 1,75 mm, Baixo odor" /><small>Exibidas como etiquetas rápidas no produto.</small></label>
            <label>Descritivo técnico<textarea maxLength={10000} rows={7} value={selectedContent.specificationsText} onChange={(event) => updateFilament({ specificationsText: event.target.value })} placeholder="Materiais, temperatura, diâmetro, tolerância e demais informações técnicas." /></label>
          </div>

          <div className="filament-form-section">
            <div className="filament-section-title"><b>03</b><span><strong>Cards de benefícios</strong><small>Três argumentos apresentados na página do produto.</small></span></div>
            <div className="filament-benefit-grid">
              {(selectedContent.benefits?.length === 3 ? selectedContent.benefits : defaultFilamentBenefits).map((benefit, index) => <section className="benefit-edit-card" key={index}>
                <span className="benefit-number">{index + 1}</span>
                <label>Ícone<div className="icon-picker">{filamentIcons.map((icon) => <button type="button" key={icon} aria-label={`Usar ícone ${icon}`} className={benefit.icon === icon ? "active" : ""} onClick={() => updateFilamentBenefit(index, "icon", icon)}>{icon}</button>)}</div></label>
                <label>Título <em>{benefit.title.length}/28</em><input maxLength={28} value={benefit.title} onChange={(event) => updateFilamentBenefit(index, "title", event.target.value)} /></label>
                <label>Descrição <em>{benefit.text.length}/80</em><textarea maxLength={80} rows={3} value={benefit.text} onChange={(event) => updateFilamentBenefit(index, "text", event.target.value)} /></label>
              </section>)}
            </div>
          </div>

          <div className="design-publish-bar"><span><strong>{selectedContent.typeName}</strong><small>Publica o mesmo conteúdo em todas as cores.</small></span><button disabled={saving}>{saving ? "Publicando..." : "Publicar conteúdo"}</button></div>
        </form> : <div className="design-empty-state"><b>+</b><h2>Nenhum tipo cadastrado</h2><p>Adicione um tipo de filamento na página Produtos para começar.</p></div>}
      </section>
    </div> : null}

    {activeSection === "slideshow" ? <form className="slideshow-admin-workspace" onSubmit={save}>
      <header className="slideshow-admin-intro">
        <div><span>DESTAQUES DA PÁGINA INICIAL</span><h2>Slideshow</h2><p>Adicione, edite ou remova as campanhas que alternam automaticamente no site.</p></div>
        <button type="button" className="design-add-button" disabled={slideshow.slides.length >= 10} onClick={addSlide}>+ Adicionar slideshow</button>
      </header>

      <div className="slideshow-admin-grid">
        {slideshow.slides.map((slide, index) => <section className="slideshow-edit-card" key={slide.id}>
          <div className="slideshow-edit-heading"><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{slide.eyebrow || `Banner ${index + 1}`}</h3><p>Destaque {index + 1} do slideshow</p></div><button type="button" className="slideshow-delete" disabled={slideshow.slides.length <= 1} onClick={() => removeSlide(index)}>Excluir</button></div>
          <label className="slideshow-image-field">
            <span className="slideshow-image-preview" style={{ backgroundImage: slideshowImages[index] ? `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url(${slideshowImages[index]})` : "linear-gradient(135deg,#222,#555)" }}>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => pickSlideshowImage(index, event.target.files?.[0])} />
              <span><strong>Trocar imagem</strong><small>1920 × 760 px recomendado</small></span>
            </span>
          </label>
          {slideshowImageUpdates[index] !== "" ? <button type="button" className="design-text-button danger" onClick={() => {
            const defaultImage = defaultSlideshowContent.slides[index]?.defaultImage || "";
            setSlideshowImages((current) => current.map((image, imageIndex) => imageIndex === index ? defaultImage : image));
            setSlideshowImageUpdates((current) => current.map((image, imageIndex) => imageIndex === index ? "" : image));
          }}>Restaurar imagem padrão</button> : null}
          <div className="slideshow-fields">
            <label>Texto superior<input maxLength={60} value={slide.eyebrow} onChange={(event) => updateSlide(index, { eyebrow: event.target.value })} /></label>
            <label>Título<input maxLength={100} value={slide.title} onChange={(event) => updateSlide(index, { title: event.target.value })} /></label>
            <label>Descrição<textarea maxLength={280} rows={4} value={slide.description} onChange={(event) => updateSlide(index, { description: event.target.value })} /><small>{slide.description.length}/280 caracteres</small></label>
            <div className="design-row">
              <label>Texto do botão<input maxLength={50} value={slide.buttonLabel} onChange={(event) => updateSlide(index, { buttonLabel: event.target.value })} /></label>
              <label>Link do botão<input maxLength={300} value={slide.href} onChange={(event) => updateSlide(index, { href: event.target.value })} placeholder="/pagina ou https://..." /></label>
            </div>
          </div>
        </section>)}
      </div>

      <div className="design-publish-bar"><span><strong>Slideshow da página inicial</strong><small>As alterações atualizam os dois banners públicos.</small></span><button disabled={saving}>{saving ? "Publicando..." : "Publicar slideshow"}</button></div>
    </form> : null}
    {activeSection === "snapmaker" ? <AdminSnapmakerDesign initialContent={initialSnapmakerContent} initialLandingPages={initialLandingPages} /> : null}
  </main>;
}
