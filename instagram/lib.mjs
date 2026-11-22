// Logica comune: stagione, scelta del post del giorno, didascalia.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const DIR = dirname(fileURLToPath(import.meta.url));
const leggiJSON = (f, def) => (existsSync(join(DIR, f)) ? JSON.parse(readFileSync(join(DIR, f), 'utf8')) : def);

export const config = () => leggiJSON('config.json', {});
export const banca = () => leggiJSON('post.json', { post: [] }).post;
export const registro = () => leggiJSON('registro.json', { pubblicati: [] });

// Stessi colori del sito (src/styles/global.css) e del piano social.
export const PALETTE = {
  inverno:   { bg: '#EDF1F5', paper: '#F9FBFD', ink: '#142033', muted: '#53627A', line: '#C9D3E0', accent: '#2B4C7E', hi: '#7FA9CF', r: ['#DCE5EE', '#B3C3D6', '#7C92AE', '#33496A'] },
  primavera: { bg: '#F0F2EB', paper: '#F9FAF6', ink: '#1D2320', muted: '#59645B', line: '#CFD6C8', accent: '#4A6B37', hi: '#D9B72E', r: ['#C4D7B3', '#97B985', '#678F5D', '#35553A'] },
  estate:    { bg: '#EEF1EA', paper: '#F8F9F5', ink: '#18231C', muted: '#56635A', line: '#CBD3C8', accent: '#2E5B3C', hi: '#C9962F', r: ['#A9BFA4', '#7E9E7B', '#4D7255', '#243F2D'] },
  autunno:   { bg: '#F1EDE7', paper: '#FAF7F3', ink: '#2A1E17', muted: '#6A5A4E', line: '#DCCFC2', accent: '#7A3E22', hi: '#C68A2C', r: ['#D6B796', '#B07B4F', '#7A4A2C', '#3B271B'] },
};

// Data di oggi a Roma, come 'AAAA-MM-GG'.
export function oggiRoma(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const giorno = (iso) => new Date(iso + 'T12:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const piuGiorni = (s, n) => { const d = giorno(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const differenza = (a, b) => Math.round((giorno(b) - giorno(a)) / 864e5);

// Inverno 1 dic – 20 mar, primavera fino al 20 giu, estate fino al 22 set, autunno fino al 30 nov (come il sito).
export function stagioneDi(s) {
  const md = s.slice(5);
  if (md >= '12-01' || md <= '03-20') return 'inverno';
  if (md <= '06-20') return 'primavera';
  if (md <= '09-22') return 'estate';
  return 'autunno';
}

// Domenica di Pasqua (calendario gregoriano).
export function pasqua(anno) {
  const a = anno % 19, b = Math.floor(anno / 100), c = anno % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31), gg = ((h + l - 7 * m + 114) % 31) + 1;
  return `${anno}-${String(mese).padStart(2, '0')}-${String(gg).padStart(2, '0')}`;
}

// Un post a data fissa ha "data": "MM-GG" oppure "pasqua" / "pasqua-7" / "pasqua+1".
function dataFissa(p, anno) {
  if (!p.data) return null;
  const m = /^pasqua([+-]\d+)?$/.exec(p.data);
  if (m) return piuGiorni(pasqua(anno), Number(m[1] || 0));
  return `${anno}-${p.data}`;
}

// ---------- Eventi (eventi.txt) ----------
// Una riga per evento:  AAAA-MM-GG | Titolo | Luogo | link della fonte | (facoltativo) due righe di descrizione
// Per eventi di più giorni:  AAAA-MM-GG..AAAA-MM-GG | ...
export function eventi() {
  const f = join(DIR, 'eventi.txt');
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').split('\n').map((r) => r.trim()).filter((r) => r && !r.startsWith('#')).map((riga, n) => {
    const [quando, titolo, luogo, link, descrizione] = riga.split('|').map((x) => (x || '').trim());
    const [inizio, fine] = quando.split('..').map((x) => x.trim());
    const errore = !/^\d{4}-\d{2}-\d{2}$/.test(inizio) || (fine && !/^\d{4}-\d{2}-\d{2}$/.test(fine)) || !titolo || !luogo;
    const id = 'evento-' + inizio + '-' + titolo.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    return { riga: n + 1, testo: riga, errore, id, inizio, fine: fine || null, titolo, luogo, link: link || '', descrizione: descrizione || '' };
  });
}

