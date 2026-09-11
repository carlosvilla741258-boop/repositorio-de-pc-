import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:8733/landing.html',{waitUntil:'load'});
await p.waitForTimeout(2000);
await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});
const g = await p.evaluate(()=>{const s=document.getElementById('proceso');
  return {top:s.offsetTop,h:s.offsetHeight,vh:innerHeight};});
await p.evaluate(y=>scrollTo(0,y), g.top+(2.5/6)*(g.h-g.vh));
await p.waitForTimeout(3000);
console.log('servidor sin Range ->', await p.evaluate(()=>({
  est:document.documentElement.classList.contains('estatico'),
  caps:document.querySelectorAll('.cap-est').length,
  t:+v.currentTime.toFixed(2)})));
await b.close();
