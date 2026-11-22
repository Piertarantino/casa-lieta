// Crea l'immagine 1080×1350 di un post con Chromium (Playwright).
// Due modelli: "carta" (grafica con le creste dei Simbruini) e "foto" (una foto + testo).
// "foto": foto vere di Casa Lieta (risorse/foto). "illustrazione": immagini generate con l'AI (risorse/illustrazioni),
// solo scene di montagna e di territorio, mai la casa; portano sempre la scritta "Immagine illustrativa".
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIR, PALETTE } from './lib.mjs';

const R = join(DIR, 'risorse');
const b64 = (f) => readFileSync(f).toString('base64');
const font = (nome, file, peso) => `@font-face{font-family:"${nome}";src:url(data:font/woff2;base64,${b64(join(R, 'font', file))}) format("woff2");font-weight:${peso}}`;
const FONT = [
  font('Marcellus', 'marcellus-latin-400-normal.woff2', 400),
  font('Instrument Sans', 'instrument-sans-latin-400-normal.woff2', 400),
  font('Instrument Sans', 'instrument-sans-latin-500-normal.woff2', 500),
  font('Instrument Sans', 'instrument-sans-latin-600-normal.woff2', 600),
  font('IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', 400),
  font('IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', 500),
].join('');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Creste dei Simbruini, stesso algoritmo del sito (src/components/Ridges.astro).
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }
function cresta(seed, base, amp, passi, w = 1080, h = 300) {
  const r = rng(seed); const pts = []; let v = 0;
  for (let i = 0; i <= passi; i++) { v = v * 0.55 + (r() - 0.5) * amp; pts.push([(i * w) / passi, base + v + Math.sin((i / passi) * Math.PI * 2 + seed) * amp * 0.6]); }
  let d = `M0 ${h} L0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`; }
  return d + ` L${w} ${pts[pts.length - 1][1].toFixed(1)} L${w} ${h} Z`;
}
function creste(pal, seme = 7) {
  const s = [seme, seme + 12, seme + 24, seme + 36];
  const strati = [cresta(s[0], 80, 80, 18), cresta(s[1], 135, 66, 22), cresta(s[2], 190, 50, 26), cresta(s[3], 240, 30, 30)];
  return `<svg class="creste" viewBox="0 0 1080 300" preserveAspectRatio="none">${strati.map((d, i) => `<path d="${d}" fill="${pal.r[i]}"/>`).join('')}</svg>`;
}

function marchio(stagione, negativo = false) {
  const f = join(R, 'logo', negativo ? 'marchio-CL-pieno-negativo.svg' : `marchio-CL-pieno-stagione-${stagione}.svg`);
  return `<img class="marchio" src="data:image/svg+xml;base64,${b64(f)}" alt="">`;
}

const seme = (id) => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7) + 1;

