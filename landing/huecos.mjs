import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[390,844]]){
  const p = await b.newPage({viewport:{width:w,height:h}});
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{
    // El negro que se ve es: lo que sobra abajo de una sección + lo que sobra
    // arriba de la siguiente hasta su primer texto.
    const secs=[...document.querySelectorAll('main > section, main > .wrap')];
    const fondo = e => { const h=[...e.querySelectorAll('*')]
        .map(x=>x.getBoundingClientRect().bottom); return Math.max(...h); };
    const techo = e => { const t=[...e.querySelectorAll('*')]
        .filter(x=>x.textContent.trim() || x.tagName==='IMG')
        .map(x=>x.getBoundingClientRect().top); return Math.min(...t); };
    const out=[];
    for (let i=1;i<secs.length;i++)
      out.push(Math.round(techo(secs[i]) - fondo(secs[i-1])));
    return out;});
  console.log(w+'px  negro entre secciones:', g.join(', '), ' px');
  await p.close();
}
await b.close();
