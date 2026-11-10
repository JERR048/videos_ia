// Revisa las llaves de cámara de cada anuncio con la línea de tiempo actual (timeline-XX.json):
// que vayan en orden y que ningún cuadro i/30 caiga dentro de un corte (llaves a menos de 0,05 s).
// Córrelo después de regenerar la voz: si la voz cambia, cambian los tiempos.
// Uso: node revisar_cortes.mjs XX XXv ...   (sin argumentos revisa demo y demov)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

const root = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
let ads = process.argv.slice(2);
if (!ads.length) ads = ['demo', 'demov'];
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, b) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); s.end(b); });
}).listen(0);
const port = srv.address().port;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
let problemas = 0;
for (const ad of ads) {
  const p = await b.newPage();
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  const vert = ad.endsWith('v');
  await p.setViewport(vert ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 });
  await p.goto(`http://127.0.0.1:${port}/escena.html?ad=${ad}`);
  await p.waitForFunction('window.ready === true', { timeout: 120000 });
  const { kf, total } = await p.evaluate(() => ({ kf: (window.__KF || []).map(x => x[0]), total: window.TOTAL }));
  const avisos = [];
  for (let i = 0; i + 1 < kf.length; i++) {
    const a = kf[i], z = kf[i + 1];
    if (!(z > a)) avisos.push(`llaves fuera de orden: #${i} ${a.toFixed(3)} → #${i + 1} ${z.toFixed(3)}`);
    else if (z - a < 0.05) {
      for (let f = Math.ceil(a * 30); f / 30 <= z; f++) if (f / 30 > a && f / 30 < z) avisos.push(`cuadro ${f} (${(f / 30).toFixed(3)} s) dentro del corte ${a.toFixed(4)}–${z.toFixed(4)}`);
    }
  }
  if (!kf.length) avisos.push('sin llaves (¿no se llamó setKF?)');
  for (const e of errores) avisos.push('error de página: ' + e);
  problemas += avisos.length;
  console.log(`${ad.padEnd(4)} total ${total.toFixed(2)} s · ${kf.length} llaves · ${avisos.length ? avisos.join(' | ') : 'ok'}`);
  await p.close();
}
await b.close(); srv.close();
console.log(problemas ? `PROBLEMAS: ${problemas}` : 'todo ok');
