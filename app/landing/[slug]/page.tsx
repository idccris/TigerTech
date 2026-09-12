import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductLandingPage from "../../../components/product-landing-page";
import { getCachedLandingPages, getCachedPublicProduct } from "../../../lib/public-data";

export const revalidate = 3600;

type LandingPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = (await getCachedLandingPages()).find((item) => item.slug === slug);
  if (!page) return {};
  return { title: page.name, description: page.content.heroDescription || page.name, alternates: { canonical: `/landing/${page.slug}` } };
}

export default async function Page({ params }: LandingPageProps) {
  const { slug } = await params;
  const page = (await getCachedLandingPages()).find((item) => item.slug === slug);
  if (!page) notFound();
  const product = page.productSlug ? await getCachedPublicProduct(page.productSlug) : null;
  return <ProductLandingPage content={page.content} product={product} canonicalPath={`/landing/${page.slug}`} />;
}
