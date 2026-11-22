// Crea l'anteprima di tutti i post (immagini + didascalie) e il calendario dei prossimi giorni.
//   node instagram/anteprima.mjs [--giorni=30] [--da=2026-12-01]
// Risultato in instagram/anteprima/banca/: un JPEG per post e index.html da aprire nel browser.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIR, banca, eventi, postDaEvento, postDelGiorno, didascalia, oggiRoma, stagioneDi, pasqua } from './lib.mjs';
import { creaImmagine, chiudi } from './immagine.mjs';

const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const giorni = Number(arg('giorni', 30));
const da = arg('da', oggiRoma());
const out = join(DIR, 'anteprima', 'banca');
mkdirSync(out, { recursive: true });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Stagione con cui mostrare un post: quella di oggi se gli è permessa, altrimenti la prima delle sue.
const stagioneOggi = stagioneDi(da);
function stagionePer(p) {
  if (p.data) { const a = Number(da.slice(0, 4)); const d = /^pasqua/.test(p.data) ? pasqua(a) : `${a}-${p.data}`; return stagioneDi(d); }
  const s = p.stagioni || ['tutte'];
  return s.includes('tutte') || s.includes(stagioneOggi) ? stagioneOggi : s[0];
}

const tutti = [...banca(), ...eventi().filter((e) => !e.errore && e.inizio >= da).map(postDaEvento)];
const schede = [];
const problemi = [];
for (const p of tutti) {
  const st = p.evento ? stagioneDi(p.evento.inizio) : stagionePer(p);
  const { sfora } = await creaImmagine(p, st, join(out, `${p.id}.jpg`));
  if (sfora) problemi.push(p.id);
  schede.push({ p, st, testo: didascalia(p) });
}
await chiudi();

// Calendario simulato: cosa uscirebbe nei prossimi giorni se tutto fosse approvato.
const reg = { pubblicati: [] };
const calendario = [];
for (let i = 0; i < giorni; i++) {
  const d = new Date(da + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + i);
  const data = d.toISOString().slice(0, 10);
  const s = postDelGiorno(data, { registro: reg });
  if (s.post) { reg.pubblicati.push({ data, id: s.post.id }); calendario.push({ data, id: s.post.id, titolo: s.post.titolo, motivo: s.motivo }); }
}

const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anteprima post Instagram</title>
<style>body{font-family:system-ui,sans-serif;margin:0;padding:24px;background:#f3f1ec;color:#1d2320}h1{font-weight:500}
.griglia{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}.scheda{background:#fff;border-radius:10px;overflow:hidden}
.scheda img{width:100%;display:block}.scheda div{padding:14px;font-size:14px;white-space:pre-wrap;line-height:1.45}.id{font:12px monospace;color:#777}
table{border-collapse:collapse;margin-bottom:32px}td{padding:4px 12px;border-bottom:1px solid #ddd;font-size:14px}</style></head><body>
<h1>Prossimi ${giorni} giorni (da ${da})</h1><table>${calendario.map((c) => `<tr><td>${c.data}</td><td>${esc(c.titolo.replace(/\n/g, ' '))}</td><td class="id">${c.id} · ${c.motivo}</td></tr>`).join('')}</table>
<h1>Tutti i post (${schede.length})</h1><div class="griglia">${schede.map(({ p, st, testo }) => `<div class="scheda"><img src="${p.id}.jpg" loading="lazy"><div><span class="id">${p.id} · ${p.data ? 'data fissa ' + p.data : (p.stagioni || ['tutte']).join(', ')} · ${p.approvato ? 'approvato' : 'da approvare'}</span>\n${esc(testo)}</div></div>`).join('')}</div></body></html>`;
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, 'dati.json'), JSON.stringify({ da, calendario, post: schede.map(({ p, st, testo }) => ({ id: p.id, stagione: st, stagioni: p.stagioni, data: p.data || null, rubrica: p.rubrica, titolo: p.titolo, foto: p.foto || null, approvato: p.approvato, testo })) }, null, 2));
console.log(`${schede.length} immagini in ${out}`);
if (problemi.length) { console.error('Testo troppo lungo in: ' + problemi.join(', ')); process.exitCode = 1; }
