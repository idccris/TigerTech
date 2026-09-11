import catalog from "../data/filaments-catalog.json";

type SourceColor = {
  name: string;
  image?: string;
};

type SourceCard = {
  brand: string;
  material: string;
  model: string;
  description: string;
  colors: SourceColor[];
};

export const FILAMENT_CATALOG_VERSION = "3dtouch-filaments-2026-09-11-v1";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const colorHex = (name: string) => {
  const value = name.toLowerCase();
  const colors: Array<[RegExp, string]> = [
    [/black|charcoal|onyx|preto/, "#202124"],
    [/white|ivory|bone|jade white|branco/, "#f3f1e9"],
    [/gray|grey|silver|slate|nardo|cinza/, "#85898d"],
    [/red|scarlet|crimson|maroon|burgundy|vermelho/, "#b9363e"],
    [/orange|tangerine|apricot|terracotta|laranja/, "#e87932"],
    [/yellow|gold|champagne|amarelo/, "#dfba42"],
    [/green|lime|olive|matcha|mint|verde/, "#4f8a5b"],
    [/cyan|turquoise|teal|azure/, "#3ba5a8"],
    [/blue|azul|indigo/, "#426eae"],
    [/purple|violet|lilac|plum|magenta|lavender|roxo/, "#8059a6"],
    [/pink|rose|rosa/, "#dc7d9f"],
    [/brown|cocoa|chocolate|walnut|wood|birch|oak|bronze|copper|caramel|clay|sand|beige|tan|marble/, "#9a7457"],
    [/clear|transparent|translucent/, "#d9e4e8"],
  ];
  return colors.find(([pattern]) => pattern.test(value))?.[1] || "#777777";
};

export type FilamentCatalogRow = {
  slug: string;
  group_slug: string;
  sku: string;
  name: string;
  filament_model: string;
  color_name: string;
  color_hex: string;
  category: string;
  tag: string;
  brand: string;
  description: string;
  long_description: string;
  specifications_text: string;
  specs: string[];
  benefits: { icon: string; title: string; text: string }[];
  tone: string;
  image_url: string;
};

export function filamentCatalogRows(): FilamentCatalogRow[] {
  const rows: FilamentCatalogRow[] = [];
  for (const card of catalog.cards as SourceCard[]) {
    card.colors.forEach((color, colorIndex) => {
      const identity = `${normalize(card.brand)}-${normalize(card.model)}-${normalize(color.name)}`;
      rows.push({
        slug: `fil-${identity}-${String(colorIndex + 1).padStart(2, "0")}`,
        group_slug: `filamento-${normalize(card.brand)}-${normalize(card.model)}`,
        sku: `FIL-${normalize(card.brand).slice(0, 3).toUpperCase()}-${String(rows.length + 1).padStart(4, "0")}`,
        name: `${card.brand} ${card.model}`,
        filament_model: card.model.replace(/\s+/g, " ").trim(),
        color_name: color.name,
        color_hex: colorHex(color.name),
        category: "Filamentos",
        tag: card.brand,
        brand: card.brand,
        description: card.description,
        long_description: card.description,
        specifications_text: `Marca: ${card.brand}\nMaterial: ${card.material}\nModelo: ${card.model}\nCor: ${color.name}`,
        specs: [card.material, card.brand, color.name],
        benefits: [
          { icon: "✦", title: "Acabamento", text: `Cor ${color.name} para projetos com identidade visual.` },
          { icon: "◆", title: "Material", text: `${card.material} selecionado para impressão 3D.` },
          { icon: "✓", title: "Variedade", text: `${card.colors.length} ${card.colors.length === 1 ? "cor disponível" : "cores disponíveis"} nesta linha.` },
        ],
        tone: "orange",
        image_url: color.image || "",
      });
    });
  }
  return rows;
}
