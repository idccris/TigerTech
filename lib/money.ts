export function parseBRLToCents(value: unknown) {
  if (typeof value === "number") return Math.max(0, Math.round(value * 100));
  let text = String(value ?? "").trim().replace(/R\$|\s/g, "");
  if (!text) return 0;
  if (text.includes(",")) text = text.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}\.\d{4,}$/.test(text)) return Math.max(0, Number(text.replace(/\D/g, "")) || 0);
  else if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
  const amount = Number(text.replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

export function formatBRLInput(cents: number) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((Number(cents) || 0) / 100);
}
