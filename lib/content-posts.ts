import { ensureDb, sql } from "./db";

export type ContentPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  author: string;
  coverImage: string;
  images: string[];
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function contentSlug(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function iso(value: any) {
  return value?.toISOString?.() || value || undefined;
}

function rowToPost(row: any, admin = false): ContentPost {
  const gallery = Array.isArray(row.gallery) ? row.gallery : [];
  const version = encodeURIComponent(iso(row.updated_at) || "1");
  const imageRoute = admin ? "/api/admin/conteudos/image" : "/api/conteudos/image";
  return {
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category || "Guia 3D"),
    excerpt: String(row.excerpt || ""),
    body: String(row.body || ""),
    author: String(row.author || "Tiger Tech 3D"),
    coverImage: row.cover_image ? `${imageRoute}?slug=${encodeURIComponent(row.slug)}&index=0&v=${version}` : "",
    images: gallery.map((_: unknown, index: number) => `${imageRoute}?slug=${encodeURIComponent(row.slug)}&index=${index + 1}&v=${version}`),
    seoTitle: String(row.seo_title || ""),
    seoDescription: String(row.seo_description || ""),
    published: Boolean(row.published),
    publishedAt: iso(row.published_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export async function listContentPosts(includeDrafts = false) {
  if (!process.env.DATABASE_URL) return [];
  await ensureDb();
  const rows = includeDrafts
    ? await sql()`SELECT * FROM content_posts ORDER BY updated_at DESC`
    : await sql()`SELECT * FROM content_posts WHERE published=true ORDER BY published_at DESC NULLS LAST,updated_at DESC`;
  return rows.map((row) => rowToPost(row, includeDrafts));
}

export async function findContentPost(slug: string, includeDrafts = false) {
  if (!process.env.DATABASE_URL) return null;
  await ensureDb();
  const rows = includeDrafts
    ? await sql()`SELECT * FROM content_posts WHERE slug=${slug} LIMIT 1`
    : await sql()`SELECT * FROM content_posts WHERE slug=${slug} AND published=true LIMIT 1`;
  return rows[0] ? rowToPost(rows[0]) : null;
}

export async function getContentPostImage(slug: string, index: number, includeDrafts = false) {
  if (!process.env.DATABASE_URL) return null;
  await ensureDb();
  const rows = includeDrafts
    ? await sql()`SELECT cover_image,gallery,updated_at FROM content_posts WHERE slug=${slug} LIMIT 1`
    : await sql()`SELECT cover_image,gallery,updated_at FROM content_posts WHERE slug=${slug} AND published=true LIMIT 1`;
  if (!rows[0]) return null;
  const gallery = Array.isArray(rows[0].gallery) ? rows[0].gallery : [];
  return { image: index === 0 ? rows[0].cover_image : gallery[index - 1], updatedAt: rows[0].updated_at };
}
