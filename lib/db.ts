import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { products as defaults, type Product } from "./products";
import { groupProducts } from "./product-variants";
import { applyFilamentContents, parseFilamentContents } from "./filament-content";

const SCHEMA_VERSION = "2026-08-30-security-v2";
function sql() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL não configurado");
  return neon(process.env.DATABASE_URL);
}

let databaseReady: Promise<void> | null = null;

async function initializeDb() {
  const db = sql();
  try {
    const version = await db`SELECT value FROM site_settings WHERE key='schema_version' LIMIT 1`;
    if (version[0]?.value === SCHEMA_VERSION) return;
  } catch {
    // Primeira inicialização: as tabelas ainda serão criadas abaixo.
  }
  await db`CREATE TABLE IF NOT EXISTS products (slug TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, tag TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', long_description TEXT NOT NULL DEFAULT '', specs JSONB NOT NULL DEFAULT '[]', benefits JSONB NOT NULL DEFAULT '[]', tone TEXT NOT NULL DEFAULT 'orange', image_url TEXT NOT NULL DEFAULT '', stock INTEGER NOT NULL DEFAULT 0, visible BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT NOT NULL DEFAULT ''`;
  await db`CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique ON products (LOWER(sku)) WHERE sku <> ''`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT ''`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT true`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ`;
  await db`UPDATE products SET featured_at=updated_at WHERE featured=true AND featured_at IS NULL`;
  await db`UPDATE products SET featured=false,featured_at=NULL WHERE slug IN (SELECT slug FROM products WHERE featured=true ORDER BY featured_at DESC NULLS LAST OFFSET 6)`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications_text TEXT NOT NULL DEFAULT ''`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0`;
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS card_price_cents INTEGER NOT NULL DEFAULT 0`;
  await db`UPDATE products SET card_price_cents=price_cents WHERE card_price_cents=0 AND price_cents>0`;
  await db`ALTER TABLE products ALTER COLUMN featured SET DEFAULT false`;
  await db`CREATE TABLE IF NOT EXISTS categories (name TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`INSERT INTO categories(name) VALUES ('Impressoras 3D'),('Filamentos'),('Acessórios') ON CONFLICT DO NOTHING`;
  await db`CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, password_hash TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'`;
  await db`ALTER TABLE admins ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT ''`;
  await db`ALTER TABLE admins ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true`;
  await db`CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`;
  await db`CREATE TABLE IF NOT EXISTS security_rate_limits (key_hash TEXT PRIMARY KEY, attempt_count INTEGER NOT NULL DEFAULT 0, window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_document TEXT NOT NULL DEFAULT '', customer_address TEXT NOT NULL DEFAULT '', items JSONB NOT NULL, total_cents INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'Recebido', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT ''`;
  await db`ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'Recebido'`;
  await db`UPDATE orders SET status='Recebido' WHERE status='Novo'`;
  const adminCount = await db`SELECT COUNT(*)::int count FROM admins`;
  if (Number(adminCount[0]?.count) === 0) {
    const initialUsername = String(process.env.ADMIN_INITIAL_USERNAME || "").trim().toLowerCase();
    const initialPassword = String(process.env.ADMIN_INITIAL_PASSWORD || "");
    if (initialUsername && initialPassword.length >= 12) {
      const initialHash = await bcrypt.hash(initialPassword, 12);
      await db`INSERT INTO admins (username,password_hash,display_name,role,active,updated_at) VALUES (${initialUsername},${initialHash},${initialUsername},'admin',true,NOW()) ON CONFLICT DO NOTHING`;
    }
  }
  await db`DELETE FROM admin_sessions WHERE expires_at<=NOW()`;
  await db`DELETE FROM security_rate_limits WHERE window_started_at<NOW()-INTERVAL '24 hours'`;
  const count = await db`SELECT COUNT(*)::int count FROM products`;
  if (count[0].count === 0)
    for (const p of defaults)
      await db`INSERT INTO products (slug,name,category,tag,description,long_description,specs,benefits,tone,stock,visible) VALUES (${p.slug},${p.name},${p.category},${p.tag},${p.description},${p.longDescription},${JSON.stringify(p.specs)},${JSON.stringify(p.benefits)},${p.tone},0,true) ON CONFLICT DO NOTHING`;
  await db`INSERT INTO site_settings(key,value,updated_at) VALUES ('schema_version',${SCHEMA_VERSION},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`;
}

