"use client";

import type { Product } from "../lib/products";
import { productTitle } from "../lib/product-variants";

type Props = {
  group: Product;
  onClose: () => void;
  onEdit: (variant: Product) => void;
  onAdd: (group: Product) => void;
  onDelete: (variant: Product) => void;
};

export default function FilamentVariantManager({ group, onClose, onEdit, onAdd, onDelete }: Props) {
  const variants = group.variants || [];
  const totalStock = variants.reduce((total, variant) => total + Math.max(0, variant.stock || 0), 0);

  return (
    <aside className="filament-variant-manager" aria-label={`Cores de ${productTitle(group)}`}>
      <div className="admin-form-head">
        <div>
          <span>VARIANTES DO FILAMENTO</span>
          <h2>{group.brand} {productTitle(group)}</h2>
          <p>{variants.length} {variants.length === 1 ? "cor" : "cores"} · {totalStock} unidades no total</p>
        </div>
        <button type="button" aria-label="Fechar gerenciador de cores" onClick={onClose}>×</button>
      </div>
      <button className="add-filament-color" type="button" onClick={() => onAdd(group)}>+ Adicionar nova cor</button>
      <div className="filament-variant-list">
        {variants.map((variant) => (
          <article key={variant.slug}>
            <div
              className="variant-photo"
              style={variant.imageUrl ? { backgroundImage: `url(${variant.imageUrl})` } : undefined}
              aria-label={`Foto da cor ${variant.colorName || "não informada"}`}
            />
            <i style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(variant.colorHex || "") ? variant.colorHex : "#888" }} />
            <div>
              <strong>{variant.colorName || "Cor não informada"}</strong>
              <small>SKU: {variant.sku || "Não informado"}</small>
              <span>{variant.stock || 0} unidades · {variant.visible === false ? "Oculta" : "Visível"}</span>
            </div>
            <div className="variant-actions">
              <button type="button" onClick={() => onEdit(variant)}>Editar</button>
              <button type="button" onClick={() => onDelete(variant)}>Excluir</button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
