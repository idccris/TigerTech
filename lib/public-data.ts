import { unstable_cache } from "next/cache";
import {
  findProduct,
  getSiteSetting,
  getSiteSettingMeta,
  listFeaturedProducts,
  listProducts,
} from "./db";
import { defaultHomeContent, parseHomeContent } from "./site-content";
import { defaultSlideshowContent, legacySlideshowImageKey, parseSlideshowContent, slideshowImageKey } from "./slideshow-content";
import { defaultSnapmakerU1Content, parseSnapmakerU1Content } from "./snapmaker-content";
import { parseLandingPages } from "./landing-pages";
import type { Product } from "./products";
import { groupProducts } from "./product-variants";
import { storefrontProductImage } from "./product-images";

function publicProduct(product: Product) {
  return {
    ...product,
    imageUrl: storefrontProductImage(product),
  };
}

// Cards share their commercial copy and specifications. Keep only the fields
// that actually change per color so hundreds of variants are not serialized
// with the same long content on every storefront request.
function publicVariant(product: Product) {
  return {
    slug: product.slug,
    sku: product.sku,
    imageUrl: storefrontProductImage(product),
    priceCents: product.priceCents,
    cardPriceCents: product.cardPriceCents,
    stock: product.stock,
    colorName: product.colorName,
    colorHex: product.colorHex,
  } as Product;
}

export function publicCatalogProducts(products: Product[]) {
  return groupProducts(products).map((product) => ({
    ...publicProduct(product),
    variants: product.variants?.map(publicVariant),
  }));
}

export const getCachedHomeData = unstable_cache(
  async () => {
    if (!process.env.DATABASE_URL)
      return { products: [], heroImage: "", homeContent: defaultHomeContent, slideshowContent: defaultSlideshowContent, slideshowImages: defaultSlideshowContent.slides.map((slide) => slide.defaultImage) };
    const [products, heroMeta, rawContent, rawSlideshowContent] = await Promise.all([
      listFeaturedProducts(),
      getSiteSettingMeta("hero_image"),
      getSiteSetting("home_content"),
      getSiteSetting("slideshow_content"),
    ]);
    const version = heroMeta?.updated_at
      ? new Date(heroMeta.updated_at).getTime()
      : 0;
    const slideshowContent = parseSlideshowContent(rawSlideshowContent);
    const slideshowMetas = await Promise.all(slideshowContent.slides.map(async (slide) => {
      const meta = await getSiteSettingMeta(slideshowImageKey(slide.id));
      const legacyKey = legacySlideshowImageKey(slide.id);
      return meta || (legacyKey ? getSiteSettingMeta(legacyKey) : null);
    }));
    return {
      products: products.map(publicProduct),
      heroImage:
        Number(heroMeta?.size || 0) > 0
          ? `/api/settings/hero?v=${version}`
          : "",
      homeContent: parseHomeContent(rawContent),
      slideshowContent,
      slideshowImages: slideshowMetas.map((meta, index) => {
        if (Number(meta?.size || 0) <= 0) return slideshowContent.slides[index].defaultImage;
        const imageVersion = meta?.updated_at ? new Date(meta.updated_at).getTime() : 0;
        return `/api/settings/slideshow/${slideshowContent.slides[index].id}?v=${imageVersion}`;
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

export const getCachedPublicCatalogProducts = unstable_cache(
  async () =>
    process.env.DATABASE_URL
      ? publicCatalogProducts(await listProducts(false))
      : [],
  ["public-catalog-products-v1"],
  { revalidate: 3600, tags: ["catalog-products"] },
);

export const getCachedPublicProduct = unstable_cache(
  async (slug: string) => {
    if (!process.env.DATABASE_URL) return null;
    const product = await findProduct(slug);
    if (!product) return null;
    return {
      ...publicProduct(product),
      variants: product.variants?.map(publicVariant),
    };
  },
  ["public-product-groups-v1"],
  { revalidate: 3600, tags: ["catalog-products"] },
);

export const getCachedSnapmakerU1Content = unstable_cache(
  async () => process.env.DATABASE_URL
    ? parseSnapmakerU1Content(await getSiteSetting("snapmaker_u1_content"))
    : defaultSnapmakerU1Content,
  ["snapmaker-u1-content-v1"],
  { revalidate: 3600, tags: ["site-design"] },
);

export const getCachedLandingPages = unstable_cache(
  async () => process.env.DATABASE_URL ? parseLandingPages(await getSiteSetting("landing_pages")) : [],
  ["landing-pages-v1"],
  { revalidate: 3600, tags: ["site-design"] },
);
