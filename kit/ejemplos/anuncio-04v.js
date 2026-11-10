export default function (k) {
  const { THREE, scene, s, e, c, cl, lerp, eio, eo, eob, pr, ventana, V, mat, brillo, malla, RoundedBoxGeometry, mostrar } = k;
  const total = k.TL.total;
  const t = (id, n, d = 0) => c(id, n) + d;
  const escala = (o, u, base = 1) => { o.visible = u > .01; o.scale.setScalar(Math.max(u * base, .001)); };
  const entraSale = (T, a, b, din = .6, dout = .45) => T < a ? 0 : (T < b ? eob(pr(T, a, din)) : 1 - eio(pr(T, b, dout)));

  k.letraPequena('El cliente recibe los correos si registró su correo electrónico.');

  const cvHalo = document.createElement('canvas'); cvHalo.width = cvHalo.height = 128;
  { const g = cvHalo.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const texHalo = new THREE.CanvasTexture(cvHalo);

  function crearRouter() {
    const raiz = new THREE.Group(); scene.add(raiz);
    const madera = mat('#E1E8F0'), pata = mat('#B9C3CF');
    malla(new THREE.CylinderGeometry(1.75, 1.75, .12, 48), madera, 0, .94, .1, raiz);
    malla(new THREE.CylinderGeometry(.12, .14, .9, 16), pata, 0, .45, .1, raiz);
    malla(new THREE.CylinderGeometry(.75, .8, .06, 40), pata, 0, .03, .1, raiz);
    const g = new THREE.Group(); g.position.y = 1.0; raiz.add(g);
    const blanco = mat('#F5F7FB', { roughness: .35 }), navy = mat('#2F3566', { roughness: .3, metalness: .1 }), gris = mat('#D5DCE6', { roughness: .5 });
    malla(new RoundedBoxGeometry(2.6, .6, 1.6, 5, .22), blanco, 0, .38, 0, g);
    for (let i = 0; i < 6; i++) malla(new RoundedBoxGeometry(.09, .03, 1.0, 2, .015), gris, -.6 + i * .24, .68, -.05, g);
    malla(new RoundedBoxGeometry(2.1, .26, .06, 2, .03), navy, 0, .38, .79, g);
    [-1, 1].forEach(sg => { const a = malla(new THREE.CapsuleGeometry(.075, .95, 6, 14), navy, sg * 1.0, 1.15, -.55, g); a.rotation.z = -sg * .14; });
    [[-1.05, -.6], [1.05, -.6], [-1.05, .6], [1.05, .6]].forEach(([x, z]) => malla(new THREE.CylinderGeometry(.09, .09, .08, 14), mat('#B9C3CF'), x, .04, z, g));
    [-.75, -.4, -.05].forEach(x => malla(new THREE.SphereGeometry(.055, 16, 12), brillo('#6BD45A', 1.3), x, .38, .83, g));
    const ledMat = new THREE.MeshStandardMaterial({ color: '#FF4040', emissive: '#FF3030', emissiveIntensity: 2, roughness: .4 });
    malla(new THREE.SphereGeometry(.085, 20, 14), ledMat, .55, .38, .84, g);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHalo, color: '#FF3B3B', transparent: true, depthWrite: false, toneMapped: false }));
    halo.position.set(.55, .38, .92); halo.scale.setScalar(.9); halo.material.depthTest = false; halo.renderOrder = 10; g.add(halo);
    raiz.userData = { ledMat, halo };
    return raiz;
  }
  const router = crearRouter();
  const ROJO = new THREE.Color('#FF3030'), VERDE = new THREE.Color('#5EDB4A');
  function luz(T, roja, pulsoVerde = -1) {
    const { ledMat, halo } = router.userData;
    if (roja) {
      const on = cl(Math.sin(T * 8) * 3 + .6);
      ledMat.color.copy(ROJO); ledMat.emissive.copy(ROJO); ledMat.emissiveIntensity = .15 + 2.3 * on;
      halo.material.color.copy(ROJO); halo.material.opacity = .85 * on; halo.scale.setScalar(.55 + .25 * on);
    } else {
      ledMat.color.copy(VERDE); ledMat.emissive.copy(VERDE); ledMat.emissiveIntensity = 1.6;
      halo.material.color.copy(VERDE);
      const p = pulsoVerde >= 0 ? pr(T, pulsoVerde, .9) : 1;
      halo.material.opacity = p < 1 ? .55 + .4 * (1 - p) : .55; halo.scale.setScalar(p < 1 ? .7 + 2.2 * eo(p) * (1 - p) + .4 * p : .7);
    }
  }

  const navyClay = mat('#2F3566', { roughness: .3, metalness: .1 });
  const auricular = new THREE.Group(); scene.add(auricular);
  {
    const curva = new THREE.QuadraticBezierCurve3(V(-1.0, 0, 0), V(0, .8, 0), V(1.0, 0, 0));
    malla(new THREE.TubeGeometry(curva, 40, .19, 14, false), navyClay, 0, 0, 0, auricular);
    [-1, 1].forEach(sg => { const p = malla(new THREE.CylinderGeometry(.48, .4, .4, 32), navyClay, sg * .95, -.1, 0, auricular); p.rotation.z = sg * -.67; });
    class Espiral extends THREE.Curve { getPoint(u, o = new THREE.Vector3()) { const a = u * Math.PI * 2 * 8; return o.set(Math.cos(a) * .1 - u * .35, -u * 1.25, Math.sin(a) * .1); } }
    malla(new THREE.TubeGeometry(new Espiral(), 320, .035, 6, false), navyClay, -.86, -.38, 0, auricular);
  }
  function crearNota(color) {
    const g = new THREE.Group(); scene.add(g);
    const m = mat(color, { roughness: .4 });
    const cab = malla(new THREE.SphereGeometry(.17, 24, 16), m, 0, 0, 0, g); cab.scale.set(1.3, .95, .75); cab.rotation.z = .4;
    malla(new THREE.CylinderGeometry(.035, .035, .72, 10), m, .19, .36, 0, g);
    const b = malla(new RoundedBoxGeometry(.3, .11, .06, 2, .03), m, .31, .66, 0, g); b.rotation.z = -.55;
    return g;
  }
  const notas = ['#5BB04B', '#C73E70', '#3D7DD9'].map(crearNota);

  const chat = k.crearChat();
  Object.assign(chat.conf, { nombre: 'Conecta Fibra', estado: 'en línea', hora: '9:41', inicial: 'C', avatar: '#4FB6E0' });
  chat.conf.dibujarAvatar = (g, x, y, r) => {
    g.save(); g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineWidth = r * .15;
    [.68, .42].forEach(q => { g.beginPath(); g.arc(x, y + r * .38, r * q, -Math.PI * .78, -Math.PI * .22); g.stroke(); });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y + r * .38, r * .12, 0, 7); g.fill(); g.restore();
  };
  const tel = k.crearTelefono(chat);

  function fotoRouter(g, x, y, w, h) {
    g.fillStyle = '#ECE4D6'; g.fillRect(x, y, w, h);
    g.fillStyle = '#C9A57A'; g.fillRect(x, y + h * .7, w, h * .3);
    g.fillStyle = '#B48F63'; g.fillRect(x, y + h * .7, w, 6);
    const cx = x + w / 2;
    g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(cx, y + h * .74, 150, 14, 0, 0, 7); g.fill();
    g.fillStyle = '#2F3566'; [-1, 1].forEach(sg => { g.save(); g.translate(cx + sg * 104, y + 160); g.rotate(sg * .12); g.beginPath(); g.roundRect(-8, -112, 16, 112, 8); g.fill(); g.restore(); });
    g.fillStyle = '#F7F8FA'; g.beginPath(); g.roundRect(cx - 142, y + 140, 284, 82, 24); g.fill();
    g.fillStyle = '#E2E7EE'; g.fillRect(cx - 120, y + 146, 240, 6);
    g.fillStyle = '#2F3566'; g.beginPath(); g.roundRect(cx - 116, y + 168, 232, 32, 12); g.fill();
    [-84, -50, -16].forEach(dx => { g.fillStyle = '#6BD45A'; g.beginPath(); g.arc(cx + dx, y + 184, 6, 0, 7); g.fill(); });
    const gr = g.createRadialGradient(cx + 52, y + 184, 0, cx + 52, y + 184, 40); gr.addColorStop(0, 'rgba(255,60,60,.95)'); gr.addColorStop(.3, 'rgba(255,60,60,.45)'); gr.addColorStop(1, 'rgba(255,60,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx + 52, y + 184, 40, 0, 7); g.fill();
    g.fillStyle = '#FF3B3B'; g.beginPath(); g.arc(cx + 52, y + 184, 9, 0, 7); g.fill();
  }

  chat.conf.mensajes = [
    { t: s('reporta') - .3, tipo: 'sistema', texto: 'HOY', lado: 'in', sinEscribir: true },
    { t: t('reporta', 1, -.05), lado: 'out', texto: 'Hola, me quedé sin internet' },
    { t: t('reporta', 2, .1), lado: 'in', texto: 'Cuéntanos qué pasó y envía una foto.' },
    { t: t('reporta', 4, .1), lado: 'out', tipo: 'imagen', dibujo: fotoRouter, pie: 'La luz roja no se apaga' },
    { t: t('caso', 1, .2), lado: 'in', negrita: 'Caso #4512', texto: 'Tu caso quedó registrado con este número.' },
  ];

  const canalWA = k.crearCanal('whatsapp', .55);
  const robot = k.crearRobot();

  const cvT = document.createElement('canvas'); cvT.width = 640; cvT.height = 320;
  {
    const g = cvT.getContext('2d');
    g.beginPath(); g.roundRect(0, 0, 640, 320, 38); g.fillStyle = '#fff'; g.fill();
    g.save(); g.beginPath(); g.roundRect(0, 0, 640, 320, 38); g.clip(); g.fillStyle = '#5BB04B'; g.fillRect(0, 0, 150, 320); g.restore();
    g.save(); g.translate(88, 160); g.rotate(-Math.PI / 2); g.fillStyle = '#fff'; g.font = '800 44px Montserrat'; g.textAlign = 'center'; g.fillText('CASO', 0, 15); g.restore();
    g.strokeStyle = '#C7D0DA'; g.lineWidth = 5; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(152, 24); g.lineTo(152, 296); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#4FB6E0'; g.font = '700 30px Inter'; g.fillText('Conecta Fibra', 190, 80);
    g.fillStyle = '#0E1620'; g.font = '800 124px Montserrat'; g.fillText('#4512', 184, 212);
    g.fillStyle = '#5A6573'; g.font = '600 28px Inter'; g.fillText('Sin internet · Ana Gómez', 190, 272);
  }
  const texT = new THREE.CanvasTexture(cvT); texT.colorSpace = THREE.SRGBColorSpace; texT.anisotropy = 8;
  const ticket = new THREE.Group(); scene.add(ticket);
  malla(new RoundedBoxGeometry(2.4, 1.2, .1, 3, .05), mat('#FFFFFF', { roughness: .4 }), 0, 0, 0, ticket);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: texT, transparent: true, toneMapped: false })); f.position.z = .053; ticket.add(f); }

  const PX = 13;
  const mesa = new THREE.Group(); mesa.position.set(PX, 0, 0); scene.add(mesa);
  malla(new RoundedBoxGeometry(5.5, .14, 3.9, 3, .06), mat('#E1E8F0'), 0, 1.0, -.3, mesa);
  [[-2.5, -2], [2.5, -2], [-2.5, 1.4], [2.5, 1.4]].forEach(([x, z]) => malla(new THREE.CylinderGeometry(.07, .07, 1.0, 12), mat('#B9C3CF'), x, .5, z, mesa));
  const panel = k.crearPanelUI();
  Object.assign(panel.conf, { modo: 'tickets', empresa: 'Conecta Fibra', seccion: 'Tickets', menuActivo: 'TICKETS' });
  const portatil = k.crearPortatil(panel); portatil.position.set(0, 1.07, -.1); mesa.add(portatil);
  const pantalla = portatil.userData.tapa.children[1];
  const enPantalla = (px, py) => pantalla.localToWorld(V((px / 1600 - .5) * 4.86, (.5 - py / 1000) * 3.04, .02));
  const operador = k.crearPersona('#5BB04B'); operador.userData.brazos.forEach(b => { b.rotation.x = -.5; });

  const filaNueva = { t: t('panel', 1), num: '#4512', cliente: 'Ana Gómez', asunto: 'Sin internet', estado: 'Registrado', espera: 'Hoy', nuevo: true };
  panel.conf.filas = [
    { t: 0, num: '#4503', cliente: 'Luisa Pardo', asunto: 'Traslado de servicio', estado: 'Finalizado', espera: '—' },
    { t: 0, num: '#4507', cliente: 'Jorge Díaz', asunto: 'Señal intermitente', estado: 'En proceso', espera: '2 d' },
    { t: 0, num: '#4509', cliente: 'María López', asunto: 'Factura duplicada', estado: 'Finalizado', espera: '—' },
    { t: 0, num: '#4510', cliente: 'Pedro Rojas', asunto: 'Cambio de plan', estado: 'Registrado', espera: '1 d' },
    { t: 0, num: '#4511', cliente: 'Carlos Ruiz', asunto: 'Router nuevo', estado: 'En proceso', espera: '1 d' },
    filaNueva,
  ];
  const tCambio = t('panel', 3, .15);

  function crearSobre() {
    const g = new THREE.Group(); scene.add(g);
    malla(new RoundedBoxGeometry(1.3, .86, .1, 3, .05), mat('#FFFFFF', { roughness: .45 }), 0, 0, 0, g);
    const f = new THREE.Shape(); f.moveTo(-.6, .4); f.lineTo(.6, .4); f.lineTo(0, -.1); f.closePath();
    malla(new THREE.ExtrudeGeometry(f, { depth: .03, bevelEnabled: false }), mat('#DDE5EE'), 0, 0, .05, g);
    malla(new THREE.CircleGeometry(.12, 28), brillo('#5BB04B', .6), 0, -.08, .085, g);
    return g;
  }
  const sobre = crearSobre();

  const CX = 19;
  const ana = k.crearPersona('#3D7DD9', '#B9825F', '#1A1210');
  ana.traverse(o => { if (o.isMesh && (o.geometry.type === 'TorusGeometry' || (o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.height === .08))) o.visible = false; });
  const celu = malla(new RoundedBoxGeometry(.32, .58, .05, 3, .05), mat('#1A2030'), 0, 1.4, .7, ana); celu.rotation.x = -.6;
  const pantCelu = new THREE.MeshBasicMaterial({ color: '#D9FDD3', toneMapped: false });
  malla(new THREE.PlaneGeometry(.26, .5), pantCelu, 0, 0, .03, celu);
  ana.userData.brazos.forEach(b => { b.rotation.x = -1.15; });
  ana.position.set(CX, 0, 0);

  const logoTex = new THREE.TextureLoader().load('img/logo.png'); logoTex.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.12), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false })); scene.add(logo);

  const sobreIcono = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 6.5l9 6.5 9-6.5"/></svg>';
  const dCorreo = k.tarjeta('correo', `
    <div style="display:flex;align-items:center;gap:16px;background:#5BB04B;color:#fff;padding:20px 30px;font:800 30px/1.15 Montserrat,Inter,sans-serif">${sobreIcono}<span>WhatMas · Seguimiento de ticket</span></div>
    <div style="padding:22px 32px 4px;font:500 27px/1.45 Inter,sans-serif;color:#2E3A48">Hola, Ana:<br>Se agregó un comentario a tu caso <b style="color:#0E1620">#4512</b>: un técnico te visitará mañana entre 8:00 y 10:00&nbsp;a.&nbsp;m.</div>
    <div style="padding:18px 32px 28px"><span class="btn" style="display:inline-block;background:#5BB04B;color:#fff;font:800 26px/1 Montserrat,Inter,sans-serif;padding:18px 32px;border-radius:14px;box-shadow:0 8px 20px rgba(74,156,58,.3)">Ver ticket ➜</span></div>`,
    { left: '75px', top: '455px', width: '850px' });
  const btn = dCorreo.querySelector('.btn');

  const paso = (fondo, borde, dentro, texto, color) => `<div style="display:grid;justify-items:center;gap:12px;position:relative;z-index:1">
      <div style="width:56px;height:56px;border-radius:50%;background:${fondo};border:5px solid ${borde};box-sizing:border-box;display:grid;place-items:center;color:#fff;font:800 28px/1 Inter,sans-serif">${dentro}</div>
      <div style="font:700 23px/1 Inter,sans-serif;color:${color}">${texto}</div></div>`;
  const dPagina = k.tarjeta('pagina', `
    <div style="display:flex;align-items:center;gap:9px;padding:14px 22px;background:#F3F5F7;border-bottom:1px solid #E3E8EE">
      <i style="width:14px;height:14px;border-radius:50%;background:#DDE3EA"></i><i style="width:14px;height:14px;border-radius:50%;background:#DDE3EA"></i><i style="width:14px;height:14px;border-radius:50%;background:#DDE3EA"></i>
      <span style="flex:1;margin-left:12px;background:#fff;border:1px solid #E3E8EE;border-radius:999px;padding:8px 18px;font:500 19px/1.2 Inter,sans-serif;color:#5A6573">Seguimiento de tu caso</span></div>
    <div style="padding:22px 34px 26px">
      <div style="font:700 20px/1 Inter,sans-serif;color:#4FB6E0;letter-spacing:.06em;text-transform:uppercase">Conecta Fibra</div>
      <div style="font:800 48px/1.1 Montserrat,Inter,sans-serif;margin-top:10px">Caso #4512</div>
      <div style="font:500 23px/1.2 Inter,sans-serif;color:#5A6573;margin-top:6px">Sin internet · Ana Gómez</div>
      <div style="position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:24px">
        <div style="position:absolute;top:26px;left:16.6%;width:33.4%;height:5px;background:#5BB04B"></div>
        <div style="position:absolute;top:26px;left:50%;width:33.4%;height:5px;background:#DDE3EA"></div>
        ${paso('#5BB04B', '#5BB04B', '✓', 'Registrado', '#2E7D32')}
        ${paso('#fff', '#E27A3F', '<span style="width:20px;height:20px;border-radius:50%;background:#E27A3F"></span>', 'En proceso', '#C4612A')}
        ${paso('#fff', '#C9D1DA', '', 'Finalizado', '#8A94A3')}
      </div>
      <div class="nota" style="margin-top:22px;display:flex;align-items:center;gap:14px;padding:16px 22px;border-radius:16px;background:#EAF6E7;color:#2E7D32;font:700 25px/1.2 Inter,sans-serif">
        <span class="ico" style="width:34px;height:34px;border-radius:50%;background:#5BB04B;color:#fff;display:grid;place-items:center;font:800 20px/1 Inter,sans-serif">✓</span>Sin usuario ni contraseña</div>
    </div>`,
    { left: '75px', top: `${455 + dCorreo.offsetHeight + 20}px`, width: '850px' });
  const nota = dPagina.querySelector('.nota'), notaIco = dPagina.querySelector('.ico');

  const RA = V(0, 0, 0), RL = V(CX - 1.15, 0, .6), PCX = 885, PCY = 585;
  const CAMX = 4.0, H = V(.45, 5.0, .2), TEL = V(CAMX + .6, 3.3, .3), ROB = V(CAMX - 1.09, 1.6, 1.8), TK = V(CAMX - 1.12, 4.6, 1.4), WA = V(CAMX - 1.35, 4.55, .9);
  const ROBL = V(CX + .95, 1.0, 1.6);
  mesa.updateMatrixWorld(true);
  const NRM = pantalla.getWorldDirection(V(0, 0, 0));
  const enfoque = (px, py, d) => { const p = enPantalla(px, py); return [[p.x + NRM.x * d, p.y + NRM.y * d, p.z + NRM.z * d], [p.x, p.y, p.z]]; };

  k.setKF([
    [0, [.15, 3.3, 13.0], [.15, 2.3, 0]],
    [1.9, [.15, 3.3, 12.4], [.15, 2.3, 0]],
    [3.0, [.2, 4.6, 16.8], [.2, 3.75, 0]],
    [e('gancho') - .55, [.2, 4.6, 16.2], [.2, 3.75, 0]],
    [s('reporta') + .45, [CAMX, 3.85, 13.4], [CAMX, 3.25, .3]],
    [e('reporta'), [CAMX + .05, 3.85, 13.0], [CAMX, 3.25, .3]],
    [s('caso') + 1.0, [CAMX, 3.8, 13.4], [CAMX, 3.2, .3]],
    [e('caso') - .5, [CAMX, 3.8, 13.0], [CAMX, 3.2, .3]],
    [s('panel') + .7, [PX + .15, 7.9, 18.4], [PX + .15, 2.5, -.4]],
    [t('panel', 1, .7), ...enfoque(PCX, PCY, 10.5)],
    [e('panel') - .2, ...enfoque(PCX, PCY, 10.3)],
    [s('seguimiento') + .6, [PX, 6.6, 18], [PX, 2.6, -1]],
    [t('seguimiento', 1, .35), [CX, 2.67, 11], [CX, 1.97, 0]],
    [t('seguimiento', 3, -.2), [CX, 2.67, 10.8], [CX, 1.97, 0]],
    [t('seguimiento', 4, -.05), [CX, 4.2, 11], [CX, 3.6, 0]],
    [e('seguimiento') - .25, [CX, 4.2, 10.8], [CX, 3.6, 0]],
    [s('lema') + .5, [CX, 4.0, 15.5], [CX, 3.0, 0]],
    [total + .5, [CX, 4.0, 14.8], [CX, 3.0, 0]],
  ]);

  const tmp = V(0, 0, 0);

  return {
    actualizar(T) {
      k.cam.updateMatrixWorld();
      const enLema = T >= s('lema') - .1;

      const salida = 1 - eio(pr(T, s('cierre') + .15, .4));
      let rs, rp = RA;
      if (!enLema) rs = T < e('gancho') - .25 ? eob(pr(T, 0, .6)) : 1 - eio(pr(T, e('gancho') - .25, .45));
      else { rp = RL; rs = eob(pr(T, s('lema') + .15, .7)) * salida; }
      escala(router, rs, enLema ? .8 : 1.2); router.position.copy(rp); router.rotation.y = enLema ? .1 : .28 + Math.sin(T * .6) * .04;
      const tVerde = t('lema', 0, .55);
      if (!enLema) luz(T, T >= .75 || (T > .55 && Math.sin(T * 60) > 0));
      else luz(T, T < tVerde, tVerde);
      mostrar('sinnet', 'pill magenta', 'Sin internet', RA.clone().add(V(0, 2.45, .5)), 0, 0, ventana(T, t('gancho', 0, .5), e('gancho') - .3, .25), false);

      const hs = entraSale(T, t('gancho', 2, -.15), e('gancho') - .75, .55, .4);
      escala(auricular, hs, .95);
      auricular.position.copy(H); auricular.position.y += Math.sin(T * 2.1) * .06;
      auricular.rotation.set(.15, -.25 + Math.sin(T * 1.3) * .08, Math.sin(T * 3.1) * .1);
      const ns = ventana(T, t('gancho', 3, -.1), e('gancho') - .65, .3);
      notas.forEach((n, i) => {
        const u = ((T - t('gancho', 3)) * .75 + i / 3 + 3) % 1;
        n.position.set(H.x - .9 + i * .9 + Math.sin(T * 2 + i * 2) * .18, H.y + .5 + u * .65, H.z + .2);
        n.rotation.set(0, Math.sin(T + i) * .4, Math.sin(T * 3 + i) * .25);
        escala(n, ns * Math.sin(u * Math.PI), .75);
      });
      const segs = 43 + Math.floor(Math.max(0, T - t('gancho', 3)) * 2), reloj = `${12 + Math.floor(segs / 60)}:${String(segs % 60).padStart(2, '0')}`;
      mostrar('espera', 'pill naranja', `En espera <span style="font-variant-numeric:tabular-nums">${reloj}</span><small>♪ música de espera ♪</small>`, H.clone().add(V(.15, -.95, .4)), 0, 46, ventana(T, t('gancho', 3, -.05), e('gancho') - .6, .25), false);

      const ts = entraSale(T, s('reporta') + .05, e('caso') - .4, .7, .4);
      escala(tel, ts, .58); tel.position.copy(TEL); tel.position.y += Math.sin(T * 1.3) * .05; tel.rotation.y = -.28 + Math.sin(T * .7) * .03;
      chat.dibujar(T);

      const ws = entraSale(T, t('reporta', 1, -.2), s('caso') - .3, .55, .4);
      escala(canalWA, ws); canalWA.position.copy(WA); canalWA.position.y += Math.sin(T * 1.8) * .08; canalWA.rotation.y = Math.sin(T * .9) * .3;

      let rb = ROB, rsc = 0, saludo = 0;
      if (!enLema) { rsc = entraSale(T, s('caso') - .2, e('caso') - .45, .7, .4) * .62; saludo = ventana(T, t('caso', 0, -.1), t('caso', 1, .3), .2); }
      else { rb = ROBL; rsc = eob(pr(T, s('lema') + .35, .7)) * .65 * salida; saludo = ventana(T, t('lema', 0, .9), total, .4); }
      robot.visible = rsc > .01; robot.scale.setScalar(Math.max(rsc, .001));
      robot.animar(T, rb, saludo); robot.rotation.y = enLema ? -.35 : .38;
      mostrar('rob', 'pill verde', 'Robot', ROB.clone().add(V(0, 1.25, 0)), 0, -40, ventana(T, t('caso', 0, -.1), e('caso') - .45, .25), false);

      mesa.updateMatrixWorld(true);
      const tk0 = t('caso', 3, -.15), tkV = e('caso') - .5, tkL = t('panel', 1, -.05);
      if (T >= tk0 && T < tkL) {
        ticket.visible = true;
        const sale = TEL.clone().add(V(-.4, -.6, .4));
        if (T < tkV) {
          const u = eo(pr(T, tk0, .6));
          ticket.position.lerpVectors(sale, TK, u); ticket.position.y += Math.sin(T * 1.7) * .05;
          ticket.rotation.set(Math.sin(T * 1.1) * .05, .22 + Math.sin(T * .9) * .08, (1 - u) * -.5 + Math.sin(T * 1.3) * .03);
          ticket.scale.setScalar(Math.max(eob(pr(T, tk0, .6)) * .58, .001));
        } else {
          const u = eio(pr(T, tkV, tkL - tkV)), dest = enPantalla(700, 262);
          ticket.position.lerpVectors(TK, dest, u); ticket.position.y += Math.sin(u * Math.PI) * .3;
          ticket.rotation.set(-.22 * u, .22 * (1 - u), Math.sin(u * Math.PI) * .15);
          ticket.scale.setScalar(Math.max(.58 * (1 - u * .35) * (u > .86 ? (1 - u) / .14 : 1), .001));
        }
      } else ticket.visible = false;

      const ms = entraSale(T, s('panel') - .55, s('seguimiento') + 1.3, .7, .45);
      escala(mesa, ms); escala(operador, ms);
      operador.position.set(PX - 1.75, 0, 2.3); operador.rotation.y = .5; operador.userData.cabeza.rotation.y = Math.sin(T * .8) * .15;
      filaNueva.estado = T >= tCambio ? 'En proceso' : 'Registrado';
      filaNueva.nuevo = T < tCambio + .4;
      if (mesa.visible) panel.dibujar(T);
      const fila = enPantalla(1245, 262);
      const enProceso = T >= tCambio;
      mostrar('tnuevo', enProceso ? 'pill naranja' : 'pill verde', enProceso ? 'En proceso' : 'Ticket nuevo', fila, -20, -125, ventana(T, t('panel', 2, -.25), e('panel') + .1, .25), false);

      const so0 = t('seguimiento', 0, .1), so1 = t('seguimiento', 1, .35);
      ana.updateMatrixWorld(true);
      if (T >= so0 && T < so1) {
        sobre.visible = true;
        const ini = enPantalla(800, 420), fin = celu.getWorldPosition(tmp).clone().add(V(0, .15, .25));
        const u = eio(pr(T, so0 + .35, so1 - so0 - .35));
        sobre.position.lerpVectors(ini, fin, u); sobre.position.y += Math.sin(u * Math.PI) * 1.8; sobre.position.z += Math.sin(u * Math.PI) * 1.5;
        sobre.rotation.set(0, Math.sin(u * Math.PI) * .5, Math.sin(T * 5) * .08);
        sobre.scale.setScalar(Math.max(eob(pr(T, so0, .4)) * (u > .85 ? (1 - u) / .15 : 1) * .9, .001));
      } else sobre.visible = false;

      const as = entraSale(T, s('seguimiento') + 1.1, e('seguimiento') - .25, .7, .4);
      escala(ana, as); ana.rotation.y = .18 + Math.sin(T * .7) * .06;
      const brillaCelu = ventana(T, so1 - .05, so1 + .9, .2);
      pantCelu.color.set(brillaCelu > .5 ? '#7BE36A' : '#D9FDD3');
      mostrar('ana', 'pill azul', 'Ana Gómez', V(CX + .5, 2.0, .3), 100, 0, ventana(T, s('seguimiento') + 2.0, e('seguimiento') - .3, .25), false);

      const ac = ventana(T, t('seguimiento', 2, -.1), e('seguimiento') - .1, .35);
      k.verTarjeta('correo', ac, `scale(${.92 + .08 * eo(ac)})`);
      const pb = pr(T, t('seguimiento', 3, -.05), .7);
      btn.style.transform = `scale(${1 + .1 * Math.sin(pb * Math.PI)})`;
      const ap = ventana(T, t('seguimiento', 4, -.1), e('seguimiento') - .1, .35);
      k.verTarjeta('pagina', ap, `scale(${.92 + .08 * eo(ap)})`);
      const hn = cl((T - t('seguimiento', 5, -.05)) / .25);
      nota.style.background = `rgb(${Math.round(lerp(234, 91, hn))},${Math.round(lerp(246, 176, hn))},${Math.round(lerp(231, 75, hn))})`;
      nota.style.color = hn > .5 ? '#fff' : '#2E7D32';
      notaIco.style.background = hn > .5 ? '#fff' : '#5BB04B'; notaIco.style.color = hn > .5 ? '#5BB04B' : '#fff';
      nota.style.transform = `scale(${1 + .06 * Math.sin(pr(T, t('seguimiento', 5, -.05), .6) * Math.PI)})`;

      const ls = enLema ? eob(pr(T, s('lema') + .7, .8)) * .7 * salida : 0;
      escala(logo, ls); logo.position.set(CX, 4.2 + Math.sin(T * 1.5) * .05, -1.0);
    },
  };
}
