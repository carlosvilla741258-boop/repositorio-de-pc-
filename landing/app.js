<script>
(function(){
"use strict";

/* El scroll elige el tramo; el video lo reproduce entero solo y se detiene.
   Cada tramo son los 8,04 s completos del clip más 0,2 s de negro: ese
   colchón es el seguro contra el salto al tramo siguiente. */
/* Tiempos MEDIDOS del propio archivo con detección de negros, no calculados:
   el filtro fps=24 deja los clips en 8,042 s y no en 8,096, y ese desfase
   acumulado metía la congelación dentro del negro. */
/* El tramo 2 dura menos que los demás a propósito: el clip sigue abriendo el
   carro hasta dejar el motor a la vista, y eso haría pensar que hacemos
   mecánica. Se corta en el fotograma 92, con las piezas de carrocería ya
   separadas y el frontal todavía cerrado. */
const T0  = [0,    8.292,  12.375, 20.625, 28.875, 37.125];  // arranque de cada tramo
const FIN = [7.98, 12.065, 20.315, 28.565, 36.815, 45.065];  // último fotograma con imagen
const CAPS = [
 { no:"Abarca Factoría", t:"Detalle y precisión\nen cada reparación",
   txt:"Cinco años devolviendo a los vehículos su aspecto original en San Juan de "+
       "Lurigancho. Desplázate para recorrer el proceso.", cta:true },
 { no:"01 / 05", t:"Qué reparamos",
   txt:"Capó, techo, puertas, aletas, tapa de maletero y parachoques. Toda la "+
       "carrocería exterior, pieza por pieza.",
   tar:[["Piezas de carrocería","8"],["Servicios","6"]] },
 { no:"02 / 05", t:"Planchado y enderezado",
   txt:"Reparación de abolladuras y corrección de estructura y chasis afectados por "+
       "golpes. Devolvemos la forma antes de tocar la pintura.",
   tar:[["Desde","S/ 80"],["Por choque","A evaluar"]] },
 { no:"03 / 05", t:"Pintura",
   txt:"Bajamos a fondo y aplicamos el acabado que elijas. Tres niveles, del color "+
       "plano al candy.",
   tar:[["Colores planos","S/ 200 – 400"],["Tricapa","S/ 350"],["Candy","S/ 450 – 600"]] },
 { no:"04 / 05", t:"Pulido y cerámico",
   txt:"Primero el pulido corrige el acabado y devuelve el brillo; encima, el "+
       "cerámico lo sella y lo protege durante años.",
   tar:[["Pulido básico","S/ 350"],["Pulido 3 pasos","S/ 700 – 1200"],
        ["Cerámico 1 año","S/ 400 – 700"],["Cerámico 9 años","S/ 3500"]] },
 { no:"05 / 05", t:"Pintado de aros",
   txt:"Desmontaje, decapado y pintado de las cuatro llantas en el color y acabado "+
       "que elijas. El detalle que cambia el carro entero.",
   tar:[["Juego de 4","A evaluar"],["Acabados","Plano · metalizado"]] }
];
CAPS.forEach(function(c,i){ c.t0 = T0[i]; c.fin = FIN[i]; });

const PRECIOS = {
 auto:[
  {t:"Calidad básica", d:"Cuidado esencial para mantener tu vehículo en buen estado.", f:false,
   r:[["Pintura","Colores planos","S/ 200 – 400"],["Pulido","Básico","S/ 350"],
      ["Cerámico","Duración 1 año","S/ 400 – 700"]]},
  {t:"Calidad media", d:"El equilibrio ideal entre acabado y precio.", f:true,
   r:[["Pintura","Tricapa","S/ 350"],["Pulido","3 pasos","S/ 700"],
      ["Cerámico","Duración 3 años","S/ 600 – 800"]]},
  {t:"Calidad premium", d:"El acabado más fino, como recién salido de fábrica.", f:false,
   r:[["Pintura","Candy","S/ 450 – 600"],["Pulido","3 pasos","S/ 900 – 1200"],
      ["Cerámico","5 años","S/ 1200"],["Cerámico","7 años","S/ 2500"],
      ["Cerámico","9 años","S/ 3500"]]}],
 camioneta:"Precios de camioneta: consúltanos por WhatsApp — varían según el tamaño del vehículo.",
 minivan:"Precios de minivan: por confirmar."
};

const $  = s => document.querySelector(s);
const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
const clamp = (v,a,b) => v<a?a:(v>b?b:v);

/* ── Precios ── */
const tiersEl = $("#tiers"), noteEl = $("#veh-note");
function pintarTiers(veh){
  const d = PRECIOS[veh];
  if (typeof d === "string"){ tiersEl.innerHTML=""; noteEl.textContent=d; return; }
  tiersEl.innerHTML = d.map(t =>
    '<article class="tier'+(t.f?" featured":"")+'"><h3>'+t.t+'</h3>'+
    '<p class="desc">'+t.d+'</p>'+
    t.r.map(r => '<div class="row"><span class="k">'+r[0]+'<small>'+r[1]+'</small></span>'+
                 '<span class="v tnum">'+r[2]+'</span></div>').join("")+'</article>').join("");
  noteEl.textContent = "Precios referenciales por vehículo completo. Los daños por choque se presupuestan aparte.";
}
pintarTiers("auto");
$$(".tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".tab").forEach(t => t.setAttribute("aria-selected", String(t===tab)));
  pintarTiers(tab.dataset.veh);
}));

