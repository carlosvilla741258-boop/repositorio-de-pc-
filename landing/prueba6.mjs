import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:1440,height:900}});
const FIN = [7.98, 12.065, 20.315, 28.565, 36.815, 45.065];
const errs=[]; p.on('pageerror',e=>errs.push('JS: '+e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(1500);
await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});

await p.waitForTimeout(10500);
const f1 = await p.evaluate(()=>({t:+v.currentTime.toFixed(3), pausado:v.paused,
  pista:document.getElementById('pista').textContent}));
console.log('tramo 1:', JSON.stringify(f1), (f1.t>7.9&&f1.t<8.05&&f1.pausado)?'✓':'✗');

const g = await p.evaluate(()=>{const s=document.getElementById('proceso');
  return {top:s.offsetTop,h:s.offsetHeight,vh:innerHeight};});
const filas=[];
for (let i=1;i<6;i++){
  await p.evaluate(y=>scrollTo(0,y), g.top+((i+0.5)/6)*(g.h-g.vh));
  await p.waitForTimeout(400);
  const a = await p.evaluate(()=>({t:+v.currentTime.toFixed(2),
    no:document.getElementById('cap-no').textContent,
    car:document.getElementById('cap-tit').textContent.slice(0,24)}));
  await p.waitForTimeout(9400);
  const c = await p.evaluate(()=>({t:+v.currentTime.toFixed(3), pausado:v.paused}));
  filas.push({tramo:i+1, no:a.no, tarjeta:a.car, entra:a.t, alFinal:c.t,
    pausado:c.pausado, completo:(Math.abs(c.t-FIN[i])<0.1 && c.pausado)?'sí':'NO'});
  await p.screenshot({path:'s'+(i+1)+'.png'});
}
console.table(filas);
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
