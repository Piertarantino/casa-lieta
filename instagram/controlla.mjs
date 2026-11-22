// Controlla post.json ed eventi.txt prima che il robot li usi. Esce con errore se qualcosa non va.
//   node instagram/controlla.mjs
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIR, banca, eventi, didascalia, oggiRoma, calendario } from './lib.mjs';

const errori = [];
const avvisi = [];
const post = banca();
const ids = new Set();
const STAGIONI = ['tutte', 'inverno', 'primavera', 'estate', 'autunno'];
for (const p of post) {
  const chi = `post "${p.id}"`;
  if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) errori.push(`${chi}: id mancante o con caratteri non validi (solo lettere minuscole, numeri e trattini)`);
  if (ids.has(p.id)) errori.push(`${chi}: id ripetuto`); ids.add(p.id);
  for (const c of ['rubrica', 'titolo', 'didascalia']) if (!p[c]) errori.push(`${chi}: manca "${c}"`);
  if (p.stagioni && !p.stagioni.every((s) => STAGIONI.includes(s))) errori.push(`${chi}: stagione non valida (${p.stagioni})`);
  if (p.data && !/^(\d{2}-\d{2}|pasqua([+-]\d+)?)$/.test(p.data)) errori.push(`${chi}: "data" deve essere MM-GG oppure pasqua, pasqua+1, pasqua-7`);
  if (p.foto && !existsSync(join(DIR, 'risorse', 'foto', p.foto))) errori.push(`${chi}: la foto ${p.foto} non è in instagram/risorse/foto`);
  if (p.illustrazione && !existsSync(join(DIR, 'risorse', 'illustrazioni', p.illustrazione))) errori.push(`${chi}: l'immagine ${p.illustrazione} non è in instagram/risorse/illustrazioni`);
  if (p.foto && p.illustrazione) errori.push(`${chi}: usa "foto" (foto vera) oppure "illustrazione" (immagine generata), non tutte e due`);
  if (typeof p.approvato !== 'boolean') errori.push(`${chi}: "approvato" deve essere true o false`);
  try { didascalia(p); } catch (e) { errori.push(e.message); }
}
const oggi = oggiRoma();
for (const e of eventi()) {
  if (e.errore) errori.push(`eventi.txt riga ${e.riga}: scritta male. Serve "AAAA-MM-GG | titolo | luogo | link". Trovato: ${e.testo}`);
  else if ((e.fine || e.inizio) < oggi) avvisi.push(`eventi.txt riga ${e.riga}: evento già passato, si può cancellare (${e.titolo})`);
  else if (!e.link) avvisi.push(`eventi.txt riga ${e.riga}: manca il link della fonte (${e.titolo})`);
}
// Calendario: date con un post scelto a mano.
const cal = calendario();
for (const [data, id] of Object.entries(cal)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) errori.push(`calendario.json: data scritta male "${data}" (serve AAAA-MM-GG)`);
  if (!ids.has(id)) errori.push(`calendario.json: il ${data} c'è "${id}", che non esiste in post.json`);
}
const approvati = post.filter((p) => p.approvato).length;
console.log(`post.json: ${post.length} post, ${approvati} approvati. eventi.txt: ${eventi().filter((e) => !e.errore).length} eventi.`);
for (const a of avvisi) console.log('Avviso: ' + a);
for (const e of errori) console.error('Errore: ' + e);
if (errori.length) process.exit(1);
