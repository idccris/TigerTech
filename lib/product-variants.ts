import type { Product } from "./products";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function isFilament(product: Pick<Product, "category">) {
  return normalize(product.category) === "filamentos";
}

export function filamentGroupSlug(brand: string, model: string) {
  return `filamento-${slugify(brand)}-${slugify(model)}`;
}

export function productGroupKey(product: Product) {
  return isFilament(product) && product.filamentModel?.trim()
    ? product.groupSlug || JSON.stringify(["filament", normalize(product.brand || ""), normalize(product.filamentModel)])
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
    const groupSlug = available.groupSlug || filamentGroupSlug(available.brand || "", available.filamentModel);
    return [{ ...available, slug: groupSlug, groupSlug, selectedVariantSlug: available.slug, variants }];
  });
}

export function groupProductsForAdmin(products: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = productGroupKey(product);
    const group = groups.get(key) || [];
    group.push(product);
    groups.set(key, group);
  }
  return Array.from(groups.values()).map((group) => {
    const representative = group.find((product) => (product.stock || 0) > 0) || group[0];
    if (!isFilament(representative) || !representative.filamentModel) return representative;
    const variants = [...group].sort((a, b) => (a.colorName || "").localeCompare(b.colorName || "", "pt-BR"));
    const groupSlug = representative.groupSlug || filamentGroupSlug(representative.brand || "", representative.filamentModel);
    return {
      ...representative,
      slug: groupSlug,
      groupSlug,
      selectedVariantSlug: representative.slug,
      stock: variants.reduce((total, variant) => total + Math.max(0, variant.stock || 0), 0),
      visible: variants.some((variant) => variant.visible !== false),
      variants,
    };
  });
}

export function productMatches(product: Product, query: string) {
  return normalize([product.name, product.filamentModel, product.description, product.category,
    ...(product.variants || [product]).map((variant) => variant.colorName)].join(" ")).includes(normalize(query));
}
