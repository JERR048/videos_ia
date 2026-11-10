# Errores conocidos

Cada fila costó tiempo una vez. Búscala aquí antes de depurar.

## Imagen

| Síntoma | Causa | Arreglo |
|---|---|---|
| Todo se ve lavado o quemado en un fondo claro | Resplandor o post-proceso sobre fondo claro | En ambientes claros no llames `k.resplandor`; el render directo ya usa `NeutralToneMapping` |
| La mascota blanca se quema en un ambiente oscuro | El resplandor toma las superficies blancas iluminadas | Baja `k.resplandor` a 0,3–0,45; el umbral del motor ya es 1,05 y el ambiente `neon` ya trae menos luz |
| El fondo de ciudad compite con los personajes | Ventanas muy brillantes, edificios cerca | `crearCiudad({ z: -38, brillo: .55, encendidas: .3 })` |
| Un cuadro vacío en un corte | Llaves de cámara separadas 0,01–0,03 s | Usa `k.planos` o dos llaves a 0,001 s; comprueba con `node revisar_cortes.mjs XX XXv` |
| El subtítulo anterior se queda 1–2 cuadros después de un corte | El corte cae antes del cambio de subtítulo | Corta en `c('escena', n) - .06`; el motor cambia el subtítulo 0,08 s antes de la palabra |
| Un parpadeo vacío antes del cierre automático | Los objetos se encogen antes de que aparezca la tarjeta | `salida` empieza en `s('cierre') + .15`, debajo de la tarjeta opaca |
| Paneo con cuadros vacíos en vertical | El cuadro es angosto: 2 o 3 anchos en un segundo | Un corte, o acercar los dos sets |
| Las sombras desaparecen lejos del origen | La luz que da sombra cubre unos 30 m a cada lado | Pon los escenarios entre x = −26 y x = 26 |
| Texto del chat diminuto | El celular está lejos | Escala 0,58 a 9–13 m; el chat ya trae zoom 1,3 |
| Algo «salta» al revisar | Estado guardado entre cuadros | Todo debe calcularse a partir de `T` |
| Un personaje 2D se ve de canto | El cartel no gira hacia la cámara | Gíralo en Y hacia la cámara en cada cuadro |
| En el cuadro de diálogo de videojuego el «2» parece «8» y la «c», «o» | La letra Pixelify Sans es ambigua a ese tamaño | El motor ya usa VT323 en el cuadro de diálogo; para rótulos cortos, `Press Start 2P` (clase `pix`) |
| Una letra con tilde se encoge en el modo videojuego | La fuente pixelada no trae ese carácter | Usa mayúscula sin tilde con la tilde dibujada, o cambia la palabra |
| Los discos de canal salen girados | La textura del cilindro | Usa `crearCanal`, que ya trae la corrección |
| El texto del panel invade la zona segura del vertical | El panel es apaisado | Encuadre más amplio, paneo lento o una versión angosta del contenido |
| Un objeto de primer plano parece una mancha | Lo corta el borde del cuadro | Que se reconozca entero, o quítalo |

## Voz y sonido

| Síntoma | Causa | Arreglo |
|---|---|---|
| «Falta la clave de ElevenLabs» | No está `ELEVENLABS_API_KEY` ni el secreto `ElevenLabsApiKey` | Que el usuario la guarde con `Set-Secret` (`guion.md` §6). Nunca en un archivo ni en el chat |
| ElevenLabs responde 401 al consultar el saldo | La clave no tiene el permiso `user_read` | No se puede consultar el saldo con ella; sigue y avisa si la cuota se acaba |
| `guion.py` no alinea (N/M) | Signos o números que la voz lee distinto | Usa `["se lee", "se dice"]` en ese trozo |
| La voz dice mal la marca | La lee como está escrita | `marca.json → voz.pronunciacion`; comprueba con Whisper |
| Tras cambiar la voz, algo queda cortado al final de una escena | La voz nueva es más rápida | Alarga `despues` de esa escena hasta recuperar el margen |
| Un video sale más bajo que otro (−18 LUFS) | Cada voz de ElevenLabs tiene su volumen; la de hombre salía más baja | `sonido.py` ya lleva la mezcla a −16 LUFS; vuelve a correr `armar.sh` |
| El pico de audio pasa de −1 dBTP en el MP4 | Recomprimir el audio AAC una segunda vez puede subir el pico más de 3 dB | `armar.sh` ya copia el audio del render sin recomprimirlo y `sonido.py` trae un limitador suave; si mezclas a mano, deja 3 dB de margen |
| Silencio de más de 0,6 s en medio | Pausas `antes` + `despues` largas entre escenas | Bájalas a 0,1–0,2 s |
| faster-whisper falla con `metadata_errors` | El PyAV instalado no es compatible | Pásale el audio como arreglo de numpy, leído con ffmpeg |

## Herramientas

| Síntoma | Causa | Arreglo |
|---|---|---|
| ffmpeg o Chrome no aparecen | No están en el PATH | `FFMPEG=…`, `CHROME=…` |
| `ModuleNotFoundError: numpy` con `python -I` | El modo aislado no ve los paquetes del usuario | Corre los scripts del kit sin `-I` |
| `Pattern type 'glob' … not supported` en ffmpeg | La versión de Windows no trae comodines | Usa `-start_number 0 -i cuadro_%d.jpg` |
| Tildes rotas en la salida de Python | La consola de Windows no está en UTF-8 | `PYTHONIOENCODING=utf8`; `sonido.py` y `revisar_video.py` ya lo fijan |
| Un script largo pegado en la terminal falla por comillas | Los bloques largos con comillas se rompen | Escribe el script en un archivo y córrelo |
| El render es lentísimo o se cuelga | La carpeta está en OneDrive o Dropbox | Copia el kit a una carpeta local fuera de la nube |
| Se cierra el navegador del usuario | Alguien mató todos los `chrome.exe` | Nunca mates procesos de Chrome que no sean tuyos |
