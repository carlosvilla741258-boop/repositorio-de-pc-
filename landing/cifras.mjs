import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(800);
await p.evaluate(()=>document.querySelector('.cifras').scrollIntoView({block:'center'}));
await p.waitForTimeout(1600);
console.log('números:', await p.evaluate(()=>[...document.querySelectorAll('[data-cuenta]')].map(e=>e.textContent)));
// pasar por encima de un servicio
await p.hover('.fichas button:nth-child(3)'); await p.waitForTimeout(250);
console.log('al pasar por Pintura:', await p.evaluate(()=>document.getElementById('det-svc').textContent));
await p.hover('.cifra-lead'); await p.waitForTimeout(250);
console.log('al salir:', await p.evaluate(()=>document.getElementById('det-svc').textContent));
await p.click('.semana button:nth-child(7)'); await p.waitForTimeout(250);
console.log('al tocar domingo:', await p.evaluate(()=>document.getElementById('det-dia').textContent),
  '| fijado:', await p.evaluate(()=>document.querySelector('.semana button:nth-child(7)').getAttribute('aria-pressed')));
await p.evaluate(()=>document.querySelector('.cifras').scrollIntoView({block:'center'}));
await p.screenshot({path:'cif_d.png'});
await p.close();
const m = await b.newPage({viewport:{width:390,height:844}});
await m.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await m.waitForTimeout(800);
await m.evaluate(()=>document.querySelector('.cifras').scrollIntoView({block:'start'}));
await m.waitForTimeout(1500); await m.screenshot({path:'cif_m.png'});
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
