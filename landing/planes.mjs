import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:960}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(900);
const est = () => p.evaluate(()=>({
  planes:[...document.querySelectorAll('.plan h3')].map(x=>x.textContent),
  elegido:[...document.querySelectorAll('.plan')].findIndex(x=>x.getAttribute('aria-selected')==='true'),
  tag:document.querySelector('.marca-tag')?.textContent,
  filas:[...document.querySelectorAll('.plan:nth-child(1) .row .k')].map(x=>x.childNodes[0].textContent),
  anchos:[...document.querySelectorAll('.plan')].map(x=>Math.round(x.getBoundingClientRect().width)),
  altos:[...document.querySelectorAll('.plan')].map(x=>Math.round(x.getBoundingClientRect().height)),
  ceramicoPremium:document.querySelector('.plan:nth-child(3) .row:nth-child(5) .v').textContent.trim().replace(/\s+/g,' '),
  wa:document.querySelector('.plan:nth-child(3) .pedir a').getAttribute('href')}));
console.log('al entrar:', JSON.stringify(await est(), null, 0));
await p.click('.plan:nth-child(3)'); await p.waitForTimeout(250);
console.log('tras tocar Premium -> elegido:', await p.evaluate(()=>
  [...document.querySelectorAll('.plan')].findIndex(x=>x.getAttribute('aria-selected')==='true')));
await p.click('.tab[data-veh="camioneta"]'); await p.waitForTimeout(200);
console.log('camioneta -> planes:', await p.evaluate(()=>document.querySelectorAll('.plan').length),
  '| nota:', await p.evaluate(()=>document.getElementById('veh-note').textContent.slice(0,28)));
await p.click('.tab[data-veh="auto"]'); await p.waitForTimeout(200);
console.log('vuelta auto -> planes:', await p.evaluate(()=>document.querySelectorAll('.plan').length));
await p.evaluate(()=>document.getElementById('planes').scrollIntoView({block:'center'}));
await p.waitForTimeout(300); await p.screenshot({path:'pl_d.png'});
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
