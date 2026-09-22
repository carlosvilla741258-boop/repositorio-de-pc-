const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, VerticalAlign, BorderStyle, PageOrientation, HeightRule, LineRuleType,
} = require("docx");

const FONT = "Calibri", RED = "C00000", DARK = "1B1917", MUTED = "6E6660", RULE = "D9D3CD";
const MARGEN = 726;          // 12.8 mm
const CW = 10454;            // ancho util = 522.7 pt
const ALTO_FILA = 290;       // 14.5 pt
const AIRE = 196;            // 9.8 pt entre filas

const NADA = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const sinBorde = { top: NADA, bottom: NADA, left: NADA, right: NADA };
const fino = (c = RULE) => ({
  top: { style: BorderStyle.SINGLE, size: 4, color: c }, bottom: { style: BorderStyle.SINGLE, size: 4, color: c },
  left: { style: BorderStyle.SINGLE, size: 4, color: c }, right: { style: BorderStyle.SINGLE, size: 4, color: c },
});
const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 24,
  bold: !!o.bold, color: o.color || DARK });
const p = (runs, o = {}) => new Paragraph({
  children: Array.isArray(runs) ? runs : [runs], alignment: o.align,
  spacing: {
    before: o.before === undefined ? 0 : o.before,
    after: o.after === undefined ? 0 : o.after,
    ...(o.linea ? { line: o.linea, lineRule: LineRuleType.EXACT } : {}),
  },
});
const celda = (children, o = {}) => new TableCell({
  children, width: { size: o.w, type: WidthType.DXA }, columnSpan: o.span,
  shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
  borders: o.borders || sinBorde, verticalAlign: o.valign || VerticalAlign.CENTER,
  margins: { top: 0, bottom: 0, left: o.mx === undefined ? 110 : o.mx, right: o.mx === undefined ? 110 : o.mx },
});
const tabla = (rows, widths) => new Table({ rows, columnWidths: widths,
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA } });
const hueco = (n) => new Paragraph({ spacing: { before: 0, after: n }, children: [t("", { size: 2 })] });

/* ---------- encabezado ---------- */
const HW = [1250, 4084, 5120];   // 5120 dxa = 256 pt, la caja del RUC como en la referencia
const encabezado = tabla([ new TableRow({ children: [
  celda([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [
    new ImageRun({ type: "png", data: fs.readFileSync(__dirname + "/logo_abarca.png"),
      transformation: { width: 48, height: 45 } })] })], { w: HW[0], mx: 0 }),
  celda([
    new Paragraph({ spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: RED, space: 1 } },
      children: [t("ABARCA", { size: 36, bold: true, color: "262626" })] }),
    new Paragraph({ spacing: { before: 30, after: 0 }, children: [t("Calidad, nuestra especialidad", { size: 19, color: MUTED })] }),
  ], { w: HW[1] }),
  celda([ new Table({ columnWidths: [5000], width: { size: 5000, type: WidthType.DXA }, rows: [
    new TableRow({ children: [celda([p(t("RUC: 20612357421", { size: 26, bold: true, color: "FFFFFF" }),
      { align: AlignmentType.CENTER, before: 40, after: 40 })], { w: 5000, fill: RED, borders: fino(RED) })] }),
    new TableRow({ children: [celda([p(t("HOJA DE INGRESO VEHICULAR", { size: 26, bold: true }),
      { align: AlignmentType.CENTER, before: 40, after: 40 })], { w: 5000, borders: fino(RED) })] }),
  ]})], { w: HW[2], mx: 0 }),
]})], HW);

const contacto = (etiqueta, texto) => new Paragraph({ spacing: { before: 20, after: 20 }, children: [
  new TextRun({ text: "●   ", font: FONT, size: 13, color: RED, bold: true }),
  t(etiqueta, { bold: true, size: 20 }), t(" " + texto, { size: 20, color: MUTED }),
]});

const servicios = tabla([ new TableRow({ children: [celda([
  p(t("Reparación de carrocería  |  Reparación de fibra de vidrio  |  Reconstrucción", { size: 20, color: MUTED }), { align: AlignmentType.CENTER, before: 50, after: 0 }),
  p(t("Desabolladura  |  Reparación de rayones  |  Enderezado de chasis  |  Modificaciones, entre otros.", { size: 20, color: MUTED }), { align: AlignmentType.CENTER, before: 0, after: 50 }),
], { w: CW, borders: fino() })]})], [CW]);

/* ---------- filas de datos ---------- */
const rot = (txt, w, sz) => celda([p(t(txt, { bold: true, size: sz || 22, color: "FFFFFF" }))],
  { w, fill: "000000", mx: 55 });
