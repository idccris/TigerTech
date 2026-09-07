import { unstable_cache } from "next/cache";
import {
  findProduct,
  getSiteSetting,
  getSiteSettingMeta,
  listFeaturedProducts,
  listProducts,
} from "./db";
import { defaultHomeContent, parseHomeContent } from "./site-content";
import { defaultSlideshowContent, parseSlideshowContent } from "./slideshow-content";
import type { Product } from "./products";
import { isFilament, productGroupKey } from "./product-variants";

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
      return { products: [], heroImage: "", homeContent: defaultHomeContent, slideshowContent: defaultSlideshowContent, slideshowImages: defaultSlideshowContent.slides.map((slide) => slide.defaultImage) };
    const [products, heroMeta, rawContent, rawSlideshowContent, slideOneMeta, slideTwoMeta] = await Promise.all([
      listFeaturedProducts(),
      getSiteSettingMeta("hero_image"),
      getSiteSetting("home_content"),
      getSiteSetting("slideshow_content"),
      getSiteSettingMeta("slideshow_image_1"),
      getSiteSettingMeta("slideshow_image_2"),
    ]);
    const version = heroMeta?.updated_at
      ? new Date(heroMeta.updated_at).getTime()
      : 0;
    const slideshowContent = parseSlideshowContent(rawSlideshowContent);
    return {
      products: products.map(publicProduct),
      heroImage:
        Number(heroMeta?.size || 0) > 0
          ? `/api/settings/hero?v=${version}`
          : "",
      homeContent: parseHomeContent(rawContent),
      slideshowContent,
      slideshowImages: [slideOneMeta, slideTwoMeta].map((meta, index) => {
        if (Number(meta?.size || 0) <= 0) return slideshowContent.slides[index].defaultImage;
        const imageVersion = meta?.updated_at ? new Date(meta.updated_at).getTime() : 0;
        return `/api/settings/slideshow/${index + 1}?v=${imageVersion}`;
      }),
    };
  },
  ["public-home-variants-v2"],
  { revalidate: 3600, tags: ["catalog-products", "site-design"] },
);

export const getCachedPublicProducts = unstable_cache(
  async () =>
    process.env.DATABASE_URL
      ? (await listProducts(false)).map(publicProduct)
      : [],
  ["public-products-variants-v2"],
  { revalidate: 3600, tags: ["catalog-products"] },
);

export const getCachedPublicProduct = unstable_cache(
  async (slug: string) => {
    if (!process.env.DATABASE_URL) return null;
    const product = await findProduct(slug);
    if (!product) return null;
    if (isFilament(product) && product.filamentModel) {
      const variants = (await listProducts(false))
        .filter((variant) => productGroupKey(variant) === productGroupKey(product))
        .sort((a, b) => (a.colorName || "").localeCompare(b.colorName || "", "pt-BR"));
      return { ...publicProduct(product), variants: variants.map(publicProduct) };
    }
    return publicProduct(product);
  },
  ["public-product-variants-v2"],
  { revalidate: 3600, tags: ["catalog-products"] },
);
