// Guía "amigable": Markdown con marcas propias -> .docx con portada, banners, recuadros y tarjetas.
//   > [!TIPO] Título      recuadro (TIP, WARNING, NOTE, IMPORTANT, TUTOR, QUESTION, EXAMPLE)
//   <!-- cards --> + tabla    cada columna es una tarjeta
//   <!-- pagebreak -->       salto de página
//   ![alt](img/x.png)        imagen a todo el ancho
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, AlignmentType, LevelFormat, Footer, PageNumber, PageBreak,
  ExternalHyperlink, ImageRun, TableLayoutType, LineRuleType,
} = require("docx");

const [, , SRC, OUT] = process.argv;
const BASE = path.dirname(SRC);
const md = fs.readFileSync(SRC, "utf8");

const INK = "1F2937", INK2 = "52514E", MUTED = "8A8983";
const PARTS = [
  { c: "1F5FAE", t: "E9F1FB" }, // 1 azul
  { c: "C9521F", t: "FDEFE8" }, // 2 naranja
  { c: "12855C", t: "E5F6EF" }, // 3 aqua
  { c: "4A3AA7", t: "EDEBF8" }, // 4 violeta
  { c: "374151", t: "F3F4F6" }, // 5 gris
];
const CARD = [
  { c: "2A78D6", t: "E9F1FB" }, { c: "EB6834", t: "FDEFE8" }, { c: "1BAF7A", t: "E5F6EF" },
  { c: "4A3AA7", t: "EDEBF8" }, { c: "EDA100", t: "FDF5E2" },
];
const CALLOUT = {
  TIP: { icon: "💡", label: "En simple", c: "12855C", t: "E5F6EF" },
  WARNING: { icon: "⚠️", label: "Ojo en la prueba", c: "C9521F", t: "FDEFE8" },
  NOTE: { icon: "📌", label: "Para recordar", c: "1F5FAE", t: "E9F1FB" },
  IMPORTANT: { icon: "📚", label: "Cita para la prueba", c: "4A3AA7", t: "EDEBF8" },
  TUTOR: { icon: "🧩", label: "Aporte del tutor", c: "B4336F", t: "FCEDF3" },
  QUESTION: { icon: "❓", label: "Pregúntate", c: "9A6700", t: "FDF5E2" },
  EXAMPLE: { icon: "📝", label: "Enunciado", c: "374151", t: "F3F4F6" },
};
const FONT = "Calibri", EMOJI = "Segoe UI Emoji";
const PAGE_W = 12240, MARGIN = 1300, CONTENT_W = PAGE_W - 2 * MARGIN;
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE };

let part = PARTS[0];

// ---------- texto en línea ----------
const EMOJI_RE = /(\p{Extended_Pictographic}️?)/u;
function textRuns(text, s) {
  return text.split(EMOJI_RE).filter(Boolean).map((p) => EMOJI_RE.test(p)
    ? new TextRun({ text: p, font: EMOJI, size: s.size })
    : new TextRun({ text: p, bold: s.bold, italics: s.italics, color: s.color, size: s.size, font: s.font }));
}
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
function runs(tokens, s = {}) {
  const out = [];
  for (const t of tokens || []) {
    if (t.type === "strong") out.push(...runs(t.tokens, { ...s, bold: true }));
    else if (t.type === "em") out.push(...runs(t.tokens, { ...s, italics: true }));
    else if (t.type === "link") out.push(new ExternalHyperlink({ link: t.href, children: [new TextRun({ text: t.text, style: "Hyperlink" })] }));
    else if (t.type === "br") out.push(new TextRun({ break: 1 }));
    else if (t.type === "text" && t.tokens) out.push(...runs(t.tokens, s));
    else out.push(...textRuns(decode(t.text ?? t.raw ?? ""), s));
  }
  return out;
}
const P = (tokens, opts = {}, s = {}) => new Paragraph({ children: runs(tokens, s), ...opts });

// ---------- bloques ----------
let listInstance = 0;
function list(tok, level, target, extra = {}) {
  const ref = tok.ordered ? "num" : "bullet";
  const instance = ++listInstance;
  for (const item of tok.items) {
    let first = true;
    for (const t of item.tokens) {
      if (t.type === "list") { list(t, level + 1, target, extra); continue; }
      const inl = t.tokens || [{ type: "text", text: t.text || "" }];
      const check = first && /^☐/.test(t.text || "");
      target.push(new Paragraph({
        children: runs(inl),
        numbering: first && !check ? { reference: ref, level, instance } : undefined,
        indent: check ? { left: 360, hanging: 360 } : first ? undefined : { left: 400 * (level + 1) },
        spacing: { after: 80 },
        ...extra,
      }));
      first = false;
    }
  }
}

