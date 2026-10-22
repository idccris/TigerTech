const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const { buildCatalogPdf } = require('../lib/catalog-pdf.ts');
const logo = fs.readFileSync(path.join(__dirname, '../public/tiger-tech-logo.png'));
const generatedAt = new Date('2026-09-24T12:00:00Z');
const machine = { slug: 'machine', name: 'Máquina demonstrativa', category: 'Impressoras 3D', brand: 'Teste',
  description: 'Descrição breve.', longDescription: 'Descrição completa para o cliente.', specificationsText: 'Volume: 250 x 250 x 250 mm',
  specs: ['Precisão: 0,1 mm'], benefits: [{ title: 'Facilidade', text: 'Operação intuitiva' }], stock: 987654,
  sku: 'CONFIDENTIAL-SKU', internalNote: 'PRIVATE-NOTE', priceCents: 123456789, visible: false, tone: 'orange', tag: '' };
function pdfText(pdf) { return [...pdf.toString('latin1').matchAll(/<([0-9A-F]+)> Tj/g)].map(m => Buffer.from(m[1], 'hex').toString('latin1')).join('\n'); }
function build(products, extra = {}) { return buildCatalogPdf({ products, logo, generatedAt, images: {}, curated: true, ...extra }); }
test('single machine includes full public description and technical details, not internal fields', () => {
  const text = pdfText(build([machine]));
  for (const value of [machine.name, machine.longDescription, machine.specificationsText, ...machine.specs, 'Operação intuitiva']) assert.ok(text.includes(value), value);
  for (const value of ['CONFIDENTIAL-SKU', 'PRIVATE-NOTE', '987654', '123456789', 'stock', 'visible']) assert.ok(!text.includes(value));
  assert.ok(text.includes('Gerado em 24 de setembro de 2026'));
  assert.ok(!text.includes('CATÁLOGO DE PRODUTOS'));
});
test('long specifications paginate without dropping their final lines', () => {
  const specs = Array.from({ length: 120 }, (_, n) => `Especificação técnica ${n}: informação completa cadastrada.`);
  const pdf = build([{ ...machine, specs }]);
  assert.ok(pdfText(pdf).includes(specs.at(-1)));
  assert.ok((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length > 2);
});
test('selection includes accessories and sold-out products without disclosing their stock', () => {
  const text = pdfText(build([{ ...machine, category: 'Acessórios', name: 'Kit de ferramentas', stock: 0 }, { ...machine, slug: 'other', name: 'Segunda máquina' }]));
  assert.ok(text.includes('CATÁLOGO DE PRODUTOS'));
  assert.ok(text.includes('Kit de ferramentas'));
  assert.ok(text.includes('Segunda máquina'));
  assert.ok(!text.includes(machine.longDescription));
});
test('filament uses the approved one-page layout and only includes visible in-stock colors', () => {
  const pdf = build([{ ...machine, category: 'Filamentos', filamentModel: 'PLA Basic',
    variants: [{ colorName: 'Azul', colorHex: '#2563eb', stock: 10, visible: true },
      { colorName: 'Preto', colorHex: '#111111', stock: 0, visible: true },
      { colorName: 'Oculta', colorHex: '#ff0000', stock: 5, visible: false }] }]);
  const content = pdfText(pdf);
  assert.ok(content.includes('CORES DISPONÍVEIS NO MOMENTO DA GERAÇÃO'));
  assert.ok(content.includes('Azul'));
  assert.ok(!content.includes('Preto'));
  assert.ok(!content.includes('Oculta'));
  assert.ok(!content.includes('CATÁLOGO DE PRODUTOS'));
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length, 1);
});
test('public catalog retains stock filtering', () => {
  const text = pdfText(build([{ ...machine, stock: 0 }], { curated: false }));
  assert.ok(!text.includes(machine.name));
});
test('multiple machines use four cards per page instead of one product per page', () => {
  const products = Array.from({ length: 92 }, (_, index) => ({ ...machine, slug: `machine-${index}`, name: `Modelo ${String(index + 1).padStart(3, '0')}` }));
  const pdf = build(products);
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length, 24);
  const text = pdfText(pdf);
  for (const product of products) assert.ok(text.includes(product.name));
  assert.ok(!text.includes(machine.longDescription));
});

