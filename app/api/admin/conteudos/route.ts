import { revalidatePath } from "next/cache";
import { isTrustedMutation, requireAdmin } from "../../../../lib/admin-auth";
import { contentSlug, listContentPosts } from "../../../../lib/content-posts";
import { ensureDb, sql } from "../../../../lib/db";

const imagePattern = /^data:image\/(?:png|jpeg|webp);base64,/;

function cleanImage(value: unknown) {
  const image = String(value || "");
  if (!image || image.startsWith("/api/conteudos/image?") || image.startsWith("/api/admin/conteudos/image?")) return image;
  if (!imagePattern.test(image)) throw new Error("Use imagens PNG, JPG ou WebP.");
  if (image.length > 1_000_000) throw new Error("Uma das imagens ficou muito grande.");
  return image;
}

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  return Response.json(await listContentPosts(true), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req)) return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const input = await req.json();
  const originalSlug = contentSlug(input.originalSlug || input.slug);
  const slug = contentSlug(input.slug || input.title);
  const title = String(input.title || "").trim().slice(0, 140);
  const body = String(input.body || "").trim().slice(0, 60_000);
  const published = Boolean(input.published);
  if (!slug || !title) return Response.json({ error: "Preencha o título da publicação." }, { status: 400 });
  if (published && body.length < 80) return Response.json({ error: "O texto precisa ter pelo menos 80 caracteres para ser publicado." }, { status: 400 });
  if (originalSlug && originalSlug !== slug) return Response.json({ error: "O endereço não pode ser alterado depois da criação." }, { status: 400 });

  await ensureDb();
  const currentRows = await sql()`SELECT cover_image,gallery FROM content_posts WHERE slug=${slug} LIMIT 1`;
  const current = currentRows[0];
  let coverImage: string;
  let images: string[];
  try {
    const suppliedCover = cleanImage(input.coverImage);
    coverImage = suppliedCover.includes("/conteudos/image?") ? String(current?.cover_image || "") : suppliedCover;
    const currentGallery = Array.isArray(current?.gallery) ? current.gallery : [];
    images = (Array.isArray(input.images) ? input.images : []).slice(0, 4).map((value: unknown, index: number) => {
      const image = cleanImage(value);
      if (image.includes("/conteudos/image?")) {
        const sourceIndex = Number(new URL(image, "https://local.invalid").searchParams.get("index")) || index + 1;
        return String(currentGallery[sourceIndex - 1] || "");
      }
      return image;
    }).filter(Boolean);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Imagem inválida." }, { status: 413 });
  }
  if (published && !coverImage) return Response.json({ error: "Adicione uma imagem de capa antes de publicar." }, { status: 400 });

  const category = String(input.category || "Guia 3D").trim().slice(0, 60) || "Guia 3D";
  const excerpt = String(input.excerpt || "").trim().slice(0, 320);
  const author = String(input.author || "Tiger Tech 3D").trim().slice(0, 80) || "Tiger Tech 3D";
  const seoTitle = String(input.seoTitle || title).trim().slice(0, 70);
  const seoDescription = String(input.seoDescription || excerpt).trim().slice(0, 170);

  await sql()`INSERT INTO content_posts(slug,title,category,excerpt,body,author,cover_image,gallery,seo_title,seo_description,published,published_at,created_at,updated_at)
    VALUES(${slug},${title},${category},${excerpt},${body},${author},${coverImage},${JSON.stringify(images)}::jsonb,${seoTitle},${seoDescription},${published},${published ? new Date().toISOString() : null},NOW(),NOW())
    ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,excerpt=EXCLUDED.excerpt,body=EXCLUDED.body,author=EXCLUDED.author,cover_image=EXCLUDED.cover_image,gallery=EXCLUDED.gallery,seo_title=EXCLUDED.seo_title,seo_description=EXCLUDED.seo_description,published=EXCLUDED.published,published_at=CASE WHEN EXCLUDED.published AND content_posts.published_at IS NULL THEN NOW() WHEN NOT EXCLUDED.published THEN NULL ELSE content_posts.published_at END,updated_at=NOW()`;
  revalidatePath("/conteudos");
  revalidatePath(`/conteudos/${slug}`);
  revalidatePath("/sitemap.xml");
  return Response.json({ ok: true, slug });
}

export async function DELETE(req: Request) {
  if (!isTrustedMutation(req)) return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const slug = contentSlug(new URL(req.url).searchParams.get("slug"));
  if (!slug) return Response.json({ error: "Publicação inválida" }, { status: 400 });
  await ensureDb();
  await sql()`DELETE FROM content_posts WHERE slug=${slug}`;
  revalidatePath("/conteudos");
  revalidatePath(`/conteudos/${slug}`);
  revalidatePath("/sitemap.xml");
  return Response.json({ ok: true });
}
