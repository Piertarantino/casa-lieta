# Regole di sicurezza del repository

Questo repository è **pubblico**: chiunque può leggere tutti i file e tutta la loro
storia (anche le versioni vecchie, anche dopo una cancellazione).

## Mai nei file del repository

- password (FTP, pannello Aruba, email, Meta, Booking, ...);
- token e chiavi di accesso (Instagram/Meta, GitHub, API di qualsiasi servizio);
- dati personali degli ospiti: nomi, telefoni, email, documenti, date di soggiorno,
  recensioni con dati non pubblici;
- dati di pagamento: IBAN, carte, ricevute.

## Dove vanno invece

- Password e token: **solo** nei Secrets di GitHub
  (Settings > Secrets and variables > Actions). Nessuno può leggerli, nemmeno
  dopo averli salvati: si possono solo sostituire.
- Dati degli ospiti: fuori da GitHub (gestionale, email, archivio della casa).

## Se succede per sbaglio

Un segreto finito in un commit va considerato **già pubblico**, anche se il file
viene subito cancellato. Bisogna:

1. revocare il segreto alla fonte e generarne uno nuovo (es. nuovo token Meta,
   nuova password FTP dal pannello Aruba);
2. salvare quello nuovo nei Secrets di GitHub;
3. solo dopo, togliere il vecchio dal file.

## Cosa è pubblico di proposito

Dati già presenti sul sito: indirizzo, telefono e email della casa, CIN, link a
Booking e Tripadvisor, l'id dell'account Instagram @casalietasubiaco, le foto e i
testi dei post.
