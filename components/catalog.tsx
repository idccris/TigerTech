"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Product } from "../lib/products";
import SiteHeader, { whatsapp } from "./site-header";
import { defaultHomeContent, type HomeContent } from "../lib/site-content";
import SiteFooter from "./site-footer";

const categories = [
  "Todos",
  "Impressoras 3D",
  "Filamentos",
  "Acessórios",
] as const;
const formatMoney = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents || 0) / 100);

export function PrinterVisual({ tone }: { tone: string }) {
  return (
    <div className={`product-visual ${tone}`} aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="machine">
        <div className="machine-top">
          <span />
        </div>
        <div className="machine-window">
          <div className="printed-shape" />
        </div>
        <div className="machine-base" />
      </div>
    </div>
  );
}

export default function Catalog({
  initialProducts,
  initialHeroImage,
  initialHomeContent,
}: {
  initialProducts: Product[];
  initialHeroImage: string;
  initialHomeContent: HomeContent;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [heroImage, setHeroImage] = useState(initialHeroImage);
  const [homeContent, setHomeContent] = useState<HomeContent>({
    ...defaultHomeContent,
    ...initialHomeContent,
    faqs: Array.isArray(initialHomeContent?.faqs) ? initialHomeContent.faqs : defaultHomeContent.faqs,
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Todos");
  const featuredGridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          category === "Todos" || product.category === category;
        const searchable =
          `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return matchesCategory && searchable.includes(query.toLowerCase());
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
        .then((data: { heroImage?: string; homeContent?: HomeContent }) => {
          setHeroImage(String(data.heroImage || ""));
          setHomeContent({
            ...defaultHomeContent,
            ...(data.homeContent || {}),
            faqs: Array.isArray(data.homeContent?.faqs) ? data.homeContent.faqs : defaultHomeContent.faqs,
          });
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

  return (
    <main>
      <SiteHeader solid />

      <section
        className={`hero ${heroImage ? "has-cover" : ""}`}
        id="inicio"
        style={
          heroImage
            ? ({
                backgroundImage: `url(${heroImage})`,
                "--hero-image": `url(${heroImage})`,
              } as CSSProperties)
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
        {heroImage ? (
          <div
            className="hero-mobile-visual"
            aria-hidden="true"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        ) : null}
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
            <article className="product-card" key={product.slug}>
              <div className="product-image">
                <span className="product-tag">
                  {product.brand || product.tag}
                </span>
                {product.imageUrl ? (
                  <div
                    className="uploaded-product-photo"
                    style={{ backgroundImage: `url(${product.imageUrl})` }}
                  />
                ) : (
                  <PrinterVisual tone={product.tone} />
                )}
              </div>
              <div className="product-content">
                <span className="product-category">{product.category}</span>
                <h3>
                  <Link href={`/produto/${product.slug}`}>{product.name}</Link>
                </h3>
                <p>{product.description}</p>
                <div className="featured-price">
                  <span>NO PIX</span>
                  <strong>
                    <Link href={`/produto/${product.slug}`}>
                      {formatMoney(product.priceCents || 0)}
                    </Link>
                  </strong>
                </div>
                <ul>
                  {product.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
                <Link href={`/produto/${product.slug}`}>
                  Ver produto <span>→</span>
                </Link>
              </div>
            </article>
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

      <section className="cta-section">
        <span className="section-kicker">VAMOS COMEÇAR?</span>
        <h2>
          Sua próxima ideia
          <br />
          começa aqui.
        </h2>
        <p>
          Converse com um especialista e descubra a solução ideal para o seu
          projeto.
        </p>
        <a
          className="primary-button"
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          Chamar no WhatsApp <span>↗</span>
        </a>
      </section>
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
