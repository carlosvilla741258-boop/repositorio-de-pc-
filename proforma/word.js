const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, VerticalAlign, BorderStyle, PageOrientation, HeightRule,
} = require("docx");

const D = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const FONT = "Calibri", RED = "C00000", DARK = "1A1A1A", GRAY = "D9D9D9", CW = 10178;
const nf = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => nf.format(n || 0);

const thin = (color = "808080") => ({
  top:{style:BorderStyle.SINGLE,size:6,color}, bottom:{style:BorderStyle.SINGLE,size:6,color},
  left:{style:BorderStyle.SINGLE,size:6,color}, right:{style:BorderStyle.SINGLE,size:6,color},
});
const none = () => ({
  top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
  left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
});
const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 20, bold: !!o.bold, color: o.color || DARK });
const p = (runs, o = {}) => new Paragraph({
  children: Array.isArray(runs) ? runs : [runs], alignment: o.align,
  spacing: { before: o.before === undefined ? 20 : o.before, after: o.after === undefined ? 20 : o.after },
});
const cell = (children, o = {}) => new TableCell({
  children, width: { size: o.w, type: WidthType.DXA }, columnSpan: o.span,
  shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
  borders: o.borders || thin(), verticalAlign: o.valign || VerticalAlign.CENTER,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
});
const table = (rows, widths) => new Table({
  rows, columnWidths: widths,
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
});
const espacio = (n = 120) => new Paragraph({ spacing: { before: 0, after: n }, children: [t("")] });
const dash = (v) => (v && String(v).trim()) ? String(v) : "----";

/* encabezado */
const HW = [1350, 4850, 3978];
const header = table([ new TableRow({ children: [
  cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [
    new ImageRun({ type: "png", data: fs.readFileSync(__dirname + "/logo_abarca.png"),
      transformation: { width: 85, height: 80 } })] })], { w: HW[0], borders: none() }),
  cell([
    new Paragraph({ spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: RED, space: 1 } },
      children: [t("ABARCA", { size: 52, bold: true, color: "262626" })] }),
    new Paragraph({ spacing: { before: 40, after: 0 }, children: [t("Calidad, nuestra especialidad", { size: 22, color: "404040" })] }),
  ], { w: HW[1], borders: none() }),
  cell([ new Table({ columnWidths: [3700], width: { size: 3700, type: WidthType.DXA }, rows: [
    new TableRow({ children: [cell([p(t("RUC: 20612357421", { size: 30, bold: true, color: "FFFFFF" }), { align: AlignmentType.CENTER, before: 40, after: 40 })], { w: 3700, fill: RED, borders: thin(RED) })] }),
    new TableRow({ children: [cell([p(t("PROFORMA", { size: 30, bold: true }), { align: AlignmentType.CENTER, before: 40, after: 40 })], { w: 3700, borders: thin(RED) })] }),
  ]})], { w: HW[2], borders: none() }),
]})], HW);

const contacto = (etiqueta, texto) => new Paragraph({ spacing: { before: 20, after: 20 }, children: [
  new TextRun({ text: "●   ", font: FONT, size: 13, color: RED, bold: true }),
  t(etiqueta, { bold: true, size: 19 }), t(" " + texto, { size: 19 }),
]});

const servicios = table([ new TableRow({ children: [cell([
  p(t("Reparación de carrocería  |  Reparación de fibra de vidrio  |  Reconstrucción", { size: 19 }), { align: AlignmentType.CENTER, before: 40, after: 0 }),
  p(t("Desabolladura  |  Reparación de rayones  |  Enderezado de chasis  |  Modificaciones, entre otros.", { size: 19 }), { align: AlignmentType.CENTER, before: 0, after: 40 }),
], { w: CW })]})], [CW]);

const rotulo = (txt, w) => cell([p(t(txt, { bold: true, size: 20 }))], { w, fill: GRAY });
const valor = (txt, w, span) => cell([p(t(txt, { size: 20 }))], { w, span });

const datos = table([
  new TableRow({ children: [rotulo("FECHA:", 2000), valor(dash(D.fecha), 8178)] }),
  new TableRow({ children: [rotulo("CLIENTE:", 2000), valor(dash(D.cliente), 8178)] }),
  new TableRow({ children: [rotulo("DNI/RUC:", 2000), valor(dash(D.doc), 8178)] }),
  new TableRow({ children: [rotulo("TELEFONO:", 2000), valor(dash(D.tel), 8178)] }),
], [2000, 8178]);

