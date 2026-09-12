export type SnapmakerHighlight = {
  title: string;
  text: string;
};

export type SnapmakerU1Content = {
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroPrimaryButton: string;
  heroSecondaryButton: string;
  statOneValue: string;
  statOneLabel: string;
  statTwoValue: string;
  statTwoLabel: string;
  statThreeValue: string;
  statThreeLabel: string;
  technologyEyebrow: string;
  technologyTitle: string;
  highlights: SnapmakerHighlight[];
  swapEyebrow: string;
  swapTitle: string;
  swapDescription: string;
  swapMetricValue: string;
  swapMetricLabel: string;
  precisionEyebrow: string;
  precisionTitle: string;
  precisionDescription: string;
  materials: string[];
  detectionEyebrow: string;
  detectionTitle: string;
  detectionDescription: string;
  detectionItems: string[];
  offerEyebrow: string;
  offerDescription: string;
  offerCategory: string;
  finalEyebrow: string;
  finalTitle: string;
  finalDescription: string;
  finalButton: string;
  whatsappUrl: string;
};

export const defaultSnapmakerU1Content: SnapmakerU1Content = {
  heroEyebrow: "SNAPMAKER U1",
  heroTitle: "Quatro cabeçotes.",
  heroHighlight: "Zero limites.",
  heroDescription: "Impressão 3D multicolor e multimaterial com trocas rápidas, menos purga e a precisão que seus projetos exigem.",
  heroPrimaryButton: "Conheça a tecnologia",
  heroSecondaryButton: "Fale conosco",
  statOneValue: "~5 s",
  statOneLabel: "troca de cabeçote",
  statTwoValue: "4",
  statTwoLabel: "cabeçotes independentes",
  statThreeValue: "500 mm/s",
  statThreeLabel: "velocidade de impressão",
  technologyEyebrow: "TECNOLOGIA QUE MUDA O PROCESSO",
  technologyTitle: "Mais cores. Mais materiais. Menos espera.",
  highlights: [
    { title: "Sistema SnapSwap™", text: "Quatro cabeçotes pré-aquecidos alternam automaticamente em cerca de 5 segundos." },
    { title: "Mínimo desperdício", text: "As cores mudam pela troca de cabeçote, reduzindo drasticamente a necessidade de purga." },
    { title: "CoreXY de alta velocidade", text: "Estrutura precisa com eixo em fibra de carbono e velocidade de impressão de até 500 mm/s." },
    { title: "Multimaterial de verdade", text: "Combine materiais rígidos, flexíveis e suportes solúveis em uma mesma peça." },
  ],
  swapEyebrow: "TROCA INTELIGENTE DE FERRAMENTAS",
  swapTitle: "Uma cor em cada cabeçote. Sem purga a cada troca.",
  swapDescription: "Em sistemas convencionais, um único bico precisa descarregar o material anterior antes de receber a próxima cor. A U1 alterna entre quatro extrusores independentes, mantendo cada filamento pronto para entrar em ação.",
  swapMetricValue: "Até 50%",
  swapMetricLabel: "mais rápida em impressões multicoloridas",
  precisionEyebrow: "PRECISÃO ABSOLUTA",
  precisionTitle: "Encaixe preciso. Estabilidade em cada camada.",
  precisionDescription: "Acoplamentos cinemáticos com esferas de aço posicionam e travam cada cabeçote com alta precisão. Cada troca acontece de forma rápida e confiável, preservando o alinhamento e a qualidade do acabamento.",
  materials: ["PLA", "PETG", "TPU", "ABS", "ASA", "PC", "PA", "PVA"],
  detectionEyebrow: "IMPRESSÃO MAIS CONFIÁVEL",
  detectionTitle: "Detecção automática de erros.",
  detectionDescription: "Sensores monitoram a troca da cabeça de ferramenta, a presença de filamento e a extrusão. Quando algo foge do esperado, a U1 pausa o processo para proteger a peça e evitar desperdícios.",
  detectionItems: ["Detecção de troca incorreta do cabeçote", "Detecção de falta de filamento", "Detecção de impressão sem material"],
  offerEyebrow: "COMPRE A SNAPMAKER U1",
  offerDescription: "Leve a tecnologia de quatro cabeçotes para a sua produção.",
  offerCategory: "IMPRESSORA 3D MULTICOLOR",
  finalEyebrow: "SNAPMAKER U1",
  finalTitle: "Pronto para imprimir sem limitar suas ideias?",
  finalDescription: "Converse com a Tiger Tech e conheça todos os detalhes da nova experiência multicolor da Snapmaker.",
  finalButton: "Quero conhecer a U1",
  whatsappUrl: "https://wa.me/5541992133804?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20melhor%20a%20Snapmaker%20U1",
};

