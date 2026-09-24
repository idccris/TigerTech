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
test('filament has one model and color names without separate variant pages', () => {
  const pdf = build([{ ...machine, category: 'Filamentos', filamentModel: 'PLA Basic', variants: [{ colorName: 'Azul', stock: 10 }, { colorName: 'Preto', stock: 0 }] }]);
  assert.ok(pdfText(pdf).includes('Azul, Preto'));
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length, 2);
});
test('public catalog retains stock filtering', () => {
  const text = pdfText(build([{ ...machine, stock: 0 }], { curated: false }));
  assert.ok(!text.includes(machine.name));
});

// Isolated API tests: no production database or authentication writes.
let user = null;
let rows = [machine];
let reads = 0;
let allowed = true;
function mock(relative, exports) { require.cache[require.resolve(relative)] = { id: relative, filename: relative, loaded: true, exports }; }
mock('../lib/catalog-export-products.ts', { listCatalogExportProducts: async () => { reads++; return rows; } });
mock('../lib/admin-auth.ts', { requireUser: async () => user, isTrustedMutation: request => !request.headers.get('origin') || request.headers.get('origin') === 'https://shop.test', consumeRateLimit: async () => allowed, hashToken: value => value });
mock('../lib/catalog-pdf-images.ts', { loadCatalogImages: async () => ({}) });
const { POST } = require('../app/api/admin/catalogo-pdf/route.ts');
function request(body, headers = {}) { return new Request('https://shop.test/api/admin/catalogo-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }); }
test('export requires authentication and rejects foreign origins before reading products', async () => {
  reads = 0; user = null;
  assert.equal((await POST(request({ slugs: ['machine'] }))).status, 401);
  assert.equal((await POST(request({ slugs: ['machine'] }, { origin: 'https://evil.test' }))).status, 403);
  assert.equal(reads, 0);
});
test('selection validation rejects empty, stale and malformed selections', async () => {
  user = { username: 'test', role: 'admin' };
  for (const slugs of [[], null, [12], Array(1001).fill('machine')]) assert.equal((await POST(request({ slugs }))).status, 400);
  assert.equal((await POST(request({ slugs: ['removed'] }))).status, 409);
});
test('authenticated export returns only selected products as a private PDF', async () => {
  user = { username: 'test', role: 'operator' }; rows = [machine, { ...machine, slug: 'omitted', name: 'OMITTED-PRODUCT' }];
  const response = await POST(request({ slugs: ['machine'], stock: 'PRIVATE-INPUT' }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  const text = pdfText(Buffer.from(await response.arrayBuffer()));
  assert.ok(text.includes(machine.name));
  assert.ok(!text.includes('OMITTED-PRODUCT'));
  assert.ok(!text.includes('PRIVATE-INPUT'));
});
test('excessive generation is rate limited', async () => {
  user = { username: 'test' }; allowed = false;
  assert.equal((await POST(request({ slugs: ['machine'] }))).status, 429);
  allowed = true;
});