// Trasforma un evento in un post come quelli della banca.
export function postDaEvento(e) {
  const cfg = config();
  const mesi = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const giorni = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const fmt = (s) => { const d = giorno(s); return `${giorni[d.getUTCDay()]} ${d.getUTCDate()} ${mesi[d.getUTCMonth()]}`; };
  const al = (n) => ([8, 11].includes(n) ? "all'" : 'al ') + n;
  let quando = fmt(e.inizio);
  if (e.fine) {
    const a = giorno(e.inizio), b = giorno(e.fine);
    quando = a.getUTCMonth() === b.getUTCMonth()
      ? `dal ${a.getUTCDate()} ${al(b.getUTCDate())} ${mesi[b.getUTCMonth()]}`
      : `dal ${a.getUTCDate()} ${mesi[a.getUTCMonth()]} ${al(b.getUTCDate())} ${mesi[b.getUTCMonth()]}`;
  }
  const fonte = e.link ? `\n\nProgramma e conferme sulla fonte ufficiale: ${e.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : '';
  return {
    id: e.id, tipo: 'evento', approvato: true, rubrica: 'Agenda della valle',
    titolo: e.titolo, sottotitolo: e.descrizione || `${e.luogo}, ${quando}.`,
    dati: [['dove', e.luogo], ...(e.link ? [['fonte', e.link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]]] : [])],
    luogo: e.luogo,
    evento: { inizio: e.inizio, fine: e.fine, luogo: e.luogo },
    didascalia: `${e.titolo}: ${e.luogo}, ${quando}.${e.descrizione ? '\n\n' + e.descrizione : ''}${fonte}`,
    invito: 'Se volete fermarvi a dormire in zona, Casa Lieta è tra Subiaco e Monte Livata. Info su casalieta.it (link in bio).',
    hashtag: (cfg.hashtagEventi || ['#Subiaco', '#ValleDellAniene', '#MontiSimbruini', '#gitedaroma']),
  };
}

// ---------- Scelta del post del giorno ----------
// "simula": per l'anteprima, con un registro finto e tutti i post considerati approvati.
export function postDelGiorno(data = oggiRoma(), simula = null) {
  const cfg = config();
  const reg = simula?.registro || registro();
  const anno = Number(data.slice(0, 4));
  const stagione = stagioneDi(data);
  const tutti = simula ? banca().map((p) => ({ ...p, approvato: true })) : banca();
  const giaOggi = reg.pubblicati.find((r) => r.data === data);
  if (giaOggi) return { motivo: 'già pubblicato oggi', post: null };
  const ultimo = (id) => reg.pubblicati.filter((r) => r.id === id).map((r) => r.data).sort().pop();

  // 1. Eventi: si pubblicano "anticipoEventi" giorni prima (default 3). Se quel giorno era occupato, il primo giorno utile prima dell'inizio.
  const anticipo = cfg.anticipoEventi ?? 3;
  const ev = eventi().filter((e) => !e.errore && !ultimo(e.id))
    .filter((e) => { const g = differenza(data, e.inizio); return g >= 0 && g <= anticipo; })
    .sort((a, b) => a.inizio.localeCompare(b.inizio));
  if (ev.length) return { motivo: `evento del ${ev[0].inizio}`, post: postDaEvento(ev[0]), stagione };

  // 2. Post a data fissa (feste, ricorrenze), se approvato.
  const fisso = tutti.find((p) => p.approvato && dataFissa(p, anno) === data);
  if (fisso) return { motivo: 'data fissa', post: fisso, stagione };

  // 3. Banca di stagione: il post approvato pubblicato meno di recente (mai pubblicati prima, nell'ordine del file).
  //    Non si ripete la stessa rubrica del giorno prima, se c'è un'alternativa.
  const ieri = reg.pubblicati.filter((r) => r.data < data).sort((a, b) => a.data.localeCompare(b.data)).pop();
  const rubricaIeri = ieri && tutti.find((p) => p.id === ieri.id)?.rubrica;
  const minimoGiorni = cfg.giorniSenzaRipetere ?? 45;
  const diStagione = tutti.filter((p) => p.approvato && !p.data && (p.stagioni || ['tutte']).some((s) => s === 'tutte' || s === stagione));
  if (!diStagione.length) return { motivo: `nessun post approvato per ${stagione}`, post: null, stagione };
  // Se tutti sono usciti da meno di "giorniSenzaRipetere", si riprende comunque il meno recente.
  const riposati = diStagione.filter((p) => { const u = ultimo(p.id); return !u || differenza(u, data) >= minimoGiorni; });
  let candidati = riposati.length ? riposati : diStagione;
  // Ordine: prima i post usciti meno di recente; a parità, un ordine mescolato ma fisso (cambia ogni anno).
  const mescola = (id) => [...(id + anno)].reduce((a, c) => (a * 33 + c.charCodeAt(0)) % 100003, 5381);
  const ordine = (p) => ultimo(p.id) || '0000-00-00';
  candidati = [...candidati].sort((a, b) => ordine(a).localeCompare(ordine(b)) || mescola(a.id) - mescola(b.id));
  // Varietà: non la stessa rubrica di ieri, alternare foto e grafica, alternare post di stagione e post di sempre.
  const pIeri = ieri && tutti.find((p) => p.id === ieri.id);
  const generico = (p) => !p || (p.stagioni || ['tutte']).includes('tutte');
  const regole = [
    (p) => p.rubrica !== rubricaIeri && !!p.foto !== !!pIeri?.foto && generico(p) !== generico(pIeri),
    (p) => p.rubrica !== rubricaIeri && generico(p) !== generico(pIeri),
    (p) => p.rubrica !== rubricaIeri,
  ];
  let scelto = candidati[0];
  for (const r of regole) { const t = candidati.slice(0, 15).find(r); if (t) { scelto = t; break; } }
  return { motivo: `banca ${stagione}`, post: scelto, stagione };
}

// Didascalia finale: testo + invito al sito + hashtag (max 2200 caratteri, max 30 hashtag).
export function didascalia(p) {
  const cfg = config();
  const fissi = cfg.hashtagSempre || ['#CasaLieta', '#CasaLietaSubiaco'];
  const tag = [...new Set([...(p.hashtag || []), ...fissi])].slice(0, 12);
  const invito = p.invito || cfg.invito || 'Casa Lieta, tra Subiaco e Monte Livata. Info e prenotazioni su casalieta.it (link in bio).';
  const testo = `${p.didascalia.trim()}\n\n${invito}\n\n${tag.join(' ')}`;
  if (testo.length > 2200) throw new Error(`Didascalia troppo lunga (${testo.length} caratteri) per ${p.id}`);
  return testo;
}
