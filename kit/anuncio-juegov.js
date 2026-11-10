// Formato «videojuego» (vertical): el tema se cuenta como un juego retro de plataformas.
// Pantalla de título → NIVEL 1 (el robot recoge clientes) → NIVEL 2 (pasa el chat al equipo) → MISIÓN CUMPLIDA.
// Vista lateral, píxeles gordos, marcador arriba y el texto de la voz en el cuadro de diálogo del motor.
export default function (k) {
  const { THREE, scene, cam, s, w, cl, lerp, eio, eo, eob, pr, ventana, V, MARCA, W, mat, malla, RoundedBoxGeometry } = k;
  const total = k.TL.total, PRIM = MARCA.colores.primario, AMA = '#FFC83D', X = W / 2;
  k.pixelar(5);

  // El piso del kit taparía el frente de la plataforma: se apaga y cada nivel trae su propio suelo lejano.
  scene.children.forEach(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 300) o.visible = false; });
  scene.add(new THREE.AmbientLight('#ffffff', .75));
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
    g.userData = { estrellas }; return g;
  }
  const L1 = crearNivel({ pasto: '#46D678', pasto2: '#1F9A4C', ladrillo: '#A4552E', linea: '#6A3216', luz: '#C87440', suelo: '#0F1648',
    ciudad: { semilla: 4, color: '#1B2468' }, medio: [[-7, 5, 1.6, '#1C5E50'], [-1.5, 3.4, 2.4, '#1C5E50'], [5.5, 6, 1.4, '#1C5E50'], [12, 3.6, 2.6, '#1C5E50'], [18, 5, 1.7, '#1C5E50']] });
  const L2 = crearNivel({ pasto: '#52C4F0', pasto2: '#2687C4', ladrillo: '#3A3F9A', linea: '#1E2163', luz: '#5960C8', suelo: '#35105A',
    ciudad: { semilla: 9, color: '#5A2190', alto: [5, 15], encendidas: .6 }, medio: [[-6, 3, 3.2, '#7A2D9E'], [-1, 4, 1.8, '#7A2D9E'], [6.5, 3.4, 3.6, '#7A2D9E'], [11, 4.6, 2.2, '#7A2D9E']] });
  const CIELO1 = new THREE.Color('#18206A'), CIELO2 = new THREE.Color('#5B1F86');
  const luna = new THREE.Mesh(new THREE.CircleGeometry(2.1, 20), plano('#FFE9A0', { fog: false })); scene.add(luna);

  // ───────── Aviso sobre cada cliente: «!» que pasa a «✓» ─────────
  function crearAviso() {
    const g = new THREE.Group(); scene.add(g);
    caja(.82, .92, .06, plano('#ffffff'), 0, 0, 0, g); caja(.66, .76, .06, plano('#0B0B14'), 0, 0, .02, g);
    const excl = new THREE.Group(), ok = new THREE.Group(); g.add(excl, ok);
    const ma = plano(AMA), mv = plano('#4ADE80');
    caja(.17, .36, .06, ma, 0, .1, .05, excl); caja(.17, .15, .06, ma, 0, -.24, .05, excl);
    const a = caja(.15, .3, .06, mv, -.15, -.1, .05, ok); a.rotation.z = .8; const b = caja(.15, .52, .06, mv, .09, .0, .05, ok); b.rotation.z = -.62;
    g.userData = { excl, ok }; return g;
  }
  // ───────── Bandera de fin de nivel ─────────
  const bandera = new THREE.Group(); L1.add(bandera); bandera.position.set(12.6, 0, -1.2);
  caja(.14, 3.0, .14, plano('#F4F6FA'), 0, 1.5, 0, bandera); caja(.36, .36, .36, plano(AMA), 0, 3.1, 0, bandera);
  const tela = caja(1.0, .62, .06, plano('#4ADE80'), .57, 2.55, 0, bandera);

  // ───────── Globo de chat (lo que el robot le pasa al equipo) ─────────
  function crearGlobo(color, puntos = '#ffffff') {
    const g = new THREE.Group(); scene.add(g);
    g.add(new THREE.Mesh(new RoundedBoxGeometry(1.05, .68, .2, 3, .16), plano(color)));
    const cola = caja(.26, .26, .18, plano(color), -.3, -.34, 0, g); cola.rotation.z = Math.PI / 4;
    [-.28, 0, .28].forEach(x => caja(.15, .15, .06, plano(puntos), x, 0, .11, g));
    return g;
  }
  const globo = crearGlobo('#25D366'), resp = [crearGlobo('#ffffff', '#25D366'), crearGlobo('#ffffff', '#25D366')];
  resp.forEach(r => r.scale.setScalar(0));

  // ───────── Puesto del equipo: escritorio, portátil sencillo y una persona con diadema ─────────
  const DESK = 3.3, PERS = 4.4;
  const puesto = new THREE.Group(); L2.add(puesto); puesto.position.set(DESK, 0, -.35);
  malla(new THREE.BoxGeometry(1.25, .78, .8), mat('#C98A4B', { roughness: .8 }), 0, .39, 0, puesto);
  malla(new THREE.BoxGeometry(1.5, .12, .95), mat('#F0D9A8', { roughness: .7 }), 0, .84, 0, puesto);
  const portatil = new THREE.Group(); portatil.position.set(0, .9, .02); portatil.rotation.y = .38; puesto.add(portatil);
  caja(.98, .06, .56, plano('#C8CED8'), 0, .03, .1, portatil);
  const tapa = new THREE.Group(); tapa.position.set(0, .05, -.18); tapa.rotation.x = -.16; portatil.add(tapa);
  caja(1.0, .7, .06, plano('#F4F6FA'), 0, .35, 0, tapa);
  const mPant = plano('#1B2233'), pant = caja(.86, .56, .02, mPant, 0, .36, .035, tapa);
  const filas = [[-.14, .15, .5], [.12, 0, .56], [-.2, -.15, .38]].map(([x, y, a]) => caja(a, .09, .02, plano('#ffffff'), x, .36 + y, .05, tapa));
  const equipo = k.crearPersonaje({ camisa: PRIM, pelo: '#3A2418' }); equipo.scale.setScalar(.54);
  { const cab = equipo.userData.cab, md = plano('#F4F6FA');
    const aro = new THREE.Mesh(new THREE.TorusGeometry(.63, .09, 6, 16, Math.PI), md); cab.add(aro);
    [-1, 1].forEach(sg => { const o = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .2, 10), md); o.rotation.z = Math.PI / 2; o.position.set(.64 * sg, -.04, 0); cab.add(o); });
    const mic = caja(.09, .09, .5, plano('#F4F6FA'), .6, -.3, .26, cab); mic.rotation.x = .2; }

  // ───────── Clientes del nivel 1 y el robot ─────────
  const ZR = .95, ZC = -.7;                                   // el robot va por delante; se detiene antes de cada cliente para no taparlo
  const CX = [3.6, 6.4, 9.2], CAMISAS = ['#E8457E', '#F08A3C', '#4FB6E0'], PELOS = ['#2A1B14', '#6B3A1E', '#15161C'];
  const clientes = CX.map((x, i) => { const p = k.crearPersonaje({ camisa: CAMISAS[i], pelo: PELOS[i], piel: i === 1 ? '#C98F6B' : '#E6B48F' }); p.scale.setScalar(.5); return p; });
  const avisos = CX.map(() => crearAviso());
  const robot = k.crearRobot(); robot.scale.setScalar(.7);

  // ───────── Tiempos (todo sale del guion) ─────────
  const tGo = w('n1', 2);                                     // «el robot»: arranca
  const tA = [w('n1', 4), (w('n1', 4) + w('n1', 8)) / 2, w('n1', 8)];   // llega a cada cliente entre «saluda» y «datos»
  const tMeta = tA[2] + (tA[2] - tA[1]);                     // llega a la bandera
  const tCorte = w('n2', 0) - .03;                           // el nivel cambia cuando la voz dice «Nivel 2» (y el cuadro de diálogo ya cambió)
  // Cámara: las llaves marcan el corte de nivel (lo usa revisar_cortes); el seguimiento lateral se calcula en actualizar.
  const KF = [[0, [0, 2.0, 17.8], [0, 1.0, 0]], [tCorte - .01, [12.3, 2.2, 20], [12.3, 1.15, 0]], [tCorte, [2.0, 2.2, 20], [2.0, 1.15, 0]], [total + 1, [2.75, 2.0, 17.4], [2.75, 1.0, 0]]];
  k.setKF(KF); const TC = KF[2][0];                          // el corte queda justo en un cuadro
  const tPara = w('n2', 2);                                  // «pasa»: el robot ya llegó
  const tSale = w('n2', 3) - .05, tLanza = w('n2', 5), tRecibe = w('n2', 7) + .2;   // el globo aparece, vuela y llega
  const tFin = w('fin', 6);                                  // «panel»: misión cumplida
  const tLogo = k.SC.fin.vozFin - .25;

  // Camino del robot: tramos [t0, t1, x0, x1] que se recorren de un salto; fuera de los tramos se queda quieto.
  const camino = tr => t => { let x = tr[0][2], y = 0, mov = 0; for (const [a, b, x0, x1, alto = .85] of tr) { if (t >= b) x = x1; else if (t > a) { const u = (t - a) / (b - a); x = lerp(x0, x1, u); y = alto * Math.sin(u * Math.PI); mov = 1; } } return { x, y, mov }; };
  const R1X = [0, CX[0] - 1.4, CX[1] - 1.4, CX[2] - 1.4, 11.2];
  const paso1 = camino([[tGo, tA[0], R1X[0], R1X[1]], [tA[0], tA[1], R1X[1], R1X[2]], [tA[1], tA[2], R1X[2], R1X[3]], [tA[2], tMeta, R1X[3], R1X[4], 1.1]]);
  const paso2 = camino([[TC, (TC + tPara) / 2, -2.2, -.6], [(TC + tPara) / 2, tPara, -.6, 1.0]]);
  const media = (f, t) => { let a = 0; for (const d of [-.24, -.12, 0, .12, .24]) a += f(t + d).x; return a / 5; };
  const perIntro = s('n1') / 5;                              // cinco saltos en la pantalla de título

  // ───────── Sonidos ─────────
  k.sonar(.05, 'nivel'); k.sonar(w('n1', 0), 'pop');
  tA.forEach(t => k.sonar(t, 'moneda')); k.sonar(tMeta, 'brillo', .8);
  k.sonar(TC - .06, 'paso', .5); k.sonar(w('n2', 0), 'pop');
  k.sonar(tSale, 'pop', .8); k.sonar(tLanza, 'paso', .5); k.sonar(tRecibe, 'moneda');
  k.sonar(w('fin', 3), 'tic', .8); k.sonar(w('fin', 4) + .12, 'tic', .8);
  k.sonar(tFin, 'nivel'); k.sonar(tLogo, 'pop', .8);

  const PIX = (t, px, mas = '') => `<div style="font-size:${px}px;line-height:1.3;text-align:center;${mas}">${t}</div>`;
  const TXT = (t, px, color) => `<span style="display:block;font:400 ${px}px/1 'Press Start 2P',monospace;color:${color};text-shadow:5px 5px 0 #0B0B14,-5px 5px 0 #0B0B14,5px -5px 0 #0B0B14,-5px -5px 0 #0B0B14">${t}</span>`;
  // La fuente de 8 px dibuja la «Ó» encogida: se arma con una O normal y la tilde hecha de dos píxeles encima.
  const O_TILDE = '<span style="position:relative;display:inline-block">O<i style="position:absolute;left:.36em;top:-.27em;width:.14em;height:.14em;background:currentColor"></i><i style="position:absolute;left:.5em;top:-.41em;width:.14em;height:.14em;background:currentColor"></i></span>';
  const parpadeo = (T, t0, dur = .32) => (T - t0 < dur && Math.floor((T - t0) / .08) % 2 === 1) ? 0 : 1;
  const P = V(0, 0, 0);

  return {
    actualizar(T) {
      const n2 = T >= TC, fin = pr(T, tFin, .25), uFin = eio(pr(T, s('fin'), 1.3));
      L1.visible = !n2; L2.visible = n2; clientes.forEach(p => { p.visible = !n2; }); avisos.forEach(a => { a.visible = !n2; }); equipo.visible = n2;
      scene.background.copy(n2 ? CIELO2 : CIELO1); scene.fog.color.copy(scene.background); scene.fog.near = 30; scene.fog.far = 95;

      // Robot
      const r = n2 ? paso2(T) : paso1(T);
      const enTitulo = T < s('n1'), meta = !n2 && T > tMeta;
      let ry = r.y;
      if (enTitulo) ry = .8 * Math.abs(Math.sin(Math.PI * T / perIntro));
      if (meta) ry = .5 * Math.abs(Math.sin(Math.PI * (T - tMeta) / .3));
      const lanza = ventana(T, tLanza - .12, tLanza + .3, .1);
      robot.animar(T, P.set(r.x, .5 + ry, n2 ? .7 : ZR), enTitulo ? 1 : ventana(T, tSale, tLanza, .12), { brazos: Math.max(meta ? 1 : 0, fin, lanza * .8), sorpresa: enTitulo ? .4 : 0 });
      robot.rotation.y = r.mov ? .75 : (n2 ? .45 : .2); robot.rotation.z = r.mov ? -.1 : 0;

      // Cámara de lado: sigue al robot un poco adelantada, y nunca queda quieta
      const u1 = eio(pr(T, s('n1'), .7));
      let cx, d;
      if (!n2) { d = lerp(lerp(17.8, 17, T / s('n1')), 20, u1); cx = media(paso1, T) + 1.5 * u1; }
      else { d = lerp(20 - .5 * pr(T, TC, s('fin') - TC), 17.9 - .5 * pr(T, s('fin'), total - s('fin')), uFin); cx = lerp(lerp(2.0, 2.5, eio(pr(T, TC, tPara - TC))), 2.75, uFin); }   // en el nivel 2 el robot entra a un plano que ya muestra el puesto del equipo
      const my = 168 * d / 2955;
      cam.position.set(cx, my + 1.0, d); cam.lookAt(cx, my, 0); cam.updateMatrixWorld();
      luna.position.set(cx + (n2 ? -4.5 : 2.5), 19.4, -58);
      (n2 ? L2 : L1).userData.estrellas.forEach((e, i) => { e.scale.setScalar(.6 + .4 * Math.abs(Math.sin(T * 1.7 + i * 1.3))); });
      tela.scale.x = 1 + .08 * Math.sin(T * 9); tela.position.y = 2.55 + .03 * Math.sin(T * 7);

      // Clientes: esperan con «!» y al llegar el robot pasan a «✓»
      let cuenta = 0;
      CX.forEach((x, i) => {
        const hecho = T >= tA[i], f = ventana(T, tA[i], tA[i] + .75, .12); if (hecho) cuenta++;
        clientes[i].animar(T + i * .7, P.set(x, 0, ZC), { gira: -.75, preocupado: hecho ? 0 : .7, feliz: hecho ? 1 : 0, brazos: f });
        const a = avisos[i]; a.userData.excl.visible = !hecho; a.userData.ok.visible = hecho;
        a.position.set(x, 2.7 + .07 * Math.sin(T * 5 + i * 2), ZC); a.scale.setScalar(hecho ? .7 + .4 * eob(pr(T, tA[i], .28)) : 1 + .06 * Math.sin(T * 10 + i));
        k.dato('mas' + i, TXT('+1', 44, AMA), { ancla: V(x, 3.7, ZC), dy: -70 * eo(pr(T, tA[i], .7)), clase: 'titular' }, n2 ? 0 : ventana(T, tA[i], tA[i] + .7, .08));
      });

      // Nivel 2: el globo de chat sale del robot, vuela en arco y entra al portátil; el equipo sigue desde ahí
      const uv = cl((T - tLanza) / (tRecibe - tLanza)), sale = eob(pr(T, tSale, .22)), entra = 1 - pr(T, tRecibe, .12);
      globo.visible = n2 && T >= tSale && entra > 0;
      globo.position.set(lerp(1.0, DESK + .1, uv), lerp(2.75, 1.45, uv) + 1.25 * Math.sin(uv * Math.PI) + (uv <= 0 ? .06 * Math.sin(T * 6) : 0), lerp(.7, .1, uv));
      globo.scale.setScalar(sale * entra * lerp(1, .7, uv)); globo.rotation.z = Math.sin(uv * Math.PI) * -.35;
      const luz = pr(T, tRecibe, .15);
      mPant.color.set(luz > 0 ? (Math.floor(T * 4) % 6 === 0 ? '#B8FFAE' : '#7BE06A') : '#1B2233');
      filas.forEach((f, i) => { f.visible = n2 && T >= tRecibe + .15 + i * .22; });
      puesto.scale.y = 1 + .05 * ventana(T, tRecibe, tRecibe + .25, .1);
      [w('fin', 3), w('fin', 4) + .12].forEach((t0, i) => { const u = pr(T, t0, .8), g = resp[i]; g.visible = n2 && u > 0 && u < 1;
        g.position.set(DESK - .3 - .5 * u - i * .25, 2.0 + 1.0 * eo(u), .3); g.scale.setScalar(.62 * eob(cl(u * 5)) * cl((1 - u) * 5)); });
      const recibe = ventana(T, tRecibe, tRecibe + .6, .12);
      equipo.animar(T, P.set(PERS, 0, -.6), { gira: -.85, feliz: luz, sorpresa: .6 * recibe, brazos: Math.max(recibe * .0, fin), senala: n2 && !fin ? .5 * ventana(T, w('fin', 3) - .1, tFin, .2) : 0 });

      // ── Rótulos ──
      // Pantalla de título
      k.dato('titulo', PIX('WHATSAPP:<br><b>EL JUEGO</b>', 70), { x: X, y: 410, clase: 'pix' }, enTitulo ? 1 : 0);
      k.dato('start', TXT('PULSA START', 38, '#ffffff'), { x: X, y: 612, clase: 'titular' }, enTitulo && (T % .5) < .34 ? 1 : 0);
      // Marcador
      const hud = !enTitulo ? 1 : 0;
      k.dato('hudN', `NIVEL <b>${n2 ? 2 : 1}</b>`, { x: 172, y: 296, clase: 'pix' }, hud);
      k.dato('hudC', `CLIENTES <b>00${cuenta}</b>`, { x: 838, y: 296, clase: 'pix' }, hud);
      // Rótulos de nivel
      k.dato('n1', PIX('NIVEL <b>1</b>', 66), { x: X, y: 540, clase: 'pix' }, T >= w('n1', 0) && T < tGo + .12 ? parpadeo(T, w('n1', 0)) : 0);
      k.dato('n2', PIX('NIVEL <b>2</b>', 66), { x: X, y: 540, clase: 'pix' }, T >= w('n2', 0) && T < tPara + .1 ? parpadeo(T, w('n2', 0)) : 0);
      // Cierre
      k.dato('mision', PIX(`MISI${O_TILDE}N <b>CUMPLIDA</b>`, 46, 'padding-top:14px'), { x: X, y: 448, clase: 'pix' }, T >= tFin ? parpadeo(T, tFin) : 0);
      k.dato('logo', `<img src="${MARCA.logo}" style="width:300px;display:block;margin:-18px auto">`, { x: X, y: 650, clase: 'claro' }, pr(T, tLogo, .25));
    },
  };
}
