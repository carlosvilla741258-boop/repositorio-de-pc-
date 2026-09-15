import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const w of [1440, 390]){
  const p = await b.newPage({viewport:{width:w,height:1000}});
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(1000);
  const r = await p.evaluate(()=>{
    const pares=[...document.querySelectorAll('.trabajo-par')];
    const huecos=[];
    for (let i=1;i<pares.length;i++){
      // del último píxel con contenido del anterior al primero del siguiente
      const fondo = Math.max(...[...pares[i-1].querySelectorAll('*')]
        .map(e=>e.getBoundingClientRect().bottom));
      const techo = Math.min(...[...pares[i].querySelectorAll('*')]
        .filter(e=>e.getBoundingClientRect().height>0)
        .map(e=>e.getBoundingClientRect().top));
      huecos.push(Math.round(techo-fondo));
    }
    return huecos;
  });
  console.log(w+'px  separación entre trabajos:', r.join(', '), 'px');
  await p.close();
}
await b.close();
