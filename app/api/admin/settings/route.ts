import { isTrustedMutation, requireAdmin } from "../../../../lib/admin-auth";
import { ensureDb, getSiteSetting, sql } from "../../../../lib/db";
import { defaultHomeContent, parseHomeContent } from "../../../../lib/site-content";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET() {
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const [heroImage, rawContent] = await Promise.all([
    getSiteSetting("hero_image"),
    getSiteSetting("home_content"),
  ]);
  return Response.json({ heroImage, homeContent: parseHomeContent(rawContent) });
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { heroImage, homeContent } = await req.json();
  const image = String(heroImage || "");
  if (image && !image.startsWith("data:image/"))
    return Response.json({ error: "Imagem inválida." }, { status: 400 });
  if (image.length > 4_200_000)
    return Response.json(
      { error: "Imagem muito grande. Use até 3 MB." },
      { status: 413 },
    );
  await ensureDb();
  const textKeys = Object.keys(defaultHomeContent).filter((key) => key !== "faqs");
  const safeContent = {
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
  await Promise.all([
    sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('hero_image',${image},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,
    sql()`INSERT INTO site_settings(key,value,updated_at) VALUES('home_content',${JSON.stringify(safeContent)},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,
  ]);
  revalidateTag("site-design", { expire: 0 });
  revalidatePath("/", "page");
  return Response.json({ ok: true });
}