/* ── Escenario ── */
const v = $("#v"), peli = $("#proceso"), marcador = $("#marcador"), pista = $("#pista");
const avance = $("#avance");
const capNo = $("#cap-no"), capTit = $("#cap-tit"), capTxt = $("#cap-txt"), capTar = $("#cap-tar");
CAPS.forEach(() => marcador.insertAdjacentHTML("beforeend","<i></i>"));
const ticks = $$("#marcador i");

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cap = -1, listo = false, bloqueado = false;

function tarjeta(i){
  const c = CAPS[i];
  capNo.textContent = c.no;
  capTit.innerHTML = c.t.split("\n").join("<br>");
  capTxt.textContent = c.txt;
  if (c.cta){
    capTar.className = "cta";
    capTar.innerHTML = '<a class="btn" href="https://wa.me/51934965098">Pide tu presupuesto</a>'+
                       '<a class="btn ghost" href="#precios">Ver precios</a>';
  } else {
    capTar.className = "tarifas";
    capTar.innerHTML = (c.tar||[]).map(x =>
      '<span class="tarifa">'+x[0]+'<b class="tnum">'+x[1]+'</b></span>').join("");
  }
  ticks.forEach((t,k) => t.classList.toggle("on", k===i));
}

/* Entrar en un tramo: saltar a su inicio y dejarlo correr. */
function irA(i){
  if (i === cap) return;
  cap = i;
  tarjeta(i);
  if (!listo || reduce) return;
  try { v.currentTime = CAPS[i].t0 + 0.02; } catch(e){}
  const intento = v.play();
  if (intento && intento.catch) intento.catch(function(){
    /* El navegador no deja reproducir todavía: al menos se muestra el
       final del tramo para que no quede un fotograma muerto. */
    bloqueado = true;
    try { v.currentTime = CAPS[i].fin; } catch(e){}
    pista.textContent = "Toca para reproducir";
    pista.style.opacity = 1;
  });
}

/* Detenerse justo al acabar la acción.
   `timeupdate` sólo dispara cada ~250 ms: a 24 fps eso son hasta 6 fotogramas
   de margen, y el video alcanzaba a mostrar el arranque del tramo siguiente
   antes de que diera tiempo a pausarlo. Ese era el salto. Con un bucle de
   animación se comprueba cada ~16 ms, muy por debajo de un fotograma. */
