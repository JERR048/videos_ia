# El guion y la voz

## 1. Antes de escribir: el contexto y lo que no se puede decir

1. **Lee las fuentes** del proyecto: manual, página web, documentos del usuario.
2. **Escribe un resumen corto** con:
   - qué hace el producto de verdad, con la cita o la página;
   - para quién es;
   - los términos exactos de la marca;
   - **la lista de lo que NO se puede prometer.**
3. **Cada frase del guion y cada texto en pantalla debe tener respaldo en ese resumen.** Si no lo tiene, no va.
4. **Nunca inventes una cifra, un caso ni una fuente.** Si falta el dato, pídelo o escribe la frase sin él.
   - Un negocio de ejemplo se inventa y se nota que es ejemplo («Veterinaria Patitas»).
   - «Caso real» solo si lo es y el usuario tiene permiso de contarlo.
5. **Un solo trato por video:** tú o usted.
6. **El texto del guion sale a un servicio de voz** (ElevenLabs, o Microsoft con el respaldo gratis). No pongas datos
   sensibles en él.

## 2. El gancho

Son los primeros 2 segundos y deciden si el video se ve. Tiene entre 9 y 24 palabras y hace tres cosas: confirma de
qué va el video, abre una pregunta que la misma frase no cierra y deja ver que la respuesta existe.

**Cómo escribirlo:** escribe cinco con fórmulas distintas, puntúalos y muéstrale al usuario los dos mejores. Nunca
entregues uno solo.

**Cinco propiedades. Manda la más débil, no el promedio:**

| Propiedad | Se cumple cuando | Arreglo |
|---|---|---|
| Concreto | Trae un número, un nombre o una fecha | Cambia un adjetivo por un dato |
| Dirigido | Dice «tú» o «tu» en las primeras seis palabras | Nombra al espectador |
| Con algo en juego | Dice lo que cuesta seguir igual | Nombra la pérdida |
| Abre una pregunta | No se responde a sí mismo | Corta la mitad que lo explica |
| Corto | Se dice de un aliento | Léelo en voz alta y corta donde falte el aire |

**Fórmulas:**

| Fórmula | Forma | Cuidado |
|---|---|---|
| La cifra | Un número que no se conocía, y su consecuencia | Tiene que poder verificarse |
| El resultado de otro | Lo que logró alguien con nombre, y cómo | No inventes el número |
| El error | El error que el espectador comete ahora mismo | Debe poder comprobarlo en un segundo |
| Lo contrario | El consejo de siempre, y por qué no | La prueba llega antes de 15 s |
| La revelación | «Te voy a mostrar exactamente…» | Muéstralo pronto |
| El reloj | «En los próximos 30 segundos…» | Que sea verdad |
| Lo probé | Un experimento propio, con su costo | Sin costo no hay historia |
| La pregunta | La que el espectador ya se hizo | Que sea la suya, no la tuya |
| Antes y después | Dos estados y un corte entre ellos | Solo funciona con imagen |
| La advertencia | Un costo que está por pagar | Si el costo es pequeño, es mentira |
| La lista | «3 cosas que…», con el número al principio | Número exacto y cosas distintas |
| La afirmación imposible | Algo que suena falso, y la prueba | La prueba empieza antes de 20 s |
| La comparación | Dos opciones con nombre y un ganador | Di cuál pierde |
| A ti | Nombra al espectador en seis palabras | Estrecho gana a amplio |
| La metáfora | «X es un videojuego», «tu WhatsApp es una tienda» | Tiene que sostener todo el video |

**En pantalla, durante el gancho:** un rótulo o una cifra con palabras distintas a las de la voz.

## 3. El cuerpo

- **Sin saludo, sin presentación y sin pedir que te sigan al principio.** Es la causa más común de que se vayan.
- **Una idea por tramo.** Cada tramo lleva escrito lo que se ve, no solo lo que se dice.
- **No digas con la voz lo que ya se ve.**
- **Cumple lo que prometió el gancho** y dilo.
- **Un solo pedido al final:** seguir, escribir, enviar el video a alguien o entrar a la web. No tres.
- **Termina en una frase, no en un desvanecido.** Si la última frase prepara la primera, el video se repite solo.
- La estructura de cada formato está en `formatos.md`.

**Ritmo de voz:**

| Formato | Palabras por segundo |
|---|---|
| Anuncio de producto | 2,0–2,4 |
| Diálogo, presentador, mundo en miniatura | 2,3–2,7 |
| Videojuego, cuento con dibujos | 3,0–3,7 |

`guion.py` imprime las palabras por segundo al final. Las pausas entre escenas (`antes` y `despues`) no deben pasar de
0,3 s en los formatos de redes, salvo la última.

## 4. El archivo `guiones/XX.json`

