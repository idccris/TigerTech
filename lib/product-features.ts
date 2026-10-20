import { sql } from "./db";
// A filament model occupies one slot, regardless of its number of colors.
export function trimFeaturedModels(db = sql()) {
  return db`WITH models AS (
    SELECT CASE WHEN group_slug<>'' THEN 'group:'||group_slug ELSE 'product:'||slug END AS model,
           MAX(featured_at) AS latest
    FROM products WHERE featured=true
    GROUP BY 1
    ORDER BY latest DESC NULLS LAST, model
    OFFSET 6
  ) UPDATE products SET featured=false,featured_at=NULL
    WHERE (CASE WHEN group_slug<>'' THEN 'group:'||group_slug ELSE 'product:'||slug END) IN (SELECT model FROM models)`;
}
