import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetail from "../../../components/product-detail";
import { getCachedPublicProduct } from "../../../lib/public-data";
import { absoluteUrl, jsonLd } from "../../../lib/seo";
import { productTitle } from "../../../lib/product-variants";
export const revalidate = 3600;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cor?: string }>;
};

function productDescription(product: Awaited<ReturnType<typeof getCachedPublicProduct>>) {
  if (!product) return "";
  return product.longDescription || product.description;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedPublicProduct(slug);
  if (!product) return {};
  const title = productTitle(product);
  const description = productDescription(product);
  const image = product.imageUrl ? absoluteUrl(product.imageUrl) : undefined;
  const canonicalSlug = product.groupSlug || product.slug;
  return {
    title: `${title}${product.brand ? ` | ${product.brand}` : ""}`,
    description,
    alternates: { canonical: `/produto/${canonicalSlug}` },
    openGraph: {
      type: "website",
      url: `/produto/${canonicalSlug}`,
      title: `${title}${product.brand ? ` | ${product.brand}` : ""}`,
      description,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const { cor } = await searchParams;
  const product = await getCachedPublicProduct(slug);
  if (!product) notFound();
  if (product.groupSlug && slug !== product.groupSlug)
    permanentRedirect(`/produto/${product.groupSlug}?cor=${encodeURIComponent(slug)}`);
  const selectedVariantSlug = product.variants?.some((variant) => variant.slug === cor)
    ? cor
    : product.selectedVariantSlug;
  const title = productTitle(product);
  const variants = product.variants?.length ? product.variants : [product];
  const canonicalSlug = product.groupSlug || product.slug;
  const variantSchema = variants.map((variant) => {
    const variantName = variant.colorName ? `${title} — ${variant.colorName}` : title;
    const price = Number(variant.priceCents || 0);
    return {
      "@type": "Product",
      name: variantName,
      image: variant.imageUrl ? [absoluteUrl(variant.imageUrl)] : undefined,
      sku: variant.sku || undefined,
      color: variant.colorName || undefined,
      url: absoluteUrl(`/produto/${canonicalSlug}${variant.slug !== canonicalSlug ? `?cor=${encodeURIComponent(variant.slug)}` : ""}`),
      ...(price > 0 ? {
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: (price / 100).toFixed(2),
          availability: (variant.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: absoluteUrl(`/produto/${canonicalSlug}?cor=${encodeURIComponent(variant.slug)}`),
        },
      } : {}),
    };
  });
  const schema = variants.length > 1 ? {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: title,
    description: productDescription(product),
    url: absoluteUrl(`/produto/${canonicalSlug}`),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    productGroupID: canonicalSlug,
    variesBy: ["https://schema.org/color"],
    hasVariant: variantSchema,
  } : { "@context": "https://schema.org", ...variantSchema[0], description: productDescription(product), brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Produtos", item: absoluteUrl("/produtos") },
      { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(`/produto/${canonicalSlug}`) },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
    <ProductDetail key={product.slug} product={product} initialSelectedSlug={selectedVariantSlug} />
  </>;
}
