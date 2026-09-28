const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true }, fileName: filename,
  }).outputText, filename);
}
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { contentSlug } = require('../lib/content-posts.ts');
const ContentBody = require('../components/content-body.tsx').default;

test('content URLs are readable, accent safe and limited', () => {
  assert.equal(contentSlug('PLA ou PETG: qual escolher?'), 'pla-ou-petg-qual-escolher');
  assert.equal(contentSlug('  Impressão 3D para Educação  '), 'impressao-3d-para-educacao');
  assert.ok(contentSlug('a'.repeat(150)).length <= 100);
});

test('article body renders headings, paragraphs and lists without injecting HTML', () => {
  const html = renderToStaticMarkup(React.createElement(ContentBody, { body: '## Materiais\n\nTexto <script>alert(1)</script>.\n\n- PLA\n- PETG' }));
  assert.match(html, /<h2>Materiais<\/h2>/);
  assert.match(html, /<li>PLA<\/li>/);
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('content publishing endpoint is restricted to administrators', () => {
  const source = fs.readFileSync(require.resolve('../app/api/admin/conteudos/route.ts'), 'utf8');
  assert.match(source, /requireAdmin\(\)/);
  assert.match(source, /isTrustedMutation\(req\)/);
});
