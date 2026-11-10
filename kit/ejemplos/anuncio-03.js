export default function (k) {
  const { THREE, scene, s, e, c, cl, lerp, eio, eo, eob, pr, ventana, V, mat, malla, RoundedBoxGeometry, mostrar, redondo: R } = k;
  const total = k.TL.total;
  k.letraPequena('Requiere un número de WhatsApp con conexión oficial y el catálogo activado por tu distribuidor.');

  const CAFE = '#5A3A22', NAVY = '#2F3566';
  const P = v => { const p = v.clone().project(k.cam); return [(p.x + 1) / 2 * 1920, (1 - p.y) / 2 * 1080]; };
  let ahora = 0;

  function bolsa(cuerpo, oscuro, etiqueta) {
    const g = new THREE.Group(); scene.add(g);
    malla(new RoundedBoxGeometry(.7, .92, .34, 4, .1), mat(cuerpo, { roughness: .7 }), 0, -.03, 0, g);
    malla(new RoundedBoxGeometry(.74, .16, .16, 3, .05), mat(oscuro, { roughness: .6 }), 0, .47, 0, g);
    malla(new RoundedBoxGeometry(.48, .4, .04, 3, .07), mat(etiqueta, { roughness: .5 }), 0, -.02, .17, g);
    const gr = malla(new THREE.SphereGeometry(.085, 20, 14), mat('#6B4226', { roughness: .45 }), 0, -.02, .2, g); gr.scale.set(1, 1.4, .5); gr.rotation.z = .4;
    return g;
  }
  function taza(color) {
    const g = new THREE.Group(); scene.add(g); const m = mat(color, { roughness: .35 });
    malla(new THREE.CylinderGeometry(.3, .26, .56, 40), m, 0, 0, 0, g);
    const borde = malla(new THREE.TorusGeometry(.285, .028, 10, 40), m, 0, .28, 0, g); borde.rotation.x = Math.PI / 2;
    malla(new THREE.CylinderGeometry(.262, .262, .012, 40), mat(CAFE, { roughness: .25 }), 0, .286, 0, g);
    const asa = malla(new THREE.TorusGeometry(.16, .05, 14, 28, Math.PI), m, .27, 0, 0, g); asa.rotation.z = -Math.PI / 2;
    return g;
  }
  function prensa() {
    const g = new THREE.Group(); scene.add(g);
    const acero = mat('#C3CBD6', { metalness: .6, roughness: .28 }), azul = mat(NAVY, { roughness: .35 });
    const v = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .82, 40, 1, true), new THREE.MeshStandardMaterial({ color: '#E6F5FB', transparent: true, opacity: .32, roughness: .05, depthWrite: false, side: THREE.DoubleSide }));
    v.position.y = -.02; g.add(v);
    malla(new THREE.CylinderGeometry(.25, .25, .46, 40), mat(CAFE, { roughness: .4 }), 0, -.2, 0, g);
    malla(new THREE.CylinderGeometry(.25, .25, .03, 40), mat('#C9A27A', { roughness: .8 }), 0, .045, 0, g);
    malla(new THREE.CylinderGeometry(.3, .3, .07, 40), acero, 0, -.44, 0, g);
    malla(new THREE.CylinderGeometry(.29, .29, .06, 40), acero, 0, .4, 0, g);
    malla(new THREE.CylinderGeometry(.22, .28, .07, 40), acero, 0, .46, 0, g);
    malla(new THREE.CylinderGeometry(.018, .018, .22, 10), acero, 0, .58, 0, g);
    malla(new THREE.SphereGeometry(.065, 20, 14), azul, 0, .7, 0, g);
    malla(new RoundedBoxGeometry(.09, .56, .1, 3, .04), azul, .43, 0, 0, g);
    [.24, -.24].forEach(y => malla(new RoundedBoxGeometry(.18, .06, .07, 2, .02), acero, .34, y, 0, g));
    return g;
  }
  function carro() {
    const g = new THREE.Group(); scene.add(g);
    const verde = mat('#5BB04B', { roughness: .45 }), claro = mat('#F5F7FB', { roughness: .4 }), azul = mat(NAVY, { roughness: .35 });
    const W = 1.5, D = .9, H = .45, t = .07, yb = .62;
    malla(new RoundedBoxGeometry(W, t, D, 2, .03), verde, 0, yb, 0, g);
    [D / 2, -D / 2].forEach(z => malla(new RoundedBoxGeometry(W, H, t, 2, .03), verde, 0, yb + H / 2, z, g));
    [W / 2, -W / 2].forEach(x => malla(new RoundedBoxGeometry(t, H, D, 2, .03), verde, x, yb + H / 2, 0, g));
    [D / 2, -D / 2].forEach(z => malla(new RoundedBoxGeometry(W + .1, .08, .1, 2, .035), claro, 0, yb + H, z, g));
    [W / 2, -W / 2].forEach(x => malla(new RoundedBoxGeometry(.1, .08, D + .1, 2, .035), claro, x, yb + H, 0, g));
    [.15, .3].forEach(h => malla(new RoundedBoxGeometry(W - .22, .045, .02, 2, .01), claro, 0, yb + h, D / 2 + .045, g));
    [-1, 1].forEach(sz => { const p = malla(new THREE.CylinderGeometry(.035, .035, .62, 10), azul, W / 2 + .2, yb + H + .2, sz * (D / 2 - .05), g); p.rotation.z = -.65; });
    const barra = malla(new THREE.CapsuleGeometry(.06, D - .05, 6, 12), azul, W / 2 + .39, yb + H + .45, 0, g); barra.rotation.x = Math.PI / 2;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const x = sx * (W / 2 - .14), z = sz * (D / 2 - .1);
      malla(new THREE.CylinderGeometry(.03, .03, yb - .14, 10), azul, x, (yb + .14) / 2, z, g);
      const r = malla(new THREE.CylinderGeometry(.13, .13, .08, 24), azul, x, .13, z, g); r.rotation.x = Math.PI / 2;
      const c2 = malla(new THREE.CylinderGeometry(.05, .05, .1, 16), claro, x, .13, z, g); c2.rotation.x = Math.PI / 2;
    });
    [-1, 1].forEach(sz => malla(new RoundedBoxGeometry(W - .2, .05, .05, 2, .02), claro, 0, .32, sz * (D / 2 - .1), g));
    g.userData = { yb, H };
    return g;
  }

  const sombraC = (g, cx, cy, rx) => { g.fillStyle = 'rgba(70,45,25,.14)'; g.beginPath(); g.ellipse(cx, cy, rx, rx * .16, 0, 0, 7); g.fill(); };
  const grano = (g, x, y, r, rot) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = '#6B4226'; g.beginPath(); g.ellipse(0, 0, r * .72, r, 0, 0, 7); g.fill();
    g.strokeStyle = '#3E2614'; g.lineWidth = r * .22; g.beginPath(); g.moveTo(0, -r * .7); g.quadraticCurveTo(r * .32, 0, 0, r * .7); g.stroke(); g.restore(); };
  const dibBolsa = (cuerpo, oscuro, etiqueta, extra) => (g, x, y, w, h) => {
    const cx = x + w / 2, bw = h * .56, bh = h * .74, top = y + h * .12;
    sombraC(g, cx, top + bh + 1, bw * .75);
    g.fillStyle = cuerpo; R(g, cx - bw / 2, top + bh * .1, bw, bh * .9, bw * .14); g.fill();
    g.fillStyle = oscuro; R(g, cx - bw / 2 - 2, top, bw + 4, bh * .17, 4); g.fill();
    g.fillStyle = etiqueta; R(g, cx - bw * .34, top + bh * .36, bw * .68, bh * .4, 6); g.fill();
    grano(g, cx, top + bh * .56, bh * .1, .4);
    extra(g, x, y, w, h, cx, top + bh);
  };
  const DIB = [
    dibBolsa('#C99A66', '#A87A4A', '#5BB04B', (g, x, y, w, h, cx, base) => { grano(g, cx - 56, base - 6, 7, .8); grano(g, cx - 72, base - 2, 6, -.4); grano(g, cx + 58, base - 4, 7, -.5); }),
    dibBolsa('#6B4630', '#4E321F', '#E27A3F', (g, x, y, w, h, cx, base) => { g.fillStyle = CAFE; g.beginPath(); g.ellipse(cx + 60, base, 26, 16, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#7A5236'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(cx + 42 + (i * 7) % 36, base - 4 - (i * 5) % 9, 1.6, 0, 7); g.fill(); } }),
    (g, x, y, w, h) => {
      const cx = x + w / 2 - 6, mw = h * .56, mh = h * .5, top = y + h * .36;
      sombraC(g, cx + 6, top + mh + 1, mw * .8);
      g.strokeStyle = '#C9632F'; g.lineWidth = h * .075; g.beginPath(); g.arc(cx + mw / 2 - 2, top + mh * .45, mh * .27, -Math.PI / 2, Math.PI / 2); g.stroke();
      g.fillStyle = '#E27A3F'; R(g, cx - mw / 2, top, mw, mh, [4, 4, mw * .24, mw * .24]); g.fill();
      g.fillStyle = '#C9632F'; g.beginPath(); g.ellipse(cx, top, mw / 2, mh * .13, 0, 0, 7); g.fill();
      g.fillStyle = CAFE; g.beginPath(); g.ellipse(cx, top + 1, mw / 2 - 4, mh * .08, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(150,95,60,.45)'; g.lineWidth = 3.5; g.lineCap = 'round';
      for (let i = -1; i <= 1; i++) { const sx = cx + i * 11; g.beginPath(); g.moveTo(sx, top - 9); g.bezierCurveTo(sx - 7, top - 17, sx + 7, top - 24, sx, top - 33); g.stroke(); }
      g.lineCap = 'butt';
    },
    (g, x, y, w, h) => {
      const cx = x + w / 2 - 6, pw = h * .42, ph = h * .6, top = y + h * .24;
      sombraC(g, cx + 6, top + ph + 3, pw * .95);
      g.fillStyle = '#8A96A6'; g.fillRect(cx - 2, top - 12, 4, 12); g.beginPath(); g.arc(cx, top - 14, 6, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.75)'; R(g, cx - pw / 2, top + 6, pw, ph - 6, 4); g.fill();
      g.fillStyle = CAFE; R(g, cx - pw / 2 + 3, top + ph * .42, pw - 6, ph * .54, 3); g.fill();
      g.fillStyle = '#C9A27A'; g.fillRect(cx - pw / 2 + 3, top + ph * .42, pw - 6, 4);
      g.fillStyle = '#AEB8C5'; R(g, cx - pw / 2 - 3, top - 1, pw + 6, 9, 3); g.fill();
      g.fillRect(cx - pw / 2 - 2, top + 6, 4, ph - 6); g.fillRect(cx + pw / 2 - 2, top + 6, 4, ph - 6);
      R(g, cx - pw / 2 - 4, top + ph - 4, pw + 8, 8, 3); g.fill();
      g.strokeStyle = NAVY; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(cx + pw / 2 + 2, top + 14); g.lineTo(cx + pw / 2 + 15, top + 14); g.lineTo(cx + pw / 2 + 15, top + ph - 14); g.lineTo(cx + pw / 2 + 2, top + ph - 14); g.stroke();
    },
  ];
  const PROD = [
    { nombre: 'Café de origen', precio: '$ 32.000', fondo: '#F3E7D6' },
    { nombre: 'Café molido', precio: '$ 18.000', fondo: '#EDE2D6' },
    { nombre: 'Taza de cerámica', precio: '$ 25.000', fondo: '#FCE6D8' },
    { nombre: 'Prensa francesa', precio: '$ 79.000', fondo: '#E3EFF5' },
  ];

  const tA = c('carrito', 1) - .08, tB = [c('carrito', 1) + .32, c('carrito', 1) + .58];
  const SEL = [[tA], null, tB, null];
  const tCartaIn = c('catalogo', 3) - .45, tCartaOut = e('catalogo') - .45;
  function marca(i, g, x, y, w) {
    const anillo = i === 0 ? ventana(ahora, tCartaIn, tCartaOut + .3, .25) : 0;
    const taps = SEL[i], fin = 1 - pr(ahora, e('carrito') - .5, .4);
    const n = taps ? taps.filter(t => ahora >= t).length : 0;
    if (anillo > 0 && !n) { g.save(); g.globalAlpha *= anillo; g.strokeStyle = '#5BB04B'; g.lineWidth = 9; R(g, x, y, w, 158, 14); g.stroke(); g.restore(); }
    if (!n || fin <= 0) return;
    g.save(); g.globalAlpha *= fin;
    g.strokeStyle = '#1DAA61'; g.lineWidth = 9; R(g, x, y, w, 158, 14); g.stroke();
    taps.forEach(t => { const u = pr(ahora, t, .5); if (u > 0 && u < 1) { g.fillStyle = `rgba(29,170,97,${.4 * (1 - u)})`; g.beginPath(); g.arc(x + w / 2, y + 58, 16 + u * 80, 0, 7); g.fill(); } });
    const b = eob(pr(ahora, taps[0], .35)), bx = x + w - 26, by = y + 26;
    g.fillStyle = '#1DAA61'; g.beginPath(); g.arc(bx, by, 19 * b, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = '800 24px Inter'; g.textAlign = 'center'; g.fillText(String(n), bx, by + 8.5); g.textAlign = 'left';
    g.restore();
  }

  const chat = k.crearChat();
  Object.assign(chat.conf, { nombre: 'Café La Montaña', estado: 'en línea', hora: '10:24', inicial: 'C', avatar: '#7A4A2E' });
  chat.conf.dibujarAvatar = (g, x, y, r) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - r * .64, y + r * .36); g.lineTo(x - r * .16, y - r * .44); g.lineTo(x + r * .08, y - r * .06);
    g.lineTo(x + r * .28, y - r * .3); g.lineTo(x + r * .66, y + r * .36); g.closePath(); g.fill(); };
  const items = PROD.map((p, i) => ({ nombre: p.nombre, precio: p.precio, fondo: p.fondo, dibujo: (g, x, y, w, h) => { DIB[i](g, x, y, w, h); marca(i, g, x, y, w); } }));
  chat.conf.mensajes = [
    { t: -1, tipo: 'sistema', texto: 'HOY', lado: 'in', sinEscribir: true },
    { t: c('gancho', 3) + .15, lado: 'out', texto: 'Hola, ¿qué tienen?' },
    { t: c('catalogo', 1) + .05, lado: 'in', tipo: 'catalogo', titulo: 'Catálogo', sub: 'Café La Montaña · 4 productos', boton: 'Ver catálogo', items, texto: Array(12).fill('MMMMMMMMMM').join(' ') },
    { t: c('carrito', 3) + .12, lado: 'out', tipo: 'carrito', texto: '3 artículos', total: '$ 82.000' },
  ];
  const ALTO = [60, 104, 544, 190], CW = 720 / 1.3, LIBRE = 1543 / 1.3 - 92 - 168 - 20;
  function yCatalogo(t) {
    const ms = chat.conf.mensajes; let tot = 0; const alto = ms.map((m, i) => { const h = t >= m.t ? (ALTO[i] + 16) * eo(pr(t, m.t, .3)) : 0; tot += h; return h; });
    if (ms.find(m => m.lado === 'in' && t >= m.t - .9 && t < m.t && !m.sinEscribir)) tot += 90;
    return 168 - Math.max(0, tot - LIBRE) + alto[0] + alto[1] + (1 - eo(pr(t, ms[2].t, .3))) * 30;
  }

  chat.dibujar(chat.conf.mensajes[2].t + 1);
  const muestra = chat.g.getImageData(Math.round(510 * 1.3), Math.round(664 * 1.3), 1, 1).data, KIT_OK = muestra[0] > 250 && muestra[1] > 250 && muestra[2] > 250;
  if (KIT_OK) ALTO[2] = 560;
  function catalogoBien(t) {
    const m = chat.conf.mensajes[2]; if (KIT_OK || t < m.t) return;
    const g = chat.g, x = 22, y = yCatalogo(t), w = 500, h = ALTO[2];
    g.save(); g.setTransform(1.3, 0, 0, 1.3, 0, 0); g.globalAlpha = eo(pr(t, m.t, .3));
    g.fillStyle = '#FFFFFF'; g.shadowColor = 'rgba(0,0,0,.12)'; g.shadowBlur = 4; g.shadowOffsetY = 2; R(g, x, y, w, h, 22); g.fill(); g.shadowColor = 'transparent';
    g.font = '800 30px Inter'; g.fillStyle = '#111B21'; g.fillText(m.titulo, x + 22, y + 50); g.font = '500 24px Inter'; g.fillStyle = '#667781'; g.fillText(m.sub, x + 22, y + 86);
    m.items.forEach((it, i) => { const cx = x + 18 + (i % 2) * 236, cy = y + 112 + Math.floor(i / 2) * 170; g.fillStyle = it.fondo; R(g, cx, cy, 224, 158, 14); g.fill();
      g.save(); R(g, cx, cy, 224, 158, 14); g.clip(); it.dibujo(g, cx, cy, 224, 112); g.restore();
      g.font = '700 21px Inter'; g.fillStyle = '#111B21'; g.fillText(it.nombre, cx + 12, cy + 134); g.font = '600 19px Inter'; g.fillStyle = '#1F8A4C'; g.fillText(it.precio, cx + 12, cy + 152); });
    g.strokeStyle = '#E9EDEF'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + h - 74); g.lineTo(x + w, y + h - 74); g.stroke();
    g.font = '700 28px Inter'; g.fillStyle = '#027EB5'; g.textAlign = 'center'; g.fillText(m.boton, x + w / 2, y + h - 28); g.textAlign = 'left';
    g.restore(); chat.tex.needsUpdate = true;
  }

  const vitrina = new THREE.Group(); scene.add(vitrina); vitrina.position.set(0, 2.75, 0);
  const tel = k.crearTelefono(chat); vitrina.add(tel); tel.scale.setScalar(.58);
  const enChat = (lx, ly) => { tel.updateWorldMatrix(true, false); return tel.localToWorld(V((lx * 1.3 / 720 - .5) * 3.24, (.5 - ly * 1.3 / 1543) * 6.94, .2)); };
  const enTile = (i, t, dx = 0, dy = 0) => enChat(40 + (i % 2) * 236 + 112 + dx, yCatalogo(t) + 112 + Math.floor(i / 2) * 170 + 79 + dy);

  const toldo = new THREE.Group(); toldo.position.set(0, 2.1, 0); vitrina.add(toldo);
  {
    const NT = 8, WT = 2.64, sw = WT / NT, dy = .62, dz = .78, Lt = Math.hypot(dy, dz), ang = Math.atan2(dy, dz), top = .95;
    const mv = mat('#5BB04B', { roughness: .55 }), mb = mat('#FBFCFA', { roughness: .55 });
    malla(new RoundedBoxGeometry(WT - .1, top + .04, .1, 3, .04), mat('#FFF7EC', { roughness: .6 }), 0, top / 2 - .02, -.07, toldo);
    for (let i = 0; i < NT; i++) {
      const x = -WT / 2 + sw * (i + .5), m = i % 2 ? mb : mv;
      const st = malla(new THREE.BoxGeometry(sw + .002, .045, Lt), m, x, top - dy / 2, dz / 2, toldo); st.rotation.x = ang;
      malla(new THREE.BoxGeometry(sw + .002, .12, .045), m, x, top - dy - .06, dz, toldo);
      const sc = malla(new THREE.CylinderGeometry(sw / 2, sw / 2, .045, 24, 1, false, -Math.PI / 2, Math.PI), m, x, top - dy - .12, dz, toldo); sc.rotation.x = Math.PI / 2;
    }
    malla(new RoundedBoxGeometry(WT + .16, .13, .16, 3, .05), mat(NAVY, { roughness: .4 }), 0, top, 0, toldo);
    [-1, 1].forEach(sg => { const b = malla(new THREE.CylinderGeometry(.025, .025, Math.hypot(.3, dz), 8), mat(NAVY), sg * (WT / 2 + .02), top - dy - .15, dz / 2, toldo); b.rotation.x = Math.atan2(dz, .3); });
  }

  const wa = k.crearCanal('whatsapp', .55);

  const gancho = [bolsa('#C99A66', '#A87A4A', '#5BB04B'), taza('#E27A3F'), prensa(), bolsa('#6B4630', '#4E321F', '#E27A3F')];
  const G_FIN = [V(-2.55, 3.55, .7), V(2.5, 3.85, .7), V(-2.45, 1.45, 1.0), V(2.55, 1.5, 1.0)];
  const G_INI = [V(-10.5, 3.2, 1.5), V(10.5, 3.4, 1.5), V(-10, 1.2, 3), V(10, 1.3, 3)];
  const G_T = [c('gancho', 1) - .35, c('gancho', 1) - .15, c('gancho', 1) + .05, c('gancho', 1) + .25];
  const L_FIN = [V(2.95, 2.75, .9), V(2.35, 4.35, .5), V(2.45, 1.2, 1.3)];
  const L_IDX = [0, 1, 2];

  const cart = carro(); cart.scale.setScalar(.95);
  const CART = V(3.15, 1.6, .5);
  const cItems = [bolsa('#C99A66', '#A87A4A', '#5BB04B'), taza('#E27A3F'), taza('#E27A3F')];
  const C_TILE = [0, 2, 2], C_T = [c('carrito', 2) - .15, c('carrito', 2) + .1, c('carrito', 2) + .35];
  const C_POS = [V(-.32, .62 + .44, -.05), V(.18, .62 + .5, .12), V(.48, .62 + .46, -.12)], C_ESC = [.62, .62, .62], C_ROT = [.25, -.5, .7];

  const carta = new THREE.Group(); scene.add(carta);
  const CWc = 2.2, CHc = 2.2 * 480 / 600;
  {
    const r = .147, f = new THREE.Shape(), a = CWc / 2, b = CHc / 2;
    f.moveTo(-a + r, -b); f.lineTo(a - r, -b); f.quadraticCurveTo(a, -b, a, -b + r); f.lineTo(a, b - r); f.quadraticCurveTo(a, b, a - r, b); f.lineTo(-a + r, b); f.quadraticCurveTo(-a, b, -a, b - r); f.lineTo(-a, -b + r); f.quadraticCurveTo(-a, -b, -a + r, -b);
    const geo = new THREE.ExtrudeGeometry(f, { depth: .07, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 3, curveSegments: 12 }); geo.translate(0, 0, -.035);
    malla(geo, mat('#FFFFFF', { roughness: .4 }), 0, 0, 0, carta);
  }
  const cvC = document.createElement('canvas'); cvC.width = 600; cvC.height = 480; const gC = cvC.getContext('2d');
  gC.save(); R(gC, 0, 0, 600, 480, 40); gC.clip(); gC.fillStyle = '#fff'; gC.fillRect(0, 0, 600, 480); gC.fillStyle = PROD[0].fondo; gC.fillRect(0, 0, 600, 322);
  gC.save(); gC.translate(0, 10); gC.scale(600 / 224, 600 / 224); DIB[0](gC, 0, 0, 224, 112); gC.restore(); gC.restore();
  gC.font = '800 46px Inter'; gC.fillStyle = '#111B21'; gC.fillText(PROD[0].nombre, 40, 390); const anchoNom = gC.measureText(PROD[0].nombre).width;
  gC.font = '800 42px Inter'; gC.fillStyle = '#1F8A4C'; gC.fillText(PROD[0].precio, 40, 448); const anchoPre = gC.measureText(PROD[0].precio).width;
  const txC = new THREE.CanvasTexture(cvC); txC.colorSpace = THREE.SRGBColorSpace; txC.anisotropy = 8;
  const caraC = new THREE.Mesh(new THREE.PlaneGeometry(CWc, CHc), new THREE.MeshBasicMaterial({ map: txC, transparent: true, toneMapped: false })); caraC.position.z = .052; carta.add(caraC);
  const enCarta = (px, py) => { carta.updateWorldMatrix(true, false); return carta.localToWorld(V((px / 600 - .5) * CWc, (.5 - py / 480) * CHc, .05)); };
  const CARTA = V(2.95, 3.1, .75);

  const recibo = new THREE.Group(); scene.add(recibo);
  {
    malla(new RoundedBoxGeometry(1.0, 1.3, .04, 3, .06), mat('#FFFFFF', { roughness: .4 }), 0, 0, 0, recibo);
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 390; const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 300, 390); g.fillStyle = '#5BB04B'; g.fillRect(0, 0, 300, 74); g.fillStyle = '#fff'; g.font = '800 36px Montserrat'; g.fillText('Pedido', 26, 50);
    g.fillStyle = '#DCE2EA'; [110, 160, 210].forEach((y, i) => { g.fillRect(26, y, 150 - i * 20, 16); g.fillRect(214, y, 60, 16); });
    g.fillStyle = '#0E1620'; g.font = '800 32px Montserrat'; g.fillText('$ 82.000', 26, 330);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.96, 1.26), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); m.position.z = .022; recibo.add(m);
  }

  const MESA = V(12, 0, 0);
  const mesa = new THREE.Group(); scene.add(mesa); mesa.position.copy(MESA);
  malla(new RoundedBoxGeometry(6.6, .14, 3.9, 3, .06), mat('#E1E8F0'), 0, 1.0, -.3, mesa);
  [[-3, -2], [3, -2], [-3, 1.4], [3, 1.4]].forEach(([x, z]) => malla(new THREE.CylinderGeometry(.07, .07, 1.0, 12), mat('#B9C3CF'), x, .5, z, mesa));
  const panel = k.crearPanelUI();
  Object.assign(panel.conf, { modo: 'pedido', empresa: 'Café La Montaña', seccion: 'Chats', menuActivo: 'CHATS', chatNombre: 'Laura Méndez', chatCanal: 'whatsapp' });
  const tLlega = s('pedido') + .75;
  panel.conf.filas = [
    { t: -1, nombre: 'Julián Vega', canal: 'whatsapp', texto: 'Buenos días', nuevos: 1, hora: '10:15' },
    { t: tLlega, nombre: 'Laura Méndez', canal: 'whatsapp', texto: 'Pedido · 3 artículos', nuevos: 1, hora: 'ahora' },
  ];
  panel.conf.chat = [
    { t: -1, lado: 'in', texto: 'Hola, ¿qué tienen?' },
  ];
  panel.conf.pedido = { t: c('pedido', 1) - .05, items: [
    { nombre: 'Café de origen', cant: 1, precio: '$ 32.000', sub: '$ 32.000' },
    { nombre: 'Taza de cerámica', cant: 2, precio: '$ 25.000', sub: '$ 50.000' },
  ], total: '$ 82.000' };
  const portatil = k.crearPortatil(panel); portatil.position.set(0, 1.07, -.1); mesa.add(portatil);
  const pantPanel = portatil.userData.tapa.children.find(m => m.material && m.material.map === panel.tex);
  const enPanel = (px, py) => { pantPanel.updateWorldMatrix(true, false); return pantPanel.localToWorld(V((px / 1600 - .5) * 4.86, (.5 - py / 1000) * 3.04, .01)); };
  const PANT = enPanel(800, 500);

  const robot = k.crearRobot();
  const ROB = V(-3.2, 1.2, .6);

  const ponerA = (id, cls, html, A, sx, sy, a) => { const [x, y] = P(A); mostrar(id, cls, html, A, sx - x, sy - y, a); };

  k.setKF([
    [0, [0, 4.9, 15.8], [0, 3.55, 0]],
    [e('gancho') - .25, [0, 4.6, 12.8], [0, 3.5, 0]],
    [s('catalogo') + 1.0, [.35, 3.4, 8.5], [.35, 3.12, 0]],
    [c('catalogo', 3), [1.25, 3.4, 8.5], [1.25, 3.12, 0]],
    [e('catalogo'), [1.3, 3.38, 8.3], [1.3, 3.12, 0]],
    [s('carrito') + .9, [1.5, 3.42, 8.6], [1.5, 3.08, 0]],
    [e('carrito'), [1.55, 3.4, 8.4], [1.55, 3.08, 0]],
    [s('pedido') + 1.1, [12, 3.42, 4.65], [12, 3.12, -2.04]],
    [e('pedido'), [12, 3.4, 4.4], [12, 3.12, -2.04]],
    [s('lema') + 1.2, [-.3, 4.5, 12.6], [-.3, 3.5, 0]],
    [total + .5, [-.3, 4.45, 11.8], [-.3, 3.5, 0]],
  ]);

  return {
    actualizar(T) {
      ahora = T; k.cam.updateMatrixWorld();
      const enLema = T >= s('lema');

      const vs = eob(pr(T, .05, .7));
      vitrina.scale.setScalar(Math.max(vs, .001)); vitrina.position.y = 2.75 + Math.sin(T * 1.2) * .035; vitrina.rotation.y = Math.sin(T * .6) * .03;
      let ts;
      if (T < s('catalogo')) ts = eob(pr(T, .4, .8));
      else if (!enLema) ts = 1 - eio(pr(T, s('catalogo') + .05, .55));
      else ts = eob(pr(T, s('lema') + .95, .8));
      toldo.visible = ts > .01; toldo.scale.set(1, Math.max(ts, .001), Math.max(ts, .001));
      chat.dibujar(T); catalogoBien(T);

      const pantalla = enChat(CW / 2, 640);
      gancho.forEach((g, i) => {
        let pos, sc;
        if (!enLema) {
          const u = pr(T, G_T[i], 1.1), ent = eio(u);
          pos = new THREE.Vector3().lerpVectors(G_INI[i], G_FIN[i], ent); pos.y += Math.sin(u * Math.PI) * .7 + Math.sin(T * 1.6 + i * 1.7) * .1 * ent;
          sc = .9 * cl(u * 3);
          const v = eio(pr(T, c('catalogo', 1) - .75 + i * .1, .7));
          if (v > 0) { pos.lerp(pantalla, v); sc *= 1 - v; }
          g.rotation.set(Math.sin(T * 1.1 + i) * .12, -.5 * (1 - ent) + Math.sin(T * .8 + i * 2) * .35 + (i % 2 ? -.3 : .3), Math.sin(T * .9 + i) * .08);
        } else {
          const j = L_IDX.indexOf(i);
          if (j < 0) { g.visible = false; return; }
          pos = L_FIN[j].clone(); pos.y += Math.sin(T * 1.5 + j * 1.9) * .1;
          sc = .85 * eob(pr(T, s('lema') + .55 + j * .15, .6));
          g.rotation.set(Math.sin(T * 1.1 + j) * .1, Math.sin(T * .8 + j * 2) * .3 + (j === 1 ? .35 : -.35), Math.sin(T * .9 + j) * .06);
        }
        g.position.copy(pos); g.visible = sc > .01; g.scale.setScalar(Math.max(sc, .001));
      });

      let ws = 0, wp = V(2.5, 5.3, .5);
      if (T < s('catalogo') + .6) ws = eob(pr(T, c('gancho', 3) - .1, .55)) * (1 - eio(pr(T, s('catalogo'), .5)));
      else if (enLema) { ws = eob(pr(T, c('lema', 2) - .15, .6)); wp = V(-2.3, 5.45, .6); }
      wa.visible = ws > .01; wa.scale.setScalar(Math.max(ws, .001)); wa.position.copy(wp); wa.position.y += Math.sin(T * 1.7) * .08; wa.rotation.y = Math.sin(T * .9) * .3;

      const cin = eio(pr(T, tCartaIn, .55)), cout = eio(pr(T, tCartaOut, .45)), cu = cin * (1 - cout);
      carta.visible = cu > .01;
      if (carta.visible) {
        const src = enTile(0, T); const p = new THREE.Vector3().lerpVectors(src, CARTA, cu); p.y += Math.sin(T * 1.4) * .04 * cu;
        carta.position.copy(p); carta.scale.setScalar(Math.max(lerp(.34, 1, cu), .001)); carta.rotation.set(0, -.22 * cu, 0);
      }
      const ca = cl(cu * 1.4 - .4);
      const bordeX = P(enCarta(600, 240))[0] + 150;
      ponerA('foto', 'pill azul', 'Foto', enCarta(380, 160), bordeX, P(enCarta(380, 160))[1], Math.min(ca, ventana(T, c('catalogo', 3) - .12, tCartaOut, .25)));
      ponerA('nom', 'pill', 'Nombre', enCarta(40 + anchoNom + 10, 374), bordeX, P(enCarta(40, 374))[1] - 6, Math.min(ca, ventana(T, c('catalogo', 4) - .12, tCartaOut, .25)));
      ponerA('pre', 'pill verde', 'Precio', enCarta(40 + anchoPre + 10, 434), bordeX, P(enCarta(40, 434))[1] + 30, Math.min(ca, ventana(T, c('catalogo', 5) - .12, tCartaOut, .25)));

      let ks = 0;
      if (T >= s('carrito') - .2 && T < s('pedido') + .6) ks = eob(pr(T, s('carrito') - .2, .7)) * (1 - eio(pr(T, s('pedido') + .1, .5)));
      let golpe = 0; C_T.forEach(t => { const u = pr(T, t + .6, .35); if (u > 0 && u < 1) golpe = Math.max(golpe, Math.sin(u * Math.PI)); });
      cart.visible = ks > .01; cart.scale.set(.95 * Math.max(ks, .001), .95 * Math.max(ks, .001) * (1 - golpe * .06), .95 * Math.max(ks, .001));
      cart.position.copy(CART); cart.position.y += Math.sin(T * 1.3) * .04; cart.rotation.set(.16, -.42, 0);
      cart.updateWorldMatrix(true, false);
      cItems.forEach((g, i) => {
        const u = pr(T, C_T[i], .6), dentro = cart.localToWorld(C_POS[i].clone());
        let pos, sc;
        if (u <= 0) { g.visible = false; return; }
        if (u < 1) { const src = enTile(C_TILE[i], C_T[i]); pos = new THREE.Vector3().lerpVectors(src, dentro, eio(u)); pos.y += Math.sin(u * Math.PI) * 1.1; pos.z += Math.sin(u * Math.PI) * .6; sc = lerp(.2, C_ESC[i], eo(u)); }
        else { pos = dentro; sc = C_ESC[i]; }
        sc *= ks > .01 ? Math.min(1, ks) : 0;
        g.visible = sc > .01; g.position.copy(pos); g.scale.setScalar(Math.max(sc * .95, .001));
        g.rotation.set(.16, -.42 + C_ROT[i] + (1 - cl(u)) * 2.5, 0);
      });

      const ru = pr(T, s('pedido') - .1, 1.0);
      recibo.visible = ru > 0 && ru < 1;
      if (recibo.visible) {
        const a = enChat(CW / 2, 964).add(V(0, 0, .75)), p = new THREE.Vector3().lerpVectors(a, PANT, eio(ru)); p.y += Math.sin(ru * Math.PI) * 1.4; p.z += Math.sin(ru * Math.PI) * .8;
        recibo.position.copy(p); recibo.scale.setScalar(Math.max(lerp(.35, .9, eob(cl(ru * 3))) * (1 - eio(cl((ru - .72) / .28))), .001)); recibo.rotation.set(0, Math.sin(ru * Math.PI) * .22, Math.sin(ru * 6) * .08);
      }

      mesa.visible = T >= s('carrito') && T < s('cierre');
      if (mesa.visible) panel.dibujar(T);
      if (mesa.visible) {
        const fin = e('pedido') - .1;
        ponerA('prod', 'pill azul', 'Productos', enPanel(918, 422), ...P(enPanel(640, 422)), ventana(T, c('pedido', 2) - .12, fin, .25));
        ponerA('cant', 'pill magenta', 'Cantidades', enPanel(918, 540), ...P(enPanel(640, 540)), ventana(T, c('pedido', 3) - .12, fin, .25));
        ponerA('tot', 'pill verde', 'Total', enPanel(918, 752), ...P(enPanel(640, 752)), ventana(T, c('pedido', 4) - .12, fin, .25));
      }

      let rs = 0;
      if (enLema) rs = eob(pr(T, s('lema') + .35, .7)) * .82;
      robot.visible = rs > .01; robot.scale.setScalar(Math.max(rs, .001));
      robot.animar(T, ROB, ventana(T, c('lema', 0) + .1, total, .4));
      robot.rotation.y = .4;
    },
  };
}
