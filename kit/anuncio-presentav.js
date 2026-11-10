// Formato «presentador que explica» (vertical): una presentadora habla a cámara y explica una idea en 3 pasos.
// Cada paso tiene su escenario (corte seco, otro ambiente y otra paleta), una tarjeta de dato arriba y otra emoción.
export default function (k) {
  const { THREE, scene, s, e, c, w, cl, lerp, pr, ventana, eio, eo, V, MARCA, W, mat, malla } = k;
  const RBG = k.RoundedBoxGeometry, PRIM = MARCA.colores.primario, ROSA = '#C73E70', AZUL = '#3D7DD9', ROJO = '#FF5C5C';
  const X1 = -26, X2 = 0, X3 = 26, X = W / 2;

  // ───────── piezas locales ─────────
  const grupo = x => { const g = new THREE.Group(); g.position.x = x; scene.add(g); return g; };
  const caja = (padre, an, al, fo, color, x, y, z, r = .06, o = {}) => malla(new RBG(an, al, fo, 4, Math.min(r, an / 2 - .005, al / 2 - .005, fo / 2 - .005)), mat(color, o), x, y, z, padre);
  const luz = (color, i) => new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: i, roughness: .6 });
  // pared con zócalo: tapa el horizonte y lo que haya detrás (los otros escenarios, la ciudad)
  const pared = (g, color, zocalo) => { caja(g, 20, 10, .3, color, 0, 5, -3.35, .02, { roughness: .92 }).castShadow = false; caja(g, 20, .3, .1, zocalo, 0, .15, -3.17, .02); };

  // ───────── Escenario 1 · «gancho»: cuarto cálido y oscuro, con una puerta que se cierra ─────────
  const g1 = grupo(X1); pared(g1, '#40231A', '#24120B');
  const PX = -1.95, PA = 1.6, PH = 3.5;
  caja(g1, PA + .36, PH + .18, .12, '#2A150C', PX, (PH + .18) / 2, -3.18, .03);                      // marco
  const vano = new THREE.Mesh(new THREE.PlaneGeometry(PA, PH), luz('#FFC873', 1.45)); vano.position.set(PX, PH / 2, -3.11); g1.add(vano);
  const hoja = new THREE.Group(); hoja.position.set(PX - PA / 2, 0, -3.05); g1.add(hoja);           // bisagra a la izquierda
  caja(hoja, PA, PH, .1, '#7A4326', PA / 2, PH / 2, 0, .03);
  [2.55, .95].forEach(y => caja(hoja, PA - .5, 1.25, .04, '#8C5030', PA / 2, y, .06, .05));
  malla(new THREE.SphereGeometry(.09, 16, 12), mat('#E8C36A', { metalness: .6, roughness: .3 }), PA - .2, 1.75, .13, hoja);
  const placa = k.crearCanal('whatsapp', .36); hoja.add(placa); placa.position.set(PA / 2, 2.55, .13); // la puerta es la de WhatsApp
  const luzPuerta = new THREE.PointLight('#FFD79A', 0, 10); luzPuerta.position.set(PX, 2, -2.2); g1.add(luzPuerta);
  // mesita con lámpara
  caja(g1, 1.3, .1, .7, '#2B160D', 1.75, 1.3, -2.6, .04); [-.5, .5].forEach(x => caja(g1, .1, 1.25, .1, '#2B160D', 1.75 + x, .63, -2.6, .03));
  malla(new THREE.CylinderGeometry(.16, .2, .08, 20), mat('#1B1210'), 1.75, 1.39, -2.6, g1); malla(new THREE.CylinderGeometry(.03, .03, .7, 10), mat('#1B1210'), 1.75, 1.75, -2.6, g1);
  malla(new THREE.CylinderGeometry(.24, .4, .5, 28, 1, true), luz('#FFB65C', 1.9), 1.75, 2.25, -2.6, g1).castShadow = false;
  const lampara = new THREE.PointLight('#FFAE5A', 22, 9); lampara.position.set(1.6, 2.5, -2.0); g1.add(lampara);
  caja(g1, 1.0, 1.3, .06, '#2B160D', .95, 4.1, -3.17, .03); caja(g1, .8, 1.1, .04, '#8B5A3C', .95, 4.1, -3.14, .02);   // cuadro

  // ───────── Escenario 2 · «regla»: sala clara, ventana luminosa, sofá y alfombra ─────────
  const g2 = grupo(X2); pared(g2, '#F4E9D6', '#FFFFFF');
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 360; const cg = cv.getContext('2d');
  const gr = cg.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#7FC2FF'); gr.addColorStop(1, '#E6F5FF'); cg.fillStyle = gr; cg.fillRect(0, 0, 256, 360);
  cg.fillStyle = 'rgba(255,255,255,.95)'; [[60, 110, 30], [95, 98, 42], [135, 112, 30], [165, 230, 26], [198, 220, 38], [228, 234, 24]].forEach(([x, y, r]) => { cg.beginPath(); cg.arc(x, y, r, 0, 7); cg.fill(); });
  const cielo = new THREE.CanvasTexture(cv); cielo.colorSpace = THREE.SRGBColorSpace;
  const VX = -2.0, VY = 3.05, VA = 2.7, VH = 3.0;
  caja(g2, VA + .3, VH + .3, .12, '#FFFFFF', VX, VY, -3.18, .04);
  const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(VA, VH), new THREE.MeshBasicMaterial({ map: cielo, toneMapped: false })); vidrio.position.set(VX, VY, -3.11); g2.add(vidrio);
  caja(g2, VA, .09, .06, '#FFFFFF', VX, VY + .25, -3.1, .02);
  [-.45, .45].forEach(dx => caja(g2, .09, VH, .06, '#FFFFFF', VX + dx * VA / 1.35, VY, -3.1, .02));
  caja(g2, VA + .6, .12, .34, '#FFFFFF', VX, VY - VH / 2 - .2, -3.03, .05);                           // repisa
  [[1.55, 2.85, 1.0, 1.25, '#E27A3F'], [2.75, 2.7, .8, .8, '#3E9C8F']].forEach(([x, y, an, al, col]) => { caja(g2, an, al, .07, '#FFFFFF', x, y, -3.17, .03); caja(g2, an - .22, al - .22, .05, col, x, y, -3.15, .02); });   // cuadros
  const SX = 1.95, SZ = -2.2, SOFA = AZUL, COJ = '#5C97EC';
  caja(g2, 3.5, .55, 1.5, SOFA, SX, .42, SZ, .16); caja(g2, 3.5, 1.3, .5, SOFA, SX, 1.02, SZ - .55, .2);
  [-1, 1].forEach(sg => { caja(g2, .5, 1.05, 1.5, SOFA, SX + sg * 1.7, .68, SZ, .2); caja(g2, 1.28, .3, 1.15, COJ, SX + sg * .66, .82, SZ + .12, .12); });
  caja(g2, .72, .72, .26, '#F2C14E', SX - .85, 1.3, SZ - .22, .12).rotation.z = .18; caja(g2, .72, .72, .26, ROSA, SX + .8, 1.3, SZ - .22, .12).rotation.z = -.14;
  caja(g2, 5.6, .04, 3.6, '#F7EEDD', .5, .02, -.5, .015, { roughness: .95 }).castShadow = false; caja(g2, 4.9, .05, 2.9, '#3E9C8F', .5, .025, -.5, .02, { roughness: .95 }).castShadow = false;
  caja(g2, 4.3, .06, 2.3, '#F7EEDD', .5, .03, -.5, .02, { roughness: .95 }).castShadow = false;   // alfombra con borde
  // planta junto a la ventana
  malla(new THREE.CylinderGeometry(.34, .26, .6, 20), mat('#FFFFFF', { roughness: .6 }), -3.05, .3, -2.3, g2);
  [[0, 1.25, 0, .5], [-.3, .95, .1, .36], [.32, 1.0, .05, .38], [.05, 1.7, -.05, .36]].forEach(([x, y, z, r]) => malla(new THREE.SphereGeometry(r, 18, 14), mat('#4C9A4A', { roughness: .8 }), -3.05 + x, y, -2.3 + z, g2));

  // ───────── Escenario 3 · «solución» y cierre: tarima con aro de luz y ciudad de noche ─────────
  k.crearCiudad({ x: X3, z: -38, ancho: 96, fondo: 24, alto: [9, 30], n: 70, semilla: 9, brillo: .55, encendidas: .3 });
  k.crearTarima({ radio: 3.4 }).position.x = X3;
  const l1 = new THREE.PointLight(PRIM, 40, 16); l1.position.set(X3 + 3.6, 3.6, 3); scene.add(l1);
  const l2 = new THREE.PointLight(AZUL, 34, 16); l2.position.set(X3 - 3.8, 3.2, 2.6); scene.add(l2);
  const l3 = new THREE.PointLight('#FFEBD6', 46, 15); l3.position.set(X3 + .4, 3.5, 5.6); scene.add(l3);   // luz de cara

  // ───────── Presentadora: el personaje del kit con melena ─────────
  const lina = k.crearPersonaje({ camisa: '#' + new THREE.Color(PRIM).multiplyScalar(.7).getHexString(), pelo: '#2A1B14' }); lina.scale.setScalar(.85);
  malla(new THREE.SphereGeometry(.5, 26, 20), mat('#2A1B14', { roughness: .85 }), 0, -.24, -.2, lina.userData.cab).scale.set(1.24, 1.22, .78);
  const P1 = V(X1, 0, 0), P2 = V(X2, 0, 0), P3 = V(X3, .16, 0);

  // ───────── Momentos (todos salen del guion) ─────────
  const tR = s('regla'), tS = s('solucion'), tC = s('cta');
  const t24 = c('gancho', 2), d24 = c('gancho', 3) - .05 - t24;          // «en 24 horas»: el reloj baja
  const tCierra = w('gancho', 11), tGolpe = tCierra + .26;                // «cierra»: la puerta se cierra
  const tNo = c('regla', 1), tSi = c('regla', 2);
  const tBoton = c('solucion', 1), tClic = w('solucion', 5);              // «desde tu panel»
  const tFin = c('cta', 1) - .06, tSeguir = c('cta', 1) + .32;            // «Síguenos»

  const pl = (x, p, q) => [[p[0] + x, p[1], p[2]], [q[0] + x, q[1], q[2]]];
  k.planos({
    medio1: pl(X1, [.9, 2.5, 9.4], [-.3, 2.0, 0]),
    cerca1: pl(X1, [-.5, 2.62, 5.6], [.05, 2.27, 0]),
    puerta1: pl(X1, [1.2, 2.4, 9.6], [-.5, 2.0, 0]),
    cerca2: pl(X2, [.7, 2.62, 5.7], [-.05, 2.3, 0]),
    medio2: pl(X2, [-1.0, 2.45, 9.4], [.2, 1.98, 0]),
    cerca3: pl(X3, [-.55, 2.78, 5.7], [.05, 2.43, 0]),
    medio3: pl(X3, [.8, 2.7, 9.2], [.18, 2.14, 0]),
    cerca3b: pl(X3, [.6, 2.7, 6.0], [0, 2.36, 0]),
    final: pl(X3, [.15, 2.6, 10.4], [.15, 3.0, 0]),
  }, [
    [0, 'medio1'], [t24 - .06, 'cerca1'], [c('gancho', 4) - .06, 'puerta1'],
    [tR, 'cerca2'], [tSi - .06, 'medio2'],
    [tS, 'cerca3'], [c('solucion', 2) - .06, 'medio3'],
    [tC, 'cerca3b'], [tFin, 'final'],
  ]);

  // sonidos: uno por cada cosa que aparece o cambia
  k.sonar(.1, 'pop'); [0, .33, .66].forEach(u => k.sonar(t24 + u * d24, 'tic', .8)); k.sonar(tGolpe, 'golpe'); k.sonar(tGolpe + .05, 'error', .8);
  k.sonar(tR + .1, 'pop'); k.sonar(tNo + .05, 'tic'); k.sonar(tSi + .05, 'brillo');
  k.sonar(tS + .1, 'pop'); k.sonar(tClic, 'tic'); k.sonar(tClic + .06, 'logro');
  k.sonar(tC + .06, 'pop'); k.sonar(tFin + .08, 'pop'); k.sonar(tSeguir, 'nivel');

  const dos = n => String(n).padStart(2, '0');
  return {
    actualizar(T) {
      const en1 = T < tR, en2 = T >= tR && T < tS, en3 = T >= tS, enCta = T >= tC;
      k.tono(en1 ? 'calido' : en2 ? 'sala' : 'neon');
      if (!en2) k.resplandor(.45);

      // escenario 1: la puerta se entorna mientras corre el reloj y se cierra de golpe en «cierra»
      const u24 = pr(T, t24, d24), cierre = eio(pr(T, tCierra, tGolpe - tCierra)), cerrada = T >= tGolpe;
      const abierta = (1 - .3 * u24) * (1 - cierre);
      hoja.rotation.y = -1.25 * abierta + (cerrada ? Math.sin((T - tGolpe) * 40) * .03 * Math.exp(-(T - tGolpe) * 9) : 0);
      vano.visible = abierta > .01; luzPuerta.intensity = 18 * abierta;

      // presentadora: se planta en el escenario de la escena y mira a la cámara
      const base = en1 ? P1 : en2 ? P2 : P3;
      const clic = ventana(T, tClic, tClic + .3, .1), sigue = pr(T, tSeguir, .3);
      lina.animar(T, base, {
        habla: k.boca(T, 'narra'),
        gira: Math.atan2(k.cam.position.x - base.x, k.cam.position.z - base.z) * .85,
        preocupado: en1 ? .95 : 0,
        sorpresa: en1 ? .85 * ventana(T, tGolpe - .05, e('gancho'), .12) : enCta ? .45 * ventana(T, c('cta', 0), tFin, .15) : 0,
        feliz: en3 ? 1 : en2 ? .5 * pr(T, tSi, .3) : 0,
        senala: en2 ? .95 * ventana(T, tSi, e('regla'), .22) : .9 * ventana(T, c('solucion', 2), tC, .2),
        brazos: sigue,
      });

      // 1 · la ventana de 24 horas se agota y queda cerrada
      const seg = Math.round(86400 * (1 - u24)), reloj = `${dos(Math.floor(seg / 3600))}:${dos(Math.floor(seg / 60) % 60)}:${dos(seg % 60)}`;
      const tiembla = cerrada ? Math.sin((T - tGolpe) * 55) * 14 * Math.exp(-(T - tGolpe) * 7) : 0;
      k.dato('ventana', `<div style="text-align:center"><div class="d-et">Ventana de WhatsApp</div>` +
        (cerrada ? `<div class="d-num mal">CERRADA</div>` : `<div class="d-num" style="color:${u24 > .7 ? ROJO : '#fff'}">${reloj}</div>`) + k.barra(1 - u24, u24 > .7 ? ROJO : null) + `</div>`,
        { x: X + tiembla, y: 420, w: 760 }, ventana(T, 0, e('gancho') - .05, .16));

      // 2 · qué se puede enviar después
      const altoRegla = 141 + (T > tNo ? 74 : 0) + (T > tSi ? 60 : 0);   // la tarjeta crece hacia abajo, con el borde de arriba quieto
      k.dato('regla', '<div class="d-et">Después de las 24 horas</div><div class="d-tit">¿Qué puedes escribirle?</div>' + k.fila('Mensaje libre', 'no', pr(T, tNo, .25)) + k.fila('Plantilla aprobada por Meta', 'ok', pr(T, tSi, .25)),
        { x: X, y: 280 + altoRegla / 2, w: 880 }, ventana(T, tR + .05, e('regla') - .05, .18));

      // 3 · se envía desde el panel (con la letra pequeña del costo)
      const enviada = T >= tClic;
      k.dato('enviar', `<div class="d-et">Tu panel · ${MARCA.nombre}</div><div class="d-tit">Enviar plantilla</div><div class="d-sub" style="font-size:32px">Cada envío tiene costo (tarifa de Meta)</div>` +
        k.boton(enviada ? 'Enviada ✓' : 'Enviar', '', .32 + .68 * pr(T, tBoton, .25)),
        { x: X, y: 425, w: 800, escala: 1 + .04 * clic }, pr(T, tS + .05, .18) * cl((tC - .02 - T) / .08));   // la letra pequeña se queda hasta el corte
      if (!enCta) k.confeti(T, tClic, { y: .34, dur: 1.4, ancho: .9 });   // sale por debajo de la tarjeta, que lo taparía

      // cierre · pregunta, botón de seguir y la marca
      k.dato('sabias', '¿Ya lo sabías?', { x: X - 10, y: 430, giro: -4, clase: 'globo', escala: 1.25 }, ventana(T, tC + .03, tFin - .04, .16));
      const sig = T >= tSeguir, pulso = 1 + .1 * ventana(T, tSeguir, tSeguir + .3, .1);
      k.dato('marca', `<img src="${MARCA.logo}" style="width:500px;display:block;margin:0 auto 2px">` +
        `<div class="d-btn" style="background:${sig ? PRIM : ROSA};transform:scale(${pulso.toFixed(3)})">${sig ? 'Siguiendo ✓' : '+ Seguir'}</div>`,
        { x: X, y: 500, w: 720, clase: 'claro' }, pr(T, tFin + .04, .3));
      k.confeti(T, tSeguir, { y: .4, dur: 1.0 });   // corto: el último segundo queda limpio

      // un solo cursor: hace clic en «Enviar» y luego en «Seguir»
      if (!enCta) { const u = eo(pr(T, tBoton + .12, tClic - tBoton - .2)); k.cursor(X + 130 + (1 - u) * 240, 520 + (1 - u) * 330, ventana(T, tBoton + .1, tC - .1, .15), clic); }
      else { const u = eo(pr(T, tFin + .1, tSeguir - tFin - .16)); k.cursor(X + 120 + (1 - u) * 250, 668 + (1 - u) * 300, pr(T, tFin + .1, .15), ventana(T, tSeguir, tSeguir + .3, .1)); }
    },
  };
}
