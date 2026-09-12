import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import detectionImage from "../../public/snapmaker-u1/u1-detection.png";
import heroImage from "../../public/snapmaker-u1/u1-hero.png";
import studioImage from "../../public/snapmaker-u1/u1-studio.webp";
import styles from "./page.module.css";
import { absoluteUrl, jsonLd } from "../../lib/seo";
import { getCachedPublicProduct, getCachedSnapmakerU1Content } from "../../lib/public-data";
import SnapmakerOfferCard from "../../components/snapmaker-offer-card";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Snapmaker U1: impressora 3D multicolor",
  description:
    "Conheça a Snapmaker U1: quatro cabeçotes independentes, troca automática SnapSwap, impressão multicolor e velocidade de até 500 mm/s.",
  alternates: { canonical: "/snapmaker-u1" },
  openGraph: { title: "Snapmaker U1 | Impressão 3D multicolor", description: "Quatro cabeçotes independentes, troca automática SnapSwap e velocidade de até 500 mm/s.", url: "/snapmaker-u1", images: [{ url: "/snapmaker-u1/u1-hero.png", alt: "Impressora 3D Snapmaker U1" }] },
};

export default async function SnapmakerU1Page() {
  const [storeProduct, content] = await Promise.all([
    getCachedPublicProduct("sku-0014"),
    getCachedSnapmakerU1Content(),
  ]);
  const price = Number(storeProduct?.priceCents || 0);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Snapmaker U1",
    description: content.heroDescription,
    image: [absoluteUrl("/snapmaker-u1/u1-hero.png")],
    brand: { "@type": "Brand", name: "Snapmaker" },
    url: absoluteUrl("/snapmaker-u1"),
    ...(price > 0 ? { offers: { "@type": "Offer", priceCurrency: "BRL", price: (price / 100).toFixed(2), availability: (storeProduct?.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: absoluteUrl("/produto/sku-0014") } } : {}),
  };
  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <SiteHeader />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{content.heroEyebrow}</span>
            <h1>
              {content.heroTitle}
              <br />
              <em>{content.heroHighlight}</em>
            </h1>
            <p>{content.heroDescription}</p>
            <div className={styles.heroActions}>
              <a href="#tecnologia">{content.heroPrimaryButton}</a>
              <a href={content.whatsappUrl} target="_blank" rel="noreferrer">
                {content.heroSecondaryButton} <span>↗</span>
              </a>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <span className={styles.u1Backdrop} aria-hidden="true">
              U1
            </span>
            <Image
              src={heroImage}
              alt="Impressora 3D Snapmaker U1 com quatro filamentos"
              priority
              sizes="(max-width: 760px) 92vw, 52vw"
            />
          </div>
          <div className={styles.heroStats}>
            <div>
              <strong>{content.statOneValue}</strong>
              <span>{content.statOneLabel}</span>
            </div>
            <div>
              <strong>{content.statTwoValue}</strong>
              <span>{content.statTwoLabel}</span>
            </div>
            <div>
              <strong>{content.statThreeValue}</strong>
              <span>{content.statThreeLabel}</span>
            </div>
          </div>
        </section>

        <section className={styles.highlights} id="tecnologia">
          <div className={styles.sectionHeading}>
            <span>{content.technologyEyebrow}</span>
            <h2>{content.technologyTitle}</h2>
          </div>
          <div className={styles.highlightGrid}>
            {content.highlights.map((item, index) => (
              <article key={`${item.title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.swapSection}>
          <div className={styles.swapCopy}>
            <span className={styles.eyebrow}>{content.swapEyebrow}</span>
            <h2>{content.swapTitle}</h2>
            <p>{content.swapDescription}</p>
            <div className={styles.swapMetric}>
              <strong>{content.swapMetricValue}</strong>
              <span>{content.swapMetricLabel}</span>
            </div>
          </div>
          <figure className={styles.studioVisual}>
            <Image
              src={studioImage}
              alt="Snapmaker U1 em estúdio com quatro cabeçotes"
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </figure>
        </section>

        <section className={styles.precisionSection}>
          <div className={styles.precisionIntro}>
            <span>{content.precisionEyebrow}</span>
            <h2>{content.precisionTitle}</h2>
          </div>
          <div className={styles.precisionBody}>
            <p>{content.precisionDescription}</p>
            <div className={styles.materials} aria-label="Materiais compatíveis">
              {content.materials.map((material) => (
                <span key={material}>{material}</span>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.detectionSection}>
          <div className={styles.detectionVisual}>
            <Image
              src={detectionImage}
              alt="Sensores de detecção automática da Snapmaker U1"
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
          <div className={styles.detectionCopy}>
            <span className={styles.eyebrow}>{content.detectionEyebrow}</span>
            <h2>{content.detectionTitle}</h2>
            <p>{content.detectionDescription}</p>
            <ul>
              {content.detectionItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        {storeProduct ? <SnapmakerOfferCard product={storeProduct} copy={content} /> : null}

        <section className={styles.finalCta}>
          <span>{content.finalEyebrow}</span>
          <h2>{content.finalTitle}</h2>
          <p>{content.finalDescription}</p>
          <a href={content.whatsappUrl} target="_blank" rel="noreferrer">
            {content.finalButton} <span>↗</span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
