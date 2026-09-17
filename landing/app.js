<script>
(function(){
"use strict";

/* Las flechas eligen el tramo; el video lo reproduce entero solo y se detiene.
   Cada tramo son los 8,04 s completos del clip más 0,2 s de negro: ese
   colchón es el seguro contra el salto al tramo siguiente. */
/* Tiempos MEDIDOS del propio archivo con detección de negros, no calculados:
   el filtro fps=24 deja los clips en 8,042 s y no en 8,096, y ese desfase
   acumulado metía la congelación dentro del negro. */
const T0  = [0,    8.292, 16.542, 24.792, 33.042, 41.292];  // arranque de cada tramo
const FIN = [7.98, 16.23, 24.48,  32.73,  40.98,  49.23];   // último fotograma con imagen
/* Punto exacto al que salta cada flecha. Normalmente t0 + 0,02 vale, pero el
   salto tiene que caer en un fotograma clave: si cae antes de uno, el
   navegador está obligado a bajar y descomponer el video desde la clave
   anterior para poder pintar esa imagen.

   Las claves del mp4 están en 0 · 8,292 · 16,542 · 24,792 · 33,0833 · 41,292.
   La del quinto clip quedó un fotograma tarde al montar el archivo —33,0833 en
   vez de 33,042—, así que el salto a 33,062 caía justo por delante de ella y
   obligaba a decodificar 8,23 s en lugar de 0,02. Esa era la demora al pasar
   de Pintura a Pulido, y la única de las cinco.

   El valor va con holgura por DELANTE de la clave, no pegado a ella: 33,083
   parece razonable y no sirve, porque la clave está en 33,08333 y se queda
   tres décimas de milisegundo corto. Medido con ffmpeg sobre el archivo:
   33,062 → 175 ms · 33,083 → 173 ms · 33,084 → 68 ms · 33,09 → 65 ms, que es
   lo mismo que cuestan los otros cuatro tramos. 33,09 sigue cayendo dentro
   del mismo fotograma, que dura hasta 33,125. */
const SALTO = [null, null, null, null, 33.09, null];
const CAPS = [
 { no:"Abarca Factoría", t:"Detalle y precisión\nen cada reparación",
   txt:"Cinco años devolviendo a los vehículos su aspecto original en San Juan de "+
       "Lurigancho. Usa las flechas para recorrer el proceso.", cta:true },
 { no:"01 / 05", t:"Qué reparamos",
   txt:"Capó, techo, puertas, aletas, tapa de maletero y parachoques. Toda la "+
       "carrocería exterior, pieza por pieza.",
   tar:[["Piezas de carrocería","8"],["Servicios","6"]] },
 { no:"02 / 05", t:"Planchado y enderezado",
   txt:"Reparación de abolladuras y corrección de estructura y chasis afectados por "+
       "golpes. Devolvemos la forma antes de tocar la pintura.",
   tar:[["Desde","S/ 100"],["Por choque","A evaluar"]] },
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
   txt:"Desmontaje, decapado y pintado de los cuatro aros en el color y acabado "+
       "que elijas. El detalle que cambia el carro entero.",
   tar:[["Juego de 4","A evaluar"],["Acabados","Plano · metalizado"]] }
];
CAPS.forEach(function(c,i){
  c.t0 = T0[i]; c.fin = FIN[i];
  c.salto = SALTO[i] === null ? T0[i] + 0.02 : SALTO[i];
});

/* Un solo juego de precios, el de auto: el servicio manda la fila y el nivel de
   acabado la columna, que es como de verdad se comparan. */
const PRECIOS = {
 niveles:[
   {nom:"Básica",  pie:"Cuidado esencial para mantener el carro en buen estado."},
   {nom:"Media",   pie:"El equilibrio entre acabado y precio.", tag:"Más elegido"},
   {nom:"Premium", pie:"El acabado más fino, como recién salido de fábrica."}],
 filas:[
   {svc:"Pintura",  celdas:[[["Colores planos","S/ 200 – 400"]],
                            [["Tricapa · colores especiales","S/ 350"]],
                            [["Candy","S/ 450 – 600"]]]},
   {svc:"Pulido",   celdas:[[["Un paso","S/ 350"]],
                            [["Tres pasos","S/ 700"]],
                            [["Tres pasos","S/ 900 – 1200"]]]},
   {svc:"Cerámico", celdas:[[["Dura 1 año","S/ 400 – 700"]],
                            [["Dura 3 años","S/ 600 – 800"]],
                            [["Dura 5 años","S/ 1200"],["Dura 7 años","S/ 2500"],
                             ["Dura 9 años","S/ 3500"]]]}]
};

const $  = s => document.querySelector(s);
const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
const clamp = (v,a,b) => v<a?a:(v>b?b:v);

/* ── Precios ── */
const contPlanes = $("#planes"), noteEl = $("#precio-nota");
const WA = "https://wa.me/51934965098";
let nivel = 1;                       // la del medio es la más elegida

function pintarPrecios(){
  const d = PRECIOS;
  nivel = clamp(nivel, 0, d.niveles.length - 1);

  contPlanes.innerHTML = d.niveles.map(function(n,i){
    const filas = d.filas.map(function(f){
      const pares = f.celdas[i];
      const val = pares.map(function(p,k){
        return k === 0 ? '<span class="tnum">'+p[1]+'</span>'
                       : '<small>'+p[0]+' · '+p[1]+'</small>';
      }).join("");
      return '<div class="row"><span class="k">'+f.svc+
             '<small>'+pares[0][0]+'</small></span>'+
             '<span class="v">'+val+'</span></div>';
    }).join("");
    const texto = "Hola, quiero un presupuesto de calidad " + n.nom + " para mi auto.";
    return '<div class="plan" role="button" tabindex="0" data-n="'+i+'" '+
             'aria-selected="'+(i===nivel)+'">'+
      '<div class="plan-cab"><h3>'+n.nom+'</h3>'+
        (n.tag ? '<span class="marca-tag">'+n.tag+'</span>' : '')+'</div>'+
      '<p class="desc">'+n.pie+'</p>'+ filas +
      '<div class="pedir"><a class="btn" href="'+WA+'?text='+encodeURIComponent(texto)+'">'+
        'Pedir este acabado</a></div></div>';
  }).join("");

  const planes = $$("#planes .plan");
  const elige = function(i){
    nivel = i;
    planes.forEach(function(el,k){ el.setAttribute("aria-selected", String(k===i)); });
  };
  planes.forEach(function(el,i){
    el.addEventListener("click", function(e){
      if (e.target.closest("a")) return;      // el botón de WhatsApp hace lo suyo
      elige(i);
    });
    el.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); elige(i); }
    });
  });
  noteEl.textContent = "Precios referenciales por vehículo completo. Los daños por choque se presupuestan aparte.";
}
pintarPrecios();

