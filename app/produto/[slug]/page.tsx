import { notFound } from "next/navigation";
import ProductDetail from "../../../components/product-detail";
import { getCachedPublicProduct, getCachedPublicProducts } from "../../../lib/public-data";
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];
  const products = await getCachedPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCachedPublicProduct(slug);
  if (!product) notFound();
  return <ProductDetail key={product.slug} product={product} />;
}
