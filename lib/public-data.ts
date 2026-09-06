import { unstable_cache } from "next/cache";
import {
  findProduct,
  getSiteSetting,
  getSiteSettingMeta,
  listFeaturedProducts,
  listProducts,
} from "./db";
import { defaultHomeContent, parseHomeContent } from "./site-content";
import type { Product } from "./products";

function publicProduct(product: Product) {
  return {
    ...product,
    imageUrl: product.imageUrl
      ? `/api/products/image?slug=${encodeURIComponent(product.slug)}&v=${encodeURIComponent(product.updatedAt || "1")}`
      : "",
  };
}

export const getCachedHomeData = unstable_cache(
  async () => {
    if (!process.env.DATABASE_URL)
      return { products: [], heroImage: "", homeContent: defaultHomeContent };
    const [products, heroMeta, rawContent] = await Promise.all([
      listFeaturedProducts(),
      getSiteSettingMeta("hero_image"),
      getSiteSetting("home_content"),
    ]);
    const version = heroMeta?.updated_at
      ? new Date(heroMeta.updated_at).getTime()
      : 0;
    return {
      products: products.map(publicProduct),
      heroImage:
        Number(heroMeta?.size || 0) > 0
          ? `/api/settings/hero?v=${version}`
          : "",
      homeContent: parseHomeContent(rawContent),
    };
  },
  ["public-home-v1"],
  { revalidate: 3600, tags: ["catalog-products", "site-design"] },
);

export const getCachedPublicProducts = unstable_cache(
  async () =>
    process.env.DATABASE_URL
      ? (await listProducts(false)).map(publicProduct)
      : [],
  ["public-products-v1"],
  { revalidate: 3600, tags: ["catalog-products"] },
);

export const getCachedPublicProduct = unstable_cache(
  async (slug: string) => {
    if (!process.env.DATABASE_URL) return null;
    const product = await findProduct(slug);
    return product ? publicProduct(product) : null;
  },
  ["public-product-v1"],
  { revalidate: 3600, tags: ["catalog-products"] },
);
