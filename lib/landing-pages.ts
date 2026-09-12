import { blankSnapmakerU1Content, sanitizeSnapmakerU1Content, type SnapmakerU1Content } from "./snapmaker-content";

export type LandingPageRecord = {
  id: string;
  name: string;
  slug: string;
  productSlug: string;
  content: SnapmakerU1Content;
};

export function safeLandingSlug(value: unknown, fallback = "landing-page") {
  const slug = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return slug || fallback;
}

export function blankLandingPage(index = 0): LandingPageRecord {
  const stamp = Date.now();
  return { id: `lp-${stamp}-${index}`, name: "Nova Landing Page", slug: `nova-landing-page-${stamp}`, productSlug: "", content: blankSnapmakerU1Content() };
}

export function sanitizeLandingPages(value: unknown): LandingPageRecord[] {
  if (!Array.isArray(value)) return [];
  const used = new Set<string>();
  return value.slice(0, 20).map((item: any, index) => {
    let slug = safeLandingSlug(item?.slug, `landing-page-${index + 1}`);
    if (used.has(slug)) slug = `${slug}-${index + 1}`;
    used.add(slug);
    return {
      id: safeLandingSlug(item?.id, `lp-${index + 1}`),
      name: String(item?.name || `Landing Page ${index + 1}`).trim().slice(0, 100),
      slug,
      productSlug: safeLandingSlug(item?.productSlug, "").slice(0, 100),
      content: sanitizeSnapmakerU1Content(item?.content),
    };
  });
}

export function parseLandingPages(value: string): LandingPageRecord[] {
  try { return sanitizeLandingPages(JSON.parse(value || "[]")); }
  catch { return []; }
}
