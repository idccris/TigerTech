import { isTrustedMutation, requireAdmin } from "../../../../lib/admin-auth";
import { ensureDb, getSiteSetting, sql } from "../../../../lib/db";
import { defaultHomeContent, parseHomeContent } from "../../../../lib/site-content";
import { blankSlideshowSlide, defaultSlideshowContent, parseSlideshowContent, safeSlideId, slideshowImageKey } from "../../../../lib/slideshow-content";
import { sanitizeSnapmakerU1Content } from "../../../../lib/snapmaker-content";
import { sanitizeLandingPages } from "../../../../lib/landing-pages";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET() {
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const [heroImage, rawContent, rawSlideshowContent] = await Promise.all([
    getSiteSetting("hero_image"),
    getSiteSetting("home_content"),
    getSiteSetting("slideshow_content"),
  ]);
  const slideshowContent = parseSlideshowContent(rawSlideshowContent);
  const slideshowImages = await Promise.all(slideshowContent.slides.map((slide) => getSiteSetting(slideshowImageKey(slide.id))));
  return Response.json({ heroImage, homeContent: parseHomeContent(rawContent), slideshowContent, slideshowImages });
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { heroImage, homeContent, filamentContents, slideshowContent, slideshowImages, deletedSlideIds, snapmakerU1Content, landingPages } = await req.json();
  const validateImage = (value: unknown, maxLength = 4_200_000) => {
    if (value === undefined || value === null) return null;
    const image = String(value || "");
    if (image && !image.startsWith("data:image/")) throw new Error("Imagem inválida.");
    if (image.length > maxLength) throw new Error("Imagem muito grande.");
    return image;
  };
  let image: string | null;
  let safeSlideshowImages: (string | null)[] = [];
  try {
    image = validateImage(heroImage);
    safeSlideshowImages = Array.isArray(slideshowImages)
      ? slideshowImages.slice(0, 10).map((value) => validateImage(value, 2_000_000))
      : [];
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Imagem inválida." }, { status: 413 });
  }
  await ensureDb();
  const textKeys = Object.keys(defaultHomeContent).filter((key) => key !== "faqs");
  const safeContent = homeContent === undefined ? null : {
    ...Object.fromEntries(
      textKeys.map((key) => [key, String(homeContent?.[key] ?? defaultHomeContent[key as keyof typeof defaultHomeContent]).slice(0, key === "description" || key === "faqDescription" ? 240 : 80)]),
    ),
    faqs: (Array.isArray(homeContent?.faqs) ? homeContent.faqs : defaultHomeContent.faqs)
      .slice(0, 10)
      .map((item: { question?: unknown; answer?: unknown }) => ({
        question: String(item?.question || "").trim().slice(0, 140),
        answer: String(item?.answer || "").trim().slice(0, 600),
      }))
      .filter((item: { question: string; answer: string }) => item.question && item.answer),
  };
  const safeFilamentContents = Array.isArray(filamentContents) ? filamentContents.slice(0, 100).flatMap((item: any) => {
    const typeName = String(item?.typeName || "").trim().slice(0, 80);
    if (!typeName) return [];
    return [{
      typeName,
      description: String(item.description || "").slice(0, 500),
      longDescription: String(item.longDescription || "").slice(0, 10000),
      specificationsText: String(item.specificationsText || "").slice(0, 10000),
      specs: Array.isArray(item.specs) ? item.specs.slice(0, 100).map((spec: unknown) => String(spec).slice(0, 160)) : [],
      benefits: Array.from({ length: 3 }, (_, index) => ({ icon: String(item.benefits?.[index]?.icon || "✦").slice(0, 4), title: String(item.benefits?.[index]?.title || "").slice(0, 28), text: String(item.benefits?.[index]?.text || "").slice(0, 80) })),
    }];
  }) : null;
  const safeSlideshowContent = slideshowContent === undefined ? null : {
    slides: (Array.isArray(slideshowContent?.slides) && slideshowContent.slides.length ? slideshowContent.slides : defaultSlideshowContent.slides).slice(0, 10).map((source: any, index: number) => {
      const fallback = defaultSlideshowContent.slides[index] || blankSlideshowSlide(index);
      const slide = source || {};
      const href = String(slide.href ?? fallback.href).trim();
      return {
        id: safeSlideId(slide.id, fallback.id),
        eyebrow: String(slide.eyebrow ?? fallback.eyebrow).slice(0, 60),
        title: String(slide.title ?? fallback.title).slice(0, 100),
        description: String(slide.description ?? fallback.description).slice(0, 280),
        buttonLabel: String(slide.buttonLabel ?? fallback.buttonLabel).slice(0, 50),
        href: (/^(\/|https:\/\/)/.test(href) ? href : fallback.href).slice(0, 300),
      };
    }),
  };
  const safeSnapmakerContent = snapmakerU1Content === undefined ? null : sanitizeSnapmakerU1Content(snapmakerU1Content);
  const safeLandingPages = landingPages === undefined ? null : sanitizeLandingPages(landingPages);
  const updates = [];
  if (image !== null) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('hero_image',${image},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  if (safeContent) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('home_content',${JSON.stringify(safeContent)},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  if (safeFilamentContents) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('filament_type_content',${JSON.stringify(safeFilamentContents)},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  if (safeSlideshowContent) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('slideshow_content',${JSON.stringify(safeSlideshowContent)},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  if (safeSnapmakerContent) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('snapmaker_u1_content',${JSON.stringify(safeSnapmakerContent)},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  if (safeLandingPages) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('landing_pages',${JSON.stringify(safeLandingPages)},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  safeSlideshowImages.forEach((slideImage, index) => {
    const slide = safeSlideshowContent?.slides[index];
    if (slide && slideImage !== null) updates.push(sql()`INSERT INTO site_settings(key,value,updated_at) VALUES(${slideshowImageKey(slide.id)},${slideImage},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`);
  });
  (Array.isArray(deletedSlideIds) ? deletedSlideIds : []).slice(0, 10).forEach((value: unknown) => {
    const id = safeSlideId(value, "");
    if (id) updates.push(sql()`DELETE FROM site_settings WHERE key=${slideshowImageKey(id)}`);
  });
  await Promise.all(updates);
  revalidateTag("site-design", { expire: 0 });
  revalidateTag("catalog-products", { expire: 0 });
  revalidatePath("/", "page");
  revalidatePath("/produtos", "page");
  revalidatePath("/produto/[slug]", "page");
  revalidatePath("/snapmaker-u1", "page");
  revalidatePath("/landing/[slug]", "page");
  return Response.json({ ok: true });
}
