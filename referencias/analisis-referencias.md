# Formatos de video que funcionan en redes: análisis y recetas

> Hecho el 2026-11-10. Sale de mirar cuadro por cuadro y transcribir seis videos de TikTok que el usuario trajo como
> referencia, y de leer dos repositorios públicos de habilidades para Claude sobre videos. De cada referencia se toma
> el formato y los números, nunca el guion, los personajes ni las escenas.

## 1. Qué se analizó y cómo

Cada video se midió con ffprobe (tamaño, duración), detección de cortes de ffmpeg, hojas de contacto de un cuadro por
segundo y transcripción con tiempos por palabra (faster-whisper).

| Ref. | Cuenta | Formato | Duración | Palabras/s | Cambio visual | Subtítulos |
|---|---|---|---|---|---|---|
| A | Fabio (monetización con IA) | Diálogo: persona + mascota | 62 s | 2,5 | corte cada 2,1 s (29 cortes) | Mayúsculas gruesas, 1–3 palabras, al 69 % del alto; la palabra se enciende al decirse |
| B | Fabio | Presentador que explica, con cambio de escenario | 73 s | 2,6 | escenario nuevo cada 5–10 s; tarjeta nueva cada 2–3 s | Igual que A |
| C | Fabio | Videojuego en pixel art | 45 s | 3,2 | un nivel cada 8–10 s; sin cortes, la pantalla se desplaza | Cuadro de diálogo de juego, con retrato y texto que se escribe |
| D | Daybi GO | Persona a cámara + grabación de pantalla | 58 s | 4,3 | corte cada 4 s (14 cortes) | Minúsculas blancas pequeñas; en el segundo 0, un rótulo rojo gigante |
| E | kevin.rf99 | Mundo en miniatura con narrador | 127 s | 2,7 | la cámara vuela; un lugar nuevo cada 2–13 s | Frase corta en pastilla negra, al 73 % del alto |
| F | kevin.rf99 | Mundo en miniatura con narrador | 134 s | 2,3 | igual que E | Igual que E |

Repositorios leídos (los dos con licencia MIT):

- `mromidev/claude-animated-shorts`: una habilidad para cortos de historia de 55–70 s con personajes 2D dentro de un
  mundo 3D con contorno de tinta. Trae la medición de 20 cortos de referencia: ritmo, cámara, color, sonido y un
  control de calidad cuadro por cuadro.
- `jakeschincariol/youtube-agent-skill`: once habilidades de guion y empaque para YouTube: 21 fórmulas de gancho, un
  puntuador de ganchos, reglas de título y miniatura, lectura de la retención.

## 2. Lo que tienen en común los seis (la receta base)

1. **El gancho ocupa los primeros 2 segundos y ya lleva algo concreto.** Ninguno saluda ni presenta el canal.
   - A: una pregunta con una cifra exacta («¿por qué me va a pagar 5.894 dólares?»).
   - B: una contradicción («puede ser buenísimo y aun así nadie lo ve»).
   - C: una metáfora («crecer en YouTube es un videojuego»).
   - D: una orden en contra («deja de copiar canales hasta que entiendas esto»).
   - E: un reloj que involucra al que mira («tienes tres segundos…»).
   - F: una pregunta que todos se han hecho («¿por qué no imprimimos dinero hasta que todos seamos ricos?»).
2. **En el primer cuadro hay texto en pantalla que no repite la voz.** Un rótulo de contexto («Caso real»), una cifra
   o el título.
3. **Cambia algo cada 1–2,5 s:** un corte, una tarjeta, un gesto, un número que sube. Ningún plano se queda quieto:
   cuando no corta, la cámara empuja despacio.
4. **Una idea por tramo y una imagen por idea.** Cada frase tiene su prueba visual: un contador, una lista que se
   arma, una barra, una comparación A contra B, un objeto que representa la idea.
5. **La voz va rápida y sin pausas:** 2,3 a 3,2 palabras por segundo en los animados; los silencios de más de 0,3 s
   casi no existen.
6. **Subtítulos siempre, grandes y cortos**, hacia el 70 % del alto, lejos de los botones de la aplicación.
7. **El cierre pide una sola cosa** y la muestra: botón con cursor (A), «¿ya sabías esto? sígueme» (B), «clase gratis
   en mi bio» (C), «comenta la palabra…» (D), «mándaselo a esa persona que…» (E). F cierra con una idea práctica.
