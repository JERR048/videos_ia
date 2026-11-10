// Formato «diálogo con mascota» (vertical): una persona pregunta, la mascota responde.
// Cortes entre primeros planos en cada cambio de voz, una tarjeta de dato por idea y cierre con botón.
export default function (k) {
  const { THREE, scene, s, e, c, cl, pr, ventana, V, MARCA, W } = k;
  const total = k.TL.total, PRIM = MARCA.colores.primario, ROSA = '#C73E70';

  k.crearCiudad({ z: -38, ancho: 96, fondo: 24, alto: [9, 30], n: 70, semilla: 4, brillo: .55, encendidas: .3 });
  k.crearTarima({ radio: 3.4 });
  const pedestal = k.crearPedestal({ radio: .8, alto: 1.1 }); pedestal.position.set(.95, .16, 0);
  const ana = k.crearPersonaje({ camisa: ROSA }); ana.scale.setScalar(.85);
  const robot = k.crearRobot(); robot.scale.setScalar(.7);
  const l1 = new THREE.PointLight(PRIM, 40, 16); l1.position.set(3.6, 3.6, 3); scene.add(l1);
  const l2 = new THREE.PointLight(ROSA, 30, 16); l2.position.set(-3.8, 3.2, 2.6); scene.add(l2);

  const ANA = V(-1.05, .16, 0), ROB = V(.95, 1.71, 0);
  k.planos({
    general: [[.15, 3.0, 11.6], [.15, 2.0, 0]],
    ana: [[-.45, 2.65, 6.4], [-1.05, 2.3, 0]],
    robot: [[.4, 2.55, 6.4], [.95, 2.25, 0]],
    final: [[.15, 2.6, 12.8], [.15, 3.0, 0]],
  }, [
    [0, 'general'], [c('gancho', 1) - .06, 'ana'],
    [s('yo') + .04, 'robot'], [c('yo', 1) - .06, 'general'],
    [s('cuantos') + .04, 'ana'],
    [s('siete') + .04, 'robot'], [c('siete', 1) - .06, 'general'],
    [s('cta'), 'final', .5],
  ]);

  // sonidos: un golpe suave cuando entra cada tarjeta y un timbre por cada casilla
  k.sonar(c('gancho', 1), 'pop'); k.sonar(c('yo', 1), 'pop');
  [1, 2, 4].forEach(n => k.sonar(c('yo', n) + .05, 'tic'));
  k.sonar(s('cuantos') + .1, 'pop'); k.sonar(c('siete', 0), 'sube'); k.sonar(c('cta', 0), 'logro');

  const X = W / 2;
  return {
    actualizar(T) {
      k.resplandor(.45);
      const fin = ventana(T, s('cta') + .2, total + 1, .3);
      ana.animar(T, ANA, {
        habla: k.boca(T, 'ana'), gira: .38,
        sorpresa: .7 * ventana(T, c('gancho', 1), e('gancho'), .2) + .5 * ventana(T, s('cuantos'), e('cuantos'), .2) + .6 * ventana(T, c('siete', 0), c('siete', 1), .15),
        preocupado: .7 * ventana(T, 0, s('yo'), .2),
        feliz: pr(T, c('siete', 1), .4), brazos: fin,
      });
      robot.animar(T, ROB, ventana(T, c('yo', 0) - .1, c('yo', 1) + .3, .2), { habla: k.boca(T, 'robot'), brazos: fin });
      robot.rotation.y = -.35; robot.userData.sombra.visible = false;

      k.dato('lugar', '9:00 p. m. · Veterinaria Patitas', { x: X, y: 300, clase: 'claro etq' }, ventana(T, .1, e('gancho') - .05, .15));
      k.dato('p1', '¿Quién respondió?', { x: X - 20, y: 470, giro: -4, clase: 'globo' }, ventana(T, c('gancho', 1), e('gancho') - .05, .16));
      k.dato('lista', '<div class="d-et">Anoche, el robot</div>' + k.fila('Saludó', 'ok', pr(T, c('yo', 1), .25)) + k.fila('Pidió los datos', 'ok', pr(T, c('yo', 2), .25)) + k.fila('Avisó el horario', 'ok', pr(T, c('yo', 4), .25)),
        { x: X, y: 440, w: 760 }, ventana(T, c('yo', 1) - .05, e('yo') - .05, .18));
      k.dato('p2', '¿Cuántos?', { x: X - 20, y: 470, giro: 4, clase: 'globo' }, ventana(T, s('cuantos') + .1, e('cuantos') - .05, .16));
      k.dato('siete', `<div class="d-et">Conversaciones atendidas</div><div class="d-num bien">${k.num(k.sube(T, c('siete', 0), .5, 0, 7))}</div><div class="d-sub" style="opacity:${cl(pr(T, c('siete', 1), .3)).toFixed(2)}">Ya están en tu panel</div>`,
        { x: X, y: 420, w: 760 }, ventana(T, c('siete', 0) - .05, e('siete') - .05, .18));

      const a = pr(T, c('cta', 0) - .05, .3);
      k.dato('cta', `<img src="${MARCA.logo}" style="width:520px;display:block;margin:0 auto 6px"><div class="d-tit" style="text-align:center;color:#0E1620">Tu WhatsApp <b style="color:${PRIM}">responde</b><br>aunque tú no estés</div>` + k.boton((MARCA.cierre.lineas || [])[1] || MARCA.nombre, '', pr(T, c('cta', 2), .3)),
        { x: X, y: 560, w: 820, clase: 'claro' }, a);
      k.confeti(T, c('cta', 0), { y: .25 });
      const cu = pr(T, c('cta', 2) + .2, .6);
      k.cursor(X + 250 - (1 - k.eo(cu)) * 260, 815 + (1 - k.eo(cu)) * 330, cu, ventana(T, c('cta', 3), c('cta', 3) + .3, .1));
    },
  };
}
