# Casa Lieta, sito

> Repository pubblico: mai password, token o dati degli ospiti nei file. Leggi [SICUREZZA.md](SICUREZZA.md).

Sito statico (Astro) di Casa Lieta, casa vacanze e B&B tra Subiaco e Monte Livata.
Pubblicato su Aruba (www.casavacanzesubiacolivata.com) via FTP da GitHub Actions.

## Comandi

```
npm install
npm run dev      # anteprima locale su http://localhost:4321
npm run build    # sito pronto in dist/
```

## Cosa si modifica e dove

| Cosa | File |
|---|---|
| Contatti, indirizzo, link a Booking/Tripadvisor, imposta di soggiorno | `src/config.ts` |
| Forzare una stagione (es. inverno alla prima neve) | `STAGIONE_FORZATA` in `src/config.ts` |
| Testi e attività di ogni stagione | `src/data/stagioni.ts` |
| Camere e sistemazioni (un file ciascuna; cancella il file per toglierla) | `src/content/alloggi/` |
| Foto | `src/assets/foto/` |
| Logo (sostituisce la scritta) | `public/logo.svg` |
| Notizie ed eventi (aggiornati dal job giornaliero) | `src/data/notizie.json` |
| Fonti e filtro delle notizie | `notizie/fonti.json`, `notizie/ISTRUZIONI-JOB.md` |
| Redirect dai vecchi URL | `public/.htaccess` |
| Post Instagram giornalieri, eventi del mese | `instagram/` (vedi `instagram/LEGGIMI.md`) |

## Stagioni

La stagione si sceglie dalla data del visitatore: inverno 1 dic – 20 mar,
primavera fino al 20 giu, estate fino al 22 set, autunno fino al 30 nov.
Per provarle: `/?stagione=inverno`.

## Pubblicazione

Il workflow `.github/workflows/pubblica.yml` costruisce e carica il sito a ogni
modifica su `main` e ogni mattina. Servono i segreti FTP_SERVER, FTP_USERNAME,
FTP_PASSWORD e FTP_DIR.
