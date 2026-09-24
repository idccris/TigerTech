const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    module._compile(result.outputText, filename);
  };
}
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { filamentGroupSlug, groupProducts, groupProductsForAdmin, productGroupKey, cartProductName, productMatches } = require('../lib/product-variants.ts');
const ColorSwatches = require('../components/color-swatches.tsx').default;
const ProductCard = require('../components/product-card.tsx').default;
const FilamentFields = require('../components/filament-fields.tsx').default;
const { CartProvider } = require('../components/cart-provider.tsx');
const ProductDetail = require('../components/product-detail.tsx').default;
const ProductImageEditor = require('../components/product-image-editor.tsx').default;
const { filamentCatalogRows } = require('../lib/filament-catalog.ts');
const { storefrontProductImage, storefrontProductImages } = require('../lib/product-images.ts');
const { applyFilamentContents, completeFilamentContents, parseFilamentContents } = require('../lib/filament-content.ts');

const blue = { slug: 'pla-blue', sku: 'PLA-BL', name: 'PLA Azul', category: 'Filamentos', filamentModel: 'PLA Basic 1 kg', brand: 'Maker', colorName: 'Azul', colorHex: '#2563eb', stock: 3, visible: true, priceCents: 9000, cardPriceCents: 10000, description: 'Filamento', longDescription: 'Filamento de teste', specs: [], benefits: [], tone: 'blue' };
const red = { ...blue, slug: 'pla-red', sku: 'PLA-RD', name: 'PLA Vermelho', colorName: 'Vermelho', colorHex: '#ff0000', stock: 0, priceCents: 9500 };