function image(src, alt, pct = 100) {
  const file = path.resolve(BASE, src);
  const buf = fs.readFileSync(file);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20); // cabecera PNG
  const widthPx = Math.round((CONTENT_W / 1440) * 96 * (pct / 100));
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [new ImageRun({ type: "png", data: buf, transformation: { width: widthPx, height: Math.round((widthPx * h) / w) }, altText: { title: alt, description: alt, name: alt } })],
  });
}

// Recuadro: tabla de una celda con franja de color a la izquierda
function callout(kind, title, bodyTokens) {
  const k = CALLOUT[kind] || CALLOUT.NOTE;
  const inner = [new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: k.icon + " ", font: EMOJI, size: 22 }), new TextRun({ text: title || k.label, bold: true, color: k.c, size: 22 })],
  })];
  for (const t of bodyTokens) {
    if (t.type === "list") list(t, 0, inner);
    else if (t.type === "paragraph") inner.push(P(t.tokens, { spacing: { after: 80 } }));
  }
  return [
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [CONTENT_W],
      layout: TableLayoutType.FIXED,
      rows: [new TableRow({ cantSplit: true, children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: k.t },
        borders: { ...NO_BORDERS, left: { style: BorderStyle.SINGLE, size: 36, color: k.c } },
        margins: { top: 140, bottom: 100, left: 240, right: 240 },
        children: inner,
      })] })],
    }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];
}

// Tarjetas: cada columna de la tabla es una tarjeta, con separadores blancos entre ellas
function cards(tok) {
  const n = tok.header.length, GAP = 160;
  const cw = Math.floor((CONTENT_W - GAP * (n - 1)) / n);
  const widths = [];
  for (let i = 0; i < n; i++) { widths.push(cw); if (i < n - 1) widths.push(GAP); }
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const cells = [];
  for (let i = 0; i < n; i++) {
    const k = CARD[i % CARD.length];
    const body = [new Paragraph({ spacing: { after: 100 }, children: runs(tok.header[i].tokens, { bold: true, color: k.c, size: 24 }) })];
    for (const r of tok.rows) if (r[i] && r[i].text.trim()) body.push(P(r[i].tokens, { spacing: { after: 100 } }, { size: n >= 4 ? 19 : 21 }));
    cells.push(new TableCell({
      width: { size: widths[cells.length], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: k.t },
      borders: { ...NO_BORDERS, top: { style: BorderStyle.SINGLE, size: 36, color: k.c } },
      margins: { top: 160, bottom: 120, left: 180, right: 180 },
      children: body,
    }));
    if (i < n - 1) cells.push(new TableCell({ width: { size: GAP, type: WidthType.DXA }, borders: NO_BORDERS, children: [new Paragraph({ children: [] })] }));
  }
  return [
    new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, rows: [new TableRow({ cantSplit: true, children: cells })] }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ];
}

// Banner de parte: franja de color a todo el ancho
function banner(text) {
  const [label, title] = text.split(" · ");
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: part.c },
      borders: NO_BORDERS, margins: { top: 300, bottom: 300, left: 360, right: 360 },
      children: [
        new Paragraph({ children: [new TextRun({ text: label.toUpperCase(), bold: true, color: "FFFFFF", size: 22, characterSpacing: 40 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 60, after: 0 }, children: [new TextRun({ text: title, bold: true, color: "FFFFFF", size: 48 })] }),
      ],
    })] })],
  });
}

function cover(title, rest) {
  const [t1, t2] = title.split(": ");
  const out = [
    new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: "GESTIÓN PÚBLICA INTERCULTURAL", bold: true, color: PARTS[0].c, size: 24, characterSpacing: 60 })] }),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: t1, bold: true, color: INK, size: 76 })] }),
    new Paragraph({ spacing: { after: 360 }, border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: "EB6834", space: 12 } }, children: [new TextRun({ text: t2 || "", color: PARTS[0].c, size: 40 })] }),
  ];
  for (const t of rest) out.push(P(t.tokens, { spacing: { after: 160 } }, { size: 25, color: INK2 }));
  return out;
}

