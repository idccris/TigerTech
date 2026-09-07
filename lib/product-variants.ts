import type { Product } from "./products";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

export function isFilament(product: Pick<Product, "category">) {
  return normalize(product.category) === "filamentos";
}

export function productGroupKey(product: Product) {
  return isFilament(product) && product.filamentModel?.trim()
    ? JSON.stringify(["filament", normalize(product.brand || ""), normalize(product.filamentModel)])
    : JSON.stringify(["product", product.slug]);
}

export function productTitle(product: Product) {
  return isFilament(product) && product.filamentModel ? product.filamentModel : product.name;
}

export function cartProductName(product: Product) {
  return product.colorName && isFilament(product)
    ? `${productTitle(product)} — ${product.colorName}`
    : product.name;
}

// Keep the API's SKU rows intact; grouping is only a storefront presentation.
export function groupProducts(products: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    if (product.visible === false) continue;
    const key = productGroupKey(product);
    const group = groups.get(key) || [];
    group.push(product);
    groups.set(key, group);
  }
  return Array.from(groups.values()).flatMap((group) => {
    const available = group.find((product) => (product.stock || 0) > 0);
    if (!available) return [];
    if (!isFilament(available) || !available.filamentModel) return [available];
    const variants = [...group].sort((a, b) => (a.colorName || "").localeCompare(b.colorName || "", "pt-BR"));
    return [{ ...available, variants }];
  });
}

export function productMatches(product: Product, query: string) {
  return normalize([product.name, product.filamentModel, product.description, product.category,
    ...(product.variants || [product]).map((variant) => variant.colorName)].join(" ")).includes(normalize(query));
}
