import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:1000}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(1200);
const r = await p.evaluate(()=>{
  const t = s => [...document.querySelectorAll(s)].map(e=>e.textContent.trim());
  const media = [...document.querySelectorAll('.plan')][1];
  return {
    cifra: document.querySelector('.cifra-txt').textContent.replace(/\s+/g,' ').trim(),
    paso2: t('.pasos li p')[1],
    leadPrecios: document.querySelector('#precios .lead').textContent.replace(/\s+/g,' ').trim(),
    rotulos: t('#precios .eyebrow'),
    mediaPintura: media.querySelector('.row .k').textContent.replace(/\s+/g,' ').trim(),
    columnas: t('.plan h3')
  };});
console.log('1. cifras      :', r.cifra);
console.log('   ¿sin distrito?', !/Lurigancho/.test(r.cifra) ? '✓' : '✗ todavía lo menciona');
console.log('2. paso 02     :', r.paso2);
console.log('   ¿en físico?  ', /en físico/.test(r.paso2) && !/en persona/.test(r.paso2) ? '✓' : '✗');
console.log('3. lead precios:', r.leadPrecios);
console.log('   ¿acaba en gravedad y calidad?', /gravedad y calidad\.$/.test(r.leadPrecios) ? '✓' : '✗');
console.log('4. rótulos en precios:', r.rotulos.join(' | '), r.rotulos.includes('Autos')?'✓':'✗');
console.log('5. media/pintura:', r.mediaPintura, /colores especiales/.test(r.mediaPintura)?'✓':'✗');
console.log('   columnas intactas:', r.columnas.join(', '));
console.log('desborde:', await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
