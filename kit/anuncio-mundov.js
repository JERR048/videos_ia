// m1 · «Son las 9 de la noche» · formato «mundo en miniatura con narrador» (vertical).
// Nadie habla a cámara y no hay figuras humanas: los clientes son ventanas que se encienden y globos de chat; el equipo,
// un portátil con el panel en la vitrina. La cámara no corta: un solo vuelo que nunca queda quieto.
export default function (k) {
  // Datos del cierre: salen de marca.json, para que el ejemplo sirva con cualquier marca.
  const WEB = ((k.MARCA.cierre || {}).lineas || [])[1] || k.MARCA.nombre, TEL = (((k.MARCA.cierre || {}).datos || [])[0] || {}).texto || '';
  const { THREE, scene, cam, s, e, c, w, cl, lerp, eo, eob, eio, pr, ventana, V, MARCA, W, mat, malla } = k;
  const total = k.TL.total, PRIM = MARCA.colores.primario, ACENTO = MARCA.colores.acento;
  const col = h => new THREE.Color(h);
  const lienzo = (a, h) => { const cv = document.createElement('canvas'); cv.width = a; cv.height = h; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { cv, g: cv.getContext('2d'), tex }; };
  const rr = (g, x, y, a, h, r) => { g.beginPath(); g.roundRect(x, y, a, h, r); };
  const hex = (a, b, u) => '#' + col(a).lerp(col(b), cl(u)).getHexString();

  // ───────── Momentos (todos salen del guion) ─────────
  const tBaja = w('noche', 3), tLlega = c('noche', 1) + .3, tCierra = w('noche', 9);
  const tHaz = c('robot', 0) + .05, tRobot = w('robot', 1) - .05;
  const tSaluda = w('robot', 5) - .12, tMenu = w('robot', 7) - .12, tDatos = w('robot', 12) - .1;      // un momento por verbo
  const tPersona = w('horario', 3), tCartel = c('horario', 1) - .12;
  const tAmanece = c('manana', 0) - .05, tAbre = w('manana', 3), tVitrina = tAbre + .2, tEquipo = c('manana', 1);
  const tLogo = w('lema', 0), tLema1 = c('lema', 1) - .05, tLema2 = c('lema', 2) - .05, tWeb = w('lema', 5), tTel = w('lema', 7) + .3;

  // ───────── Ciudad: el claro del centro es la plaza de la tienda; se despeja una avenida hacia la cámara ─────────
  const ciudad = k.crearCiudad({ n: 150, ancho: 80, fondo: 80, x: 0, z: 0, alto: [3, 11], semilla: 5, celda: 5, brillo: .9, encendidas: .4, claro: { x: 0, z: 0, r: 8.5 } });
  const eds = ciudad.userData.edificios;
  eds.forEach(b => { if (Math.abs(b.position.x) < 5.2 && b.position.z > 0) b.visible = false; });
  const alto = b => b.geometry.parameters.height * b.scale.y;
  // 7 edificios distintos, por detrás de la tienda, desde donde escriben los clientes (de izquierda a derecha).
  // Si en esa manzana no hay edificio se levanta uno, y se suben lo justo para que su ventana no quede tapada.
  const FUENTES = [[-7.5, -7.5], [-7.5, -17.5], [-2.5, -12.5], [-2.5, -27.5], [2.5, -17.5], [7.5, -22.5], [7.5, -7.5]];
  const casas = FUENTES.map(([x, z], j) => {
    let b = eds.find(o => o.visible && Math.hypot(o.position.x - x, o.position.z - z) < 2);
    if (!b) { b = new THREE.Mesh(new THREE.BoxGeometry(3.4, 8, 3.4), eds[j * 9 + 4].material); b.position.set(x, 4, z); b.castShadow = b.receiveShadow = true; ciudad.add(b); eds.push(b); }
    return b;
  });
  const tapa = b => { let n = 0; for (const o of eds) { if (o === b || !o.visible) continue; const dz = o.position.z - b.position.z, dx = Math.abs(o.position.x - b.position.x);
    if (dx < 3.4 && dz > .5 && dz < 19) n = Math.max(n, alto(o) - (dz - 3.5) * .5); } return n; };
  [...casas].sort((a, b) => b.position.z - a.position.z).forEach(b => { const h = Math.min(15, Math.max(alto(b), tapa(b) + 2.6, 7)); b.scale.y = h / b.geometry.parameters.height; b.position.y = h / 2; });
  const grilla = scene.children.find(o => o.isGridHelper || o.type === 'GridHelper');
  const piso = scene.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 300);
  // de día: fachadas claras (un color por edificio) y ventanas apagadas
  const ED_N = col('#161C36'), TECHO_D = col('#7C8AA8'), PASTEL = ['#B9C4DC', '#D8C7B4', '#C5D3E0', '#D9CFC0', '#AEBBD6', '#CFC3D6'].map(col);
  let sem = 4321; const azar = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
  eds.forEach((b, i) => { b.userData.dia = PASTEL[i % PASTEL.length]; b.userData.r = azar(); });
  const PISO_N = col('#141E3D'), PISO_D = col('#A9B6CC');

  // plaza y andén
  const mPlaza = mat('#1B2750', { roughness: .9 }), mAnden = mat('#2B3868', { roughness: .85 });
  const plaza = malla(new THREE.CylinderGeometry(8.3, 8.3, .06, 72), mPlaza, 0, .03, 0); plaza.castShadow = false;
  const anden = malla(new THREE.BoxGeometry(8.4, .14, 6.6), mAnden, 0, .07, .6); anden.castShadow = false;
  const PLAZA_N = col('#1B2750'), PLAZA_D = col('#8FA0BD'), ANDEN_N = col('#2B3868'), ANDEN_D = col('#C4CDDD');

  // avenida hacia la tienda: línea central y cebra
  const mRaya = new THREE.MeshBasicMaterial({ color: '#5F6A9C' }), RAYA_N = col('#5F6A9C'), RAYA_D = col('#F4F6FA');
  const raya = (a, l, x, z) => { const r = new THREE.Mesh(new THREE.BoxGeometry(a, .03, l), mRaya); r.position.set(x, .02, z); scene.add(r); };
  for (let z = 12; z < 40; z += 3.5) raya(.28, 1.6, 0, z);
  for (let x = -3.6; x <= 3.61; x += 1.2) raya(.6, 1.9, x, 9.9);

  // cielo: estrellas de noche y un sol que sale por detrás de la ciudad
  const estrellas = [3, 5].map((size, n) => { const pos = []; for (let i = 0; i < 90; i++) pos.push((azar() - .5) * 250, 5 + azar() * azar() * 95, -118 - azar() * 20);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size, sizeAttenuation: false, transparent: true, fog: false, depthWrite: false })); p.frustumCulled = false; scene.add(p); return p; });
  const sol = new THREE.Mesh(new THREE.SphereGeometry(8, 40, 24), new THREE.MeshBasicMaterial({ color: col('#FFF0B4').multiplyScalar(1.3), fog: false, toneMapped: false })); scene.add(sol);

  // ───────── Ventanas que se encienden: desde ahí escriben los clientes ─────────
  const texHalo = (() => { const L = lienzo(128, 128), gr = L.g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    L.g.fillStyle = gr; L.g.fillRect(0, 0, 128, 128); return L.tex; })();
  const mMarcoV = new THREE.MeshBasicMaterial({ color: '#070B1A' }), V_OFF = col('#0C1228'), V_ON = col('#FFDFA0').multiplyScalar(1.4), V_DIA = col('#A9CBF0'), MV_N = col('#070B1A'), MV_D = col('#56668C');
  const ventanas = casas.map(b => {
    const g = new THREE.Group(); g.position.set(b.position.x, alto(b) - 1.3, b.position.z + b.geometry.parameters.depth / 2); scene.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.62, 1.62, .1), mMarcoV));
    const luz = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.34), new THREE.MeshBasicMaterial({ color: '#0C1228', toneMapped: false })); luz.position.z = .06; g.add(luz);
    const cz = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.4, .04), mMarcoV), cx = new THREE.Mesh(new THREE.BoxGeometry(1.4, .08, .04), mMarcoV); cz.position.z = cx.position.z = .08; g.add(cz, cx);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: texHalo, color: '#FFD08A', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); halo.position.z = .14; g.add(halo);
    return { luz, halo, sale: V(g.position.x, g.position.y, g.position.z + .35) };
  });

  // ───────── La tienda (cajas): toldo de franjas, puerta, letrero luminoso y una vitrina con fondo, donde va el portátil ─────────
  const tienda = new THREE.Group(); scene.add(tienda);
  const AN = 5.6, AL = 3.8, PF = 3.6, ZF = PF / 2, TECHO = AL + .22, RE = 1.25, ZR = ZF - RE / 2;
  const VX0 = -2.5, VX1 = .7, VY0 = .45, VY1 = 2.0, VXC = (VX0 + VX1) / 2, VW = VX1 - VX0, VH = VY1 - VY0, VYC = (VY0 + VY1) / 2;
  const caja = (a, h, d, m, x, y, z) => malla(new THREE.BoxGeometry(a, h, d), m, x, y, z, tienda);
  const mPared = mat('#EFE3CC', { roughness: .85 }), mMarco = mat('#2F3566', { roughness: .5 }), mVerde = mat(PRIM, { roughness: .7 }), mBlanco = mat('#F6F7FB', { roughness: .7 });
  caja(AN, AL, PF - RE, mPared, 0, AL / 2, -RE / 2);                                   // cuerpo de atrás
  caja(VX0 + AN / 2, AL, RE, mPared, (VX0 - AN / 2) / 2, AL / 2, ZR);                    // pilar izquierdo
  caja(AN / 2 - VX1, AL, RE, mPared, (AN / 2 + VX1) / 2, AL / 2, ZR);                    // muro de la puerta
  caja(VW, VY0, RE, mPared, VXC, VY0 / 2, ZR);                                           // antepecho
  caja(VW, AL - VY1, RE, mPared, VXC, (AL + VY1) / 2, ZR);                               // dintel
  caja(AN + .2, .32, PF + .2, mMarco, 0, .16, 0);
  caja(AN + .5, .22, PF + .5, mMarco, 0, AL + .11, 0);
  // vitrina: fondo iluminado, repisa y un vidrio que de noche queda oscuro y con la luz encendida deja ver adentro
  const mFondo = new THREE.MeshStandardMaterial({ color: '#E9D9B8', emissive: '#FFD27A', emissiveIntensity: 1.1, roughness: .8 });
  caja(VW, VH, .04, mFondo, VXC, VYC, ZF - RE + .03);
  caja(VW, .05, RE, mat('#A9794C', { roughness: .7 }), VXC, VY0 + .025, ZR);
  const mVidrio = new THREE.MeshStandardMaterial({ color: '#141B36', roughness: .2, transparent: true, opacity: .1, depthWrite: false });
  const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(VW, VH), mVidrio); vidrio.position.set(VXC, VYC, ZF + .01); vidrio.renderOrder = 2; tienda.add(vidrio);
  caja(VW + .28, .14, .18, mMarco, VXC, VY1 + .07, ZF + .03); caja(VW + .28, .14, .18, mMarco, VXC, VY0 - .07, ZF + .03);
  caja(.14, VH, .18, mMarco, VX0 - .07, VYC, ZF + .03); caja(.14, VH, .18, mMarco, VX1 + .07, VYC, ZF + .03);
  // puerta
  const mVidrioP = new THREE.MeshStandardMaterial({ color: '#141B36', emissive: '#FFD27A', emissiveIntensity: 1.3, roughness: .25 });
  caja(1.32, 2.0, .12, mMarco, 1.8, 1.0, ZF + .02); caja(1.06, 1.8, .14, mat('#4658A6', { roughness: .5 }), 1.8, .96, ZF + .04);
  caja(.62, .7, .16, mVidrioP, 1.8, 1.32, ZF + .05);
  malla(new THREE.SphereGeometry(.07, 12, 10), mBlanco, 1.42, .92, ZF + .14, tienda);
  // toldo
  const NF = 9, wf = (AN + .3) / NF;
  for (let i = 0; i < NF; i++) {
    const m = i % 2 ? mBlanco : mVerde, x = -(AN + .3) / 2 + wf * (i + .5);
    caja(wf, .07, 1.3, m, x, 2.36, ZF + .58).rotation.x = .4;
    caja(wf, .26, .06, m, x, 1.99, ZF + 1.18);
  }
  // letrero: plano con textura de canvas; material sin tone mapping para que se lea
  const rotulo = (txt, color) => {
    const L = lienzo(1024, 200), g = L.g;
    g.fillStyle = '#120E1C'; g.fillRect(0, 0, 1024, 200);
    g.font = '900 150px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; try { g.letterSpacing = '12px'; } catch (x) { /* sin espaciado */ }
    g.shadowColor = color; g.shadowBlur = 24; g.fillStyle = color; g.fillText(txt, 518, 108);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(4.6, .9), new THREE.MeshBasicMaterial({ map: L.tex, toneMapped: false })); p.position.set(0, 3.17, ZF + .1); tienda.add(p); return p;
  };
  caja(4.84, 1.06, .14, mMarco, 0, 3.17, ZF + .02);
  const abierto = rotulo('ABIERTO', '#FFD27A'), cerrado = rotulo('CERRADO', '#FF4D6D');

  // ───────── Portátil con el panel, dentro de la vitrina: ahí entran las fichas en lista ─────────
  const CLIENTES = [['Laura M.', '310 ··· 4821', '#3D7DD9'], ['Andrés P.', '300 ··· 1975', '#C73E70'], ['Camila R.', '315 ··· 6630', '#E27A3F'], ['Jorge T.', '301 ··· 2248', '#4FB6E0'],
    ['Valentina S.', '320 ··· 9054', '#8B6FE8'], ['Mateo G.', '311 ··· 7312', '#D9A521'], ['Sofía L.', '304 ··· 5589', '#2FA39A']];
  const ini = n => n.split(' ').map(x => x[0]).join('');
  const filas = [];                                                                       // { t, j }: en qué momento entra la ficha del cliente j
  const panel = k.crearPanelUI(); Object.assign(panel.conf, { empresa: 'Tu negocio', seccion: 'Contactos', menuActivo: 'CONTACTOS' });
  panel.conf.modo = (t, g) => {
    const n = filas.filter(f => t >= f.t).length;
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillStyle = '#0E1620'; g.font = '800 54px Montserrat, sans-serif'; g.fillText('Datos de clientes', 304, 150);
    g.fillStyle = n ? PRIM : '#C3CAD6'; rr(g, 1262, 94, 252, 72, 36); g.fill(); g.fillStyle = '#fff'; g.font = '800 42px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText(n + (n === 1 ? ' nuevo' : ' nuevos'), 1388, 145); g.textAlign = 'left';
    filas.forEach((f, i) => { if (t < f.t) return; const u = eo(pr(t, f.t, .3)), y = 184 + i * 115, x = 290 + (1 - u) * 90, [nom, tel, color] = CLIENTES[f.j];
      g.globalAlpha = u; g.fillStyle = hex('#DFF3DA', '#ffffff', pr(t, f.t + .35, .6)); rr(g, x, y, 1290, 103, 20); g.fill();
      g.fillStyle = color; g.beginPath(); g.arc(x + 62, y + 52, 38, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 34px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText(ini(nom), x + 62, y + 64); g.textAlign = 'left';
      g.fillStyle = '#0E1620'; g.font = '800 54px Montserrat, sans-serif'; g.fillText(nom, x + 124, y + 71);
      g.fillStyle = '#5A6573'; g.font = '600 44px Inter, sans-serif'; g.fillText(tel, x + 590, y + 68);
      g.fillStyle = PRIM; g.beginPath(); g.arc(x + 1172, y + 52, 34, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x + 1156, y + 53); g.lineTo(x + 1168, y + 66); g.lineTo(x + 1190, y + 40); g.stroke();
      g.globalAlpha = 1; });
  };
  const LS = .44, lap = k.crearPortatil(panel); lap.scale.set(LS, LS, .3); lap.position.set(VXC, VY0 + .05, ZR + .1); lap.userData.tapa.rotation.x = -.12;
  const fichaEn = i => V(VXC + .16, 1.96 - (236 + 115 * i) / 1000 * 3.04 * LS, ZF - RE + .5);   // dónde cae la fila i en la pantalla
  const luzVit = new THREE.PointLight('#FFE6B8', 0, 7); luzVit.position.set(VXC, 1.8, ZF - .25); scene.add(luzVit);

  // faroles: los dos del frente de la plaza alumbran de verdad; los demás (plaza y avenida) son solo el foco
  const mFoco = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), FOCO_N = col('#FFE9C4').multiplyScalar(1.5), FOCO_D = col('#E9EDF4');
  const faroles = [];
  [[-4.6, 3.5], [4.6, 3.5], [-6.4, -3.6], [6.4, -3.6], [-4.7, 13], [4.7, 13], [-4.7, 20], [4.7, 20], [-4.7, 27], [4.7, 27], [-4.7, 34], [4.7, 34]].forEach(([x, z], i) => {
    malla(new THREE.CylinderGeometry(.06, .08, 3.3, 10), mMarco, x, 1.65, z);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 12), mFoco); b.position.set(x, 3.4, z); scene.add(b);
    if (i < 2) { const l = new THREE.PointLight('#FFE9C4', 16, 16); l.position.set(x, 3.3, z + .4); scene.add(l); faroles.push(l); }
  });
  const luzTienda = new THREE.PointLight('#FFE0A8', 50, 26); luzTienda.position.set(0, 3.4, 7); scene.add(luzTienda);
  const luzRoja = new THREE.PointLight('#FF4D6D', 0, 10); luzRoja.position.set(0, 3.2, ZF + 2.2); scene.add(luzRoja);
  const luzRobot = new THREE.PointLight('#F1FFF0', 0, 22); luzRobot.position.set(0, 8.5, 6.5); scene.add(luzRobot);

  // haces: el de la tienda es corto (la marca en la vista aérea y se apaga antes de bajar, para no cruzar el titular);
  // el del robot baja del cielo. Con degradado, para que se desvanezcan en vez de verse como un tubo.
  const degradado = claroArriba => { const L = lienzo(4, 128), gr = L.g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, claroArriba ? '#ffffff' : '#000000'); gr.addColorStop(.55, claroArriba ? '#4a4a4a' : '#8a8a8a'); gr.addColorStop(1, claroArriba ? '#000000' : '#ffffff');
    L.g.fillStyle = gr; L.g.fillRect(0, 0, 4, 128); return L.tex; };
  const hazTienda = k.crearHaz({ color: '#FFE2A8', r0: 1.5, r1: 3.4, largo: 15, opacidad: .34 }); hazTienda.position.set(0, TECHO - .05, 0); hazTienda.rotation.set(Math.PI, Math.PI / 2, 0);
  hazTienda.material.map = degradado(true);
  const hazRobot = k.crearHaz({ color: '#C9F7BC', r0: .3, r1: 2.5, largo: 30, opacidad: .12 }); hazRobot.position.set(0, TECHO + 30, .2); hazRobot.rotation.y = Math.PI / 2;
  hazRobot.material.map = degradado(false);

  // ───────── Globos de chat: «…» mientras nadie responde → «¡Hola!» → ficha con ✓ → ficha en verde, en calma → al panel ─────────
  const forma = new THREE.Shape();
  { const a = .85, h = .58, r = .32;
    forma.moveTo(-a + r, -h); forma.lineTo(-.42, -h); forma.lineTo(-.56, -h - .34); forma.lineTo(-.08, -h); forma.lineTo(a - r, -h);
    forma.absarc(a - r, -h + r, r, -Math.PI / 2, 0); forma.absarc(a - r, h - r, r, 0, Math.PI / 2); forma.absarc(-a + r, h - r, r, Math.PI / 2, Math.PI); forma.absarc(-a + r, -h + r, r, Math.PI, Math.PI * 1.5); }
  const geoGlobo = new THREE.ExtrudeGeometry(forma, { depth: .12, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3, curveSegments: 12 }); geoGlobo.translate(0, 0, -.06);
  const geoPunto = new THREE.SphereGeometry(.11, 16, 12), mPunto = new THREE.MeshBasicMaterial({ color: '#59627A', transparent: true });
  const mBorde = new THREE.MeshBasicMaterial({ color: '#141B36', transparent: true });
  const BLANCO = col('#ffffff').multiplyScalar(1.04), VERDE = col(PRIM).multiplyScalar(1.2);
  const texHola = (() => { const L = lienzo(384, 160), g = L.g; g.font = '900 112px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText('¡Hola!', 192, 86); return L.tex; })();
  const mHola = new THREE.MeshBasicMaterial({ map: texHola, transparent: true, toneMapped: false, depthWrite: false });
  // ficha de contacto: iniciales en un círculo, dos renglones de datos y un ✓ (versión blanca y versión verde)
  const texFicha = (j, verde) => { const L = lienzo(416, 288), g = L.g, [nom, , color] = CLIENTES[j];
    g.fillStyle = '#141B36'; rr(g, 2, 2, 412, 284, 52); g.fill(); g.fillStyle = verde ? PRIM : '#ffffff'; rr(g, 12, 12, 392, 264, 43); g.fill();
    g.fillStyle = verde ? '#ffffff' : color; g.beginPath(); g.arc(104, 104, 62, 0, 7); g.fill();
    g.fillStyle = verde ? '#2E7A22' : '#ffffff'; g.font = '800 54px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ini(nom), 104, 108);
    g.fillStyle = verde ? '#ffffff' : '#1B2440'; rr(g, 196, 62, 176, 30, 15); g.fill();
    g.fillStyle = verde ? 'rgba(255,255,255,.7)' : '#B5BDD0'; rr(g, 196, 112, 128, 26, 13); g.fill(); rr(g, 46, 206, 210, 26, 13); g.fill();
    g.fillStyle = verde ? '#ffffff' : PRIM; g.beginPath(); g.arc(332, 206, 50, 0, 7); g.fill();
    g.strokeStyle = verde ? PRIM : '#ffffff'; g.lineWidth = 15; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(309, 207); g.lineTo(326, 226); g.lineTo(358, 187); g.stroke();
    return L.tex; };
  // un arco de globos alrededor del robot (de izquierda a derecha); el centro queda libre para el menú y el cartel
  const SITIO = [[-3.7, 6.5], [-3.82, 8.2], [-3.3, 9.85], [0, 10.95], [3.3, 9.85], [3.82, 8.2], [3.7, 6.5]];
  const ORDEN = [2, 4, 0, 6, 1, 5, 3], ENTRA = [3, 2, 4, 1, 5, 0, 6], VUELO = .85, ESC = .9, DV = .55;
  const globos = ventanas.map((v, j) => {
    const g = new THREE.Group(); scene.add(g);
    // «transparent» con orden de dibujo alto: se pintan después de los haces de luz, que así no los lavan
    const m = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true });
    const burbuja = new THREE.Group(); g.add(burbuja);
    const borde = new THREE.Mesh(geoGlobo, mBorde), cuerpo = new THREE.Mesh(geoGlobo, m); borde.scale.set(1.07, 1.09, 1); borde.position.z = -.05; borde.renderOrder = 10; cuerpo.renderOrder = 11; burbuja.add(borde, cuerpo);
    const puntos = [-.36, 0, .36].map(x => { const p = new THREE.Mesh(geoPunto, mPunto); p.position.set(x, 0, .13); p.renderOrder = 12; burbuja.add(p); return p; });
    const hola = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .625), mHola); hola.position.z = .13; hola.renderOrder = 12; burbuja.add(hola);
    const ficha = new THREE.Group(); g.add(ficha);
    const fb = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.232), new THREE.MeshBasicMaterial({ map: texFicha(j, false), transparent: true, toneMapped: false, depthWrite: false })); fb.renderOrder = 11;
    const fv = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.232), new THREE.MeshBasicMaterial({ map: texFicha(j, true), transparent: true, toneMapped: false, depthWrite: false })); fv.position.z = .01; fv.renderOrder = 12; ficha.add(fb, fv);
    const t0 = lerp(c('siguen', 0) + .12, w('siguen', 4) + .25, ORDEN.indexOf(j) / 6);        // sale de su ventana
    const tHola = tSaluda + j * .07, tFicha = tDatos + j * .12, tVerde = tCartel + .1 + j * .05;
    const fila = ENTRA.indexOf(j), tVa = tEquipo + .1 + fila * .15;                           // vuela al portátil
    filas[fila] = { t: tVa + DV - .04, j };
    k.sonar(t0, 'pop', .62); if (j % 2 === 0) k.sonar(tFicha + .1, 'tic', .5); k.sonar(tVa + DV - .04, 'tic', .38);
    return { g, m, burbuja, puntos, hola, ficha, fv, t0, tHola, tFicha, tVerde, tVa, de: v.sale, a: V(SITIO[j][0], SITIO[j][1], .9), cae: fichaEn(fila), fase: j * 1.7 };
  });

  // ───────── Menú flotante: tres opciones que el robot despliega sobre la tienda (la 3 se enciende al pedir a una persona) ─────────
  const LM = lienzo(1000, 552), OPC = ['Productos', 'Hacer un pedido', 'Hablar con una persona'];
  const geoMenu = new THREE.PlaneGeometry(5, 2.76); geoMenu.translate(0, 1.38, 0);
  const menu = new THREE.Mesh(geoMenu, new THREE.MeshBasicMaterial({ map: LM.tex, transparent: true, toneMapped: false, depthWrite: false })); menu.renderOrder = 13; scene.add(menu);
  const MENU = V(0, 7.2, .8);
  const pintarMenu = T => {
    const g = LM.g; g.clearRect(0, 0, 1000, 552); g.textBaseline = 'middle';
    g.fillStyle = '#141B36'; rr(g, 2, 2, 996, 548, 50); g.fill(); g.fillStyle = '#ffffff'; rr(g, 12, 12, 976, 528, 42); g.fill();
    g.save(); rr(g, 12, 12, 976, 528, 42); g.clip(); g.fillStyle = PRIM; g.fillRect(12, 12, 976, 104); g.restore();
    g.fillStyle = '#fff'; g.font = '900 62px Montserrat, sans-serif'; g.textAlign = 'left'; g.fillText('MENÚ', 52, 68);
    [0, 1, 2].forEach(i => { g.globalAlpha = .55 + .45 * Math.max(0, Math.sin(T * 7 - i * .9)); g.beginPath(); g.arc(850 + i * 40, 66, 12, 0, 7); g.fill(); }); g.globalAlpha = 1;
    OPC.forEach((txt, i) => { const u = eo(pr(T, tMenu + .26 + i * .2, .25)); if (u <= 0) return;
      const y = 134 + i * 132, dx = (1 - u) * 70, sel = i === 2 ? pr(T, tPersona - .05, .2) : 0, on = sel > .5;
      g.globalAlpha = u; g.fillStyle = hex('#EDF1F6', PRIM, sel); rr(g, 34 + dx, y, 932, 114, 30); g.fill();
      g.fillStyle = on ? '#ffffff' : PRIM; g.beginPath(); g.arc(98 + dx, y + 57, 38, 0, 7); g.fill();
      g.fillStyle = on ? PRIM : '#ffffff'; g.font = '900 46px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText(String(i + 1), 98 + dx, y + 60);
      g.fillStyle = on ? '#ffffff' : '#0E1620'; g.font = '800 56px Montserrat, sans-serif'; g.textAlign = 'left'; g.fillText(txt, 158 + dx, y + 60);
      g.globalAlpha = 1; });
    LM.tex.needsUpdate = true;
  };

  // ───────── Cartel luminoso con reloj: sale del techo y avisa el horario ─────────
  const LC = lienzo(1080, 500), cartel = new THREE.Group(); scene.add(cartel);
  const mPoste = mat('#2F3566', { roughness: .5 });
  [-2.1, 2.1].forEach(x => malla(new THREE.CylinderGeometry(.09, .09, 3.4, 12), mPoste, x, 1.7, -.12, cartel));
  malla(new THREE.BoxGeometry(6.1, 2.9, .2), mPoste, 0, 4.62, 0, cartel);
  const cara = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 2.685), new THREE.MeshBasicMaterial({ map: LC.tex, toneMapped: false, transparent: true })); cara.position.set(0, 4.62, .11); cara.renderOrder = 9; cartel.add(cara);
  const pintarCartel = T => {
    const g = LC.g; g.fillStyle = '#0B1026'; g.fillRect(0, 0, 1080, 500);
    g.strokeStyle = ACENTO; g.lineWidth = 12; g.shadowColor = ACENTO; g.shadowBlur = 26; rr(g, 24, 24, 1032, 452, 40); g.stroke(); g.shadowBlur = 0;
    const cx = 152, cy = 160, R = 92, u = eo(pr(T, tCartel + .15, 1.2));
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = ACENTO; g.lineWidth = 10; g.stroke();
    g.fillStyle = '#141B36'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.arc(cx + Math.sin(a) * R * .8, cy - Math.cos(a) * R * .8, i % 3 ? 4 : 7, 0, 7); g.fill(); }
    const aguja = (a, l, an) => { g.strokeStyle = '#141B36'; g.lineWidth = an; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); g.stroke(); };
    aguja(lerp(-Math.PI * .6, Math.PI * 4 / 3, u), R * .5, 14); aguja(lerp(-Math.PI * 8, 0, u), R * .74, 9);      // se detiene en las 8:00
    g.fillStyle = PRIM; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.fill();
    g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.font = '900 82px Montserrat, sans-serif'; g.textAlign = 'left'; g.fillText('Lunes a sábado', 286, 164);
    g.fillStyle = '#FFD27A'; g.shadowColor = '#FFD27A'; g.shadowBlur = 14; g.font = '800 70px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText('8:00 a. m. – 6:00 p. m.', 540, 366); g.shadowBlur = 0;
    LC.tex.needsUpdate = true;
  };

  // ───────── Robot de la marca, sobre el techo ─────────
  const robot = k.crearRobot();
  const ROB = V(0, TECHO + .7, .25);

  // ───────── Sonido ─────────
  k.sonar(tBaja, 'paso', .45); k.sonar(tCierra, 'golpe', .7); k.sonar(tHaz, 'brillo', .75);
  k.sonar(tSaluda + .1, 'sube', .5); k.sonar(tMenu, 'paso', .45); [0, 1, 2].forEach(i => k.sonar(tMenu + .28 + i * .2, 'tic', .45));
  k.sonar(tPersona - .05, 'pop', .6); k.sonar(tCartel + .05, 'brillo', .75); k.sonar(tAmanece + .1, 'sube', .4); k.sonar(tAbre, 'golpe', .5);
  k.sonar(s('lema') + .05, 'paso', .4); k.sonar(tLema2, 'logro', .95);

  // ───────── Cámara: un solo vuelo, sin cortes ─────────
  k.setKF([
    [0, [5, 46, 70], [0, 9, -6]],
    [tBaja, [4.3, 43.5, 66.5], [0, 9, -6]],
    [tLlega, [1.4, 7.4, 26], [0, 3.1, 0]],
    [e('noche'), [.7, 6.7, 24], [0, 3.1, 0]],
    [s('siguen') + .8, [0, 33, 43], [0, 5, -3]],
    [w('siguen', 4) + .3, [.4, 31.5, 41.4], [0, 5.3, -3]],
    [s('robot') + .9, [-1.5, 9.4, 29.2], [0, 4.75, 0]],
    [e('robot'), [.3, 9, 28.3], [0, 4.75, 0]],
    [tCartel + .55, [1.5, 9.7, 29], [0, 4.8, 0]],
    [e('horario'), [.9, 9.4, 28.4], [0, 4.8, 0]],
    [tAbre + .1, [.4, 8.9, 27.6], [-.1, 4.8, 0]],
    [w('manana', 7) + .3, [-.8, 1.42, 8.2], [-.86, 1.36, 1.2]],
    [e('manana'), [-.86, 1.4, 7.55], [-.88, 1.35, 1.2]],
    [s('lema') + 1.4, [-1, 33, 61], [-1, 10, 0]],
    [total + .5, [-1, 35.5, 65], [-1, 10, 0]],
  ]);

  const X = W / 2, P = new THREE.Vector3();
  const SOMBRA = '<span style="text-shadow:0 0 20px #0A1026,0 0 46px #0A1026,0 8px 30px rgba(0,0,0,.7)">';
  return {
    actualizar(T) {
      // en el cierre el vuelo frena al llegar arriba: un deslizamiento lateral lento mantiene el plano en movimiento
      const tau = T - s('lema') - .9;
      if (tau > 0) { cam.position.x += .55 * (tau < .6 ? tau * tau / 1.2 : tau - .3); cam.updateMatrixWorld(); }
      // noche → amanecer → mañana
      const dia = eio(pr(T, tAmanece, 1.2));
      if (dia < .5) k.tono('noche', 'atardecer', dia * 2); else k.tono('atardecer', 'cielo', (dia - .5) * 1.7);
      k.resplandor(lerp(.4, .1, dia));
      // la niebla se abre cuando la cámara sube, para que la vista aérea no se pierda
      scene.fog.near = 30 + cam.position.y * 1.3 + dia * 20; scene.fog.far = 80 + cam.position.y * 2.4 + dia * 50;
      if (grilla) grilla.visible = false;
      if (piso) piso.material.color.lerpColors(PISO_N, PISO_D, dia);
      mPlaza.color.lerpColors(PLAZA_N, PLAZA_D, dia); mAnden.color.lerpColors(ANDEN_N, ANDEN_D, dia); mRaya.color.lerpColors(RAYA_N, RAYA_D, dia);
      for (const b of eds) { const m = b.material[0]; m.emissiveIntensity = .9 * (1 - pr(T, tAmanece + .1 + b.userData.r * .65, .22)); m.color.lerpColors(ED_N, b.userData.dia, dia); }
      eds[0].material[2].color.lerpColors(ED_N, TECHO_D, dia);
      estrellas.forEach((p, i) => { p.material.opacity = (1 - cl(dia * 2.2)) * (.6 + .4 * Math.sin(T * 2.3 + i * 2)); });
      sol.position.set(-24, lerp(-12, 23, dia), -128); sol.visible = dia > 0;
      mFoco.color.lerpColors(FOCO_N, FOCO_D, dia); mMarcoV.color.lerpColors(MV_N, MV_D, dia); faroles.forEach(l => { l.intensity = 16 * (1 - dia); });

      // tienda: abierta → cerrada → abierta otra vez por la mañana
      const cierre = pr(T, tCierra - .04, .12), abre = pr(T, tAbre, .12), vit = pr(T, tVitrina, .3), cerrada = cierre * (1 - abre);
      const parpadeo = T < tCierra ? 0 : T < tCierra + .07 ? 1 : T < tCierra + .15 ? .2 : 1, parpAbre = T < tAbre + .07 ? 1 : T < tAbre + .15 ? .25 : 1;
      const luzDentro = 1 - cierre + vit;
      mFondo.emissiveIntensity = lerp(.02, 1.1, luzDentro); mVidrio.opacity = lerp(.97, .1, luzDentro); mVidrioP.emissiveIntensity = lerp(.03, 1.3, luzDentro); luzVit.intensity = 9 * luzDentro;
      abierto.visible = cerrada < .5; cerrado.visible = !abierto.visible;
      abierto.material.color.setScalar(1.25 * (T < tAbre ? 1 : parpAbre)); cerrado.material.color.setScalar(.25 + 1.2 * parpadeo);
      luzTienda.intensity = lerp(lerp(50, 20, cierre), 10, dia); luzRoja.intensity = 6 * parpadeo * (1 - abre);
      hazTienda.material.opacity = .34 * (1 - pr(T, tBaja + .05, .4));
      if (T < tCierra + .4 || T > tAmanece) panel.dibujar(T);

      // ventanas de los clientes
      ventanas.forEach((v, j) => { const b = globos[j], on = cl(pr(T, b.t0 - .3, .16)) * (1 - pr(T, tAmanece + .15 + j * .08, .25)), golpe = ventana(T, b.t0 - .3, b.t0 + .15, .14);
        v.luz.material.color.lerpColors(V_OFF, V_ON, on * (.86 + .14 * Math.sin(T * 8 + j * 2))).lerp(V_DIA, dia);
        v.halo.material.opacity = on * (.36 + .5 * golpe) * lerp(1, .5, pr(T, b.t0 + VUELO, .6)); v.halo.scale.setScalar(1 + .7 * golpe); });

      // globos
      for (const b of globos) {
        const u = pr(T, b.t0, VUELO), v = eio(u), hola = pr(T, b.tHola, .3), fic = pr(T, b.tFicha, .34), verde = pr(T, b.tVerde, .4), va = pr(T, b.tVa, DV), q = eio(va);
        b.g.visible = T >= b.t0 && va < 1;
        P.lerpVectors(b.de, b.a, v); P.y += Math.sin(Math.PI * v) * 4.5 + (u >= 1 ? Math.sin(T * 1.6 + b.fase) * lerp(.12, .045, verde) : 0);
        if (va > 0) { P.x = lerp(P.x, b.cae.x, q); P.y = lerp(P.y, b.cae.y, eo(va)); P.z = lerp(P.z, b.cae.z, q) + Math.sin(Math.PI * va) * 3.3; }
        b.g.position.copy(P); b.g.quaternion.copy(cam.quaternion); b.g.rotateZ((Math.sin(T * 1.1 + b.fase) * lerp(.05, .015, verde) + (1 - v) * .5) * (1 - q));
        const giro = Math.max(.03, Math.abs(Math.cos(Math.PI * hola)) * Math.abs(Math.cos(Math.PI * fic)));
        const pulso = 1 + .16 * ventana(T, b.tHola + .15, b.tHola + .5, .14) + .2 * ventana(T, b.tFicha + .17, b.tFicha + .55, .14) + .1 * ventana(T, b.tVerde, b.tVerde + .5, .2);
        const esc = eob(pr(T, b.t0, .25)) * lerp(.45, ESC, eo(u)) * pulso * lerp(1, .2, q);
        b.g.scale.set(esc * giro, esc, esc);
        b.burbuja.visible = fic < .5; b.ficha.visible = !b.burbuja.visible;
        b.m.color.copy(hola < .5 ? BLANCO : VERDE); b.hola.visible = hola >= .5;
        b.puntos.forEach((p, i) => { p.visible = hola < .5; p.position.y = Math.max(0, Math.sin(T * 7 - i * .9 + b.fase)) * .13; });
        b.fv.material.opacity = verde;
      }

      // menú flotante
      const mAb = eob(pr(T, tMenu, .4)) * (1 - eo(pr(T, tCartel - .32, .26)));
      menu.visible = mAb > .01;
      if (menu.visible) { pintarMenu(T); menu.position.copy(MENU); menu.position.y += Math.sin(T * 1.9) * .06; menu.quaternion.copy(cam.quaternion);
        const lat = 1 + .05 * ventana(T, tPersona - .05, tPersona + .35, .14); menu.scale.set(lerp(.55, 1, cl(mAb)) * lat, mAb * lat, 1); }

      // cartel del horario: sube del techo y se guarda al amanecer
      const sube = eob(pr(T, tCartel, .6)) * (1 - eio(pr(T, tAmanece + .05, .55)));
      cartel.visible = sube > .001;
      if (cartel.visible) { pintarCartel(T); cartel.position.set(0, TECHO - 7.2 * (1 - sube), -.95); cara.material.color.setScalar(1.12 + .08 * Math.sin(T * 5)); }

      // robot: sale del techo dentro del haz, saluda y responde
      const haz = pr(T, tHaz, .25), sale = eob(pr(T, tRobot, .55));
      hazRobot.material.opacity = .12 * haz * (1 - dia); luzRobot.intensity = 8 * pr(T, tRobot, .4) * (1 - .6 * dia);
      robot.visible = T >= tRobot; P.copy(ROB); P.y -= (1 - sale) * 2.6; robot.scale.setScalar(lerp(.8, 1.2, cl(sale)));
      robot.animar(T, P, ventana(T, tSaluda, tMenu + .1, .2) + ventana(T, tLema1, total + 1, .3), { brazos: ventana(T, tMenu, tMenu + .7, .2) * .8 + ventana(T, tCartel, tCartel + .8, .2) * .8 });
      robot.rotation.y = -.06; robot.userData.sombra.visible = false;

      // títulos y cierre
      k.dato('hora', SOMBRA + '9:00 P.&nbsp;M.</span>', { x: X, y: 400, clase: 'titular', escala: 1.2 }, ventana(T, .08, c('noche', 1) - .25, .16));
      k.dato('lema1', SOMBRA + 'TU WHATSAPP RESPONDE</span>', { x: X, y: 300, clase: 'titular', escala: .6 }, pr(T, tLema1, .3));
      k.dato('lema2', SOMBRA + 'AUNQUE TÚ <b>NO ESTÉS</b></span>', { x: X, y: 418, clase: 'titular', escala: .8 }, pr(T, tLema2, .3));
      const op = u => cl(u).toFixed(2);
      k.dato('marca', `<img src="${MARCA.logo}" style="width:390px;display:block;margin:-14px auto 22px">` +
        `<div class="d-tit" style="text-align:center;font-size:40px;color:#0E1620;opacity:${op(pr(T, tLema1, .3))}">Tu WhatsApp <b style="color:${PRIM}">responde</b><br><span style="opacity:${op(pr(T, tLema2, .3))}">aunque tú no estés</span></div>` +
        k.boton(WEB, '', pr(T, tWeb, .3)) +
        `<div class="d-tit" style="text-align:center;font-size:40px;color:#2E3A48;margin-top:16px;opacity:${op(pr(T, tTel, .3))}">${TEL}</div>`,
        { x: X, y: 800, w: 800, clase: 'claro' }, pr(T, tLogo, .3));
    },
  };
}
