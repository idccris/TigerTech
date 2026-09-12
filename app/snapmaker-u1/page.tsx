import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import detectionImage from "../../public/snapmaker-u1/u1-detection.png";
import heroImage from "../../public/snapmaker-u1/u1-hero.png";
import studioImage from "../../public/snapmaker-u1/u1-studio.webp";
import styles from "./page.module.css";
import { absoluteUrl, jsonLd } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Snapmaker U1: impressora 3D multicolor",
  description:
    "Conheça a Snapmaker U1: quatro cabeçotes independentes, troca automática SnapSwap, impressão multicolor e velocidade de até 500 mm/s.",
  alternates: { canonical: "/snapmaker-u1" },
  openGraph: { title: "Snapmaker U1 | Impressão 3D multicolor", description: "Quatro cabeçotes independentes, troca automática SnapSwap e velocidade de até 500 mm/s.", url: "/snapmaker-u1", images: [{ url: "/snapmaker-u1/u1-hero.png", alt: "Impressora 3D Snapmaker U1" }] },
};

const whatsapp =
  "https://wa.me/5541992133804?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20melhor%20a%20Snapmaker%20U1";

const highlights = [
  {
    number: "01",
    title: "Sistema SnapSwap™",
    text: "Quatro cabeçotes pré-aquecidos alternam automaticamente em cerca de 5 segundos.",
  },
  {
    number: "02",
    title: "Mínimo desperdício",
    text: "As cores mudam pela troca de cabeçote, reduzindo drasticamente a necessidade de purga.",
  },
  {
    number: "03",
    title: "CoreXY de alta velocidade",
    text: "Estrutura precisa com eixo em fibra de carbono e velocidade de impressão de até 500 mm/s.",
  },
  {
    number: "04",
    title: "Multimaterial de verdade",
    text: "Combine materiais rígidos, flexíveis e suportes solúveis em uma mesma peça.",
  },
];

const materials = ["PLA", "PETG", "TPU", "ABS", "ASA", "PC", "PA", "PVA"];

export default function SnapmakerU1Page() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Snapmaker U1",
    description: "Impressora 3D multicolor e multimaterial com quatro cabeçotes independentes, sistema SnapSwap e velocidade de até 500 mm/s.",
    image: [absoluteUrl("/snapmaker-u1/u1-hero.png")],
    brand: { "@type": "Brand", name: "Snapmaker" },
    url: absoluteUrl("/snapmaker-u1"),
  };
  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <SiteHeader />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>SNAPMAKER U1</span>
            <h1>
              Quatro cabeçotes.
              <br />
              <em>Zero limites.</em>
            </h1>
            <p>
              Impressão 3D multicolor e multimaterial com trocas rápidas,
              menos purga e a precisão que seus projetos exigem.
            </p>
            <div className={styles.heroActions}>
              <a href="#tecnologia">Conheça a tecnologia</a>
              <a href={whatsapp} target="_blank" rel="noreferrer">
                Fale conosco <span>↗</span>
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
              <strong>~5 s</strong>
              <span>troca de cabeçote</span>
            </div>
            <div>
              <strong>4</strong>
              <span>cabeçotes independentes</span>
            </div>
            <div>
              <strong>500 mm/s</strong>
              <span>velocidade de impressão</span>
            </div>
          </div>
        </section>

        <section className={styles.highlights} id="tecnologia">
          <div className={styles.sectionHeading}>
            <span>TECNOLOGIA QUE MUDA O PROCESSO</span>
            <h2>Mais cores. Mais materiais. Menos espera.</h2>
          </div>
          <div className={styles.highlightGrid}>
            {highlights.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.swapSection}>
          <div className={styles.swapCopy}>
            <span className={styles.eyebrow}>TROCA INTELIGENTE DE FERRAMENTAS</span>
            <h2>Uma cor em cada cabeçote. Sem purga a cada troca.</h2>
            <p>
              Em sistemas convencionais, um único bico precisa descarregar o
              material anterior antes de receber a próxima cor. A U1 alterna
              entre quatro extrusores independentes, mantendo cada filamento
              pronto para entrar em ação.
            </p>
            <div className={styles.swapMetric}>
              <strong>Até 50%</strong>
              <span>mais rápida em impressões multicoloridas</span>
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
            <span>PRECISÃO ABSOLUTA</span>
            <h2>Encaixe preciso. Estabilidade em cada camada.</h2>
          </div>
          <div className={styles.precisionBody}>
            <p>
              Acoplamentos cinemáticos com esferas de aço posicionam e travam
              cada cabeçote com alta precisão. Cada troca acontece de forma
              rápida e confiável, preservando o alinhamento e a qualidade do
              acabamento.
            </p>
            <div className={styles.materials} aria-label="Materiais compatíveis">
              {materials.map((material) => (
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
            <span className={styles.eyebrow}>IMPRESSÃO MAIS CONFIÁVEL</span>
            <h2>Detecção automática de erros.</h2>
            <p>
              Sensores monitoram a troca da cabeça de ferramenta, a presença
              de filamento e a extrusão. Quando algo foge do esperado, a U1
              pausa o processo para proteger a peça e evitar desperdícios.
            </p>
            <ul>
              <li>Detecção de troca incorreta do cabeçote</li>
              <li>Detecção de falta de filamento</li>
              <li>Detecção de impressão sem material</li>
            </ul>
          </div>
        </section>

        <section className={styles.finalCta}>
          <span>SNAPMAKER U1</span>
          <h2>Pronto para imprimir sem limitar suas ideias?</h2>
          <p>
            Converse com a Tiger Tech e conheça todos os detalhes da nova
            experiência multicolor da Snapmaker.
          </p>
          <a href={whatsapp} target="_blank" rel="noreferrer">
            Quero conhecer a U1 <span>↗</span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