export async function ensureDb() {
  if (!databaseReady) {
    databaseReady = initializeDb().then(async () => {
      const db = sql();
      const version = await db`SELECT value FROM site_settings WHERE key='filament_variants_schema' LIMIT 1`;
      if (version[0]?.value === "2") return;
      await db.transaction([
        db`ALTER TABLE products ADD COLUMN IF NOT EXISTS filament_model TEXT NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS color_name TEXT NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS color_hex TEXT NOT NULL DEFAULT ''`,
        db`CREATE TABLE IF NOT EXISTS filament_types (name TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
        db`INSERT INTO filament_types(name) VALUES ('BASIC'),('MATTE'),('SILK') ON CONFLICT DO NOTHING`,
        db`INSERT INTO filament_types(name) SELECT DISTINCT filament_model FROM products WHERE filament_model<>'' ON CONFLICT DO NOTHING`,
        db`INSERT INTO site_settings(key,value,updated_at) VALUES ('filament_variants_schema','2',NOW()) ON CONFLICT(key) DO UPDATE SET value='2',updated_at=NOW()`,
      ]);
    }).catch((error) => {
      databaseReady = null;
      throw error;
    });
  }
  return databaseReady;
}

export async function listProducts(includeHidden = false) {
  await ensureDb();
  const rows = includeHidden
    ? await sql()`SELECT * FROM products ORDER BY updated_at DESC`
    : await sql()`SELECT * FROM products WHERE visible=true AND (stock>0 OR filament_model<>'') ORDER BY updated_at DESC`;
  const contentRows = await sql()`SELECT value FROM site_settings WHERE key='filament_type_content' LIMIT 1`;
  return applyFilamentContents(rows.map(rowToProduct), parseFilamentContents(String(contentRows[0]?.value || "")));
}
export async function listFeaturedProducts() {
  const products = await listProducts(false);
  return groupProducts(products)
    .filter((product) => (product.variants || [product]).some((variant) => variant.featured))
    .sort((a, b) => {
      const date = (p: Product) => Math.max(0, ...(p.variants || [p]).filter((v) => v.featured).map((v) => Date.parse(v.featuredAt || "") || 0));
      return date(b) - date(a);
    })
    .slice(0, 6)
    .flatMap((product) => product.variants || [product]);
}
export async function findProduct(slug: string) {
  await ensureDb();
  const rows = await sql()`SELECT * FROM products WHERE slug=${slug} AND visible=true AND (stock>0 OR filament_model<>'') LIMIT 1`;
  if (!rows[0]) return null;
  const contentRows = await sql()`SELECT value FROM site_settings WHERE key='filament_type_content' LIMIT 1`;
  return applyFilamentContents([rowToProduct(rows[0])], parseFilamentContents(String(contentRows[0]?.value || "")))[0];
}
export async function listFilamentTypes() {
  await ensureDb();
  const rows = await sql()`SELECT name FROM filament_types ORDER BY name`;
  return rows.map((row) => String(row.name));
}
function rowToProduct(r: any): Product & {
  stock: number;
  visible: boolean;
  featured: boolean;
  imageUrl: string;
  sku: string;
  brand: string;
  updatedAt: string | undefined;
} {
  return {
    slug: r.slug,
    name: r.name,
    filamentModel: r.filament_model || "",
    colorName: r.color_name || "",
    colorHex: r.color_hex || "",
    category: r.category,
    tag: r.tag,
    description: r.description,
    longDescription: r.long_description,
    specificationsText: r.specifications_text || "",
    specs: r.specs,
    benefits: r.benefits,
    tone: r.tone,
    stock: r.stock,
    visible: r.visible,
    featured: r.featured,
    imageUrl: r.image_url,
    sku: r.sku || r.slug.toUpperCase(),
    brand: r.brand || r.tag,
    priceCents: Number(r.price_cents) || 0,
    cardPriceCents: Number(r.card_price_cents) || 0,
    featuredAt: r.featured_at?.toISOString?.() || r.featured_at || undefined,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at || undefined,
  };
}
export async function listOrders() {
  await ensureDb();
  return sql()`SELECT * FROM orders ORDER BY created_at DESC`;
}
export async function getSiteSetting(key: string) {
  await ensureDb();
  const rows =
    await sql()`SELECT value FROM site_settings WHERE key=${key} LIMIT 1`;
  return String(rows[0]?.value || "");
}
export async function getSiteSettingMeta(key: string) {
  await ensureDb();
  const rows = await sql()`SELECT LENGTH(value)::int size,updated_at FROM site_settings WHERE key=${key} LIMIT 1`;
  return rows[0] || null;
}
export async function getProductImage(slug: string) {
  await ensureDb();
  const rows = await sql()`SELECT image_url,updated_at FROM products WHERE slug=${slug} LIMIT 1`;
  return rows[0] || null;
}
export async function getOrdersPage(page = 1, pageSize = 10) {
  await ensureDb();
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(50, Math.floor(pageSize)));
  const offset = (safePage - 1) * safeSize;
  const [orders, count] = await Promise.all([
    sql()`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${safeSize} OFFSET ${offset}`,
    sql()`SELECT COUNT(*)::int AS total FROM orders`,
  ]);
  return { orders, total: Number(count[0]?.total) || 0 };
}
export { sql };
