// Controlla src/data/notizie.json prima di ogni build: campi obbligatori,
// stati validi, niente doppioni. Toglie le notizie scadute da più di 30 giorni.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../src/data/notizie.json', import.meta.url);
const STATI = ['pubblicata', 'in_attesa', 'scartata'];
const OBBLIGATORI = ['id', 'titolo', 'data', 'luogo', 'categoria', 'voto', 'stato'];

const db = JSON.parse(readFileSync(FILE, 'utf8'));
const errori = [];
const visti = new Set();
const limite = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

for (const n of db.notizie) {
  for (const k of OBBLIGATORI) if (n[k] === undefined || n[k] === '') errori.push(`${n.id ?? '?'}: manca ${k}`);
  if (!STATI.includes(n.stato)) errori.push(`${n.id}: stato non valido "${n.stato}"`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.data ?? '')) errori.push(`${n.id}: data non valida "${n.data}"`);
  if (typeof n.voto !== 'number' || n.voto < 0 || n.voto > 10) errori.push(`${n.id}: voto fuori scala`);
  if (visti.has(n.id)) errori.push(`${n.id}: id duplicato`);
  visti.add(n.id);
}
if (errori.length) {
  console.error('notizie.json non valido:\n- ' + errori.join('\n- '));
  process.exit(1);
}

const prima = db.notizie.length;
db.notizie = db.notizie.filter((n) => (n.fine ?? n.data) >= limite);
if (db.notizie.length !== prima) {
  writeFileSync(FILE, JSON.stringify(db, null, 2) + '\n');
  console.log(`notizie: tolte ${prima - db.notizie.length} scadute`);
}
console.log(`notizie: ${db.notizie.length} valide`);
