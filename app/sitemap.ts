import type { MetadataRoute } from "next";
import { getCachedPublicCatalogProducts } from "../lib/public-data";
import { absoluteUrl } from "../lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produtos"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/impressoras-3d"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/filamentos"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/acessorios-impressora-3d"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/snapmaker-u1"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/sobre"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/envio"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/pagamento"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/garantia"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/trocas-e-devolucoes"), changeFrequency: "monthly", priority: 0.3 },
  ];
  const products = await getCachedPublicCatalogProducts();
  return [
    ...staticPages,
    ...products.map((product) => ({
      url: absoluteUrl(`/produto/${product.slug}`),
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