/* ── Escenario ── */
/* El escenario ocupa la pantalla menos la cabecera, y la cabecera cambia de
   alto según el ancho: se mide en vez de darla por supuesta. */
function mideCabecera(){
  const h = $("header").offsetHeight;
  if (h) document.documentElement.style.setProperty("--cab", h + "px");
}
mideCabecera();
addEventListener("resize", mideCabecera, {passive:true});

const v = $("#v"), peli = $("#proceso"), marcador = $("#marcador"), pista = $("#pista");
const avance = $("#avance");
const capNo = $("#cap-no"), capTit = $("#cap-tit"), capTxt = $("#cap-txt"), capTar = $("#cap-tar");
CAPS.forEach(function(c,i){
  marcador.insertAdjacentHTML("beforeend",
    '<button type="button" aria-label="Ir a '+c.t.split("\n").join(" ")+'"></button>');
});
const ticks = $$("#marcador button");
ticks.forEach(function(t,i){ t.addEventListener("click", function(){ irA(i); }); });
const atras = $("#atras"), adelante = $("#adelante");

/* Las flechas van al centro del video, no al centro del escenario: en un
   celular el video ocupa la franja de arriba y el centro cae sobre el texto. */
function ejeFlechas(){
  const rv = v.getBoundingClientRect(), rs = peli.getBoundingClientRect();
  if (rv.height) document.documentElement.style.setProperty(
    "--eje", ((rv.top - rs.top) + rv.height/2).toFixed(0) + "px");
}
addEventListener("resize", ejeFlechas, {passive:true});

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
  atras.disabled    = i === 0;
  adelante.disabled = i === CAPS.length - 1;
}

