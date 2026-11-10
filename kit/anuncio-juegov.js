// Formato «videojuego» (vertical): atender el WhatsApp contado como un juego de plataformas lateral, de noche.
// Título → NIVEL 1 (el robot saluda a 3 clientes) → NIVEL 2 (bloque de menú y tarjeta de datos) → NIVEL 3 (tienda cerrada,
// cartel de horario) → NIVEL 4 (pasa el chat al portátil del equipo, bandera de meta) → NIVEL SUPERADO y cierre.
// Sin muñecos humanos: los clientes son celulares de pie con su globo de chat y el equipo es un escritorio con el panel.
export default function (k) {
  // Datos del cierre: salen de marca.json, para que el ejemplo sirva con cualquier marca.
  const WEB = ((k.MARCA.cierre || {}).lineas || [])[1] || k.MARCA.nombre, TEL = (((k.MARCA.cierre || {}).datos || [])[0] || {}).texto || '';
  const { THREE, scene, cam, s, w, cl, lerp, eio, eo, eob, pr, ventana, V, MARCA, W, mat, malla, RoundedBoxGeometry } = k;
  const total = k.TL.total, PRIM = MARCA.colores.primario, AMA = '#FFC83D', VERDE = '#4ADE80', WA = '#25D366', TINTA = '#0B0B14', X = W / 2;
  k.pixelar(5);

  // El piso del kit taparía el frente de la plataforma: se apaga y cada nivel trae su propio suelo lejano.
  scene.children.forEach(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 300) o.visible = false; });
  const amb = new THREE.AmbientLight('#ffffff', .75); scene.add(amb);
  const frente = new THREE.DirectionalLight('#ffffff', 1.1); frente.position.set(-5, 7, 16); scene.add(frente);

  let sem = 77; const rnd = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
  const plano = (color, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color }, o));
  const caja = (a, h, f, m, x, y, z, padre) => { const o = new THREE.Mesh(new THREE.BoxGeometry(a, h, f), m); o.position.set(x, y, z); padre.add(o); return o; };
  const pixTex = (pintar, rx, ry) => { const cv = document.createElement('canvas'); cv.width = cv.height = 16; pintar(cv.getContext('2d'));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const ladrillos = (base, linea, luz, rx, ry) => pixTex(g => { g.fillStyle = base; g.fillRect(0, 0, 16, 16); g.fillStyle = luz; g.fillRect(0, 1, 16, 1); g.fillRect(0, 9, 16, 1);
    g.fillStyle = linea; g.fillRect(0, 0, 16, 1); g.fillRect(0, 8, 16, 1); g.fillRect(0, 0, 1, 8); g.fillRect(8, 8, 1, 8); }, rx, ry);

  // ───────── Un nivel: plataforma larga con «pasto», ladrillos al frente, suelo lejano, estrellas y ciudad de fondo ─────────
  function crearNivel(o) {
    const g = new THREE.Group(); scene.add(g);
    const CX = 4, ANCHO = 48, Z0 = -.5, FONDO = 4.2, zf = Z0 + FONDO / 2;
    const lado = plano(o.linea), fr = plano('#ffffff', { map: ladrillos(o.ladrillo, o.linea, o.luz, ANCHO / 2, 7) });
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(ANCHO, 14, FONDO), [lado, lado, lado, lado, fr, lado]); cuerpo.position.set(CX, -7.5, Z0); g.add(cuerpo);
    const pasto = malla(new THREE.BoxGeometry(ANCHO + .2, .5, FONDO + .16), mat(o.pasto, { roughness: .9 }), CX, -.25, Z0, g); pasto.castShadow = false;
    const mp = plano(o.pasto2);
    for (let i = 0; i < ANCHO; i += 2) caja(1, .26, .1, mp, CX - ANCHO / 2 + i + .5, -.62, zf + .09, g);
    const lejos = new THREE.Mesh(new THREE.PlaneGeometry(260, 90), plano(o.suelo)); lejos.rotation.x = -Math.PI / 2; lejos.position.set(CX, -.04, Z0 - FONDO / 2 - 45); g.add(lejos);
    const me = plano('#ffffff', { fog: false }), estrellas = [];
    for (let i = 0; i < 46; i++) estrellas.push(caja(.34, .34, .05, me, CX + (rnd() - .5) * 110, 7 + rnd() * 26, -52 - rnd() * 6, g));
    const ciudad = k.crearCiudad(Object.assign({ x: CX, z: -34, ancho: 110, fondo: 15, n: 60, celda: 5, alto: [4, 12], brillo: .9, encendidas: .4 }, o.ciudad)); g.add(ciudad);
    (o.medio || []).forEach(([x, a, h, c]) => caja(a, h, 1, plano(c), x, h / 2 - .05, -8, g));
    g.userData = { estrellas, ciudad }; return g;
  }
  const L1 = crearNivel({ pasto: '#46D678', pasto2: '#1F9A4C', ladrillo: '#A4552E', linea: '#6A3216', luz: '#C87440', suelo: '#0F1648',
    ciudad: { semilla: 4, color: '#1B2468' }, medio: [[-7, 5, 1.6, '#1C5E50'], [-1.5, 3.4, 2.4, '#1C5E50'], [5.5, 6, 1.4, '#1C5E50'], [12, 3.6, 2.6, '#1C5E50'], [18, 5, 1.7, '#1C5E50']] });
  const L2 = crearNivel({ pasto: '#52C4F0', pasto2: '#2687C4', ladrillo: '#3A3F9A', linea: '#1E2163', luz: '#5960C8', suelo: '#35105A',
    ciudad: { semilla: 9, color: '#5A2190', alto: [5, 15], encendidas: .6 }, medio: [[-6, 3, 3.2, '#7A2D9E'], [-1.6, 4, 1.8, '#7A2D9E'], [7.6, 3.4, 3.0, '#7A2D9E'], [12, 4.6, 2.2, '#7A2D9E']] });
  const L3 = crearNivel({ pasto: '#F2A33A', pasto2: '#B86A1C', ladrillo: '#5E2A4A', linea: '#35142B', luz: '#8A4470', suelo: '#120A2A',
    ciudad: { semilla: 14, color: '#231A52', alto: [3, 7], encendidas: .4 }, medio: [[-5, 4, 1.3, '#3A2466'], [9.4, 3, 1.6, '#3A2466'], [13, 5, 1.2, '#3A2466']] });
  const L4 = crearNivel({ pasto: '#F26FAE', pasto2: '#B83A78', ladrillo: '#1F6F7C', linea: '#0F3F4A', luz: '#2F96A6', suelo: '#06283A',
    ciudad: { semilla: 21, color: '#0E5C78', alto: [5, 14], encendidas: .55 }, medio: [[-6, 4, 2.2, '#0F7A80'], [-.8, 3, 1.5, '#0F7A80'], [9.8, 4, 2.6, '#0F7A80'], [15, 5, 1.6, '#0F7A80']] });
  const NIV = [L1, L2, L3, L4];
  const CIELO = ['#18206A', '#5B1F86', '#A8456E', '#0A3A5C'].map(c => new THREE.Color(c)), NOCHE = new THREE.Color('#05071A');

  // ───────── Cliente: un celular de pie (no un muñeco) ─────────
  function crearCelular(color, padre, x, z) {
    const g = new THREE.Group(); padre.add(g); g.position.set(x, 0, z); g.rotation.y = -.42;
    malla(new RoundedBoxGeometry(.82, 1.46, .22, 3, .11), mat(color, { roughness: .5 }), 0, .79, 0, g);
    const mp = plano('#141A2E'); caja(.64, 1.14, .02, mp, 0, .81, .115, g);
    caja(.22, .06, .02, plano(TINTA), 0, 1.31, .125, g);
    caja(.36, .14, .02, plano('#ffffff'), -.09, 1.08, .13, g);
    const resp = caja(.36, .14, .02, plano(WA), .09, .84, .13, g);
    [-.2, .2].forEach(dx => caja(.2, .1, .34, plano(TINTA), dx, .05, .02, g));
    g.userData = { mp, resp }; return g;
  }
  // esperando: vibra a ratos · atendido: da un saltito, se enciende la pantalla y aparece la respuesta
  const animarCelular = (c, T, t0, i = 0) => { const hecho = T >= t0;
    c.position.y = hecho ? .4 * Math.sin(Math.PI * pr(T, t0, .3)) + .05 * Math.abs(Math.sin((T - t0) * 5)) : 0;
    c.rotation.z = hecho ? 0 : .08 * Math.sin(T * 30) * ((T * 1.3 + i * .37) % 1 < .45 ? 1 : 0);
    c.userData.resp.visible = hecho; c.userData.mp.color.set(hecho ? '#0F4030' : '#141A2E'); };

  // ───────── Globo de chat 3D: «…» que escribe, o un visto bueno ─────────
  function crearGlobo(color, puntos, padre = scene) {
    const g = new THREE.Group(); padre.add(g);
    g.add(new THREE.Mesh(new RoundedBoxGeometry(1.05, .68, .2, 3, .16), plano(color)));
    const cola = caja(.26, .26, .18, plano(color), -.3, -.34, 0, g); cola.rotation.z = Math.PI / 4;
    const dots = new THREE.Group(), ok = new THREE.Group(); g.add(dots, ok);
    [-.28, 0, .28].forEach(x => caja(.15, .15, .06, plano(puntos), x, 0, .11, dots));
    const mv = plano('#16A34A'); const a = caja(.14, .28, .06, mv, -.15, -.1, .12, ok); a.rotation.z = .8; const b = caja(.14, .5, .06, mv, .08, .0, .12, ok); b.rotation.z = -.62; ok.visible = false;
    g.userData = { dots, ok }; return g;
  }
  const escribir = (g, T) => g.userData.dots.children.forEach((d, j) => { d.position.y = .07 * Math.max(0, Math.sin(T * 9 - j * 1.1)); });

  // ───────── NIVEL 1: tres clientes ─────────
  const ZR = .95, ZC = -.7;                                   // el robot va por delante; se detiene antes de cada cliente para no taparlo
  const CX = [4.2, 7.0, 9.8], TONOS = ['#E8457E', '#F08A3C', '#4FB6E0'];
  const cel = CX.map((x, i) => crearCelular(TONOS[i], L1, x, ZC));
  const glob = CX.map((x, i) => crearGlobo('#ffffff', TONOS[i], L1));

  // ───────── NIVEL 2: bloque de menú flotante ─────────
  const MX = 2.6, MY = 3.15, R2 = 4.95, OPC = ['PRODUCTOS', 'HORARIO', 'ASESOR'];
  const bloque = new THREE.Group(); L2.add(bloque);
  caja(3.2, 2.2, .8, plano('#B5720F'), 0, 0, 0, bloque); caja(3.0, 2.0, .84, plano(AMA), 0, 0, 0, bloque);
  [-1, 1].forEach(a => [-1, 1].forEach(b => caja(.14, .14, .88, plano('#8A5208'), a * 1.32, b * .82, 0, bloque)));

  // ───────── NIVEL 3: tienda que cierra, cliente esperando y cartel de horario ─────────
  const TX = .3, C3X = 1.8, R3 = 3.3, KX = 5.1, KZ = -.6;
  const tienda = new THREE.Group(); L3.add(tienda); tienda.position.set(TX, 0, -1.3);
  malla(new THREE.BoxGeometry(2.2, 2.0, 1.0), mat('#EAD9B6', { roughness: .8 }), 0, 1.0, 0, tienda);
  caja(2.36, .14, 1.16, plano('#8E2452'), 0, 2.3, 0, tienda);
  for (let i = 0; i < 5; i++) caja(.46, .36, .5, plano(i % 2 ? '#ffffff' : '#E8457E'), -.92 + i * .46, 2.06, .5, tienda);
  const mVit = plano('#FFD98A'); caja(.84, .7, .04, plano('#6A3216'), -.5, .78, .5, tienda); caja(.72, .58, .04, mVit, -.5, .78, .52, tienda);
  caja(.66, 1.2, .04, plano('#6A3216'), .62, .6, .5, tienda); caja(.1, .1, .06, plano(AMA), .42, .6, .53, tienda);
  const gp = new THREE.BoxGeometry(.66, 1.2, .05); gp.translate(0, -.6, 0);
  const persiana = new THREE.Mesh(gp, plano('#8A93A6')); persiana.position.set(.62, 1.2, .54); tienda.add(persiana);
  const gv = new THREE.BoxGeometry(.72, .58, .05); gv.translate(0, -.29, 0);
  const persiana2 = new THREE.Mesh(gv, plano('#8A93A6')); persiana2.position.set(-.5, 1.07, .54); tienda.add(persiana2);
  const mLet = plano('#16A34A'), letrero = caja(1.9, .44, .06, mLet, 0, 1.6, .56, tienda);
  const cel3 = crearCelular('#8B6FE8', L3, C3X, ZC), glob3 = crearGlobo('#ffffff', '#8B6FE8', L3);
  const cartel = new THREE.Group(); L3.add(cartel); cartel.position.set(KX, 0, KZ);
  [-1.0, 1.0].forEach(x => caja(.16, 1.6, .16, plano('#7C859A'), x, .8, -.04, cartel));
  const mMarco = plano('#4A5268'), mTab = plano('#10152A'), mCara = plano('#59617A');
  caja(2.7, 2.0, .16, mMarco, 0, 2.5, 0, cartel); caja(2.46, 1.76, .04, mTab, 0, 2.5, .09, cartel);
  const bombillos = [-1.1, -.66, -.22, .22, .66, 1.1].map(x => caja(.16, .16, .1, plano('#3A4256'), x, 3.62, 0, cartel));
  const reloj = new THREE.Group(); reloj.position.set(-.7, 2.3, .13); cartel.add(reloj);
  const disco = (r, m, z) => { const o = new THREE.Mesh(new THREE.CircleGeometry(r, 24), m); o.position.z = z; reloj.add(o); return o; };
  disco(.5, plano(TINTA), 0); disco(.42, mCara, .01);
  const mano = (largo, ancho) => { const g = new THREE.Group(); g.position.z = .03; reloj.add(g); caja(ancho, largo, .02, plano(TINTA), 0, largo / 2 - .03, 0, g); return g; };
  const hora = mano(.25, .1), minuto = mano(.36, .08); caja(.12, .12, .03, plano('#D93A4A'), 0, 0, .05, reloj);
  const luna = new THREE.Group(); scene.add(luna);
  luna.add(new THREE.Mesh(new THREE.CircleGeometry(2.2, 22), plano('#FFE9A0', { fog: false })));
  const mMordida = plano('#05071A', { fog: false, toneMapped: false }), mordida = new THREE.Mesh(new THREE.CircleGeometry(1.8, 22), mMordida); mordida.position.set(.95, .6, .2); luna.add(mordida);

  // ───────── NIVEL 4: el puesto del equipo (escritorio y portátil con el panel, sin nadie) y la bandera de meta ─────────
  const R4 = .6, DX = 2.9, FX = 6.45, R4B = 5.2;
  const puesto = new THREE.Group(); L4.add(puesto); puesto.position.set(DX, 0, -.35); puesto.scale.setScalar(1.2);
  malla(new THREE.BoxGeometry(1.8, .78, .85), mat('#C98A4B', { roughness: .8 }), 0, .39, 0, puesto);
  malla(new THREE.BoxGeometry(2.1, .12, 1.0), mat('#F0D9A8', { roughness: .7 }), 0, .84, 0, puesto);
  caja(1.5, .46, .04, plano('#7A4A20'), 0, .4, .44, puesto);
  const portatil = new THREE.Group(); portatil.position.set(.05, .9, .05); portatil.rotation.y = .3; puesto.add(portatil);
  caja(1.5, .07, .8, plano('#C8CED8'), 0, .035, .2, portatil); caja(1.1, .02, .34, plano('#8A93A6'), 0, .075, .16, portatil);
  const tapa = new THREE.Group(); tapa.position.set(0, .06, -.2); tapa.rotation.x = -.14; portatil.add(tapa);
  caja(1.56, 1.04, .07, plano('#F4F6FA'), 0, .52, 0, tapa);
  const mPant = plano('#26304A'), mLado = plano('#3C4A68'), mFila = plano('#55607A'), mNueva = plano(WA);
  caja(1.42, .9, .02, mPant, 0, .53, .04, tapa); caja(.26, .9, .02, mLado, -.58, .53, .05, tapa); caja(1.06, .1, .02, mLado, .15, .9, .05, tapa);
  [.7, .5].forEach(y => { caja(.12, .12, .02, mLado, -.3, y, .05, tapa); caja(.84, .12, .02, mFila, .26, y, .05, tapa); });
  const nueva = new THREE.Group(); nueva.position.set(0, .3, .05); tapa.add(nueva); caja(.12, .12, .02, mNueva, -.3, 0, 0, nueva); caja(.84, .12, .02, mNueva, .26, 0, 0, nueva);
  const bandera = new THREE.Group(); L4.add(bandera); bandera.position.set(FX, 0, -1.0);
  caja(.5, .3, .5, plano('#7C859A'), 0, .15, 0, bandera); caja(.14, 1.7, .14, plano('#F4F6FA'), 0, 1.15, 0, bandera); caja(.28, .28, .28, plano(AMA), 0, 2.1, 0, bandera);
  const tela = caja(1.0, .62, .06, plano(VERDE), .57, .8, 0, bandera);
  const globo = crearGlobo(WA, '#ffffff');

  const robot = k.crearRobot(); robot.scale.setScalar(.7);

  // ───────── Tiempos (todo sale del guion) ─────────
  const tGo = w('n1', 2);                                     // «el robot»: arranca
  const tA = [w('n1', 4), (w('n1', 4) + w('n1', 7)) / 2, w('n1', 7)];   // llega a cada cliente entre «saluda» y «cliente»
  const tMeta = tA[2] + (tA[2] - tA[1]);
  // Cámara: las llaves marcan los cortes de nivel (lo usa revisar_cortes); el seguimiento lateral se calcula en actualizar.
  // Cada nivel cambia cuando la voz dice «Nivel n» (el cuadro de diálogo ya cambió 0,08 s antes).
  const KF = [[0, [0, 2.0, 17.8], [0, 1.0, 0]]];
  ['n2', 'n3', 'n4'].forEach(id => { const t = w(id, 0) - .06; KF.push([t - .01, [9, 2.2, 20], [9, 1.15, 0]], [t, [2, 2.2, 20], [2, 1.15, 0]]); });
  KF.push([total + 1, [4.65, 2.4, 24.1], [4.65, 1.4, 0]]);
  k.setKF(KF); const TC = [KF[2][0], KF[4][0], KF[6][0]];    // cada corte queda justo en un cuadro
  const tMenu = w('n2', 3) - .08;                             // «muestra»: aparece el bloque de menú
  const tPide = w('n2', 8);                                   // «pide»: el robot golpea el bloque desde abajo
  const tCae = w('n2', 10) - .1, tCoge = w('n2', 10) + .14;   // «datos»: la tarjeta cae y el robot la recoge
  const tCierra = w('n3', 4) - .08;                           // «cerraste»: la tienda cierra, oscurece y sale la luna
  const tLuz = w('n3', 6) + .06;                              // «avisa»: enciende el cartel del horario
  const tOk = w('n3', 8);                                     // «horario»: el cliente queda enterado
  const tSale = w('n4', 2) - .05, tLanza = w('n4', 4), tRecibe = w('n4', 7) + .15;   // el globo aparece («pasa»), vuela («chat») y llega («equipo»)
  const tSalto = tRecibe + .28, tLlega = s('fin') + .1;       // salto final hasta la bandera
  const tLogo = w('fin', 0) + .15, tLema = w('fin', 1) - .1, tWeb = w('fin', 4), tTel = w('fin', 6);

  // Camino del robot: tramos [t0, t1, x0, x1, alto] que se recorren de un salto; fuera de los tramos se queda quieto.
  const camino = tr => t => { let x = tr[0][2], y = 0, mov = 0; for (const [a, b, x0, x1, alto = .85] of tr) { if (t >= b) x = x1; else if (t > a) { const u = (t - a) / (b - a); x = lerp(x0, x1, u); y = alto * Math.sin(u * Math.PI); mov = x0 !== x1 ? 1 : 0; } } return { x, y, mov }; };
  const R1X = [0, CX[0] - 1.4, CX[1] - 1.4, CX[2] - 1.4, CX[2] + 1.5], SOBRE = 1.75;   // salta por encima de cada celular: nunca lo tapa
  const paso1 = camino([[tGo, tA[0], R1X[0], R1X[1]], [tA[0], tA[1], R1X[1], R1X[2], SOBRE], [tA[1], tA[2], R1X[2], R1X[3], SOBRE], [tA[2], tMeta, R1X[3], R1X[4], SOBRE]]);
  const cam1 = camino([[tGo, tA[0], R1X[0], R1X[1]], [tA[0], tA[1], R1X[1], R1X[2]], [tA[1], tA[2], R1X[2], R1X[3]], [tA[2], tMeta, R1X[3], CX[2] - .9]]);
  const paso2 = camino([[TC[0], TC[0] + .36, -2.6, -.8], [TC[0] + .36, TC[0] + .72, -.8, .4], [tPide - .52, tPide - .2, .4, MX, .4], [tPide - .2, tPide + .2, MX, MX, .46], [tPide + .2, tCoge - .1, MX, R2, .55]]);
  const paso3 = camino([[TC[1], TC[1] + .34, -2.8, -1.0], [TC[1] + .34, TC[1] + .68, -1.0, 1.1], [TC[1] + .68, TC[1] + 1.02, 1.1, R3], [tLuz - .2, tLuz + .16, R3, R3, .35]]);
  const paso4 = camino([[TC[2], TC[2] + .36, -2.6, -.9], [TC[2] + .36, TC[2] + .72, -.9, R4], [tSalto, tLlega, R4, R4B, 2.3]]);
  const PASOS = [paso1, paso2, paso3, paso4];
  const media = (f, t) => { let a = 0; for (const d of [-.24, -.12, 0, .12, .24]) a += f(t + d).x; return a / 5; };
  const perIntro = s('n1') / 5;                              // cinco saltos en la pantalla de título

  // ───────── Sonidos ─────────
  k.sonar(.05, 'nivel');
  ['n1', 'n2', 'n3', 'n4'].forEach(id => k.sonar(w(id, 0), 'pop'));
  TC.forEach(t => k.sonar(t - .06, 'paso', .5));
  tA.forEach(t => k.sonar(t, 'moneda')); k.sonar(tMeta, 'brillo', .7);
  k.sonar(tMenu, 'sube', .8); [1, 2, 3].forEach(i => k.sonar(tMenu + .18 * i, 'tic', .6)); k.sonar(tPide, 'golpe'); k.sonar(tCoge, 'moneda');
  k.sonar(tCierra, 'golpe', .8); k.sonar(tLuz, 'brillo'); k.sonar(tOk, 'moneda', .8);
  k.sonar(tSale, 'pop', .8); k.sonar(tLanza, 'paso', .5); k.sonar(tRecibe, 'moneda'); k.sonar(tSalto, 'sube', .7);
  k.sonar(tLlega, 'nivel'); k.sonar(tLogo, 'pop', .8); k.sonar(tWeb, 'tic', .7);

  // ───────── Textos ─────────
  const PIX = (t, px, mas = '') => `<div style="font-size:${px}px;line-height:1.3;text-align:center;${mas}">${t}</div>`;
  const TXT = (t, px, color) => `<span style="display:block;font:400 ${px}px/1 'Press Start 2P',monospace;color:${color};text-shadow:5px 5px 0 #0B0B14,-5px 5px 0 #0B0B14,5px -5px 0 #0B0B14,-5px -5px 0 #0B0B14">${t}</span>`;
  // La fuente de 8 px dibuja las vocales con tilde encogidas: se arman con la letra normal y la tilde hecha de dos píxeles encima.
  const TILDE = L => `<span style="position:relative;display:inline-block">${L}<i style="position:absolute;left:.36em;top:-.27em;width:.14em;height:.14em;background:currentColor"></i><i style="position:absolute;left:.5em;top:-.41em;width:.14em;height:.14em;background:currentColor"></i></span>`;
  const CHECK = (c = VERDE) => `<svg viewBox="0 0 7 6" shape-rendering="crispEdges" style="width:1.15em;height:1em;vertical-align:-.12em"><path fill="${c}" d="M6 0h1v2H6zM5 1h1v2H5zM4 2h1v2H4zM3 3h1v2H3zM2 4h1v2H2zM1 3h1v2H1zM0 2h1v2H0z"/></svg>`;
  // Globo de chat en píxeles (HTML), con su colita
  const GLOBO = (t, bg = '#ffffff', col = '#128C4A', px = 32) => `<span style="position:relative;display:block;background:${bg};color:${col};border:6px solid ${TINTA};padding:14px 16px 12px;font:400 ${px}px/1 'Press Start 2P',monospace;text-transform:none;text-shadow:none">` +
    `<i style="position:absolute;left:26px;bottom:-24px;width:18px;height:18px;background:${bg};border:6px solid ${TINTA};border-top:0"></i>${t}</span>`;
  const SIN = (t, px, color, fuente = `400 ${px}px/1.2 'Press Start 2P',monospace`) => `<span style="display:block;font:${fuente};color:${color};text-transform:none;text-shadow:none;text-align:center">${t}</span>`;
  const parpadeo = (T, t0, dur = .32) => (T - t0 < dur && Math.floor((T - t0) / .08) % 2 === 1) ? 0 : 1;
  const P = V(0, 0, 0), A = V(0, 0, 0);

  return {
    actualizar(T) {
      const nv = T < TC[0] ? 1 : T < TC[1] ? 2 : T < TC[2] ? 3 : 4, enTitulo = T < s('n1'), fin = T >= tLlega;
      NIV.forEach((g, i) => { g.visible = nv === i + 1; });
      const osc = nv === 3 ? eio(pr(T, tCierra, .7)) : 0;                       // nivel 3: se hace de noche cerrada
      scene.background.copy(CIELO[nv - 1]).lerp(NOCHE, osc); scene.fog.color.copy(scene.background); scene.fog.near = 30; scene.fog.far = 95;
      amb.intensity = .75 - .3 * osc;

      // ── Robot ──
      const r = PASOS[nv - 1](T);
      let ry = r.y, saludo = 0, brazos = 0, sorpresa = 0, gira = r.mov ? .75 : .2;
      if (enTitulo) { ry = .8 * Math.abs(Math.sin(Math.PI * T / perIntro)); saludo = 1; sorpresa = .4; }
      else if (nv === 1) { tA.forEach(t => { saludo = Math.max(saludo, ventana(T, t - .14, t + .2, .07)); }); if (T > tMeta) { brazos = 1; ry = .45 * Math.abs(Math.sin(Math.PI * (T - tMeta) / .3)); } }
      else if (nv === 2) { sorpresa = .6 * ventana(T, tMenu, tPide - .5, .15); brazos = Math.max(ventana(T, tPide - .12, tPide + .14, .07), pr(T, tCoge, .12)); }
      else if (nv === 3) { const mira = ventana(T, tCierra - .05, tLuz - .3, .15); sorpresa = .7 * mira; if (!r.mov) gira = lerp(.2, -.75, mira); saludo = ventana(T, tLuz - .2, tLuz + .55, .1); brazos = .9 * pr(T, tOk, .15); }
      else { saludo = Math.max(ventana(T, tSale, tLanza, .12), pr(T, tLlega + 1.5, .3)); brazos = Math.max(.8 * ventana(T, tLanza - .12, tLanza + .3, .1), ventana(T, tRecibe + .05, tSalto, .08), ventana(T, tLlega, tLlega + 1.4, .15)); }
      robot.animar(T, P.set(r.x, .5 + ry, ZR), saludo, { brazos, sorpresa, habla: k.boca(T, 'locutora') });
      robot.rotation.y = gira; robot.rotation.z = r.mov ? -.1 : 0;

      // ── Cámara de lado: acompaña al robot y nunca queda quieta ──
      let cx, d;
      if (nv === 1) { const u1 = eio(pr(T, s('n1'), .7)); d = lerp(lerp(17.8, 17, T / s('n1')), 20, u1) - .5 * pr(T, tMeta, TC[0] - tMeta); cx = media(cam1, T) + 1.5 * u1; }
      else if (nv === 2) { d = 20 - .6 * pr(T, TC[0], TC[1] - TC[0]); cx = lerp(1.3, 2.8, eio(pr(T, TC[0], 1.2))) + .75 * eio(pr(T, tPide, .9)); }
      else if (nv === 3) { const u = eio(pr(T, tLuz - .4, .9));   // al encender el cartel la cámara se acerca a él
        d = lerp(21.6 - .4 * pr(T, TC[1], tLuz - TC[1]), 16.9 - .5 * pr(T, tLuz, TC[2] - tLuz), u); cx = lerp(lerp(1.7, 2.8, eio(pr(T, TC[1], 1.0))), 4.0, u); }
      else { const u = eio(pr(T, tSalto, 1.2)); d = lerp(20 - .4 * pr(T, TC[2], tSalto - TC[2]), 24.6 - .5 * pr(T, tLlega, total - tLlega), u); cx = lerp(lerp(1.6, 2.2, eio(pr(T, TC[2], 1.1))), 4.65, u); }
      const my = 168 * d / 2955;
      cam.position.set(cx, my + 1.0, d); cam.lookAt(cx, my, 0); cam.updateMatrixWorld();
      NIV[nv - 1].userData.estrellas.forEach((e, i) => { e.scale.setScalar((.6 + .4 * Math.abs(Math.sin(T * 1.7 + i * 1.3))) * (nv === 3 ? .2 + .8 * osc : 1)); });

      // ── NIVEL 1: los clientes esperan con «…» y el robot los saluda uno por uno ──
      let cuenta = nv > 1 ? 3 : 0;
      if (nv === 1) CX.forEach((x, i) => {
        const hecho = T >= tA[i]; if (hecho) cuenta++;
        animarCelular(cel[i], T, tA[i], i);
        const g = glob[i]; g.visible = !hecho; g.position.set(x + .12, 2.2 + .06 * Math.sin(T * 5 + i * 2), ZC); escribir(g, T + i * .3);
        k.dato('hola' + i, GLOBO('¡Hola!'), { ancla: A.set(x + .2, 2.36, ZC), clase: 'titular' }, hecho ? pr(T, tA[i], .14) : 0);
        k.dato('mas' + i, TXT('+1', 44, AMA), { ancla: A.set(x, 3.3, ZC), dy: -70 * eo(pr(T, tA[i], .7)), clase: 'titular' }, ventana(T, tA[i], tA[i] + .7, .08));
      });

      // ── NIVEL 2: el bloque de menú aparece, el robot lo golpea desde abajo y sale la tarjeta de datos ──
      if (nv === 2) {
        const bump = .26 * Math.sin(Math.PI * pr(T, tPide - .03, .22));
        bloque.visible = T >= tMenu; bloque.position.set(MX, MY + bump, ZR); bloque.scale.setScalar(Math.max(.01, eob(pr(T, tMenu, .25))));
        const filas = OPC.map((t, i) => `<div style="font-size:28px;margin-top:14px;opacity:${T >= tMenu + .18 * (i + 1) ? 1 : 0}"><b>${i + 1}</b> ${t}</div>`).join('');
        k.dato('menu', `<div style="width:336px"><div style="font-size:30px;text-align:center;color:${AMA}">MEN${TILDE('U')}</div>${filas}</div>`, { ancla: A.set(MX, MY + bump, ZR + .42), clase: 'pix' }, T >= tMenu + .1 ? 1 : 0);
        const us = eo(pr(T, tPide, .3)), uc = cl((T - tCae) / (tCoge - tCae));
        A.set(lerp(lerp(MX, MX + .25, us), R2 + .05, eo(uc)), lerp(lerp(MY + 1.1, MY + 1.52, us), 1.6, uc * uc) + (uc <= 0 ? .05 * Math.sin(T * 7) : 0), ZR);
        k.dato('datos', `DATOS ${CHECK()}`, { ancla: A, clase: 'pix', escala: lerp(.5, 1, us) * (1 - .7 * pr(T, tCoge - .04, .1)) }, T >= tPide && T < tCoge + .06 ? 1 : 0);
        k.dato('mas2', TXT('+1', 44, AMA), { ancla: A.set(R2, 2.5, ZR), dy: -70 * eo(pr(T, tCoge, .7)), clase: 'titular' }, ventana(T, tCoge, tCoge + .7, .08));
      }

      // ── NIVEL 3: la tienda cierra, oscurece, sale la luna y el robot enciende el cartel con el horario ──
      luna.visible = nv === 3 && T >= tCierra;
      if (nv === 3) {
        const cerrado = T >= tCierra, giro = pr(T, tCierra, .24), cara = Math.abs(Math.cos(Math.PI * giro));
        mVit.color.set(cerrado ? '#1B2440' : '#FFD98A');
        persiana.scale.y = persiana2.scale.y = Math.max(.001, eo(pr(T, tCierra + .05, .3))); persiana.visible = persiana2.visible = cerrado;
        letrero.scale.y = Math.max(.06, cara); mLet.color.set(giro > .5 ? '#D93A4A' : '#16A34A');
        A.set(TX, 1.6, -1.3 + .56);
        k.dato('abierto', SIN('ABIERTO', 26, '#ffffff'), { ancla: A, clase: 'titular' }, giro < .3 ? 1 : 0);
        k.dato('cerrado', SIN('CERRADO', 26, '#ffffff'), { ancla: A, clase: 'titular' }, giro > .7 ? 1 : 0);
        L3.userData.ciudad.userData.edificios.forEach(b => { b.material[0].emissiveIntensity = lerp(.9, .3, osc); });
        luna.position.set(cx - 5.7, lerp(1.5, 10.6, eo(pr(T, tCierra, .9))) + .15 * Math.sin(T * 1.3), -58); mMordida.color.copy(scene.background);
        // cliente que escribió con la tienda cerrada
        animarCelular(cel3, T, tOk, 1);
        glob3.position.set(C3X + .12, 2.2 + .06 * Math.sin(T * 5), ZC); escribir(glob3, T);
        glob3.userData.dots.visible = T < tOk; glob3.userData.ok.visible = T >= tOk; glob3.scale.setScalar(T >= tOk ? .8 + .35 * eob(pr(T, tOk, .28)) : 1);
        // cartel: apagado hasta que el robot lo enciende; el reloj recorre de la hora de abrir a la de cerrar
        const luz = T >= tLuz && parpadeo(T, tLuz, .36) ? 1 : 0;
        mMarco.color.set(luz ? AMA : '#4A5268'); mTab.color.set(luz ? '#17204C' : '#10152A'); mCara.color.set(luz ? '#ffffff' : '#59617A');
        bombillos.forEach((b, i) => b.material.color.set(luz ? ((Math.floor(T * 6) + i) % 2 ? '#FFF6C8' : '#FF9F1C') : '#3A4256'));
        const ur = eio(pr(T, tLuz, .9)), h = lerp(8, 18, ur);
        hora.rotation.z = -(h % 12) / 12 * Math.PI * 2; minuto.rotation.z = -ur * Math.PI * 4;
        cartel.scale.y = 1 + .04 * ventana(T, tLuz, tLuz + .25, .1);
        k.dato('horT', SIN('HORARIO', 30, AMA), { ancla: A.set(KX, 3.16, KZ + .1), clase: 'titular' }, luz);
        k.dato('horH', SIN('8:00 a. m. –<br>6:00 p. m.', 44, '#ffffff', `700 44px/1.2 'Pixelify Sans',monospace`), { ancla: A.set(KX + .54, 2.28, KZ + .1), clase: 'titular' }, luz);
      }

      // ── NIVEL 4: el globo de chat sale del robot, vuela en arco y entra al portátil del equipo; salto a la bandera ──
      const uv = cl((T - tLanza) / (tRecibe - tLanza)), sale = eob(pr(T, tSale, .22)), entra = 1 - pr(T, tRecibe, .12);
      globo.visible = nv === 4 && T >= tSale && entra > 0;
      if (nv === 4) {
        globo.position.set(lerp(R4, DX + .15, uv), lerp(2.75, 1.8, uv) + 1.3 * Math.sin(uv * Math.PI) + (uv <= 0 ? .06 * Math.sin(T * 6) : 0), lerp(ZR, .1, uv));
        globo.scale.setScalar(Math.max(.01, sale * entra * lerp(1, .7, uv))); globo.rotation.z = Math.sin(uv * Math.PI) * -.35; escribir(globo, T);
        const luz = T >= tRecibe, flash = luz && T - tRecibe < .45 && Math.floor((T - tRecibe) / .09) % 2 === 0;
        mPant.color.set(luz ? (flash ? '#C9FFD8' : '#F4F6FA') : '#26304A'); mLado.color.set(luz ? PRIM : '#3C4A68'); mFila.color.set(luz ? '#B9C2D0' : '#55607A');
        nueva.visible = luz; nueva.scale.x = luz ? .6 + .4 * eob(pr(T, tRecibe, .25)) : 1; mNueva.color.set(luz && Math.floor(T * 5) % 4 === 0 ? '#7BE06A' : WA);
        puesto.scale.y = 1.2 * (1 + .05 * ventana(T, tRecibe, tRecibe + .25, .1));
        k.dato('equipo', SIN('EQUIPO', 26, '#FFE9C4'), { ancla: A.set(DX, .48, .18), clase: 'titular' }, 1);
        k.dato('mas4', TXT('+1', 44, AMA), { ancla: A.set(DX + .1, 2.6, 0), dy: -70 * eo(pr(T, tRecibe, .7)), clase: 'titular' }, ventana(T, tRecibe, tRecibe + .7, .08));
        const sube = eo(pr(T, tLlega, .5));
        tela.position.y = lerp(.7, 1.62, sube) + .03 * Math.sin(T * 7); tela.scale.x = 1 + .08 * Math.sin(T * 9);
      }

      // ── Rótulos ──
      k.dato('titulo', PIX('WHATSAPP:<br><b>EL JUEGO</b>', 70), { x: X, y: 410, clase: 'pix' }, enTitulo ? 1 : 0);
      k.dato('start', TXT('PULSA START', 38, '#ffffff'), { x: X, y: 612, clase: 'titular' }, enTitulo && (T % .5) < .34 ? 1 : 0);
      // Marcador fijo
      const hud = !enTitulo && !fin ? 1 : 0;
      k.dato('hudN', `NIVEL <b>${nv}</b>`, { x: 172, y: 296, clase: 'pix' }, hud);
      k.dato('hudC', `CLIENTES <b>00${cuenta}</b>`, { x: 838, y: 296, clase: 'pix' }, hud);
      k.dato('hudD', `DATOS ${CHECK()}`, { x: 472, y: 296, clase: 'pix' }, hud && (nv > 2 || (nv === 2 && T >= tCoge)) ? (nv === 2 ? parpadeo(T, tCoge) : 1) : 0);
      // Rótulo de cada nivel
      [['n1', tGo + .12], ['n2', tMenu - .04], ['n3', w('n3', 2) - .05], ['n4', tSale - .02]].forEach(([id, hasta], i) => {
        k.dato(id, PIX(`NIVEL <b>${i + 1}</b>`, 66), { x: X, y: 480, clase: 'pix' }, T >= w(id, 0) && T < hasta ? parpadeo(T, w(id, 0)) : 0); });
      // Cierre
      k.dato('superado', PIX('NIVEL <b>SUPERADO</b>', 44, 'padding-top:10px'), { x: X, y: 280, clase: 'pix' }, fin ? parpadeo(T, tLlega) : 0);
      k.confeti(T, tLlega, { y: .2 });
      const op = (t0, d = .3) => cl(pr(T, t0, d)).toFixed(2);
      k.dato('cierre', `<img src="${MARCA.logo}" style="width:240px;display:block;margin:0 auto 8px">` +
        `<div class="d-tit" style="text-align:center;color:#0E1620;font-size:46px;opacity:${op(tLema)}">Lleva tu atención<br>al <b style="color:${PRIM}">siguiente nivel</b></div>` +
        k.boton(WEB, '', pr(T, tWeb, .3)) + `<div class="d-sub" style="text-align:center;color:#2E3A48;opacity:${op(tTel)};margin-top:14px">${TEL}</div>`,
        { x: X, y: 585, w: 760, clase: 'claro' }, pr(T, tLogo, .25));
    },
  };
}
