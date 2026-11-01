---
name: fullstack-serverless-ops
description: >-
  Architettura backend serverless, database edge (Turso / libSQL, Supabase, Firebase) e pratiche
  di deploy per Vercel e GitHub. Da usare quando si creano API serverless, autenticazione, operazioni
  CRUD su database, webhooks, invio email e configurazioni sicure di deploy e variabili d'ambiente.
---

# Skill: Architettura Backend Serverless, Database Edge & DevOps (Vercel & GitHub)

Questa skill guida l'agente nella progettazione, implementazione e messa in produzione di architetture fullstack scalabili, sicure e serverless, con focus primario su **Turso (libSQL)** come database edge distribuito, **Supabase / Firebase** per autenticazione e storage, e **Vercel** per hosting e serverless execution.

---

## 1. Database Edge Primario: Turso (libSQL)

Turso offre database SQLite distribuiti al limite della rete (Edge), con tempi di risposta di pochi millisecondi.

### A. Pattern di Connessione Singleton (Serverless Friendly)
Nelle funzioni serverless o edge di Vercel, evita di ri-istanziare il client per ogni richiesta. Usa un'istanza singleton:

```javascript
// lib/turso.js o api/_lib/turso.js
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('Configurazione Turso mancante: verificare TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.');
}

export const turso = createClient({
  url,
  authToken,
});
```

### B. Protezione Assoluta da SQL Injection (Query Parametriche)
**Vietato** concatenare stringhe direttamente nei comandi SQL (`WHERE id = ' + id`). Utilizzare sempre parametri posizionali o nominali:

```javascript
// Corretto: Query parametrica sicura
const result = await turso.execute({
  sql: 'SELECT * FROM leads WHERE email = :email AND status = :status',
  args: { email: userEmail, status: 'active' }
});

// Inserimento sicuro con transazione
await turso.execute({
  sql: 'INSERT INTO orders (id, customer_name, total_amount, created_at) VALUES (:id, :name, :total, CURRENT_TIMESTAMP)',
  args: { id: crypto.randomUUID(), name, total }
});
```

### C. Gestione Schemi & Migrazioni
- Mantenere una cartella `migrations/` o `db/schema.sql` con le definizioni delle tabelle (`CREATE TABLE IF NOT EXISTS`).
- Definire sempre indici sulle colonne interrogate frequentemente:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
  ```

---

## 2. Supabase & Firebase: Pattern di Integrazione

### A. Supabase (PostgreSQL & Row Level Security)
1. **Client Pubblico vs Client Admin**:
   - `anon key` (Client-side): utilizzata esclusivamente nel browser per autenticazione utente e query protette da **RLS (Row Level Security)**.
   - `service_role key` (Server-side): usata **unicamente** all'interno di funzioni serverless (`api/`) per bypassare RLS in operazioni amministrative. **Mai esporla nel frontend**.
2. **Row Level Security (RLS) Obbligatoria**:
   - Qualsiasi tabella creata su Supabase deve avere RLS abilitato (`ALTER TABLE nome_tabella ENABLE ROW LEVEL SECURITY;`).

### B. Firebase (Firestore & Auth)
1. Inizializzare l'app con credenziali d'ambiente.
2. Nelle Security Rules di Firestore, disabilitare l'accesso pubblico non autenticato in produzione (`allow read, write: if false;` come default, aprendo solo le collezioni necessarie con controlli `request.auth != null`).

---

## 3. Vercel Serverless Functions (`api/`)

In progetti Vite o standalone su Vercel, gli endpoint backend risiedono nella cartella `api/`:

```
progetto/
├── api/
│   ├── contact.js       # Gestione invio messaggi e salvataggio DB
│   ├── checkout.js      # Creazione sessione pagamento (Stripe)
│   └── leads.js         # Endpoint API protetto
```

### Struttura Standard di una Serverless Function Sicura:
```javascript
// api/contact.js
import { turso } from './_lib/turso.js';

