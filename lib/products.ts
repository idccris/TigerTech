export type Product = {
  slug: string;
  name: string;
  category: "Impressoras 3D" | "Filamentos" | "Acessórios";
  tag: string;
  description: string;
  longDescription: string;
  specificationsText?: string;
  specs: string[];
  benefits: { icon: string; title: string; text: string }[];
  tone: string;
  sku?: string;
  brand?: string;
  imageUrl?: string;
  imageUrls?: string[];
  featured?: boolean;
  priceCents?: number;
  cardPriceCents?: number;
  featuredAt?: string;
  updatedAt?: string;
  stock?: number;
  visible?: boolean;
  filamentModel?: string;
  groupSlug?: string;
  colorName?: string;
  colorHex?: string;
  variants?: Product[];
  selectedVariantSlug?: string;
};

const standardBenefits = [
  {
    icon: "✦",
    title: "Qualidade na impressão",
    text: "Resultados consistentes e ótimo acabamento.",
  },
  {
    icon: "⚡",
    title: "Uso simplificado",
    text: "Tecnologia intuitiva para produzir com facilidade.",
  },
  {
    icon: "✓",
    title: "Suporte especializado",
    text: "Orientação para aproveitar melhor o equipamento.",
  },
];

export const products: Product[] = [
  {
    slug: "nova-x1-pro",
    name: "NOVA X1 Pro",
    category: "Impressoras 3D",
    tag: "Mais vendida",
    description: "Alta velocidade, precisão profissional e operação intuitiva.",
    longDescription:
      "Desenvolvida para quem busca velocidade e acabamento profissional, a NOVA X1 Pro combina automação inteligente, impressão multicolorida e operação simples em uma solução completa.",
    specs: ["600 mm/s", "Auto calibração", "Multicolor"],
    benefits: standardBenefits,
    tone: "violet",
  },
  {
    slug: "nova-a1",
    name: "NOVA A1",
    category: "Impressoras 3D",
    tag: "Custo-benefício",
    description: "Impressão confiável para começar ou ampliar sua produção.",
    longDescription:
      "Uma impressora versátil e confiável, pensada para transformar ideias em peças com agilidade, baixo ruído e excelente facilidade de uso.",
    specs: ["500 mm/s", "Silenciosa", "Fácil de usar"],
    benefits: standardBenefits,
    tone: "blue",
  },
  {
    slug: "nova-mini",
    name: "NOVA Mini",
    category: "Impressoras 3D",
    tag: "Compacta",
    description:
      "Tecnologia completa em um formato ideal para qualquer espaço.",
    longDescription:
      "Compacta por fora e surpreendente na produção. A NOVA Mini oferece uma experiência simples e conectada para projetos criativos do dia a dia.",
    specs: ["Área 180 mm", "Wi-Fi", "Plug & print"],
    benefits: standardBenefits,
    tone: "orange",
  },
  {
    slug: "pla-essential",
    name: "PLA Essential",
    category: "Filamentos",
    tag: "Novidade",
    description: "Acabamento uniforme, cores vivas e excelente estabilidade.",
    longDescription:
      "Filamento confiável para uso cotidiano, com alimentação estável, boa aderência entre camadas e acabamento uniforme em diferentes tipos de projeto.",
    specs: ["1 kg", "1,75 mm", "Baixo odor"],
    benefits: standardBenefits,
    tone: "mint",
  },
  {
    slug: "pla-silk-duo",
    name: "PLA Silk Duo",
    category: "Filamentos",
    tag: "Efeito especial",
    description: "Duas cores e brilho sedoso para peças que chamam atenção.",
    longDescription:
      "Crie peças decorativas marcantes com transição bicolor e acabamento sedoso, mantendo a praticidade de impressão do PLA.",
    specs: ["1 kg", "Bicolor", "Alto brilho"],
    benefits: standardBenefits,
    tone: "pink",
  },
  {
    slug: "kit-maker-pro",
    name: "Kit Maker Pro",
    category: "Acessórios",
    tag: "Essencial",
    description: "Ferramentas selecionadas para acabamento e manutenção.",
    longDescription:
      "Um conjunto prático para manutenção, remoção de suportes e acabamento de peças, organizado em estojo rígido para acompanhar sua rotina.",
    specs: ["12 peças", "Estojo rígido", "Uso diário"],
    benefits: standardBenefits,
    tone: "slate",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
