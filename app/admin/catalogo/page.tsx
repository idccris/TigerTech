import { redirect } from "next/navigation";
import AdminCatalog from "../../../components/admin-catalog";
import { requireUser } from "../../../lib/admin-auth";
import { listProductGallerySlots, listProducts } from "../../../lib/db";
import { storefrontProductImage } from "../../../lib/product-images";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catálogo administrativo | Tiger Tech" };

export default async function Page() {
  const user = await requireUser();
  if (!user) redirect("/admin");
  const [products, gallerySlots] = await Promise.all([listProducts(true), listProductGallerySlots()]);
  const slotsBySlug = new Map<string, number[]>();
  for (const row of gallerySlots) {
    const values = slotsBySlug.get(String(row.product_slug)) || [];
    values.push(Number(row.position));
    slotsBySlug.set(String(row.product_slug), values);
  }
  const lightweightProducts = products.map((product: any) => ({
    ...product,
    imageUrl: storefrontProductImage(product),
    imageUrls: [storefrontProductImage(product), ...(slotsBySlug.get(product.slug) || []).map(position => `/api/products/image?slug=${encodeURIComponent(product.slug)}&index=${position}&v=${encodeURIComponent(product.updatedAt || "1")}`)].filter(Boolean),
  }));
  return <AdminCatalog products={lightweightProducts} role={user.role} />;
}
