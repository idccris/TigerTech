import { deflateSync, inflateSync } from "node:zlib";
import type { Product } from "./products";

const W = 595.28;
const H = 841.89;
const ORANGE = [1, 0.353, 0] as const;
const BLACK = [0.035, 0.035, 0.04] as const;
const GRAY = [0.35, 0.37, 0.4] as const;
const LIGHT = [0.96, 0.965, 0.97] as const;

type RGB = readonly [number, number, number];
type DecodedPng = { width: number; height: number; rgb: Buffer };

function clean(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function latinHex(value: string) {
  const safe = clean(value)
    .replace(/[^\x20-\xFF]/g, "?")
    .slice(0, 5000);
  return Buffer.from(safe, "latin1").toString("hex").toUpperCase();
}

function wrap(value: string, maxChars: number) {
  const words = clean(value).split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (word.length > maxChars) {
      if (line) lines.push(line);
      for (let i = 0; i < word.length; i += maxChars) lines.push(word.slice(i, i + maxChars));
      line = "";
      continue;
    }
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function color(rgb: RGB) {
  return `${rgb[0]} ${rgb[1]} ${rgb[2]}`;
}

function rect(x: number, top: number, width: number, height: number, fill: RGB, stroke?: RGB) {
  const y = H - top - height;
  return `${color(fill)} rg ${stroke ? `${color(stroke)} RG 0.7 w` : ""} ${x} ${y} ${width} ${height} re ${stroke ? "B" : "f"}\n`;
}

function line(x1: number, top1: number, x2: number, top2: number, stroke: RGB, width = 1) {
  return `${color(stroke)} RG ${width} w ${x1} ${H - top1} m ${x2} ${H - top2} l S\n`;
}

function text(value: string, x: number, top: number, size: number, bold = false, fill: RGB = BLACK) {
  return `BT /${bold ? "F2" : "F1"} ${size} Tf ${color(fill)} rg 1 0 0 1 ${x} ${H - top - size} Tm <${latinHex(value)}> Tj ET\n`;
}

function paragraph(lines: string[], x: number, top: number, size: number, leading: number, fill: RGB = GRAY) {
  return lines.map((item, index) => text(item, x, top + index * leading, size, false, fill)).join("");
}

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(png: Buffer): DecodedPng | null {
  if (png.subarray(1, 4).toString("ascii") !== "PNG") return null;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette: Buffer | null = null;
  let transparency: Buffer | null = null;
  const idat: Buffer[] = [];
  for (let offset = 8; offset + 12 <= png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "PLTE") palette = data;
    else if (type === "tRNS") transparency = data;
    else if (type === "IDAT") idat.push(data);
    offset += length + 12;
  }
  if (!width || !height || bitDepth !== 8 || interlace !== 0) return null;
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  if (![0, 2, 3, 4, 6].includes(colorType)) return null;
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(stride * height);
  let input = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[input++];
    for (let x = 0; x < stride; x += 1) {
      const current = raw[input++];
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      const predicted =
        filter === 1 ? left :
        filter === 2 ? up :
        filter === 3 ? Math.floor((left + up) / 2) :
        filter === 4 ? paeth(left, up, upperLeft) : 0;
      pixels[y * stride + x] = (current + predicted) & 255;
    }
  }
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0, output = 0; i < width * height; i += 1) {
    let r = 255, g = 255, b = 255, a = 255;
    const pos = i * channels;
    if (colorType === 6) [r, g, b, a] = [pixels[pos], pixels[pos + 1], pixels[pos + 2], pixels[pos + 3]];
    else if (colorType === 2) [r, g, b] = [pixels[pos], pixels[pos + 1], pixels[pos + 2]];
    else if (colorType === 4) [r, g, b, a] = [pixels[pos], pixels[pos], pixels[pos], pixels[pos + 1]];
    else if (colorType === 0) [r, g, b] = [pixels[pos], pixels[pos], pixels[pos]];
    else if (palette) {
      const index = pixels[pos];
      r = palette[index * 3] ?? 255;
      g = palette[index * 3 + 1] ?? 255;
      b = palette[index * 3 + 2] ?? 255;
      a = transparency?.[index] ?? 255;
    }
    rgb[output++] = Math.round((r * a + 255 * (255 - a)) / 255);
    rgb[output++] = Math.round((g * a + 255 * (255 - a)) / 255);
    rgb[output++] = Math.round((b * a + 255 * (255 - a)) / 255);
  }
  return { width, height, rgb };
}

