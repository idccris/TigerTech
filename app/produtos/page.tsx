import type { Metadata } from "next";
import ProductsPage from "../../components/products-page";
import { getCachedPublicCatalogProducts } from "../../lib/public-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Impressoras 3D, filamentos e acessórios",
  description: "Explore impressoras 3D, filamentos PLA, PETG e materiais especiais, além de acessórios para criar, prototipar e produzir com qualidade.",
  alternates: { canonical: "/produtos" },
  openGraph: { title: "Impressoras 3D, filamentos e acessórios | Tiger Tech 3D", description: "Encontre equipamentos, filamentos e acessórios para impressão 3D.", url: "/produtos" },
};

export default async function Page() {
  const products = await getCachedPublicCatalogProducts();
  return <ProductsPage initialProducts={products} />;
}
