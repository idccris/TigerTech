const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(
  fs.readFileSync(filename, "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }, fileName: filename },
).outputText, filename);

const { filamentCatalogOptions, selectFilamentCatalogs } = require("../lib/filament-catalogs.ts");

const base = {
  category: "Filamentos", tag: "Bambu Lab", brand: "Bambu Lab", filamentModel: "PLA Silk",
  groupSlug: "filamento-bambu-lab-pla-silk", name: "PLA Silk", visible: true, stock: 10,
  description: "", longDescription: "", specificationsText: "", specs: [], benefits: [], tone: "orange",
};

test("filament catalog appears once with model before brand and only available colors counted", () => {
  const options = filamentCatalogOptions([
    { ...base, slug: "silk-blue", colorName: "Azul" },
    { ...base, slug: "silk-red", colorName: "Vermelho", stock: 4 },
    { ...base, slug: "silk-black", colorName: "Preto", stock: 0 },
    { ...base, slug: "silk-hidden", colorName: "Oculta", visible: false },
  ]);
  assert.equal(options.length, 1);
  assert.equal(options[0].name, "PLA Silk Bambu Lab");
  assert.equal(options[0].colorCount, 2);
});

test("filament catalog selection rejects duplicates and unknown groups", () => {
  const options = filamentCatalogOptions([{ ...base, slug: "silk-blue", colorName: "Azul" }]);
  assert.deepEqual(selectFilamentCatalogs([options[0].id], options), options);
  assert.equal(selectFilamentCatalogs([options[0].id, options[0].id], options), null);
  assert.equal(selectFilamentCatalogs(["unknown"], options), null);
});
