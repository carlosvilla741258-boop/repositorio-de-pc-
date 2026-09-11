import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL='http://127.0.0.1:8732/landing.html';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push('JS: '+e.message));
const red=[]; p.on('response',r=>{ if(/proceso|portada/.test(r.url())) red.push(r.status()+' '+r.url().split('/').pop()); });
await p.goto(URL,{waitUntil:'load'});
await p.waitForTimeout(2500);
console.log('fuente elegida:', await p.evaluate(()=>v.currentSrc.split('/').pop()));
await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});
await p.waitForTimeout(9500);
const f1 = await p.evaluate(()=>({t:+v.currentTime.toFixed(3), pausado:v.paused}));
console.log('tramo 1:', JSON.stringify(f1), (f1.t>7.9&&f1.t<8.05&&f1.pausado)?'✓':'✗');
const g = await p.evaluate(()=>{const s=document.getElementById('proceso');
  return {top:s.offsetTop,h:s.offsetHeight,vh:innerHeight};});
const filas=[];
for (let i=1;i<6;i++){
  await p.evaluate(y=>scrollTo(0,y), g.top+((i+0.5)/6)*(g.h-g.vh));
  await p.waitForTimeout(500);
  const a = await p.evaluate(()=>({t:+v.currentTime.toFixed(2),
    no:document.getElementById('cap-no').textContent}));
  await p.waitForTimeout(9400);
  const c = await p.evaluate(()=>({t:+v.currentTime.toFixed(3), pausado:v.paused}));
  filas.push({tramo:i+1, no:a.no, entra:a.t, alFinal:c.t, pausado:c.pausado,
    correcto:(c.t-a.t)>7.4 && c.pausado ? 'si':'NO'});
}
console.table(filas);
console.log('peticiones:', red.join(' | '));
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
