import fs from "node:fs/promises";
import path from "node:path";
import { requireUser, isTrustedMutation, consumeRateLimit, hashToken } from "../../../../lib/admin-auth";
import { selectMachineCatalogs } from "../../../../lib/machine-catalogs";
import { buildCatalogZip } from "../../../../lib/catalog-zip";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) return Response.json({ error: "Origem não autorizada." }, { status: 403 });
  const user = await requireUser();
  if (!user) return Response.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Acesso exclusivo do administrador." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Seleção inválida." }, { status: 400 }); }
  const selected = selectMachineCatalogs((body as { ids?: unknown } | null)?.ids);
  if (!selected) return Response.json({ error: "Selecione entre 1 e 9 catálogos disponíveis, sem repetições." }, { status: 400 });
  try {
    if (!(await consumeRateLimit(hashToken(`catalog-pdf:${user.username}`), 20, 5)))
      return Response.json({ error: "Muitos downloads em sequência. Aguarde alguns minutos." }, { status: 429, headers: { "Retry-After": "300" } });
    const files = await Promise.all(selected.map(async catalog => ({
      name: catalog.file,
      data: await fs.readFile(path.join(process.cwd(), "assets", "machine-catalogs", catalog.file)),
    })));
    const single = files.length === 1;
    const data = single ? files[0].data : buildCatalogZip(files);
    let offset = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= data.length) { controller.close(); return; }
        const end = Math.min(offset + 64 * 1024, data.length);
        controller.enqueue(new Uint8Array(data.subarray(offset, end)));
        offset = end;
      },
    });
    return new Response(stream, { headers: {
      "Content-Type": single ? "application/pdf" : "application/zip",
      "Content-Disposition": `attachment; filename="${single ? files[0].name : "tiger-tech-catalogos.zip"}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    console.error("Falha ao baixar catálogos", error);
    return Response.json({ error: "Não foi possível baixar os catálogos. Tente novamente." }, { status: 500 });
  }
}
