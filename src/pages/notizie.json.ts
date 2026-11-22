import db from '../data/notizie.json';
// Feed pubblico usato dalla home per aggiornarsi senza ricaricare la pagina.
export function GET() {
  const notizie = db.notizie.filter((n) => n.stato === 'pubblicata').sort((a, b) => a.data.localeCompare(b.data));
  return new Response(JSON.stringify({ aggiornato: db.aggiornato, notizie }), { headers: { 'Content-Type': 'application/json' } });
}
