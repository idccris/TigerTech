// Local visual QA only; uses a repository image and explicitly fictional copy.
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const { buildCatalogPdf } = require('../lib/catalog-pdf.ts');
const { loadCatalogImages } = require('../lib/catalog-pdf-images.ts');
async function main() {
  const product = { slug: 'visual-test', name: 'Snapmaker U1 — demonstração de layout', brand: 'Snapmaker', category: 'Impressoras 3D',
    imageUrl: '/snapmaker-u1/u1-hero.png', stock: 0, description: 'Modelo demonstrativo para validação visual do catálogo.',
    longDescription: 'Esta ficha utiliza conteúdo fictício apenas para verificar o layout. A versão entregue ao cliente usa a descrição completa cadastrada no painel, sem incluir dados de estoque, preços ou identificadores internos.',
    specificationsText: Array.from({ length: 36 }, (_, n) => `Especificação de teste ${n + 1}: conteúdo técnico cadastrado para o equipamento.`).join('\n'),
    specs: ['Última especificação cadastrada.'], benefits: [], tone: 'orange' };
  const images = await loadCatalogImages([product]);
  if (!images[product.slug]) throw new Error('Machine image did not normalize');
  const options = { logo: fs.readFileSync('public/tiger-tech-logo.png'), generatedAt: new Date(), images, curated: true };
  fs.mkdirSync('tmp/pdfs', { recursive: true });
  fs.writeFileSync('tmp/pdfs/single-machine.pdf', buildCatalogPdf({ ...options, products: [product] }));
  fs.writeFileSync('tmp/pdfs/selection.pdf', buildCatalogPdf({ ...options, products: [{ ...product, name: 'Máquina demonstrativa', specificationsText: '' }, { ...product, slug: 'accessory', name: 'Acessório demonstrativo', category: 'Acessórios', imageUrl: '' }] }));
  console.log('Generated visual fixtures with normalized machine image.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
