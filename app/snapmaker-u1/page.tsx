import type { Metadata } from "next";
import ProductLandingPage from "../../components/product-landing-page";
import { getCachedPublicProduct, getCachedSnapmakerU1Content } from "../../lib/public-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Snapmaker U1: impressora 3D multicolor",
  description: "Conheça a Snapmaker U1: quatro cabeçotes independentes, troca automática SnapSwap, impressão multicolor e velocidade de até 500 mm/s.",
  alternates: { canonical: "/snapmaker-u1" },
  openGraph: { title: "Snapmaker U1 | Impressão 3D multicolor", description: "Quatro cabeçotes independentes, troca automática SnapSwap e velocidade de até 500 mm/s.", url: "/snapmaker-u1", images: [{ url: "/snapmaker-u1/u1-hero.png", alt: "Impressora 3D Snapmaker U1" }] },
};

export default async function SnapmakerU1Page() {
  const [product, content] = await Promise.all([getCachedPublicProduct("sku-0014"), getCachedSnapmakerU1Content()]);
  return <ProductLandingPage content={content} product={product} canonicalPath="/snapmaker-u1" />;
}
