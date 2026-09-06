"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "../lib/products";
import { PrinterVisual } from "./catalog";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

const categories = [
  "Todos",
  "Impressoras 3D",
  "Filamentos",
  "Acessórios",
] as const;

const formatMoney = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((cents || 0) / 100);

export default function ProductsPage({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Todos");
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (product.stock || 0) > 0 &&
          (category === "Todos" || product.category === category) &&
          `${product.name} ${product.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [products, category, query],
  );
  useEffect(() => {
    const refresh = () =>
      fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("Falha ao carregar produtos");
          return response.json();
        })
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]));
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("catalog-updates");
      channel.onmessage = refresh;
    }
    return () => {
      window.removeEventListener("focus", onFocus);
      channel?.close();
    };
  }, []);
  return (
    <main className="store-page">
      <SiteHeader solid />
      <section className="store-hero">
        <span className="section-kicker">CATÁLOGO COMPLETO</span>
        <h1>Todos os produtos</h1>
        <p>
          Encontre impressoras 3D, filamentos e acessórios para transformar suas
          ideias em projetos reais.
        </p>
      </section>
      <section className="store-catalog">
        <div className="store-toolbar">
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produto..."
              aria-label="Buscar produto"
            />
          </label>
        </div>
        <div className="store-grid">
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
            <span>Tente usar outro termo ou categoria.</span>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
