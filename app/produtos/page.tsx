import type { Metadata } from "next";
import ProductsPage from "../../components/products-page";
import { getCachedPublicCatalogProducts } from "../../lib/public-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Produtos | Tiger Tech",
  description: "Catálogo completo de impressoras 3D, filamentos e acessórios.",
};

export default async function Page() {
  const products = await getCachedPublicCatalogProducts();
  return <ProductsPage initialProducts={products} />;
}
