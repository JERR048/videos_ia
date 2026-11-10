// Piezas para los formatos de redes (diálogo, presentador, mundo en miniatura, videojuego).
// Las carga escena.html y quedan en `k`, junto a las piezas del anuncio de producto. No se edita por anuncio.
// Todo sigue la regla del kit: lo que se ve es función del tiempo T, sin estado entre cuadros.
export function instalar(k, m) {
  const { THREE, scene, cam, W, H, TL, MARCA, cl, lerp, eo, eob, pr, ventana, mat, malla, RoundedBoxGeometry } = k;
  const { ui, PRIM, FRANJA, lienzo, renderer } = m;
  let sem = 1234567;
  const rnd = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
  const siembra = x => { sem = Math.max(1, Math.floor(x) % 2147483647); };

  // ───────── Quién habla y cuándo (sale de `habla` en cada escena del guion) ─────────
  const VOCES = {};
  for (const sc of TL.escenas) { const q = sc.habla || 'narra'; (VOCES[q] = VOCES[q] || { tramos: [], pal: [] }).tramos.push([sc.voz, sc.vozFin]); for (const ch of sc.chunks) for (const t of (ch.w || [ch.t0])) VOCES[q].pal.push(t); }
  // k.w('escena', n): el momento en que se dice la palabra n de esa escena (contando todos sus trozos)
  k.w = (id, n) => { const ws = k.SC[id].chunks.flatMap(ch => ch.w || [ch.t0]); return ws[Math.min(n, ws.length - 1)]; };
  k.quien = t => { for (const sc of TL.escenas) if (t >= sc.voz - .05 && t <= sc.vozFin + .05) return sc.habla || 'narra'; return null; };
  k.hablando = (t, q) => { const v = VOCES[q]; if (!v) return 0; let a = 0; for (const [a0, a1] of v.tramos) a = Math.max(a, ventana(t, a0 - .08, a1 + .12, .14)); return a; };
  k.boca = (t, q) => { const h = k.hablando(t, q); if (h <= 0) return 0; const v = VOCES[q]; let tw = v.pal[0]; for (const x of v.pal) { if (x <= t) tw = x; else break; }
    return h * cl(.22 + .78 * Math.abs(Math.sin((t - tw) * 14 + .5))); };

  // ───────── Personaje de pie, con cara: ojos, cejas, boca que se mueve con la voz, brazos ─────────
  k.crearPersonaje = (o = {}) => {
    const { camisa = PRIM, piel = '#E0A982', pelo = '#2A1B14', pantalon = '#1B2233', zapatos = '#F4F6FA' } = o;
    const p = new THREE.Group(); scene.add(p);
    const mPiel = mat(piel, { roughness: .65 }), mCam = mat(camisa, { roughness: .6 }), mPant = mat(pantalon, { roughness: .7 }), mZap = mat(zapatos, { roughness: .5 }), mPelo = mat(pelo, { roughness: .85 });
    [-.2, .2].forEach(x => { malla(new THREE.CapsuleGeometry(.14, .6, 6, 14), mPant, x, .55, 0, p); malla(new RoundedBoxGeometry(.3, .2, .46, 3, .08), mZap, x, .1, .06, p); });
    malla(new THREE.CapsuleGeometry(.42, .55, 8, 22), mCam, 0, 1.45, 0, p);
    malla(new THREE.CylinderGeometry(.13, .13, .22, 14), mPiel, 0, 2.2, 0, p);
    const brazos = [-1, 1].map(sg => { const h = new THREE.Group(); h.position.set(.5 * sg, 1.85, 0); p.add(h);
      malla(new THREE.CapsuleGeometry(.115, .55, 6, 12), mCam, 0, -.36, 0, h); malla(new THREE.SphereGeometry(.14, 18, 14), mPiel, 0, -.78, 0, h); return h; });
    const cab = new THREE.Group(); cab.position.set(0, 2.78, 0); p.add(cab);
    malla(new THREE.SphereGeometry(.56, 36, 28), mPiel, 0, 0, 0, cab).scale.set(1, .96, .95);
    const pm = malla(new THREE.SphereGeometry(.59, 36, 18, 0, Math.PI * 2, 0, Math.PI * .5), mPelo, 0, .03, -.04, cab); pm.rotation.x = -.28;
    [-1, 1].forEach(sg => malla(new THREE.SphereGeometry(.1, 14, 10), mPiel, .55 * sg, -.05, 0, cab));
    const negro = new THREE.MeshStandardMaterial({ color: '#15161C', roughness: .2 });
    const ojos = [-1, 1].map(sg => { const e = malla(new THREE.SphereGeometry(.078, 18, 14), negro, .2 * sg, .03, .5, cab); e.castShadow = false;
      const b = new THREE.Mesh(new THREE.SphereGeometry(.024, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' })); b.position.set(.026, .03, .062); e.add(b); return e; });
    const cejas = [-1, 1].map(sg => { const c = malla(new THREE.CapsuleGeometry(.024, .13, 4, 8), mPelo, .2 * sg, .2, .49, cab); c.rotation.z = Math.PI / 2; c.castShadow = false; return c; });
    malla(new THREE.SphereGeometry(.06, 12, 10), mPiel, 0, -.09, .55, cab).castShadow = false;
    const boca = malla(new THREE.SphereGeometry(.1, 20, 14), new THREE.MeshStandardMaterial({ color: '#4A1418', roughness: .6 }), 0, -.27, .465, cab); boca.castShadow = false;
    const sonrisa = new THREE.Mesh(new THREE.TorusGeometry(.13, .024, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: '#3A1216', roughness: .6 })); sonrisa.position.set(0, -.2, .49); cab.add(sonrisa);
    p.userData = { cab, ojos, cejas, boca, sonrisa, brazos };
    // gesto: { habla, feliz, sorpresa, preocupado, brazos (los dos arriba), senala (el derecho al frente), gira } — todo de 0 a 1, menos gira (radianes)
    p.animar = (t, base, g = {}) => {
      const { habla = 0, feliz = 0, sorpresa = 0, preocupado = 0, brazos: arriba = 0, senala = 0, gira = 0 } = g;
      p.position.copy(base); p.position.y += Math.abs(Math.sin(t * 2.1)) * .015 + arriba * Math.abs(Math.sin(t * 7)) * .12;
      p.rotation.y = gira + Math.sin(t * .9) * .03;
      cab.rotation.set(-sorpresa * .1 + habla * Math.sin(t * 6) * .03, Math.sin(t * .7) * .06, Math.sin(t * 1.3) * .035);
      const parp = (t % 3.1) < .11 ? .15 : 1;
      ojos.forEach(e => e.scale.set(1 + sorpresa * .35, (1 + sorpresa * .45) * parp * (1 - feliz * .3), 1));
      cejas.forEach((c, i) => { const sg = i ? 1 : -1; c.position.y = .2 + sorpresa * .1 + preocupado * .03; c.rotation.z = Math.PI / 2 - sg * preocupado * .42; });
      const ab = cl(habla), so = cl(sorpresa);
      boca.visible = ab > .05 || so > .3;
      boca.scale.set(lerp(1.25, .8, so), Math.max(.14, ab * .8 + so * .95), .3);
      sonrisa.visible = !boca.visible;
      const triste = preocupado > .5; sonrisa.rotation.z = triste ? 0 : Math.PI; sonrisa.position.y = triste ? -.33 : -.2; sonrisa.scale.setScalar(.8 + feliz * .35);
      brazos.forEach((h, i) => { const sg = i ? 1 : -1; h.rotation.set(0, 0, sg * lerp(.12 + Math.sin(t * 2.1 + i) * .05, 2.6, eo(cl(arriba)))); });
      brazos[0].rotation.x = -ab * .45 * (1 - arriba);
      if (senala > 0) { brazos[1].rotation.z = lerp(brazos[1].rotation.z, 1.3, cl(senala)); brazos[1].rotation.x = -cl(senala) * .55; }
    };
    return p;
  };

  // ───────── Tarima con aro de luz y pedestal para la mascota ─────────
  k.crearTarima = (o = {}) => {
    const { radio = 3.2, color = PRIM, alto = .16, base = '#10141F' } = o;
    const g = new THREE.Group(); scene.add(g);
    const d = malla(new THREE.CylinderGeometry(radio, radio * 1.04, alto, 72), mat(base, { roughness: .55, metalness: .2 }), 0, alto / 2, 0, g); d.castShadow = false;
    const aro = new THREE.Mesh(new THREE.TorusGeometry(radio * 1.02, .045, 10, 120), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.4, roughness: .4 })); aro.rotation.x = Math.PI / 2; aro.position.y = alto + .01; g.add(aro);
    g.userData = { aro, alto }; return g;
  };
  k.crearPedestal = (o = {}) => {
    const { radio = .85, alto = 1.1, color = PRIM, base = '#141926' } = o;
    const g = new THREE.Group(); scene.add(g);
    malla(new THREE.CylinderGeometry(radio, radio * 1.08, alto, 48), mat(base, { roughness: .5, metalness: .25 }), 0, alto / 2, 0, g);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(radio * 1.01, .035, 10, 80), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.4, roughness: .4 })); aro.rotation.x = Math.PI / 2; aro.position.y = alto; g.add(aro);
    g.userData = { aro, alto }; return g;
  };

  // ───────── Ciudad de noche: de fondo detrás de una tarima, o como mundo en miniatura para sobrevolar ─────────
  k.crearCiudad = (o = {}) => {
    const { n = 70, ancho = 60, fondo = 30, x = 0, z = -30, alto = [4, 16], semilla = 7, color = '#161C36', luces = ['#FFD98A', '#FFF1C4', '#9AD0FF'], claro = null, brillo = 1, encendidas = .45, celda = 5 } = o;
    siembra(semilla);
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const texs = [0, 1, 2].map(() => { const L = lienzo(96, 192); L.g.fillStyle = '#000'; L.g.fillRect(0, 0, 96, 192);
      for (let f = 0; f < 8; f++) for (let c = 0; c < 4; c++) if (rnd() < encendidas) { L.g.fillStyle = luces[Math.floor(rnd() * luces.length)]; L.g.globalAlpha = .55 + rnd() * .45; L.g.fillRect(8 + c * 22, 8 + f * 23, 12, 14); }
      L.g.globalAlpha = 1; L.tex.wrapS = L.tex.wrapT = THREE.RepeatWrapping; L.tex.needsUpdate = true; return L.tex; });
    const techo = mat(color, { roughness: .9 }), edificios = [];
    const cols = Math.floor(ancho / celda), filas = Math.floor(fondo / celda);
    const celdas = []; for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) celdas.push([i, j]);
    for (let i = celdas.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [celdas[i], celdas[j]] = [celdas[j], celdas[i]]; }
    for (const [ci, cj] of celdas.slice(0, n)) {
      const bx = (ci + .5) * celda - ancho / 2 + (rnd() - .5) * .6, bz = (cj + .5) * celda - fondo / 2 + (rnd() - .5) * .6;
      const w = celda * (.5 + rnd() * .28), d = celda * (.5 + rnd() * .28), h = alto[0] + rnd() * rnd() * (alto[1] - alto[0]) + rnd() * 1.5;
      if (claro && Math.hypot(bx + x - claro.x, bz + z - claro.z) < claro.r) continue;
      const tx = texs[Math.floor(rnd() * 3)].clone(); tx.needsUpdate = true; tx.repeat.set(Math.max(1, Math.round(w / 2.2)), Math.max(1, Math.round(h / 4.4)));
      const lado = new THREE.MeshStandardMaterial({ color, roughness: .9, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: brillo });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [lado, lado, techo, techo, lado, lado]); b.position.set(bx, h / 2, bz); b.castShadow = true; b.receiveShadow = true; g.add(b); edificios.push(b);
    }
    g.userData = { edificios }; return g;
  };

  // ───────── Multitud de figuras pequeñas (para metáforas: público, clientes, una fila) ─────────
  k.crearMultitud = (o = {}) => {
    const { n = 60, ancho = 10, fondo = 8, x = 0, z = 0, semilla = 3, colores = ['#3D7DD9', '#C73E70', '#E27A3F', '#4FB6E0', '#5BB04B', '#8B6FE8'], piel = '#E6B48F', escala = 1, orden = false } = o;
    siembra(semilla);
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const cuerpo = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.17, .34, 4, 10), mat('#ffffff', { roughness: .7 }), n);
    const cabeza = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 14, 10), mat(piel, { roughness: .7 }), n);
    cuerpo.castShadow = cabeza.castShadow = true; g.add(cuerpo, cabeza);
    const lado = Math.ceil(Math.sqrt(n * ancho / fondo)), pos = [], col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const px = orden ? ((i % lado) + .5) / lado * ancho - ancho / 2 : (rnd() - .5) * ancho, pz = orden ? (Math.floor(i / lado) + .5) / Math.ceil(n / lado) * fondo - fondo / 2 : (rnd() - .5) * fondo;
      pos.push({ x: px, z: pz, f: rnd() * 6.28, s: escala * (.9 + rnd() * .25) }); cuerpo.setColorAt(i, col.set(colores[Math.floor(rnd() * colores.length)]));
    }
    cuerpo.instanceColor.needsUpdate = true;
    const M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();
    // cada(fn): fn(i, base) puede devolver { x, y, z, s } para mover a cada figura en este cuadro
    g.cada = (fn = () => null) => { pos.forEach((b, i) => { const r = fn(i, b) || {}; const s = r.s ?? b.s, px = r.x ?? b.x, py = r.y ?? 0, pz = r.z ?? b.z;
      S.setScalar(Math.max(s, .0001)); P.set(px, py + .34 * s, pz); M.compose(P, Q, S); cuerpo.setMatrixAt(i, M); P.set(px, py + .86 * s, pz); M.compose(P, Q, S); cabeza.setMatrixAt(i, M); });
      cuerpo.instanceMatrix.needsUpdate = true; cabeza.instanceMatrix.needsUpdate = true; };
    g.pintar = (i, hex) => { cuerpo.setColorAt(i, col.set(hex)); cuerpo.instanceColor.needsUpdate = true; };
    g.userData = { pos, n }; g.cada(); return g;
  };

  // ───────── Haz de luz (un foco que señala algo) ─────────
  k.crearHaz = (o = {}) => {
    const { color = '#FFF2C2', r0 = .25, r1 = 2.2, largo = 12, opacidad = .28 } = o;
    const geo = new THREE.CylinderGeometry(r0, r1, largo, 40, 1, true); geo.translate(0, -largo / 2, 0);
    const h = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacidad, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(h); return h;
  };

  // ───────── Tarjetas de dato sobre el video: contadores, listas que se arman, barras, globos de pregunta, botones ─────────
  const datos = {}; let usados = new Set();
  const P3 = new THREE.Vector3();
  // k.dato(id, html, { x, y, w, giro, clase, ancla (Vector3), dx, dy, escala }, alfa)
  //   clase: '' (tarjeta oscura con borde de la marca) · 'claro' · 'globo' (rótulo inclinado) · 'titular' (texto gigante sin caja) · 'pix' (videojuego)
  k.dato = (id, html, o = {}, a = 1) => {
    let d = datos[id]; if (!d) { d = datos[id] = { el: document.createElement('div'), html: null, cls: null }; ui.appendChild(d.el); }
    const cls = 'dato ' + (o.clase || ''); if (d.cls !== cls) { d.el.className = cls; d.cls = cls; }
    if (d.html !== html) { d.el.innerHTML = html; d.html = html; }
    usados.add(id);
    let x = o.x ?? W / 2, y = o.y ?? H * .3, ok = true;
    if (o.ancla) { P3.copy(o.ancla).project(cam); x = (P3.x + 1) / 2 * W + (o.dx || 0); y = (1 - P3.y) / 2 * H + (o.dy || 0); ok = P3.z < 1; }
    const al = ok ? cl(a) : 0, u = o.clase === 'pix' ? (al > 0 ? 1 : 0) : eob(al);
    d.el.style.width = o.w ? o.w + 'px' : ''; d.el.style.opacity = al;
    d.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) rotate(${o.giro || 0}deg) scale(${((.72 + .28 * u) * (o.escala || 1)).toFixed(3)})`;
  };
  k.num = (n, dec = 0) => Number(n).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  k.sube = (t, t0, dur, a, b) => lerp(a, b, eo(pr(t, t0, dur)));
  const ICO = { ok: '✓', no: '✕', pt: '•' };
  k.fila = (texto, tipo = 'ok', u = 1) => { const v = cl(u); return v <= 0 ? '' : `<div class="d-fila ${tipo}" style="opacity:${v.toFixed(2)};transform:translateX(${((1 - eo(v)) * -36).toFixed(1)}px)"><i>${ICO[tipo] || tipo}</i><span>${texto}</span></div>`; };
  k.barra = (u, color) => `<div class="d-barra"><i style="width:${(cl(u) * 100).toFixed(1)}%${color ? ';background:' + color : ''}"></i></div>`;
  k.boton = (texto, clase = '', u = 1) => `<div class="d-btn ${clase}" style="opacity:${cl(u).toFixed(2)};transform:scale(${(.85 + .15 * eob(cl(u))).toFixed(3)})">${texto}</div>`;

  // Cursor que entra y hace clic (para el cierre con botones)
  let cur = null;
  k.cursor = (x, y, a = 1, clic = 0) => {
    if (!cur) { cur = document.createElement('div'); cur.className = 'cursor'; cur.innerHTML = '<svg viewBox="0 0 24 24" width="84" height="84"><path d="M5 2l14 11h-7l4 8-3 1.5-4-8-4 4z" fill="#fff" stroke="#0A0C12" stroke-width="1.6" stroke-linejoin="round"/></svg>'; ui.appendChild(cur); }
    cur.dataset.usado = '1'; cur.style.opacity = cl(a); cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(1 - .22 * cl(clic)).toFixed(3)})`;
  };

  // ───────── Confeti (celebración) ─────────
  const fx = document.createElement('canvas'); fx.width = W; fx.height = H; fx.id = 'fx'; ui.insertBefore(fx, ui.firstChild); const fg = fx.getContext('2d');
  siembra(99); const PAPEL = Array.from({ length: 110 }, (_, i) => ({ x: rnd(), vx: (rnd() - .5) * .7, vy: -(.55 + rnd() * .95), rot: rnd() * 6, vr: (rnd() - .5) * 12, c: FRANJA[i % FRANJA.length], s: 12 + rnd() * 16, d: rnd() * .3 }));
  k.confeti = (t, t0, o = {}) => {
    const { dur = 2.4, x = .5, y = .42, ancho = .5 } = o;
    for (const p of PAPEL) { const tt = t - t0 - p.d; if (tt < 0 || tt > dur) continue;
      const px = (x + (p.x - .5) * ancho + p.vx * tt * .45) * W, py = y * H + (p.vy * tt + .95 * tt * tt) * H * .42;
      fg.save(); fg.translate(px, py); fg.rotate(p.rot + p.vr * tt); fg.globalAlpha = cl((dur - tt) / .5); fg.fillStyle = p.c; fg.fillRect(-p.s / 2, -p.s * .3, p.s, p.s * .6); fg.restore(); }
  };

  // ───────── Planos con nombre: cortes entre primeros planos, con un empuje lento para que ningún plano quede quieto ─────────
  // k.planos({ general: [[x,y,z],[mx,my,mz]], ... }, [[t, 'general'], [t2, 'ana'], [t3, 'dato', 0.8]], { deriva })
  //   Cada entrada corta a ese plano en t. Con un tercer valor (segundos) llega moviéndose en vez de cortar.
  k.planos = (defs, lista, o = {}) => {
    const deriva = o.deriva ?? .05, fin = TL.total + .5, kf = [];
    lista.forEach(([t, nombre, mov], i) => {
      if (!defs[nombre]) throw new Error('planos: no existe el plano «' + nombre + '»');
      const [p, q] = defs[nombre], t1 = i + 1 < lista.length ? lista[i + 1][0] : fin, sigMov = i + 1 < lista.length && lista[i + 1][2];
      kf.push([mov ? t + mov : t, p, q]); kf.push([sigMov ? t1 : t1 - .001, p.map((v, j) => v + (q[j] - v) * deriva), q]);
    });
    k.setKF(kf); k.CORTES = lista.filter((x, i) => i > 0 && !x[2]).map(x => x[0]);
    if (o.sonido !== false) for (const t of k.CORTES) k.sonar(t - .06, 'paso', .5);
  };

  // ───────── Sonido: cada anuncio anota sus efectos; sonido.py los sintetiza y los mezcla bajo la voz ─────────
  const SONIDOS = []; window.__SONIDOS = SONIDOS;
  k.sonar = (t, tipo = 'pop', vol = 1) => { SONIDOS.push({ t: Math.round(Math.max(0, t) * 1000) / 1000, tipo, vol }); };

  // ───────── Modo videojuego: el 3D se renderiza con píxeles gordos ─────────
  k.pixelar = (n = 6) => { renderer.setPixelRatio(1 / n); renderer.setSize(W, H); renderer.domElement.style.imageRendering = 'pixelated'; m.pixel = n; };

  let resplandor = 0;
  k.resplandor = (f = .5) => { resplandor = f; };
  return {
    antes() { usados = new Set(); resplandor = 0; fg.clearRect(0, 0, W, H); if (cur) cur.dataset.usado = ''; },
    despues() { for (const [id, d] of Object.entries(datos)) if (!usados.has(id)) d.el.style.opacity = 0; if (cur && !cur.dataset.usado) cur.style.opacity = 0; return resplandor; },
  };
}
