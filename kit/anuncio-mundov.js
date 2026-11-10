// Formato «mundo en miniatura con narrador» (vertical): nadie habla a cámara; cada frase del narrador es una metáfora
// en una ciudad de noche vista desde arriba. La cámara no corta: vuela de un punto a otro y empuja despacio al esperar.
export default function (k) {
  const { THREE, scene, cam, s, e, c, w, cl, lerp, eo, eob, eio, pr, ventana, V, MARCA, W, mat, malla } = k;
  const total = k.TL.total, PRIM = MARCA.colores.primario;

  // ───────── Ciudad: el claro del centro es la plaza de la tienda; se despeja una avenida hacia la cámara ─────────
  const ciudad = k.crearCiudad({ n: 150, ancho: 80, fondo: 80, x: 0, z: 0, alto: [3, 11], semilla: 5, celda: 5, brillo: .9, encendidas: .4, claro: { x: 0, z: 0, r: 8.5 } });
  const eds = ciudad.userData.edificios;
  eds.forEach(b => { if (Math.abs(b.position.x) < 5.2 && b.position.z > 0) b.visible = false; });
  // 7 edificios (de izquierda a derecha, por detrás de la tienda) desde donde escriben los clientes
  const libres = eds.filter(b => b.visible), usados = new Set();
  const fuentes = [[-13, 2], [-11, -7], [-7, -13], [0, -17], [7, -13], [11, -7], [13, 2]].map(([x, z]) => {
    let m = null, dm = 1e9;
    for (const b of libres) { const d = Math.hypot(b.position.x - x, b.position.z - z); if (d < dm && !usados.has(b)) { dm = d; m = b; } }
    usados.add(m); const p = m.geometry.parameters; return { x: m.position.x, z: m.position.z, h: p.height, d: p.depth };
  });
  const grilla = scene.children.find(o => o.isGridHelper || o.type === 'GridHelper');

  // plaza y andén
  const plaza = malla(new THREE.CylinderGeometry(8.3, 8.3, .06, 72), mat('#1B2750', { roughness: .9 }), 0, .03, 0); plaza.castShadow = false;
  const anden = malla(new THREE.BoxGeometry(8.4, .14, 6.6), mat('#2B3868', { roughness: .85 }), 0, .07, .6); anden.castShadow = false;

  // avenida hacia la tienda: línea central y cebra (los faroles van más abajo)
  const mRaya = new THREE.MeshBasicMaterial({ color: '#5F6A9C' });
  const raya = (a, l, x, z) => { const r = new THREE.Mesh(new THREE.BoxGeometry(a, .03, l), mRaya); r.position.set(x, .02, z); scene.add(r); };
  for (let z = 12; z < 40; z += 3.5) raya(.28, 1.6, 0, z);
  for (let x = -3.6; x <= 3.61; x += 1.2) raya(.6, 1.9, x, 9.9);

  // ───────── La tienda (cajas): toldo de franjas, puerta, vitrina y letrero luminoso ─────────
  const tienda = new THREE.Group(); scene.add(tienda);
  const AN = 5.6, AL = 3.8, PF = 3.6, ZF = PF / 2, TECHO = AL + .22;
  const caja = (a, h, d, m, x, y, z) => malla(new THREE.BoxGeometry(a, h, d), m, x, y, z, tienda);
  const mPared = mat('#EFE3CC', { roughness: .85 }), mMarco = mat('#2F3566', { roughness: .5 }), mVerde = mat(PRIM, { roughness: .7 }), mBlanco = mat('#F6F7FB', { roughness: .7 });
  caja(AN, AL, PF, mPared, 0, AL / 2, 0);
  caja(AN + .2, .32, PF + .2, mMarco, 0, .16, 0);
  caja(AN + .5, .22, PF + .5, mMarco, 0, AL + .11, 0);
  const mVidrio = new THREE.MeshStandardMaterial({ color: '#141B36', emissive: '#FFD27A', emissiveIntensity: 1.3, roughness: .25 });
  caja(3.0, 1.62, .12, mMarco, -1.05, 1.2, ZF + .02); caja(2.72, 1.34, .14, mVidrio, -1.05, 1.2, ZF + .04);
  caja(.1, 1.34, .16, mMarco, -1.05, 1.2, ZF + .05);
  caja(1.32, 2.0, .12, mMarco, 1.8, 1.0, ZF + .02); caja(1.06, 1.8, .14, mat('#4658A6', { roughness: .5 }), 1.8, .96, ZF + .04);
  caja(.62, .7, .16, mVidrio, 1.8, 1.32, ZF + .05);
  malla(new THREE.SphereGeometry(.07, 12, 10), mBlanco, 1.42, .92, ZF + .14, tienda);
  const NF = 9, wf = (AN + .3) / NF;
  for (let i = 0; i < NF; i++) {
    const m = i % 2 ? mBlanco : mVerde, x = -(AN + .3) / 2 + wf * (i + .5);
    caja(wf, .07, 1.3, m, x, 2.36, ZF + .58).rotation.x = .4;
    caja(wf, .26, .06, m, x, 1.99, ZF + 1.18);
  }
  // letrero: plano con textura de canvas; material sin tone mapping para que se lea
  const rotulo = (txt, color) => {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 200; const g = cv.getContext('2d');
    g.fillStyle = '#120E1C'; g.fillRect(0, 0, 1024, 200);
    g.font = '900 150px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; try { g.letterSpacing = '12px'; } catch (x) { /* sin espaciado */ }
    g.shadowColor = color; g.shadowBlur = 24; g.fillStyle = color; g.fillText(txt, 518, 108);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(4.6, .9), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); p.position.set(0, 3.17, ZF + .1); tienda.add(p); return p;
  };
  caja(4.84, 1.06, .14, mMarco, 0, 3.17, ZF + .02);
  const abierto = rotulo('ABIERTO', '#FFD27A'), cerrado = rotulo('CERRADO', '#FF4D6D');

  // faroles: los dos del frente de la plaza alumbran de verdad; los demás (plaza y avenida) son solo el foco
  const mFoco = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE9C4').multiplyScalar(1.5), toneMapped: false });
  [[-4.6, 3.5], [4.6, 3.5], [-6.4, -3.6], [6.4, -3.6], [-4.7, 13], [4.7, 13], [-4.7, 20], [4.7, 20], [-4.7, 27], [4.7, 27], [-4.7, 34], [4.7, 34]].forEach(([x, z], i) => {
    malla(new THREE.CylinderGeometry(.06, .08, 3.3, 10), mMarco, x, 1.65, z);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 12), mFoco); b.position.set(x, 3.4, z); scene.add(b);
    if (i < 2) { const l = new THREE.PointLight('#FFE9C4', 16, 16); l.position.set(x, 3.3, z + .4); scene.add(l); }
  });
  const luzTienda = new THREE.PointLight('#FFE0A8', 50, 26); luzTienda.position.set(0, 3.4, 7); scene.add(luzTienda);
  const luzRoja = new THREE.PointLight('#FF4D6D', 0, 10); luzRoja.position.set(0, 3.2, ZF + 2.2); scene.add(luzRoja);
  const luzRobot = new THREE.PointLight('#F1FFF0', 0, 22); luzRobot.position.set(0, 8.5, 6.5); scene.add(luzRobot);

  // haces: el de la tienda sube desde el techo (se apaga al cerrar) y el del robot baja del cielo. Se les pone un
  // degradado para que se desvanezcan a lo lejos en vez de verse como un tubo.
  const degradado = claroArriba => { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 128; const g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, claroArriba ? '#ffffff' : '#000000'); gr.addColorStop(.55, claroArriba ? '#4a4a4a' : '#8a8a8a'); gr.addColorStop(1, claroArriba ? '#000000' : '#ffffff');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 128); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx; };
  const hazTienda = k.crearHaz({ color: '#FFE2A8', r0: 1.5, r1: 5, largo: 60, opacidad: .3 }); hazTienda.position.set(0, TECHO - .05, 0); hazTienda.rotation.set(Math.PI, Math.PI / 2, 0);
  hazTienda.material.map = degradado(true);
  const hazRobot = k.crearHaz({ color: '#C9F7BC', r0: .3, r1: 2.5, largo: 30, opacidad: .12 }); hazRobot.position.set(0, TECHO + 30, .2); hazRobot.rotation.y = Math.PI / 2;
  hazRobot.material.map = degradado(false);

  // ───────── Globos de chat: tres puntitos mientras nadie responde; verdes con ✓ cuando el robot contesta ─────────
  const forma = new THREE.Shape();
  { const a = .85, h = .58, r = .32;
    forma.moveTo(-a + r, -h); forma.lineTo(-.42, -h); forma.lineTo(-.56, -h - .34); forma.lineTo(-.08, -h); forma.lineTo(a - r, -h);
    forma.absarc(a - r, -h + r, r, -Math.PI / 2, 0); forma.absarc(a - r, h - r, r, 0, Math.PI / 2); forma.absarc(-a + r, h - r, r, Math.PI / 2, Math.PI); forma.absarc(-a + r, -h + r, r, Math.PI, Math.PI * 1.5); }
  const geoGlobo = new THREE.ExtrudeGeometry(forma, { depth: .12, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3, curveSegments: 12 }); geoGlobo.translate(0, 0, -.06);
  const geoPunto = new THREE.SphereGeometry(.11, 16, 12), mPunto = new THREE.MeshBasicMaterial({ color: '#59627A', transparent: true }), mVisto = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true });
  const mBorde = new THREE.MeshBasicMaterial({ color: '#141B36', transparent: true });
  // material sin luces: el blanco no se quema con el halo y los puntitos y el ✓ se leen siempre
  const BLANCO = new THREE.Color('#ffffff').multiplyScalar(1.04), VERDE = new THREE.Color(PRIM).multiplyScalar(1.2);
  // un arco de globos alrededor del sitio del robot (de izquierda a derecha)
  const SITIO = [[-2.45, 6.2], [-2.3, 7.85], [-1.75, 9.5], [0, 8.35], [1.75, 9.45], [2.3, 7.8], [2.45, 6.25]];
  const ORDEN = [0, 6, 2, 4, 1, 5, 3], VUELO = .8;
  const globos = fuentes.map((f, j) => {
    const g = new THREE.Group(); scene.add(g);
    // «transparent» con orden de dibujo alto: se pintan después de los haces de luz, que así no los lavan
    const m = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true });
    const borde = new THREE.Mesh(geoGlobo, mBorde), cuerpo = new THREE.Mesh(geoGlobo, m); borde.scale.set(1.07, 1.09, 1); borde.position.z = -.05; borde.renderOrder = 10; cuerpo.renderOrder = 11; g.add(borde, cuerpo);
    const puntos = [-.36, 0, .36].map(x => { const p = new THREE.Mesh(geoPunto, mPunto); p.position.set(x, 0, .13); p.renderOrder = 12; g.add(p); return p; });
    const visto = new THREE.Group(); visto.position.z = .14; g.add(visto);
    const a = new THREE.Mesh(new THREE.BoxGeometry(.38, .14, .05), mVisto); a.position.set(-.267, -.073, 0); a.rotation.z = -Math.PI / 4;
    const b = new THREE.Mesh(new THREE.BoxGeometry(.76, .14, .05), mVisto); b.position.set(.09, .09, 0); b.rotation.z = .9; a.renderOrder = b.renderOrder = 12; visto.add(a, b);
    const t0 = lerp(c('siguen', 0) + .05, w('siguen', 4) + .3, ORDEN.indexOf(j) / 6);      // sale del edificio
    const tOk = lerp(w('robot', 5), w('robot', 8) + .4, j / 6);                             // el robot lo responde
    k.sonar(t0, 'pop', .55); k.sonar(tOk, 'tic', .6);
    return { g, m, puntos, visto, t0, tOk, de: V(f.x, f.h + 1.6, f.z + f.d / 2 - .4), a: V(SITIO[j][0], SITIO[j][1], .9), fase: j * 1.7 };
  });

  // ───────── Figuras: un cliente en la azotea de cada edificio y gente que pasa por la calle ─────────
  const CALLE = [[-9.8, 5, .22, 0], [9.6, 5, -.2, 0], [10, -2, 0, .25], [-1.8, 15, 0, .45], [2.2, 31, 0, -.7], [-3.1, 24, 0, .3], [3.3, 17.5, 0, -.12]];
  const gente = k.crearMultitud({ n: 7 + CALLE.length, ancho: 1, fondo: 1, x: 0, z: 0, escala: 1, semilla: 9 });

  // ───────── Robot de la marca, sobre el techo ─────────
  const robot = k.crearRobot(); robot.scale.setScalar(1.25);
  const ROB = V(0, TECHO + .72, .2);

  // ───────── Momentos (todos salen del guion) ─────────
  const tBaja = w('noche', 3), tLlega = c('noche', 1) + .3, tCierra = w('noche', 9);
  const tHaz = c('robot', 0) + .05, tRobot = w('robot', 1) - .05, tSaluda = w('robot', 4);
  const tLogo = w('lema', 2), tLema = c('lema', 1) - .05;
  k.sonar(tBaja, 'paso', .45); k.sonar(tCierra, 'golpe', .6); k.sonar(tHaz, 'brillo', .6);
  k.sonar(s('lema') + .05, 'paso', .4); k.sonar(tLema, 'logro', .8);

  // ───────── Cámara: un solo vuelo, sin cortes ─────────
  k.setKF([
    [0, [4, 40, 66], [0, 4, -4]],
    [tBaja, [3.6, 37, 62], [0, 4, -4]],
    [tLlega, [1.2, 9, 26], [0, 3, 0]],
    [e('noche'), [.6, 8.2, 23.5], [0, 3, 0]],
    [s('siguen') + .9, [0, 21, 39], [0, 5, 0]],
    [e('siguen'), [0, 15, 30], [0, 4, 0]],
    [s('robot') + .8, [-1.4, 9.3, 25], [.3, 5.3, 0]],
    [e('robot'), [-.9, 9, 23.6], [.3, 5.3, 0]],
    [s('lema') + 1.2, [0, 27, 37], [0, 6.2, 0]],
    [total + .5, [0, 29, 39.5], [0, 6.2, 0]],
  ]);

  const X = W / 2, P = new THREE.Vector3();
  const SOMBRA = '<span style="text-shadow:0 0 20px #0A1026,0 0 46px #0A1026,0 8px 30px rgba(0,0,0,.7)">';
  return {
    actualizar(T) {
      k.tono('noche'); k.resplandor(.4);
      // la niebla se abre cuando la cámara sube, para que la vista aérea no se pierda
      scene.fog.near = 30 + cam.position.y * 1.3; scene.fog.far = 80 + cam.position.y * 2.4;
      if (grilla) grilla.visible = false;

      // tienda: abierta → cerrada
      const cierre = pr(T, tCierra - .04, .12), parpadeo = T < tCierra ? 0 : T < tCierra + .07 ? 1 : T < tCierra + .15 ? .2 : 1;
      mVidrio.emissiveIntensity = lerp(1.3, .03, cierre);
      abierto.visible = cierre < .5; cerrado.visible = !abierto.visible;
      abierto.material.color.setScalar(1.25); cerrado.material.color.setScalar(.25 + 1.2 * parpadeo);
      luzTienda.intensity = lerp(50, 20, cierre); luzRoja.intensity = 6 * parpadeo;
      hazTienda.material.opacity = lerp(.3, .13, pr(T, tBaja, tLlega - tBaja)) * (1 - pr(T, tCierra - .04, .2));

      // globos
      for (const b of globos) {
        const u = pr(T, b.t0, VUELO), v = eio(u), ok = pr(T, b.tOk, .16);
        b.g.visible = T >= b.t0;
        P.lerpVectors(b.de, b.a, v); P.y += Math.sin(Math.PI * v) * 4.5 + (u >= 1 ? Math.sin(T * 1.6 + b.fase) * .12 : 0);
        b.g.position.copy(P); b.g.quaternion.copy(cam.quaternion); b.g.rotateZ(Math.sin(T * 1.1 + b.fase) * .05 + (1 - v) * .5);
        b.g.scale.setScalar(eob(pr(T, b.t0, .25)) * lerp(.45, 1, eo(u)) * (1 + .18 * ventana(T, b.tOk, b.tOk + .3, .12)));
        b.m.color.lerpColors(BLANCO, VERDE, ok);
        b.puntos.forEach((p, i) => { p.visible = ok < .5; p.position.y = Math.max(0, Math.sin(T * 7 - i * .9 + b.fase)) * .13; });
        b.visto.visible = ok >= .5; b.visto.scale.setScalar(eob(pr(T, b.tOk + .06, .22)));
      }

      // figuras
      gente.cada(i => {
        if (i < 7) { const f = fuentes[i], b = globos[i]; return { x: f.x, y: f.h + Math.sin(Math.PI * pr(T, b.t0 - .12, .4)) * .5, z: f.z + f.d / 2 - .45, s: 2.2 }; }
        const [x, z, vx, vz] = CALLE[i - 7]; return { x: x + vx * T, y: 0, z: z + vz * T, s: 1.5 };
      });

      // robot: sale del techo dentro del haz, saluda y responde
      const haz = pr(T, tHaz, .25), sale = eob(pr(T, tRobot, .55));
      hazRobot.material.opacity = .12 * haz; luzRobot.intensity = 8 * pr(T, tRobot, .4);
      robot.visible = T >= tRobot; P.copy(ROB); P.y -= (1 - sale) * 2.6; robot.scale.setScalar(lerp(.8, 1.25, cl(sale)));
      robot.animar(T, P, ventana(T, tSaluda, e('robot') - .1, .2) + ventana(T, tLema, total + 1, .3));
      robot.rotation.y = -.06; robot.userData.sombra.visible = false;

      // títulos
      k.dato('hora', SOMBRA + '9:00 P.&nbsp;M.</span>', { x: X, y: 430, clase: 'titular', escala: 1.2 }, ventana(T, .08, c('noche', 1) - .2, .16));
      k.dato('logo', `<img src="${MARCA.logo}" style="width:340px;display:block;margin:0 auto">`, { x: X, y: 380, clase: 'claro' }, pr(T, tLogo, .3));
      k.dato('lema', SOMBRA + 'AUNQUE TÚ <b>NO ESTÉS</b></span>', { x: X, y: 610, clase: 'titular', escala: .74 }, pr(T, tLema, .3));
    },
  };
}
