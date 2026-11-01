---
name: accessibility-security-audit
description: >-
  Effettua un audit completo di Accessibilità Web (WCAG 2.1/2.2 AA, a11y, ARIA, European Accessibility Act)
  e Sicurezza Frontend/Web (OWASP Top 10, Content Security Policy, XSS prevention, sanitizzazione input,
  headers HTTP sicuri e protezione link). Da usare quando l'utente richiede verifiche di accessibilità, sicurezza,
  screen reader, contrasto colori, conformità EAA o blindatura del codice.
---

# Skill: Audit di Accessibilità Web (a11y) & Sicurezza Frontend

Questa skill guida l'agente nell'analisi rigorosa e nell'adeguamento di un'applicazione web secondo gli standard internazionali di **Accessibilità (WCAG 2.1 / 2.2 livello AA, European Accessibility Act 2025)** e le linee guida di **Sicurezza Web (OWASP Top 10 client-side, CSP e HTTP Security Headers)**.

---

## 1. Ambito di Verifica: Accessibilità (WCAG 2.2 AA & a11y)

### A. Navigazione da Tastiera & Focus Management
1. **Operabilità da Tastiera (WCAG 2.1.1)**:
   - Tutti gli elementi interattivi (pulsanti, link, drawer menu, dialog, form) devono poter essere raggiunti tramite `Tab` e attivati con `Enter` o `Space`.
2. **Visibilità del Focus (WCAG 2.4.7 & 2.4.11)**:
   - **Vietato** impostare `outline: none` senza fornire un anello di focus alternativo chiaro e ad alto contrasto (`:focus-visible`).
3. **Focus Trap nei Modali / Drawer (WCAG 2.4.3)**:
   - Quando un menu mobile, un drawer o un modal popup è aperto, il focus della tastiera deve rimanere confinato all'interno dell'elemento e non disperdersi sullo sfondo oscurato. Alla chiusura, il focus deve ritornare al trigger che lo ha aperto.
4. **Skip Links (WCAG 2.4.1)**:
   - Presenza di un link di salto nascosto (`<a href="#main" class="skip-link">Salta al contenuto</a>`), visibile solo al focus da tastiera, per consentire agli utenti di saltare la navigazione ripetitiva.

### B. Semantica HTML & ARIA
1. **Landmark Semantici (WCAG 1.3.1)**:
   - Utilizzare tag HTML5 nativi: `<header>`, `<nav>`, `<main>`, `<section aria-label="...">`, `<aside>`, `<footer>`.
2. **Pulsanti e Link Solo-Icona (WCAG 4.1.2)**:
   - Qualsiasi pulsante o link contenente solo un'icona (es. toggle del menu mobile, frecce dei caroselli, link social nel footer) **deve** avere un attributo `aria-label` esplicito o uno `<span>` con classe screen-reader-only (`sr-only`).
3. **Nascondere Elementi Decorativi (WCAG 1.1.1)**:
   - Canvas 3D di sfondo, sfere glow, particelle decorative, divisori o icone puramente estetiche devono avere `aria-hidden="true"` per non confondere gli screen reader.
4. **Regioni Live & Notifiche (WCAG 4.1.3)**:
   - I messaggi di feedback asincroni (es. esito invio form contatti, carosello che cambia slide) devono usare `aria-live="polite"` o `role="status"`.

### C. Contrasto Cromatico & Percezione (WCAG 1.4.3 & 1.4.11)
1. **Contrasto del Testo**:
   - Minimo **4.5:1** per testo normale (< 18pt o < 14pt grassetto).
   - Minimo **3:1** per testo grande (≥ 18pt o ≥ 14pt grassetto).
2. **Contrasto Componenti UI**:
   - Minimo **3:1** per bordi di input, icone di controllo e indicatori di stato attivi.
3. **Non Solo Colore (WCAG 1.4.1)**:
   - Le informazioni di stato o errore nei form non devono essere comunicate unicamente tramite il colore (es. bordo rosso), ma accompagnate da testo esplicito o icone.

### D. Testo Alternativo delle Immagini (WCAG 1.1.1)
1. **Immagini Informative**:
   - `alt` chiaro e descrittivo del contenuto (es. logo aziendale: `alt="Logo Cavalieri Del Codice"`).
2. **Immagini Decorative**:
   - `alt=""` esplicito o `role="presentation"` per evitare che lo screen reader legga il nome del file.

### E. Target Tattili & Mobile (WCAG 2.5.8)
1. **Dimensione Minima di Tocco**:
   - Ogni target interattivo deve misurare almeno **24×24 px** (standard raccomandato: **44×44 px** o **48×48 px** su mobile) oppure avere spaziatura sufficiente attorno per evitare tap accidentali.

### F. Riduzione del Movimento (WCAG 2.3.3)
1. **Media Query `prefers-reduced-motion`**:
   - Le animazioni GSAP, Three.js, particelle o scorrimenti continui devono essere ridotte o disattivate per gli utenti che hanno abilitato la riduzione del movimento nel sistema operativo.

---

## 2. Ambito di Verifica: Sicurezza Web & Frontend (OWASP)

### A. Prevenzione Cross-Site Scripting (XSS)
1. **Uso di `dangerouslySetInnerHTML`**:
   - Verificare ogni occorrenza di `dangerouslySetInnerHTML`. Se il contenuto include dati dinamici o input utente, deve essere obbligatoriamente sanitizzato con librerie dedicate (es. `DOMPurify`).
2. **Iniezione da URL / Hash**:
   - Verificare che valori letti da `window.location.hash` o `searchParams` non vengano scritti direttamente nel DOM senza validazione.

