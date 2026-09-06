import { isTrustedMutation, requireUser, verifyAdminPassword } from "../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../lib/db";
export async function GET() {
  if (!(await requireUser()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  await ensureDb();
  return Response.json(
    (await sql()`SELECT name FROM categories ORDER BY name`).map((r) => r.name),
  );
}
export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  const user = await requireUser();
  if (!user)
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { name, adminPassword } = await req.json();
  if (user.role === "operator" && !(await verifyAdminPassword(String(adminPassword || ""))))
    return Response.json({ error: "Senha do administrador necessária." }, { status: 403 });
  const safeName = String(name || "").trim().slice(0, 80);
  if (!safeName)
    return Response.json({ error: "Informe a categoria" }, { status: 400 });
  await ensureDb();
  await sql()`INSERT INTO categories(name) VALUES(${safeName}) ON CONFLICT DO NOTHING`;
  return Response.json({ ok: true });
}
