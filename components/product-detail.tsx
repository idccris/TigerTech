"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "../lib/products";
import { useCart } from "./cart-provider";
import { PrinterVisual } from "./catalog";
import SiteFooter from "./site-footer";
import ProductWarranty from "./product-warranty";
import BrandLogo from "./brand-logo";

export default function ProductDetail({ product }: { product: Product }) {
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
            <div
              className="uploaded-product-photo"
              style={{ backgroundImage: `url(${product.imageUrl})` }}
            />
          ) : (
            <PrinterVisual tone={product.tone} />
          )}
        </div>
        <div className="detail-copy">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.longDescription}</p>
          <div className="detail-specs">
            {product.specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
          <div className="product-pricing">
            <span>NO PIX</span>
            <strong className="product-price">{money(product.priceCents || 0)}</strong>
            <small>No cartão: {money(product.cardPriceCents || product.priceCents || 0)}</small>
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
          <button className="buy-button" onClick={() => cart.add(product)}>
            Adicionar ao carrinho <span>+</span>
          </button>
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
