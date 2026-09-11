"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "../lib/products";
import { useCart } from "./cart-provider";
import { PrinterVisual } from "./catalog";
import SiteFooter from "./site-footer";
import ProductWarranty from "./product-warranty";
import BrandLogo from "./brand-logo";
import ColorSwatches from "./color-swatches";
import { productTitle } from "../lib/product-variants";

export default function ProductDetail({ product: initialProduct, initialSelectedSlug }: { product: Product; initialSelectedSlug?: string }) {
  const [selectedSlug, setSelectedSlug] = useState(initialSelectedSlug || initialProduct.selectedVariantSlug || initialProduct.slug);
  const variants = initialProduct.variants || [];
  const selectedVariant = variants.find((variant) => variant.slug === selectedSlug);
  const product = selectedVariant ? { ...initialProduct, ...selectedVariant, variants } : initialProduct;
  const cart = useCart();
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents || 0) / 100);
  useEffect(() => {
    if (!specificationsOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSpecificationsOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [specificationsOpen]);
  return (
    <main className="product-page">
      <header className="product-header">
        <Link className="brand" href="/">
          <BrandLogo priority />
          <span>TIGER TECH</span>
        </Link>
        <Link href="/produtos">← Voltar aos produtos</Link>
        <button className="nav-cart" onClick={cart.open}>
          Carrinho <span>{cart.count}</span>
        </button>
      </header>
      <section className="product-detail">
        <div className={`detail-visual ${product.tone}`}>
          <span className="product-tag">{product.brand || product.tag}</span>
          {product.imageUrl ? (
            <Image
              className="uploaded-product-photo"
              src={product.imageUrl}
              alt={product.colorName ? `${productTitle(product)} — ${product.colorName}` : product.name}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              priority
            />
          ) : (
            <PrinterVisual tone={product.tone} />
          )}
        </div>
        <div className="detail-copy">
          <span className="product-category">{product.category}</span>
          <h1>{productTitle(product)}</h1>
          <p>{product.longDescription}</p>
          <ColorSwatches variants={variants} selected={product} onSelect={(variant) => setSelectedSlug(variant.slug)} />
          <div className="detail-specs">
            {product.specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
          <div className="product-pricing">
            {(product.priceCents || 0) > 0 ? <>
              <span>NO PIX</span>
              <strong className="product-price">{money(product.priceCents || 0)}</strong>
              <small>No cartão: {money(product.cardPriceCents || product.priceCents || 0)}</small>
            </> : <><span>VALOR</span><strong className="product-price">Consulte o preço</strong></>}
          </div>
          <div className="benefit-list">
            {product.benefits.map((benefit) => (
              <div className="benefit-button" key={benefit.title}>
                <i>{benefit.icon}</i>
                <span>
                  <strong>{benefit.title}</strong>
                  <small>{benefit.text}</small>
                </span>
              </div>
            ))}
          </div>
          <button
            className="specifications-button"
            onClick={() => setSpecificationsOpen(true)}
            aria-haspopup="dialog"
          >
            Especificações <span>+</span>
          </button>
          {(product.priceCents || 0) > 0 ? <button className="buy-button" disabled={(product.stock || 0) <= 0} onClick={() => cart.add(product)}>
            {(product.stock || 0) > 0 ? "Adicionar ao carrinho" : "Cor esgotada"} <span>+</span>
          </button> : <a className="buy-button" href={`https://wa.me/5541992133804?text=${encodeURIComponent(`Olá, gostaria de consultar o preço do ${productTitle(product)} — ${product.colorName || "produto"}.`)}`} target="_blank" rel="noreferrer">
            Consultar pelo WhatsApp <span>↗</span>
          </a>}
          <small className="buy-note">
            A forma de fechamento do pedido será definida posteriormente.
          </small>
        </div>
      </section>
      <ProductWarranty />
      {specificationsOpen && (
        <div
          className="cart-overlay specifications-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setSpecificationsOpen(false);
          }}
        >
          <aside
            className="cart-drawer specifications-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="specifications-title"
          >
            <div className="cart-head">
              <div>
                <span>FICHA TÉCNICA</span>
                <h2 id="specifications-title">Especificações</h2>
              </div>
              <button
                type="button"
                aria-label="Fechar especificações"
                onClick={() => setSpecificationsOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="specifications-content">
              <span>{product.brand || product.category}</span>
              <h3>{product.name}</h3>
              <p>
                {product.specificationsText?.trim() ||
                  "As especificações completas deste produto ainda não foram cadastradas."}
              </p>
            </div>
          </aside>
        </div>
      )}
      <SiteFooter />
    </main>
  );
}
