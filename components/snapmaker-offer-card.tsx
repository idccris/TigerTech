"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/products";
import { useCart } from "./cart-provider";
import styles from "../app/snapmaker-u1/page.module.css";
import type { SnapmakerU1Content } from "../lib/snapmaker-content";

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

type OfferCopy = Pick<SnapmakerU1Content, "offerEyebrow" | "offerDescription" | "offerCategory">;

export default function SnapmakerOfferCard({ product, copy }: { product: Product; copy: OfferCopy }) {
  const cart = useCart();
  const available = (product.stock || 0) > 0;
  const hasPrice = (product.priceCents || 0) > 0;

  return (
    <section className={styles.offerSection} aria-labelledby="snapmaker-offer-title">
      <div className={styles.offerIntro}>
        <span>{copy.offerEyebrow}</span>
        <p>{copy.offerDescription}</p>
      </div>
      <article className={styles.offerCard}>
        <Link className={styles.offerImage} href={`/produto/${product.slug}`} aria-label="Ver detalhes da Snapmaker U1">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt="Impressora 3D Snapmaker U1" fill sizes="(max-width: 760px) 90vw, 42vw" />
          ) : null}
          <span>SNAPMAKER</span>
        </Link>
        <div className={styles.offerContent}>
          <span className={styles.offerCategory}>{copy.offerCategory}</span>
          <h2 id="snapmaker-offer-title">Snapmaker U1</h2>
          <p>{product.description}</p>
          <div className={styles.offerHighlights}>
            {product.specs.slice(0, 3).map((spec) => <span key={spec}>{spec}</span>)}
          </div>
          <div className={styles.offerPurchase}>
            <div className={styles.offerPrices}>
              {hasPrice ? <>
                <span>NO PIX</span>
                <strong>{money(product.priceCents || 0)}</strong>
                <small>No cartão: {money(product.cardPriceCents || product.priceCents || 0)}</small>
              </> : <><span>VALOR</span><strong>Consulte o preço</strong></>}
            </div>
            <div className={styles.offerActions}>
              {hasPrice ? (
                <button type="button" onClick={() => cart.add(product)} disabled={!available}>
                  {available ? "Adicionar ao carrinho" : "Produto esgotado"}
                </button>
              ) : (
                <a href="https://wa.me/5541992133804?text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20o%20valor%20da%20Snapmaker%20U1" target="_blank" rel="noreferrer">Consultar pelo WhatsApp</a>
              )}
              <Link href={`/produto/${product.slug}`}>Ver ficha completa <span>↗</span></Link>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
