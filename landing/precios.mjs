import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(900);
const est = () => p.evaluate(()=>({
  niveles:[...document.querySelectorAll('#niveles button')].map(x=>x.textContent),
  elegido:[...document.querySelectorAll('#niveles button')].findIndex(x=>x.getAttribute('aria-pressed')==='true'),
  pie:document.getElementById('nivel-pie').textContent.slice(0,32),
  filas:[...document.querySelectorAll('.tabla tbody tr th')].map(x=>x.textContent),
  colSel:[...document.querySelectorAll('.tabla thead th')].findIndex(x=>x.classList.contains('sel')),
  celdasSel:document.querySelectorAll('.tabla td.sel').length,
  paresCeramico:document.querySelectorAll('.tabla tbody tr:nth-child(3) td.sel .par').length}));
console.log('al entrar  ', JSON.stringify(await est()));
await p.click('#niveles button:nth-child(3)'); await p.waitForTimeout(250);
console.log('tras Premium', JSON.stringify(await est()));
await p.click('#niveles button:nth-child(1)'); await p.waitForTimeout(250);
console.log('tras Básica ', JSON.stringify(await est()));
await p.click('.tab[data-veh="camioneta"]'); await p.waitForTimeout(250);
console.log('camioneta  ->', await p.evaluate(()=>({tabla:!!document.querySelector('.tabla'),
  nota:document.getElementById('veh-note').textContent.slice(0,34)})));
await p.click('.tab[data-veh="auto"]'); await p.waitForTimeout(250);
console.log('vuelta auto ->', await p.evaluate(()=>!!document.querySelector('.tabla')));
console.log('botón cabecera:', await p.evaluate(()=>document.querySelector('header .btn').textContent));
await p.evaluate(()=>document.getElementById('precios').scrollIntoView({block:'start'}));
await p.waitForTimeout(300); await p.screenshot({path:'pr_d.png'});
await p.close();

const m = await b.newPage({viewport:{width:390,height:844}});
await m.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await m.waitForTimeout(900);
console.log('móvil, columnas visibles:', await m.evaluate(()=>{
  const ths=[...document.querySelectorAll('.tabla thead th')];
  return ths.filter(t=>getComputedStyle(t).display!=='none').map(t=>t.textContent);}));
await m.evaluate(()=>document.getElementById('precios').scrollIntoView({block:'start'}));
await m.waitForTimeout(300); await m.screenshot({path:'pr_m.png'});
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
