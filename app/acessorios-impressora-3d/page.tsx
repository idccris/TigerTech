import type { Metadata } from "next";
import CategoryCatalogPage from "../../components/category-catalog-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Acessórios para impressora 3D",
  description: "Encontre acessórios para impressora 3D, manutenção, acabamento e produção com mais qualidade e praticidade.",
  alternates: { canonical: "/acessorios-impressora-3d" },
  openGraph: { title: "Acessórios para impressora 3D | Tiger Tech 3D", description: "Acessórios para manutenção, acabamento e produção 3D.", url: "/acessorios-impressora-3d" },
};

export default function AccessoriesPage() {
  return <CategoryCatalogPage category="Acessórios" title="Acessórios para impressora 3D" description="Itens para manutenção, acabamento e uma rotina de impressão 3D mais produtiva." />;
}
