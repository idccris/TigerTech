import AdminNavbar from "./admin-navbar";
import AdminCatalogExport from "./admin-catalog-export";
import AdminFilamentCatalogExport from "./admin-filament-catalog-export";
import { listCatalogExportProducts } from "../lib/catalog-export-products";
import { filamentCatalogOptions } from "../lib/filament-catalogs";

export default async function AdminCatalog() {
  const filamentOptions = filamentCatalogOptions(await listCatalogExportProducts());
  return <main className="admin-catalog-page">
    <AdminNavbar />
    <AdminCatalogExport />
    <AdminFilamentCatalogExport options={filamentOptions} />
  </main>;
}
