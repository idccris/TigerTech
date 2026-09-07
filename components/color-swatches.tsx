"use client";

import type { Product } from "../lib/products";

export default function ColorSwatches({ variants, selected, onSelect }: { variants: Product[]; selected: Product; onSelect: (product: Product) => void }) {
  if (!variants.length) return null;
  return <div className="color-selector">
    <p aria-live="polite">Cor: <strong>{selected.colorName || "Não informada"}</strong>{(selected.stock || 0) <= 0 ? " · Esgotada" : ""}</p>
    <div className="color-swatches" role="group" aria-label="Escolha a cor do filamento">
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
  </div>;
}
