"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/products";
import { productGroupKey, productMatches } from "../lib/product-variants";
import ProductCard from "./product-card";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

const categories = [
  "Todos",
  "Impressoras 3D",
  "Filamentos",
  "Acessórios",
] as const;

const PRODUCTS_PER_BATCH = 24;


type ProductsPageProps = {
  initialProducts: Product[];
  initialCategory?: (typeof categories)[number];
  title?: string;
  description?: string;
  showCatalogDownload?: boolean;
};

export default function ProductsPage({
  initialProducts,
  initialCategory = "Todos",
  title = "Todos os produtos",
  description = "Encontre impressoras 3D, filamentos e acessórios para transformar suas ideias em projetos reais.",
  showCatalogDownload = false,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>(initialCategory);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_BATCH);
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (product.stock || 0) > 0 &&
          (category === "Todos" || product.category === category) &&
          productMatches(product, deferredQuery),
      ),
    [products, category, deferredQuery],
  );
  useEffect(() => {
    const refresh = () =>
      fetch(`/api/products?catalog=true&t=${Date.now()}`, { cache: "no-store" })
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
  const visibleProducts = filtered.slice(0, visibleCount);
  return (
    <main className="store-page">
      <SiteHeader solid />
      <section className="store-hero">
        <span className="section-kicker">CATÁLOGO COMPLETO</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {showCatalogDownload && (
          <a className="catalog-download-button" href="/api/catalogo-pdf">
            <span className="catalog-download-icon" aria-hidden="true">↓</span>
            <span className="catalog-download-copy">
              <strong>Baixar catálogo disponível</strong>
              <small>PDF atualizado conforme o estoque</small>
            </span>
          </a>
        )}
      </section>
      <section className="store-catalog">
        <div className="store-toolbar">
          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => {
                  setCategory(item);
                  setVisibleCount(PRODUCTS_PER_BATCH);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(PRODUCTS_PER_BATCH);
              }}
              placeholder="Buscar produto..."
              aria-label="Buscar produto"
            />
          </label>
        </div>
        <div className="store-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={productGroupKey(product)} product={product} />
          ))}
        </div>
        {visibleCount < filtered.length && (
          <div className="store-load-more">
            <button type="button" className="primary-button" onClick={() => setVisibleCount((count) => count + PRODUCTS_PER_BATCH)}>
              Carregar mais produtos
            </button>
            <span>Exibindo {visibleProducts.length} de {filtered.length}</span>
          </div>
        )}
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
