import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "../../../components/product-detail";
import { getCachedPublicProduct, getCachedPublicProducts } from "../../../lib/public-data";
import { absoluteUrl, seoDescription, siteUrl } from "../../../lib/seo";
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];
  const products = await getCachedPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedPublicProduct(slug);
  if (!product) return {};

  const brand = product.brand || product.tag;
  const title = `${product.name}${brand ? ` ${brand}` : ""} | Tiger Tech 3D`;
  const description = seoDescription(
    product.longDescription || product.description,
  );
  const image = product.imageUrl
    ? absoluteUrl(product.imageUrl)
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/produto/${product.slug}`,
      title,
      description,
      images: image ? [{ url: image, alt: product.name }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCachedPublicProduct(slug);
  if (!product) notFound();
  const productUrl = absoluteUrl(`/produto/${product.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: seoDescription(product.longDescription || product.description),
        image: product.imageUrl ? [absoluteUrl(product.imageUrl)] : undefined,
        sku: product.sku || product.slug,
        brand: {
          "@type": "Brand",
          name: product.brand || product.tag || "Tiger Tech 3D",
        },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "BRL",
          price: ((product.priceCents || 0) / 100).toFixed(2),
          availability:
            Number(product.stock || 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Tiger Tech 3D",
            url: siteUrl,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Produtos",
            item: absoluteUrl("/produtos"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={product} />
    </>
  );
}
