import type { Product } from "./products";
export function appearsInStore(product: Product): boolean {
  return (product.variants || [product]).some(v => v.visible !== false && (v.stock || 0) > 0);
}
export function isFeaturedModel(product: Product): boolean {
  return (product.variants || [product]).some(v => v.featured === true);
}
export function matchesDisplayFilters(product: Product, visibility: string, featured: string): boolean {
  const shown = appearsInStore(product);
  const highlighted = shown && isFeaturedModel(product);
  return (visibility === "all" || (visibility === "shown" ? shown : !shown)) &&
    (featured === "all" || (featured === "featured" ? highlighted : !highlighted));
}