let vigilando = false;
function vigilar(){
  if (!vigilando) return;
  const c = CAPS[cap];
  if (c){
    const dentro = clamp((v.currentTime - c.t0)/(c.fin - c.t0), 0, 1);
    avance.style.width = (dentro*100).toFixed(1) + "%";
    if (v.currentTime >= c.fin){
      v.pause();
      try { v.currentTime = c.fin; } catch(e){}
      avance.style.width = "100%";
      if (cap < CAPS.length - 1){
        pista.textContent = "Sigue desplazándote";
        pista.style.opacity = 1;
      } else { pista.style.opacity = 0; }
      vigilando = false;
      return;
    }
  }
  requestAnimationFrame(vigilar);
}
v.addEventListener("play", function(){
  pista.style.opacity = 0;
  if (!vigilando){ vigilando = true; requestAnimationFrame(vigilar); }
});
v.addEventListener("pause", function(){ vigilando = false; });

function aEstatico(){
  document.documentElement.classList.add("estatico");
  $("#capitulos").innerHTML = CAPS.map(c =>
    '<div class="cap-est"><p class="chapno">'+c.no+'</p>'+
    '<h2>'+c.t.split("\n").join(" ")+'</h2><p class="lead">'+c.txt+'</p>'+
    '<div class="tarifas">'+(c.tar||[]).map(x =>
      '<span class="tarifa">'+x[0]+'<b class="tnum">'+x[1]+'</b></span>').join("")+
    '</div></div>').join("");
}

function metadatos(){
  listo = (v.duration || 0) > 0;
  if (listo && !reduce) irA(0);
}
v.addEventListener("loadedmetadata", metadatos);
/* Con el video incrustado los metadatos pueden estar listos ANTES de que
   corra este script: el evento no llegaría nunca. Se comprueba a mano. */
if (v.readyState >= 1) metadatos();
v.addEventListener("error", function(){
  aEstatico();
  pista.textContent = "El video no pudo cargarse";
});

tarjeta(0);
if (reduce) aEstatico();

/* Si el navegador bloqueó la reproducción, el primer gesto la libera. */
function desbloquear(){
  if (!bloqueado || !listo) return;
  bloqueado = false;
  try { v.currentTime = CAPS[cap].t0 + 0.02; } catch(e){}
  v.play().catch(function(){});
}
addEventListener("pointerdown", desbloquear, {passive:true});
addEventListener("keydown", desbloquear);

/* El scroll sólo elige el tramo. */
let pendiente = false;
function marco(){
  pendiente = false;
  const r = peli.getBoundingClientRect();
  const total = peli.offsetHeight - innerHeight;
  const p = clamp(total > 0 ? (-r.top)/total : 0, 0, 1);
  irA(clamp(Math.floor(p * CAPS.length), 0, CAPS.length - 1));
  const h = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.width = (h>0 ? (scrollY/h)*100 : 0) + "%";
}
if (!reduce){
  addEventListener("scroll", function(){
    if(!pendiente){ pendiente = true; requestAnimationFrame(marco); }
  }, {passive:true});
  addEventListener("resize", marco, {passive:true});
  marco();
}

/* ── Comparador antes/después ── */
$$("[data-ba]").forEach(function(ba){
  const set = function(pct){
    const q = clamp(pct,0,100);
    ba.style.setProperty("--pos", q+"%");
    ba.setAttribute("aria-valuenow", Math.round(q));
  };
  const desde = function(e){
    const r = ba.getBoundingClientRect();
    set(((e.clientX - r.left)/r.width)*100);
  };
  let drag = false;
  ba.addEventListener("pointerdown", function(e){ drag=true; ba.setPointerCapture(e.pointerId); desde(e); });
  ba.addEventListener("pointermove", function(e){ if(drag) desde(e); });
  ba.addEventListener("pointerup",   function(){ drag=false; });
  ba.addEventListener("pointercancel",function(){ drag=false; });
  ba.addEventListener("keydown", function(e){
    const n = parseFloat(ba.getAttribute("aria-valuenow"))||50;
    if (e.key==="ArrowLeft"){ set(n-4); e.preventDefault(); }
    if (e.key==="ArrowRight"){ set(n+4); e.preventDefault(); }
  });
});
})();
</script>
