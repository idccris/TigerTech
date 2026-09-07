"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/products";
import { groupProducts, productGroupKey, productMatches } from "../lib/product-variants";
import ProductCard from "./product-card";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

const categories = [
  "Todos",
  "Impressoras 3D",
  "Filamentos",
  "Acessórios",
] as const;


export default function ProductsPage({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Todos");
  const filtered = useMemo(
    () =>
      groupProducts(products).filter(
        (product) =>
          (product.stock || 0) > 0 &&
          (category === "Todos" || product.category === category) &&
          productMatches(product, query),
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
            <ProductCard key={productGroupKey(product)} product={product} />
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
