# La escena: `anuncio-XX.js`

Cada video es un archivo que recibe el kit en `k` y devuelve `actualizar(T)`. `anuncio-XX.js` es el horizontal
(1920×1080) y `anuncio-XXv.js` el vertical (1080×1920). Los dos usan `guiones/XX.json` y `timeline-XX.json`.
Los formatos de redes se hacen solo en vertical.

```js
export default function (k) {
  const { THREE, scene, s, e, c, cl, pr, ventana, V, MARCA, W } = k;
  const ana = k.crearPersonaje({ camisa: '#C73E70' }); ana.scale.setScalar(.85);
  const robot = k.crearRobot(); robot.scale.setScalar(.7);
  k.planos({ general: [[.15, 3, 11.6], [.15, 2, 0]], ana: [[-.45, 2.65, 6.4], [-1.05, 2.3, 0]] },
           [[0, 'general'], [c('gancho', 1) - .06, 'ana']]);
  k.sonar(c('gancho', 1), 'pop');
  return {
    actualizar(T) {
      k.resplandor(.45);
      ana.animar(T, V(-1.05, .16, 0), { habla: k.boca(T, 'ana'), sorpresa: ventana(T, c('gancho', 1), e('gancho')) });
      k.dato('p1', '¿Quién respondió?', { x: W / 2, y: 470, giro: -4, clase: 'globo' }, ventana(T, c('gancho', 1), e('gancho'), .16));
    },
  };
}
```

## Las cuatro reglas del modelo

1. **`actualizar(T)` es función pura del tiempo.** No guarda estado entre cuadros: el render salta a cualquier `T`.
2. **Todo tiempo va atado al guion,** más un desfase. Nunca segundos escritos a mano: si cambia la voz, no se mueven.
   - `k.s(id)` y `k.e(id)`: inicio y fin de una escena;
   - `k.c(id, n)`: cuándo se dice el trozo `n`;
   - `k.w(id, n)`: cuándo se dice la palabra `n` de la escena (para escenas de una sola frase);
   - `k.TL.total`: duración total.
3. **Lo que se crea, se crea una vez** (fuera de `actualizar`): mallas, luces, planos de cámara, sonidos.
4. **Lo que falte en el kit se construye en tu archivo** con `k.THREE`. No se edita el motor para un solo video.

## El cuadro vertical (1080×1920)

| Zona | Píxeles | Qué va |
|---|---|---|
| Prohibida arriba | y 0–220 | Nada importante: la tapa el encabezado de la aplicación |
| Tarjetas y rótulos | y 260–700 | Una tarjeta de dato, un globo de pregunta, un titular |
| Caras | y 650–1100 | La cara de quien habla |
| Subtítulo | y 1250–1450 | Lo pone el motor; debajo puede ir el cuerpo o el piso, nada que haya que leer |
| Prohibida abajo | y 1480–1920 | Solo piso y pies: la tapan el usuario, la descripción y la caja de respuesta |
| Columna derecha | x 930–1080, y 880–1480 | Nada importante: ahí van los botones de me gusta, comentar y compartir |

- En el anuncio de producto los subtítulos van arriba (y 250–420) y lo importante debajo de y 450.
- **Cámara de 36° vertical:** a una distancia `d` se ve de alto 0,65·`d` m y de ancho 0,366·`d` m; la escala es de
  2955/`d` px por metro. Con eso se calcula dónde cae cada cosa antes de sacar una foto.
- **Dos cosas lado a lado casi no caben:** apílalas, usa la profundidad o haz un corte.
- Las previas (`fotos.sh XXv …`) pintan las zonas prohibidas en rosa. El video final no.

## Cámara

- **`k.planos(planos, lista, { deriva })`** para diálogo y presentador:
  ```js
  k.planos({ general: [[px, py, pz], [mx, my, mz]], cerca: [[…], […]] },
           [[0, 'general'], [c('yo', 1) - .06, 'cerca'], [s('cta'), 'general', .5]]);
  ```
  - Cada entrada corta a ese plano en su tiempo. Con un tercer valor llega moviéndose en esos segundos.
  - Cada plano empuja despacio hacia donde mira (`deriva`, 5 % por defecto): ninguno queda quieto.
  - Anota solo un soplo de sonido en cada corte (`{ sonido: false }` lo quita).
- **`k.setKF([[t, [pos], [mira]], …])`** para vuelos continuos (mundo en miniatura, cuento, anuncio de producto).
  Interpola con suavizado. Un corte son dos llaves separadas 0,001 s.
- **Cuándo cortar y cuándo deslizar:**
  - corta cuando cambia quien habla, cambia la idea o el encuadre salta más de medio cuadro;
  - desliza (0,6–1,3 s) cuando sigue la misma idea;
  - corta 0,06 s antes de la palabra que abre el plano.
- Después de cualquier cambio: `node revisar_cortes.mjs XX XXv`.

## Ambiente

- El guion fija el ambiente por defecto (`"tono"`). En un cuadro se puede cambiar con `k.tono('sala')` o mezclar dos
  con `k.tono('cielo', 'noche', u)`.
