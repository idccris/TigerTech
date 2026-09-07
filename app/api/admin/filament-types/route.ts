import {
  isTrustedMutation,
  requireUser,
  verifyAdminPassword,
} from "../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../lib/db";

export async function GET() {
  if (!(await requireUser()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  await ensureDb();
  const rows = await sql()`SELECT name FROM filament_types ORDER BY name`;
  return Response.json(rows.map((row) => String(row.name)));
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  const user = await requireUser();
  if (!user)
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { name, adminPassword } = await req.json();
  if (
    user.role === "operator" &&
    !(await verifyAdminPassword(String(adminPassword || "")))
  )
    return Response.json(
      { error: "Informe a senha administrativa para adicionar o tipo." },
      { status: 403 },
    );
  const safeName = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("pt-BR")
    .slice(0, 80);
  if (!safeName)
    return Response.json({ error: "Informe o tipo do filamento." }, { status: 400 });
  await ensureDb();
  const existing = await sql()`SELECT name FROM filament_types WHERE LOWER(name)=LOWER(${safeName}) LIMIT 1`;
  if (existing[0]) return Response.json({ ok: true, name: existing[0].name });
  await sql()`INSERT INTO filament_types(name) VALUES(${safeName})`;
  return Response.json({ ok: true, name: safeName });
}
