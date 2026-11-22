# Robot Instagram di Casa Lieta

Ogni mattina GitHub pubblica da solo un post su Instagram: una grafica o una foto vera
della casa, con didascalia, hashtag e rimando a casalieta.it. Non servono Claude né
un computer acceso.

## Come sceglie il post del giorno

1. **Eventi** (`eventi.txt`): se un evento comincia entro 3 giorni, esce quello.
2. **Date fisse** (in `post.json`, campo `data`): Natale, San Benedetto, ponti, Pasqua.
3. **Banca di stagione** (`post.json`): il post approvato della stagione in corso che
   è uscito meno di recente. Alterna foto e grafiche, non ripete la stessa rubrica due
   giorni di fila, e lascia passare 45 giorni prima di ripetere un post (se la banca
   basta).

Esce solo ciò che ha `"approvato": true`. Le stagioni sono quelle del sito: inverno
1 dic – 20 mar, primavera fino al 20 giu, estate fino al 22 set, autunno fino al 30 nov.

## Cosa fai tu, e quando

| Quando | Cosa | Dove |
|---|---|---|
| Una volta al mese | Scrivi gli eventi confermati del mese (sagre, mercatini, feste) | `instagram/eventi.txt` |
| Quando vuoi | Aggiungi o correggi un post, approvi o togli un post (`approvato`) | `instagram/post.json` |
| Per una pausa | Metti `INSTAGRAM_ATTIVO` a `false` | GitHub > Settings > Secrets and variables > Actions > Variables |

I file si modificano direttamente su github.com (icona della matita) anche dal
telefono. A ogni modifica GitHub controlla che siano scritti bene e, se c'è un
errore, ti manda una mail.

Riga di esempio per `eventi.txt`:

```
2027-10-16..2027-10-17 | Sagra della castagna | Paese | https://sito-della-pro-loco.it/ | Stand, musica e castagne arrosto.
```

## Le immagini

- `risorse/foto/`: solo foto vere di Casa Lieta. Per usarne una nuova, caricala qui e
  scrivi il nome del file nel campo `foto` del post. Meglio foto di almeno 1080 px di
  larghezza.
- Senza foto, il robot crea la grafica "su carta" con le creste dei Simbruini, i
  colori della stagione e il marchio CL, come nel piano social.
- Non si usano immagini generate al computer spacciate per foto.

## Provare prima di pubblicare

- Su GitHub: Actions > Instagram > Run workflow. Con "Solo prova" spuntato crea immagine
  e testo senza pubblicare (li trovi in fondo alla pagina dell'esecuzione, "post-del-giorno").
- Sul computer: `npm run instagram:anteprima` crea tutte le immagini e il calendario
  dei prossimi 30 giorni in `instagram/anteprima/banca/index.html`.

## Messa in funzione (una volta sola)

1. **Account Instagram professionale.** Nell'app Instagram: Impostazioni > Tipo di
   account e strumenti > Passa a un account professionale > Azienda. Nella bio metti
   `casalieta.it`.
2. **App Meta e token.** Su developers.facebook.com: Le mie app > Crea app > caso d'uso
   "Gestisci messaggi e contenuti su Instagram", collegata al portfolio business di Casa
   Lieta. Nel caso d'uso, "API Instagram con Unified Login":
   - *Crea nuova configurazione*, risorsa: l'account Instagram @casalietasubiaco,
     autorizzazioni almeno `instagram_basic` e `instagram_content_publish`;
   - genera il token per un **utente di sistema** del portfolio (Impostazioni business >
     Utenti > Utenti di sistema): non scade mai.
   Va bene anche il token "accesso con Instagram" (comincia con `IG`): dura 60 giorni e il
   robot lo rinnova da solo se c'è il segreto `GH_PAT`.
3. **Segreti su GitHub** (Settings > Secrets and variables > Actions):
   - `IG_TOKEN`: il token appena generato.
   - `IG_USER_ID` (solo se serve): l'id numerico dell'account Instagram.
   - `GH_PAT` (solo con token `IG...`): token GitHub "fine-grained" con permesso
     *Secrets: read and write* su questo repository.
   - `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_DIR`: gli stessi del sito.
     Le immagini dei post vengono caricate in `/social/` sul sito, perché Instagram le
     scarica da un indirizzo pubblico.
   - Prova: Actions > Instagram > Run workflow con "verifica" spuntato. Dice se il token
     funziona e quale account vede.
4. **Accensione:** variabile `INSTAGRAM_ATTIVO` = `true`.

Se qualcosa va storto (token scaduto, sito irraggiungibile) GitHub manda una mail
all'indirizzo dell'account e il post di quel giorno salta; il giorno dopo riprova.

## File

| File | Cosa contiene |
|---|---|
| `post.json` | La banca dei post |
| `eventi.txt` | Gli eventi del mese |
| `config.json` | Orari, anticipo eventi, hashtag fissi, frase finale con casalieta.it |
| `registro.json` | Cosa è già uscito (lo aggiorna il robot, non toccarlo) |
| `pubblica.mjs`, `lib.mjs`, `immagine.mjs` | Il robot |
| `controlla.mjs` | Controllo dei file |
| `anteprima.mjs` | Anteprima di tutti i post |