```json
{
  "titulo": "Diálogo de ejemplo",
  "archivo": "marca-dialogo",
  "formato": "dialogo",
  "subtitulos": "karaoke",
  "tono": "neon",
  "sinCierre": true,
  "musica": "pulso",
  "escenas": [
    { "id": "gancho", "habla": "ana", "antes": 0.15, "despues": 0.2,
      "trozos": ["Robot,", "¿quién *respondió*", "anoche", ["a las *9*?", "a las nueve?"]] },
    { "id": "yo", "habla": "robot", "antes": 0.1, "despues": 0.25,
      "trozos": ["*Yo*.", "Saludé,", "pedí los datos", "y avisé", "tu *horario*."] }
  ]
}
```

| Campo | Qué hace | Valores |
|---|---|---|
| `archivo` | Nombre del MP4 | El vertical lleva `-vertical` |
| `formato` | Solo informa; cambia la entrada del video (sin fundido lento si no es `anuncio`) | `anuncio`, `dialogo`, `presentador`, `mundo`, `videojuego`, `cuento` |
| `subtitulos` | Estilo de los subtítulos | `arriba` (anuncio), `karaoke`, `pastilla`, `caja` |
| `tono` | Ambiente por defecto | `dia`, `noche`, `neon`, `calido`, `sala`, `cielo`, `atardecer` |
| `sinCierre` | Quita la tarjeta final automática; el video cierra con su propia escena | `true` en los formatos de redes |
| `musica` | Cama de música sintetizada | `pad`, `pulso`, o nada |
| `musicaDb` | Nivel de la música bajo la voz | `-24` por defecto |
| `escenas[].habla` | Quién dice esa escena | Una clave de `marca.json → voces` |
| `escenas[].antes`, `despues` | Silencio antes y después de la voz, en segundos | 0,1–0,3 |

**Trozos:**

- Cada trozo es lo que sale junto en pantalla: de 1 a 4 palabras (hasta 8 en `caja` y `pastilla`).
- Como mucho una `*palabra*` resaltada por trozo.
- `["lo que se lee", "lo que se dice"]` sirve para números, horas y siglas.
- **Un número entre los trozos es una pausa en segundos:** `["¿Cómo atendiste", "a tu cliente?", 0.5, "Pregúntale,"]`.
  La escena se dice en dos tramos con ese silencio en medio, y los índices de `c('escena', n)` no cambian. Sirve
  cuando una pregunta llega pegada a la frase siguiente.
- La voz se pide por escena: si corriges una escena, solo esa vuelve a gastar caracteres.
- **En `karaoke`, un trozo de más de 16 letras se parte en dos renglones.** Divídelo en dos trozos. Repartir de otra
  forma los trozos de una escena no cambia su texto, así que no vuelve a gastar voz; solo hay que revisar los índices
  de `c('escena', n)` en la escena.

## 5. La marca y las voces: `marca.json`

```json
{
  "nombre": "Tu Marca",
  "logo": "img/logo.png",
  "colores": { "primario": "#2F7BE5", "acento": "#6FB1FF", "fondo": "#EEF3F8", "franja": ["#2F7BE5", "#18B4A6", "#F2A93B", "#E2566E"] },
  "voz": {
    "motor": "elevenlabs", "id": "yfUfwZTRubVrsUZWqzwp", "modelo": "eleven_multilingual_v2",
    "estabilidad": 0.5, "similitud": 0.75, "estilo": 0.0, "velocidad": 1.08,
    "nombre": "es-CO-SalomeNeural",
    "pronunciacion": { "www.tumarca.com": "triple doble ve punto tu marca punto com", "IA": "inteligencia artificial" }
  },
  "voces": {
    "robot": { "rotulo": "Robot" },
    "narra": { "rotulo": "Tu Marca" },
    "ana": { "id": "scn1gPWkdVd8FhODJoei", "nombre": "es-CO-SalomeNeural", "rotulo": "Ana" }
  },
  "cierre": { "dice": ["Conoce más", "en *www.tumarca.com*."], "lineas": ["Conoce más en", "www.tumarca.com"], "datos": [{ "icono": "telefono", "texto": "+57 300 000 0000" }] }
}
```

- `voz` es la voz de la marca. Cada entrada de `voces` hereda de ella y cambia lo que indique.
- `rotulo` es el nombre que sale en el cuadro de diálogo del formato videojuego.
- `acento` es el color de la palabra resaltada en los subtítulos sobre fondo oscuro; si falta, se usa `primario`.
- `pronunciacion` cambia lo que dice la voz sin cambiar lo que se lee. Una marca que se dice distinto de como se
  escribe va ahí.
- **La tilde decide dónde cae el acento.** WhatMas debe sonar «Wátmas», con el acento en la primera sílaba:
  `"WhatMas": "Guátmas"`. Con «Guatmás» sonaba «whatmás» y el usuario lo corrigió el 10 de noviembre de 2026.
