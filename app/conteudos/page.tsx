import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { listContentPosts } from "../../lib/content-posts";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Conteúdos sobre impressão 3D",
  description: "Guias, comparativos e orientações da Tiger Tech sobre impressoras 3D, filamentos, materiais e aplicações.",
  alternates: { canonical: "/conteudos" },
  openGraph: { title: "Conteúdos sobre impressão 3D | Tiger Tech 3D", description: "Informação prática para escolher equipamentos, materiais e imprimir melhor.", url: "/conteudos" },
};

export default async function Page() {
  const posts = await listContentPosts();
  return <main className="contents-page">
    <SiteHeader solid />
    <section className="contents-hero"><span>GUIA 3D TIGER TECH</span><h1>Conteúdo para<br /><em>criar melhor.</em></h1><p>Guias, comparativos e orientações práticas para escolher equipamentos, materiais e aproveitar melhor a impressão 3D.</p></section>
    <section className="contents-grid" aria-label="Publicações">
      {posts.map((post, index) => <article className={index === 0 ? "featured" : ""} key={post.slug}>
        <Link className="content-card-image" href={`/conteudos/${post.slug}`}>{post.coverImage ? <Image src={post.coverImage} alt={post.title} fill sizes={index === 0 ? "(max-width: 800px) 92vw, 58vw" : "(max-width: 800px) 92vw, 30vw"} /> : null}</Link>
        <div><span>{post.category}</span><time dateTime={post.publishedAt}>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}</time><Link href={`/conteudos/${post.slug}`}><h2>{post.title}</h2></Link><p>{post.excerpt}</p><Link className="content-read-link" href={`/conteudos/${post.slug}`}>Ler conteúdo <b>→</b></Link></div>
      </article>)}
      {!posts.length ? <div className="contents-empty"><strong>Novos conteúdos em breve.</strong><p>Estamos preparando guias e comparativos para ajudar em seus projetos.</p></div> : null}
    </section>
    <SiteFooter />
  </main>;
}