export default async function handler(req, res) {
  // 1. Limita i metodi HTTP consentiti
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito. Usare POST.' });
  }

  try {
    const { name, email, message, _hp } = req.body;

    // 2. Protezione Spam Honeypot (se compilato da un bot, esci silenziosamente)
    if (_hp) {
      return res.status(200).json({ success: true });
    }

    // 3. Validazione dati in ingresso
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tutti i campi obbligatori devono essere compilati.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Indirizzo email non valido.' });
    }

    // 4. Esecuzione query su Turso
    await turso.execute({
      sql: 'INSERT INTO contacts (id, name, email, message, created_at) VALUES (:id, :name, :email, :message, datetime("now"))',
      args: { id: crypto.randomUUID(), name, email, message }
    });

    return res.status(201).json({ success: true, message: 'Richiesta registrata con successo.' });
  } catch (error) {
    console.error('[API Contact Error]:', error);
    return res.status(500).json({ error: 'Errore interno del server durante l\'elaborazione.' });
  }
}
```

---

## 4. Gestione Sicura delle Variabili d'Ambiente (`.env`)

### La Regola d'Oro del Leak Prevention:
- **Client Bundle (Vite)**: Solo le variabili con prefisso `VITE_` finiscono nel bundle JS pubblico visibile a chiunque apra i Developer Tools del browser.
- **Serverless / Backend**: Le chiavi private non devono **mai** avere il prefisso `VITE_`.

| Nome Variabile | Destinazione | Rischio se trapela |
| :--- | :---: | :--- |
| `TURSO_AUTH_TOKEN` | Serverless (`api/`) | 🔴 **CRITICO**: Accesso completo al database |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverless (`api/`) | 🔴 **CRITICO**: Bypass totale delle regole RLS |
| `RESEND_API_KEY` | Serverless (`api/`) | 🔴 **CRITICO**: Spam e furto di quota email |
| `VITE_SUPABASE_ANON_KEY` | Frontend (`src/`) | 🟢 **SICURO**: Protetto da Row Level Security |
| `VITE_FORMSPREE_ID` | Frontend (`src/`) | 🟢 **SICURO**: Endpoint pubblico di submit |

### Verifica File `.gitignore`:
Assicurarsi che il file `.gitignore` contenga sempre:
```gitignore
.env
.env.local
.env.*.local
node_modules/
dist/
```

---

## 5. GitHub Workflow & Buone Pratiche Git

### A. Conventional Commits (Standard Internazionale)
Ogni commit deve avere un messaggio chiaro con prefisso semantico:
- `feat: aggiunta gestione carrello e integrazione stripe`
- `fix: corretto calcolo del totale ordini su database turso`
- `perf: ridotto tempo di risposta query su leads con indice sqlite`
- `refactor: separata logica di autenticazione in custom hook`
- `security: aggiunti header di protezione csp e disabilitato eval`

### B. Gestione Asset Pesanti
Non committare file binari non compressi (video da 50MB, modelli 3D grezzi da 100MB) nel repository Git. Ottimizzare e comprimere prima del commit (es. GLB compressi con Draco, video in WebM o hosting esterno CDN).

---

## 6. Checklist di Verifica Fullstack & Deploy

Prima di effettuare il push su GitHub o il deploy su Vercel:
- [ ] Il file `.env` è presente nel `.gitignore` e nessuna Secret Key privata è scritta nel frontend?
- [ ] Le query al database (Turso o Supabase) usano parametri sicuri (zero rischio SQL Injection)?
- [ ] Le funzioni in `api/` gestiscono correttamente i codici di errore HTTP (400, 405, 500) e i blocchi `try/catch`?
- [ ] Le variabili d'ambiente di produzione sono state configurate nel pannello di Vercel (`Project Settings > Environment Variables`)?
- [ ] I commit seguono la convenzione semantica pulita?
