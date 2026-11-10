// Formato «cuento con dibujos» (vertical): personajes 2D planos (carteles que miran a la cámara) dentro de un mundo 3D
// de formas simples con contorno de tinta. Un narrador cuenta; cada frase se ilustra literalmente.
// Piezas hechas aquí (candidatas a pasar al kit): dibujo(), entintar(), cartel(), halo(), encuadre().
export default function (k) {
  const { THREE, scene, cam, s, e, c, cl, lerp, eo, eob, eio, pr, ventana, V, MARCA, W } = k;
  const total = k.TL.total, PRIM = MARCA.colores.primario;
  const TINTA = '#241726', CREMA = '#FFF6E4', SUELO = .14;
  const C = h => new THREE.Color(h);

  // ───────── Texturas dibujadas ─────────
  const lienzo = (w, h, pinta) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); pinta(g, w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const texto = (txt, fondo, color, w = 512, h = 224, borde = 0) => lienzo(w, h, g => { g.fillStyle = fondo; g.fillRect(0, 0, w, h);
    if (borde) { g.strokeStyle = color; g.lineWidth = borde; g.strokeRect(borde * 1.4, borde * 1.4, w - borde * 2.8, h - borde * 2.8); }
    g.fillStyle = color; g.font = `900 ${Math.round(h * .56)}px Montserrat, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + h * .03, w * .82); });

  // ───────── entintar(malla, grosor): contorno de tinta con «casco invertido» ─────────
  // Una copia de la malla un poco más grande, negra y con las caras hacia adentro: solo asoma por la silueta.
  const mTinta = new THREE.MeshBasicMaterial({ color: '#1A1020', side: THREE.BackSide });
  function entintar(m, grosor = .035) {
    const geo = m.geometry; geo.computeBoundingBox(); const t = new THREE.Vector3(), o = new THREE.Vector3(); geo.boundingBox.getSize(t); geo.boundingBox.getCenter(o);
    const h = new THREE.Mesh(geo, mTinta);
    h.scale.set((t.x + 2 * grosor / m.scale.x) / Math.max(t.x, 1e-4), (t.y + 2 * grosor / m.scale.y) / Math.max(t.y, 1e-4), (t.z + 2 * grosor / m.scale.z) / Math.max(t.z, 1e-4));
    h.position.set(o.x * (1 - h.scale.x), o.y * (1 - h.scale.y), o.z * (1 - h.scale.z));
    m.add(h); return m;
  }
  const P = (color, o = {}) => new THREE.MeshToonMaterial(Object.assign({ color }, o));   // dos tonos planos, sin brillos
  const caja = (w, h, d, color, x, y, z, padre = scene, g = .035) => { const m = k.malla(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? P(color) : color, x, y, z, padre); return g ? entintar(m, g) : m; };
  const cil = (r0, r1, h, color, x, y, z, padre = scene, g = .035, seg = 20) => { const m = k.malla(new THREE.CylinderGeometry(r0, r1, h, seg), typeof color === 'string' ? P(color) : color, x, y, z, padre); return g ? entintar(m, g) : m; };
  const bola = (r, color, x, y, z, padre = scene, g = .035) => { const m = k.malla(new THREE.SphereGeometry(r, 28, 20), typeof color === 'string' ? P(color) : color, x, y, z, padre); return g ? entintar(m, g) : m; };
  // placa: cosa plana pegada a una pared (puerta, ventana); el contorno es otra placa de tinta un poco más grande detrás
  const mPlacaTinta = new THREE.MeshBasicMaterial({ color: '#1A1020' });
  const placa = (w, h, material, x, y, z, padre = scene, g = .05) => { const t = new THREE.Mesh(new THREE.PlaneGeometry(w + 2 * g, h + 2 * g), mPlacaTinta); t.position.set(x, y, z); padre.add(t);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material); m.position.set(x, y, z + .012); padre.add(m); return m; };
  const techo = (w, d, alto, color, x, y, z, g = .035) => { const m = k.malla(new THREE.ConeGeometry(Math.SQRT1_2, alto, 4), P(color), x, y + alto / 2, z); m.rotation.y = Math.PI / 4; m.scale.set(1, 1, 1);
    const grupo = new THREE.Group(); grupo.position.set(x, y + alto / 2, z); grupo.scale.set(w, 1, d); scene.add(grupo); m.position.set(0, 0, 0); grupo.add(m); entintar(m, g); return grupo; };

  // ───────── La calle ─────────
  caja(60, SUELO, 4.8, '#F4E6CB', 0, SUELO / 2, 1.0);                       // acera (z de −1,4 a 3,4)
  caja(60, .05, 7, '#5E6588', 0, .025, 6.9, scene, 0);                      // calzada
  for (let i = -6; i <= 6; i++) caja(1.3, .02, .16, '#FFF7E8', i * 2.7 + .6, .06, 6.9, scene, 0);

  // La tienda: caja crema con puerta, vitrina, toldo de franjas, rótulo y reloj
  const TX = -.3, TW = 3.4, TH = 3.75;
  caja(TW, TH, 4, '#FFF1D2', TX, TH / 2, -2);
  caja(TW + .3, .22, 4.3, '#E4572E', TX, TH + .11, -2);
  const PX = -1.2, PW = 1.1, PH = 2.25;                                       // puerta
  const mInterior = new THREE.MeshBasicMaterial({ color: '#2A3566' });
  placa(PW, PH, mInterior, PX, SUELO + PH / 2, .006, scene, .07);
  const puerta = new THREE.Group(); puerta.position.set(PX - PW / 2, SUELO, .05); scene.add(puerta);   // bisagra a la izquierda
  caja(PW, PH, .07, '#3D7DD9', PW / 2, PH / 2, 0, puerta, .03);
  [[.62, .75], [1.62, .95]].forEach(([y, h]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(PW - .3, h), P('#2F66BC')); p.position.set(PW / 2, y, .037); puerta.add(p); });
  bola(.065, '#FFC83D', PW - .13, 1.08, .07, puerta, .02);
  const letrero = new THREE.Group(); letrero.position.set(PW / 2, 1.78, .075); puerta.add(letrero);
  const mLado = P('#FFF7E8');
  const mAbierto = P('#ffffff', { map: texto('ABIERTO', '#3FA34D', '#FFFFFF', 512, 232, 10) });
  const mCerrado = P('#ffffff', { map: texto('CERRADO', '#E23D3D', '#FFFFFF', 512, 232, 10) });
  k.malla(new THREE.BoxGeometry(.96, .44, .04), [mLado, mLado, mLado, mLado, mAbierto, mCerrado], 0, 0, 0, letrero).castShadow = false;
  letrero.add(new THREE.Mesh(new THREE.BoxGeometry(1.04, .52, .028), new THREE.MeshBasicMaterial({ color: '#1A1020' })));
  // vitrina
  const VX = .42, VW = 1.5, VH = 1.4, VY = SUELO + .78 + VH / 2;
  const mVidrio = new THREE.MeshBasicMaterial({ color: '#FFF0B8', map: lienzo(384, 358, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(36,23,38,.5)'; g.fillRect(0, h * .56, w, 12);                                    // repisa
    g.fillRect(40, h * .56 - 92, 54, 92); g.fillRect(56, h * .56 - 122, 22, 34);                         // botella
    g.beginPath(); g.arc(170, h * .56 - 44, 44, 0, 7); g.fill(); g.fillRect(250, h * .56 - 70, 86, 70);  // tarro y caja
    g.fillRect(60, h - 96, 110, 96); g.beginPath(); g.arc(270, h - 52, 52, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(w * .62, 0); g.lineTo(w * .8, 0); g.lineTo(w * .5, h); g.lineTo(w * .32, h); g.fill(); }) });
  placa(VW, VH, mVidrio, VX, VY, .006, scene, .07);
  caja(VW + .26, .1, .22, '#F2A65A', VX, VY - VH / 2 - .1, .11);
  // toldo de franjas
  const mToldo = P('#ffffff', { map: lienzo(512, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#FFF7E8' : '#EF4E4E'; g.fillRect(i * w / 8, 0, w / 8 + 1, h); } }) });
  const TY = 2.74, TINC = .25, TD = .9;
  const toldo = caja(TW + .1, .07, TD, mToldo, TX, TY, TD / 2 + .01); toldo.rotation.x = TINC;
  caja(TW + .1, .24, .05, mToldo, TX, TY - Math.sin(TINC) * TD / 2 - .12, .01 + TD / 2 + Math.cos(TINC) * TD / 2);
  // rótulo y reloj
  caja(1.75, .5, .1, P('#ffffff', { map: texto('TIENDA', '#2F66BC', '#FFF7E8', 512, 146) }), -1.02, 3.3, .06);
  const RX = .62, RY = 3.3;
  const aroReloj = cil(.36, .36, .12, '#FFC83D', RX, RY, .06, scene, .035, 40); aroReloj.rotation.x = Math.PI / 2;
  const reloj = new THREE.Group(); reloj.position.set(RX, RY, .125); scene.add(reloj);
  reloj.add(new THREE.Mesh(new THREE.CircleGeometry(.3, 40), new THREE.MeshBasicMaterial({ map: lienzo(256, 256, g => { g.fillStyle = CREMA; g.fillRect(0, 0, 256, 256); g.fillStyle = TINTA;
    for (let i = 0; i < 12; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 6); g.fillRect(-5, -118, 10, i % 3 ? 16 : 30); g.restore(); } }) })));
  const mManecilla = new THREE.MeshBasicMaterial({ color: TINTA });
  const manecilla = (largo, ancho, z) => { const geo = new THREE.PlaneGeometry(ancho, largo); geo.translate(0, largo / 2 - ancho / 2, 0); const m = new THREE.Mesh(geo, mManecilla); m.position.z = z; reloj.add(m); return m; };
  const hHora = manecilla(.17, .05, .006), hMin = manecilla(.25, .035, .009);
  const centro = new THREE.Mesh(new THREE.CircleGeometry(.035, 16), new THREE.MeshBasicMaterial({ color: '#E23D3D' })); centro.position.z = .012; reloj.add(centro);

  // Casas vecinas, con ventanas que se encienden de noche
  const mVentana = new THREE.MeshBasicMaterial({ color: '#BFE6FF' });
  function casa(x, w, h, d, zf, color, cTecho, altoTecho, puertaX, ventanas, g = .035) {
    caja(w, h, d, color, x, h / 2, zf - d / 2, scene, g);
    techo(w + .5, d + .5, altoTecho, cTecho, x, h, zf - d / 2, g);
    if (puertaX != null) placa(.9, 1.85, P('#FFF1D2'), x + puertaX, SUELO + .925, zf + .006);
    ventanas.forEach(([vx, vy, vw = .95, vh = .95]) => placa(vw, vh, mVentana, x + vx, vy, zf + .006, scene, g * 1.4));
  }
  casa(3.45, 3.4, 3.1, 3.6, -.55, '#FF8FA3', '#3D7DD9', 1.5, .75, [[-.75, 1.75]]);
  casa(-4.05, 3.3, 3.35, 3.6, -.4, '#FFC83D', '#C73E70', 1.5, -.6, [[.75, 1.8]]);
  // fondo: otra hilera de casas y árboles redondos
  [['#B48CF2', '#E4572E', 4.4], ['#6ED3C2', '#C73E70', 5.4], ['#FF9F6E', '#3D7DD9', 4.6], ['#FFD86B', '#2FBF9B', 5.6], ['#8FD0FF', '#E4572E', 4.5], ['#F29BC4', '#5B4BC7', 5.2], ['#9BD44A', '#C73E70', 4.4]]
    .forEach(([col, ct, h], i) => casa(-13.2 + i * 4.4, 3.6, h, 3.4, -11, col, ct, 1.7, null, [[-.8, h - 1.1, .8, .9], [.8, h - 1.1, .8, .9], [-.8, h - 2.6, .8, .9], [.8, h - 2.6, .8, .9]], .06));
  function arbol(x, z, esc = 1, g = .04) { cil(.15 * esc, .19 * esc, 1.7 * esc, '#8A5A3B', x, SUELO + .85 * esc, z, scene, g, 12);
    bola(.95 * esc, '#3FBF6A', x, SUELO + 2.55 * esc, z, scene, g); bola(.62 * esc, '#3FBF6A', x + .62 * esc, SUELO + 2.05 * esc, z + .1, scene, g); bola(.55 * esc, '#3FBF6A', x - .6 * esc, SUELO + 2.15 * esc, z + .1, scene, g); }
  arbol(-2.85, .15);
  [[-9.5, -6.5, 1.5], [-5.2, -7.5, 1.25], [6.2, -6.5, 1.4], [10.5, -7.5, 1.6], [1.6, -8, 1.2]].forEach(([x, z, es]) => arbol(x, z, es, .06));

  // halo(color, tamaño): mancha de luz aditiva que siempre mira a la cámara (en vez de k.resplandor)
  const texHalo = lienzo(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const halo = (color, tam, x, y, z) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHalo, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false })); sp.scale.setScalar(tam); sp.position.set(x, y, z); scene.add(sp); return sp; };

  // Farol
  const FX = 2.5, FZ = .4, LX = FX - .72, LY = 3.12;
  cil(.13, .16, .3, '#3A4470', FX, SUELO + .15, FZ); cil(.05, .06, 3.3, '#3A4470', FX, SUELO + 1.65, FZ, scene, .03, 12);
  caja(.86, .08, .08, '#3A4470', FX - .36, SUELO + 3.3, FZ, scene, .03);
  cil(.08, .25, .22, '#3A4470', LX, LY + .17, FZ, scene, .03);
  const mBombillo = new THREE.MeshBasicMaterial({ color: '#D9DEEA' });
  bola(.14, mBombillo, LX, LY, FZ, scene, .03).castShadow = false;
  const haz = k.crearHaz({ color: '#FFE39A', r0: .16, r1: 1.35, largo: LY - SUELO, opacidad: 0 }); haz.position.set(LX, LY, FZ);
  const haloFarol = halo('#FFD98A', 1.5, LX, LY, FZ + .2);
  const luzFarol = new THREE.PointLight('#FFD79A', 0, 9); luzFarol.position.set(LX, 2.2, FZ + 1.0); scene.add(luzFarol);
  const luzPuerta = new THREE.PointLight('#FFE2A8', 0, 10); luzPuerta.position.set(PX, 1.9, 1.7); scene.add(luzPuerta);
  const luzVitrina = new THREE.PointLight('#FFE08A', 0, 8); luzVitrina.position.set(VX, VY, 1.3); scene.add(luzVitrina);
  const haloVitrina = halo('#FFE08A', 3.2, VX, VY, .3), haloPuerta = halo('#FFE9A8', 3.0, PX, SUELO + 1.2, .25);
  const luzAzul = new THREE.AmbientLight('#7C90FF', 0); scene.add(luzAzul);       // la noche es azul, no negra

  // Cielo: nubes de día; luna y estrellas de noche
  const mira = m => { m.rotation.y = Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z); };
  // cartel(ancho, pxAncho, pxAlto, pinta): un dibujo plano suelto (globos, nubes, luna) que gira en Y hacia la cámara
  function cartel(ancho, pw, ph, pinta, o = {}) {
    const geo = new THREE.PlaneGeometry(ancho, ancho * ph / pw); if (o.pie) geo.translate(0, ancho * ph / pw / 2, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: lienzo(pw, ph, pinta), alphaTest: .5, alphaToCoverage: true, fog: o.niebla !== false })); scene.add(m); return m;
  }
  const nube = (g, w, h) => { const b = [[.28, .62, .2], [.5, .45, .28], [.72, .6, .21], [.5, .7, .24]]; g.fillStyle = TINTA; b.forEach(([x, y, r]) => { g.beginPath(); g.arc(x * w, y * h, r * w + 9, 0, 7); g.fill(); }); g.fillStyle = '#FFFFFF'; b.forEach(([x, y, r]) => { g.beginPath(); g.arc(x * w, y * h, r * w, 0, 7); g.fill(); }); };
  const nubes = [[7.5, 12.5, -40, 9], [-9, 15, -44, 11], [-1.5, 10.2, -42, 6]].map(([x, y, z, a]) => { const n = cartel(a, 384, 256, nube, { niebla: false }); n.position.set(x, y, z); return n; });
  const luna = cartel(3.4, 256, 256, g => { g.fillStyle = TINTA; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill(); g.fillStyle = '#FFF3C4'; g.beginPath(); g.arc(128, 128, 108, 0, 7); g.fill();
    g.fillStyle = '#F2DC9A'; [[92, 96, 22], [158, 150, 30], [150, 78, 13]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); }, { niebla: false });
  let sem = 77; const rnd = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
  const pe = []; for (let i = 0; i < 140; i++) pe.push((rnd() - .5) * 90, 7 + rnd() * 30, -46 - rnd() * 10);
  const geoE = new THREE.BufferGeometry(); geoE.setAttribute('position', new THREE.Float32BufferAttribute(pe, 3));
  const estrellas = new THREE.Points(geoE, new THREE.PointsMaterial({ color: '#FFFFFF', size: 5, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); scene.add(estrellas);

  // ───────── dibujo({ color, alto, delantal }): personaje 2D dibujado en un canvas, puesto en un plano que mira a la cámara ─────────
  // Cabeza de frijol crema, ojos de punto, cuerpo de cápsula, brazos y piernas de trazo, contorno de tinta más grueso abajo.
  // d.pon(x, z, { y, cara: 'neutral'|'feliz'|'sorpresa'|'triste', parp, bi, bd (ángulo de cada brazo: 0 abajo, π arriba),
  //               ci, cd (codo), paso (fase al caminar), dir, ladeo, mira, cae }) lo redibuja y lo coloca. Sin estado entre cuadros.
  function dibujo(o = {}) {
    const { color = '#3D7DD9', alto = 1.6, delantal = false } = o;
    const LW = 448, LH = 640, ESC = 1.5, PIE = 24, ALT = 440, pxm = ALT / alto;       // medidas lógicas del dibujo
    const cv = document.createElement('canvas'); cv.width = LW * ESC; cv.height = LH * ESC; const g = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const geo = new THREE.PlaneGeometry(LW / pxm, LH / pxm); geo.translate(0, LH / pxm / 2 - PIE / pxm, 0);
    const material = new THREE.MeshBasicMaterial({ map: tex, alphaTest: .5, alphaToCoverage: true });
    const m = new THREE.Mesh(geo, material); scene.add(m);
    const sombra = new THREE.Mesh(new THREE.CircleGeometry(.3 * alto / 1.6, 28), new THREE.MeshBasicMaterial({ color: '#1B2A6B', transparent: true, opacity: .28, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.scale.set(1, .55, 1); scene.add(sombra);
    const cx = LW / 2, Y0 = LH - PIE, CAD = Y0 - 150;
    const forma = (traza, relleno, lw = 9) => { g.strokeStyle = TINTA; g.lineWidth = lw * 2; g.save(); g.translate(0, 4); traza(); g.stroke(); g.restore(); traza(); g.stroke(); traza(); g.fillStyle = relleno; g.fill(); };
    function pintar(p) {
      const { cara = 'neutral', parp = 0, bi = .14, bd = .14, ci = 0, cd = 0, paso = null, dir = -1, ladeo = 0, mira: mi = 0, cae = 0 } = p;
      g.setTransform(ESC, 0, 0, ESC, 0, 0); g.clearRect(0, 0, LW, LH); g.lineCap = 'round'; g.lineJoin = 'round';
      const baja = cae * 9, CT = Y0 - 320 + baja;                                    // parte alta del cuerpo
      // piernas (detrás del cuerpo)
      [-1, 1].forEach(sg => { let dx = 0, dy = 0; if (paso != null) { const f = paso + (sg > 0 ? Math.PI : 0); dx = Math.sin(f) * 30; dy = Math.max(0, Math.cos(f)) * 18; }
        const x0 = cx + sg * 24, x1 = x0 + dx, y1 = Y0 - 6 - dy;
        g.strokeStyle = TINTA; g.lineWidth = 11; g.beginPath(); g.moveTo(x0, CAD); g.lineTo(x1, y1); g.lineTo(x1 + (paso != null ? dir * 20 : sg * 17), y1); g.stroke(); });
      // cuerpo de cápsula
      forma(() => { g.beginPath(); g.roundRect(cx - 50, CT, 100, CAD + 12 - CT, 50); }, color);
      if (delantal) { g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 30, CT + 78); g.lineTo(cx - 20, CT + 22); g.moveTo(cx + 30, CT + 78); g.lineTo(cx + 20, CT + 22); g.stroke();
        g.fillStyle = CREMA; g.beginPath(); g.roundRect(cx - 36, CT + 76, 72, CAD - CT - 76, 12); g.fill(); g.stroke(); }
      // brazos de trazo con mano redonda
      [[-1, bi, ci], [1, bd, cd]].forEach(([sg, a, cod]) => { const hx = cx + sg * 47, hy = CT + 40, a2 = a + cod;
        const ex = hx + sg * Math.sin(a) * 62, ey = hy + Math.cos(a) * 62, mx = ex + sg * Math.sin(a2) * 58, my = ey + Math.cos(a2) * 58;
        g.strokeStyle = TINTA; g.lineWidth = 11; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.lineTo(mx, my); g.stroke();
        g.beginPath(); g.arc(mx, my, 11, 0, 7); g.fillStyle = CREMA; g.fill(); g.lineWidth = 6; g.stroke(); });
      // cabeza de frijol
      g.save(); g.translate(cx, CT + 16); g.rotate(ladeo);
      const A = 71.5, B = 67, hy = -B;
      forma(() => { g.beginPath(); g.moveTo(-A, hy - 4); g.bezierCurveTo(-A, hy - B * .74, -A * .62, hy - B, 0, hy - B); g.bezierCurveTo(A * .62, hy - B, A, hy - B * .74, A, hy - 4);
        g.bezierCurveTo(A, hy + B * .62, A * .5, hy + B, 0, hy + B); g.bezierCurveTo(-A * .5, hy + B, -A, hy + B * .62, -A, hy - 4); g.closePath(); }, CREMA);
      const ox = 27, oy = hy + 2 + (cara === 'triste' ? 5 : 0), dxm = mi * 7;
      g.fillStyle = TINTA; g.strokeStyle = TINTA; g.lineWidth = 7;
      [-1, 1].forEach(sg => { const x = sg * ox + dxm;
        if (cara === 'feliz') { g.beginPath(); g.arc(x, oy + 8, 12, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); }
        else if (parp) { g.beginPath(); g.moveTo(x - 9, oy); g.lineTo(x + 9, oy); g.stroke(); }
        else { g.beginPath(); g.arc(x, oy - (cara === 'sorpresa' ? 3 : 0), cara === 'sorpresa' ? 11.5 : 8.5, 0, 7); g.fill(); }
        if (cara === 'triste') { g.lineWidth = 6; g.beginPath(); g.moveTo(x + sg * 15, oy - 15); g.lineTo(x - sg * 9, oy - 25); g.stroke(); g.lineWidth = 7; } });
      if (cara === 'feliz') { g.beginPath(); g.moveTo(-25 + dxm, hy + 22); g.lineTo(25 + dxm, hy + 22); g.arc(dxm, hy + 22, 25, 0, Math.PI); g.closePath(); g.fill(); g.stroke(); }
      else if (cara === 'sorpresa') { g.beginPath(); g.ellipse(dxm, hy + 36, 9.5, 13, 0, 0, 7); g.fill(); }
      else if (cara === 'triste') { g.beginPath(); g.arc(0, hy + 52, 18, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
      else { g.beginPath(); g.arc(dxm, hy + 17, 16, Math.PI * .2, Math.PI * .8); g.stroke(); }
      g.restore(); tex.needsUpdate = true;
    }
    return { m, sombra, alto, material,
      ver(v) { m.visible = v; sombra.visible = v; },
      pon(x, z, p = {}) { const y = p.y || 0; m.position.set(x, SUELO + y, z); mira(m); sombra.position.set(x, SUELO + .012, z); const q = 1 - cl(y * 1.6, 0, .5); sombra.scale.set(q, q * .55, 1); pintar(p); } };
  }
  const parpadea = (T, i) => ((T + i * .71) % (1.25 + (i % 4) * .3)) < .09 ? 1 : 0;      // parpadeo cada 1,25–2,15 s

  const duena = dibujo({ color: '#C73E70', alto: 1.66, delantal: true });
  const COLORES = ['#E4572E', '#3D7DD9', '#FFC83D', '#8B6FE8', '#2FBF9B', '#9BD44A', '#FF8A3D'], ALTOS = [1.6, 1.48, 1.68, 1.54, 1.63, 1.45, 1.6];
  const clientes = COLORES.map((color, i) => dibujo({ color, alto: ALTOS[i] }));
  const XQ = i => -.54 + .44 * i, ZQ = i => .78 + .12 * i, XC = i => -.47 + .37 * i;     // la fila, y la fila apretada cuando se abre la puerta

  // globos dibujados (parte del mundo, con el mismo contorno)
  const globo = (ancho, txt, fondo = '#FFFFFF', pw = 256, ph = 220, cola = -1) => cartel(ancho, pw, ph, (g, w, h) => {
    const traza = () => { g.beginPath(); g.roundRect(14, 14, w - 28, h - 70, 44); }, pico = () => { g.beginPath(); const bx = cola < 0 ? w * .3 : w * .7; g.moveTo(bx - 22, h - 60); g.lineTo(bx + (cola < 0 ? -26 : 26), h - 10); g.lineTo(bx + 24, h - 60); g.closePath(); };
    g.lineJoin = 'round'; g.strokeStyle = TINTA; g.lineWidth = 20; g.fillStyle = fondo; pico(); g.stroke(); traza(); g.stroke(); traza(); g.fill(); pico(); g.fill();
    g.fillStyle = TINTA;
    if (txt === '…') [-1, 0, 1].forEach(j => { g.beginPath(); g.arc(w / 2 + j * 50, (h - 56) / 2 + 8, 15, 0, 7); g.fill(); });
    else { g.font = `900 ${txt.length > 2 ? 86 : 124}px Montserrat, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, (h - 56) / 2 + 12, w - 60); } }, { pie: true });
  const gPuntos = [0, 1, 2, 3].map(() => globo(.5, '…')), gDuda = globo(.5, '?');
  const gHola = globo(.95, '¡Hola!', '#D9FDD3', 420, 240, -1);
  const pop = (m, u, x, y, z) => { const v = cl(u); m.visible = v > 0; m.position.set(x, y, z); mira(m); m.scale.setScalar(Math.max(.001, eob(v))); };

  // El robot de la marca (3D, del kit) con su contorno
  const robot = k.crearRobot(), RS = .52; robot.scale.setScalar(RS);
  robot.traverse(o => { if (o.isMesh && o.material !== mTinta && (o === robot.userData.cab.children[0] || /Capsule|Sphere/.test(o.geometry.type))) entintar(o, .03 / RS); });

  // ───────── Tiempos, atados al guion ─────────
  const tLetrero = c('cierras', 1) + .08, tApaga = c('cierras', 1) + .45, tSeVa = c('cierras', 2) - .1;
  const tNoche = s('tocan') - .1, tHora = c('tocan', 0) + .12;
  const tFila0 = s('tocan') + .2, tFila1 = c('tocan', 2) - .12, tToc = c('tocan', 2) + .02;
  const tNadie = c('nadie', 0), tAsi = s('asi');
  const tLuz = c('con', 0) + .05, tAbre = c('con', 0) + .22, tRobot = c('con', 1) - .12, tFiesta = c('con', 1) + .2, tHola = c('con', 2), tLogo = c('con', 2) + .45;
  const GOLPES = [0, .22, .44].map(d => tToc + d);

  // ───────── Cámara: un vuelo continuo con un solo corte (al primer plano de «Nadie abre») ─────────
  // encuadre(objetivo, distancia, giro°, picado°) → [posición, mira]
  const encuadre = (tx, ty, tz, d, giro, picado) => { const a = giro * Math.PI / 180, b = picado * Math.PI / 180; return [[tx + d * Math.sin(a) * Math.cos(b), ty + d * Math.sin(b), tz + d * Math.cos(a) * Math.cos(b)], [tx, ty, tz]]; };
  const A0 = encuadre(-.62, .9, .4, 11.4, 9, 6), A1 = encuadre(-.62, .9, .4, 10.7, 9, 6);
  const B0 = encuadre(.5, .82, .6, 14.6, 13, 6), B1 = encuadre(.5, .82, .6, 13.9, 13, 6);
  const C0 = encuadre(-.42, 1.05, .9, 6.7, 4, 3), C1 = encuadre(-.4, 1.05, .9, 6.25, 4, 3);
  const D0 = encuadre(.5, .82, .6, 14.3, 15, 7), D1 = encuadre(.5, .82, .6, 13.5, 15, 7);
  const E0 = encuadre(.08, .85, .5, 12.2, 7, 6), E1 = encuadre(.08, .85, .5, 11.5, 7, 6);
  k.setKF([
    [0, ...A0], [s('tocan') - .15, ...A1],
    [s('tocan') + .95, ...B0], [s('nadie') + .02, ...B1],
    [s('nadie') + .03, ...C0], [e('nadie') - .05, ...C1],
    [s('asi') + 1.0, ...D0], [s('con') + .1, ...D1],
    [s('con') + 1.0, ...E0], [total + .5, ...E1],
  ]);

  // ───────── Sonidos ─────────
  k.sonar(tLetrero + .1, 'pop', .8); k.sonar(tApaga, 'tic', .6); k.sonar(tNoche + .4, 'tic', .7);
  GOLPES.forEach(t => k.sonar(t, 'golpe', .55));
  k.sonar(s('nadie') - .04, 'paso', .5); k.sonar(tNadie + .2, 'pop', .6); k.sonar(k.w('nadie', 1), 'pop', .6);
  k.sonar(tLuz, 'brillo', .7); k.sonar(tRobot + .1, 'logro', .9); k.sonar(tHola, 'pop', .7);

  const DIA = C('#58B2F6'), NOCHE = C('#121A46'), col = new THREE.Color(), col2 = new THREE.Color();
  const X = W / 2;
  return {
    actualizar(T) {
      // ── cielo: de día a noche ──
      const n = eio(pr(T, tNoche, .5));
      k.tono('cielo', 'noche', n);
      scene.background.copy(DIA).lerp(NOCHE, n); scene.fog.color.copy(scene.background);
      luzAzul.intensity = .3 + n * .6;
      nubes.forEach(nb => { nb.material.color.copy(col.set('#FFFFFF')).lerp(col2.set('#2C3A78'), n); });
      luna.visible = n > .02; luna.position.set(-12.5, lerp(4, 11.6, eo(n)), -44); estrellas.material.opacity = n;
      const farol = pr(T, tNoche + .4, .12);
      mBombillo.color.copy(col.set('#D9DEEA')).lerp(col2.set('#FFF1B8'), farol); haloFarol.material.opacity = farol * .8; haz.material.opacity = farol * .13; haz.visible = farol > 0; luzFarol.intensity = farol * 5;
      mVentana.color.copy(col.set('#BFE6FF')).lerp(col2.set('#FFD27A'), pr(T, tNoche + .3, .3));

      // ── la tienda: letrero, vitrina, reloj, puerta ──
      const vuelta = pr(T, tLetrero, .32); letrero.rotation.y = Math.PI * eob(vuelta);
      const luz = pr(T, tLuz, .18), abre = eo(pr(T, tAbre, .38));
      col.set('#FFF0B8').lerp(col2.set('#8C9AC4'), pr(T, tApaga, .12)).lerp(col2.set('#2B3768'), n).lerp(col2.set('#FFD257'), luz); mVidrio.color.copy(col);
      haloVitrina.material.opacity = luz * .3; luzVitrina.intensity = luz * 3;
      mInterior.color.copy(col.set('#2A3566')).lerp(col2.set('#FFCB45'), abre); haloPuerta.material.opacity = abre * .28; luzPuerta.intensity = abre * 5;
      const golpe = GOLPES.reduce((a, t) => Math.max(a, cl(1 - Math.abs(T - t - .03) / .08)), 0);
      puerta.rotation.y = -1.85 * abre + golpe * .035;
      const gira = eio(pr(T, tNoche - .05, .7));                                      // las manecillas corren de las 6 a las 9
      hHora.rotation.z = -Math.PI - gira * Math.PI / 2; hMin.rotation.z = -gira * Math.PI * 6;
      const pulso = 1 + .16 * ventana(T, c('cierras', 2), c('cierras', 2) + .3, .12) + .16 * ventana(T, tHora, tHora + .3, .12);
      reloj.scale.setScalar(pulso); aroReloj.scale.set(pulso, 1, pulso);

      // ── la dueña: voltea el letrero y se va ──
      const va = pr(T, tSeVa, 1.2), rec = 3.6 * va * va * (3 - 2 * va) * (.4 + .6 * va), dx = -.42 - rec;
      duena.ver(va < 1);
      if (va < 1) { const toca = ventana(T, tLetrero - .3, tLetrero + .4, .2), fase = rec * 7.4;
        duena.material.color.copy(col.set('#FFFFFF')).lerp(col2.set('#DDE2FF'), n);
        duena.pon(dx, .78, va > 0 ? { paso: fase, dir: -1, y: Math.abs(Math.sin(fase)) * .09, cara: 'feliz', bi: .2 + Math.sin(fase) * .55, bd: .2 - Math.sin(fase) * .55 }
          : { cara: T > tLetrero + .3 ? 'feliz' : 'neutral', parp: parpadea(T, 9), bi: lerp(.14, 2.3, eo(toca)), ci: .3 * toca, mira: -toca, y: Math.abs(Math.sin(T * 2.4)) * .012 }); }

      // ── los siete clientes ──
      clientes.forEach((d, i) => {
        const dur = tFila1 - tFila0 - .18, ui = pr(T, tFila0 + .03 * i, dur), av = 1 - (1 - ui) * (1 - ui), falta = 4.8 * (1 - av);
        const camina = ui > 0 && ui < 1, hop = pr(T, tAbre + .035 * i, .34), fi = pr(T, tFiesta + .07 * i, .22);
        d.ver(ui > 0); if (ui <= 0) return;
        const x = XQ(i) + falta + (XC(i) - XQ(i)) * eo(hop), z = ZQ(i);
        const p = { cara: 'neutral', mira: -1, parp: parpadea(T, i), ladeo: Math.sin(T * 1.3 + i * 2.1) * .02, y: 0 };
        if (camina) { const fase = falta * 7.6 + i * 1.3; p.paso = fase; p.dir = -1; p.y = Math.abs(Math.sin(fase)) * .065 * d.alto; p.bi = .2 + Math.sin(fase) * .5; p.bd = .2 - Math.sin(fase) * .5; }
        if (i === 0) { const sube = ventana(T, tToc - .28, GOLPES[2] + .35, .2); p.bi = lerp(p.bi ?? .14, 2.05, eo(sube)); p.ci = sube * (-.95 + golpe * .8); }
        // esperan → nadie abre → se enciende la luz → celebran
        if (T > tNadie + .07 * i) { const asombro = i % 2 === 1 && T < tAsi + .35 + .1 * i; p.cara = asombro ? 'sorpresa' : 'triste'; p.mira = 0; p.cae = asombro ? 0 : 1; p.ladeo = asombro ? 0 : (i % 4 < 2 ? .07 : -.07) + Math.sin(T * 1.1 + i) * .015; }
        if (T > tLuz + .04 * i) { p.cara = 'sorpresa'; p.mira = -1; p.cae = 0; p.ladeo = 0; p.bi = p.bd = .5; }
        if (hop > 0 && hop < 1) p.y += Math.sin(Math.PI * hop) * .17;
        if (fi > 0) { p.cara = 'feliz'; p.mira = 0; const sal = T - (tFiesta + .07 * i); p.bi = lerp(.5, 2.72 + Math.sin(T * 11 + i) * .22, eo(fi)); p.bd = lerp(.5, 2.72 - Math.sin(T * 11 + i * 1.7) * .22, eo(fi)); p.y += Math.abs(Math.sin(sal * 8.2)) * .17; p.ladeo = Math.sin(T * 8 + i) * .05; }
        d.material.color.copy(col.set('#FFFFFF')).lerp(col2.set('#DDE2FF'), n).lerp(col2.set('#FFF4DE'), luz * .75);
        d.pon(x, z, p);
      });

      // ── globos sobre las cabezas ──
      const hx = i => clientes[i].m.position.x, hy = i => SUELO + clientes[i].alto + .1;
      pop(gPuntos[0], ventana(T, tNadie + .2, tAsi + .15, .2), hx(0) + .14, hy(0), ZQ(0) + .02);
      pop(gDuda, ventana(T, k.w('nadie', 1), tAsi + .25, .2), hx(2) - .03, hy(2), ZQ(2) + .02);
      [1, 3, 5].forEach((i, j) => pop(gPuntos[j + 1], ventana(T, c('asi', 2) + .14 * j, tLuz + .05, .2), hx(i) + .06, hy(i), ZQ(i) + .02));

      // ── el robot sale a responder ──
      const ur = pr(T, tRobot, .42), base = V(PX - .05, lerp(1.0, 1.2, eo(ur)), lerp(.3, .55, eo(ur)));   // aparece de un salto en la entrada
      robot.visible = ur > 0; robot.scale.setScalar(RS * Math.max(.001, eob(ur)));
      const dice = ventana(T, tHola, tHola + 1.0, .1) * (.3 + .7 * Math.abs(Math.sin(T * 14)));
      robot.animar(T, base, cl(pr(T, tRobot + .2, .25)), { habla: dice });
      robot.rotation.y = Math.atan2(cam.position.x - base.x, cam.position.z - base.z) * .9;
      robot.userData.sombra.position.y = SUELO + .012;
      pop(gHola, pr(T, tHola, .25), PX + .8, 1.9, 1.15);

      // ── rótulos ──
      k.dato('hora', T < tHora ? '6:00 p. m.' : '9:00 p. m.', { clase: 'claro etq', escala: 1.5, ancla: V(RX - .1, RY - .62, .14) }, Math.min(ventana(T, .08, s('nadie') - .05, .15), 1 - .6 * ventana(T, tHora - .12, tHora + .04, .1)));
      k.dato('sin', 'Tu WhatsApp sin robot', { x: X, y: 292, giro: -3, clase: 'globo', escala: 1.12 }, ventana(T, c('asi', 1) - .05, e('asi') - .02, .16));
      k.dato('marca', `<img src="${MARCA.logo}" style="width:380px;display:block;margin:-8px auto 0"><div class="d-tit" style="text-align:center;color:#0E1620;margin-top:2px;font-size:41px;white-space:nowrap">Un robot <b style="color:${PRIM}">responde</b> por ti</div>`,
        { x: X, y: 388, w: 700, clase: 'claro' }, pr(T, tLogo, .3));
    },
  };
}
