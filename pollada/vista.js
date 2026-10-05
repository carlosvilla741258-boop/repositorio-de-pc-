// Genera una vista HTML/PDF con los mismos datos y cálculos que el Word.
const fs=require("fs");const d=require("./datos.js");
const S=n=>"S/ "+n.toLocaleString("en-US");
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
const by=(a,b)=>a.nombre.localeCompare(b.nombre,"es");ef.sort(by);ya.sort(by);fa.sort((a,b)=>b.monto-a.monto);
const sum=a=>a.reduce((s,x)=>s+x.monto,0);const sm=40;
const tE=sum(ef),tY=sum(ya),tP=sum(po),tF=sum(fa),cob=tE+tY+tP+sm,tot=cob+tF;
const platos=d.pos.reduce((s,r)=>s+r[1],0)+d.resto.reduce((s,r)=>s+r[1],0);
const tabla=(t,c,f,m="Monto")=>{let tp=0;const rows=f.map((x,i)=>{if(typeof x.platos=="number")tp+=x.platos;
 return `<tr><td>${i+1}</td><td>${x.nombre}</td><td class=c>${x.platos}</td><td class=r>${S(x.monto)}</td><td class=n>${x.nota||""}</td></tr>`}).join("");
 return `<h2 style="color:${c}">${t}</h2><table><tr style="background:${c}"><th>N°</th><th>Nombre</th><th>Platos</th><th>${m}</th><th>Nota</th></tr>${rows}<tr class=t><td></td><td>TOTAL</td><td class=c>${tp}</td><td class=r>${S(sum(f))}</td><td></td></tr></table>`;};
const r=(a,b,cl="")=>`<tr class="${cl}"><td>${a}</td><td class=r>${b}</td></tr>`;
const html=`<!doctype html><meta charset=utf-8><style>
body{font-family:Arial,sans-serif;font-size:10pt;margin:0;color:#222}h1{text-align:center;margin:0;font-size:18pt}
.sub{text-align:center;color:#666;margin:4px 0 14px}h2{font-size:13pt;margin:18px 0 6px;break-after:avoid}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:4px 7px}th{color:#fff;text-align:left}
tr:nth-child(odd) td{background:#f5f5f5}.c{text-align:center}.r{text-align:right}.n{font-size:8pt}
tr.t td{background:#e8e8e8!important;font-weight:bold}tr.g td{background:#e3f2e5!important;font-weight:bold}
tr.f td{background:#fce4e4!important;font-weight:bold}tr.b td{font-weight:bold}tr{break-inside:avoid}
.nota{font-size:9pt;font-style:italic}p{margin:4px 0}</style>
<h1>REGISTRO DE LA POLLADA</h1><div class=sub>Pollo frito con papa y ensalada · S/ 20 por plato · Meta: 250 platos</div>
<h2>Resumen</h2><table>${r("Efectivo",S(tE))+r("Yape",S(tY))+r("POS",S(tP))+r("Pagos sin método anotado (Cosme Christian 20, Yimi mecánico 20)",S(sm))
+r("TOTAL YA COBRADO",S(cob),"g")+r("FALTAN PAGAR",S(tF),"f")+r("TOTAL ANOTADO (cobrado + por cobrar)",S(tot),"t")
+r("Platos anotados",platos+" platos")+r("Meta: 250 platos × S/ 20",S(5000))+r("Diferencia contra la meta",S(5000-tot)+" ("+(250-platos)+" platos)","b")}</table>
<p class=nota>Nota: la hoja POS del cuaderno dice total S/ 880, pero sumando fila por fila da S/ ${tP}. Puede ser la corrección que se ve en la fila de Angélica; conviene comparar con el reporte del POS.</p>
${tabla("EFECTIVO","#2E7D32",ef)}${tabla("YAPE","#6A1B9A",ya)}${tabla("POS (tarjeta)","#1565C0",po)}${tabla("FALTAN PAGAR (F)","#C62828",fa,"Debe")}
<h2>Por revisar</h2>${d.revisar.map(t=>"<p>– "+t+"</p>").join("")}
<p>– “Hilton mecánico” está en la hoja 1 y en la hoja 3 (20 yape cada una). Si es la misma compra, hay que restar S/ 20.</p>
<p>– “Cochito” aparece en POS (Alberto Mostacero, 17 platos), en la hoja 2 (4 platos, debe) y “Zorro / Cachito” en yape (15 platos). Confirmar que son compras distintas.</p>
<p>– Zorro / Cachito (15 platos) y Alex Gringo (35 platos) no tienen monto anotado; se calculó a S/ 20 por plato.</p>`;
fs.writeFileSync(process.argv[2],html);