8. **Son verticales** y duran 45–75 s (diálogo, presentador, juego) o 2 minutos (documental).
9. **Enseñan algo que sirve aunque no compres nada.** La marca entra como quien lo explica, no como el tema.

## 3. Los formatos

### 3.1 Diálogo con mascota (ref. A)

- **Qué es:** una persona que representa al espectador pregunta; la mascota experta responde. Pregunta corta,
  respuesta corta.
- **Cuándo usarlo:** para vender un resultado o desmontar dudas («¿y quién hace…?», «¿y cuánto…?»). Es el que más se
  parece a un anuncio sin serlo.
- **Estructura (60 s):** gancho en pregunta con cifra → 5 a 7 pares de pregunta y respuesta → «¿y por qué funcionó?» →
  «debí hacerte caso» → cierre con botón.
- **Imagen:** escenario oscuro con luces de color, tarima con aro, ciudad al fondo. Corte al primer plano de quien
  habla; plano general cuando aparece una tarjeta. La pregunta sale además en un rótulo inclinado sobre quien la hace.
- **Tarjetas:** contador que sube, lista de casillas que se arma al ritmo de la voz, cifra grande.
- **Voces:** dos, bien distintas.

### 3.2 Presentador que explica (ref. B)

- **Qué es:** un solo personaje explica un concepto en tres o cuatro pasos, con un ejemplo de números.
- **Cuándo usarlo:** para enseñar un término o una regla («qué es el CTR», «la ventana de 24 horas»).
- **Estructura (70 s):** contradicción → «el culpable tiene nombre» → definición → ejemplo con números redondos →
  «mira la diferencia» (A contra B) → consecuencia → consejo → «¿ya sabías esto? sígueme».
- **Imagen:** cada paso tiene su escenario y su paleta (oficina oscura, cuarto cálido, sala clara, tarima). El
  personaje cambia de emoción con el paso: preocupado, pensativo, feliz. Una tarjeta por idea, arriba.

### 3.3 Videojuego (ref. C)

- **Qué es:** el proceso se cuenta como niveles de un juego retro, con marcador, cuadro de diálogo y jefe final.
- **Cuándo usarlo:** para un proceso por pasos o un camino con obstáculo («de cero a monetizar en 4 niveles»).
- **Estructura (45 s):** «X es un videojuego» → nivel 1, 2, 3 (el jefe final es el obstáculo) → nivel 4 (modo
  automático) → «desbloqueado» → cierre.
- **Imagen:** pixel art, marcador con contador que sube, rótulos «NIVEL n», barra de vida del jefe, «K.O.». La voz va
  más rápida (3,2 palabras/s).

### 3.4 Mundo en miniatura con narrador (refs. E y F)

- **Qué es:** un documental corto. Nadie habla a cámara; un narrador cuenta y cada frase se vuelve una metáfora en una
  ciudad en miniatura: una torre que vigila, una balanza, una subasta, una imprenta de billetes.
- **Cuándo usarlo:** para explicar cómo funciona algo grande e invisible (un algoritmo, la inflación, «qué pasa con
  tus mensajes de noche»). Es el más compartible y el que aguanta 2 minutos.
- **Estructura (2 min):** gancho que mete al espectador → título → cómo funciona, en 3 o 4 mecanismos → giro («y
  además te estudia a ti») → qué puedes hacer → vuelta al gancho → cierre que pide compartir.
- **Imagen:** vista aérea, vuelos de cámara continuos, casi sin cortes; títulos gigantes de 2–3 palabras; íconos
  planos en círculos; nada de tarjetas de interfaz.

### 3.5 Cuento con dibujos en un mundo 3D (repositorio `claude-animated-shorts`)

- **Qué es:** una historia real y absurda contada en 60 s, con personajes 2D de dibujo dentro de un mundo 3D pintado.
- **Cuándo usarlo:** para contar una anécdota o un caso con causa y efecto visibles. Sirve para canal propio de
  curiosidades más que para anuncio.
- **Fórmula del guion (20 de 20 cortos medidos):** paradoja dicha como hecho en la primera frase → lugar y fecha en
  una línea → 3 a 6 pasos que escalan → una pregunta → «verás,» y el mecanismo con una comparación cotidiana → remate
  irónico. Termina en la última palabra, sin despedida.
