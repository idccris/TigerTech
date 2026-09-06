import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { clearRateLimit, consumeRateLimit, createSession, isTrustedMutation, requestFingerprint, sessionCookieName } from "../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../lib/db";
export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req))
      return Response.json({ error: "Origem não autorizada" }, { status: 403 });
    const { username, password } = await req.json();
    const normalizedUsername = String(username || "").trim();
    const limitKey = requestFingerprint(req, `login:${normalizedUsername}`);
    if (!(await consumeRateLimit(limitKey, 5, 15)))
      return Response.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429, headers: { "Retry-After": "900" } });
    await ensureDb();
    const rows =
      await sql()`SELECT username,password_hash,role,active FROM admins WHERE LOWER(username)=LOWER(${normalizedUsername}) LIMIT 1`;
    const hash = String(rows[0]?.password_hash || "$2b$12$C6UzMDM.H6dfI/f/IKcEe.1AdH0oxzFql5N8/BMML2HVUWSQbSvKm");
    if (!rows[0] || rows[0].active === false || !(await bcrypt.compare(String(password || ""), hash)))
      return Response.json(
        { error: "Usuário ou senha inválidos" },
        { status: 401 },
      );
    await clearRateLimit(limitKey);
    const token = await createSession(String(rows[0].username));
    (await cookies()).set(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 604800,
      priority: "high",
    });
    return Response.json({ ok: true, role: rows[0].role });
  } catch (e) {
    console.error("Admin login failed", e);
    return Response.json({ error: "Não foi possível entrar agora." }, { status: 503 });
  }
}
