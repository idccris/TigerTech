import type { Product } from "./products";

const ALLOWED_IMAGE_HOSTS = new Set(["store.bblcdn.com", "cdn.shopify.com"]);

export function isAllowedRemoteProductImage(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function storefrontProductImage(product: Pick<Product, "slug" | "selectedVariantSlug" | "imageUrl" | "updatedAt">) {
  const value = product.imageUrl || "";
  if (!value) return "";
  if (isAllowedRemoteProductImage(value)) return value;
  const imageSlug = product.selectedVariantSlug || product.slug;
  return `/api/products/image?slug=${encodeURIComponent(imageSlug)}&v=${encodeURIComponent(product.updatedAt || "1")}`;
}

export function storefrontProductImages(product: Pick<Product, "slug" | "selectedVariantSlug" | "imageUrl" | "imageUrls" | "updatedAt">) {
  const primary = storefrontProductImage(product);
  const additional = (product.imageUrls || []).filter((value) => value && value !== product.imageUrl);
  return [primary, ...additional].filter(Boolean).slice(0, 4);
}
