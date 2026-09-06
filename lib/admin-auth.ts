import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { ensureDb, sql } from "./db";
export const sessionCookieName =
  process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";
export const hashToken = (v: string) =>
  createHash("sha256").update(v).digest("hex");
export async function createSession(username: string) {
  await ensureDb();
  const token = randomBytes(32).toString("hex");
  await sql()`INSERT INTO admin_sessions(token_hash,username,expires_at) VALUES(${hashToken(token)},${username},NOW()+INTERVAL '7 days')`;
  return token;
}
export async function requireAdmin() {
  const user = await requireUser();
  return user?.role === "admin" ? user.username : null;
}
export type AdminUser = {
  username: string;
  displayName: string;
  role: "admin" | "operator";
};
export async function requireUser(): Promise<AdminUser | null> {
  await ensureDb();
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;
  const rows =
    await sql()`SELECT a.username,a.display_name,a.role FROM admin_sessions s JOIN admins a ON a.username=s.username WHERE s.token_hash=${hashToken(token)} AND s.expires_at>NOW() AND a.active=true`;
  if (!rows[0]) return null;
  return {
    username: String(rows[0].username),
    displayName: String(rows[0].display_name || rows[0].username),
    role: rows[0].role === "operator" ? "operator" : "admin",
  };
}
export async function verifyAdminPassword(password: string) {
  await ensureDb();
  if (!password) return false;
  const rows =
    await sql()`SELECT password_hash FROM admins WHERE role='admin' AND active=true`;
  return rows.some((row) => bcrypt.compareSync(password, String(row.password_hash)));
}

export function requestFingerprint(req: Request, discriminator = "") {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  return hashToken(`${ip}:${discriminator.toLowerCase().trim()}`);
}

export async function consumeRateLimit(
  keyHash: string,
  limit: number,
  windowMinutes: number,
) {
  await ensureDb();
  const interval = `${Math.max(1, Math.floor(windowMinutes))} minutes`;
  const rows = await sql()`INSERT INTO security_rate_limits(key_hash,attempt_count,window_started_at)
    VALUES(${keyHash},1,NOW())
    ON CONFLICT(key_hash) DO UPDATE SET
      attempt_count=CASE WHEN security_rate_limits.window_started_at<NOW()-${interval}::interval THEN 1 ELSE security_rate_limits.attempt_count+1 END,
      window_started_at=CASE WHEN security_rate_limits.window_started_at<NOW()-${interval}::interval THEN NOW() ELSE security_rate_limits.window_started_at END
    RETURNING attempt_count`;
  return Number(rows[0]?.attempt_count || 0) <= limit;
}

export async function clearRateLimit(keyHash: string) {
  await ensureDb();
  await sql()`DELETE FROM security_rate_limits WHERE key_hash=${keyHash}`;
}

export function isTrustedMutation(req: Request) {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}
