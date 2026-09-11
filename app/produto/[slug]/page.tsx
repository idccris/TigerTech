import { notFound, permanentRedirect } from "next/navigation";
import ProductDetail from "../../../components/product-detail";
import { getCachedPublicProduct } from "../../../lib/public-data";
export const revalidate = 3600;

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cor?: string }>;
}) {
  const { slug } = await params;
  const { cor } = await searchParams;
  const product = await getCachedPublicProduct(slug);
  if (!product) notFound();
  if (product.groupSlug && slug !== product.groupSlug)
    permanentRedirect(`/produto/${product.groupSlug}?cor=${encodeURIComponent(slug)}`);
  const selectedVariantSlug = product.variants?.some((variant) => variant.slug === cor)
    ? cor
    : product.selectedVariantSlug;
  return <ProductDetail key={product.slug} product={product} initialSelectedSlug={selectedVariantSlug} />;
}