- Ambientes: `dia` y `noche` (anuncio de producto), `neon` (oscuro, para tarima con luces), `calido` (cuarto oscuro
  cálido), `sala` (interior claro), `cielo` (exterior de día), `atardecer`.
- `k.resplandor(.45)` en cada cuadro enciende el halo de lo que emite luz. Solo en ambientes oscuros.
- `k.ambiente(n)` sigue sirviendo en el anuncio de producto: 0 es día y 1 es noche.
- Las sombras cubren unos 30 m a cada lado del origen: los escenarios van entre x = −26 y x = 26.

## Piezas

### Personajes

| Pieza | Uso |
|---|---|
| `k.crearRobot()` | La mascota de la marca. `robot.animar(T, base, saludo, { habla, sorpresa, brazos })`. Escala 0,7–0,8. Sobre un pedestal: `robot.userData.sombra.visible = false` |
| `k.crearPersonaje({ camisa, piel, pelo, pantalon, zapatos })` | Persona de pie con cara. Mide 3,35 m a escala 1; el centro de la cabeza queda a 2,78 × escala. `p.animar(T, base, { habla, feliz, sorpresa, preocupado, brazos, senala, gira })`: todo de 0 a 1, `gira` en radianes. `brazos` sube los dos brazos y lo hace saltar |
| `k.crearPersona(camisa, piel, pelo)` | Persona sentada con diadema (el equipo de atención). Brazos en `userData.brazos` |
| `k.crearMultitud({ n, ancho, fondo, x, z, escala, orden, colores })` | Figuras pequeñas sin cara. `.cada((i, base) => ({ x, y, z, s }))` las mueve en cada cuadro; `.pintar(i, color)` |
| `k.boca(T, 'quien')` | De 0 a 1: apertura de la boca siguiendo las palabras de esa voz |
| `k.hablando(T, 'quien')`, `k.quien(T)` | Si esa voz suena ahora; quién habla ahora |

### Escenario

| Pieza | Uso |
|---|---|
| `k.crearTarima({ radio, color })` | Plataforma redonda con aro de luz |
| `k.crearPedestal({ radio, alto, color })` | Pedestal para la mascota |
| `k.crearCiudad({ n, ancho, fondo, x, z, alto: [min, max], semilla, brillo, encendidas, claro: { x, z, r }, celda })` | Edificios con ventanas encendidas. De fondo: lejos y tenue. Como mundo en miniatura: centrada, con `claro` para dejar un hueco |
| `k.crearHaz({ color, r0, r1, largo, opacidad })` | Cono de luz que apunta hacia abajo desde su posición |
| `k.crearLuna()` | Luna; las estrellas quedan en `.userData.estrellas` |
| `k.crearCanal('whatsapp' \| 'instagram' \| 'messenger' \| 'telegram', radio)` | Disco de canal |

### Producto en pantalla (anuncio de producto)

| Pieza | Uso |
|---|---|
| `k.crearChat()` + `k.crearTelefono(chat)` | Celular con chat tipo WhatsApp. `chat.conf.mensajes = [{ t, lado: 'in' \| 'out', texto, tipo }]`; tipos: `sistema`, `botones`, `lista`, `imagen`, `catalogo`, `carrito`, `documento`. `chat.dibujar(T)` en cada cuadro. Escala 0,58 a 9–13 m |
| `k.crearPanelUI()` + `k.crearPortatil(panel)` | Portátil con panel de administración. `panel.conf.modo`: `bandeja`, `tablero`, `tickets`, `pedido`, o una función propia `(t, g, ayudas) => {}` |
| `chat.conf.encima = (g, t, ayudas) => {}` | Dibuja encima de todo el chat (un formulario, por ejemplo) |

El detalle de estas piezas está en `kit/ejemplos/KIT-whatmas.md` y las reglas del vertical en
`kit/ejemplos/KIT-VERTICAL-whatmas.md`.

### Tarjetas de dato

`k.dato(id, html, { x, y, w, giro, clase, ancla, dx, dy, escala }, alfa)` en cada cuadro. `x, y` son el centro en px;
con `ancla` (un `Vector3`) la tarjeta sigue un punto 3D. `alfa` suele ser `k.ventana(T, t0, t1, .18)` (aparece y
desaparece) o `k.pr(T, t0, .3)` (aparece y se queda).

| `clase` | Qué es |
|---|---|
| `''` | Tarjeta oscura con borde del color de la marca |
| `'claro'` | Tarjeta blanca (para el logo y el cierre) |
| `'claro etq'` | Rótulo pequeño de contexto («9:00 p. m. · Veterinaria Patitas») |
| `'globo'` | Rótulo inclinado con la pregunta, sobre quien la hace |
| `'titular'` | Texto gigante sin caja, de 2 o 3 palabras; `<b>` sale en el color de acento |
| `'pix'` | Rótulo de videojuego; `<b>` sale amarillo; `<div class="pbarra"><i style="width:40%"></i></div>` es una barra |