class Pdf {
  private objects: Array<Buffer | null> = [];
  reserve() {
    this.objects.push(null);
    return this.objects.length;
  }
  set(id: number, value: string | Buffer) {
    this.objects[id - 1] = Buffer.isBuffer(value) ? value : Buffer.from(value, "ascii");
  }
  add(value: string | Buffer) {
    const id = this.reserve();
    this.set(id, value);
    return id;
  }
  stream(dictionary: string, data: Buffer) {
    return this.add(Buffer.concat([
      Buffer.from(`<< ${dictionary} /Length ${data.length} >>\nstream\n`, "ascii"),
      data,
      Buffer.from("\nendstream", "ascii"),
    ]));
  }
  finish(root: number, info: number) {
    const header = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary");
    const parts: Buffer[] = [header];
    const offsets = [0];
    let length = header.length;
    this.objects.forEach((object, index) => {
      if (!object) throw new Error(`Objeto PDF ${index + 1} não definido`);
      offsets.push(length);
      const prefix = Buffer.from(`${index + 1} 0 obj\n`, "ascii");
      const suffix = Buffer.from("\nendobj\n", "ascii");
      parts.push(prefix, object, suffix);
      length += prefix.length + object.length + suffix.length;
    });
    const xref = length;
    let table = `xref\n0 ${this.objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= this.objects.length; i += 1) {
      table += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    table += `trailer\n<< /Size ${this.objects.length + 1} /Root ${root} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    parts.push(Buffer.from(table, "ascii"));
    return Buffer.concat(parts);
  }
}

function availableVariants(product: Product) {
  const variants = product.variants?.length ? product.variants : [product];
  return variants.filter((variant) => (variant.stock || 0) > 0);
}

function byBrandAndName(a: Product, b: Product) {
  return `${a.brand || ""} ${a.filamentModel || a.name}`.localeCompare(
    `${b.brand || ""} ${b.filamentModel || b.name}`,
    "pt-BR",
  );
}

