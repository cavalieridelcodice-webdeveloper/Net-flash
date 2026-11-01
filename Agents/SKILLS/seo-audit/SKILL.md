---
name: seo-audit
description: >-
  Effettua un audit completo di ottimizzazione SEO tecnica, on-page, semantica e Schema.org
  sui siti web e web app prima e dopo la messa in produzione. Da usare quando l'utente chiede
  verifiche SEO, ottimizzazione motori di ricerca, audit dei meta tag, sitemap, robots.txt,
  struttura heading, dati strutturati JSON-LD o punteggi Core Web Vitals.
---

# Skill: Audit di Ottimizzazione SEO & Visibilità sui Motori di Ricerca

Questa skill guida l'agente nell'analisi meticolosa e nel perfezionamento SEO (Search Engine Optimization) del progetto web, massimizzando il posizionamento organico su Google, Bing e altri motori di ricerca, nonché garantendo snippet e rich preview eccellenti sui social network (Open Graph / Twitter Cards).

---

## 1. Ambito di Verifica (I 7 Pilastri di Ottimizzazione SEO)

### A. Metadata & Tag Header Fondamentali
1. **Title Tag (`<title>`)**:
   - Lunghezza ottimale: 50-60 caratteri (massimo ~580px per evitare troncamenti nelle SERP).
   - Deve contenere la parola chiave principale verso l'inizio, seguita dal brand name (es. `Servizio Professionale a Milano | Nome Brand`).
   - Deve essere unico per ogni pagina del sito.
2. **Meta Description (`<meta name="description">`)**:
   - Lunghezza ottimale: 120-155 caratteri.
   - Testo persuasivo, chiaro, con keyword mirata e call-to-action (CTA) per massimizzare il CTR (Click-Through Rate).
3. **Viewport & Codifica**:
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
   - `<meta charset="UTF-8">` posizionato subito dopo l'apertura del `<head>`.
4. **Canonical URL (`<link rel="canonical" href="...">`)**:
   - Presente su ogni pagina con URL assoluto canonico per prevenire penalizzazioni da contenuti duplicati (es. HTTP vs HTTPS, versioni con slash finale o parametri query).
5. **Lingua del Documento (`<html lang="...">`)**:
   - Attributo lingua coerente con il target geografico/linguistico (es. `lang="it"`).
6. **Favicon & Icone Web**:
   - Icona SVG moderna, fallback PNG e link a `apple-touch-icon`.

### B. Open Graph & Social Cards (Social SEO)
Assicurare che la condivisione su WhatsApp, Telegram, LinkedIn, Facebook e X (Twitter) generi anteprime visuali ricche e cliccabili:
1. **Open Graph Base**:
   - `og:type` (`website` per pagine generali o `article` per post di blog).
   - `og:title` e `og:description` (coerenti o adattati dal meta title/description).
   - `og:url` (URL assoluto della pagina corrente).
   - `og:site_name` (Nome del brand/sito).
   - `og:locale` (es. `it_IT`).
2. **Open Graph Image**:
   - `og:image` con URL assoluto (risoluzione raccomandata: 1200x630 pixel, formato WebP o PNG).
   - `og:image:width`, `og:image:height` e `og:image:alt`.
3. **Twitter / X Cards**:
   - `twitter:card` (impostato su `summary_large_image`).
   - `twitter:title`, `twitter:description`, `twitter:image`.

### C. Dati Strutturati Schema.org (JSON-LD)
I dati strutturati abilitano i Rich Snippet nelle SERP di Google (stelle recensioni, FAQ a fisarmonica, breadcrumb, prezzi, sitelink searchbox):
1. **Formato Raccomandato**: Script `<script type="application/ld+json">` incorporato nell'header o nel body.
2. **Schemi Chiave da Implementare**:
   - `WebSite`: con nome sito, url e opzionale `SearchAction` (sitelinks search box).
   - `Organization` / `LocalBusiness`: logo, contatti, indirizzo fisico, P.IVA, social profiles (`sameAs`).
   - `BreadcrumbList`: percorso di navigazione breadcrumb leggibile per i bot.
   - `FAQPage`: per sezioni domande frequenti (genera dropdown espandibili in SERP).
   - `Article` / `BlogPosting`: per articoli con data pubblicazione, autore e immagine.
   - `Service` / `Product`: per offerte commerciali o servizi proposti.

### D. Struttura Semantica & Heading Hierarchy (On-Page SEO)
1. **Unicità dell'`<h1>`**:
   - Deve esserci **un solo tag `<h1>` per pagina**, rappresentante il tema centrale del documento.
   - Non usare elementi decorativi o loghi aziendali come `<h1>` se privi di testo rilevante.
2. **Gerarchia Logica Senza Salti**:
   - Struttura ordinata: `<h1>` -> `<h2>` -> `<h3>` (non saltare da `<h1>` direttamente a `<h4>`).
3. **Ottimizzazione Immagini & Testi Alternativi**:
   - Tutte le immagini contenutistiche devono avere un attributo `alt` descrittivo contenente parole chiave contestuali.
   - Immagini puramente decorative devono avere `alt=""` e `aria-hidden="true"`.
4. **Ancore dei Link Pertinenti**:
   - Evitare link generici non descrittivi (es. "clicca qui", "leggi di più", "qui").
   - Utilizzare anchor text ricchi di contesto o aggiungere attributi `aria-label` esplicativi.

