const FILAMENT_COVERS: Record<string, string> = {
  "filamento-polymaker-panchroma-basic-pla":
    "/products/filaments/panchroma-basic-pla-cover.webp",
};

export function filamentCoverImage(groupSlug: string) {
  return FILAMENT_COVERS[groupSlug] || "";
}
