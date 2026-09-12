import ProductsPage from "./products-page";
import { getCachedPublicCatalogProducts } from "../lib/public-data";

type Category = "Impressoras 3D" | "Filamentos" | "Acessórios";

export default async function CategoryCatalogPage({
  category,
  title,
  description,
}: {
  category: Category;
  title: string;
  description: string;
}) {
  const products = await getCachedPublicCatalogProducts();
  return <ProductsPage initialProducts={products} initialCategory={category} title={title} description={description} />;
}