// ---------- recorrido ----------
const children = [];
const tokens = marked.lexer(md);
let pendingCards = false, partIdx = -1, inRefs = false;
for (let i = 0; i < tokens.length; i++) {
  const tok = tokens[i];
  if (tok.type === "heading" && tok.depth === 1 && i === 0) {
    const rest = [];
    while (tokens[i + 1] && tokens[i + 1].type !== "html") { i++; if (tokens[i].type === "paragraph") rest.push(tokens[i]); }
    const imgs = rest.filter((t) => t.tokens.length === 1 && t.tokens[0].type === "image");
    children.push(...cover(tok.text, rest.filter((t) => !imgs.includes(t))));
    for (const t of imgs) children.push(image(t.tokens[0].href, t.tokens[0].text));
    continue;
  }
  switch (tok.type) {
    case "html":
      if (/pagebreak/.test(tok.text)) children.push(new Paragraph({ children: [new PageBreak()] }));
      if (/cards/.test(tok.text)) pendingCards = true;
      break;
    case "heading":
      if (tok.depth === 1) {
        partIdx++; part = PARTS[partIdx % PARTS.length];
        children.push(banner(tok.text), new Paragraph({ spacing: { after: 200 }, children: [] }));
      } else if (tok.depth === 2) {
        inRefs = tok.text.startsWith("Referencias");
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2, keepNext: true,
          border: { left: { style: BorderStyle.SINGLE, size: 36, color: part.c, space: 10 } },
          children: runs(tok.tokens, { color: INK }),
        }));
      } else {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: runs(tok.tokens, { color: part.c }) }));
      }
      break;
    case "paragraph": {
      const only = tok.tokens.length === 1 && tok.tokens[0].type === "image";
      if (only) children.push(image(tok.tokens[0].href, tok.tokens[0].text, Number(tok.tokens[0].title) || 100));
      else {
        const keep = /^\*Tiempo/.test(tok.raw) || (tok.tokens.length === 1 && tok.tokens[0].type === "strong");
        const hang = inRefs && !/^\*Nota/.test(tok.raw) ? { indent: { left: 720, hanging: 720 } } : {};
        children.push(P(tok.tokens, { spacing: { after: 160 }, keepNext: keep, ...hang }));
      }
      break;
    }
    case "blockquote": {
      const first = tok.tokens[0];
      const m = first && first.type === "paragraph" && first.text.match(/^\[!(\w+)\]\s*([^\n]*)/);
      if (m) {
        // Quitar la marca [!TIPO] Título de la primera línea
        const restText = first.text.split("\n").slice(1).join("\n");
        const body = restText.trim() ? [marked.lexer(restText)[0], ...tok.tokens.slice(1)] : tok.tokens.slice(1);
        children.push(...callout(m[1].toUpperCase(), m[2].trim(), body.filter(Boolean)));
      } else children.push(...callout("NOTE", "", tok.tokens));
      break;
    }
    case "list": list(tok, 0, children); children.push(new Paragraph({ spacing: { after: 80 }, children: [] })); break;
    case "table":
      if (pendingCards) { children.push(...cards(tok)); pendingCards = false; }
      else children.push(...cards(tok));
      break;
    default: break;
  }
}

const doc = new Document({
  creator: "Tutor Gestión Pública Intercultural",
  title: "Guía de estudio N.º 1: Gestión Pública Intercultural",
  styles: {
    default: { document: { run: { font: FONT, size: 23, color: INK }, paragraph: { spacing: { line: 300, lineRule: LineRuleType.AUTO } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { font: FONT, bold: true }, paragraph: { outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { font: FONT, size: 32, bold: true }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", run: { font: FONT, size: 26, bold: true }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullet", levels: [0, 1].map((l) => ({ level: l, format: LevelFormat.BULLET, text: ["●", "○"][l], alignment: AlignmentType.LEFT, style: { run: { color: "EB6834", size: 16 }, paragraph: { indent: { left: 400 + 400 * l, hanging: 300 } } } })) },
      { reference: "num", levels: [0, 1].map((l) => ({ level: l, format: [LevelFormat.DECIMAL, LevelFormat.LOWER_LETTER][l], text: `%${l + 1}.`, alignment: AlignmentType.LEFT, style: { run: { bold: true, color: "1F5FAE" }, paragraph: { indent: { left: 400 + 400 * l, hanging: 340 } } } })) },
    ],
  },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 15840 }, margin: { top: 1200, bottom: 1100, left: MARGIN, right: MARGIN } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Guía de estudio N.º 1 · Gestión Pública Intercultural   ·   ", size: 16, color: MUTED }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED, bold: true }),
    ] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("ok", OUT); });