const barra = (txt, align) => table([ new TableRow({ children: [
  cell([p(t(txt, { bold: true, size: 20, color: "FFFFFF" }), { align, before: 30, after: 30 })],
    { w: CW, fill: "000000", borders: thin("000000") })]})], [CW]);

const VW = [1400, 3689, 1400, 3689];
const filasVeh = [
  new TableRow({ children: [rotulo("MARCA:", VW[0]), valor(dash(D.marca), VW[1]), rotulo("MODELO:", VW[2]), valor(dash(D.modelo), VW[3])] }),
  new TableRow({ children: [rotulo("TIPO:", VW[0]), valor(dash(D.tipo), VW[1]), rotulo("PLACA:", VW[2]), valor(dash(D.placa), VW[3])] }),
];
if (D.color !== undefined) {
  filasVeh.push(new TableRow({ children: [rotulo("COLOR:", VW[0]), valor(dash(D.color), VW[1] + VW[2] + VW[3], 3)] }));
}
const vehiculo = table(filasVeh, VW);

/* detalle: un solo recuadro, con los importes al pie derecho */
const nf0 = new Intl.NumberFormat("es-PE");
const imp = (n) => (n % 1 === 0 ? nf0.format(n) : money(n));
const NADA = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const libre = { top: NADA, bottom: NADA, left: NADA, right: NADA };
const celdaLibre = (children, w, o = {}) => new TableCell({
  children, width: { size: w, type: WidthType.DXA }, borders: o.borders || libre,
  verticalAlign: o.valign || VerticalAlign.TOP,
  margins: { top: 20, bottom: 20, left: o.left === undefined ? 70 : o.left, right: 70 },
});

const IN = 9978;                       // ancho util dentro del recuadro
const LW = [560, 8118, 1300];          // N° | trabajo | coste

