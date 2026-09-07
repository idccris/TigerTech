export type SlideshowSlide = {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  defaultImage: string;
};

export type SlideshowContent = {
  slides: [SlideshowSlide, SlideshowSlide];
};

export const defaultSlideshowContent: SlideshowContent = {
  slides: [
    {
      eyebrow: "SNAPMAKER U1",
      title: "Quatro cabeçotes. Menos desperdício.",
      description:
        "Impressão 3D multicolor e multimaterial com trocas automáticas em cerca de 5 segundos e velocidade de até 500 mm/s.",
      buttonLabel: "Conheça a U1",
      href: "/snapmaker-u1",
      defaultImage: "/snapmaker-u1/u1-studio.webp",
    },
    {
      eyebrow: "BAMBU LAB A1",
      title: "Grande volume. Simples desde o primeiro projeto.",
      description:
        "Área de impressão de 256 × 256 × 256 mm, velocidade de até 500 mm/s e calibrações automáticas para produzir com facilidade.",
      buttonLabel: "Conheça a A1",
      href: "/produto/sku-0004",
      defaultImage: "/api/products/image?slug=sku-0004",
    },
  ],
};

export function parseSlideshowContent(value: string): SlideshowContent {
  try {
    const parsed = JSON.parse(value || "{}");
    return {
      slides: defaultSlideshowContent.slides.map((fallback, index) => ({
        ...fallback,
        ...(parsed?.slides?.[index] || {}),
        defaultImage: fallback.defaultImage,
      })) as SlideshowContent["slides"],
    };
  } catch {
    return defaultSlideshowContent;
  }
}
