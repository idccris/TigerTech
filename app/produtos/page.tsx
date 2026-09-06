import type { Metadata } from "next";
import ProductsPage from "../../components/products-page";
import { getCachedPublicProducts } from "../../lib/public-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Produtos | Tiger Tech",
  description: "Catálogo completo de impressoras 3D, filamentos e acessórios.",
  alternates: { canonical: "/produtos" },
};

export default async function Page() {
  const products = await getCachedPublicProducts();
  return <ProductsPage initialProducts={products} />;
}