/* Entrar en un tramo: saltar a su inicio y dejarlo correr. */
function irA(i){
  if (i === cap) return;
  cap = i;
  tarjeta(i);
  if (!listo) return;
  try { v.currentTime = CAPS[i].salto; } catch(e){}
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
      /* Al acabar el tramo no hace falta decir nada: la flecha derecha
         queda encendida y es la que lleva al siguiente trabajo. */
      pista.style.opacity = 0;
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

function aEstatico(aviso){
  document.documentElement.classList.add("estatico");
  $("#capitulos").innerHTML =
    (aviso ? '<p class="aviso-est">'+aviso+'</p>' : '') +
    CAPS.map(c =>
      '<div class="cap-est"><p class="chapno">'+c.no+'</p>'+
      '<h2>'+c.t.split("\n").join(" ")+'</h2><p class="lead">'+c.txt+'</p>'+
      '<div class="tarifas">'+(c.tar||[]).map(x =>
        '<span class="tarifa">'+x[0]+'<b class="tnum">'+x[1]+'</b></span>').join("")+
      '</div></div>').join("");
}

function metadatos(){
  listo = (v.duration || 0) > 0;
  ejeFlechas();
  if (listo) irA(0);
}
v.addEventListener("loadedmetadata", metadatos);
/* Con el video incrustado los metadatos pueden estar listos ANTES de que
   corra este script: el evento no llegaría nunca. Se comprueba a mano. */
if (v.readyState >= 1) metadatos();
/* Que no haya video es lo único que deja la página sin nada que enseñar, y
   cuesta caro equivocarse: si se declara roto uno que iba a cargar, el
   visitante ve un aviso de error sobre un video que funciona.

   `networkState` no sirve para decidirlo. NETWORK_NO_SOURCE no significa
   "no hay video": es también el estado por el que pasa el navegador
   mientras todavía está eligiendo entre los <source>. Mirarlo daba por
   rotos videos que cargaban perfectamente.

   Lo único que no admite doble lectura es esto: si el navegador declara un
   error, es definitivo; y si al cabo de un rato largo no llegaron ni los
   metadatos ni un solo byte, no hay nada que enseñar. Mientras sigan
   llegando bytes es una conexión lenta, no un fallo, y se espera más. */
let dicho = false;
function aFallo(txt){
  if (dicho || listo) return;
  dicho = true;
  aEstatico(txt);
}
v.addEventListener("error", function(){
  if (v.error) aFallo("El video no pudo cargarse (error " + v.error.code + ").");
});
let bytes = false;
v.addEventListener("progress", function(){ bytes = true; });
(function espera(vuelta){
  setTimeout(function(){
    if (listo || dicho) return;
    if (bytes && vuelta < 4){ bytes = false; espera(vuelta + 1); return; }
    aFallo("El video no pudo cargarse.");
  }, 10000);
})(1);

tarjeta(0);
ejeFlechas();
/* Con movimiento reducido el video sigue reproduciéndose —es el contenido de
   la página, no un adorno— pero se dejan a la vista los mandos del navegador
   para que pararlo sea inmediato. */
if (reduce) v.controls = true;

/* Si el navegador bloqueó la reproducción, el primer gesto la libera. */
function desbloquear(){
  if (!bloqueado || !listo) return;
  bloqueado = false;
  try { v.currentTime = CAPS[cap].salto; } catch(e){}
  v.play().catch(function(){});
}
addEventListener("pointerdown", desbloquear, {passive:true});
addEventListener("keydown", desbloquear);

/* ── Pasar de un trabajo a otro ── */
function mover(paso){
  const d = clamp(cap + paso, 0, CAPS.length - 1);
  if (d !== cap) irA(d);
}
atras.addEventListener("click",    function(){ mover(-1); });
adelante.addEventListener("click", function(){ mover(+1); });

/* Con el dedo: sólo cuenta el gesto claramente horizontal, para no robarle
   el desplazamiento vertical a la página. */
let x0 = null, y0 = null, arrastre = false;
peli.addEventListener("touchstart", function(e){
  if (e.touches.length !== 1) { x0 = null; return; }
  x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; arrastre = false;
}, {passive:true});
peli.addEventListener("touchmove", function(e){
  if (x0 === null || arrastre) return;
  const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4){
    arrastre = true;
    mover(dx < 0 ? +1 : -1);   // se arrastra hacia la izquierda: viene el siguiente
  }
}, {passive:true});
peli.addEventListener("touchend", function(){ x0 = null; }, {passive:true});

