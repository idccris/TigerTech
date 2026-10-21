export type HeroSlide = {
  id: string;
  title: string;
  highlight: string;
};

export type HeroSlideshowContent = { slides: HeroSlide[] };

export const defaultHeroSlideshowContent: HeroSlideshowContent = {
  slides: [{ id: "banner-principal", title: "MAIS QUE IMPRESSÃO 3D.", highlight: "POSSIBILIDADES." }],
};

export function safeHeroSlideId(value: unknown, fallback = "banner") {
  const id = String(value || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return id || fallback;
}

export function blankHeroSlide(index = 0): HeroSlide {
  return { id: `banner-${Date.now()}-${index}`, title: "Novo banner", highlight: "" };
}

export function parseHeroSlideshowContent(value: string): HeroSlideshowContent {
  try {
    const parsed = JSON.parse(value || "{}");
    if (!Array.isArray(parsed?.slides) || parsed.slides.length === 0) return defaultHeroSlideshowContent;
    return { slides: parsed.slides.slice(0, 10).map((item: Partial<HeroSlide>, index: number) => ({
      id: safeHeroSlideId(item.id, `banner-${index + 1}`),
      title: String(item.title || "").slice(0, 100),
      highlight: String(item.highlight || "").slice(0, 100),
    })) };
  } catch {
    return defaultHeroSlideshowContent;
  }
}

export function heroSlideImageKey(id: string) {
  return `hero_slideshow_image_${safeHeroSlideId(id)}`;
}
