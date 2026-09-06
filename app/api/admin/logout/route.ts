import { cookies } from "next/headers";
import { hashToken, isTrustedMutation, sessionCookieName } from "../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../lib/db";

export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return Response.json({ error: "Origem não autorizada" }, { status: 403 });
  await ensureDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) await sql()`DELETE FROM admin_sessions WHERE token_hash=${hashToken(token)}`;
  cookieStore.set(sessionCookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return Response.json({ ok: true });
}
