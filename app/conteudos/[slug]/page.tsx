import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentBody from "../../../components/content-body";
import SiteFooter from "../../../components/site-footer";
import SiteHeader from "../../../components/site-header";
import { findContentPost, listContentPosts } from "../../../lib/content-posts";
import { absoluteUrl, jsonLd } from "../../../lib/seo";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findContentPost((await params).slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return { title, description, alternates: { canonical: `/conteudos/${post.slug}` }, openGraph: { type: "article", url: `/conteudos/${post.slug}`, title, description, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, images: post.coverImage ? [{ url: absoluteUrl(post.coverImage), alt: post.title }] : undefined }, twitter: { card: "summary_large_image", title, description, images: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined } };
}

export default async function Page({ params }: Props) {
  const post = await findContentPost((await params).slug);
  if (!post) notFound();
  const related = (await listContentPosts()).filter((item) => item.slug !== post.slug).slice(0, 3);
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined, datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Organization", name: post.author }, publisher: { "@type": "Organization", name: "Tiger Tech 3D", logo: { "@type": "ImageObject", url: absoluteUrl("/tiger-tech-logo.png") } }, mainEntityOfPage: absoluteUrl(`/conteudos/${post.slug}`) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Conteúdos", item: absoluteUrl("/conteudos") }, { "@type": "ListItem", position: 3, name: post.title, item: absoluteUrl(`/conteudos/${post.slug}`) }] };
  return <main className="content-article-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
    <SiteHeader solid />
    <article>
      <header className="content-article-header"><Link href="/conteudos">← Todos os conteúdos</Link><div><span>{post.category}</span><time dateTime={post.publishedAt}>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}</time></div><h1>{post.title}</h1><p>{post.excerpt}</p><small>Por {post.author}</small></header>
      {post.coverImage ? <div className="content-article-cover"><Image src={post.coverImage} alt={post.title} fill priority sizes="(max-width: 900px) 92vw, 1200px" /></div> : null}
      <ContentBody body={post.body} />
      {post.images.length ? <div className="content-article-gallery">{post.images.map((image, index) => <div key={image}><Image src={image} alt={`${post.title} — imagem ${index + 1}`} fill sizes="(max-width: 700px) 92vw, 45vw" /></div>)}</div> : null}
    </article>
    {related.length ? <section className="content-related"><span>CONTINUE EXPLORANDO</span><h2>Mais conteúdos</h2><div>{related.map((item) => <Link href={`/conteudos/${item.slug}`} key={item.slug}><strong>{item.title}</strong><small>{item.category} →</small></Link>)}</div></section> : null}
    <SiteFooter />
  </main>;
}
