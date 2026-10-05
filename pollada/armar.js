const fs=require("fs");
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,AlignmentType,BorderStyle,HeadingLevel,PageBreak}=require("docx");
const d=require("./datos.js");
const S=n=>"S/ "+n.toLocaleString("en-US");
const W=9026; // A4 con márgenes de 1"
const cols=[600,3600,900,1300,2626];
const bd={style:BorderStyle.SINGLE,size:4,color:"BBBBBB"};
const borders={top:bd,bottom:bd,left:bd,right:bd};
function cell(t,w,o={}){return new TableCell({width:{size:w,type:WidthType.DXA},borders,
  shading:o.fill?{type:ShadingType.CLEAR,color:"auto",fill:o.fill}:undefined,
  margins:{top:60,bottom:60,left:100,right:100},
  children:[new Paragraph({alignment:o.align||AlignmentType.LEFT,children:[new TextRun({text:String(t),bold:!!o.bold,size:o.size||20,color:o.color})]})]});}
function tabla(titulo,color,filas,colMonto="Monto"){
  const head=new TableRow({tableHeader:true,children:["N°","Nombre","Platos",colMonto,"Nota"].map((h,i)=>cell(h,cols[i],{fill:color,bold:true,color:"FFFFFF",align:i>=2&&i<=3?AlignmentType.CENTER:AlignmentType.LEFT}))});
  let tp=0,tm=0;
  const rows=filas.map((f,i)=>{tp+=typeof f.platos=="number"?f.platos:0;tm+=f.monto;const z=i%2?"F5F5F5":undefined;
    return new TableRow({children:[cell(i+1,cols[0],{fill:z}),cell(f.nombre,cols[1],{fill:z}),cell(f.platos,cols[2],{fill:z,align:AlignmentType.CENTER}),cell(S(f.monto),cols[3],{fill:z,align:AlignmentType.RIGHT}),cell(f.nota||"",cols[4],{fill:z,size:16})]});});
  rows.push(new TableRow({children:[cell("",cols[0],{fill:"E8E8E8"}),cell("TOTAL",cols[1],{fill:"E8E8E8",bold:true}),cell(tp,cols[2],{fill:"E8E8E8",bold:true,align:AlignmentType.CENTER}),cell(S(tm),cols[3],{fill:"E8E8E8",bold:true,align:AlignmentType.RIGHT}),cell("",cols[4],{fill:"E8E8E8"})]}));
  return [new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:300,after:120},children:[new TextRun({text:titulo,color})]}),
    new Table({width:{size:W,type:WidthType.DXA},columnWidths:cols,rows:[head,...rows]})];
}
const byName=(a,b)=>a.nombre.localeCompare(b.nombre,"es");
const ef=[],ya=[],fa=[];
d.resto.forEach(([n,p,e,y,f,nota])=>{
  const mixto=[e,y,f].filter(x=>x>0).length>1||/Cosme|Yimi/.test(n);
  const nt=mixto?nota:(/Aparece|Revisar|No se anotó|confirmar|BN/.test(nota||"")?nota:"");
  if(e)ef.push({nombre:n,platos:e%20?"—":(mixto?e/20:p),monto:e,nota:nt});
  if(y)ya.push({nombre:n,platos:y%20?"—":(mixto?y/20:p),monto:y,nota:nt});
  if(f)fa.push({nombre:n,platos:f/20,monto:f,nota:nt});
});
const po=d.pos.map(([n,p,m])=>({nombre:n,platos:p,monto:m}));
po[16].nota="Anotada 2 veces en la hoja POS";po[10].nota="Anotada 2 veces; número corregido a mano";
[ef,ya,fa].forEach(a=>a.sort(byName));fa.sort((a,b)=>b.monto-a.monto);
const sum=a=>a.reduce((s,x)=>s+x.monto,0);
const sm=d.sinMetodo.reduce((s,x)=>s+x[1],0);
const tE=sum(ef),tY=sum(ya),tP=sum(po),tF=sum(fa);
const cobrado=tE+tY+tP+sm,total=cobrado+tF;
const platos=d.pos.reduce((s,r)=>s+r[1],0)+d.resto.reduce((s,r)=>s+r[1],0);

const rc=[5000,4026];
const res=(a,b,o={})=>new TableRow({children:[cell(a,rc[0],{bold:o.bold,fill:o.fill}),cell(b,rc[1],{bold:o.bold,fill:o.fill,align:AlignmentType.RIGHT})]});
const resumen=new Table({width:{size:W,type:WidthType.DXA},columnWidths:rc,rows:[
  res("Efectivo",S(tE)),res("Yape",S(tY)),res("POS",S(tP)),
  res("Pagos sin método anotado (Cosme Christian 20, Yimi mecánico 20)",S(sm)),
  res("TOTAL YA COBRADO",S(cobrado),{bold:true,fill:"E3F2E5"}),
  res("FALTAN PAGAR",S(tF),{bold:true,fill:"FCE4E4"}),
  res("TOTAL ANOTADO (cobrado + por cobrar)",S(total),{bold:true,fill:"E8E8E8"}),
  res("Platos anotados",platos+" platos"),
  res("Meta: 250 platos × S/ 20",S(5000)),
  res("Diferencia contra la meta",S(5000-total)+"  ("+(250-platos)+" platos)",{bold:true}),
]});
const P=(t,o={})=>new Paragraph({spacing:{after:80},children:[new TextRun({text:t,size:o.size||20,bold:o.bold,italics:o.it,color:o.color})]});

const doc=new Document({styles:{default:{document:{run:{font:"Arial"}}}},sections:[{
  properties:{page:{margin:{top:1000,bottom:1000,left:1440,right:1440}}},
  children:[
    new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"REGISTRO DE LA POLLADA",bold:true,size:36})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:"Pollo frito con papa y ensalada · S/ 20 por plato · Meta: 250 platos",size:20,color:"666666"})]}),
    new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{after:120},children:[new TextRun("Resumen")]}),
    resumen,
    P(""),
    P("Nota: la hoja POS del cuaderno dice total S/ 880, pero sumando fila por fila da S/ "+tP+". Puede ser la corrección que se ve en la fila de Angélica; conviene comparar con el reporte del POS.",{size:18,it:true}),
    ...tabla("EFECTIVO","2E7D32",ef),
    ...tabla("YAPE","6A1B9A",ya),
    ...tabla("POS (tarjeta)","1565C0",po),
    ...tabla("FALTAN PAGAR (F)","C62828",fa,"Debe"),
    new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:300,after:120},children:[new TextRun("Por revisar")]}),
    ...d.revisar.map(t=>P("– "+t)),
    P("– “Hilton mecánico” está en la hoja 1 y en la hoja 3 (20 yape cada una). Si es la misma compra, hay que restar S/ 20."),
    P("– “Cochito” aparece en POS (Alberto Mostacero, 17 platos), en la hoja 2 (4 platos, debe) y “Zorro / Cachito” en yape (15 platos). Confirmar que son compras distintas."),
    P("– Zorro / Cachito (15 platos) y Alex Gringo (35 platos) no tienen monto anotado; se calculó a S/ 20 por plato."),
  ]}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync("Registro_Pollada.docx",b);console.log({tE,tY,tP,sm,tF,cobrado,total,platos})});
