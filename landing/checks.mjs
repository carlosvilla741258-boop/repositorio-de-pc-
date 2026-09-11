import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,rm] of [[1440,'no-preference'],[1280,'no-preference'],[768,'no-preference'],
                      [390,'no-preference'],[360,'no-preference'],[390,'reduce']]){
  const p = await b.newPage({viewport:{width:w,height:820}, reducedMotion:rm});
  await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
  await p.waitForTimeout(1400);
  const r = await p.evaluate(()=>{const d=document.documentElement;
    return {exceso:d.scrollWidth-d.clientWidth, estatico:d.classList.contains('estatico'),
            caps:document.querySelectorAll('.cap-est').length};});
  console.log(String(w).padStart(5)+'px '+rm.padEnd(14)+' exceso='+r.exceso+
              (r.estatico?'  [estático, '+r.caps+' capítulos]':''));
  await p.close();
}
// móvil: ¿se reproduce solo también ahí?
const m = await b.newPage({viewport:{width:390,height:844}});
await m.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await m.waitForTimeout(1000);
const a = await m.evaluate(()=>document.getElementById('v').currentTime);
await m.waitForTimeout(2200);
const c = await m.evaluate(()=>document.getElementById('v').currentTime);
console.log('móvil, tramo 1:', a.toFixed(2),'→',c.toFixed(2), c>a+1?'✓':'✗');
await m.addStyleTag({content:'html{scroll-behavior:auto !important}'});
const g = await m.evaluate(()=>{const s=document.getElementById('proceso');
  return {top:s.offsetTop,h:s.offsetHeight,vh:innerHeight};});
await m.evaluate(v=>scrollTo(0,v), g.top+0.45*(g.h-g.vh));
await m.waitForTimeout(2400); await m.screenshot({path:'movil.png'});
await b.close();
