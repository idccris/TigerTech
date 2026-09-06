const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "catalogo-nova.vercel.app";

export const siteUrl = (
  configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}

export function seoDescription(value: string, maxLength = 160) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > maxLength
    ? `${clean.slice(0, maxLength - 1).trimEnd()}…`
    : clean;
}
