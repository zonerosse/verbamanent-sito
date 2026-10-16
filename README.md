# Sito di Verba Manent IA

Sito Hugo (italiano + inglese) del programma Verba Manent IA, by Punto Web Ferrara.

## Com'è fatto
- `hugo.toml` — impostazioni. **`prova = true`**: sito di prova (noindex, robots.txt chiuso, fascia "Versione di prova"). Per la pubblicazione vera: `prova = false` e `baseURL` sul dominio scelto.
- `data/home/it.yaml`, `data/home/en.yaml` — tutti i testi della pagina principale (stessa struttura nelle due lingue).
- `content/` — pagine (privacy in bozza, da completare con i dati del venditore e far rileggere).
- `layouts/` — modelli; `assets/css/sito.css` — grafica (stile della prima anteprima approvata).
- `static/video`, `static/img` — video della guida del programma (dal repository registra-lezione) e copertine.

## Regole fisse
- "Nessun dato biometrico" deve restare ben chiaro e visibile (sezione Cosa NON fa, privacy, domande).
- Il sito descrive il programma come sarà dopo le sistemazioni per la vendita: si pubblica sul dominio vero solo quando sono fatte.

## Cloudflare Pages
- Build command: `hugo --minify`
- Output directory: `public`
- Variabile: `HUGO_VERSION` = `0.168.0`