function datiHTML(dati) {
  if (!dati?.length) return '';
  return `<div class="dati">${dati.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
}

export function html(p, stagione) {
  const pal = PALETTE[stagione];
  const illustrata = !!p.illustrazione;
  const fileFoto = illustrata ? join(R, 'illustrazioni', p.illustrazione) : p.foto ? join(R, 'foto', p.foto) : null;
  const foto = fileFoto && existsSync(fileFoto) ? fileFoto : null;
  const altezza = p.fotoAltezza || 790;
  const titolo = esc(p.titolo).replace(/\n/g, '<br>');
  const lungo = p.titolo.length > 46;
  const css = `${FONT}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1080px;height:1350px}
  body{background:${pal.bg};color:${pal.ink};font-family:"Instrument Sans",sans-serif;position:relative;overflow:hidden}
  .rubrica{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:${pal.accent}}
  h1{font-family:"Marcellus",serif;font-weight:400;line-height:1.08;letter-spacing:-.005em;color:${pal.ink}}
  .sotto{font-size:36px;line-height:1.38;color:${pal.muted};max-width:900px}
  .dati{display:flex;gap:56px;font-family:"IBM Plex Mono",monospace;border-top:2px solid ${pal.line};padding-top:26px}
  .dati span{display:block;font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:${pal.muted};margin-bottom:6px}
  .dati b{font-weight:500;font-size:34px;color:${pal.ink}}
  .piede{position:absolute;left:84px;right:84px;bottom:56px;display:flex;justify-content:space-between;align-items:center;font-family:"IBM Plex Mono",monospace;font-size:26px;letter-spacing:.08em;z-index:3}
  .marchio{width:96px;height:96px;position:absolute;top:72px;right:84px;z-index:3}
  .creste{position:absolute;left:0;bottom:0;width:1080px;height:330px;z-index:1}`;

  let corpo;
  if (foto) {
    corpo = `
    <style>
      .foto{position:absolute;left:0;top:0;width:1080px;height:${altezza}px;background:url(data:image/jpeg;base64,${b64(foto)}) ${p.fotoPosizione || 'center'}/cover}
      .testo{position:absolute;left:84px;right:84px;top:${altezza + 60}px;display:flex;flex-direction:column;gap:26px}
      h1{font-size:${lungo ? 60 : 70}px}
      .sotto{font-size:32px}
      .marchio{top:auto;bottom:40px;right:84px;width:84px;height:84px}
      .piede{right:200px;color:${pal.muted}}
      .etichetta{position:absolute;left:28px;top:${altezza - 62}px;font-family:"IBM Plex Mono",monospace;font-size:19px;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.42);padding:7px 14px;border-radius:4px}
      .striscia{position:absolute;left:0;right:0;top:${altezza}px;height:10px;background:${pal.accent}}
    </style>
    <div class="foto"></div><div class="striscia"></div>
    ${illustrata ? '<div class="etichetta">Immagine illustrativa</div>' : ''}
    <div class="testo"><div class="rubrica">${esc(p.rubrica)}</div><h1>${titolo}</h1>${p.sottotitolo ? `<p class="sotto">${esc(p.sottotitolo)}</p>` : ''}</div>
    ${marchio(stagione)}
    <div class="piede"><span>${esc(p.luogo || 'Subiaco · Monte Livata')}</span></div>`;
  } else {
    const ev = p.evento;
    let blocco = '';
    if (ev) {
      const mesi = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
      const d = new Date(ev.inizio + 'T12:00:00Z');
      const f = ev.fine ? new Date(ev.fine + 'T12:00:00Z') : null;
      blocco = `<div class="calendario"><b>${d.getUTCDate()}${f ? '–' + f.getUTCDate() : ''}</b><span>${mesi[(f || d).getUTCMonth()]} ${(f || d).getUTCFullYear()}</span></div>`;
    }
    corpo = `
    <style>
      body{background:${pal.paper}}
      .cielo{position:absolute;inset:0;background:linear-gradient(180deg,${pal.paper} 0%,${pal.bg} 70%)}
      .testo{position:absolute;left:84px;right:84px;top:200px;bottom:360px;display:flex;flex-direction:column;justify-content:center;gap:34px;z-index:2}
      h1{font-size:${lungo ? 84 : 100}px}
      .calendario{display:flex;align-items:baseline;gap:22px;z-index:2;font-family:"IBM Plex Mono",monospace;color:${pal.accent}}
      .calendario b{font-family:"Marcellus",serif;font-weight:400;font-size:120px;line-height:1}
      .calendario span{font-size:32px;letter-spacing:.12em;text-transform:uppercase}
      .marchio{top:64px}
      .rubrica-top{position:absolute;left:84px;top:84px;z-index:2}
      .piede{color:${pal.paper}}
    </style>
    <div class="cielo"></div>
    <div class="rubrica rubrica-top">${esc(p.rubrica)}</div>
    ${marchio(stagione)}
    <div class="testo">${blocco}<h1>${titolo}</h1>${p.sottotitolo ? `<p class="sotto">${esc(p.sottotitolo)}</p>` : ''}${datiHTML(p.dati)}</div>
    ${creste(pal, seme(p.id))}
    <div class="piede"><span>${esc(p.luogo || 'Subiaco · Monte Livata')}</span><span>casalieta.it</span></div>`;
  }
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><style>${css}</style></head><body>${corpo}</body></html>`;
}

let browser;
export async function apri() {
  if (!browser) { const { chromium } = await import('playwright'); browser = await chromium.launch(); }
  return browser;
}
export async function chiudi() { if (browser) await browser.close(); browser = null; }

// Salva il JPEG in "uscita" e restituisce il percorso.
export async function creaImmagine(p, stagione, uscita) {
  const b = await apri();
  const pagina = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await pagina.setContent(html(p, stagione), { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  // Controllo: il testo non deve uscire dallo spazio disponibile.
  const sfora = await pagina.evaluate(() => {
    const t = document.querySelector('.testo'); const piede = document.querySelector('.piede');
    const limite = document.querySelector('.creste') ? document.querySelector('.creste').getBoundingClientRect().top + 60 : piede.getBoundingClientRect().top - 10;
    return t.scrollHeight > t.clientHeight + 16 || [...t.children].some((c) => c.getBoundingClientRect().bottom > limite || c.getBoundingClientRect().top < 150);
  });
  await pagina.screenshot({ path: uscita, type: 'jpeg', quality: 90 });
  await pagina.close();
  return { uscita, sfora };
}
