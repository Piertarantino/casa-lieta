import casaEstate from '../assets/foto/casa-estate.jpg';
import livataNeve from '../assets/foto/livata-neve.png';
import vistaCamera from '../assets/foto/vista-camera.jpg';
import terrazzo from '../assets/foto/terrazzo.jpg';

export type Stagione = 'primavera' | 'estate' | 'autunno' | 'inverno';
export const ORDINE: Stagione[] = ['primavera', 'estate', 'autunno', 'inverno'];

// Giorno dell'anno (1-365) in cui finisce ogni stagione. Inverno = 1 dic - 20 mar.
export const CONFINI: [Stagione, number, number][] = [
  ['inverno', 0, 79],
  ['primavera', 79, 171],
  ['estate', 171, 265],
  ['autunno', 265, 334],
  ['inverno', 334, 366],
];

export function stagioneDaData(d = new Date()): Stagione {
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 864e5);
  for (const [s, a, b] of CONFINI) if (doy > a && doy <= b) return s;
  return 'inverno';
}

export interface Attivita { titolo: string; testo: string; dati: [string, string][]; }
export interface DatiStagione {
  nome: string; periodo: string; titolo: string; intro: string;
  foto: ImageMetadata; didascalia: string;
  sezione: string; sezioneIntro: string; attivita: Attivita[];
}

export const STAGIONI: Record<Stagione, DatiStagione> = {
  primavera: {
    nome: 'Primavera', periodo: 'marzo – giugno',
    titolo: "I prati fioriscono, l'Aniene corre limpido.",
    intro: "Le giornate si allungano: passeggiate tra le fioriture dei Simbruini, i chiostri di Santa Scolastica e pranzi all'aperto sotto il pergolato.",
    foto: terrazzo, didascalia: 'Il terrazzo sotto il pergolato',
    sezione: 'Tre idee per la primavera',
    sezioneIntro: 'Clima mite, sentieri asciutti e meno gente: la stagione migliore per scoprire la valle.',
    attivita: [
      { titolo: "Gole dell'Aniene", testo: 'Kayak e passeggiate lungo il fiume, sotto il Ponte di San Francesco.', dati: [['da casa', '≈ 4 km'], ['livello', 'T']] },
      { titolo: 'Fioriture sui Simbruini', testo: 'Prati di montagna e faggete che tornano verdi sopra Livata.', dati: [['quota', '≈ 1.400 m'], ['livello', 'E']] },
      { titolo: 'Santa Scolastica', testo: 'Tre chiostri e la biblioteca del primo libro stampato in Italia.', dati: [['da casa', '≈ 6 km'], ['visita', '≈ 1 h']] },
    ],
  },
  estate: {
    nome: 'Estate', periodo: 'giugno – settembre',
    titolo: 'Sentieri nel bosco, sere fresche sotto il pergolato.',
    intro: 'Casa Lieta è tra Subiaco e Monte Livata, nel Parco dei Monti Simbruini: di giorno i sentieri della faggeta, la sera la cena in terrazza sotto il pergolato.',
    foto: casaEstate, didascalia: "La casa d'estate",
    sezione: 'Sentieri consigliati',
    sezioneIntro: 'Percorsi scelti dal proprietario, con dislivello e difficoltà, per tutte le gambe.',
    attivita: [
      { titolo: 'Monte Livata – Monte Autore', testo: 'Dalla faggeta secolare alla vetta più panoramica dei Simbruini.', dati: [['dislivello', '≈ 500 m'], ['vetta', '1.855 m'], ['livello', 'E']] },
      { titolo: 'Subiaco – Sacro Speco', testo: 'Dal centro al monastero costruito sulla roccia, con la vista sulla valle.', dati: [['A/R', '≈ 4 km'], ['dislivello', '≈ 200 m'], ['livello', 'T']] },
      { titolo: 'Laghetto di San Benedetto', testo: "La cascata dell'Aniene sotto i monasteri, per una sosta al fresco.", dati: [['da casa', '≈ 5 km'], ['livello', 'T']] },
    ],
  },
  autunno: {
    nome: 'Autunno', periodo: 'settembre – novembre',
    titolo: 'La faggeta si accende, la valle sa di castagne.',
    intro: "La stagione delle sagre nei borghi della Valle dell'Aniene, dei funghi e delle passeggiate tra i colori della faggeta di Livata.",
    foto: vistaCamera, didascalia: 'La valle vista dalla camera',
    sezione: "Tre idee per l'autunno",
    sezioneIntro: 'Colori nel bosco, sagre nei borghi e il camino del monolocale la sera.',
    attivita: [
      { titolo: 'Foliage a Livata', testo: 'La faggeta cambia colore tra metà ottobre e inizio novembre.', dati: [['da casa', '≈ 10 km'], ['livello', 'T/E']] },
      { titolo: 'Sagre nei borghi', testo: 'Castagne, funghi e vino novello nei paesi intorno a Subiaco.', dati: [['raggio', '≤ 30 km'], ['quando', 'weekend']] },
      { titolo: 'Rocca Abbaziale', testo: 'La rocca dei Borgia che domina Subiaco, al tramonto.', dati: [['da casa', '≈ 3 km'], ['visita', '≈ 1 h']] },
    ],
  },
  inverno: {
    nome: 'Inverno', periodo: 'dicembre – marzo',
    titolo: 'La neve di Monte Livata, il camino acceso al ritorno.',
    intro: "Gli impianti di Monte Livata, la montagna di Roma, sono a un quarto d'ora d'auto: sci, ciaspole e slittino di giorno, il camino del monolocale la sera.",
    foto: livataNeve, didascalia: 'Monte Livata con la neve',
    sezione: 'Neve e montagna',
    sezioneIntro: "Tutto a meno di mezz'ora da casa: piste per famiglie, ciaspolate nella faggeta e monasteri senza folla.",
    attivita: [
      { titolo: "Sci a Livata e Campo dell'Osso", testo: 'Piste per famiglie e principianti, scuola sci e noleggio.', dati: [['da casa', '≈ 10 km'], ['auto', '≈ 15 min']] },
      { titolo: 'Ciaspolata verso Monte Autore', testo: 'La faggeta innevata, meglio con una guida del parco.', dati: [['dislivello', '≈ 500 m'], ['livello', 'E']] },
      { titolo: 'I monasteri sotto la neve', testo: 'Sacro Speco e Santa Scolastica, silenziosi e senza folla.', dati: [['da casa', '≈ 6–8 km'], ['visita', '½ giornata']] },
    ],
  },
};