export function buildCatalogPdf({
  products,
  logo,
  generatedAt,
}: {
  products: Product[];
  logo: Buffer;
  generatedAt: Date;
}) {
  const machines = products
    .filter((product) => product.category === "Impressoras 3D" && (product.stock || 0) > 0)
    .sort(byBrandAndName);
  const filaments = products
    .filter((product) => product.category === "Filamentos" && availableVariants(product).length > 0)
    .sort(byBrandAndName);
  const colors = filaments.reduce((total, product) => total + availableVariants(product).length, 0);
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(generatedAt);

  const pdf = new Pdf();
  const regular = pdf.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const bold = pdf.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const decodedLogo = decodePng(logo);
  const logoId = decodedLogo
    ? pdf.stream(
        `/Type /XObject /Subtype /Image /Width ${decodedLogo.width} /Height ${decodedLogo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode`,
        deflateSync(decodedLogo.rgb),
      )
    : null;
  const pagesId = pdf.reserve();
  const pageIds: number[] = [];
  const pages: string[] = [];

  function header() {
    let commands = rect(0, 0, W, 38, ORANGE);
    if (logoId) {
      commands += rect(W / 2 - 18, 4, 36, 30, [1, 1, 1]);
      commands += `q 26 0 0 26 ${W / 2 - 13} ${H - 32} cm /Logo Do Q\n`;
    } else {
      commands += text("TIGER TECH", W / 2 - 31, 13, 10, true, [1, 1, 1]);
    }
    return commands;
  }

  function footer(page: number) {
    return line(44, 804, W - 44, 804, [0.85, 0.86, 0.88], 0.6)
      + text("Disponibilidade sujeita a confirmacao no momento do pedido.", 44, 813, 7.5, false, GRAY)
      + text(String(page).padStart(2, "0"), W - 58, 813, 7.5, true, GRAY);
  }

  function addPage(commands: string) {
    pages.push(commands + footer(pages.length + 1));
  }

  let cover = header();
  cover += rect(0, 38, W, 250, BLACK);
  cover += text("CATALOGO", 48, 86, 15, true, ORANGE);
  cover += text("TIGER TECH", 48, 116, 38, true, [1, 1, 1]);
  cover += text("IMPRESSAO 3D", 48, 164, 38, true, [1, 1, 1]);
  cover += paragraph(
    wrap("Maquinas e filamentos disponiveis para transformar projetos em producao.", 54),
    48,
    222,
    11,
    15,
    [0.82, 0.83, 0.85],
  );
  cover += text("CATALOGO DE DISPONIBILIDADE", 48, 338, 11, true, ORANGE);
  cover += text(`Gerado em ${date}`, 48, 362, 13, true);
  cover += paragraph(
    wrap("Este documento e gerado diretamente pelo estoque da loja. Produtos e cores sem disponibilidade nao aparecem.", 66),
    48,
    398,
    10,
    14,
  );
  cover += rect(48, 480, 150, 84, LIGHT);
  cover += text(String(machines.length), 64, 494, 27, true, ORANGE);
  cover += text("MODELOS DE MAQUINAS", 64, 536, 8, true);
  cover += rect(218, 480, 150, 84, LIGHT);
  cover += text(String(filaments.length), 234, 494, 27, true, ORANGE);
  cover += text("TIPOS DE FILAMENTO", 234, 536, 8, true);
  cover += rect(388, 480, 150, 84, LIGHT);
  cover += text(String(colors), 404, 494, 27, true, ORANGE);
  cover += text("CORES DISPONIVEIS", 404, 536, 8, true);
  cover += rect(48, 630, 507, 80, ORANGE);
  cover += text("SEM PRECOS", 66, 649, 10, true, BLACK);
  cover += paragraph(
    wrap("Consulte a equipe Tiger Tech para valores, condicoes comerciais e confirmacao do estoque.", 70),
    66,
    671,
    10,
    14,
    BLACK,
  );
  addPage(cover);

  function categoryPage(titleValue: string, subtitle: string) {
    return header()
      + text(titleValue, 44, 64, 25, true)
      + paragraph(wrap(subtitle, 78), 44, 99, 9.5, 13)
      + rect(44, 126, 64, 4, ORANGE);
  }

  function addEmptySection(titleValue: string, subtitle: string) {
    let commands = categoryPage(titleValue, subtitle);
    commands += rect(44, 174, 507, 90, LIGHT);
    commands += text("Nenhum item disponivel nesta categoria.", 62, 198, 12, true);
    commands += text("O catalogo sera atualizado automaticamente quando o estoque mudar.", 62, 224, 9, false, GRAY);
    addPage(commands);
  }

  if (!machines.length) {
    addEmptySection("MAQUINAS 3D", "Modelos de impressoras disponiveis no estoque.");
  } else {
    let commands = categoryPage("MAQUINAS 3D", "Modelos de impressoras disponiveis no estoque.");
    let top = 154;
    for (const machine of machines) {
      const description = wrap(machine.description || machine.longDescription || "Impressora 3D disponivel para pronta consulta.", 76).slice(0, 3);
      const specs = machine.specs?.slice(0, 3).join("  |  ") || "";
      const specLines = specs ? wrap(specs, 88).slice(0, 2) : [];
      const height = 67 + description.length * 12 + specLines.length * 10;
      if (top + height > 786) {
        addPage(commands);
        commands = categoryPage("MAQUINAS 3D", "Continuacao dos modelos disponiveis.");
        top = 154;
      }
      commands += rect(44, top, 507, height, [1, 1, 1], [0.85, 0.86, 0.88]);
      commands += rect(44, top, 7, height, ORANGE);
      commands += text(machine.brand || machine.tag || "Tiger Tech", 66, top + 14, 8, true, ORANGE);
      commands += text(machine.name, 66, top + 30, 14, true);
      commands += paragraph(description, 66, top + 52, 9, 12);
      if (specLines.length) commands += paragraph(specLines, 66, top + 54 + description.length * 12, 7.5, 10, GRAY);
      top += height + 12;
    }
    addPage(commands);
  }

  if (!filaments.length) {
    addEmptySection("FILAMENTOS", "Modelos e cores disponiveis no estoque.");
  } else {
    let commands = categoryPage("FILAMENTOS", "Cada modelo aparece uma vez; abaixo dele estao somente as cores com estoque.");
    let top = 154;
    for (const filament of filaments) {
      const variants = availableVariants(filament);
      const colorNames = [...new Set(
        variants.map((variant) => clean(variant.colorName || variant.name)).filter(Boolean),
      )].sort((a, b) => a.localeCompare(b, "pt-BR"));
      const description = wrap(
        filament.description || filament.longDescription || "Filamento para impressao 3D disponivel em diversas cores.",
        79,
      ).slice(0, 3);
      const colorLines = wrap(`Cores disponiveis: ${colorNames.join(", ")}.`, 88);
      const height = 72 + description.length * 12 + colorLines.length * 10;
      if (top + height > 786) {
        addPage(commands);
        commands = categoryPage("FILAMENTOS", "Continuacao dos modelos e cores disponiveis.");
        top = 154;
      }
      commands += rect(44, top, 507, height, [1, 1, 1], [0.85, 0.86, 0.88]);
      commands += rect(44, top, 7, height, ORANGE);
      commands += text(filament.brand || filament.tag || "Filamento", 66, top + 13, 8, true, ORANGE);
      commands += text(filament.filamentModel || filament.name, 66, top + 29, 13, true);
      commands += paragraph(description, 66, top + 50, 8.8, 12);
      commands += paragraph(colorLines, 66, top + 55 + description.length * 12, 8, 10, BLACK);
      top += height + 12;
    }
    addPage(commands);
  }

  for (const commands of pages) {
    const contentId = pdf.stream("", Buffer.from(commands, "ascii"));
    const resources = `/Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >>${logoId ? ` /XObject << /Logo ${logoId} 0 R >>` : ""}`;
    const pageId = pdf.add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << ${resources} >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  }
  pdf.set(pagesId, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const catalog = pdf.add(`<< /Type /Catalog /Pages ${pagesId} 0 R /PageLayout /OneColumn >>`);
  const info = pdf.add(
    `<< /Title <${latinHex("Catalogo Tiger Tech")}> /Author <${latinHex("Tiger Tech")}> /Subject <${latinHex("Maquinas e filamentos disponiveis")}> /Creator <${latinHex("Tiger Tech")}> >>`,
  );
  return pdf.finish(catalog, info);
}
