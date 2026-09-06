import { requireUser } from "../../../../lib/admin-auth";

export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  return Response.json(user, { headers: { "Cache-Control": "no-store" } });
}
