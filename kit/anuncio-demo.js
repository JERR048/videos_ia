export default function (k) {
  const { THREE, scene, s, e, c, cl, eio, eob, pr, ventana, V, mat, malla, RoundedBoxGeometry, mostrar, VERT, MARCA } = k;
  const total = k.TL.total;
  const PRIM = MARCA.colores.primario;
  const MESA_X = 14;

  const chat = k.crearChat();
  Object.assign(chat.conf, { nombre: MARCA.nombre, estado: 'en línea', hora: '11:48 p. m.', inicial: MARCA.nombre[0], avatar: PRIM });
  const tel = k.crearTelefono(chat);
  const robot = k.crearRobot();

  const mesa = new THREE.Group(); mesa.position.x = MESA_X; scene.add(mesa);
  malla(new RoundedBoxGeometry(5.5, .14, 3.9, 3, .06), mat('#E1E8F0'), 0, 1.0, -.3, mesa);
  [[-2.5, -2], [2.5, -2], [-2.5, 1.4], [2.5, 1.4]].forEach(([x, z]) => malla(new THREE.CylinderGeometry(.07, .07, 1.0, 12), mat('#B9C3CF'), x, .5, z, mesa));
  const panel = k.crearPanelUI();
  Object.assign(panel.conf, { modo: 'bandeja', empresa: MARCA.nombre, seccion: 'Chats', menuActivo: 'CHATS', chatNombre: 'Ana Gómez', chatCanal: 'whatsapp' });
  const portatil = k.crearPortatil(panel); portatil.position.set(0, 1.07, -.1); mesa.add(portatil);

  const logoTex = new THREE.TextureLoader().load(MARCA.logo || 'img/logo.png'); logoTex.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false }));
  scene.add(logo);

  const tipos = ['whatsapp', 'instagram', 'messenger', 'telegram'];
  const burbujas = tipos.map(t => malla(new RoundedBoxGeometry(.7, .5, .16, 3, .14), mat(k.COLOR_CANAL[t], { roughness: .4 })));

  const L = VERT ? {
    tel0: V(.5, 3.3, 0), tel1: V(.5, 3.3, 0), rob: V(-1.25, 1.6, 1.8), robS: .62,
    logo: V(0, 5.6, -.5), logoS: .82, robLema: V(0, 2.6, 1.5), robLemaS: .7,
    desde: [V(-1.6, 1.4, 1.5), V(-1.7, -1.4, 1.8), V(1.3, 1.6, 1), V(1.2, -1.6, 2)],
    cam: {
      gancho: [[0, 3.7, 13.4], [0, 3.2, 0]], gancho2: [[0, 3.7, 12.9], [0, 3.2, 0]],
      robot: [[0, 3.8, 13.2], [0, 3.1, .3]], robot2: [[0, 3.7, 12.7], [0, 3.1, .3]],
      panel: [[MESA_X - .3, 6.8, 17.2], [MESA_X - .3, 2.6, -1]], panel2: [[MESA_X - .3, 6.4, 16.2], [MESA_X - .3, 2.7, -1]],
      lema: [[0, 6.2, 18.4], [0, 5.0, 0]], lema2: [[0, 6.2, 16.8], [0, 5.0, 0]],
    },
    pillHora: [240, 1050], pillPanel: [540, 1330],
  } : {
    tel0: V(0, 2.8, 0), tel1: V(1.3, 2.8, 0), rob: V(-1.6, 1.5, .8), robS: .8,
    logo: V(-1.6, 3.4, -.5), logoS: 1, robLema: V(3.2, 1.2, 1.2), robLemaS: .85,
    desde: [V(-3.2, 2.2, 1), V(-3.4, -1, 1.5), V(3.1, 2.4, 1), V(3.3, -1.2, 1.5)],
    cam: {
      gancho: [[0, 3.3, 11.5], [0, 2.9, 0]], gancho2: [[0, 3.2, 10.8], [0, 2.9, 0]],
      robot: [[0, 3.1, 10.5], [0, 2.75, 0]], robot2: [[0, 3.0, 10.0], [0, 2.75, 0]],
      panel: [[MESA_X, 4.6, 9.8], [MESA_X, 2.6, -1]], panel2: [[MESA_X, 4.3, 8.6], [MESA_X, 2.7, -1]],
      lema: [[0, 3.6, 13], [0, 3.0, 0]], lema2: [[0, 3.5, 12], [0, 3.0, 0]],
    },
    pillHora: [1500, 760], pillPanel: [960, 990],
  };
  const C = L.cam, kf = (t, p) => [t, p[0], p[1]];
  k.setKF([
    kf(0, C.gancho), kf(e('gancho') - .3, C.gancho2),
    kf(s('robot') + .9, C.robot), kf(e('robot') - .001, C.robot2),
    kf(e('robot'), C.panel), kf(e('panel') - .001, C.panel2),
    kf(e('panel'), C.lema), kf(total + .5, C.lema2),
  ]);

  chat.conf.mensajes = [
    { t: .2, tipo: 'sistema', texto: 'HOY', lado: 'in', sinEscribir: true },
    { t: c('gancho', 1), lado: 'out', texto: 'Hola, ¿están atendiendo?' },
    { t: c('robot', 3), lado: 'in', texto: `¡Hola! Bienvenido a ${MARCA.nombre}. ¿En qué te ayudamos?` },
    { t: c('robot', 4), lado: 'in', tipo: 'botones', texto: 'Elige una opción:', botones: ['Ver horarios', 'Hablar con un asesor'], sinEscribir: true },
  ];
  panel.conf.filas = [['Ana Gómez', 'whatsapp', 'Hola, ¿están atendiendo?'], ['Carlos Ruiz', 'instagram', 'Me interesa el plan'], ['María López', 'messenger', '¿Cuánto cuesta?'], ['Jorge Díaz', 'telegram', 'Buenas tardes']]
    .map(([nombre, canal, texto], i) => ({ t: s('panel') + .2 + i * .3, nombre, canal, texto, nuevos: 1 + (i % 2), hora: 'ahora' }));
  panel.conf.chat = [
    { t: s('panel') + .5, lado: 'in', texto: 'Hola, ¿están atendiendo?' },
    { t: s('panel') + .8, lado: 'out', robot: true, texto: `¡Hola! Bienvenido a ${MARCA.nombre}. ¿En qué te ayudamos?` },
  ];

  return {
    actualizar(T) {
      const enLema = T >= s('lema');
      const salida = 1 - eio(pr(T, s('cierre') + .15, .4));

      const ts = enLema ? 0 : eob(pr(T, .1, .7));
      tel.visible = ts > .01; tel.scale.setScalar(Math.max(ts * .58, .001));
      const u = eio(pr(T, s('robot') - .3, .9));
      tel.position.lerpVectors(L.tel0, L.tel1, u); tel.position.y += Math.sin(T * 1.3) * .05;
      tel.rotation.y = VERT ? -.12 : -.25;
      chat.dibujar(T);

      burbujas.forEach((b, i) => {
        const p = pr(T, c('gancho', 0) + i * .35, 1.0);
        b.visible = p > 0 && p < 1;
        const ini = L.tel1.clone().add(L.desde[i]), fin = tel.position.clone().add(V(0, .4, .4));
        b.position.lerpVectors(ini, fin, eio(p)); b.position.y += Math.sin(p * Math.PI) * .6;
        b.rotation.set(0, (1 - p) * 2, 0); b.scale.setScalar(Math.max((1 - eio(p) * .8) * eob(cl(p * 4)), .001));
      });
      mostrar('hora', 'pill', 'A cualquier hora', L.pillHora, 0, 0, ventana(T, c('gancho', 2) - .1, e('gancho') - .1, .25), false);

      let rs = 0, rb = L.rob.clone();
      if (!enLema) rs = eob(pr(T, s('robot') - .2, .7)) * L.robS;
      else { rb = L.robLema.clone(); rs = eob(pr(T, s('lema') + .3, .7)) * L.robLemaS * salida; }
      robot.visible = rs > .01; robot.scale.setScalar(Math.max(rs, .001));
      robot.animar(T, rb, enLema ? ventana(T, s('lema') + .6, total, .4) : ventana(T, c('robot', 2) - .1, c('robot', 3) + .3, .2));
      robot.rotation.y = enLema ? (VERT ? 0 : -.3) : .32;
      mostrar('rob', 'pill verde', 'Robot', robot.position.clone().add(V(0, 2.0 * L.robS, 0)), 0, -40, ventana(T, c('robot', 1) - .1, e('robot') - .1, .25), false);

      panel.dibujar(T);
      mostrar('panel', 'pill', 'Un solo panel', L.pillPanel, 0, 0, ventana(T, c('panel', 2) - .1, e('panel') - .1, .25), false);

      const ls = enLema ? eob(pr(T, s('lema') + .15, .8)) * L.logoS * salida : 0;
      logo.visible = ls > .01; logo.scale.setScalar(Math.max(ls, .001));
      logo.position.copy(L.logo); logo.position.y += Math.sin(T * 1.5) * .06;
    },
  };
}