### B. Protezione Link Esterni (Reverse Tabnabbing)
1. **Attributo `rel` Obbligatorio**:
   - Tutti i link esterni contenenti `target="_blank"` **devono** includere `rel="noopener noreferrer"`.
   - L'assenza espone al rischio di phishing in cui la pagina di destinazione può manipolare la pagina di origine tramite `window.opener.location`.

### C. Intestazioni di Sicurezza HTTP (Security Headers)
Verificare e configurare in `vercel.json` o nel server web le seguenti intestazioni HTTP:
1. **Content-Security-Policy (CSP)**:
   - Definire sorgenti fidate per script, stili, font, immagini e connessioni websocket/API.
2. **X-Frame-Options**:
   - `DENY` o `SAMEORIGIN` per prevenire attacchi di Clickjacking (il sito non può essere incorporato in iframe malevoli).
3. **X-Content-Type-Options**:
   - `nosniff` per impedire al browser di eseguire file interpretando tipi MIME errati.
4. **Referrer-Policy**:
   - `strict-origin-when-cross-origin` per non trasmettere query string o dati sensibili nei referrer.
5. **Permissions-Policy**:
   - Disabilitare feature non utilizzate: `camera=(), microphone=(), geolocation=()`.
6. **Strict-Transport-Security (HSTS)**:
   - Forzare HTTPS permanente su tutti i domini.

### D. Sicurezza dei Moduli & Sanitizzazione Dati
1. **Validazione Input Client-Side**:
   - Pattern regex rigorosi per email, numeri di telefono e testo.
   - Protezione da overflow di caratteri (`maxLength`).
2. **Anti-Spam / Anti-Bot**:
   - Campo "Honeypot" invisibile nei form di contatto o integrazione Captcha/Turnstile.
3. **Esposizione Token & Credenziali**:
   - Scansione del repository per accertare che nessuna API Key privata, Secret o credenziale sensibile sia presente nel codice o nel bundle client.

### E. Sicurezza Service Worker & Caching
1. **Validazione Route**:
   - Il file `sw.js` deve gestire solo richieste sicure (protocollo `https:`), ignorare schemi non validi e non memorizzare in cache dati personali o token di sessione.

---

## 3. Procedura Operativa per l'Audit

Quando attivato su un progetto:

### Fase 1: Scansione Automatica del Codice
Esegui controlli mirati nel repository:
1. **Scansione XSS & Link**:
   - Cerca `dangerouslySetInnerHTML` nei file JSX.
   - Cerca `target="_blank"` e verifica la presenza di `rel="noopener noreferrer"`.
2. **Scansione Accessibilità (a11y)**:
   - Cerca bottoni senza testo visibile o `aria-label`.
   - Cerca `outline: none` o `outline: 0` nei file CSS.
   - Cerca tag `<img>` privi di attributo `alt`.
   - Cerca `prefers-reduced-motion` nei file CSS.
3. **Scansione Header di Sicurezza**:
   - Ispeziona `vercel.json` o la configurazione server per verificare `headers`.
4. **Verifica Vulnerabilità Dipendenze**:
   - Esegui `npm audit` per identificare CVE note nei pacchetti npm.

### Fase 2: Redazione del Report
Genera un report chiaro e dettagliato con metriche quantitative:

```markdown
# 🛡️ Report di Audit Accessibilità (a11y) & Sicurezza Web

**Progetto**: [Nome Progetto]  
**Data Audit**: [Data]  
**Punteggio Stimato**: [🟢 ECCELLENTE (90-100) | 🟡 OTTIMIZZABILE (70-89) | 🔴 CRITICO (<70)]

---

### 1. Tabella dei Controlli di Accessibilità & Sicurezza

| Categoria | Parametro | Stato | Note & Dettagli |
| :--- | :--- | :---: | :--- |
| **Accessibilità** | Navigazione Tastiera & Focus Ring | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Accessibilità** | Semantica HTML & ARIA Labels | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Accessibilità** | Contrasto Colori & Leggibilità | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Accessibilità** | Testo Alternativo Immagini | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Accessibilità** | Target Tattili Mobile (≥44px) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Accessibilità** | Riduzione Movimento (prefers-reduced-motion) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Sicurezza Web** | Link Esterni (rel="noopener noreferrer") | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Sicurezza Web** | Prevenzione XSS (dangerouslySetInnerHTML) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Sicurezza Web** | HTTP Security Headers (CSP, X-Frame-Options) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Sicurezza Web** | Protezione Form & Anti-Spam | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Sicurezza Web** | Dipendenze & CVE (npm audit) | 🟢 / 🟡 / 🔴 | [Dettaglio] |

---

### 2. Vulnerabilità & Barriere Rilevate
- 🔴 **Criticità Elevata**: [Elementi bloccanti per disabilità o falle di sicurezza]
- 🟡 **Margini di Miglioramento**: [Best practice raccomandate per blindatura e standard WCAG]
- 🟢 **Punti di Forza**: [Punti di eccellenza già presenti nel codice]

---

### 3. Azioni Correttive Raccomandate (con Codice Pronto)
[Fornire il codice esatto per correggere ARIA, contrasto, focus-visible, security headers e link]
```

### Fase 3: Applicazione Diretta dei Fix
Proponi all'utente di implementare direttamente:
- Aggiunta di `rel="noopener noreferrer"` su tutti i link esterni.
- Aggiunta di `aria-label` su pulsanti icona e navigazione.
- Configurazione degli HTTP Security Headers in `vercel.json`.
- Integrazione dello stile per `:focus-visible` e `prefers-reduced-motion`.
