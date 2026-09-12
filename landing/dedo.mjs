import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({...devices['Pixel 5'], hasTouch:true,
  viewport:{width:390,height:844}, isMobile:true});
const errs=[]; p.on('pageerror',e=>errs.push('JS: '+e.message));
await p.goto('file:///tmp/claude-0/scratch/final/landing.html',{waitUntil:'load'});
await p.waitForTimeout(1500);
const cap = () => p.evaluate(()=>document.getElementById('cap-no').textContent);
const y = () => p.evaluate(()=>Math.round(scrollY));

const desliza = async (dx, dy=0) => {
  const x = 200, yy = 280;
  await p.touchscreen.tap(x, yy).catch(()=>{});
  await p.evaluate(([x,yy,dx,dy])=>{
    const el = document.getElementById('proceso');
    const t = (id,cx,cy) => new Touch({identifier:1, target:el, clientX:cx, clientY:cy});
    const ev = (tipo,cx,cy) => el.dispatchEvent(new TouchEvent(tipo,{
      bubbles:true, cancelable:true, touches:tipo==='touchend'?[]:[t(1,cx,cy)],
      changedTouches:[t(1,cx,cy)]}));
    ev('touchstart',x,yy);
    for (let k=1;k<=6;k++) ev('touchmove', x+dx*k/6, yy+dy*k/6);
    ev('touchend', x+dx, yy+dy);
  }, [x,yy,dx,dy]);
  await p.waitForTimeout(700);
};

console.log('al entrar:', await cap());
await desliza(-120);  console.log('arrastro a la izquierda ->', await cap(), '(debe avanzar)');
await desliza(-120);  console.log('otra vez a la izquierda ->', await cap());
await desliza(+120);  console.log('arrastro a la derecha   ->', await cap(), '(debe retroceder)');
await desliza(0,-150); console.log('arrastro vertical       ->', await cap(), '(NO debe cambiar)');
console.log('ERRORES:', errs.length?errs:'ninguno');
await b.close();
