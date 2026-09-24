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

export type CatalogImage = {
  data: Buffer;
  mimeType: string;
};

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

function jpegDimensions(data: Buffer) {
  if (data[0] !== 0xff || data[1] !== 0xd8) return null;
  for (let offset = 2; offset + 9 < data.length;) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = data[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = data.readUInt16BE(offset + 2);
    if (!length) return null;
    offset += length + 2;
  }
  return null;
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
  images,
  curated = false,
}: {
  products: Product[];
  logo: Buffer;
  generatedAt: Date;
  images: Record<string, CatalogImage>;
  curated?: boolean;
}) {
  const machines = products
    .filter((product) => product.category === "Impressoras 3D" && (product.stock || 0) > 0)
    .sort(byBrandAndName);
  const filaments = products
    .filter((product) => product.category === "Filamentos" && availableVariants(product).length > 0)
    .sort(byBrandAndName);
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
  const embeddedImages = new Map<string, { name: string; id: number; width: number; height: number }>();
  let imageNumber = 0;
  for (const [key, image] of Object.entries(images)) {
    const jpeg = image.mimeType.includes("jpeg") ? jpegDimensions(image.data) : null;
    const png = !jpeg ? decodePng(image.data) : null;
    if (!jpeg && !png) continue;
    imageNumber += 1;
    const dimensions = jpeg || png!;
    const id = jpeg
      ? pdf.stream(
          `/Type /XObject /Subtype /Image /Width ${dimensions.width} /Height ${dimensions.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,
          image.data,
        )
      : pdf.stream(
          `/Type /XObject /Subtype /Image /Width ${dimensions.width} /Height ${dimensions.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode`,
          deflateSync(png!.rgb),
        );
    embeddedImages.set(key, { name: `P${imageNumber}`, id, ...dimensions });
  }
  const pagesId = pdf.reserve();
  const pageIds: number[] = [];
  const pages: string[] = [];

  function productImage(product: Product, x: number, top: number, width: number, height: number) {
    const embedded = embeddedImages.get(product.slug);
    let commands = rect(x, top, width, height, LIGHT);
    if (!embedded) {
      commands += text(curated ? "Foto não disponível" : "TIGER TECH", x + 14, top + height / 2 - 5, 8, true, GRAY);
      return commands;
    }
    const scale = Math.min(width / embedded.width, height / embedded.height);
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawTop = top + (height - drawHeight) / 2;
    commands += `q ${drawWidth} 0 0 ${drawHeight} ${drawX} ${H - drawTop - drawHeight} cm /${embedded.name} Do Q\n`;
    return commands;
  }

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
      + text(curated ? `Tiger Tech | Gerado em ${date}` : "Disponibilidade sujeita a confirmacao no momento do pedido.", 44, 813, 7.5, false, GRAY)
      + text(String(page).padStart(2, "0"), W - 58, 813, 7.5, true, GRAY);
  }

  function addPage(commands: string) {
    pages.push(commands + footer(pages.length + 1));
  }

  if (curated) {
    const singleMachine = products.length === 1 && products[0].category === "Impressoras 3D";
    if (!singleMachine) {
      let intro = header() + rect(0, 38, W, 250, BLACK);
      intro += text("TIGER TECH", 48, 110, 38, true, [1, 1, 1]);
      intro += text("CATÁLOGO DE PRODUTOS", 48, 175, 23, true, ORANGE);
      intro += text(`Gerado em ${date}`, 48, 340, 12);
      intro += paragraph(wrap("Uma seleção de soluções para transformar suas ideias em projetos reais.", 65), 48, 382, 12, 17);
      intro += text("Conheça os produtos nas próximas páginas.", 48, 465, 11, false, GRAY);
      addPage(intro);
    }
    if (!singleMachine) {
      const categories = [...new Set(products.map(product => product.category))];
      const compactLines = (value: string, width: number, limit: number) => {
        const lines = wrap(value, width);
        if (lines.length <= limit) return lines;
        return [...lines.slice(0, limit - 1), lines[limit - 1].replace(/\s+\S*$/, "") + "..."];
      };
      for (const category of categories) {
        const categoryHeader = () => header()
          + text(category.toLocaleUpperCase("pt-BR"), 44, 64, 24, true)
          + text("Seleção de produtos Tiger Tech", 44, 101, 10, false, GRAY)
          + rect(44, 124, 64, 4, ORANGE);
        let commands = categoryHeader();
        let top = 142;
        for (const product of products.filter(p => p.category === category).sort(byBrandAndName)) {
          const details = category === "Filamentos"
            ? "Cores: " + [...new Set((product.variants || [product]).map(p => p.colorName).filter(Boolean))].join(", ")
            : (product.specs || []).slice(0, 3).join(" | ");
          const detailLines = category === "Filamentos" ? wrap(details, 57) : compactLines(details, 57, 3);
          const height = Math.max(148, 118 + detailLines.length * 10);
          if (top + height > 786) {
            addPage(commands);
            commands = categoryHeader();
            top = 142;
          }
          commands += rect(44, top, 507, height, [1, 1, 1], [0.85, 0.86, 0.88]);
          commands += rect(44, top, 7, height, ORANGE);
          commands += productImage(product, 62, top + 13, 124, 122);
          commands += text(product.brand || "Tiger Tech", 204, top + 15, 8, true, ORANGE);
          commands += paragraph(compactLines(product.filamentModel || product.name, 36, 2), 204, top + 33, 14, 17, BLACK);
          commands += paragraph(compactLines(product.description, 56, 2), 204, top + 74, 8.8, 11, GRAY);
          commands += paragraph(detailLines, 204, top + 108, 7.7, 10, BLACK);
          top += height + 12;
        }
        addPage(commands);
      }
    }
    for (const product of singleMachine ? products : []) {
      let commands = header();
      let top = 62;
      const title = product.filamentModel || product.name;
      commands += text(`${product.brand || "Tiger Tech"} | ${product.category}`, 44, top, 10, true, ORANGE);
      top += 22;
      const titles = wrap(title, 32);
      commands += paragraph(titles, 44, top, 22, 27, BLACK);
      top += titles.length * 27 + 14;
      const imageHeight = singleMachine ? 235 : 170;
      commands += productImage(product, 44, top, 507, imageHeight);
      top += imageHeight + 22;
      const append = (heading: string, value: string) => {
        if (!clean(value)) return;
        if (top > 728) {
          addPage(commands);
          const continuationTitle = wrap(title, 50);
          commands = header() + paragraph(continuationTitle, 44, 62, 14, 18);
          top = 80 + continuationTitle.length * 18;
        }
        commands += text(heading, 44, top, 11, true, ORANGE);
        top += 24;
        for (const sourceLine of value.split(/\r?\n/)) {
          for (const content of wrap(sourceLine, 72)) {
            if (top > 774) {
              addPage(commands);
              const continuationTitle = wrap(title, 50);
              commands = header() + paragraph(continuationTitle, 44, 62, 14, 18);
              top = 80 + continuationTitle.length * 18;
              commands += text(heading + " (continuação)", 44, top, 11, true, ORANGE);
              top += 24;
            }
            commands += text(content, 44, top, 10, false, GRAY);
            top += 15;
          }
        }
        top += 16;
      };
      append("DESCRIÇÃO", singleMachine ? product.longDescription || product.description : product.description);
      if (singleMachine) {
        const details = [product.specificationsText || "", ...(product.specs || [])].filter(Boolean).join("\n");
        append("ESPECIFICAÇÕES TÉCNICAS", details || "Consulte nossa equipe para mais informações técnicas.");
        append("DESTAQUES", (product.benefits || []).filter((b) => b.title || b.text).map((b) => [b.title, b.text].filter(Boolean).join(": ")).join("\n"));
      } else if (product.category === "Filamentos") {
        append("CORES", [...new Set((product.variants || [product]).map((p) => p.colorName).filter(Boolean))].join(", "));
      } else {
        append("DESTAQUES", (product.specs || []).join("\n"));
      }
      addPage(commands);
    }
  } else {
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
  cover += rect(48, 500, 507, 80, ORANGE);
  cover += text("SEM PRECOS", 66, 519, 10, true, BLACK);
  cover += paragraph(
    wrap("Consulte a equipe Tiger Tech para valores, condicoes comerciais e confirmacao do estoque.", 70),
    66,
    541,
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
      const description = wrap(
        machine.description || "Impressora 3D disponivel para diferentes projetos.",
        54,
      ).slice(0, 2);
      const specs = machine.specs?.slice(0, 3).join("  |  ") || "Disponivel em estoque";
      const height = 148;
      if (top + height > 786) {
        addPage(commands);
        commands = categoryPage("MAQUINAS 3D", "Continuacao dos modelos disponiveis.");
        top = 154;
      }
      commands += rect(44, top, 507, height, [1, 1, 1], [0.85, 0.86, 0.88]);
      commands += rect(44, top, 7, height, ORANGE);
      commands += productImage(machine, 62, top + 13, 124, 122);
      commands += text(machine.brand || machine.tag || "Tiger Tech", 204, top + 18, 8, true, ORANGE);
      commands += paragraph(wrap(machine.name, 40).slice(0, 2), 204, top + 37, 15, 18, BLACK);
      commands += paragraph(description, 204, top + 77, 8.8, 11, GRAY);
      commands += paragraph(wrap(specs, 51).slice(0, 2), 204, top + 112, 7.7, 10, BLACK);
      top += height + 12;
    }
    addPage(commands);
  }

  if (!filaments.length) {
    addEmptySection("FILAMENTOS", "Modelos e cores disponiveis no estoque.");
  } else {
    let commands = categoryPage("FILAMENTOS", "Cada modelo aparece uma vez, com sua foto principal e cores disponiveis.");
    let top = 154;
    for (const filament of filaments) {
      const variants = availableVariants(filament);
      const colorNames = [...new Set(
        variants.map((variant) => clean(variant.colorName || variant.name)).filter(Boolean),
      )].sort((a, b) => a.localeCompare(b, "pt-BR"));
      const description = wrap(
        filament.description || "Filamento para impressao 3D, com boa estabilidade e acabamento.",
        65,
      ).slice(0, 2);
      const colorLines = wrap(`Cores disponiveis: ${colorNames.join(", ")}.`, 66);
      const height = Math.max(144, 91 + description.length * 10 + colorLines.length * 10);
      if (top + height > 786) {
        addPage(commands);
        commands = categoryPage("FILAMENTOS", "Continuacao dos modelos e cores disponiveis.");
        top = 154;
      }
      commands += rect(44, top, 507, height, [1, 1, 1], [0.85, 0.86, 0.88]);
      commands += rect(44, top, 7, height, ORANGE);
      commands += productImage(filament, 62, top + 13, 112, Math.min(112, height - 26));
      commands += text(filament.brand || filament.tag || "Filamento", 192, top + 17, 8, true, ORANGE);
      commands += paragraph(wrap(filament.filamentModel || filament.name, 45).slice(0, 2), 192, top + 35, 14, 17, BLACK);
      commands += paragraph(description, 192, top + 73, 8.5, 10, GRAY);
      commands += paragraph(colorLines, 192, top + 100, 7.8, 10, BLACK);
      top += height + 12;
    }
    addPage(commands);
  }

  }
  for (const commands of pages) {
    const contentId = pdf.stream("", Buffer.from(commands, "ascii"));
    const xObjects = [logoId ? `/Logo ${logoId} 0 R` : "", ...Array.from(embeddedImages.values()).map((image) => `/${image.name} ${image.id} 0 R`)].filter(Boolean).join(" ");
    const resources = `/Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >>${xObjects ? ` /XObject << ${xObjects} >>` : ""}`;
    const pageId = pdf.add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << ${resources} >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  }
  pdf.set(pagesId, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const catalog = pdf.add(`<< /Type /Catalog /Pages ${pagesId} 0 R /PageLayout /OneColumn >>`);
  const info = pdf.add(
    `<< /Title <${latinHex("Catalogo Tiger Tech")}> /Author <${latinHex("Tiger Tech")}> /Subject <${latinHex(curated ? "Seleção de produtos" : "Maquinas e filamentos disponiveis")}> /Creator <${latinHex("Tiger Tech")}> >>`,
  );
  return pdf.finish(catalog, info);
}
