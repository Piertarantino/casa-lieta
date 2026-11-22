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
// Due tipi di token: quello di "accesso con Instagram" (comincia con IG, va su graph.instagram.com)
// e quello dell'utente di sistema del portfolio business (comincia con EAA, va su graph.facebook.com, non scade).
const token = () => process.env.IG_TOKEN || '';
const API = () => (token().startsWith('IG') ? 'https://graph.instagram.com' : 'https://graph.facebook.com/v23.0');

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

// Trova l'id dell'account Instagram da usare.
async function accountInstagram() {
  if (token().startsWith('IG')) { const io = await api('GET', '/me', { fields: 'user_id,username' }); return { ig: io.user_id || io.id, nome: io.username }; }
  const id = process.env.IG_USER_ID || cfg.igUserId;
  if (id) { const a = await api('GET', `/${id}`, { fields: 'username' }); return { ig: id, nome: a.username }; }
  const pagine = await api('GET', '/me/accounts', { fields: 'instagram_business_account{id,username}' });
  const trovato = (pagine.data || []).map((p) => p.instagram_business_account).find(Boolean);
  if (!trovato) throw new Error('Non trovo l\'account Instagram: aggiungi il segreto IG_USER_ID (lo vedi nella pagina dell\'app Meta, accanto all\'account).');
  return { ig: trovato.id, nome: trovato.username };
}

async function api(metodo, percorso, parametri) {
  const url = new URL(API() + percorso);
  const corpo = new URLSearchParams({ ...parametri, access_token: process.env.IG_TOKEN });
  const r = metodo === 'GET' ? await fetch(url + '?' + corpo) : await fetch(url, { method: 'POST', body: corpo });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`Instagram ${percorso}: ${JSON.stringify(j.error || j)}`);
  return j;
}

const attendi = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (arg('verifica')) {
    const { ig, nome: utente } = await accountInstagram();
    esci(`Token valido. Account Instagram: @${utente} (id ${ig}). Tipo di token: ${token().startsWith('IG') ? 'accesso con Instagram' : 'utente di sistema Meta'}.`);
  }
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
  const { ig, nome: utente } = await accountInstagram();
  console.log(`Account: @${utente}`);
  const contenitore = await api('POST', `/${ig}/media`, { image_url: urlImmagine, caption: testo });
  for (let i = 0; i < 30; i++) {
    const s = await api('GET', `/${contenitore.id}`, { fields: 'status_code' });
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Instagram non ha accettato l'immagine (${s.status_code})`);
    await attendi(10000);
  }
  const pubblicato = await api('POST', `/${ig}/media_publish`, { creation_id: contenitore.id });
  let permalink = '';
  try { permalink = (await api('GET', `/${pubblicato.id}`, { fields: 'permalink' })).permalink; } catch {}

  // 3. Registro: serve a non ripetere i post e a sapere cosa è uscito.
  const reg = registro();
  reg.pubblicati.push({ data, id: p.id, media: pubblicato.id, link: permalink });
  writeFileSync(join(DIR, 'registro.json'), JSON.stringify(reg, null, 2) + '\n');
  console.log(`Pubblicato: ${permalink || pubblicato.id}`);
}

main().catch(async (e) => { await chiudi(); console.error(e.message); process.exit(1); });
