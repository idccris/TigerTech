"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../lib/products";
import { groupProducts, productGroupKey, productMatches } from "../lib/product-variants";
import ProductCard from "./product-card";
import SiteHeader, { whatsapp } from "./site-header";
import { defaultHomeContent, type HomeContent } from "../lib/site-content";
import { defaultSlideshowContent, type SlideshowContent } from "../lib/slideshow-content";
import SiteFooter from "./site-footer";

const categories = [
  "Todos",
  "Impressoras 3D",
  "Filamentos",
  "Acessórios",
] as const;

export { default as PrinterVisual } from "./printer-visual";

export default function Catalog({
  initialProducts,
  initialHeroImage,
  initialHomeContent,
  initialSlideshow,
  initialSlideshowImages,
}: {
  initialProducts: Product[];
  initialHeroImage: string;
  initialHomeContent: HomeContent;
  initialSlideshow: SlideshowContent;
  initialSlideshowImages: string[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [heroImage, setHeroImage] = useState(initialHeroImage);
  const [homeContent, setHomeContent] = useState<HomeContent>(initialHomeContent);
  const [slideshow, setSlideshow] = useState<SlideshowContent>(initialSlideshow);
  const [slideshowImages, setSlideshowImages] = useState(initialSlideshowImages);
  const [query, setQuery] = useState("");
  const [ctaSlide, setCtaSlide] = useState(0);
  const [ctaPaused, setCtaPaused] = useState(false);
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Todos");
  const featuredGridRef = useRef<HTMLDivElement>(null);
  const ctaSwipeRef = useRef<{ x: number; y: number } | null>(null);

  function startCtaSwipe(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" || !window.matchMedia("(max-width: 700px)").matches) return;
    ctaSwipeRef.current = { x: event.clientX, y: event.clientY };
    setCtaPaused(true);
  }

  function finishCtaSwipe(event: React.PointerEvent<HTMLElement>) {
    const start = ctaSwipeRef.current;
    ctaSwipeRef.current = null;
    setCtaPaused(false);
    if (!start) return;
    const distanceX = event.clientX - start.x;
    const distanceY = event.clientY - start.y;
    if (Math.abs(distanceX) < 45 || Math.abs(distanceX) <= Math.abs(distanceY) * 1.2) return;
    setCtaSlide((current) =>
      distanceX < 0
        ? (current + 1) % slideshow.slides.length
        : (current - 1 + slideshow.slides.length) % slideshow.slides.length,
    );
  }

  const filtered = useMemo(
    () =>
      groupProducts(products).filter((product) => {
        const matchesCategory =
          category === "Todos" || product.category === category;
        return matchesCategory && productMatches(product, query);
      }),
    [products, category, query],
  );
  useEffect(() => {
    const refresh = (bust = false) =>
      fetch(`/api/products?featured=true${bust ? `&t=${Date.now()}` : ""}`, {
        cache: "no-store",
      })
        .then((r) => {
          if (!r.ok) throw new Error("Falha ao carregar destaques");
          return r.json();
        })
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .catch(() => undefined);
    const onStorage = (event: StorageEvent) => {
      if (event.key === "catalog-updated") refresh(true);
    };
    const onFocus = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("catalog-updates");
      channel.onmessage = () => refresh(true);
    }
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      channel?.close();
    };
  }, []);
  useEffect(() => {
    const grid = featuredGridRef.current;
    const mobile = window.matchMedia("(max-width: 700px)");
    if (!grid || !mobile.matches || filtered.length < 2) return;

    let current = 0;
    const advance = window.setInterval(() => {
      if (!mobile.matches || document.hidden) return;
      const cards = Array.from(grid.children) as HTMLElement[];
      if (cards.length < 2) return;
      current = (current + 1) % cards.length;
      grid.scrollTo({
        left: cards[current].offsetLeft - grid.offsetLeft,
        behavior: "smooth",
      });
    }, 3800);

    const syncCurrent = () => {
      const cards = Array.from(grid.children) as HTMLElement[];
      if (!cards.length) return;
      current = cards.reduce((closest, card, index) =>
        Math.abs(card.offsetLeft - grid.offsetLeft - grid.scrollLeft) <
        Math.abs(cards[closest].offsetLeft - grid.offsetLeft - grid.scrollLeft)
          ? index
          : closest, 0);
    };
    grid.addEventListener("scrollend", syncCurrent);
    return () => {
      window.clearInterval(advance);
      grid.removeEventListener("scrollend", syncCurrent);
    };
  }, [filtered.length]);
  useEffect(() => {
    const refreshCover = (bust = false) =>
      fetch(`/api/settings${bust ? `?t=${Date.now()}` : ""}`)
        .then((response) => (response.ok ? response.json() : {}))
        .then((data: { heroImage?: string; homeContent?: HomeContent; slideshowContent?: SlideshowContent; slideshowImages?: string[] }) => {
          setHeroImage(String(data.heroImage || ""));
          setHomeContent({ ...defaultHomeContent, ...(data.homeContent || {}) });
          setSlideshow(data.slideshowContent || defaultSlideshowContent);
          setSlideshowImages(Array.isArray(data.slideshowImages) ? data.slideshowImages : defaultSlideshowContent.slides.map((slide) => slide.defaultImage));
        })
        .catch(() => setHeroImage(""));
    const onFocus = () => refreshCover();
    window.addEventListener("focus", onFocus);
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("site-settings");
      channel.onmessage = () => refreshCover(true);
    }
    return () => {
      window.removeEventListener("focus", onFocus);
      channel?.close();
    };
  }, []);
  useEffect(() => {
    if (ctaPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const interval = window.setInterval(
      () => setCtaSlide((current) => (current + 1) % slideshow.slides.length),
      6500,
    );
    return () => window.clearInterval(interval);
  }, [ctaPaused, slideshow.slides.length]);

  return (
    <main>
      <SiteHeader solid />

      <section
        className={`hero ${heroImage ? "has-cover" : ""}`}
        id="inicio"
        style={
          heroImage
            ? {
                backgroundImage: `url(${heroImage})`,
              }
            : undefined
        }
      >
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> {homeContent.eyebrow}
          </div>
          <h1>
            {homeContent.title}
            <br />
            <em>{homeContent.highlight}</em>
          </h1>
          <p>
            {homeContent.description}
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#produtos">
              {homeContent.primaryButton} <span>↓</span>
            </a>
            <a
              className="text-link"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              {homeContent.secondaryButton} ↗
            </a>
          </div>
          <div className="hero-trust">
            <div>
              <strong>{homeContent.statOneTitle}</strong>
              <span>{homeContent.statOneText}</span>
            </div>
            <div>
              <strong>{homeContent.statTwoTitle}</strong>
              <span>{homeContent.statTwoText}</span>
            </div>
            <div>
              <strong>{homeContent.statThreeTitle}</strong>
              <span>{homeContent.statThreeText}</span>
            </div>
          </div>
        </div>
        <div className="hero-art">
          <span className="floating-label label-one">
            Precisão
            <br />
            <b>profissional</b>
          </span>
          <span className="floating-label label-two">
            Pronta para
            <br />
            <b>suas ideias</b>
          </span>
        </div>
      </section>

      <section className="catalog-section" id="produtos">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PRODUTOS EM DESTAQUE</span>
            <h2>Os favoritos para criar sem limites</h2>
          </div>
          <p>
            Soluções selecionadas para quem está começando e para quem exige
            performance profissional.
          </p>
        </div>
        <div className="catalog-tools" id="categorias">
          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto..."
              aria-label="Buscar produto"
            />
          </label>
        </div>
        <div
          className="product-grid"
          ref={featuredGridRef}
          aria-label="Produtos em destaque"
        >
          {filtered.map((product) => (
            <ProductCard key={productGroupKey(product)} product={product} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty">
            <strong>Nenhum produto encontrado.</strong>
            <span>
              Tente buscar outro termo ou selecionar uma nova categoria.
            </span>
          </div>
        )}
      </section>

      <section className="about" id="sobre">
        <div>
          <span className="section-kicker light">POR QUE ESCOLHER A TIGER TECH</span>
          <h2>
            Mais que tecnologia.
            <br />
            Uma parceria para criar.
          </h2>
        </div>
        <div className="benefits">
          <article>
            <span>01</span>
            <h3>Curadoria especializada</h3>
            <p>Produtos escolhidos por quem entende de fabricação digital.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Suporte de verdade</h3>
            <p>Orientação antes, durante e depois da sua compra.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Entrega nacional</h3>
            <p>Logística eficiente e acompanhamento em todo o Brasil.</p>
          </article>
        </div>
      </section>

      <section
        className="cta-slider"
        aria-roledescription="carousel"
        aria-label="Destaques Tiger Tech"
        onPointerDown={startCtaSwipe}
        onPointerUp={finishCtaSwipe}
        onPointerCancel={() => {
          ctaSwipeRef.current = null;
          setCtaPaused(false);
        }}
        onMouseEnter={() => setCtaPaused(true)}
        onMouseLeave={() => setCtaPaused(false)}
        onFocusCapture={() => setCtaPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setCtaPaused(false);
        }}
      >
        <div className="cta-slides" aria-live="polite">
          {slideshow.slides.map((slide, index) => <article
            className={`cta-slide cta-product-slide ${index === 0 ? "cta-slide-snapmaker" : "cta-slide-a1"} ${ctaSlide === index ? "active" : ""}`}
            aria-hidden={ctaSlide !== index}
            key={slide.id}
          >
            {slideshowImages[index] || slide.defaultImage ? <Image
              className={`cta-slide-background ${index === 1 ? "cta-a1-background" : ""}`}
              src={slideshowImages[index] || slide.defaultImage}
              alt=""
              fill
              sizes="100vw"
              unoptimized
              aria-hidden="true"
            /> : null}
            <div className="cta-slide-shade" aria-hidden="true" />
            <div className="cta-slide-content">
              <span className="section-kicker">{slide.eyebrow}</span>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <Link className="primary-button" href={slide.href} tabIndex={ctaSlide === index ? 0 : -1}>
                {slide.buttonLabel} <span>↗</span>
              </Link>
            </div>
          </article>)}
        </div>

        <div className="cta-slider-controls" aria-label="Controles do slideshow">
          <button
            type="button"
            onClick={() => setCtaSlide((current) => (current - 1 + slideshow.slides.length) % slideshow.slides.length)}
            aria-label="Destaque anterior"
          >
            ←
          </button>
          {slideshow.slides.map((item, slide) => (
            <button
              type="button"
              key={item.id}
              className={ctaSlide === slide ? "active" : ""}
              onClick={() => setCtaSlide(slide)}
              aria-label={`Mostrar destaque ${slide + 1}`}
              aria-current={ctaSlide === slide ? "true" : undefined}
            />
          ))}
          <button
            type="button"
            onClick={() => setCtaSlide((current) => (current + 1) % slideshow.slides.length)}
            aria-label="Próximo destaque"
          >
            →
          </button>
        </div>
      </section>
      {homeContent.faqs.length > 0 ? <section className="home-faq" id="perguntas-frequentes">
        <div className="home-faq-intro">
          <span className="section-kicker">{homeContent.faqEyebrow}</span>
          <h2>{homeContent.faqTitle}</h2>
          <p>{homeContent.faqDescription}</p>
        </div>
        <div className="home-faq-list">
          {homeContent.faqs.map((faq, index) => <details key={`${faq.question}-${index}`}>
            <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{faq.question}</strong><i aria-hidden="true">+</i></summary>
            <p>{faq.answer}</p>
          </details>)}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homeContent.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
        }).replace(/</g, "\\u003c") }} />
      </section> : null}
      <SiteFooter />
      <a
        className="whatsapp-float"
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
      >
        ✆
      </a>
    </main>
  );
}
