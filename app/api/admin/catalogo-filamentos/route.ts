import fs from "node:fs/promises";
import path from "node:path";
import { requireUser, isTrustedMutation, consumeRateLimit, hashToken } from "../../../../lib/admin-auth";
import { listCatalogExportProducts } from "../../../../lib/catalog-export-products";
import { filamentCatalogOptions, filamentCatalogProducts, selectFilamentCatalogs, unavailableFilamentCatalogIds } from "../../../../lib/filament-catalogs";
import { loadCatalogImages } from "../../../../lib/catalog-pdf-images";
import { buildCatalogPdf } from "../../../../lib/catalog-pdf";
import { buildCatalogZip } from "../../../../lib/catalog-zip";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) return Response.json({ error: "Origem não autorizada." }, { status: 403 });
  const user = await requireUser();
  if (!user) return Response.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Acesso exclusivo do administrador." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Seleção inválida." }, { status: 400 }); }

  try {
    const products = await listCatalogExportProducts();
    const options = filamentCatalogOptions(products);
    const requestedIds = (body as { ids?: unknown } | null)?.ids;
    const selected = selectFilamentCatalogs(requestedIds, options);
    if (!selected) {
      const unavailable = unavailableFilamentCatalogIds(products);
      if (Array.isArray(requestedIds) && requestedIds.some((id) => typeof id === "string" && unavailable.has(id))) {
        return Response.json({ error: "Nenhuma cor disponível em estoque para este produto." }, { status: 409 });
      }
      return Response.json({ error: "Selecione entre 1 e 100 catálogos de filamentos, sem repetições." }, { status: 400 });
    }
    if (!(await consumeRateLimit(hashToken(`filament-catalog-pdf:${user.username}`), 20, 5)))
      return Response.json({ error: "Muitos downloads em sequência. Aguarde alguns minutos." }, { status: 429, headers: { "Retry-After": "300" } });

    const selectedIds = new Set(selected.map((item) => item.id));
    const groups = filamentCatalogProducts(products).filter((product) => selectedIds.has(product.groupSlug || product.slug));
    const logo = await fs.readFile(path.join(process.cwd(), "public", "tiger-tech-logo.png"));
    const generatedAt = new Date();
    const files = await Promise.all(groups.map(async (product) => ({
      name: selected.find((item) => item.id === (product.groupSlug || product.slug))!.file,
      data: buildCatalogPdf({ products: [product], logo, generatedAt, images: await loadCatalogImages([product]), curated: true }),
    })));
    const single = files.length === 1;
    const data = single ? files[0].data : buildCatalogZip(files);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": single ? "application/pdf" : "application/zip",
        "Content-Disposition": `attachment; filename="${single ? files[0].name : "tiger-tech-catalogos-filamentos.zip"}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Falha ao gerar catálogo de filamentos", error);
    return Response.json({ error: "Não foi possível gerar os catálogos de filamentos." }, { status: 500 });
  }
}
