import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL='http://127.0.0.1:8750/index.html';
const FIN=[7.98,16.23,24.48,32.73,40.98,49.23];
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push('JS: '+e.message));
const red=[]; p.on('response',r=>{const u=r.url(); if(/proceso|index/.test(u)) red.push(r.status()+' '+u.split('/').pop());});
await p.goto(URL,{waitUntil:'load'});
await p.waitForTimeout(2500);
await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});

console.log('fuente de video elegida:', await p.evaluate(()=>v.currentSrc.split('/').pop()));
console.log('imágenes de la galería:', await p.evaluate(()=>
  [...document.querySelectorAll('.ba img')].map(i=>i.complete&&i.naturalWidth>0?'ok':'FALLA').join(' ')));
console.log('logo:', await p.evaluate(()=>{const l=document.querySelector('.brand .logo');
  return l&&l.complete&&l.naturalWidth>0?'ok':'FALLA';}));

await p.waitForTimeout(9000);
const f1 = await p.evaluate(()=>({t:+v.currentTime.toFixed(2),pausado:v.paused}));
console.log('tramo 1:', JSON.stringify(f1), (Math.abs(f1.t-FIN[0])<0.15&&f1.pausado)?'✓':'✗');

const filas=[];
for (let i=1;i<6;i++){
  await p.click('#adelante'); await p.waitForTimeout(500);
  const a = await p.evaluate(()=>document.getElementById('cap-no').textContent);
  await p.waitForTimeout(9300);
  const c = await p.evaluate(()=>({t:+v.currentTime.toFixed(2),pausado:v.paused}));
  filas.push({tramo:i+1,no:a,alFinal:c.t,ok:(Math.abs(c.t-FIN[i])<0.15&&c.pausado)?'sí':'NO'});
}
console.table(filas);
for (let i=0;i<3;i++){
  await p.evaluate(k=>document.querySelectorAll('.ba')[k].scrollIntoView({block:'center'}),i);
  await p.waitForTimeout(250);
  const r = await p.evaluate(k=>{const c=document.querySelectorAll('.ba')[k].getBoundingClientRect();
    return {x:c.x,y:c.y,w:c.width,h:c.height};},i);
  await p.mouse.move(r.x+r.w*0.5,r.y+r.h*0.5); await p.mouse.down();
  await p.mouse.move(r.x+r.w*0.25,r.y+r.h*0.5,{steps:8}); await p.mouse.up();
  await p.waitForTimeout(150);
  const pos = await p.evaluate(k=>getComputedStyle(document.querySelectorAll('.ba')[k]).getPropertyValue('--pos'),i);
  console.log('comparador '+(i+1)+':', pos.trim(), parseFloat(pos)<35?'✓':'✗');
}
console.log('peticiones:', [...new Set(red)].join(' | '));
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
