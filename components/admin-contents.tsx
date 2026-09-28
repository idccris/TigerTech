"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import type { ContentPost } from "../lib/content-posts";
import AdminNavbar from "./admin-navbar";
import ContentImageEditor from "./content-image-editor";

const blank: ContentPost = { slug: "", title: "", category: "Guia 3D", excerpt: "", body: "", author: "Tiger Tech 3D", coverImage: "", images: [], seoTitle: "", seoDescription: "", published: false };

export default function AdminContents({ initialPosts }: { initialPosts: ContentPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [editing, setEditing] = useState<ContentPost | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function slugify(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/conteudos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editing, originalSlug: editing.createdAt ? editing.slug : "" }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(result.error || "Não foi possível salvar."); setSaving(false); return; }
    const refreshed = await fetch("/api/admin/conteudos", { cache: "no-store" }).then((res) => res.json());
    setPosts(Array.isArray(refreshed) ? refreshed : []);
    setEditing(null); setSaving(false); setMessage(editing.published ? "Conteúdo publicado com sucesso." : "Rascunho salvo com sucesso.");
  }

  async function remove(post: ContentPost) {
    if (!window.confirm(`Excluir “${post.title}”? Esta ação não pode ser desfeita.`)) return;
    const response = await fetch(`/api/admin/conteudos?slug=${encodeURIComponent(post.slug)}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(result.error || "Não foi possível excluir."); return; }
    setPosts((items) => items.filter((item) => item.slug !== post.slug));
    setMessage("Conteúdo excluído.");
  }

  return <main className="admin-contents-page">
    <AdminNavbar />
    <header className="contents-admin-hero">
      <div><span>CONTEÚDO E SEO</span><h1>Conteúdos</h1><p>Crie guias, comparativos e artigos que aparecem na nova área pública do site.</p></div>
      <button type="button" onClick={() => { setEditing({ ...blank }); setMessage(""); }}>+ Nova publicação</button>
    </header>
    {message ? <p className="contents-admin-message" role="status">{message}</p> : null}
    <section className="contents-admin-list">
      {posts.length ? posts.map((post) => <article key={post.slug}>
        <div className="contents-admin-thumb">{post.coverImage ? <Image src={post.coverImage} alt="" width={180} height={110} unoptimized /> : <span>Sem capa</span>}</div>
        <div><small>{post.category}</small><h2>{post.title}</h2><p>{post.excerpt || "Sem resumo cadastrado."}</p><time>{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("pt-BR") : ""}</time></div>
        <span className={post.published ? "content-status published" : "content-status"}>{post.published ? "Publicado" : "Rascunho"}</span>
        <div className="contents-admin-actions">{post.published ? <Link href={`/conteudos/${post.slug}`} target="_blank">Visualizar</Link> : null}<button onClick={() => { setEditing(post); setMessage(""); }}>Editar</button><button className="danger" onClick={() => remove(post)}>Excluir</button></div>
      </article>) : <div className="contents-admin-empty"><strong>Nenhum conteúdo criado ainda.</strong><p>Comece pelo primeiro guia da Tiger Tech.</p></div>}
    </section>

    {editing ? <div className="content-editor-modal"><form onSubmit={save}>
      <div className="content-editor-head"><div><span>{editing.createdAt ? "EDITAR PUBLICAÇÃO" : "NOVA PUBLICAÇÃO"}</span><h2>{editing.title || "Conteúdo sem título"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Fechar">×</button></div>
      <div className="content-editor-grid">
        <section>
          <label>Título<input required maxLength={140} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.createdAt ? editing.slug : slugify(e.target.value), seoTitle: editing.seoTitle || e.target.value.slice(0, 70) })} /></label>
          <div className="content-editor-row"><label>Categoria<input maxLength={60} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></label><label>Autor<input maxLength={80} value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></label></div>
          <label>Endereço da página<div className="slug-input"><span>/conteudos/</span><input required readOnly={Boolean(editing.createdAt)} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></div></label>
          <label>Resumo<textarea required maxLength={320} rows={4} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Breve apresentação que aparecerá nos cards e no Google." /></label>
          <label>Texto completo<textarea required rows={18} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} placeholder={"Escreva o artigo aqui.\n\nUse ## para criar um subtítulo e - para criar itens de uma lista."} /></label>
        </section>
        <aside>
          <ContentImageEditor coverImage={editing.coverImage} images={editing.images} onChange={(coverImage, images) => setEditing({ ...editing, coverImage, images })} onError={setMessage} />
          <div className="content-seo-fields"><h3>Configurações de SEO</h3><label>Título no Google<input maxLength={70} value={editing.seoTitle} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} /></label><label>Descrição no Google<textarea maxLength={170} rows={4} value={editing.seoDescription} onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })} /></label></div>
          <label className="content-publish-toggle"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /><span><b>Publicar no site</b><small>Desmarcado, o conteúdo permanece como rascunho.</small></span></label>
        </aside>
      </div>
      {message ? <p className="content-editor-error" role="alert">{message}</p> : null}
      <div className="content-editor-save"><button type="button" onClick={() => setEditing(null)}>Cancelar</button><button disabled={saving}>{saving ? "Salvando..." : editing.published ? "Salvar e publicar" : "Salvar rascunho"}</button></div>
    </form></div> : null}
  </main>;
}
