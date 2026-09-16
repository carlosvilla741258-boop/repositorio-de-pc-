import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w,h,n] of [[1440,900,'g_d'],[390,844,'g_m']]){
  const p = await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById('trabajos').scrollIntoView());
  await p.waitForTimeout(600);
  const info = await p.evaluate(()=>{
    const ba=document.querySelector('.ba'), im=[...ba.querySelectorAll('img')];
    const r=ba.getBoundingClientRect();
    return {caja:[Math.round(r.width),Math.round(r.height)],
      imgs:im.map(i=>({cls:i.className, ok:i.complete&&i.naturalWidth>0,
        nat:i.naturalWidth+'x'+i.naturalHeight})),
      pos:getComputedStyle(ba).getPropertyValue('--pos')};});
  console.log(w+'px', JSON.stringify(info), errs.length?errs:'');
  await p.screenshot({path:n+'.png'});
  // arrastrar el control a un cuarto y a tres cuartos
  if (w===1440){
    const r = await p.evaluate(()=>{const q=document.querySelector('.ba').getBoundingClientRect();
      return {x:q.x,y:q.y,w:q.width,h:q.height};});
    await p.mouse.move(r.x+r.w*0.5, r.y+r.h*0.5); await p.mouse.down();
    await p.mouse.move(r.x+r.w*0.22, r.y+r.h*0.5, {steps:8}); await p.mouse.up();
    await p.waitForTimeout(300);
    await p.evaluate(()=>document.getElementById('trabajos').scrollIntoView());
    await p.screenshot({path:'g_arrastre.png'});
    console.log('tras arrastrar --pos =', await p.evaluate(()=>
      getComputedStyle(document.querySelector('.ba')).getPropertyValue('--pos')));
  }
  await p.close();
}
await b.close();
