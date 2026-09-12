export type SlideshowSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  defaultImage: string;
};

export type SlideshowContent = {
  slides: SlideshowSlide[];
};

export const defaultSlideshowContent: SlideshowContent = {
  slides: [
    {
      id: "snapmaker-u1",
      eyebrow: "SNAPMAKER U1",
      title: "Quatro cabeçotes. Menos desperdício.",
      description:
        "Impressão 3D multicolor e multimaterial com trocas automáticas em cerca de 5 segundos e velocidade de até 500 mm/s.",
      buttonLabel: "Conheça a U1",
      href: "/snapmaker-u1",
      defaultImage: "/snapmaker-u1/u1-studio.webp",
    },
    {
      id: "bambu-lab-a1",
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
    if (!Array.isArray(parsed?.slides) || parsed.slides.length === 0)
      return defaultSlideshowContent;
    return {
      slides: parsed.slides.slice(0, 10).map((item: Partial<SlideshowSlide>, index: number) => {
        const fallback = defaultSlideshowContent.slides[index] || blankSlideshowSlide(index);
        return {
        ...fallback,
        ...item,
        id: safeSlideId(item.id, fallback.id),
        defaultImage: fallback.defaultImage,
      };
      }),
    };
  } catch {
    return defaultSlideshowContent;
  }
}

export function safeSlideId(value: unknown, fallback = "slide") {
  const id = String(value || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return id || fallback;
}

export function blankSlideshowSlide(index = 0): SlideshowSlide {
  return { id: `slide-${Date.now()}-${index}`, eyebrow: "", title: "", description: "", buttonLabel: "", href: "/", defaultImage: "" };
}

export function slideshowImageKey(id: string) {
  return `slideshow_image_${safeSlideId(id)}`;
}

export function legacySlideshowImageKey(id: string) {
  return id === "snapmaker-u1" ? "slideshow_image_1" : id === "bambu-lab-a1" ? "slideshow_image_2" : "";
}
