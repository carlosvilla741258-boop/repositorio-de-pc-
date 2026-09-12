import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const FIN = [7.98, 16.23, 24.48, 32.73, 40.98, 49.23];
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push('JS: '+e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(1500);

console.log('alto del escenario:', await p.evaluate(()=>{
  const s=document.getElementById('proceso');
  return s.offsetHeight+'px (pantalla '+innerHeight+'px)';}));
console.log('flechas al entrar:', await p.evaluate(()=>({
  atras:document.getElementById('atras').disabled,
  adelante:document.getElementById('adelante').disabled})),
  '← la de atrás debe estar apagada en el primer tramo');

await p.waitForTimeout(9500);
const f1 = await p.evaluate(()=>({t:+v.currentTime.toFixed(3), pausado:v.paused}));
console.log('tramo 1:', JSON.stringify(f1), (Math.abs(f1.t-FIN[0])<0.1&&f1.pausado)?'✓':'✗');

const filas=[];
for (let i=1;i<6;i++){
  await p.click('#adelante');
  await p.waitForTimeout(500);
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
console.log('flecha adelante en el último:', await p.evaluate(()=>document.getElementById('adelante').disabled), '← debe ser true');

// volver atrás
await p.click('#atras'); await p.waitForTimeout(600);
console.log('tras retroceder:', await p.evaluate(()=>({
  no:document.getElementById('cap-no').textContent,
  t:+v.currentTime.toFixed(2)})));
// saltar con las marcas
await p.click('#marcador button:nth-child(2)'); await p.waitForTimeout(600);
console.log('tras tocar la marca 2:', await p.evaluate(()=>({
  no:document.getElementById('cap-no').textContent,
  t:+v.currentTime.toFixed(2)})));
// el scroll ya no cambia de trabajo
await p.evaluate(()=>scrollTo(0,innerHeight*2)); await p.waitForTimeout(700);
console.log('tras bajar la página:', await p.evaluate(()=>
  document.getElementById('cap-no').textContent), '← debe seguir siendo el mismo');
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