test('one card per model, including sold-out color; inputs remain unchanged', () => {
  const grouped = groupProducts([red, blue]);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].slug, 'filamento-maker-pla-basic-1-kg');
  assert.equal(grouped[0].selectedVariantSlug, blue.slug);
  assert.deepEqual(grouped[0].variants.map(v => v.slug), ['pla-blue', 'pla-red']);
  assert.equal(blue.variants, undefined);
});
test('admin groups all colors while preserving stock by SKU', () => {
  const grouped = groupProductsForAdmin([blue, red]);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].stock, 3);
  assert.equal(grouped[0].variants.length, 2);
  assert.equal(grouped[0].variants[1].sku, 'PLA-RD');
});
test('filament group URLs are stable and accent safe', () => {
  assert.equal(filamentGroupSlug('Bambu Lab', 'PETG Translucent'), 'filamento-bambu-lab-petg-translucent');
  assert.equal(filamentGroupSlug('Marca Açúcar', 'PLA Coração'), 'filamento-marca-acucar-pla-coracao');
});
test('the imported catalog becomes one page per filament model', () => {
  const rows = filamentCatalogRows();
  assert.equal(rows.length, 614);
  assert.equal(new Set(rows.map((row) => row.group_slug)).size, 77);
});
test('official remote images avoid an extra database proxy request', () => {
  assert.equal(storefrontProductImage({ slug: 'blue', imageUrl: 'https://store.bblcdn.com/sample.webp' }), 'https://store.bblcdn.com/sample.webp');
  assert.equal(storefrontProductImage({ slug: 'custom', imageUrl: 'data:image/png;base64,AA==', updatedAt: '2' }), '/api/products/image?slug=custom&v=2');
});
test('product gallery keeps the main storefront image and at most three additional photos', () => {
  const images = storefrontProductImages({
    slug: 'printer',
    imageUrl: 'data:image/png;base64,AA==',
    imageUrls: ['data:image/png;base64,AA==', '/api/products/image?slug=printer&index=1', '/api/products/image?slug=printer&index=2', '/api/products/image?slug=printer&index=3', '/extra'],
    updatedAt: '5',
  });
  assert.deepEqual(images, ['/api/products/image?slug=printer&v=5', '/api/products/image?slug=printer&index=1', '/api/products/image?slug=printer&index=2', '/api/products/image?slug=printer&index=3']);
});
test('different materials, weights and brands remain separate', () => {
  assert.equal(groupProducts([blue, { ...blue, slug: 'petg', filamentModel: 'PETG 1 kg' }, { ...blue, slug: 'pla2', filamentModel: 'PLA Basic 2 kg' }, { ...blue, slug: 'other', brand: 'Other' }]).length, 4);
});
test('group identity normalizes case and repeated spaces', () => {
  assert.equal(productGroupKey(blue), productGroupKey({ ...red, brand: ' maker ', filamentModel: ' pla   basic 1 KG ' }));
});
test('hidden colors and entirely sold-out groups are not listed', () => {
  assert.equal(groupProducts([red]).length, 0);
  assert.equal(groupProducts([blue, { ...red, visible: false }])[0].variants.length, 1);
});
test('printers and ungrouped legacy filaments are unchanged', () => {
  const printer = { ...blue, category: 'Impressoras 3D', name: 'Impressora', slug: 'printer' };
  assert.equal(groupProducts([printer, { ...printer, slug: 'printer2' }]).length, 2);
  assert.equal(cartProductName(printer), 'Impressora');
  assert.equal(groupProducts([{ ...blue, filamentModel: '' }, { ...red, filamentModel: '', stock: 1 }]).length, 2);
});
test('cart names and search retain specific colors and model', () => {
  assert.equal(cartProductName(blue), 'PLA Basic 1 kg — Azul');
  assert.equal(cartProductName(red), 'PLA Basic 1 kg — Vermelho');
  assert.equal(productMatches(groupProducts([blue, red])[0], 'vermelho'), true);
});
test('swatches expose selected and sold-out states accessibly', () => {
  const html = renderToStaticMarkup(React.createElement(ColorSwatches, { variants: [blue, red], selected: red, onSelect() {} }));
  assert.match(html, /Vermelho — Esgotada/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /background-color:#ff0000/);
});
test('card displays one model, two colors, and full card total', () => {
  const html = renderToStaticMarkup(React.createElement(ProductCard, { product: groupProducts([blue, red])[0] }));
  assert.match(html, /PLA Basic 1 kg/);
  assert.equal((html.match(/class="color-swatch/g) || []).length, 3); // wrapper and 2 buttons
  assert.match(html, /10X NO CARTÃO/);
  assert.match(html, /100,00/);
});
test('sold-out detail cannot add to cart', () => {
  const html = renderToStaticMarkup(React.createElement(CartProvider, null, React.createElement(ProductDetail, { product: { ...red, variants: [blue, red] } })));
  assert.match(html, /class="buy-button" disabled=""/);
  assert.match(html, /Cor esgotada/);
});
test('product detail renders gallery thumbnails for up to four photos', () => {
  const images = Array.from({ length: 4 }, (_, index) => `/api/products/image?slug=printer&index=${index}`);
  const html = renderToStaticMarkup(React.createElement(CartProvider, null, React.createElement(ProductDetail, { product: { ...blue, category: 'Impressoras 3D', slug: 'printer', imageUrl: images[0], imageUrls: images } })));
  assert.equal((html.match(/aria-label="Ver foto /g) || []).length, 4);
  assert.match(html, /Outras fotos do produto/);
});
test('admin image editor provides exactly four accessible photo slots', () => {
  const html = renderToStaticMarkup(React.createElement(ProductImageEditor, { images: [], onChange() {}, onError() {} }));
  assert.equal((html.match(/type="file"/g) || []).length, 4);
  assert.match(html, /Foto principal/);
  assert.match(html, /Foto 4/);
});
test('variant fields are limited to filaments', () => {
  assert.equal(renderToStaticMarkup(React.createElement(FilamentFields, { value: { category: 'Impressoras 3D' }, onChange() {} })), '');
  const html = renderToStaticMarkup(React.createElement(FilamentFields, { value: blue, onChange() {} }));
  assert.match(html, /Tipo\/modelo do filamento/);
  assert.match(html, /SILK/);
});
test('shared filament content applies to every color of the same type', () => {
  const content = [{ typeName: 'PLA Basic 1 kg', description: 'Descrição compartilhada', longDescription: 'Detalhes', specificationsText: 'Ficha técnica', specs: ['1 kg'], benefits: [{ icon: '✦', title: 'A', text: 'B' }, { icon: '⚡', title: 'C', text: 'D' }, { icon: '✓', title: 'E', text: 'F' }] }];
  const updated = applyFilamentContents([blue, red], content);
  assert.equal(updated[0].description, 'Descrição compartilhada');
  assert.equal(updated[1].specificationsText, 'Ficha técnica');
  assert.equal(blue.description, 'Filamento');
});
test('design creates editable cards for every registered filament type', () => {
  const contents = completeFilamentContents(['MATTE', 'SILK'], [], parseFilamentContents('[]'));
  assert.deepEqual(contents.map((item) => item.typeName), ['MATTE', 'SILK']);
  assert.equal(contents[0].benefits.length, 3);
});
