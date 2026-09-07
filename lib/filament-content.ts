import type { Product } from "./products";

export type FilamentContent = {
  typeName: string;
  description: string;
  longDescription: string;
  specificationsText: string;
  specs: string[];
  benefits: Product["benefits"];
};

export const defaultFilamentBenefits: Product["benefits"] = [
  { icon: "✦", title: "Qualidade na impressão", text: "Resultados consistentes e ótimo acabamento." },
  { icon: "⚡", title: "Uso simplificado", text: "Tecnologia intuitiva para produzir com facilidade." },
  { icon: "✓", title: "Suporte especializado", text: "Orientação para aproveitar melhor o material." },
];

const key = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

export function parseFilamentContents(raw: string): FilamentContent[] {
  try {
    const data = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    return data.flatMap((item): FilamentContent[] => {
      const typeName = String(item?.typeName || "").trim();
      if (!typeName) return [];
      return [{
        typeName,
        description: String(item.description || ""),
        longDescription: String(item.longDescription || ""),
        specificationsText: String(item.specificationsText || ""),
        specs: Array.isArray(item.specs) ? item.specs.map(String) : [],
        benefits: Array.isArray(item.benefits) && item.benefits.length === 3
          ? item.benefits.map((benefit: any) => ({ icon: String(benefit.icon || "✦"), title: String(benefit.title || ""), text: String(benefit.text || "") }))
          : defaultFilamentBenefits,
      }];
    });
  } catch {
    return [];
  }
}

export function completeFilamentContents(types: string[], products: Product[], stored: FilamentContent[]) {
  const saved = new Map(stored.map((content) => [key(content.typeName), content]));
  return types.map((typeName) => {
    const product = products.find((item) => key(item.filamentModel || "") === key(typeName));
    return saved.get(key(typeName)) || {
      typeName,
      description: product?.description || "",
      longDescription: product?.longDescription || "",
      specificationsText: product?.specificationsText || "",
      specs: product?.specs || [],
      benefits: product?.benefits?.length === 3 ? product.benefits : defaultFilamentBenefits,
    };
  });
}

export function applyFilamentContents(products: Product[], contents: FilamentContent[]) {
  const byType = new Map(contents.map((content) => [key(content.typeName), content]));
  return products.map((product) => {
    const content = byType.get(key(product.filamentModel || ""));
    return content ? { ...product, description: content.description, longDescription: content.longDescription, specificationsText: content.specificationsText, specs: content.specs, benefits: content.benefits } : product;
  });
}
