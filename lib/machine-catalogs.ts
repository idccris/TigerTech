export const machineCatalogs = [
  { id: "a1", name: "Bambu Lab A1", file: "bambu-lab-a1.pdf" },
  { id: "a1-mini", name: "Bambu Lab A1 Mini", file: "bambu-lab-a1-mini.pdf" },
  { id: "a2l", name: "Bambu Lab A2L", file: "bambu-lab-a2l.pdf" },
  { id: "h2c", name: "Bambu Lab H2C", file: "bambu-lab-h2c.pdf" },
  { id: "h2d", name: "Bambu Lab H2D", file: "bambu-lab-h2d.pdf" },
  { id: "h2s", name: "Bambu Lab H2S", file: "bambu-lab-h2s.pdf" },
  { id: "p1s", name: "Bambu Lab P1S", file: "bambu-lab-p1s.pdf" },
  { id: "p2s", name: "Bambu Lab P2S", file: "bambu-lab-p2s.pdf" },
  { id: "x1-carbon", name: "Bambu Lab X1 Carbon", file: "bambu-lab-x1-carbon.pdf" },
] as const;

export function selectMachineCatalogs(ids: unknown) {
  if (!Array.isArray(ids) || !ids.length || ids.length > machineCatalogs.length
    || ids.some(id => typeof id !== "string") || new Set(ids).size !== ids.length) return null;
  const selected = ids.map(id => machineCatalogs.find(catalog => catalog.id === id));
  return selected.some(item => !item) ? null : selected.filter(item => !!item);
}
