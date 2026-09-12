import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w,h,n] of [[1440,900,'pa_d'],[390,844,'pa_m']]){
  const p = await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('.pasos').scrollIntoView({block:'center'}));
  await p.waitForTimeout(400);
  await p.screenshot({path:n+'.png'});
  console.log(w+'px pasos:', await p.evaluate(()=>document.querySelectorAll('.pasos li').length),
    '| cerámico/aros fuera:', await p.evaluate(()=>!/Los dos que rematan/.test(document.body.textContent)),
    errs.length?errs:'');
  await p.close();
}
await b.close();
