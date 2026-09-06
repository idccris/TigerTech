import type { MetadataRoute } from "next";
import { getCachedPublicProducts } from "../lib/public-data";
import { absoluteUrl } from "../lib/seo";

export const revalidate = 3600;

const staticPages = [
  "/",
  "/produtos",
  "/sobre",
  "/seguranca",
  "/envio",
  "/pagamento",
  "/garantia",
  "/politica-de-privacidade",
  "/trocas-e-devolucoes",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Awaited<ReturnType<typeof getCachedPublicProducts>> = [];
  try {
    products = await getCachedPublicProducts();
  } catch {
    // O sitemap das páginas institucionais continua disponível se o catálogo falhar.
  }

  return [
    ...staticPages.map((path, index) => ({
      url: absoluteUrl(path),
      changeFrequency: index < 2 ? ("weekly" as const) : ("monthly" as const),
      priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.6,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/produto/${product.slug}`),
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
