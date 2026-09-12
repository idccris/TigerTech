import type { Metadata } from "next";
import CategoryCatalogPage from "../../components/category-catalog-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Filamentos 3D PLA, PETG, ABS, TPU e especiais",
  description: "Compre filamentos 3D para impressora: PLA, PETG, ABS, TPU e materiais especiais em diversas cores, marcas e aplicações.",
  alternates: { canonical: "/filamentos" },
  openGraph: { title: "Filamentos 3D para impressão | Tiger Tech 3D", description: "PLA, PETG, ABS, TPU e materiais especiais em várias cores.", url: "/filamentos" },
};

export default function FilamentsPage() {
  return <CategoryCatalogPage category="Filamentos" title="Filamentos 3D" description="Encontre filamentos PLA, PETG, ABS, TPU e materiais especiais em diversas cores para sua impressora 3D." />;
}
