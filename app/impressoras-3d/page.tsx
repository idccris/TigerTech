import type { Metadata } from "next";
import CategoryCatalogPage from "../../components/category-catalog-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Impressoras 3D para criar, prototipar e produzir",
  description: "Conheça impressoras 3D para makers, profissionais e empresas. Compare equipamentos e encontre a solução ideal para o seu projeto.",
  alternates: { canonical: "/impressoras-3d" },
  openGraph: { title: "Impressoras 3D | Tiger Tech 3D", description: "Equipamentos para criar, prototipar e produzir com tecnologia 3D.", url: "/impressoras-3d" },
};

export default function PrintersPage() {
  return <CategoryCatalogPage category="Impressoras 3D" title="Impressoras 3D" description="Explore impressoras 3D para transformar ideias em protótipos, peças e produtos com precisão." />;
}
