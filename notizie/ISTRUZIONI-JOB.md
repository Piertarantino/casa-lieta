# Job giornaliero delle notizie

Questo file è il compito dell'attività programmata di Claude che ogni mattina
aggiorna `src/data/notizie.json`. L'attività lavora su questo repository.

## Compito

1. Leggi `notizie/fonti.json`. Apri ogni fonte (RSS o pagina) e raccogli gli
   eventi e le notizie degli ultimi 14 giorni o con data futura.
2. **Filtro fisso.** Scarta subito ciò che:
   - ha data già passata o non ha una data chiara;
   - si svolge fuori da `paesi_in_zona` o oltre `raggio_km` dalla casa;
   - contiene una delle `escludi_parole` (cronaca, politica, incidenti);
   - è già presente in `notizie.json` (stesso evento, anche da fonte diversa).
3. **Giudizio.** Per ogni notizia rimasta chiediti: *serve a un ospite di Casa
   Lieta che sta scegliendo cosa fare in questi giorni?* Dai un `voto` da 0 a 10.
   - 9-10: eventi da non perdere (sagre, apertura impianti, feste patronali,
     escursioni guidate, concerti nei monasteri, mercatini).
   - 7-8: attività utili (visite guidate, mostre, stato delle piste).
   - 5-6: dubbi (eventi piccoli, informazioni incomplete).
   - sotto 5: tutto il resto.
4. Per ogni notizia con voto ≥ 5 scrivi un oggetto in `notizie` con:
   `id` (slug unico), `titolo` (riscritto, chiaro, max 80 caratteri), `data`
   (AAAA-MM-GG), `fine` (se dura più giorni), `luogo`, `km` (distanza stradale
   approssimativa dalla casa), `categoria` (una tra: sagre, neve, escursioni,
   musica, mercatini, cultura, feste, sport), `riassunto` (una riga, senza
   punti esclamativi), `url` (fonte originale), `fonte`, `voto`, e `stato`:
   - `pubblicata` se voto ≥ 7;
   - `in_attesa` se voto tra 5 e 7 (la vede il proprietario, non il sito).
   Le notizie sotto 5 non si scrivono.
5. Togli le voci con `"esempio": true` appena ci sono almeno 3 notizie vere.
6. Aggiorna `aggiornato` con data e ora attuali (fuso Europe/Rome).
7. Esegui `npm run notizie:valida`. Se fallisce, correggi.
8. Se il file è cambiato, fai commit su `main` con messaggio
   `notizie: aggiornamento del GG/MM`. La pubblicazione su Aruba parte da sola.

## Regole

- Non inventare mai date, orari, prezzi o luoghi: se mancano, scarta.
- Non copiare testi lunghi dagli articoli: riscrivi in una riga.
- Massimo 20 notizie pubblicate alla volta, le più vicine nel tempo.