const textLimits: Record<Exclude<keyof SnapmakerU1Content, "highlights" | "materials" | "detectionItems">, number> = {
  heroEyebrow: 60,
  heroTitle: 100,
  heroHighlight: 100,
  heroDescription: 320,
  heroPrimaryButton: 50,
  heroSecondaryButton: 50,
  statOneValue: 30,
  statOneLabel: 70,
  statTwoValue: 30,
  statTwoLabel: 70,
  statThreeValue: 30,
  statThreeLabel: 70,
  technologyEyebrow: 80,
  technologyTitle: 140,
  swapEyebrow: 80,
  swapTitle: 140,
  swapDescription: 600,
  swapMetricValue: 40,
  swapMetricLabel: 100,
  precisionEyebrow: 80,
  precisionTitle: 140,
  precisionDescription: 600,
  detectionEyebrow: 80,
  detectionTitle: 140,
  detectionDescription: 600,
  offerEyebrow: 80,
  offerDescription: 180,
  offerCategory: 80,
  finalEyebrow: 60,
  finalTitle: 160,
  finalDescription: 400,
  finalButton: 60,
  whatsappUrl: 500,
};

export function sanitizeSnapmakerU1Content(value: unknown): SnapmakerU1Content {
  const source = value && typeof value === "object" ? value as Partial<SnapmakerU1Content> : {};
  const text = Object.fromEntries(Object.entries(textLimits).map(([key, limit]) => {
    const typedKey = key as keyof typeof textLimits;
    return [key, String(source[typedKey] ?? defaultSnapmakerU1Content[typedKey]).trim().slice(0, limit)];
  }));
  const highlights = Array.from({ length: 4 }, (_, index) => ({
    title: String(source.highlights?.[index]?.title ?? defaultSnapmakerU1Content.highlights[index].title).trim().slice(0, 100),
    text: String(source.highlights?.[index]?.text ?? defaultSnapmakerU1Content.highlights[index].text).trim().slice(0, 320),
  }));
  const list = (items: unknown, fallback: string[], limit: number) =>
    (Array.isArray(items) ? items : fallback).slice(0, limit).map((item) => String(item).trim().slice(0, 100)).filter(Boolean);
  const whatsappUrl = /^(https:\/\/wa\.me\/|https:\/\/api\.whatsapp\.com\/)/.test(String(text.whatsappUrl))
    ? String(text.whatsappUrl)
    : defaultSnapmakerU1Content.whatsappUrl;
  return {
    ...defaultSnapmakerU1Content,
    ...text,
    whatsappUrl,
    highlights,
    materials: list(source.materials, defaultSnapmakerU1Content.materials, 12),
    detectionItems: list(source.detectionItems, defaultSnapmakerU1Content.detectionItems, 6),
  } as SnapmakerU1Content;
}

export function parseSnapmakerU1Content(value: string): SnapmakerU1Content {
  try {
    return sanitizeSnapmakerU1Content(JSON.parse(value || "{}"));
  } catch {
    return defaultSnapmakerU1Content;
  }
}
