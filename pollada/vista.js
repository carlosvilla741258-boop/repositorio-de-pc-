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
const R=d.real,rCob=R.efectivo+R.pos+R.yape,rTot=rCob+R.deuda;
const r3=(a,b,c,cl="")=>`<tr class="${cl}"><td>${a}</td><td class=r>${b}</td><td class="r l">${c}</td></tr>`;
const r=(a,b,cl="")=>`<tr class="${cl}"><td>${a}</td><td class=r>${b}</td></tr>`;
const html=`<!doctype html><meta charset=utf-8><style>
body{font-family:Arial,sans-serif;font-size:10pt;margin:0;color:#222}h1{text-align:center;margin:0;font-size:18pt}
.sub{text-align:center;color:#666;margin:4px 0 14px}h2{font-size:13pt;margin:18px 0 6px;break-after:avoid}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:4px 7px}th{color:#fff;text-align:left}
tr:nth-child(odd) td{background:#f5f5f5}.c{text-align:center}.r{text-align:right}.n{font-size:8pt}
tr.t td{background:#e8e8e8!important;font-weight:bold}tr.g td{background:#e3f2e5!important;font-weight:bold}
tr.f td{background:#fce4e4!important;font-weight:bold}tr.b td{font-weight:bold}tr{break-inside:avoid}
tr.y td{background:#fff3c4!important;font-weight:bold}tr.h td{background:#424242!important;color:#fff;font-weight:bold}.res td.l{color:#777;font-size:9pt}.nota{font-size:9pt;font-style:italic}p{margin:4px 0}</style>
<h1>REGISTRO DE LA POLLADA</h1><div class=sub>Pollo frito con papa y ensalada · S/ 20 por plato · Meta: 250 platos</div>
<h2>Resumen</h2><table class=res><tr class=h><td>Concepto</td><td class=r>Monto real</td><td class=r>Suma de las listas</td></tr>${
r3("Efectivo real",S(R.efectivo),S(tE))+r3("POS",S(R.pos),S(tP))+r3("Yape",S(R.yape),S(tY))+r3("Pagos sin método anotado","—",S(sm))
+r3("TOTAL YA COBRADO",S(rCob),S(cob),"g")+r3("DEUDA (faltan pagar)",S(R.deuda),S(tF),"f")+r3("SUB TOTAL REAL",S(rTot),S(tot),"y")
+r3("Meta: 250 platos × S/ 20",S(5000),S(5000))+r3("Diferencia contra la meta",S(5000-rTot)+" ("+(250-rTot/20)+" platos)",S(5000-tot),"b")}</table>
<p class=nota>“Monto real” es el cuadre final de la pollada. “Suma de las listas” es lo que da sumar los nombres anotados en el cuaderno (tablas de abajo); la diferencia indica pagos que no quedaron anotados con nombre o con el método correcto.</p>
${tabla("EFECTIVO","#2E7D32",ef)}${tabla("YAPE","#6A1B9A",ya)}${tabla("POS (tarjeta)","#1565C0",po)}${tabla("FALTAN PAGAR (F)","#C62828",fa,"Debe")}
<h2>Por revisar</h2>${d.revisar.map(t=>"<p>– "+t+"</p>").join("")}
<p>– “Hilton mecánico” está en la hoja 1 y en la hoja 3 (20 yape cada una). Si es la misma compra, hay que restar S/ 20.</p>
<p>– “Cochito” aparece en POS (Alberto Mostacero, 17 platos), en la hoja 2 (4 platos, debe) y “Zorro / Cachito” en yape (15 platos). Confirmar que son compras distintas.</p>
<p>– Zorro / Cachito (15 platos) y Alex Gringo (35 platos) no tienen monto anotado; se calculó a S/ 20 por plato.</p>`;
fs.writeFileSync(process.argv[2],html);