### E. File Tecnici, Scansione & Indicizzazione (Technical SEO)
1. **File `robots.txt`** (nella root / cartella `public/`):
   - Deve consentire la scansione delle risorse essenziali (CSS, JS, immagini).
   - Deve indicare esplicitamente l'URL della sitemap: `Sitemap: https://dominio.com/sitemap.xml`.
   - Divieto di scansione per aree riservate (es. `/admin/`, `/dashboard/`, `/api/`).
2. **File `sitemap.xml`**:
   - Presente e validata con protocollo XML standard (`<urlset>`).
   - Tutti gli URL devono essere assoluti, in HTTPS e con codice di stato 200 (niente redirect o 404).
   - Campi `<lastmod>` aggiornati e `<loc>`.
3. **Direttive Robots Meta Tag**:
   - Assicurarsi che le pagine pubbliche abbiano `<meta name="robots" content="index, follow">` o nessun tag restrittivo.
   - Verificare che pagine sensibili o di staging non siano indicizzate per sbaglio (`noindex, nofollow`).

### F. Performance & Core Web Vitals (Fattori di Ranking Google)
1. **Largest Contentful Paint (LCP)**:
   - L'immagine hero principale deve avere `fetchpriority="high"` e `loading="eager"`.
   - Formati grafici moderni: preferire WebP o AVIF rispetto a PNG/JPEG pesanti.
2. **Cumulative Layout Shift (CLS)**:
   - Ogni tag `<img>` e `<video>` deve avere attributi espliciti `width` e `height` (o CSS `aspect-ratio`) per evitare sobbalzi nel rendering.
3. **First Input Delay / Interaction to Next Paint (INP)**:
   - Script esterni non critici caricati con `defer` o `async`.
   - Evitare bundle JavaScript monolitici che bloccano il thread principale.
4. **Font Optimization**:
   - Impiegare `font-display: swap;` per evitare testo invisibile durante il caricamento (FOIT).
   - Precaricare i web font critici con `<link rel="preload" as="font" type="font/woff2" crossorigin>`.

---

## 2. Procedura Operativa per l'Audit SEO

Quando l'utente richiede un controllo SEO o prima di un rilascio:

### Fase 1: Scansione Automatica del Progetto
Esegui controlli mirati nel codice sorgente:
1. **Verifica Head & Metadati**:
   - Cerca `<title>`, `<meta name="description">`, `<link rel="canonical">` in `index.html` e nei template.
2. **Verifica Open Graph & Twitter Cards**:
   - Cerca `og:image`, `og:title`, `twitter:card`.
3. **Verifica Heading Tags**:
   - Conta i tag `<h1>` nel documento (`grep -i "<h1" ...`).
   - Verifica la gerarchia `<h2>`, `<h3>`.
4. **Verifica Immagini**:
   - Individua immagini prive dell'attributo `alt` o con percorsi non ottimizzati.
5. **Verifica File Tecnici**:
   - Controlla la presenza di `robots.txt` e `sitemap.xml` nella cartella `public/` o nella root.
6. **Verifica Schema.org**:
   - Cerca `<script type="application/ld+json">` e valida la correttezza del JSON.

### Fase 2: Redazione del Report SEO
Genera un report dettagliato con grading immediato:

```markdown
# 🚀 Report di Audit SEO & Visibilità Web

**Progetto**: [Nome Progetto]  
**Data Audit**: [Data]  
**Punteggio Stimato**: [🟢 OTTIMO (90-100) | 🟡 SUFFICIENTE (70-89) | 🔴 CRITICO (<70)]

---

### 1. Tabella dei Controlli

| Categoria | Voce | Stato | Note & Dettagli |
| :--- | :--- | :---: | :--- |
| **Metadati** | Tag `<title>` (lunghezza e unicità) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Metadati** | Meta Description (persuasiva, 120-155 car.) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Metadati** | Canonical Link (`rel="canonical"`) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Social SEO** | Open Graph (og:title, og:image 1200x630, ecc.) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Social SEO** | Twitter / X Cards (`summary_large_image`) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Dati Strutturati** | Schema.org JSON-LD (Organization, WebSite, FAQ) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Semantica** | Tag `<h1>` unico e descrittivo | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Semantica** | Gerarchia Heading (`<h2>`, `<h3>` senza salti) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Media** | Attributi `alt` su immagini e formati moderni | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **File Tecnici** | `robots.txt` configurato con link Sitemap | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **File Tecnici** | `sitemap.xml` presente e valida | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Performance** | Core Web Vitals (LCP, CLS `width`/`height`) | 🟢 / 🟡 / 🔴 | [Dettaglio] |

---

### 2. Punti di Forza e Problematiche Rilevate
- 🔴 **Problemi Critici**: [Elementi bloccanti per l'indicizzazione o penalizzanti]
- 🟡 **Miglioramenti On-Page**: [Miglioramenti per massimizzare il posizionamento e il CTR]
- 🟢 **Punti di Forza**: [Best practice già implementate con successo]

---

### 3. Snippet di Codice Correttivo (Pronti all'Uso)
[Fornire il codice esatto per i meta tag mancanti, JSON-LD Schema.org, robots.txt o sitemap.xml]
```

### Fase 3: Applicazione Diretta dei Fix
Proponi all'utente di implementare direttamente:
- Compilazione o miglioramento dei meta tag nell'`<head>` di `index.html`.
- Creazione o perfezionamento di `public/robots.txt` e `public/sitemap.xml`.
- Inserimento dei blocchi JSON-LD (`Organization`, `WebSite`, `LocalBusiness`, `FAQPage`).
- Aggiunta di `alt` mancanti, correzione della gerarchia heading (`<h1>`/`<h2>`) e attributi `loading="lazy"` / `fetchpriority="high"`.
