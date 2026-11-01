---
name: premium-frontend-architect
description: >-
  Guida alla creazione di interfacce web premium, uniche e di livello Awwwards/Studio AAA.
  Evita il tipico design "generato da IA" (gradienti viola banali, layout a card piatte, card generiche)
  e impone un'architettura React impeccabile: ogni componente ha la sua cartella con JSX dedicato, CSS dedicato
  e separazione di dati/logica in custom Hook. Include tecniche di arte algoritmica, grafiche procedurali SVG/Canvas
  e generazione sartoriale di palette cromatiche.
---

# Skill: Architettura Frontend Premium, Anti-AI Design & Arte Algoritmica

Questa skill definisce le linee guida estetiche, architetturali e tecniche per trasformare qualsiasi sito o web app in un prodotto digitale **memorabile, sartoriale e di altissimo valore commerciale**, eliminando qualsiasi sensazione di "sito generico o generato da un'IA standard".

---

## 1. Architettura di Codice Obbligatoria (Component-First & Data Decoupling)

In qualsiasi progetto, la struttura delle cartelle e dei file deve rispettare la seguente gerarchia rigorosa **senza bisogno che l'utente lo specifichi ogni volta**:

### A. Struttura dei Componenti (Regola Cartella + JSX + CSS)
Ogni componente React deve risiedere nella propria cartella dedicata in `src/components/` e contenere sia il markup che il foglio di stile isolato:

```
src/
├── components/
│   ├── [NomeComponente]/
│   │   ├── [NomeComponente].jsx    # Markup semantico, logica di render e interattività
│   │   └── [NomeComponente].css    # Stili dedicati, animazioni e responsive design
```

- **Divieto di fogli di stile monolitici**: Non inserire stili di componenti specifici in `App.css` o `index.css`.
- **Nomi identici e PascalCase**: `ServicesGrid/ServicesGrid.jsx` + `ServicesGrid/ServicesGrid.css`.
- **CSS Vanilla Moderno**: Utilizzare variabili CSS (`var(--...)`), Flexbox/Grid moderni, pseudo-classi avanzate (`:focus-visible`, `:hover`, `:has()`) e clamp fluido (`clamp(1.5rem, 4vw, 3rem)`).

### B. Separazione Dati e Logica con Custom Hooks (`src/hooks/`)
I componenti JSX devono occuparsi unicamente della presentazione e dell'esperienza visiva. Qualsiasi set di dati, mock-up, stato complesso o logica asincrona deve essere isolato in un Hook personalizzato:

```
src/
├── hooks/
│   ├── use[NomeFunzionalita].js     # Es: useServicesData.js, useProjects.js, usePortfolio.js
```

**Esempio di separazione corretta**:
```javascript
// src/hooks/useServicesData.js
import { useMemo } from 'react';

export const useServicesData = (t) => {
  const services = useMemo(() => [
    { id: 'custom-dev', icon: 'Code', title: 'Architetture Sartoriali', ... },
    // Dati isolati e manutenibili
  ], [t]);

  return { services };
};
```
Nel componente JSX si importa e consuma semplicemente l'hook:
```jsx
// src/components/ServicesGrid/ServicesGrid.jsx
import { useServicesData } from '../../hooks/useServicesData';
const { services } = useServicesData(t);
```

---

## 2. Il Manifesto "Anti-AI Slop": Come Evitare il Look Generico

I siti generati male dalle IA soffrono tutti degli stessi difetti riconoscibili a vista d'occhio da qualsiasi cliente o designer professionista. Questa skill impone il divieto assoluto di tali pattern.

