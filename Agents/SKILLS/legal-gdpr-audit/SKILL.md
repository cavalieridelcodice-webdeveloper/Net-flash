---
name: legal-gdpr-audit
description: >-
  Effettua un audit completo di conformità legale, GDPR, Cookie Law e normative web italiane ed europee
  sui siti web prima della pubblicazione in produzione. Da usare quando l'utente chiede verifiche legali,
  check GDPR, controllo privacy, conformità cookie o prevenzione sanzioni.
---

# Skill: Audit di Conformità Legale, Privacy & GDPR per Siti Web

Questa skill guida l'agente nell'esecuzione di un check-up legale rigoroso sul sito web, identificando falle che potrebbero esporre il proprietario a sanzioni da parte del Garante per la Privacy (GDPR), dell'Agenzia delle Entrate o dell'AGCM (Codice del Consumo).

---

## 1. Ambito di Verifica (I 6 Pilastri di Conformità)

### A. Cookie & Tracciamento Preventivo (Direttiva ePrivacy & Linee Guida Garante 2021)
1. **Blocco Preventivo**: Cookie di terze parti, Google Analytics (GA4), Facebook/Meta Pixel, Hotjar o script di profilazione **NON devono essere eseguiti prima** del click su "Accetta".
2. **Pulsante "Rifiuta"**: Il Cookie Banner deve avere il tasto "Rifiuta tutto" o la "X" di chiusura con pari visibilità e dimensione rispetto ad "Accetta". Non usare bottoni nascosti o gerarchie ingannevoli (dark patterns).
3. **Consenso Attivo**: Lo scroll della pagina o la prosecuzione della navigazione **NON costituiscono consenso valido**.
4. **Preferenze Dettagliate**: Possibilità di selezionare singole categorie di cookie (Necessari, Statistici, Marketing).
5. **Rinnovabilità**: Possibilità per l'utente di riaprire le preferenze cookie in qualsiasi momento (es. link nel footer).

### B. Dati Fiscali e Societari Obbligatori (Art. 35 DPR 633/72 & Art. 2250 c.c.)
1. **Partita IVA in Home Page**: Obbligo di esporre la P.IVA nella home page/footer per chiunque svolga attività professionale o d'impresa (sanzioni da 258 € a 2.065 € per omessa indicazione).
2. **Dati Societari (se società)**: Denominazione sociale, sede legale, Ufficio del Registro delle Imprese e numero REA, capitale sociale versato ed eventuale stato di liquidazione / socio unico.
3. **Contatti Diretti**: Almeno un indirizzo email o modulo di contatto funzionante, ideale indicare anche la PEC.

### C. Privacy Policy & Diritti Utente (Art. 13 e 14 GDPR)
1. **Titolare del Trattamento**: Nome o ragione sociale, indirizzo fisico e recapito email per l'esercizio dei diritti privacy.
2. **Finalità e Basi Giuridiche**: Spiegazione trasparente di quali dati vengono raccolti (modulo contatti, log server, analisi) e perché.
3. **Periodo di Conservazione (Retention Period)**: Indicazione di quanto a lungo vengono trattenuti i dati.
4. **Diritti GDPR**: Elenco esplicito dei diritti dell'interessato (accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e diritto di reclamo al Garante Privacy).
5. **Hosting & Trasferimento extra-UE**: Se il sito usa hosting o API con server USA (Vercel, Supabase, Google, AWS), menzionare le clausole contrattuali standard (SCC) o il Data Privacy Framework.

### D. Moduli di Contatto & Form (Lead Generation / Newsletter)
1. **Consenso Separato**:
   - Il consenso alla presa in carico della richiesta deve rimandare alla Privacy Policy.
   - Il consenso per newsletter o comunicazioni commerciali deve essere **opzionale e con checkbox non preselezionata**.
2. **Principio di Minimizzazione**: Richiedere solo i dati strettamente necessari (es. non chiedere codice fiscale se non occorre fatturazione immediata).
3. **Sicurezza in Transito**: Protocollo HTTPS obbligatorio su tutte le pagine con form.

### E. Trasparenza Intelligenza Artificiale (EU AI Act)
1. **Contenuti e Immagini Sintetiche**: Se il sito impiega immagini, video o testi generati tramite IA, deve essere presente una chiara e trasparente dicitura (es. disclaimer nel footer).
2. **Chatbot / Assistenti Virtuali**: L'utente deve essere informato immediatamente se sta interagendo con un sistema automatizzato/IA e non con un operatore umano.

### F. Proprietà Intellettuale & Copyright
1. **Crediti & Licenze**: Verifica che non siano presenti immagini coperte da copyright non autorizzato.
2. **Font & Risorse Esterne**: Preferire il self-hosting dei font (Google Fonts ospitati localmente) per evitare il trasferimento automatico di indirizzi IP a server terzi (come segnalato da varie sentenze europee sui Google Fonts).

---

## 2. Procedura Operativa per l'Audit

Quando attivato su un progetto:

### Fase 1: Scansione del Codice Sorgente
Esegui controlli automatici nel repository:
1. Cerca tracciatori terzi in `index.html` e nei sorgenti:
   - `gtag`, `google-analytics`, `G-`, `fbq`, `hotjar`, `clarity`, `pixel`.
   - Verifica se questi script sono condizionati dallo stato del consenso dei cookie.
2. Cerca la presenza di Partita IVA:
   - `grep -ri "p.iva\|partita iva\|vat" src/`
3. Cerca la gestione delle Cookie & Privacy Policy:
   - Verificare link nel footer (`href="/privacy"` o modali dedicati).
   - Verificare se il testo della Privacy Policy contiene Titolare, Email e Diritti GDPR.
4. Cerca tutti i tag `<form>`:
   - Controllare la presenza di checkbox di accettazione privacy e link alla policy.

### Fase 2: Redazione del Report di Conformità
Genera un report chiaro e strutturato diviso in tre livelli di priorità:

```markdown
# 🛡️ Report di Conformità Legale & GDPR

**Progetto**: [Nome Progetto]  
**Data Audit**: [Data]  
**Stato Globale**: [🟢 PRONTO PER IL LANCIO | 🟡 ATTENZIONE RICHIESTA | 🔴 CRITICITÀ BLOCCANTI]

---

### 1. Riepilogo dei Controlli

| Area di Controllo | Stato | Note |
| :--- | :---: | :--- |
| **Cookie & Blocco Preventivo** | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Privacy Policy (Art. 13 GDPR)** | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Dati Fiscali (P.IVA / REA)** | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Form & Checkbox Privacy** | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Trasparenza Intelligenza Artificiale** | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Sicurezza & HTTPS** | 🟢 / 🟡 / 🔴 | [Dettaglio] |

---

### 2. Dettaglio delle Criticità Rilevate
- 🔴 **Criticità Bloccanti**: [Violazioni ad alto rischio di sanzione immediata]
- 🟡 **Punti di Miglioramento**: [Requisiti raccomandati dalle linee guida]

---

### 3. Azioni Correttive Raccomandate (con Codice Pronto)
[Fornire il codice esatto per risolvere ogni punto critico evidenziato]
```

### Fase 3: Proposta di Correzione Immediata
Chiedi all'utente l'autorizzazione a implementare direttamente i fix di codice necessari (es. inserimento P.IVA segnaposto nel footer, aggiunta checkbox al form o blocco condizionale dello script di tracciamento).