const val = (w) => celda([p(t("", { size: 22 }))], { w, borders: fino() });

const filaDatos = (etiqueta, wRot, wVal) => new TableRow({
  height: { value: ALTO_FILA, rule: HeightRule.ATLEAST },
  children: [rot(etiqueta, wRot), val(wVal)] });
const filaAire = (cols) => new TableRow({
  height: { value: AIRE, rule: HeightRule.EXACT },
  children: cols.map((w) => celda([p(t("", { size: 2 }))], { w })) });

const RC = [1662, 8792];   // rotulo 83.1 pt
const cliente = tabla([
  filaDatos("FECHA:", RC[0], RC[1]), filaAire(RC),
  filaDatos("CLIENTE:", RC[0], RC[1]), filaAire(RC),
  filaDatos("DNI/RUC:", RC[0], RC[1]), filaAire(RC),
  filaDatos("TELÉFONO:", RC[0], RC[1]),
], RC);

const barra = (txt, align) => tabla([ new TableRow({
  height: { value: 258, rule: HeightRule.EXACT },
  children: [celda([p(t(txt, { bold: true, size: 22, color: "FFFFFF" }), { align })],
    { w: CW, fill: "000000" })] })], [CW]);

const RV = [1100, 4104, 1180, 4070];   // marca 55 pt, modelo 59 pt
const filaVeh = (a, b) => new TableRow({
  height: { value: ALTO_FILA, rule: HeightRule.ATLEAST },
  children: [rot(a, RV[0], 18), val(RV[1]), rot(b, RV[2], 18), val(RV[3])] });
const vehiculo = tabla([ filaVeh("MARCA:", "MODELO:"), filaAire(RV), filaVeh("TIPO:", "PLACA:") ], RV);

/* ---------- tablero de partes ---------- */
const partes = [
  "Parachoques delantero",
  "Capó",
  "Parrilla",
  "Máscara",
  "Faro delantero izq.",
  "Faro delantero der.",
  "Neblinero izq.",
  "Neblinero der.",
  "Limpiaparabrisas",
  "Parabrisas delantero",
  "Guardafango del. izq.",
  "Guardafango del. der.",
  "Techo",
  "Aros / llantas",
  "Puerta delantera izq.",
  "Puerta posterior izq.",
  "Panel lateral izq.",
  "Estribo izquierdo",
  "Espejo izquierdo",
  "Baranda lateral izq.",
  "Puerta delantera der.",
  "Puerta posterior der.",
  "Panel lateral der.",
  "Estribo derecho",
  "Espejo derecho",
  "Baranda lateral der.",
  "Chasis",
  "Pintura general",
  "Parachoques posterior",
  "Maletera / tapa post.",
  "Panel posterior izq.",
  "Panel posterior der.",
  "Guardafango post. izq.",
  "Guardafango post. der.",
  "Faro posterior izq.",
  "Faro posterior der.",
  "Luna posterior",
  "Baranda posterior",
  "Placa posterior",
  "Lunas laterales",
];
const GP = 2445, GS = 420, GG = 300;
const TW = [GP, GS, GS, GG, GP, GS, GS, GG, GP, GS, GS];
const punteado = { top: NADA, left: NADA, right: NADA,
  bottom: { style: BorderStyle.DOTTED, size: 4, color: RULE } };
const cajita = () => celda([p(t("☐", { size: 18 }), { align: AlignmentType.CENTER, linea: 150 })],
  { w: GS, borders: punteado, mx: 0 });

const cabTablero = () => new TableRow({ children: [].concat(...[0, 1, 2].map((i) => {
  const bordeCab = { ...punteado, bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE } };
  const c = [
    celda([p(t("PARTE", { bold: true, size: 15, color: MUTED }))], { w: GP, borders: bordeCab, mx: 0 }),
    celda([p(t("SÍ", { bold: true, size: 15, color: MUTED }), { align: AlignmentType.CENTER })], { w: GS, borders: bordeCab, mx: 0 }),
    celda([p(t("NO", { bold: true, size: 15, color: MUTED }), { align: AlignmentType.CENTER })], { w: GS, borders: bordeCab, mx: 0 }),
  ];
  return i < 2 ? c.concat([celda([p(t(""))], { w: GG, mx: 0 })]) : c;
})) });

