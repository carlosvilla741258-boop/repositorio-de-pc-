import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const vp of [{width:1440,height:900},{width:390,height:844}]){
  const p = await b.newPage({viewport:vp});
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{
    const r = e => { const b=e.getBoundingClientRect(); return {t:Math.round(b.top),b:Math.round(b.bottom),h:Math.round(b.height)}; };
    const cs = e => getComputedStyle(e);
    return {
      vh: innerHeight,
      header: r(document.querySelector('header')) ,
      headerPos: cs(document.querySelector('header')).position,
      main: r(document.querySelector('main')),
      scrolly: r(document.getElementById('proceso')),
      stage: r(document.querySelector('.stage')),
      panel: r(document.querySelector('.panel')),
      video: r(document.getElementById('v')),
      marcador: r(document.getElementById('marcador')),
      flecha: r(document.getElementById('adelante'))
    };});
  console.log(vp.width+'px', JSON.stringify(g,null,0));
  await p.close();
}
await b.close();
