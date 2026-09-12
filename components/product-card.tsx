"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "../lib/products";
import { productTitle } from "../lib/product-variants";
import ColorSwatches from "./color-swatches";
import PrinterVisual from "./printer-visual";

const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function ProductCard({ product: initialProduct }: { product: Product }) {
  const [selectedSlug, setSelectedSlug] = useState(initialProduct.selectedVariantSlug || initialProduct.slug);
  const variants = initialProduct.variants || [];
  const selectedVariant = variants.find((variant) => variant.slug === selectedSlug);
  const product = selectedVariant ? { ...initialProduct, ...selectedVariant, variants } : initialProduct;
  const productHref = { pathname: `/produto/${initialProduct.slug}`, query: selectedVariant ? { cor: selectedVariant.slug } : undefined };
  return <article className="product-card">
    <div className="product-image">
      <span className="product-tag">{product.brand || product.tag}</span>
      {product.imageUrl ? <Image className="uploaded-product-photo" src={product.imageUrl} alt={product.colorName ? `${productTitle(product)} — ${product.colorName}` : product.name} fill sizes="(max-width: 700px) 88vw, (max-width: 1100px) 44vw, 30vw" /> : <PrinterVisual tone={product.tone} />}
    </div>
    <div className="product-content">
      <span className="product-category">{product.category}</span>
      <Link className="product-title-link" href={productHref}><h3>{productTitle(product)}</h3></Link><p>{product.description}</p>
      <ColorSwatches variants={variants} selected={product} onSelect={(variant) => setSelectedSlug(variant.slug)} />
      <Link className="featured-price product-price-link" href={productHref} aria-label={`Ver ${productTitle(product)} e valores`}>
        {(product.priceCents || 0) > 0 ? <>
          <span>NO PIX</span><strong>{money(product.priceCents || 0)}</strong>
          <span className="installment-label">10X NO CARTÃO</span>
          <strong className="installment-value">{money(product.cardPriceCents || product.priceCents || 0)}</strong>
        </> : <><span>VALOR</span><strong>Consulte o preço</strong></>}
      </Link>
      <ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>
      <Link className="product-detail-link" href={productHref}>Ver produto <span>→</span></Link>
    </div>
  </article>;
}