Dentro de una tarjeta:

```js
'<div class="d-et">Conversaciones atendidas</div>'            // rótulo pequeño
`<div class="d-num bien">${k.num(k.sube(T, t0, .5, 0, 7))}</div>`   // cifra grande que sube; `bien` verde, `mal` rojo
'<div class="d-tit">Enviar plantilla</div><div class="d-sub">Cada envío tiene costo</div>'
k.fila('Saludó', 'ok', k.pr(T, c('yo', 1), .25))              // casilla: 'ok' ✓, 'no' ✕, 'pt' •
k.barra(u, color)                                             // barra de avance, u de 0 a 1
k.boton('www.tumarca.com', '', u)                             // botón; 'claro' lo hace blanco
```

- `k.num(n, decimales)` da el número con formato de Colombia; `k.sube(T, t0, dur, a, b)` es el valor de un contador.
- `k.cursor(x, y, alfa, clic)` dibuja un cursor; `k.confeti(T, t0, { x, y })` suelta confeti.
- **Una tarjeta por idea.** Tamaño mínimo de letra legible en el celular: 26 px.
- Las del kit clásico siguen: `k.mostrar(id, clase, html, ancla, dx, dy, alfa, linea)` (etiqueta con línea guía),
  `k.tarjeta` + `k.verTarjeta` (tarjeta blanca fija), `k.letraPequena(texto)` (bajo el cierre automático).

### Videojuego

- `k.pixelar(5)` una vez, fuera de `actualizar`: el 3D se renderiza con píxeles gordos. Con 4 casi no se nota y con 6
  se emborronan las caras.
- El subtítulo `caja` hace de cuadro de diálogo, con el `rotulo` de la voz como nombre. Usa la letra VT323: con
  Pixelify Sans el «2» se leía «8» y la «c», «o».
- El marcador y los rótulos de nivel son tarjetas `'pix'`.
- En modo píxel no hay resplandor.

### Ayudas

`k.THREE`, `k.scene`, `k.cam`, `k.mat(color, opts)`, `k.brillo(color, i)`, `k.malla(geo, material, x, y, z, padre)`,
`k.RoundedBoxGeometry`, `k.V(x, y, z)`, `k.cl`, `k.lerp`, `k.eio`, `k.eo`, `k.eob`, `k.pr(T, a, d)` (avance de 0 a 1),
`k.ventana(T, a, b, f)` (0→1→0), `k.azar()`, `k.W`, `k.H`, `k.VERT`, `k.MARCA`, `k.TL`, `k.SC`.

### Piezas que viven en los ejemplos

Se copian del archivo de ejemplo cuando hagan falta. Si se usan en un tercer video, se pasan al motor.

| Pieza | Dónde |
|---|---|
| Pared, puerta con bisagra, ventana con cielo, sofá, alfombra, mesita con lámpara, melena | `anuncio-presentav.js` |
| Nivel de plataformas con ladrillos, celular de pie con globo de chat, bloque de menú que se golpea desde abajo, tienda con persianas, cartel con reloj, luna, portátil con panel, bandera que sube | `anuncio-juegov.js` |
| Puerta con bisagra y marco de neón, reloj de segmentos, plantilla con sello, celular sencillo, burbuja con estela, cursor sobre la pantalla del portátil | `anuncio-robotv.js` |
| Tienda con toldo y letrero de canvas, ventana con halo, globo de chat de cuatro estados, menú flotante, cartel con reloj, paso de noche a día, faroles, paso de cebra | `anuncio-mundov.js` |
| Personaje 2D de dibujo (`dibujo()`: cartel que mira a cámara, con expresiones), contorno de tinta (`entintar()` por casco invertido y `placa()` para cosas planas), `cartel()` y globos, `halo()`, `encuadre()` | `anuncio-cuentov.js` |
| Router, carrito, calendario, formulario, montones de documentos | `ejemplos/anuncio-03.js`, `anuncio-04.js` |

## El cierre

- **Formatos de redes:** `"sinCierre": true` en el guion, y la última escena del video es el cierre: la marca en una
  tarjeta `'claro'` con el logo (`<img src="${MARCA.logo}">`), un solo pedido y, si aplica, un botón con el cursor.
  El último segundo queda limpio.
- **Anuncio de producto:** el cierre automático pone la tarjeta final opaca con el logo, la web y el contacto, entre
  `s('cierre') + .1` y `+ .55`. Encoge los objetos mientras aparece, no antes:
  ```js
  const salida = 1 - eio(pr(T, s('cierre') + .15, .4));
  ```

## Horizontal y vertical

- Si las dos composiciones se parecen, un solo archivo que mire `k.VERT`, y un `anuncio-XXv.js` que reexporte:
  `export { default } from './anuncio-XX.js';`.
- Si son distintas, dos archivos. El vertical recompone: mismas escenas, otras posiciones.
- Los números 1920 y 1080 escritos a mano se rompen al pasar de un formato a otro: usa `k.W` y `k.H`.
