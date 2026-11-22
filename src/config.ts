// Dati della struttura usati in tutto il sito e nei dati strutturati per Google.
export const SITO = {
  nome: 'Casa Lieta',
  tipo: 'Casa vacanze e B&B',
  url: 'https://www.casavacanzesubiacolivata.com',
  descrizione:
    'Casa vacanze e B&B tra Subiaco e Monte Livata, nel Parco dei Monti Simbruini, a un\'ora da Roma. Camere con bagno, cucina, terrazzo panoramico, animali ammessi.',
  telefono: '+39 339 394 8962',
  telefonoFisso: '+39 0774 83671',
  email: 'info@casavacanzesubiacolivata.com',
  indirizzo: {
    via: 'Contrada Marciano 3',
    cap: '00028',
    citta: 'Subiaco',
    provincia: 'RM',
    regione: 'Lazio',
  },
  // Posizione della scheda Google "Casavacanze Casa Lieta B&B" (Plus Code W4W4+PF Subiaco).
  // NON usare 41.9479187, 13.1152135 (è un ristorante) né l'indirizzo scritto come destinazione:
  // portano dalla strada che non esiste.
  geo: { lat: 41.94678, lng: 13.10614 },
  plusCode: 'W4W4+PF Subiaco',
  mappa: 'https://www.google.com/maps/search/?api=1&query=Casa+Lieta+Subiaco&query_place_id=ChIJYbGuI4-NLxMRebCHw4QrWj0',
  percorso: 'https://www.google.com/maps/dir/?api=1&destination=Casa+Lieta+Subiaco&destination_place_id=ChIJYbGuI4-NLxMRebCHw4QrWj0&travelmode=driving',
  cin: 'IT058103C25D59SFIJ',
  // Portali dove si può prenotare o leggere le recensioni. Un link vuoto non viene mostrato.
  portali: [
    { nome: 'Booking.com', url: 'https://www.booking.com/hotel/it/casa-lieta-subiaco.it.html' },
    { nome: 'Tripadvisor', url: 'https://www.tripadvisor.it/Hotel_Review-g1137663-d4556338-Reviews-Casa_Lieta-Subiaco_Province_of_Rome_Lazio.html' },
  ],
  // Imposta di soggiorno del Comune di Subiaco: importo da confermare.
  impostaSoggiorno: 'con importi ed esenzioni che vi indichiamo al momento della prenotazione',
  facebook: 'https://www.facebook.com/profile.php?id=100063492162668',
  instagram: 'https://www.instagram.com/casalietasubiaco/',
};

// Rotazione stagionale.
// 'auto' = stagione scelta dalla data. Per anticipare l'inverno alla prima neve
// a Monte Livata, scrivi 'inverno' e pubblica; rimetti 'auto' a dicembre.
export const STAGIONE_FORZATA: 'auto' | 'primavera' | 'estate' | 'autunno' | 'inverno' = 'auto';
