export default function (k) {
  const { THREE, scene, s, e, c, cl, lerp, eio, eo, eob, pr, ventana, V, mat, malla, RoundedBoxGeometry, mostrar } = k;
  const total = k.TL.total;

  const mesa = new THREE.Group(); scene.add(mesa);
  malla(new RoundedBoxGeometry(5.5, .14, 3.9, 3, .06), mat('#E1E8F0'), 0, 1.0, -.3, mesa);
  [[-2.5, -2], [2.5, -2], [-2.5, 1.4], [2.5, 1.4]].forEach(([x, z]) => malla(new THREE.CylinderGeometry(.07, .07, 1.0, 12), mat('#B9C3CF'), x, .5, z, mesa));
  const panel = k.crearPanelUI();
  Object.assign(panel.conf, { modo: 'bandeja', empresa: 'Tu negocio', seccion: 'Chats', menuActivo: 'CHATS' });
  const portatil = k.crearPortatil(panel); portatil.position.set(0, 1.07, -.1); mesa.add(portatil);

  const chat = k.crearChat();
  Object.assign(chat.conf, { nombre: 'Tu negocio', estado: 'en línea', hora: '9:41', inicial: 'T', avatar: '#5BB04B' });
  const tel = k.crearTelefono(chat);
  const robot = k.crearRobot();

  const operador = k.crearPersona('#5BB04B'); operador.userData.brazos.forEach(b => { b.rotation.x = -.5; });
  const movil = k.crearPersona('#3D7DD9', '#B9825F', '#1A1210');
  const celu = malla(new RoundedBoxGeometry(.32, .58, .05, 3, .05), mat('#1A2030'), 0, 1.62, .62, movil);
  malla(new THREE.PlaneGeometry(.26, .5), new THREE.MeshBasicMaterial({ color: '#D9FDD3', toneMapped: false }), 0, 0, .03, celu); celu.rotation.x = -.35;
  movil.userData.brazos.forEach(b => { b.rotation.x = -1.35; });

  const tipos = ['whatsapp', 'instagram', 'messenger', 'telegram'];
  const NOMBRE = { whatsapp: 'WhatsApp', instagram: 'Instagram', messenger: 'Messenger', telegram: 'Telegram' };
  const canales = tipos.map(t => k.crearCanal(t, .72));
  const ARRIBA = [V(-1.55, 6.9, -1), V(1.55, 6.9, -1), V(-1.55, 4.2, -1), V(1.55, 4.2, -1)];
  const LADOS = [V(-2.45, 4.95, -.8), V(-.95, 5.75, -1.2), V(.95, 5.75, -1.2), V(2.45, 4.95, -.8)];
  const destino = V(0, 2.75, -2.0);
  const tubos = LADOS.map((p, i) => { const m = V((p.x + destino.x) / 2, Math.max(p.y, destino.y) + .9, (p.z + destino.z) / 2);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(p, m, destino), 60, .055, 8, false), k.brillo(k.COLOR_CANAL[tipos[i]], .9)); scene.add(mesh); return mesh; });
  const dibujarTubo = (m, u) => m.geometry.setDrawRange(0, Math.floor(m.geometry.index.count * cl(u) / 6) * 6);

  const NB = 44, burb = new THREE.InstancedMesh(new RoundedBoxGeometry(.5, .36, .14, 3, .1), mat('#ffffff', { roughness: .4 }), NB);
  burb.castShadow = true; scene.add(burb); const tmp = new THREE.Object3D(), col = new THREE.Color();
  const B = []; for (let i = 0; i < NB; i++) { const ch = i % 4, ronda = Math.floor(i / 4);
    B.push({ ch, t0: ronda < 4 ? c('gancho', 2 + ch) + ronda * .22 : c('gancho', 6) + (i - 16) * .06,
      dest: V((k.azar() - .5) * 5.6, .2 + k.azar() * .15, -1.5 + k.azar() * 5), giro: k.azar() * 6 }); }

  const NA = 22, amb = new THREE.InstancedMesh(new RoundedBoxGeometry(.42, .3, .1, 3, .08), mat('#ffffff', { roughness: .4 }), NA); scene.add(amb);
  const A = []; for (let i = 0; i < NA; i++) A.push({ x: (k.azar() - .5) * 7, z: -3 + k.azar() * 6, v: .6 + k.azar() * .8, f: k.azar() * 8, ch: i % 4 });
  const logoTex = new THREE.TextureLoader().load('img/logo.png'); logoTex.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.12), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false })); scene.add(logo);

  const docs = ['Horarios.pdf', 'Precios.pdf', 'Servicios.docx'].map((n, i) => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 340; const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 340); g.fillStyle = ['#E53935', '#E53935', '#3D7DD9'][i]; g.fillRect(0, 0, 256, 70);
    g.fillStyle = '#fff'; g.font = '800 34px Inter'; g.fillText(i === 2 ? 'DOCX' : 'PDF', 20, 48); g.fillStyle = '#0E1620'; g.font = '700 26px Inter'; g.fillText(n, 20, 112);
    g.fillStyle = '#DCE2EA'; for (let r = 0; r < 7; r++) g.fillRect(20, 140 + r * 26, 200 - (r % 3) * 40, 12);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.2, .03), [mat('#fff'), mat('#fff'), mat('#fff'), mat('#fff'), new THREE.MeshStandardMaterial({ map: tx, roughness: .6 }), mat('#fff')]);
    m.castShadow = true; scene.add(m); return m; });

  const t = (id, n, d = 0) => c(id, n) + d;
  chat.conf.mensajes = [
    { t: s('robot') - .2, tipo: 'sistema', texto: 'HOY', lado: 'in', sinEscribir: true },
    { t: t('robot', 0, -.1), lado: 'out', texto: 'Hola' },
    { t: t('robot', 1), lado: 'in', texto: '¡Hola! Bienvenido a Tu negocio. ¿En qué te podemos ayudar?' },
    { t: t('robot', 2), lado: 'in', tipo: 'lista', texto: 'Elige una opción:', boton: 'Ver opciones', sinEscribir: true },
    { t: t('robot', 3, .5), lado: 'out', texto: 'Precios y servicios' },
    { t: t('robot', 3, 1.2), lado: 'in', texto: 'Con gusto. ¿Cómo te llamas?' },
    { t: t('robot', 4, .3), lado: 'out', texto: 'Ana Gómez' },
    { t: t('ia', 1, -.2), lado: 'out', texto: '¿Abren el sábado?' },
    { t: t('ia', 3, .1), lado: 'in', tipo: 'botones', texto: '¡Sí, Ana! El sábado atendemos de 8:00 a. m. a 1:00 p. m.', botones: ['Hablar con un asesor'], elegido: 0, tElige: s('equipo') + .2 },
    { t: s('equipo') + .5, lado: 'out', texto: 'Hablar con un asesor', sinEscribir: true },
    { t: t('equipo', 1, .2), lado: 'in', texto: 'Te comunico con un asesor. Un momento, por favor.' },
    { t: c('equipo', 2) + .03, lado: 'in', negrita: 'Laura · Atención', texto: '¡Hola, Ana! Con gusto te ayudo.' },
  ];
  chat.conf.hoja = { t0: t('robot', 2, .7), t1: t('robot', 3, .3), tElige: t('robot', 3, -.3), titulo: 'Elige una opción', opciones: ['Precios y servicios', 'Horarios', 'Hablar con un asesor'], elegida: 0 };
  const nombres = [['Ana Gómez', 'whatsapp', 'Hola, ¿tienen disponibilidad?'], ['Carlos Ruiz', 'instagram', 'Me interesa el plan'], ['María López', 'messenger', '¿Cuánto cuesta?'], ['Jorge Díaz', 'telegram', 'Buenas tardes'],
    ['Luisa Pardo', 'whatsapp', 'Quiero hacer un pedido'], ['Pedro Rojas', 'instagram', '¿Hacen envíos?'], ['Sofía Mejía', 'whatsapp', 'Gracias por la info']];
  panel.conf.filas = nombres.map(([n, ch, tx], i) => ({ t: c('marca', 1) + .3 + i * .32, nombre: n, canal: ch, texto: tx, nuevos: 1 + (i % 3), hora: 'ahora' }));
  panel.conf.chat = [
    { t: t('ia', 1, -.2), lado: 'in', texto: '¿Abren el sábado?' },
    { t: t('ia', 3, .1), lado: 'out', robot: true, texto: '¡Sí, Ana! El sábado atendemos de 8:00 a. m. a 1:00 p. m.' },
    { t: t('equipo', 1, .2), lado: 'out', robot: true, texto: 'Te comunico con un asesor. Un momento, por favor.' },
    { t: c('equipo', 2) + .03, lado: 'out', firma: 'Laura · Atención', texto: '¡Hola, Ana! Con gusto te ayudo.' },
  ];
  panel.conf.tarjetas = [
    { titulo: 'Conversaciones', color: '#5BB04B', valor: u => Math.round(1284 * u).toLocaleString('es-CO') },
    { titulo: 'Resuelto por el robot', color: '#3D7DD9', valor: u => Math.round(64 * u) + ' %' },
    { titulo: 'Primera respuesta', color: '#4FB6E0', valor: u => (1.5 + 3 * (1 - u)).toFixed(1).replace('.', ',') + ' min' },
    { titulo: 'Clientes que vuelven', color: '#C73E70', valor: u => Math.round(38 * u) + ' %' },
  ];
  panel.conf.t0 = c('reportes', 0);

  const TEL = V(10.2, 3.3, 0), ROB = V(8.45, 1.6, 1.8);
  k.setKF([
    [0, [0, 7.4, 18.5], [0, 5.0, 0]],
    [e('gancho') - .3, [0, 7.1, 17.0], [0, 5.1, 0]],
    [s('marca') + 1.0, [0, 6.8, 23.6], [0, 5.25, -1]],
    [e('marca') - .071, [.2, 6.7, 22.9], [0, 5.25, -1]],
    [e('marca') - .07, [9.7, 3.9, 14.1], [9.7, 3.1, .3]],
    [s('robot') + 1.0, [9.7, 3.8, 13.2], [9.7, 3.1, .3]],
    [e('robot'), [9.8, 3.7, 12.7], [9.7, 3.1, .3]],
    [s('ia') + .9, [9.4, 4.0, 13.0], [9.6, 3.2, .3]],
    [e('ia'), [9.5, 3.9, 12.7], [9.6, 3.2, .3]],
    [c('equipo', 4) - .051, [9.7, 3.8, 12.6], [9.7, 3.1, .3]],
    [c('equipo', 4) - .05, [0.3, 9.4, 18.6], [0.1, 2.1, 0]],
    [e('equipo'), [0.4, 9.0, 17.6], [0.1, 2.1, 0]],
    [s('reportes') + 1.0, [-.72, 4.9, 7.1], [-.72, 2.85, -2.05]],
    [e('reportes') - .011, [1.12, 4.9, 7.1], [1.12, 2.85, -2.05]],
    [e('reportes') - .01, [0, 6.2, 18.6], [0, 5.0, 0]],
    [s('lema') + 1.4, [0, 6.2, 17.5], [0, 5.0, 0]],
    [total + .5, [0, 6.2, 16.5], [0, 5.0, 0]],
  ]);

  return {
    actualizar(T) {
      const enLema = T >= s('lema');
      canales.forEach((g, i) => {
        let sc;
        if (T < s('robot') - .4) sc = eob(pr(T, c('gancho', 2 + i) - .15, .55));
        else if (!enLema) sc = 1 - eio(pr(T, s('robot') - .4, .6));
        else sc = eob(pr(T, s('lema') + .2 + i * .12, .6)) * .85 * (1 - eio(pr(T, s('cierre') + .15, .4)));
        g.visible = sc > .01; g.scale.setScalar(Math.max(sc, .001));
        if (!enLema) { const u = eio(pr(T, s('marca') - .2, 1.0)); g.position.lerpVectors(ARRIBA[i], LADOS[i], u); g.position.y += Math.sin(T * 1.8 + i) * .1; g.rotation.y = Math.sin(T * .9 + i) * .25; }
        else { const P = [V(-1.9, 7.65, -.8), V(1.9, 7.65, -.8), V(-1.72, 3.1, -.4), V(1.72, 3.1, -.4)][i]; g.position.copy(P); g.position.y += Math.sin(T * 1.8 + i * 1.3) * .14; g.rotation.y = Math.sin(T * .9 + i) * .3; }
      });
      tipos.forEach((n, i) => mostrar('c' + i, 'pill', NOMBRE[n], ARRIBA[i].clone().add(V(0, -1.05, 0)), 0, 26, ventana(T, c('gancho', 2 + i) - .1, s('marca') - .1, .25), false));
      document.querySelectorAll('.tag').forEach(d => { const m = { WhatsApp: '#25D366', Instagram: '#D62976', Messenger: '#7B4BFF', Telegram: '#29A9EB' }[d.textContent]; if (m) d.style.background = m; });

      const sorbe = pr(T, c('marca', 1) - .2, 1.1);
      for (let i = 0; i < NB; i++) { const b = B[i], u = pr(T, b.t0, .9), src = ARRIBA[b.ch];
        const p = new THREE.Vector3().lerpVectors(src, b.dest, eio(u)); p.y += Math.sin(u * Math.PI) * 2.2;
        if (sorbe > 0) p.lerp(destino, eio(cl(sorbe * 1.3 - (i % 7) * .04)));
        const vis = T > b.t0 && sorbe < .99;
        tmp.position.copy(p); tmp.rotation.set(b.giro * (1 - u) * .3, b.giro * u, 0); tmp.scale.setScalar(vis ? (1 - sorbe * .9) : .0001); tmp.updateMatrix(); burb.setMatrixAt(i, tmp.matrix);
        burb.setColorAt(i, col.set(k.COLOR_CANAL[tipos[b.ch]])); }
      burb.instanceMatrix.needsUpdate = true; burb.instanceColor.needsUpdate = true;
      const af = 1 - pr(T, c('gancho', 2) + .2, .8);
      for (let i = 0; i < NA; i++) { const a = A[i], y = ((T * a.v + a.f) % 8); tmp.position.set(a.x + Math.sin(T + i) * .3, y, a.z); tmp.rotation.set(0, Math.sin(T * .5 + i) * .4, 0);
        tmp.scale.setScalar(Math.max(af * Math.min(1, y * 1.5, (8 - y) * 1.5), .0001)); tmp.updateMatrix(); amb.setMatrixAt(i, tmp.matrix); amb.setColorAt(i, col.set(k.COLOR_CANAL[tipos[a.ch]])); }
      amb.instanceMatrix.needsUpdate = true; amb.instanceColor.needsUpdate = true; amb.visible = af > 0;
      tubos.forEach((m, i) => { m.visible = T > c('marca', 1) - .3 && T < s('robot') - .2; dibujarTubo(m, pr(T, c('marca', 1) - .3 + i * .1, .8)); });

      let ms = T < s('marca') - .3 ? 0 : (enLema ? 0 : eob(pr(T, s('marca') - .3, .7)));
      if (T > s('robot') - .2 && T < s('equipo') + .4) ms *= 1 - ventana(T, s('robot') - .2, s('equipo') - .2, .5);
      mesa.visible = ms > .01; mesa.scale.setScalar(Math.max(ms, .001));

      const salida = 1 - eio(pr(T, s('cierre') + .15, .4));
      let ls = 0, lp = V(0, 8.4, -2.6);
      if (T < s('robot')) ls = eob(pr(T, s('marca') + .05, .7)) * (1 - eio(pr(T, s('robot') - .4, .5))) * .83;
      else if (enLema) { ls = eob(pr(T, s('lema') + .1, .8)) * .82 * salida; lp = V(0, 5.6, -.5); }
      logo.visible = ls > .01; logo.scale.setScalar(Math.max(ls, .001)); logo.position.copy(lp); logo.position.y += Math.sin(T * 1.5) * .06;
      mostrar('solo', 'pill verde', 'Un solo panel', [540, 1392], 0, 0, ventana(T, c('marca', 2) - .1, e('marca') - .1, .25), false);

      let rb = ROB.clone(), rs = 0;
      if (T >= s('robot') - .2 && T < c('equipo', 2) + .6) rs = eob(pr(T, s('robot') - .2, .7)) * .62;
      else if (T >= c('equipo', 2) + .6 && !enLema) rs = .62 * (1 - eio(pr(T, c('equipo', 2) + .6, .5)));
      else if (enLema) { rb = V(0, 2.6, 1.5); rs = eob(pr(T, s('lema') + .3, .7)) * .7 * (1 - eio(pr(T, s('cierre') + .15, .4))); }
      robot.visible = rs > .01; robot.scale.setScalar(Math.max(rs, .001));
      robot.animar(T, rb, enLema ? ventana(T, s('lema') + .6, total, .4) : ventana(T, c('robot', 1) - .2, c('robot', 2), .2));
      robot.rotation.y = enLema ? 0 : .32;
      const ojosIA = ventana(T, c('ia', 1), e('ia'), .3); robot.userData.ojos.forEach(o => o.material.color.set(ojosIA > .5 ? '#7FE3FF' : '#ffffff'));
      mostrar('rob', 'pill verde', 'Robot', robot.position.clone().add(V(0, 1.25, 0)), 0, -40, ventana(T, c('robot', 0) - .1, e('robot') - .1, .25), false);
      mostrar('hora', 'pill', 'A cualquier hora', robot.position.clone().add(V(0, 1.25, 0)), 0, -112, ventana(T, c('robot', 4) - .1, e('robot') - .1, .25), false);

      let ts = 0;
      if (T >= s('robot') - .5 && T < c('equipo', 4)) ts = eob(pr(T, s('robot') - .5, .8));
      else if (T >= c('equipo', 4) && T < s('lema')) ts = 1 - eio(pr(T, c('equipo', 4), .6));
      tel.visible = ts > .01; tel.scale.setScalar(Math.max(ts * .58, .001)); tel.position.copy(TEL); tel.position.y += Math.sin(T * 1.3) * .05; tel.rotation.y = -.3 + Math.sin(T * .7) * .03;
      chat.dibujar(T);

      docs.forEach((d, i) => { const t0 = c('ia', 3) - .6 + i * .3, u = pr(T, t0, 1.2), ini = V(7.9 + (i % 2) * .55, 4.6 - i * .34, 1.5 + i * .12), fin = robot.position.clone().add(V(0, .9, 0));
        const ap = eob(pr(T, c('ia', 1) - .1 + i * .15, .5)); d.visible = T > c('ia', 1) - .1 && u < 1 && T < e('ia');
        const p = new THREE.Vector3().lerpVectors(ini, fin, eio(u)); p.y += Math.sin(u * Math.PI) * .6; d.position.copy(p); d.rotation.set(0, Math.sin(T + i) * .3, (1 - u) * .2 - .1);
        d.scale.setScalar(Math.max(ap * (1 - eio(u) * .85) * .66, .001)); });
      mostrar('agente', 'pill azul', 'Agente de IA', robot.position.clone().add(V(0, 1.25, 0)), 0, -40, ventana(T, c('ia', 1) - .1, e('ia') - .1, .25), false);
      mostrar('docs', 'lbl', 'Con los documentos<small>de tu empresa</small>', [222, 470], 0, 0, ventana(T, c('ia', 3) - .3, e('ia') - .1, .25), false);

      const ps = T < c('equipo', 3) ? 0 : (T >= s('reportes') ? 1 - eio(pr(T, s('reportes'), .4)) : eob(pr(T, c('equipo', 3), .7)));
      [operador, movil].forEach(p => { p.visible = ps > .01; p.scale.setScalar(Math.max(ps, .001)); });
      operador.position.set(-1.75, 0, 2.3); operador.rotation.y = 2.5; movil.position.set(1.5, 0, 3.0); movil.rotation.y = -.35;
      operador.userData.cabeza.rotation.y = Math.sin(T * .8) * .15;
      mostrar('pc', 'pill verde', 'Computador', V(0, 4.6, -1.6), 0, -20, ventana(T, c('equipo', 4) - .02, e('equipo') - .1, .25), false);
      mostrar('cel', 'pill azul', 'Celular', movil.position.clone().add(V(0, 2.7, 0)), 0, -40, ventana(T, c('equipo', 5) - .1, e('equipo') - .1, .25));

      if (T >= s('reportes') - .2 && !enLema) Object.assign(panel.conf, { modo: 'tablero', seccion: 'Dashboard', menuActivo: 'DASHBOARD' });
      else Object.assign(panel.conf, { modo: 'bandeja', seccion: 'Chats', menuActivo: 'CHATS' });
      if (T > c('ia', 1) - .5) Object.assign(panel.conf, { chatNombre: 'Ana Gómez', chatCanal: 'whatsapp' });
      if (mesa.visible) panel.dibujar(T);
      mostrar('rep', 'pill magenta', 'Reportes', [540, 446], 0, 0, ventana(T, c('reportes', 3) - .1, e('reportes') - .1, .25), false);
    },
  };
}
