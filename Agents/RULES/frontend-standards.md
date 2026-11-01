# Regole di Sviluppo Frontend & Standard Architetturali (Cavalieri Del Codice)

Queste regole sono tassative e si applicano a ogni sessione di sviluppo nel workspace:

## 1. Architettura dei Componenti React
- **Nessun componente monolitico**: Ogni componente deve trovarsi nella propria cartella dedicata all'interno di `src/components/`:
  - `src/components/[NomeComponente]/[NomeComponente].jsx`
  - `src/components/[NomeComponente]/[NomeComponente].css`
- **Separazione dei Dati (Custom Hooks)**:
  - Non inserire array di dati, elenchi statici, mock o logiche di fetch pesanti direttamente nel corpo del JSX.
  - Creare sempre un custom Hook dedicato in `src/hooks/use[NomeDati].js` (es. `useProjects.js`, `useServicesData.js`) e consumarlo nel componente.
- **CSS Modulare**:
  - Non mescolare stili di componenti specifici in file globali come `App.css` o `index.css`.
  - Usare Vanilla CSS moderno con variabili CSS definite in `:root`, layout Flexbox/Grid e transizioni fluide.

## 2. Design Bar & Anti-AI Slop
- **Vietati i template banali generati da IA**:
  - No al solito gradiente viola/blu `from-purple to-indigo` su card piatte e no a 3 colonne monotone con icona al centro.
  - Creare layout asimmetrici, bento box a pesi variabili, tipografia d'impatto con contrasto gerarchico forte (titoli imponenti e micro-testi tecnici con tracking).
  - Aggiungere profondità visiva con riflessi, bordi sottili semi-trasparenti (`rgba(255,255,255,0.08)`), micro-animazioni al passaggio del cursore e stati interattivi fluidi.
- **Dati realistici**: Mai usare testi segnaposto o "Lorem ipsum". Inserire sempre dati specifici e realistici per il settore del cliente.
