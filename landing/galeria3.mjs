import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:1000}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(1200);
// la página tiene scroll suave: sin esto scrollIntoView anima y las
// coordenadas se leen antes de que el elemento llegue a su sitio
await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});

console.log('comparadores:', await p.evaluate(()=>document.querySelectorAll('.ba').length));
console.log('imágenes:', await p.evaluate(()=>
  [...document.querySelectorAll('.ba img')].map(i=>i.complete&&i.naturalWidth>0?'ok':'FALLA').join(' ')));

for (let i=0;i<3;i++){
  await p.evaluate(k=>document.querySelectorAll('.ba')[k].scrollIntoView({block:'center'}), i);
  await p.waitForTimeout(250);
  const r = await p.evaluate(k=>{const c=document.querySelectorAll('.ba')[k].getBoundingClientRect();
    return {x:c.x,y:c.y,w:c.width,h:c.height};}, i);
  await p.mouse.move(r.x+r.w*0.5, r.y+r.h*0.5); await p.mouse.down();
  await p.mouse.move(r.x+r.w*0.2, r.y+r.h*0.5, {steps:10}); await p.mouse.up();
  await p.waitForTimeout(200);
  const pos = await p.evaluate(k=>getComputedStyle(document.querySelectorAll('.ba')[k])
    .getPropertyValue('--pos'), i);
  console.log('comparador '+(i+1)+' --pos =', pos.trim(), parseFloat(pos)<30?'✓':'✗');
  await p.screenshot({path:'gal'+(i+1)+'.png'});
}
console.log('desborde:', await p.evaluate(()=>
  document.documentElement.scrollWidth-document.documentElement.clientWidth));
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
