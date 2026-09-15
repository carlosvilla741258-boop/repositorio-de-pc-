import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const sitios = [['file:///tmp/claude-0/scratch/final/landing.html','A'],
                ['http://127.0.0.1:8750/index.html','B']];
for (const [url,n] of sitios){
  for (const [w,h,etq] of [[1440,900,'d'],[390,844,'m']]){
    const p = await b.newPage({viewport:{width:w,height:h}, isMobile:etq==='m', hasTouch:etq==='m'});
    await p.goto(url,{waitUntil:'load'});
    await p.waitForTimeout(2600);
    await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});
    await p.screenshot({path:`cmp_${n}_${etq}_video.png`});
    await p.evaluate(()=>document.querySelectorAll('.ba')[2].scrollIntoView({block:'center'}));
    await p.waitForTimeout(400);
    await p.screenshot({path:`cmp_${n}_${etq}_gal.png`});
    await p.close();
  }
}
await b.close();
