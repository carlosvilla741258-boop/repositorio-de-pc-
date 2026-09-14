import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:940}});
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(1200);
for (let i=0;i<3;i++){
  await p.evaluate(()=>{const e=document.getElementById('precios');
    scrollBy(0, e.getBoundingClientRect().top - 40);});
  await p.waitForTimeout(300);
}
console.log('hueco entre el texto de intro y la primera columna:', await p.evaluate(()=>{
  const lead=document.querySelector('#precios .lead').getBoundingClientRect();
  const plan=document.querySelector('.plan').getBoundingClientRect();
  return Math.round(plan.top - lead.bottom)+'px';}));
await p.screenshot({path:'sinpest.png'});
await b.close();