const hacerTablero = (lista, nFilas, prefijo, ayuda) => {
  const filas = [cabTablero()];
  for (let f = 0; f < nFilas; f++) {
    const hijos = [];
    [0, 1, 2].forEach((c) => {
      hijos.push(celda([p(t(lista[c * nFilas + f], { size: 16 }), { linea: 150 })], { w: GP, borders: punteado, mx: 0 }));
      hijos.push(cajita()); hijos.push(cajita());
      if (c < 2) hijos.push(celda([p(t(""))], { w: GG, mx: 0 }));
    });
    filas.push(new TableRow({ height: { value: 200, rule: HeightRule.ATLEAST }, children: hijos }));
  }
  const dentro = [];
  if (ayuda) dentro.push(p(t(ayuda, { size: 16, color: MUTED }), { after: 70 }));
  dentro.push(tabla(filas, TW));
  return tabla([ new TableRow({ children: [celda(dentro, { w: CW, borders: fino(), mx: 130 })] }) ], [CW]);
};

const tableroExterior = hacerTablero(partes, 14, "p", null);

const interior = [
  "Tablero / consola",
  "Timón",
  "Radio / autoestéreo",
  "Botones eléctricos int.",
  "Asientos delanteros",
  "Asientos posteriores",
  "Tapiz de puertas",
  "Manijas de puerta",
  "Manijas de brazo",
  "Cielo raso (techo int.)",
  "Tapasoles",
  "Alfombras / pisos",
  "Palanca de cambios",
  "Espejo retrovisor",
  "Guantera",
  "Cinturones de seg.",
  "Llaves de repuesto",
  "Llanta de repuesto",
];
const tableroInterior = hacerTablero(interior, 6, "i", null);

/* ---------- observaciones, nota y firmas ---------- */
const OW = [420, CW - 420];
const FINA = { style: BorderStyle.SINGLE, size: 4, color: RULE };
const bordeObs = (primera, izq) => ({
  top: primera ? FINA : NADA, bottom: FINA,
  left: izq ? FINA : NADA, right: izq ? NADA : FINA,
});
const lineaObs = (n, primera) => new TableRow({
  height: { value: 480, rule: HeightRule.ATLEAST },
  children: [
    celda([p(t(n + ".", { size: 14, color: MUTED }))],
      { w: OW[0], valign: VerticalAlign.BOTTOM, mx: 70, borders: bordeObs(primera, true) }),
    celda([p(t("", { size: 16 }))],
      { w: OW[1], valign: VerticalAlign.BOTTOM, mx: 150, borders: bordeObs(primera, false) }),
  ]});
const observaciones = tabla(
  [lineaObs(1, true), lineaObs(2, false), lineaObs(3, false), lineaObs(4, false)], OW);

const legal = new Paragraph({ spacing: { before: 0, after: 0 }, children: [
  t("El cliente declara que los datos y el estado de las partes consignados en esta hoja corresponden al vehículo al momento de su ingreso. ABARCA no se responsabiliza por dinero, documentos u objetos de valor dejados en el interior del vehículo.",
    { size: 12, color: MUTED })] });

const FW = [4700, 1054, 4700];
const linea = (txt, w) => celda([
  new Paragraph({ spacing: { before: 0, after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: "CFC7C0", space: 1 } }, children: [t("", { size: 12 })] }),
  p(t(txt, { size: 15, color: MUTED }), { align: AlignmentType.CENTER }),
], { w, valign: VerticalAlign.BOTTOM });
const firmas = tabla([ new TableRow({ children: [
  linea("Firma del cliente", FW[0]), celda([p(t(""))], { w: FW[1] }), linea("Recibido por – ABARCA", FW[2]),
]})], FW);

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 12, color: DARK } } } },
  sections: [{
    properties: { page: { size: { orientation: PageOrientation.PORTRAIT },
      margin: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN } } },
    children: [
      encabezado, hueco(20),
      contacto("LOCAL SANTA ROSA:", "AV. SANTA ROSA LT. 3 MZ. U, URB. SEMIRÚSTICA CERRO GRANDE – SJL"),
      contacto("TELÉFONO:", "+51 934 965 098  /  +51 973 219 397"),
      hueco(60),
      cliente, hueco(50),
      barra("DATOS DEL VEHÍCULO", AlignmentType.CENTER), hueco(110), vehiculo, hueco(50),
      barra("PARTES DAÑADAS — EXTERIOR", AlignmentType.LEFT), hueco(30), tableroExterior, hueco(60),
      barra("PARTES DAÑADAS — INTERIOR", AlignmentType.LEFT), hueco(30), tableroInterior, hueco(30),
      barra("OBSERVACIONES / TRABAJO SOLICITADO", AlignmentType.LEFT), hueco(30), observaciones, hueco(60),
      legal, firmas,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/art/Hoja-Ingreso-Vehicular-ABARCA.docx", buf);
  console.log("OK", buf.length, "bytes");
});
