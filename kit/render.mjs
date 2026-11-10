import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const root = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, b) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); s.end(b); });
}).listen(0);
const port = srv.address().port;
const [ad = '01', modo = 'fotos', ...resto] = process.argv.slice(2);
const VERT = ad.endsWith('v'), base = ad.replace(/v$/, '');
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const p = await b.newPage();
p.on('pageerror', e => console.error('ERROR página:', e.message));
p.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) console.error('consola:', m.text()); });
await p.setViewport(VERT ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 });
await p.goto(`http://127.0.0.1:${port}/escena.html?ad=${ad}${VERT && modo === 'fotos' && !process.env.SIN_GUIAS ? '&guias=1' : ''}`);
await p.waitForFunction('window.ready === true', { timeout: 120000 });
const total = await p.evaluate('window.TOTAL');
const dir = path.join(root, 'build', ad);
fs.mkdirSync(dir, { recursive: true });
// Los efectos de sonido que anotó el anuncio (k.sonar, k.planos) quedan en build/XX/sonidos.json para sonido.py
fs.writeFileSync(path.join(dir, 'sonidos.json'), JSON.stringify({ total, sonidos: await p.evaluate('window.__SONIDOS || []') }));
if (modo === 'sonidos') { console.log('sonidos anotados'); await b.close(); srv.close(); process.exit(0); }

if (modo === 'fotos') {
  const fd = path.join(dir, 'fotos'); fs.rmSync(fd, { recursive: true, force: true }); fs.mkdirSync(fd, { recursive: true });
  const tiempos = resto.map(Number);
  let i = 0;
  for (const t of tiempos) {
    for (const d of [-0.3, -0.15, 0]) await p.evaluate(x => window.render(x), Math.max(0, t + d));
    await p.screenshot({ type: 'jpeg', quality: 88, path: path.join(fd, `n${String(i++).padStart(3, '0')}.jpg`) });
  }
  console.log('fotos', tiempos.length, 'total', total);
} else {
  const fps = 30, n = Math.ceil(total * fps), salida = path.join(dir, 'alta.mp4');
  const ff = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-i', fs.existsSync(path.join(dir, 'mezcla.wav')) ? path.join(dir, 'mezcla.wav') : path.join(root, 'build', base, 'voz.wav'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', salida], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await p.evaluate(x => window.render(x), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`cuadro ${i}/${n} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('listo', salida, ((Date.now() - t0) / 1000).toFixed(0), 's');
}
await b.close(); srv.close();
