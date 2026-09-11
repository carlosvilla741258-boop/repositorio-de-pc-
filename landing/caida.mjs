import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:900}});
await p.route('**/proceso.*', r => r.abort());     // simula el video que no llega
await p.goto('http://127.0.0.1:8732/landing.html',{waitUntil:'load'});
await p.waitForTimeout(3000);
const r = await p.evaluate(()=>({estatico:document.documentElement.classList.contains('estatico'),
  caps:document.querySelectorAll('.cap-est').length,
  aviso:document.getElementById('pista').textContent}));
console.log('sin video ->', JSON.stringify(r), (r.estatico&&r.caps===6)?'✓ cae a capítulos escritos':'✗ se queda en negro');
await p.screenshot({path:'caida.png'});
await b.close();
