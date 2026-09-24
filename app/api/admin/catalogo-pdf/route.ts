import fs from "node:fs/promises";
import path from "node:path";
import { requireUser, isTrustedMutation, consumeRateLimit, hashToken } from "../../../../lib/admin-auth";
import { listCatalogExportProducts } from "../../../../lib/catalog-export-products";
import { groupProductsForAdmin } from "../../../../lib/product-variants";
import { buildCatalogPdf } from "../../../../lib/catalog-pdf";
import { loadCatalogImages } from "../../../../lib/catalog-pdf-images";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) return Response.json({ error: "Origem não autorizada." }, { status: 403 });
  const user = await requireUser();
  if (!user) return Response.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Seleção inválida." }, { status: 400 }); }
  const slugs = (body as { slugs?: unknown } | null)?.slugs;
  if (!Array.isArray(slugs) || !slugs.length || slugs.length > 1000 || slugs.some((s) => typeof s !== "string" || s.length > 250)) {
    return Response.json({ error: "Selecione entre 1 e 1000 produtos." }, { status: 400 });
  }
  try {
    if (!(await consumeRateLimit(hashToken(`catalog-pdf:${user.username}`), 10, 5))) {
      return Response.json({ error: "Muitos catálogos gerados em sequência. Aguarde alguns minutos." }, { status: 429, headers: { "Retry-After": "300" } });
    }
    const selected = new Set<string>(slugs);
    const products = groupProductsForAdmin(await listCatalogExportProducts()).filter((p) => selected.has(p.slug));
    if (products.length !== selected.size) return Response.json({ error: "Um produto foi alterado ou removido. Atualize a página e selecione novamente." }, { status: 409 });
    const [logo, images] = await Promise.all([
      fs.readFile(path.join(process.cwd(), "public", "tiger-tech-logo.png")),
      loadCatalogImages(products),
    ]);
    const generatedAt = new Date();
    const pdf = buildCatalogPdf({ products, logo, images, generatedAt, curated: true });
    return new Response(new Uint8Array(pdf), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tiger-tech-selecao-${generatedAt.toISOString().slice(0, 10)}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    console.error("Falha ao gerar seleção PDF", error);
    return Response.json({ error: "Não foi possível gerar o PDF. Tente novamente." }, { status: 500 });
  }
}
