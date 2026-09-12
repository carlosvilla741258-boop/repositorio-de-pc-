import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w,h,n] of [[1440,900,'mk_d'],[390,844,'mk_m'],[360,800,'mk_xs']]){
  const p = await b.newPage({viewport:{width:w,height:h}});
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(900);
  const r = await p.evaluate(()=>{
    const im=document.querySelector('.brand .logo'), bt=document.querySelector('header .btn');
    const ri=im.getBoundingClientRect(), rb=bt.getBoundingClientRect();
    return {logo:{ok:im.complete&&im.naturalWidth>0, nat:im.naturalWidth+'x'+im.naturalHeight,
      alto:Math.round(ri.height)}, botonDer:Math.round(rb.right), pantalla:innerWidth,
      icono:!!document.querySelector('link[rel="icon"]')};});
  console.log(w+'px', JSON.stringify(r), r.botonDer<=r.pantalla?'✓':'✗ se sale');
  await p.screenshot({path:n+'.png', clip:{x:0,y:0,width:w,height:100}});
  await p.close();
}
await b.close();