- **Ritmo:** 3,7 palabras/s, casi sin pausas; sonoridad de −14 LUFS.
- **Imagen:** casi nunca corta (0–1 cortes por video); la cámara se desliza 0,6–1,3 s y luego empuja 0,15–0,35 % por
  cuadro; fundido de 6–8 cuadros al cambiar de lugar; destello blanco tras el gancho.

### 3.6 Persona a cámara con pantalla (ref. D)

- **Qué es:** una persona real habla a cámara y alterna con la grabación de su pantalla.
- **Cuándo usarlo:** cuando la prueba es una pantalla real (un panel, un resultado) y hay alguien dispuesto a grabarse.
- **No se anima:** necesita video grabado. El kit puede poner los rótulos y los subtítulos, no la persona.
- **Lo que enseña su guion:** no copiar un canal al 100 %; validar qué le funciona (títulos, personaje, tema,
  miniaturas) y llevar ese formato a otro nicho.

### 3.7 Anuncio de producto (el que ya hacíamos)

- **Qué es:** 25–50 s, claro y luminoso, con el celular, el panel y la mascota. Muestra el producto funcionando.
- **Cuándo usarlo:** pauta pagada, página web, presentación comercial. No busca retención orgánica.

## 4. Cómo elegir el formato antes de escribir

| Si lo que quieres es… | Usa | Dura |
|---|---|---|
| Mostrar el producto funcionando, para pauta o la web | Anuncio de producto | 25–50 s |
| Responder dudas de compra o contar un resultado | Diálogo con mascota | 45–60 s |
| Enseñar un concepto o una regla con un ejemplo | Presentador que explica | 45–75 s |
| Explicar un proceso por pasos | Videojuego | 30–45 s |
| Explicar cómo funciona algo grande o invisible | Mundo en miniatura | 60–130 s |
| Contar una anécdota con remate | Cuento con dibujos | 55–70 s |
| Mostrar una pantalla o un resultado real con una persona | Persona a cámara | 30–60 s |

Tres preguntas que deciden:

1. **¿Quién habla?** Dos voces → diálogo. Una voz con cara → presentador. Una voz sin cara → mundo o cuento.
2. **¿Qué forma tiene la idea?** Pregunta y respuesta → diálogo. Definición y ejemplo → presentador. Pasos → juego.
   Mecanismo → mundo. Historia → cuento.
3. **¿Dónde va?** Pauta o web → anuncio. Alcance orgánico en Reels, TikTok o Shorts → cualquiera de los otros.

## 5. El guion

**Ritmo de voz por formato:** anuncio 2,0–2,4 palabras/s; diálogo, presentador y mundo 2,3–2,7; juego y cuento 3,0–3,7.

**El gancho** (primeros 2 s, 9 a 24 palabras). Escribe cinco, puntúalos y quédate con dos para mostrarle al usuario.
Cinco propiedades, y manda la más débil:

- **Concreto:** un número, un nombre o una fecha en vez de un adjetivo.
- **Dirigido:** «tú» o «tu» en las primeras seis palabras.
- **Con algo en juego:** lo que cuesta seguir igual.
- **Abre una pregunta** que la misma frase no cierra.
- **Corto:** se dice de un aliento.

Fórmulas de gancho que sirven en español:

| Fórmula | Forma | Cuidado |
|---|---|---|
| La cifra | Un número que no se conocía, y su consecuencia | Tiene que ser verificable |
| El resultado de otro | Lo que logró alguien con nombre, y cómo | No inventes el número |
| El error | El error que el espectador comete ahora | Tiene que poder comprobarlo en un segundo |
| Lo contrario | El consejo de siempre, y por qué no | La prueba llega en 15 s |
| La revelación | «Te voy a mostrar exactamente…» | Muéstralo pronto |
| El reloj | «En los próximos 30 segundos…» | Que sea verdad |
| Lo probé | Un experimento propio con su costo | Sin costo no hay historia |
| La pregunta | La que el espectador ya se hizo | Que sea la suya, no la tuya |
| Antes y después | Dos estados y un corte | Solo con imagen |
| La advertencia | Un costo que está por pagar | Si el costo es pequeño, es mentira |
| La lista | «3 cosas que…», con el número al principio | El número exacto, cosas distintas |
| La afirmación imposible | Algo que suena falso, y la prueba | La prueba empieza en 20 s |
| La comparación | Dos opciones con nombre y un ganador | Di cuál pierde |
| A ti | Nombra al espectador en seis palabras | Estrecho gana a amplio |

