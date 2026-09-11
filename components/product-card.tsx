"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "../lib/products";
import { productTitle } from "../lib/product-variants";
import ColorSwatches from "./color-swatches";
import PrinterVisual from "./printer-visual";

const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function ProductCard({ product: initialProduct }: { product: Product }) {
  const [selectedSlug, setSelectedSlug] = useState(initialProduct.slug);
  const variants = initialProduct.variants || [];
  const product = variants.find((variant) => variant.slug === selectedSlug) || initialProduct;
  return <article className="product-card">
    <div className="product-image">
      <span className="product-tag">{product.brand || product.tag}</span>
      {product.imageUrl ? <div className="uploaded-product-photo" role="img" aria-label={product.colorName ? `${productTitle(product)} — ${product.colorName}` : product.name} style={{ backgroundImage: `url(${product.imageUrl})` }} /> : <PrinterVisual tone={product.tone} />}
    </div>
    <div className="product-content">
      <span className="product-category">{product.category}</span>
      <h3>{productTitle(product)}</h3><p>{product.description}</p>
      <ColorSwatches variants={variants} selected={product} onSelect={(variant) => setSelectedSlug(variant.slug)} />
      <div className="featured-price">
        {(product.priceCents || 0) > 0 ? <>
          <span>NO PIX</span><strong>{money(product.priceCents || 0)}</strong>
          <span className="installment-label">10X NO CARTÃO</span>
          <strong className="installment-value">{money(product.cardPriceCents || product.priceCents || 0)}</strong>
        </> : <><span>VALOR</span><strong>Consulte o preço</strong></>}
      </div>
      <ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>
      <Link href={`/produto/${product.slug}`}>Ver produto <span>→</span></Link>
    </div>
  </article>;
}