/* Con el teclado, mientras el escenario esté a la vista. */
addEventListener("keydown", function(e){
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  const r = peli.getBoundingClientRect();
  if (r.bottom < 120 || r.top > innerHeight - 120) return;
  mover(e.key === "ArrowRight" ? +1 : -1);
});

/* La barra de arriba mide la página entera, no el escenario. */
let pendiente = false;
function marco(){
  pendiente = false;
  const h = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.width = (h>0 ? (scrollY/h)*100 : 0) + "%";
}
addEventListener("scroll", function(){
  if(!pendiente){ pendiente = true; requestAnimationFrame(marco); }
}, {passive:true});
addEventListener("resize", marco, {passive:true});
marco();

/* ── Cifras ── */
/* Los números suben al llegar a ellos. Nunca se quedan en cero: si el
   navegador no trae IntersectionObserver, o el bloque ya quedó arriba, o el
   aviso no llega, se escribe el valor final igual. */
$$("[data-cuenta]").forEach(function(el){
  const fin = +el.dataset.cuenta;
  const pon = function(){ el.textContent = fin; };
  if (reduce || !("IntersectionObserver" in window)){ pon(); return; }
  if (el.getBoundingClientRect().top < innerHeight){ pon(); return; }
  el.textContent = "0";
  let hecho = false;
  const sube = function(){
    if (hecho) return; hecho = true;
    const t0 = performance.now();
    (function paso(t){
      const k = Math.min((t - t0)/700, 1);
      el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(paso); else pon();
    })(t0);
  };
  const ob = new IntersectionObserver(function(es){
    if (es[0].isIntersecting){ ob.disconnect(); sube(); }
  }, {threshold:.6});
  ob.observe(el);
  setTimeout(function(){ if (!hecho){ ob.disconnect(); pon(); } }, 8000);
});

/* Fichas: pasar por encima cuenta el detalle; tocar lo fija. Al salir vuelve
   a lo fijado, o a la frase de siempre si no se ha fijado nada. */
$$("[data-fichas]").forEach(function(cont){
  const det = $(cont.dataset.fichas);
  if (!det) return;
  const base = det.dataset.base;
  const botones = Array.prototype.slice.call(cont.querySelectorAll("button"));
  let fijo = null;
  const muestra = function(b){ det.innerHTML = b ? b.dataset.det : base; };
  botones.forEach(function(b){
    b.addEventListener("mouseenter", function(){ muestra(b); });
    b.addEventListener("focus",      function(){ muestra(b); });
    b.addEventListener("click", function(){
      fijo = (fijo === b) ? null : b;
      botones.forEach(function(o){ o.setAttribute("aria-pressed", String(o === fijo)); });
      muestra(fijo);
    });
  });
  cont.addEventListener("mouseleave", function(){ muestra(fijo); });
  cont.addEventListener("focusout", function(e){
    if (!cont.contains(e.relatedTarget)) muestra(fijo);
  });
});

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
