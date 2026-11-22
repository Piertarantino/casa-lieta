// Pubblica il post Instagram del giorno. Lo lancia GitHub Actions ogni mattina (.github/workflows/instagram.yml).
//
//   node instagram/pubblica.mjs                 pubblica il post di oggi
//   node instagram/pubblica.mjs --prova         crea solo immagine e didascalia in instagram/anteprima/, non pubblica
//   node instagram/pubblica.mjs --data=2026-12-08 --prova   prova un giorno preciso
//   node instagram/pubblica.mjs --id=sacro-speco             pubblica (o prova) un post preciso
//
// Variabili d'ambiente (segreti di GitHub): IG_TOKEN, FTP_SERVER, FTP_USERNAME, FTP_PASSWORD, FTP_DIR.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DIR, config, registro, banca, postDelGiorno, didascalia, oggiRoma, stagioneDi } from './lib.mjs';
import { creaImmagine, chiudi } from './immagine.mjs';

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}`))?.split('=')[1] ?? (process.argv.includes(`--${n}`) ? true : undefined);
const prova = !!arg('prova');
const data = arg('data') || oggiRoma();
const cfg = config();
const API = 'https://graph.instagram.com';

function esci(msg, codice = 0) { console.log(msg); process.exit(codice); }

async function caricaFTP(file, nome) {
  const { Client } = await import('basic-ftp');
  const c = new Client(30000);
  try {
    await c.access({ host: process.env.FTP_SERVER, user: process.env.FTP_USERNAME, password: process.env.FTP_PASSWORD, secure: true, secureOptions: { rejectUnauthorized: false } });
    const base = (process.env.FTP_DIR || '/').replace(/\/$/, '');
    await c.ensureDir(`${base}/${cfg.cartellaImmagini || 'social'}`);
    await c.uploadFrom(file, nome);
  } finally { c.close(); }
}

async function api(metodo, percorso, parametri) {
  const url = new URL(API + percorso);
  const corpo = new URLSearchParams({ ...parametri, access_token: process.env.IG_TOKEN });
  const r = metodo === 'GET' ? await fetch(url + '?' + corpo) : await fetch(url, { method: 'POST', body: corpo });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`Instagram ${percorso}: ${JSON.stringify(j.error || j)}`);
  return j;
}

const attendi = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!prova && process.env.INSTAGRAM_ATTIVO !== 'true') esci('Pubblicazione in pausa (variabile INSTAGRAM_ATTIVO diversa da "true"). Niente da fare.');

  let scelta;
  if (arg('id')) {
    const p = banca().find((x) => x.id === arg('id'));
    if (!p) esci(`Nessun post con id "${arg('id')}" in post.json`, 1);
    scelta = { motivo: 'scelto a mano', post: p, stagione: stagioneDi(data) };
  } else scelta = postDelGiorno(data);

  if (!scelta.post) esci(`${data}: nessun post (${scelta.motivo}).`);
  const p = scelta.post;
  const testo = didascalia(p);
  const nome = `${data}-${p.id}.jpg`;
  const cartella = join(DIR, 'anteprima');
  mkdirSync(cartella, { recursive: true });
  const file = join(cartella, nome);
  const { sfora } = await creaImmagine(p, scelta.stagione, file);
  await chiudi();
  if (sfora) esci(`Il testo di "${p.id}" esce dallo spazio dell'immagine: accorcia titolo o sottotitolo in post.json.`, 1);
  writeFileSync(file.replace(/\.jpg$/, '.txt'), testo);
  console.log(`${data} · ${p.id} (${scelta.motivo})\n---\n${testo}\n---\nImmagine: ${file}`);
  if (prova) return;

  for (const v of ['IG_TOKEN', 'FTP_SERVER', 'FTP_USERNAME', 'FTP_PASSWORD']) if (!process.env[v]) esci(`Manca il segreto ${v}`, 1);

  // 1. L'immagine va messa online: Instagram la scarica da un indirizzo pubblico.
  await caricaFTP(file, nome);
  const urlImmagine = `${(cfg.urlSito || '').replace(/\/$/, '')}/${cfg.cartellaImmagini || 'social'}/${nome}`;
  const prova1 = await fetch(urlImmagine, { method: 'HEAD' });
  if (!prova1.ok) throw new Error(`L'immagine non risulta online: ${urlImmagine} (${prova1.status})`);

  // 2. Crea il contenitore, aspetta che Instagram l'abbia elaborato, poi pubblica.
  const contenitore = await api('POST', '/me/media', { image_url: urlImmagine, caption: testo });
  for (let i = 0; i < 20; i++) {
    const s = await api('GET', `/${contenitore.id}`, { fields: 'status_code' });
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Instagram non ha accettato l'immagine (${s.status_code})`);
    await attendi(5000);
  }
  const pubblicato = await api('POST', '/me/media_publish', { creation_id: contenitore.id });
  let permalink = '';
  try { permalink = (await api('GET', `/${pubblicato.id}`, { fields: 'permalink' })).permalink; } catch {}

  // 3. Registro: serve a non ripetere i post e a sapere cosa è uscito.
  const reg = registro();
  reg.pubblicati.push({ data, id: p.id, media: pubblicato.id, link: permalink });
  writeFileSync(join(DIR, 'registro.json'), JSON.stringify(reg, null, 2) + '\n');
  console.log(`Pubblicato: ${permalink || pubblicato.id}`);
}

main().catch(async (e) => { await chiudi(); console.error(e.message); process.exit(1); });