const lineas = (b) => {
  const filas = [ new TableRow({ children: [
    celdaLibre([p(t("N°", { size: 18, color: "6E6660", bold: true }), { align: AlignmentType.CENTER, before: 0, after: 30 })], LW[0],
      { borders: { ...libre, bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D3CD" } } }),
    celdaLibre([p(t("TRABAJO POR REALIZAR", { size: 18, color: "6E6660", bold: true }), { before: 0, after: 30 })], LW[1],
      { borders: { ...libre, bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D3CD" } } }),
    celdaLibre([p(t("COSTE S/", { size: 18, color: "6E6660", bold: true }), { align: AlignmentType.RIGHT, before: 0, after: 30 })], LW[2],
      { borders: { ...libre, bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D3CD" } } }),
  ]})];
  b.items.forEach((it, i) => {
    filas.push(new TableRow({ children: [
      celdaLibre([p(t(String(i + 1), { size: 17, color: "6E6660" }), { align: AlignmentType.CENTER, before: 40, after: 20 })], LW[0]),
      celdaLibre([p(t(it.d, { size: 19 }), { before: 40, after: 20 })], LW[1]),
      celdaLibre([p(t(imp(it.m), { size: 19 }), { align: AlignmentType.RIGHT, before: 40, after: 20 })], LW[2]),
    ]}));
  });
  return new Table({ rows: filas, columnWidths: LW, width: { size: IN, type: WidthType.DXA } });
};

const cuerpo = [];
D.bloques.filter((b) => b.items.length).forEach((b, k) => {
  if (k) cuerpo.push(espacio(140));
  cuerpo.push(new Paragraph({ spacing: { before: 0, after: 90 },
    children: [new TextRun({ text: b.t, font: FONT, size: 19, bold: true, underline: {}, color: DARK })] }));
  cuerpo.push(lineas(b));
});

const subtotal = D.bloques.reduce((a, b) => a + b.items.reduce((x, it) => x + (it.m || 0), 0), 0);
const tasa = D.igv || 0, igv = subtotal * tasa, total = subtotal + igv;

/* importes: tabla chica, al pie derecho del recuadro */
const TW = [2300, 1678];
const filaTot = (etiqueta, monto, esTotal) => new TableRow({ children: [
  celdaLibre([p(t(etiqueta, { size: esTotal ? 20 : 18, bold: true, color: esTotal ? DARK : "6E6660" }),
    { align: AlignmentType.RIGHT, before: esTotal ? 60 : 20, after: 20 })], TW[0],
    { borders: esTotal ? { ...libre, top: { style: BorderStyle.SINGLE, size: 6, color: "1A1A1A" } } : libre }),
  celdaLibre([p(t("S/ " + money(monto), { size: esTotal ? 21 : 18, bold: esTotal, color: esTotal ? RED : DARK }),
    { align: AlignmentType.RIGHT, before: esTotal ? 60 : 20, after: 20 })], TW[1],
    { borders: esTotal ? { ...libre, top: { style: BorderStyle.SINGLE, size: 6, color: "1A1A1A" } } : libre }),
]});
const filasTot = [];
if (tasa > 0) {
  filasTot.push(filaTot("SUBTOTAL", subtotal, false));
  filasTot.push(filaTot("IGV (" + Math.round(tasa * 100) + "%)", igv, false));
}
filasTot.push(filaTot("TOTAL", total, true));
const totales = new Table({ rows: filasTot, columnWidths: TW,
  width: { size: TW[0] + TW[1], type: WidthType.DXA }, alignment: AlignmentType.RIGHT });

const notasParr = (D.notas || []).map((nt, i) => new Paragraph({
  spacing: { before: i ? 30 : 0, after: 0 },
  children: [t("***" + nt, { size: i ? 14 : 16, color: i ? "6E6660" : DARK })] }));
if (!notasParr.length) notasParr.push(new Paragraph({ children: [t("")] }));

const PW = [5800, 4178];
const pie = new Table({
  columnWidths: PW, width: { size: IN, type: WidthType.DXA },
  rows: [ new TableRow({ children: [
    celdaLibre(notasParr, PW[0], { valign: VerticalAlign.BOTTOM }),
    celdaLibre([totales], PW[1], { valign: VerticalAlign.BOTTOM, left: 0 }),
  ]})],
});

const sinAbajo = { ...thin(), bottom: NADA };
const sinArriba = { ...thin(), top: NADA };
const detalle = new Table({
  columnWidths: [CW], width: { size: CW, type: WidthType.DXA },
  rows: [
    new TableRow({ height: { value: 2500, rule: HeightRule.ATLEAST },
      children: [cell(cuerpo, { w: CW, borders: sinAbajo, valign: VerticalAlign.TOP })] }),
    new TableRow({ children: [cell([pie], { w: CW, borders: sinArriba, valign: VerticalAlign.BOTTOM })] }),
  ],
});

const FW = [4589, 1000, 4589];
const linea = (txt, w) => cell([
  new Paragraph({ spacing: { before: 0, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: "808080", space: 1 } }, children: [t("")] }),
  p(t(txt, { size: 18, color: "595959" }), { align: AlignmentType.CENTER }),
], { w, borders: none(), valign: VerticalAlign.BOTTOM });
const firmas = table([ new TableRow({ children: [
  linea("ABARCA – Calidad, nuestra especialidad", FW[0]),
  cell([p(t(""))], { w: FW[1], borders: none() }),
  linea("Conformidad del cliente", FW[2]),
]})], FW);

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 20, color: DARK } } } },
  sections: [{
    properties: { page: { size: { orientation: PageOrientation.PORTRAIT }, margin: { top: 864, bottom: 864, left: 864, right: 864 } } },
    children: [
      header, espacio(80),
      contacto("LOCAL ZARATE:", "JIRON SANTA MONICA 635 - SJL"),
      contacto("LOCAL SANTA ROSA:", "AV. SANTA ROSA LT. 3 MZ. U URB. SEMIRUSTICA CTO. GRANDE – SJL"),
      contacto("TELEFONO:", "+51 934965098  /  +51 973219397"),
      espacio(120), servicios, espacio(160), datos, espacio(160),
      barra("DATOS DEL VEHICULO", AlignmentType.CENTER), vehiculo, espacio(160),
      barra("DESCRIPCION:", AlignmentType.LEFT), espacio(60), detalle,
      espacio(280), firmas,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = __dirname + "/art/" + D.nombre + ".docx";
  fs.writeFileSync(out, buf);
  console.log("OK", D.nombre + ".docx", buf.length, "bytes | total S/", money(total));
});
