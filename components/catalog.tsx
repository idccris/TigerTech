"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../lib/products";
import { groupProducts, productGroupKey, productMatches } from "../lib/product-variants";
import ProductCard from "./product-card";
import SiteHeader, { whatsapp } from "./site-header";
import ThemeToggle from "./theme-toggle";
import { defaultHomeContent, type HomeContent } from "../lib/site-content";
import { defaultSlideshowContent, type SlideshowContent } from "../lib/slideshow-content";
import { defaultHeroSlideshowContent, type HeroSlideshowContent } from "../lib/hero-slideshow-content";
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
  initialHeroSlideshow,
  initialHeroSlideshowImages,
  initialSlideshow,
  initialSlideshowImages,
}: {
  initialProducts: Product[];
  initialHeroImage: string;
  initialHomeContent: HomeContent;
  initialHeroSlideshow: HeroSlideshowContent;
  initialHeroSlideshowImages: string[];
  initialSlideshow: SlideshowContent;
  initialSlideshowImages: string[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [heroImage, setHeroImage] = useState(initialHeroImage);
  const [homeContent, setHomeContent] = useState<HomeContent>(initialHomeContent);
  const [heroSlideshow, setHeroSlideshow] = useState<HeroSlideshowContent>(initialHeroSlideshow);
  const [heroSlideshowImages, setHeroSlideshowImages] = useState(initialHeroSlideshowImages);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [slideshow, setSlideshow] = useState<SlideshowContent>(initialSlideshow);
  const [slideshowImages, setSlideshowImages] = useState(initialSlideshowImages);
  const [query, setQuery] = useState("");
  const [ctaSlide, setCtaSlide] = useState(0);
  const [ctaPaused, setCtaPaused] = useState(false);
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Todos");
  const featuredGridRef = useRef<HTMLDivElement>(null);
  const ctaSwipeRef = useRef<{ x: number; y: number } | null>(null);
  const heroSwipeRef = useRef<{ x: number; y: number } | null>(null);

  function startHeroSwipe(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" || !window.matchMedia("(max-width: 700px)").matches) return;
    heroSwipeRef.current = { x: event.clientX, y: event.clientY };
    setHeroPaused(true);
  }

  function finishHeroSwipe(event: React.PointerEvent<HTMLElement>) {
    const start = heroSwipeRef.current;
    heroSwipeRef.current = null;
    setHeroPaused(false);
    if (!start) return;
    const distanceX = event.clientX - start.x;
    const distanceY = event.clientY - start.y;
    if (Math.abs(distanceX) < 45 || Math.abs(distanceX) <= Math.abs(distanceY) * 1.2) return;
    setHeroSlide((current) => distanceX < 0 ? (current + 1) % heroSlideshow.slides.length : (current - 1 + heroSlideshow.slides.length) % heroSlideshow.slides.length);
  }

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
        .then((data: { heroImage?: string; homeContent?: HomeContent; heroSlideshowContent?: HeroSlideshowContent; heroSlideshowImages?: string[]; slideshowContent?: SlideshowContent; slideshowImages?: string[] }) => {
          setHeroImage(String(data.heroImage || ""));
          setHomeContent({ ...defaultHomeContent, ...(data.homeContent || {}) });
          setHeroSlideshow(data.heroSlideshowContent || defaultHeroSlideshowContent);
          setHeroSlideshowImages(Array.isArray(data.heroSlideshowImages) ? data.heroSlideshowImages : [""]);
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
    if (heroPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlideshow.slides.length), 6000);
    return () => window.clearInterval(interval);
  }, [heroPaused, heroSlideshow.slides.length]);
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
        className={`hero hero-slideshow ${heroSlideshowImages[heroSlide] || heroImage ? "has-cover" : ""}`}
        id="inicio"
        style={
          heroSlideshowImages[heroSlide] || heroImage
            ? {
                backgroundImage: `url(${heroSlideshowImages[heroSlide] || heroImage})`,
              }
            : undefined
        }
        aria-roledescription="carousel"
        aria-label="Banner principal"
        onPointerDown={startHeroSwipe}
        onPointerUp={finishHeroSwipe}
        onPointerCancel={() => { heroSwipeRef.current = null; setHeroPaused(false); }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onFocusCapture={() => setHeroPaused(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false); }}
      >
        <div className="hero-copy" aria-live="polite">
          <div className="eyebrow">
            <span /> {homeContent.eyebrow}
          </div>
          <h1>
            {heroSlideshow.slides[heroSlide]?.title || homeContent.title}
            <br />
            <em>{heroSlideshow.slides[heroSlide]?.highlight || homeContent.highlight}</em>
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
        <div className="hero-slide-controls" aria-label="Controles do banner principal">
          <button type="button" onClick={() => setHeroSlide((current) => (current - 1 + heroSlideshow.slides.length) % heroSlideshow.slides.length)} aria-label="Banner anterior">←</button>
          {heroSlideshow.slides.map((item, index) => <button type="button" key={item.id} className={heroSlide === index ? "active" : ""} onClick={() => setHeroSlide(index)} aria-label={`Mostrar banner ${index + 1}`} aria-current={heroSlide === index ? "true" : undefined} />)}
          <button type="button" onClick={() => setHeroSlide((current) => (current + 1) % heroSlideshow.slides.length)} aria-label="Próximo banner">→</button>
        </div>
        <div className="hero-art" aria-hidden="true" />
      </section>

      {homeContent.tickerEnabled && homeContent.tickerText.trim() ? (
        <aside className="home-ticker" aria-label="Avisos da Tiger Tech">
          <div className="home-ticker-track">
            {[0, 1].map((copy) => (
              <div className="home-ticker-copy" aria-hidden={copy === 1} key={copy}>
                {Array.from({ length: 4 }, (_, index) => (
                  <span key={index}>{homeContent.tickerText}<i aria-hidden="true">✦</i></span>
                ))}
              </div>
            ))}
          </div>
        </aside>
      ) : null}

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
      <div className="floating-theme-toggle">
        <ThemeToggle />
      </div>
      <a
        className="whatsapp-float"
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 360 362" fill="none" aria-hidden="true" focusable="false">
          <path
            fill="#25D366"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z"
          />
        </svg>
      </a>
    </main>
  );
}
