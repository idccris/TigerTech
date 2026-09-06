import type { Metadata } from "next";
import Catalog from "../components/catalog";
import { getCachedHomeData } from "../lib/public-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const data = await getCachedHomeData();
  return <Catalog initialProducts={data.products} initialHeroImage={data.heroImage} initialHomeContent={data.homeContent} />;
}