// Isolated downloads: no production database or authentication writes.
let user = null;
let allowed = true;
function mock(relative, exports) { require.cache[require.resolve(relative)] = { id: relative, filename: relative, loaded: true, exports }; }
mock('../lib/admin-auth.ts', { requireUser: async () => user, isTrustedMutation: request => !request.headers.get('origin') || request.headers.get('origin') === 'https://shop.test', consumeRateLimit: async () => allowed, hashToken: value => value });
const { POST } = require('../app/api/admin/catalogo-pdf/route.ts');
const { machineCatalogs, selectMachineCatalogs } = require('../lib/machine-catalogs.ts');
function request(body, headers = {}) { return new Request('https://shop.test/api/admin/catalogo-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }); }

test('downloads require authentication and reject foreign origins', async () => {
  user = null;
  assert.equal((await POST(request({ ids: ['a1'] }))).status, 401);
  assert.equal((await POST(request({ ids: ['a1'] }, { origin: 'https://evil.test' }))).status, 403);
});
test('operators cannot download administrator catalogs', async () => {
  user = { username: 'test', role: 'operator' };
  assert.equal((await POST(request({ ids: ['a1'] }))).status, 403);
});
test('invalid, duplicate, stale and path traversal selections are rejected', async () => {
  user = { username: 'test', role: 'admin' };
  for (const ids of [[], null, [12], ['a1', 'a1'], ['../a1'], ['removed'], Array(10).fill('a1')])
    assert.equal((await POST(request({ ids }))).status, 400);
  assert.equal((await POST(request({ slugs: ['sku-0014'] }))).status, 400);
  assert.equal((await POST(new Request('https://shop.test/api/admin/catalogo-pdf', {method:'POST',body:'{'}))).status, 400);
  assert.equal(selectMachineCatalogs(null), null);
});
for (const catalog of machineCatalogs) {
  test(catalog.name + ' download preserves every original PDF byte', async () => {
    user = { username: 'test', role: 'admin' };
    const response = await POST(request({ ids: [catalog.id] }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'application/pdf');
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(response.headers.get('Content-Disposition'), 'attachment; filename="' + catalog.file + '"');
    const expected = fs.readFileSync(path.join(__dirname, '../assets/machine-catalogs', catalog.file));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected);
    assert.equal(expected.subarray(0, 5).toString(), '%PDF-');
  });
}
test('multiple selection returns ZIP containing only the selected original PDFs', async () => {
  user = { username: 'test', role: 'admin' };
  const response = await POST(request({ ids: ['a1', 'h2d'] }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/zip');
  const zip = Buffer.from(await response.arrayBuffer());
  let offset = 0;
  for (const id of ['a1', 'h2d']) {
    assert.equal(zip.readUInt32LE(offset), 0x04034b50);
    const size = zip.readUInt32LE(offset + 18);
    const nameLength = zip.readUInt16LE(offset + 26);
    const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString();
    const catalog = machineCatalogs.find(item => item.id === id);
    assert.equal(name, catalog.file);
    assert.deepEqual(zip.subarray(offset + 30 + nameLength, offset + 30 + nameLength + size),
      fs.readFileSync(path.join(__dirname, '../assets/machine-catalogs', catalog.file)));
    offset += 30 + nameLength + size;
  }
  assert.equal(zip.readUInt32LE(offset), 0x02014b50);
  assert.equal(zip.readUInt16LE(zip.length - 12), 2);
});
test('downloads enforce rate limits', async () => {
  user = { username: 'test', role: 'admin' }; allowed = false;
  assert.equal((await POST(request({ ids: ['a1'] }))).status, 429);
  allowed = true;
});