**Reglas del cuerpo:**

- Sin saludo, sin «antes de empezar», sin pedir seguir al principio.
- Cada tramo lleva escrito lo que se ve en pantalla, no solo lo que se dice.
- No describas con la voz lo que ya se ve.
- Cumple lo que el gancho prometió y dilo («ese es el truco»).
- Un solo pedido al final.
- El corto que mejor circula tiene un giro adentro y termina en una frase, no en un desvanecido. Si la última frase
  prepara la primera, el video se repite solo.

**Nunca inventes una cifra, un caso ni una fuente.** Si falta el dato, se pide o se escribe la frase sin él. Un negocio
de ejemplo se nombra como ejemplo; «caso real» solo si lo es y hay permiso.

## 6. La imagen

- **Zonas del cuadro vertical (1080×1920):** tarjetas en y 260–700, caras en y 650–1100, subtítulo en y 1250–1450.
  Prohibido: y 0–220, y 1480–1920 y la columna x 930–1080 entre y 880 y 1480.
- **Cámara:** corta cuando cambia quien habla o cuando el encuadre salta más de medio cuadro; desliza (0,6–1,3 s, con
  arranque y frenada) cuando sigue la misma idea. Un plano quieto empuja 0,15–0,35 % por cuadro.
- **Reacciones:** el gesto o la tarjeta llegan entre 0 y 3 cuadros antes de la palabra, nunca después.
- **Caras:** parpadeo de 4 cuadros cada 0,5–2,3 s; la emoción cambia con el paso de la explicación.
- **Subtítulos:** tres estilos según el formato: karaoke (diálogo, presentador, cuento), pastilla (mundo) y cuadro de
  diálogo (juego).
- **Trampas de lectura que encontraron otros:** un objeto de primer plano cortado por el borde se lee como una mancha;
  un rótulo iluminado de lado se vuelve gris; nada de primer plano debe tapar una cara; un movimiento rápido sin
  desenfoque se ve barato; los negros puros en áreas grandes se ven sucios (mejor oscuros con color).

## 7. El sonido

Los seis tienen efectos y casi todos música. Niveles medidos en el repositorio de cortos, referidos a la voz:

| Qué | Cuándo | Nivel bajo la voz |
|---|---|---|
| Soplo de cámara | En cada corte o deslizamiento | −17 a −19 dB |
| Golpe o «pop» | Cuando aparece una tarjeta | −14 dB |
| Timbre corto | Cada casilla marcada | −15 dB |
| Impacto | El momento que rompe | −6 a −11 dB |
| Música | Todo el video; baja 3 dB mientras hay voz | −10 a −12 dB en cortos de historia; −24 dB como colchón |

Sonoridad final: entre −16 y −14 LUFS, con el pico real por debajo de −1 dBTP. El agente no oye: siempre lo escucha una
persona antes de publicar.

## 8. Control de calidad del MP4

- Tamaño, duración, que tenga audio, peso por debajo de 15 MB.
- Sin cuadros negros en medio, sin imagen congelada más de 0,4 s, sin silencios de más de 0,6 s.
- Sonoridad y pico dentro del rango.
- Seis a ocho cuadros sacados del MP4 final, cierre incluido.

## 9. Método para copiar un estilo sin copiar el video

1. **Medir antes de opinar:** números (cortes por minuto, palabras por segundo, posición del subtítulo), no adjetivos.
2. **Un dueño por archivo** cuando trabajan varios agentes.
3. **Un revisor que no lo hizo** compara lado a lado y puntúa por área.
4. **El guion, los personajes y la voz siempre son propios.**

## 10. Lo que el video E dice sobre el alcance en Instagram

Son afirmaciones de ese video, sin verificar aquí: un video se prueba primero con un grupo pequeño; pesa si lo pasan
antes de 3 segundos o si lo ven hasta el final; que lo envíen a alguien pesa más que el «me gusta». De ahí sale la
regla práctica: gancho en 2 segundos, razones para llegar al final y un cierre que invite a enviarlo.
