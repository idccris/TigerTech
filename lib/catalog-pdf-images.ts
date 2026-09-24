import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getProductImage } from "./db";
import { isAllowedRemoteProductImage } from "./product-images";
import type { Product } from "./products";
import type { CatalogImage } from "./catalog-pdf";

const MAX_BYTES = 8_000_000;
async function sourceBytes(source: string): Promise<Buffer | null> {
  const inline = source.match(/^data:image\/(?:png|jpe?g|webp|avif);base64,(.+)$/);
  if (inline) {
    if (inline[1].length > MAX_BYTES * 1.4) return null;
    return Buffer.from(inline[1], "base64");
  }
  if (source.startsWith("/api/products/image")) {
    const slug = new URL(source, "https://catalog.invalid").searchParams.get("slug");
    if (!slug) return null;
    const row = await getProductImage(slug);
    const stored = String(row?.image_url || "");
    if (stored.startsWith("/api/")) return null;
    return sourceBytes(stored);
  }
  if (source.startsWith("/") && !source.startsWith("//") && !source.startsWith("/api/")) {
    const root = path.resolve(process.cwd(), "public");
    const file = path.resolve(root, source.slice(1).split("?")[0]);
    if (!file.startsWith(root + path.sep)) return null;
    if ((await fs.stat(file)).size > MAX_BYTES) return null;
    return fs.readFile(file);
  }
  if (!isAllowedRemoteProductImage(source)) return null;
  const response = await fetch(source, { redirect: "error", signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } });
  if (!response.ok || Number(response.headers.get("content-length") || 0) > MAX_BYTES) return null;
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function loadCatalogImages(products: Product[]) {
  const images: Record<string, CatalogImage> = {};
  for (let index = 0; index < products.length; index += 8) {
    await Promise.all(products.slice(index, index + 8).map(async product => {
      const source = product.imageUrl || product.variants?.find(v => v.imageUrl)?.imageUrl;
      if (!source) return;
      try {
        const input = await sourceBytes(source);
        if (!input || input.length > MAX_BYTES) return;
        const data = await sharp(input, { limitInputPixels: 40_000_000 })
          .rotate().resize({ width: 1000, height: 700, fit: "inside", withoutEnlargement: true })
          .flatten({ background: "#ffffff" }).toColourspace("srgb").jpeg({ quality: 82 }).toBuffer();
        images[product.slug] = { data, mimeType: "image/jpeg" };
      } catch {
        console.warn("Imagem indisponível no catálogo PDF:", product.slug);
      }
    }));
  }
  return images;
}