### 🚫 I 6 Errori del Design "Generato da IA" (DA EVITARE SEMPRE)
1. **La "Trinità Noiosa" Viola/Blu**: L'abuso del gradiente standard `from-purple-600 to-indigo-600` su card nere trasparenti.
2. **Le 3 Card Identiche a Griglia Piatta**: Tre box identici con un'icona generica centrata, un titoletto e due righe di testo riempitivo tipo "Lorem ipsum" o "Offriamo soluzioni innovative".
3. **Pulsanti con Glow Eccessivo e Poco Contrasto**: Bottoni fluorescenti illegibili o bordi arrotondati ovunque (`rounded-3xl` indiscriminato) senza gerarchia.
4. **Hero Section con Titoli Banali**: "Costruiamo il tuo futuro digitale", "Benvenuto nel futuro del web".
5. **Assenza di Texture e Grana**: Sfondi a colore solido `#000000` o `#ffffff` senza profondità, pattern di griglia, noise sottile o riflessi ambientali.
6. **Mancanza di Dettagli Micro-Interattivi**: Hover statici, link senza transizioni, assenza di feedback tattile o sonoro/visivo.

---

## 3. I Pilastri del Design Premium "Studio AAA"

Per ogni progetto, adotta una direzione artistica sartoriale specifica per il target di mercato:

### A. Tipografia di Carattere (Font Pairing di Livello Internazionale)
Evitare i font di default dei browser (Arial, Times). Usare accoppiamenti tipografici moderni da Google Fonts o CDN:
- **Tecnico & Cyberpunk**: `Outfit` (Heading heavy) + `Inter` o `JetBrains Mono` (Body/Tech).
- **Lusso & Creativo**: `Cinzel` o `Syne` (Titoli artistici) + `Plus Jakarta Sans` (Body).
- **Modern Agency / SaaS**: `Space Grotesk` o `Clash Display` + `Satoshi`.
- **Tracking e Hierarchy**: Titoli con `letter-spacing: -0.02em` o `0.04em`, maiuscoletti tecnici (`text-transform: uppercase`, `letter-spacing: 0.15em`) per badge e metadati.

### B. Layout Dinamici e Asimmetrici
- **Bento Grid a Peso Variabile**: Celle di dimensioni differenti (es. card 1x2, card 2x1 con elementi interattivi live, ticker scorrevoli, indicatori di stato).
- **Hero Section su più Livelli**: Livello sfondo (mesh gradient/3D/canvas), livello intermedio (testo gigante tipografico) e livello primo piano (card fluttuanti o mockup interattivi).
- **Depth & Sovrapposizioni**: Elementi che escono leggermente dal loro contenitore o si sovrappongono parzialmente con `z-index` ragionato.

