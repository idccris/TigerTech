import type { Product } from "./products";
import { groupProducts } from "./product-variants";

export type FilamentCatalogOption = {
  id: string;
  name: string;
  brand: string;
  model: string;
  colorCount: number;
  file: string;
};

export function filamentCatalogProducts(products: Product[]) {
  return groupProducts(products)
    .filter((product) => product.category === "Filamentos")
    .sort((a, b) => `${a.filamentModel} ${a.brand}`.localeCompare(`${b.filamentModel} ${b.brand}`, "pt-BR"));
}

export function filamentCatalogOptions(products: Product[]): FilamentCatalogOption[] {
  return filamentCatalogProducts(products).map((product) => {
    const model = product.filamentModel || product.name;
    const brand = product.brand || product.tag || "Tiger Tech";
    const id = product.groupSlug || product.slug;
    const colorCount = (product.variants || [product]).filter(
      (variant) => variant.visible !== false && (variant.stock || 0) > 0,
    ).length;
    return { id, model, brand, colorCount, name: `${model} ${brand}`, file: `${id}.pdf` };
  });
}

export function selectFilamentCatalogs(value: unknown, options: FilamentCatalogOption[]) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  if (!value.every((id): id is string => typeof id === "string")) return null;
  if (new Set(value).size !== value.length) return null;
  const byId = new Map(options.map((option) => [option.id, option]));
  const selected = value.map((id) => byId.get(id));
  return selected.every(Boolean) ? selected as FilamentCatalogOption[] : null;
}
