import { redirect } from "next/navigation";
import AdminCatalog from "../../../components/admin-catalog";
import { requireUser } from "../../../lib/admin-auth";
import { listProducts } from "../../../lib/db";
import { storefrontProductImage } from "../../../lib/product-images";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catálogo administrativo | Tiger Tech" };

export default async function Page() {
  const user = await requireUser();
  if (!user) redirect("/admin");
  const products = await listProducts(true);
  const lightweightProducts = products.map((product: any) => ({
    ...product,
    imageUrl: storefrontProductImage(product),
  }));
  return <AdminCatalog products={lightweightProducts} role={user.role} />;
}