### C. Micro-Interazioni e Feedback Fisico
- **Hover su Card**: Movimento 3D tilt (`perspective`), gradiente che segue il mouse o bordi che si illuminano al passaggio.
- **Transizioni Fluide**: Usare curve bezier raffinate (es. `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Indicatori di Stato "Live"**: Piccoli pallini pulsanti verdi o ciano (`animation: pulse`) per indicare disponibilità o sistemi operativi.

### D. Dati Realistici (Zero Placeholders)
- **Niente Testi Generici**: Utilizzare nomi di progetti reali, metriche quantitative ("+340% conversioni", "99.98% uptime"), tecnologie concrete (Next.js, Three.js, PostgreSQL) e prezzi o timeline realistiche.

---

## 4. Arte Algoritmica, Grafiche Procedurali & Canvas (Creative Frontend)

Invece di scaricare immagini raster pesanti (PNG da 1-2 MB) per sfondi e decorazioni, genera grafiche **matematiche, procedurali e ultra-leggere direttamente in codice**:

### A. Pattern SVG Matematici (0 KB di immagini esterne)
Utilizza pattern SVG scalabili e leggeri direttamente nei componenti:
- **Griglie Isometriche e Blueprint**: Definisci pattern vettoriali per dare profondità architetturale (`<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">`).
- **Onde Trigonometriche**: Curve di Bézier calcolate matematicamente con SVG per separatori di sezione o dinamiche grafiche (`d="M0,50 Q250,0 500,50 T1000,50 L1000,100 L0,100 Z"`).
- **Circuiti e Tracciati Cyber**: Linee con coordinate ortogonali e punti di snodo per dare un'estetica tecnologica su misura.

### B. Canvas 2D Procedurale Nativo (Sfondi Viventi a 60 FPS)
Quando una sezione richiede movimento continuo ma un canvas 3D Three.js sarebbe troppo pesante:
- Crea un micro-componente Canvas 2D (`requestAnimationFrame` nativo).
- **Costellazioni e Particelle Connesse**: 30-50 punti fluttuanti che disegnano una linea di collegamento se la distanza euclidea è `< 100px`.
- **Zero dipendenze**: Pesa meno di 2 kB di codice JavaScript, consuma zero memoria GPU rispetto a un motore 3D e funziona a 60 FPS stabili anche su smartphone entry-level.

### C. Shader e Luci Matematiche in WebGL / Three.js
- In React Three Fiber, sfrutta materiali riflettenti (`MeshReflectorMaterial`), gradienti procedurali (`GradientTexture`) ed effetti fresnel per far sembrare gli oggetti fisici e tridimensionali senza bisogno di texture esterne giganti.

---

## 5. Theme Factory: Palette Colori Sartoriali & Color Science

Evita le palette predefinite generiche. Definisci variabili cromatiche HSL/Hex strutturate su 5 livelli di gerarchia visiva:

### A. Archetipi di Palette per Settore
1. **Cyberpunk & Tech d'Avanguardia**:
   - Background: `#050510` (Dark Navy ultra-profondo)
   - Accenti: `#00f3ff` (Electric Cyan) e `#ff00e6` (Neon Magenta)
   - Texture: scanlines ed effetti glow con `box-shadow` e radial gradients
2. **Luxury, Orologeria & Architettura**:
   - Background: `#0b0b0d` (Ossidiana calda)
   - Accenti: `#d4af37` (Oro champagne) e `#e2e8f0` (Platino)
   - Tipografia: Serif artistico (`Cinzel` o `Playfair`) con lettere spaziate
3. **Clean-Tech & AI Sostenibile**:
   - Background: `#06120e` (Foresta notturna)
   - Accenti: `#10b981` (Smeraldo) e `#6ee7b7` (Menta luminescente)
4. **Fintech & Sicurezza Bancaria**:
   - Background: `#080c14` (Blu cobalto scurissimo)
   - Accenti: `#3b82f6` (Blu elettrico istituzionale) e `#10b981` (Verde verifica)

### B. Struttura delle Variabili CSS in `:root`
```css
:root {
  /* Superfici e Sfondi */
  --bg-main: #050510;
  --bg-card: rgba(15, 17, 30, 0.65);
  --bg-card-hover: rgba(22, 26, 46, 0.85);

  /* Bordi e Riflessi */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(0, 243, 255, 0.4);

  /* Accenti e Luce */
  --accent-primary: #00f3ff;
  --accent-secondary: #ff00e6;
  --glow-primary: 0 0 20px rgba(0, 243, 255, 0.4);

  /* Testi ad Alto Contrasto (WCAG AA) */
  --text-primary: #ffffff;
  --text-muted: #94a3b8;
  --text-accent: #00f3ff;
}
```

---

## 6. Checklist di Verifica per Nuovi Progetti

Prima di considerare concluso un componente o una pagina:
- [ ] Ogni componente risiede nella cartella `src/components/Nome/Nome.jsx` + `Nome.css`?
- [ ] Tutti i dati dinamici o elenchi sono isolati in custom hook in `src/hooks/`?
- [ ] Il sito ha un'identità visiva unica (banditi i soliti layout a 3 card piatte e gradienti viola standard)?
- [ ] Le decorazioni di sfondo sfruttano grafiche procedurali SVG o canvas leggeri al posto di PNG pesanti?
- [ ] La palette cromatica ha contrasti marcati e rispetta gli standard di accessibilità WCAG AA?
- [ ] Gli elementi interattivi hanno feedback fisico al passaggio del mouse (`:hover`, `:focus-visible`)?
