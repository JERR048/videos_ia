// «La ventana de 24 horas» (vertical, formato robot): el robot de la marca presenta en un escenario oscuro y se mueve
// entre tres rincones: la puerta de WhatsApp con su reloj, la plantilla aprobada y el portátil que la envía a tres celulares.
// Sin figuras humanas: los clientes son celulares. Todo es función pura del tiempo T.
export default function (k) {
  // Datos del cierre: salen de marca.json, para que el ejemplo sirva con cualquier marca.
  const WEB = ((k.MARCA.cierre || {}).lineas || [])[1] || k.MARCA.nombre, TEL = (((k.MARCA.cierre || {}).datos || [])[0] || {}).texto || '';
  const { THREE, scene, s, e, c, w, cl, lerp, pr, ventana, eio, eo, eob, V, MARCA, W, H, mat, malla, redondo } = k;
  const RBG = k.RoundedBoxGeometry, PRIM = MARCA.colores.primario, AZUL = '#3D7DD9', VERDE = '#35D07F', ROJO = '#FF4B4B', X = W / 2;

  // ───────── piezas locales ─────────
  const caja = (padre, an, al, fo, color, x, y, z, r = .05, o = {}) => malla(new RBG(an, al, fo, 4, Math.min(r, an / 2 - .005, al / 2 - .005, fo / 2 - .005)), typeof color === 'string' ? mat(color, o) : color, x, y, z, padre);
  const luz = (color, i = 2) => new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: i, roughness: .5 });
  const lienzo = (an, al) => { const cv = document.createElement('canvas'); cv.width = an; cv.height = al; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { cv, g: cv.getContext('2d'), tex }; };
  const pantalla = (L, an, al) => new THREE.Mesh(new THREE.PlaneGeometry(an, al), new THREE.MeshBasicMaterial({ map: L.tex, toneMapped: false }));
  const cabe = (g, txt, peso, px, fam, maxW) => { g.font = `${peso} ${px}px ${fam}`; const m = g.measureText(txt).width; if (m > maxW) g.font = `${peso} ${Math.floor(px * maxW / m)}px ${fam}`; };

  // ───────── Momentos (todos salen del guion) ─────────
  const tR = s('regla'), tC = s('con'), tU = s('usos'), tF = s('cta');
  const t24 = c('gancho', 2), d24 = c('gancho', 3) - .1 - t24, tCero = t24 + d24;   // «en 24 horas»: corre la cuenta atrás
  const tCierra = w('gancho', 11), tGolpe = tCierra + .26;                           // «cierra»: portazo
  const tLibre = c('regla', 1), tSaca = c('regla', 3), tSello = c('regla', 5), tPega = tSello + .16, tVerde = c('regla', 6);
  const tCrea = c('con', 1), tClic = w('con', 6);                                    // «la creas» · «envías»
  const tMsg = [c('usos', 0), c('usos', 1), w('usos', 3)], tLlega = tMsg.map(t => t + .26);
  const tLogo = c('cta', 0), tFinal = c('cta', 1) - .06;

  // ───────── Escenario: dos tarimas con aro de luz, ciudad tenue y luces de color ─────────
  k.crearCiudad({ x: 5, z: -42, ancho: 130, fondo: 24, alto: [9, 30], n: 95, semilla: 11, brillo: .45, encendidas: .28 });
  const tar1 = k.crearTarima({ radio: 4.6 }); tar1.position.set(.1, 0, .2);
  const tar2 = k.crearTarima({ radio: 3.6, color: AZUL }); tar2.position.set(10.5, 0, .4);
  const aro1 = tar1.userData.aro.material;
  const luzP = new THREE.PointLight(VERDE, 30, 13); luzP.position.set(0, 2.6, .9); scene.add(luzP);
  const l1 = new THREE.PointLight(PRIM, 34, 16); l1.position.set(4.2, 3.8, 3.4); scene.add(l1);
  const l2 = new THREE.PointLight(AZUL, 30, 16); l2.position.set(-4.4, 3.4, 3.0); scene.add(l2);
  const l3 = new THREE.PointLight(AZUL, 32, 16); l3.position.set(7.0, 3.4, 3.2); scene.add(l3);
  const l4 = new THREE.PointLight(PRIM, 36, 16); l4.position.set(13.8, 3.6, 3.0); scene.add(l4);
  const cV = new THREE.Color(VERDE), cR = new THREE.Color(ROJO), cP = new THREE.Color(PRIM), cE = new THREE.Color();

  // ───────── Rincón 1 · la puerta de WhatsApp (bisagra a la izquierda, marco de neón, vano de luz) ─────────
  const PA = 2.1, PH = 4.6;
  const puerta = new THREE.Group(); puerta.position.set(0, .16, -1.4); scene.add(puerta);
  const mMarco = mat('#161D31', { roughness: .45, metalness: .3 }), mNeon = luz(VERDE, 2.3);
  [-1, 1].forEach(sg => { caja(puerta, .32, PH + .32, .36, mMarco, sg * (PA / 2 + .16), (PH + .32) / 2, 0, .05); caja(puerta, .06, PH + .1, .06, mNeon, sg * (PA / 2 + .16), (PH + .1) / 2, .2, .02).castShadow = false; });
  caja(puerta, PA + .64, .32, .36, mMarco, 0, PH + .16, 0, .05); caja(puerta, PA + .38, .06, .06, mNeon, 0, PH + .16, .2, .02).castShadow = false;
  const Lv = lienzo(128, 256); { const g = Lv.g, gr = g.createRadialGradient(64, 150, 10, 64, 150, 190); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#7c7c7c'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256); }
  const vano = new THREE.Mesh(new THREE.PlaneGeometry(PA, PH), new THREE.MeshBasicMaterial({ map: Lv.tex, color: VERDE, toneMapped: false })); vano.position.set(0, PH / 2, -.12); puerta.add(vano);
  const hoja = new THREE.Group(); hoja.position.set(-PA / 2, 0, .1); puerta.add(hoja);
  caja(hoja, PA, PH, .14, '#0E6B5C', PA / 2, PH / 2, 0, .04, { roughness: .5 });
  caja(hoja, PA - .5, 1.9, .05, '#128C7E', PA / 2, 3.25, .08, .06); caja(hoja, PA - .5, 1.6, .05, '#128C7E', PA / 2, 1.15, .08, .06);
  malla(new THREE.SphereGeometry(.11, 18, 14), mat('#F2D27A', { metalness: .6, roughness: .3 }), PA - .22, 2.2, .17, hoja);
  const placa = k.crearCanal('whatsapp', .62); hoja.add(placa); placa.position.set(PA / 2, 3.25, .19);

  // ───────── Reloj 3D: aro, 48 segmentos que se apagan y dos manecillas ─────────
  const CA = V(-2.0, 3.85, .1), NSEG = 48;
  const reloj = new THREE.Group(); scene.add(reloj);
  const mBlanco = new THREE.MeshStandardMaterial({ color: '#F5F7FB', emissive: '#ffffff', emissiveIntensity: .4, roughness: .4 });
  const mSegOn = luz(VERDE, 2.4), mSegOff = mat('#222C48', { roughness: .6 });
  malla(new THREE.CylinderGeometry(.72, .72, .12, 64), mat('#0C1224', { roughness: .55 }), 0, 0, -.07, reloj).rotation.x = Math.PI / 2;
  malla(new THREE.TorusGeometry(.72, .075, 14, 80), mat('#2B3658', { metalness: .55, roughness: .3 }), 0, 0, 0, reloj);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, m = malla(new THREE.BoxGeometry(.035, i % 3 ? .07 : .13, .02), mBlanco, Math.sin(a) * .45, Math.cos(a) * .45, .01, reloj); m.rotation.z = -a; m.castShadow = false; }
  const segs = Array.from({ length: NSEG }, (_, i) => { const a = (i + .5) / NSEG * Math.PI * 2, m = malla(new THREE.BoxGeometry(.055, .1, .03), mSegOn, Math.sin(a) * .6, Math.cos(a) * .6, .015, reloj); m.rotation.z = -a; m.castShadow = false; return m; });
  const mano = (an, largo) => { const p = new THREE.Group(); p.position.z = .05; reloj.add(p); malla(new THREE.BoxGeometry(an, largo, .03), mBlanco, 0, largo / 2 - .04, 0, p).castShadow = false; return p; };
  const mHora = mano(.075, .3), mMin = mano(.05, .46);
  malla(new THREE.CylinderGeometry(.06, .06, .06, 20), mat('#F5F7FB'), 0, 0, .07, reloj).rotation.x = Math.PI / 2;

  // ───────── Rincón 2 · tarjeta de plantilla en 3D y sello «APROBADA» ─────────
  const TW = 1.9, TH = 2.29, TB = V(2.15, 4.0, .2);
  const tpl = new THREE.Group(); scene.add(tpl);
  caja(tpl, TW, TH, .07, '#FFFFFF', 0, 0, 0, .08, { roughness: .45 });
  const Lt = lienzo(664, 800); { const g = Lt.g; g.fillStyle = '#fff'; g.fillRect(0, 0, 664, 800);
    g.fillStyle = '#E3F4E7'; redondo(g, 40, 40, 236, 66, 33); g.fill(); g.fillStyle = '#1F8A4C'; cabe(g, 'PLANTILLA', 800, 32, 'Inter', 184); g.fillText('PLANTILLA', 66, 85);
    g.fillStyle = '#111B21'; cabe(g, 'Tu cita es mañana', 800, 60, 'Inter', 584); g.fillText('Tu cita es mañana', 40, 214);
    g.fillStyle = '#3B4A54'; g.font = '500 44px Inter'; ['Hola, {{nombre}}:', 'te esperamos a las', '3:00 p. m. ¿Vienes?'].forEach((l, i) => g.fillText(l, 40, 296 + i * 60));
    g.fillStyle = '#8696A0'; g.font = '500 28px Inter'; g.textAlign = 'right'; g.fillText('9:41 a. m.', 624, 488);
    g.strokeStyle = '#E3E8EC'; g.lineWidth = 4; [520, 660].forEach(y => { g.beginPath(); g.moveTo(0, y); g.lineTo(664, y); g.stroke(); });
    g.fillStyle = '#027EB5'; g.font = '700 48px Inter'; g.textAlign = 'center'; g.fillText('Confirmar', 332, 608); g.fillText('Cambiar fecha', 332, 748); g.textAlign = 'left'; }
  const caraT = pantalla(Lt, TW - .06, TH - .06); caraT.position.z = .037; tpl.add(caraT);
  const sello = new THREE.Group(); tpl.add(sello);
  caja(sello, 1.2, .42, .06, '#178A45', 0, 0, 0, .1);
  const Ls = lienzo(500, 176); { const g = Ls.g; g.fillStyle = '#1FA855'; g.fillRect(0, 0, 500, 176); g.strokeStyle = '#fff'; g.lineWidth = 8; redondo(g, 14, 14, 472, 148, 26); g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; cabe(g, 'APROBADA', 900, 80, 'Montserrat', 410); g.fillText('APROBADA', 250, 116); }
  const caraS = pantalla(Ls, 1.14, .365); caraS.position.z = .032; sello.add(caraS);
  const destello = new THREE.Mesh(new THREE.RingGeometry(.36, .43, 48), new THREE.MeshBasicMaterial({ color: '#B9FFD0', transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); tpl.add(destello);

  // ───────── Rincón 3 · portátil con el panel (modo propio) y tres celulares ─────────
  const panel = k.crearPanelUI();
  Object.assign(panel.conf, { empresa: 'Tu negocio', seccion: 'Campañas', menuActivo: 'CAMPAÑAS', modo: (t, g) => {
    g.fillStyle = '#fff'; redondo(g, 290, 94, 1290, 886, 24); g.fill();
    g.fillStyle = '#0E1620'; g.font = '800 92px Montserrat'; g.fillText('Crear plantilla', 340, 216);
    const campo = (y, rot, txt, u, f) => { g.fillStyle = '#F3F5F7'; redondo(g, 340, y, 1190, 150, 22); g.fill(); g.strokeStyle = u > 0 && u < 1 ? PRIM : '#D5DBE3'; g.lineWidth = 5; redondo(g, 340, y, 1190, 150, 22); g.stroke();
      g.fillStyle = '#8A94A3'; g.font = '700 30px Inter'; g.fillText(rot, 372, y + 48);
      g.fillStyle = '#0E1620'; g.font = f; g.fillText(txt.slice(0, Math.round(txt.length * cl(u))) + (u > 0 && u < 1 ? '|' : ''), 372, y + 116); };
    campo(262, 'NOMBRE', 'recordatorio_cita', pr(t, tCrea, .32), '700 58px Inter');
    campo(434, 'MENSAJE', 'Hola, {{nombre}}: te esperamos…', pr(t, tCrea + .28, .4), '600 52px Inter');
    const p = ventana(t, tClic, tClic + .22, .08), ok = t >= tClic + .1;
    g.fillStyle = ok ? '#1F8A4C' : PRIM; redondo(g, 340 + p * 16, 640 + p * 11, 1190 - p * 32, 290 - p * 22, 48); g.fill();
    g.fillStyle = '#fff'; g.font = '800 104px Montserrat'; g.textAlign = 'center'; g.fillText(ok ? 'Enviada ✓' : 'Enviar campaña', 935, 822); g.textAlign = 'left';
  } });
  const LAP = V(9.75, 1.16, .2), ESC = .4;
  const ped = k.crearPedestal({ radio: 1.4, alto: 1.0, color: AZUL }); ped.position.set(LAP.x, .16, LAP.z);
  const lap = k.crearPortatil(panel); lap.scale.setScalar(ESC); lap.position.copy(LAP);
  const tapa = lap.userData.tapa;
  // un punto del lienzo del panel (1600×1000) → mundo
  const enPanel = (px, py, o) => tapa.localToWorld(o.set((px / 1600 - .5) * 4.86, 1.64 + (.5 - py / 1000) * 3.04, .08));

  const MSGS = [
    { negocio: 'Clínica Sonríe', ini: 'C', color: '#3D7DD9', lineas: ['Recordatorio', 'de tu cita'] },
    { negocio: 'Lavandería Sol', ini: 'L', color: '#E27A3F', lineas: ['Aviso:', 'mañana no hay', 'servicio'] },
    { negocio: 'Café La Montaña', ini: 'M', color: '#C73E70', lineas: ['Promoción', 'de la semana'] },
  ];
  const CW = 1.08, CH = 2.0;
  const pintarCel = (ph, on) => { const g = ph.L.g, m = MSGS[ph.i];
    g.fillStyle = '#EFE7DD'; g.fillRect(0, 0, 400, 740);
    g.fillStyle = '#0F7B5F'; g.fillRect(0, 0, 400, 118);
    g.fillStyle = m.color; g.beginPath(); g.arc(58, 62, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 34px Inter'; g.textAlign = 'center'; g.fillText(m.ini, 58, 74); g.textAlign = 'left';
    cabe(g, m.negocio, 700, 31, 'Inter', 280); g.fillText(m.negocio, 106, 62); g.font = '500 22px Inter'; g.fillStyle = 'rgba(255,255,255,.82)'; g.fillText('Cuenta de empresa', 106, 94);
    if (on) { const hB = 36 + m.lineas.length * 58 + 48; g.fillStyle = '#fff'; redondo(g, 14, 146, 372, hB, 26); g.fill();
      g.fillStyle = '#111B21'; const largo = m.lineas.reduce((a, b) => a.length > b.length ? a : b); cabe(g, largo, 800, 47, 'Inter', 332); m.lineas.forEach((l, j) => g.fillText(l, 34, 146 + 66 + j * 58));
      g.fillStyle = '#667781'; g.font = '500 24px Inter'; g.textAlign = 'right'; g.fillText('9:41 a. m.', 368, 146 + hB - 18); g.textAlign = 'left'; }
    g.fillStyle = '#F0F2F5'; g.fillRect(0, 656, 400, 84); g.fillStyle = '#fff'; redondo(g, 14, 670, 300, 56, 28); g.fill(); g.fillStyle = '#1DAA61'; g.beginPath(); g.arc(354, 698, 28, 0, 7); g.fill();
    ph.L.tex.needsUpdate = true; };
  const CEL = [V(9.2, 3.74, 2.6), V(10.52, 3.86, 2.6), V(11.84, 3.74, 2.6)];
  const cels = MSGS.map((m, i) => { const g = new THREE.Group(); scene.add(g);
    caja(g, CW, CH, .1, '#161C2C', 0, 0, 0, .14, { metalness: .4, roughness: .3 });
    const L = lienzo(400, 740), p = pantalla(L, CW - .1, (CW - .1) * 740 / 400); p.position.z = .052; g.add(p);
    const ph = { g, L, i, on: -1 }; return ph; });
  const mBurb = luz('#3DDC84', 1.9);
  const burbs = MSGS.map(() => { const g = new THREE.Group(); scene.add(g); caja(g, .52, .34, .1, mBurb, 0, 0, 0, .12).castShadow = false;
    [-.12, 0, .12].forEach(x => { const d = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })); d.position.set(x, 0, .06); g.add(d); });
    const cola = Array.from({ length: 5 }, (_, j) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.075 - j * .011, 10, 8), mBurb); scene.add(m); return m; });
    g.userData.cola = cola; return g; });

  // ───────── Robot presentador: flota con un aro de luz debajo y se desliza entre los rincones ─────────
  const robot = k.crearRobot(); robot.scale.setScalar(.75);
  const aroR = new THREE.Mesh(new THREE.TorusGeometry(.44, .04, 10, 60), luz(PRIM, 2.2)); aroR.rotation.x = Math.PI / 2; aroR.position.y = -.68; robot.add(aroR);
  const aroR2 = new THREE.Mesh(new THREE.TorusGeometry(.26, .025, 8, 48), luz(PRIM, 1.6)); aroR2.rotation.x = Math.PI / 2; aroR2.position.y = -.86; robot.add(aroR2);
  const RA = V(-2.0, 1.72, .3), RB = V(2.15, 1.47, .4), RC0 = V(7.3, 2.25, -2.3), RC1 = V(10.15, 2.05, -1.6), RC2a = V(12.2, 1.9, -.8), RC2 = V(11.45, 1.25, 0), RF0 = V(.15, 1.15, 1.6), RF = V(.15, 1.5, 1.6);
  const posRobot = (T, o) => T < tC ? o.lerpVectors(RA, RB, eio(pr(T, tR - .42, .72)))   // sale hacia la puerta justo antes del corte y entra al plano siguiente
    : T < tU ? o.lerpVectors(RC0, RC1, eo(pr(T, tC - .05, .8))) : T < tF ? o.lerpVectors(RC2a, RC2, eo(pr(T, tU - .05, .45))) : o.lerpVectors(RF0, RF, eob(pr(T, tF, .4)));
  const P = V(0, 0, 0), Pa = V(0, 0, 0), Pb = V(0, 0, 0), Q = V(0, 0, 0), S0 = V(0, 0, 0), Cc = V(0, 0, 0);

  // ───────── Cámara: plano general y primer plano en cada rincón ─────────
  k.planos({
    genA: [[-.9, 2.95, 12.6], [-.8, 2.45, 0]],
    relojA: [[.4, 3.2, 9.6], [-1.95, 2.87, .2]],
    puertaA: [[-.5, 2.0, 12.0], [-.88, 2.55, 0]],
    robotB: [[1.6, 2.4, 7.0], [2.17, 2.08, .4]],
    genB: [[1.6, 2.95, 12.6], [1.42, 2.5, 0]],
    genC: [[7.6, 2.75, 7.4], [9.95, 2.2, -.5]],
    laptopC: [[10.15, 2.3, 6.9], [9.8, 1.9, -.3]],
    usosC: [[10.5, 2.75, 13.6], [10.6, 2.3, 0]],
    cta1: [[.7, 2.3, 8.3], [.15, 2.0, 1.6]],
    final: [[.15, 2.85, 13.0], [.15, 2.58, 1.6]],
  }, [
    [0, 'genA'], [c('gancho', 2) - .06, 'relojA'], [c('gancho', 3) - .06, 'puertaA'],
    [tR, 'robotB'], [tSaca - .06, 'genB'],
    [tC, 'genC'], [tCrea - .06, 'laptopC'],
    [tU, 'usosC'],
    [tF, 'cta1'], [tFinal, 'final'],
  ]);

  // ───────── Sonidos: uno por cada cosa que aparece o cambia ─────────
  k.sonar(.12, 'pop'); [0, .25, .5, .75].forEach(u => k.sonar(t24 + u * d24, 'tic', .8));
  k.sonar(tGolpe, 'golpe'); k.sonar(tGolpe + .08, 'error', .7);
  k.sonar(tLibre + .05, 'tic'); k.sonar(tSaca + .08, 'pop'); k.sonar(tPega, 'brillo'); k.sonar(tVerde + .05, 'sube', .7);
  k.sonar(tC + .15, 'pop', .8); k.sonar(tCrea + .1, 'tic', .7); k.sonar(tCrea + .4, 'tic', .7); k.sonar(tClic, 'tic');
  tLlega.forEach(t => k.sonar(t, 'pop'));
  k.sonar(tLogo, 'logro'); k.sonar(tFinal + .1, 'pop', .8);

  const dos = n => String(n).padStart(2, '0');
  const pxl = v => { v.project(k.cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
  return {
    actualizar(T) {
      k.tono('neon'); k.resplandor(.45);
      const u24 = pr(T, t24, d24), dg = T - tGolpe;

      // la luz: verde → roja con el portazo → verde otra vez con la plantilla aprobada
      const rojo = T < tR ? Math.max(.6 * u24 * u24, pr(T, tCierra + .12, .14)) : 1 - eio(pr(T, tVerde, .45));
      cE.copy(cV).lerp(cR, rojo);
      mNeon.emissive.copy(cE); vano.material.color.copy(cE); luzP.color.copy(cE); aro1.color.copy(cE); aro1.emissive.copy(cE); mSegOn.emissive.copy(cE);
      l1.color.copy(cP).lerp(cR, rojo * .8);

      // la puerta: se entorna con la cuenta atrás, se cierra de golpe, se abre un poco con la plantilla y del todo en el cierre
      const ab = T < tR ? (1 - .3 * u24) * (1 - Math.pow(pr(T, tCierra, tGolpe - tCierra), 2.2)) : T < tF ? .26 * eob(pr(T, tVerde, .5)) : lerp(.26, 1.15, eo(pr(T, tF, .5)));
      hoja.rotation.y = -1.05 * ab + (dg >= 0 && dg < 1 ? Math.sin(dg * 40) * .03 * Math.exp(-dg * 9) : 0);
      vano.visible = ab > .004; luzP.intensity = lerp(22, 42, cl(ab));
      if (dg >= 0 && dg < .6) { const q = Math.exp(-dg * 9); k.cam.position.x += Math.sin(dg * 70) * .07 * q; k.cam.position.y += Math.cos(dg * 55) * .05 * q; }   // el portazo sacude la cámara

      // reloj: los segmentos se apagan y las manecillas corren
      reloj.visible = T < tR + .2;
      const dz = T - tCero, parpadeo = dz >= 0 && (dz * 5) % 1 < .5;
      reloj.position.set(CA.x + (dz >= 0 ? Math.sin(dz * 50) * .035 * Math.exp(-dz * 4) : 0), CA.y + Math.sin(T * 1.7) * .04, CA.z); reloj.rotation.y = .1 + Math.sin(T * .8) * .05;
      segs.forEach((m, i) => { m.material = (dz < 0 ? i / NSEG >= u24 : parpadeo) ? mSegOn : mSegOff; });
      mHora.rotation.z = -u24 * Math.PI * 4; mMin.rotation.z = -u24 * Math.PI * 10;

      // robot presentador
      const tramo = t => t < tC ? 0 : t < tU ? 1 : t < tF ? 2 : 3;
      posRobot(T, P); const vx = tramo(T + .03) === tramo(T - .03) ? (posRobot(T + .03, Pa).x - posRobot(T - .03, Pb).x) / .06 : 0;
      const saludo = ventana(T, .15, 1.0, .2) + .8 * ventana(T, tSaca - .1, tSello - .1, .2) + .7 * ventana(T, tLlega[0] - .2, tLlega[2] + .4, .2);
      robot.animar(T, P, cl(saludo), { habla: k.boca(T, 'locutor'), sorpresa: .9 * ventana(T, tGolpe - .05, e('gancho'), .12) + .5 * ventana(T, tPega, tPega + .6, .12), brazos: pr(T, tLogo - .05, .3) });
      robot.rotation.y = Math.atan2(k.cam.position.x - P.x, k.cam.position.z - P.z) * .85; robot.rotation.z = -cl(vx * .045, -.28, .28);
      const dn = T - c('gancho', 1); robot.userData.cab.rotation.y = dn > 0 && dn < .7 ? Math.sin(dn * 15) * .28 * Math.sin(dn / .7 * Math.PI) : 0;   // «no te escribe»: niega con la cabeza
      robot.userData.sombra.visible = false; aroR2.scale.setScalar(1 + .25 * Math.sin(T * 6));

      // plantilla 3D: sale del robot, flota y recibe el sello
      tpl.visible = T >= tSaca && T < tC;
      if (tpl.visible) {
        const us = pr(T, tSaca, .4), ds = T - tPega;
        Q.copy(P); Q.y += .5; Q.z += .4; tpl.position.lerpVectors(Q, TB, eo(us)); tpl.position.y += Math.sin(T * 1.6) * .04;
        tpl.scale.setScalar(Math.max(.001, eob(us)));
        tpl.rotation.set(-.04, -.16 + Math.sin(T * .9) * .06, Math.sin(T * 1.3) * .02 + (ds >= 0 ? Math.sin(ds * 38) * .05 * Math.exp(-ds * 8) : 0));
        const uq = pr(T, tSello - .04, .2), q = uq * uq; sello.visible = T >= tSello - .04;
        sello.position.set(.46, .93, .07 + (1 - q) * 1.7); sello.scale.setScalar(lerp(2.4, 1, q)); sello.rotation.z = -.17;
        const ud = pr(T, tPega, .45); destello.visible = ds >= 0 && ud < 1; destello.position.set(.46, .93, .12); destello.scale.setScalar(1 + ud * 1.3); destello.material.opacity = .9 * (1 - ud);
      }

      // portátil con el panel y celulares
      const enC = T >= tC - .3 && T < tF;
      lap.visible = ped.visible = enC || T < tF;
      tapa.rotation.x = lerp(1.5, -.2, eob(pr(T, tC + .05, .5)));
      if (enC) panel.dibujar(T);
      lap.updateMatrixWorld(true);
      cels.forEach((ph, i) => {
        const a = T >= tU && T < tF ? eob(pr(T, tU - .02 + i * .05, .26)) : 0, dl = T - tLlega[i], on = dl >= 0 ? 1 : 0;
        ph.g.visible = a > 0; if (!ph.g.visible) return;
        if (ph.on !== on) { pintarCel(ph, on); ph.on = on; }
        ph.g.position.copy(CEL[i]); ph.g.position.y += Math.sin(T * 1.5 + i * 1.7) * .035;
        ph.g.rotation.set(-.04, (1 - i) * .16, (i - 1) * -.03 + (on ? Math.sin(dl * 30) * .05 * Math.exp(-dl * 7) : 0));
        ph.g.scale.setScalar(Math.max(.001, a) * (1 + (on ? .16 * Math.exp(-dl * 6) : 0)));
      });
      // los mensajes salen de la pantalla del portátil y vuelan en arco a cada celular
      enPanel(935, 500, S0);
      burbs.forEach((b, i) => {
        const u = pr(T, tMsg[i] - .12, .38), vis = u > 0 && u < 1; b.visible = vis;
        const en = (uu, o) => { const v = cl(uu), z = CEL[i]; Cc.set((S0.x + z.x) / 2 + (z.x - S0.x) * .35, Math.max(S0.y, z.y) + .5, z.z + .9);
          return o.set((1 - v) * (1 - v) * S0.x + 2 * v * (1 - v) * Cc.x + v * v * z.x, (1 - v) * (1 - v) * S0.y + 2 * v * (1 - v) * Cc.y + v * v * z.y, (1 - v) * (1 - v) * S0.z + 2 * v * (1 - v) * Cc.z + v * v * (z.z + .1)); };
        if (vis) { en(u, b.position); b.scale.setScalar(.55 + .6 * Math.sin(u * Math.PI)); b.rotation.z = Math.sin(u * 9) * .2; }
        b.userData.cola.forEach((m, j) => { const uj = u - (j + 1) * .07; m.visible = vis && uj > 0; if (m.visible) en(uj, m.position); });
      });

      // ── tarjetas ──
      // 1 · la ventana de 24 horas se agota y queda cerrada
      const seg = Math.round(86400 * (1 - u24)), cerrada = dg >= 0;
      const tiembla = cerrada ? Math.sin(dg * 55) * 14 * Math.exp(-dg * 7) : 0;
      k.dato('ventana', `<div style="text-align:center"><div class="d-et">Ventana de WhatsApp</div>` +
        (cerrada ? `<div class="d-num mal" style="font-size:92px">CERRADA</div>` : `<div class="d-num" style="font-size:92px;color:${u24 > .7 ? ROJO : '#fff'}">${dos(Math.floor(seg / 3600))}:${dos(Math.floor(seg / 60) % 60)}:${dos(seg % 60)}</div>`) + `</div>`,
        { x: X + tiembla, y: 336, w: 700 }, ventana(T, -.2, tR - .04, .14));

      // 2 · después de 24 horas ya no sirve un mensaje libre
      const no = T >= tLibre;
      k.dato('libre', `<div class="d-et">Después de 24 horas</div><div class="d-fila ${no ? 'no' : ''}" style="margin-bottom:4px"><i>${no ? '✕' : '•'}</i><span style="${no ? 'text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:#EF4444;opacity:.75' : ''}">Mensaje libre</span></div>`,
        { x: X, y: 340, w: 640, escala: 1 + .07 * ventana(T, tLibre, tLibre + .26, .1) }, ventana(T, tR + .08, tSaca - .08, .16));

      // 3 · el panel, con la letra pequeña
      k.dato('letra', `<div class="d-et">Tu panel · ${k.MARCA.nombre}</div><div class="d-sub" style="font-size:32px;line-height:1.3;opacity:.96">Cada envío de plantilla tiene costo.<br>Requiere número oficial.</div>`,
        { x: X, y: 322, w: 760 }, pr(T, tC + .06, .18) * cl((tU - .02 - T) / .08));
      const uc = eio(pr(T, tClic - .5, .4)), clic = ventana(T, tClic, tClic + .25, .08);
      enPanel(lerp(1300, 1330, uc), lerp(545, 850, uc), Q); const [qx, qy] = pxl(Q);
      k.cursor(qx, qy, ventana(T, tCrea + .1, tU - .08, .15), clic);

      // cierre · la marca
      k.dato('logo', `<img src="${MARCA.logo}" style="width:330px;display:block;margin:0 auto">`, { x: X, y: 372, w: 450, clase: 'claro' }, ventana(T, tLogo - .04, tFinal - .03, .14));
      k.dato('cierre', `<img src="${MARCA.logo}" style="width:430px;display:block;margin:0 auto 6px"><div class="d-tit" style="text-align:center;color:#0E1620">Retoma la <b style="color:${PRIM}">conversación</b></div>` +
        k.boton(WEB, '', 1) + `<div class="d-sub" style="text-align:center;color:#2E3A48;opacity:1;font-weight:800;font-size:38px;margin-top:16px">${TEL}</div>`,
        { x: X, y: 560, w: 820, clase: 'claro' }, T >= tFinal ? .55 + .45 * pr(T, tFinal, .15) : 0);
      if (T < tFinal) k.confeti(T, tLogo, { y: .3, dur: 1.5, ancho: .9 }); else k.confeti(T, tFinal + .1, { y: .46, dur: 1.2, ancho: .9 });
    },
  };
}