- **«panel»** se marcó como mal pronunciada en una revisión: `"panel": "panél"` fuerza el acento al final.
- La transcripción con Whisper no distingue dónde cae el acento: solo una persona lo oye. Después de cambiar una
  pronunciación, pídele al usuario que escuche esa palabra.
- Los datos del cierre los confirma el usuario.

**Voces de ElevenLabs del dueño de esta habilidad** (noviembre de 2026):

| Voz | Id | Uso |
|---|---|---|
| Lina, colombiana cálida | `yfUfwZTRubVrsUZWqzwp` | La voz de la marca: narradora y mascota |
| Voz de hombre para anuncios | `245Mc01N5He6XcoEmywB` | Locutor de anuncios; la eligió el usuario el 10 de noviembre de 2026. En `marca.json` es `voces.locutor` |
| Voz de mujer para anuncios | `UNIruiz09F4kWYjRpOvy` | Locutora de anuncios; la dio el usuario el mismo día. En `marca.json` es `voces.locutora` |
| Maria, colombiana joven | `scn1gPWkdVd8FhODJoei` | Segundo personaje en los diálogos |
| Andrea HC, colombiana | `MGYo7RNNx4bZenYcO0Xl` | Alternativa |

- Para un diálogo se necesitan dos voces distintas: el locutor con la locutora, o Lina con Maria.
- Las dos voces de anuncios no aparecen en la lista de voces de la cuenta, pero funcionan al pedirlas por su id.
- **Desde el 10 de noviembre de 2026 los videos nuevos alternan locutor y locutora** (pedido del usuario), y los 16
  anuncios de producto de WhatMas se rehicieron con la locutora. Lina queda como voz anterior.
- Una voz sin `id` sale con el respaldo gratis (`edge-tts`), aunque el motor sea ElevenLabs.
- Para usar al locutor en una escena: `"habla": "locutor"`. Para que sea la voz de todo un anuncio, pon su id en
  `marca.json → voz.id`.

## 6. Generar la voz

```bash
python guion.py XX        # debe decir «alineadas N/N» en cada escena
python tiempos.py XX      # momentos útiles para revisar
```

- **La clave de ElevenLabs** sale de la variable `ELEVENLABS_API_KEY` o del secreto `ElevenLabsApiKey` de SecretStore.
  Nunca va en un archivo, en el chat ni en un commit. Se guarda una vez por PC:
  ```powershell
  Install-Module Microsoft.PowerShell.SecretManagement, Microsoft.PowerShell.SecretStore -Scope CurrentUser
  Register-SecretVault -Name Local -ModuleName Microsoft.PowerShell.SecretStore -DefaultVault
  Set-SecretStoreConfiguration -Scope CurrentUser -Authentication None -Interaction None
  Set-Secret -Name ElevenLabsApiKey      # pide la clave; no queda en el historial
  ```
- **Costo:** ElevenLabs cobra por carácter. Una prueba de 15 s gasta unos 200; un video de 60 s, unos 800.
  Cada escena queda guardada en `build/cache-voz/` y no se vuelve a pedir mientras no cambien su texto ni la voz.
- **La clave del usuario no tiene permiso para consultar el saldo.** Si ElevenLabs responde que se acabó la cuota,
  avísale y ofrece el respaldo.
- **Respaldo gratis:** `VOZ_MOTOR=edge python guion.py XX` usa las voces de Microsoft (`pip install edge-tts`).
  Sirve para probar tiempos sin gastar.
- **Comprueba la pronunciación** transcribiendo `build/XX/voz.wav` con faster-whisper. El agente no oye:
  ```python
  import numpy as np, subprocess
  from faster_whisper import WhisperModel
  pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "build/XX/voz.wav", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
  audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
  segs, _ = WhisperModel("medium", device="cpu", compute_type="int8").transcribe(audio, language="es")
  print(" ".join(s.text for s in segs))
  ```
- **Avísale al usuario que escuche** el nombre de la marca y las palabras en inglés antes de publicar.

## 7. Si cambia el guion o la voz de un video ya animado

- **Cambia el texto de una escena:** vuelve a correr `guion.py`. Lo atado a `c()`, `s()`, `e()` y `w()` se acomoda solo.
  Si cambió el número de trozos, revisa los índices de `c('escena', n)`.
- **Cambia la voz o la velocidad:** cambian todos los tiempos. Revisa tres cosas:
  1. Lo que pasa después de la última frase de una escena puede no caber ya. Compara el margen de cada
     `c('id', n) + x` hasta `e('id')` con la línea de tiempo vieja y alarga `despues` hasta recuperarlo.
  2. Los cortes de cámara: `node revisar_cortes.mjs XX XXv`.
  3. Cuadros del video viejo y del nuevo, lado a lado, en los mismos momentos del guion.
