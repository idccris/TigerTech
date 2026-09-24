import { ensureDb, sql } from "./db";
import { applyFilamentContents, parseFilamentContents } from "./filament-content";
import { filamentGroupSlug } from "./product-variants";
import type { Product } from "./products";

// Read lightweight catalogue data first. Embedded photographs are fetched only
// for selected models, avoiding a full image transfer for every individual PDF.
export async function listCatalogExportProducts(): Promise<Product[]> {
  await ensureDb();
  const [rows, contentRows] = await Promise.all([
    sql()`SELECT slug,name,category,tag,brand,description,long_description,
      specifications_text,specs,benefits,filament_model,group_slug,color_name,stock,visible,
      CASE WHEN image_url LIKE 'data:%' THEN '/api/products/image?slug=' || slug
           ELSE image_url END AS image_url
      FROM products ORDER BY updated_at DESC`,
    sql()`SELECT value FROM site_settings WHERE key='filament_type_content' LIMIT 1`,
  ]);
  const products: Product[] = rows.map(row => ({
    slug: String(row.slug), name: String(row.name), category: row.category as Product["category"],
    tag: String(row.tag || ""), brand: String(row.brand || row.tag || ""),
    description: String(row.description || ""), longDescription: String(row.long_description || ""),
    specificationsText: String(row.specifications_text || ""),
    specs: Array.isArray(row.specs) ? row.specs : [], benefits: Array.isArray(row.benefits) ? row.benefits : [],
    filamentModel: String(row.filament_model || ""),
    groupSlug: String(row.group_slug || (row.filament_model ? filamentGroupSlug(String(row.brand || row.tag || ""), String(row.filament_model)) : "")),
    colorName: String(row.color_name || ""), stock: Number(row.stock) || 0, visible: row.visible !== false,
    imageUrl: String(row.image_url || ""), tone: "orange",
  }));
  return applyFilamentContents(products, parseFilamentContents(String(contentRows[0]?.value || "")));
}
