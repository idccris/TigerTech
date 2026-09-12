"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "../lib/products";

export default function ColorSwatches({ variants, selected, onSelect }: { variants: Product[]; selected: Product; onSelect: (product: Product) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateNavigation = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setCanGoBack(row.scrollLeft > 2);
    setCanGoForward(row.scrollLeft + row.clientWidth < row.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    updateNavigation();
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(row);
    row.addEventListener("scroll", updateNavigation, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", updateNavigation);
    };
  }, [updateNavigation, variants.length]);

  const move = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * Math.max(120, row.clientWidth * 0.72), behavior: "smooth" });
  };

  if (!variants.length) return null;
  return <div className="color-selector">
    <p aria-live="polite">Cor: <strong>{selected.colorName || "Não informada"}</strong>{(selected.stock || 0) <= 0 ? " · Esgotada" : ""}</p>
    <div className="color-carousel">
      <button type="button" className="color-carousel-arrow" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Ver cores anteriores">‹</button>
      <div ref={rowRef} className="color-swatches" role="group" aria-label="Escolha a cor do filamento">
        {variants.map((variant) => <button
          key={variant.slug}
          type="button"
          className={`color-swatch${(variant.stock || 0) <= 0 ? " sold-out" : ""}`}
          style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(variant.colorHex || "") ? variant.colorHex : "#888888" }}
          title={`${variant.colorName}${(variant.stock || 0) <= 0 ? " — Esgotada" : ""}`}
          aria-label={`${variant.colorName}${(variant.stock || 0) <= 0 ? " — Esgotada" : ""}`}
          aria-pressed={selected.slug === variant.slug}
          onClick={() => onSelect(variant)}
        />)}
      </div>
      <button type="button" className="color-carousel-arrow" onClick={() => move(1)} disabled={!canGoForward} aria-label="Ver próximas cores">›</button>
    </div>
  </div>;
}
