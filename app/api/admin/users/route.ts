import bcrypt from "bcryptjs";
import { isTrustedMutation, requireAdmin } from "../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../lib/db";

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  await ensureDb();
  const users = await sql()`SELECT username,display_name,role,active,updated_at FROM admins ORDER BY role,username`;
  return Response.json(users);
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req)) return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  if (!(await requireAdmin())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  await ensureDb();
  const body = await req.json();
  const username = String(body.username || "").trim().toLowerCase();
  const displayName = String(body.displayName || "").trim();
  const password = String(body.password || "");
  const role = body.role === "admin" ? "admin" : "operator";
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return Response.json({ error: "Usuário inválido." }, { status: 400 });
  if (password.length < 12 || !/[a-z]/i.test(password) || !/\d/.test(password)) return Response.json({ error: "Use pelo menos 12 caracteres, incluindo letras e números." }, { status: 400 });
  if (role === "admin") {
    const count = await sql()`SELECT COUNT(*)::int count FROM admins WHERE role='admin' AND active=true AND username<>${username}`;
    if (Number(count[0]?.count) >= 2) return Response.json({ error: "O limite é de 2 administradores ativos." }, { status: 409 });
  }
  const hash = await bcrypt.hash(password, 12);
  await sql()`INSERT INTO admins(username,password_hash,display_name,role,active,updated_at) VALUES(${username},${hash},${displayName},${role},true,NOW()) ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash,display_name=EXCLUDED.display_name,role=EXCLUDED.role,active=true,updated_at=NOW()`;
  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!isTrustedMutation(req)) return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  const current = await requireAdmin();
  if (!current) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { username, active } = await req.json();
  if (typeof username !== "string" || !/^[a-z0-9._-]{3,30}$/.test(username))
    return Response.json({ error: "Usuário inválido." }, { status: 400 });
  if (username === current && active === false) return Response.json({ error: "Você não pode desativar seu próprio acesso." }, { status: 400 });
  await sql()`UPDATE admins SET active=${active !== false},updated_at=NOW() WHERE username=${username}`;
  if (active === false) await sql()`DELETE FROM admin_sessions WHERE username=${username}`;
  return Response.json({ ok: true });
}
