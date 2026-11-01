---
name: performance-webgl-audit
description: >-
  Effettua un audit completo di Web Performance Optimization (WPO), Core Web Vitals (LCP, INP, CLS)
  e ottimizzazione 3D/WebGL (Three.js, memoria GPU, draw calls, shader e asset 3D). Da usare quando
  l'utente chiede verifiche di prestazioni, ottimizzazione velocità, FPS, leak di memoria WebGL o Core Web Vitals.
---

# Skill: Audit di Web Performance & Ottimizzazione WebGL / 3D

Questa skill guida l'agente nell'analisi avanzata e nel perfezionamento delle prestazioni web, focalizzandosi in particolare su applicazioni ad alto impatto visivo con canvas 3D (Three.js, React Three Fiber, WebGL), garantendo 60 FPS stabili, tempi di caricamento inferiori a 2.5 secondi e Core Web Vitals eccellenti.

---

## 1. Ambito di Verifica (I 6 Pilastri di Web Performance)

### A. Core Web Vitals (Metriche Ufficiali Google)
1. **LCP (Largest Contentful Paint < 2.5s)**:
   - Identificare l'elemento LCP (spesso l'immagine hero, un titolo di grandi dimensioni o il canvas 3D).
   - Se presente uno Splash Screen: evitare timer fissi bloccanti eccessivi (es. ritardi artificiali > 1 secondo) che ritardano artificialmente la visualizzazione dei contenuti.
   - Assegnare `fetchpriority="high"` e `loading="eager"` all'asset primario.
2. **INP (Interaction to Next Paint < 200ms)**:
   - Monitorare che i task JavaScript sul Main Thread non superino i 50ms (Long Tasks).
   - Assicurare che i listener di scroll, resize o puntatore (`pointermove`) siano throttled o integrati in `requestAnimationFrame`.
   - Evitare calcoli pesanti di geometria o animazioni complesse all'interno del loop di render di Three.js.
3. **CLS (Cumulative Layout Shift < 0.1)**:
   - Il contenitore del Canvas 3D deve avere dimensioni esplicite (es. `width: 100%; height: 100vh;` o `aspect-ratio`) per evitare che la pagina slitti quando il 3D viene montato.
   - Specificare `width` e `height` su ogni elemento multimediale.

### B. Ottimizzazione WebGL & Three.js (Memoria GPU & Frame Rate)
1. **Limitazione del Pixel Ratio (DPR Cap)**:
   - **Critico**: I display moderni (Retina, 4K, smartphone) hanno un `devicePixelRatio` pari a 3 o 4. Renderizzare un canvas 3D a 4x quadruplica il carico sulla GPU, provocando surriscaldamento e calo di FPS.
   - Impostare sempre un tetto massimo sul DPR:
     ```jsx
     <Canvas dpr={[1, Math.min(window.devicePixelRatio, 1.5)]} ... />
     ```
2. **Prevenzione dei Memory Leaks (Disposal Pattern)**:
   - Le risorse WebGL allocate nella VRAM **non** vengono liberate automaticamente dal Garbage Collector di JavaScript.
   - Alla distruzione o cambio di vista dei componenti 3D, invocare sistematicamente:
     - `geometry.dispose()`
     - `material.dispose()`
     - `texture.dispose()`
     - Se si usa `@react-three/fiber`, verificare che il canvas usi la garbage collection automatica o gestire cleanup espliciti negli `useEffect`.
3. **Ottimizzazione del Render Loop (Demand vs Continuous)**:
   - Se la scena non è costantemente in movimento (es. ruota solo al drag del mouse o allo scroll), utilizzare:
     ```jsx
     <Canvas frameloop="demand" ... />
     ```
   - Invocare `invalidate()` solo quando lo stato cambia, riducendo l'uso della batteria a zero durante l'inattività.
   - Mettere in pausa il rendering quando il canvas esce dal viewport tramite `IntersectionObserver`.
4. **Draw Calls, Polycount & Modelli 3D**:
   - Mantenere le draw calls sotto le 50-100 per scena.
   - Utilizzare `InstancedMesh` per oggetti ripetuti invece di creare singole mesh duplicate.
   - Modelli `.glb` / `.gltf`: comprimere con Draco, Meshopt o KTX2 per ridurre il download da megabyte a centinaia di kilobyte.
5. **Illuminazione & Ombre**:
   - Limitare le luci attive: evitare più di 1-2 luci che proiettano ombre contemporaneamente (`castShadow`).
   - Mantenere la risoluzione della shadow map contenuta (es. `shadow-mapSize={[512, 512]}` o `[1024, 1024]`).

### C. Bundle Splitting & Tree-Shaking
1. **Analisi dei Chunk**:
   - Verificare che librerie pesanti come `three`, `three-stdlib`, `@react-three/drei` siano isolate in chunk vendor dedicati (configurazione `manualChunks` in `vite.config.js`).
2. **Lazy Loading dei Componenti 3D**:
   - Usare `React.lazy()` e `Suspense` per caricare le sezioni 3D non visibili immediatamente (es. sotto lo scroll o in viste secondarie).
   - Inserire placeholder leggeri (skeleton o canvas CSS gradient) durante il caricamento.
3. **Import Mirati**:
   - Evitare import di interi pacchetti se si utilizzano solo poche utility (es. importare icone puntuali da `lucide-react`).

### D. Texture & Asset Optimization
1. **Dimensioni Potenze di Due (POT)**:
   - Le texture devono preferibilmente avere risoluzioni POT: `512x512`, `1024x1024`, massimo `2048x2048`. Evitare texture 4K/8K su web.
2. **Formati Web Moderni**:
   - Immagini e texture convertite in WebP o AVIF.
   - Texture compresse GPU (KTX2 / Basis Universal) per eliminare il costo di decodifica CPU.

### E. Caching, PWA & Strategie Offline
1. **Asset Immutabili**:
   - I file con hash nel nome (`assets/index-[hash].js`, `[hash].css`) devono essere serviti con:
     `Cache-Control: public, max-age=31536000, immutable`.
2. **Service Worker (`sw.js`)**:
   - Cache-first strategy per asset pesanti (modelli `.glb`, font, texture) per consentire caricamenti istantanei al secondo accesso.

---

## 2. Procedura Operativa per l'Audit di Performance

Quando attivato su un progetto:

### Fase 1: Scansione del Codice e Profilazione
Esegui controlli mirati nel repository:
1. **Verifica Canvas & Three.js**:
   - Cerca `<Canvas` e controlla `dpr`, `frameloop`, `gl={{ powerPreference: 'high-performance' }}`.
   - Controlla la presenza di timer artificiali in splash screen (`setTimeout`, `MIN_DISPLAY_MS`).
2. **Verifica Dimensione Modelli e Asset**:
   - `ls -lh public/ src/assets/3d/` per individuare file `.glb`, `.obj` o texture oltre 5MB.
3. **Verifica Vite Chunk Splitting**:
   - Ispeziona `vite.config.js` per verificare `manualChunks` e rollup options.
4. **Verifica Esecuzione Build**:
   - Esegui `npm run build` e analizza l'output dei chunk:
     - Warning su chunk > 500 kB?
     - Tree-shaking efficiente?

### Fase 2: Redazione del Report di Performance
Genera un report chiaro e dettagliato con metriche quantitative:

```markdown
# ⚡ Report di Audit Web Performance & WebGL

**Progetto**: [Nome Progetto]  
**Data Audit**: [Data]  
**Punteggio Stimato**: [🟢 ECCELLENTE (90-100) | 🟡 OTTIMIZZABILE (70-89) | 🔴 CRITICO (<70)]

---

### 1. Tabella dei Controlli

| Categoria | Parametro | Stato | Note & Dettagli |
| :--- | :--- | :---: | :--- |
| **Core Web Vitals** | LCP & Splash Screen timing | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Core Web Vitals** | INP & Long Tasks JS | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Core Web Vitals** | CLS & Container Sizing | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **WebGL & 3D** | Device Pixel Ratio (DPR Cap) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **WebGL & 3D** | Frameloop & CPU/GPU Idle | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **WebGL & 3D** | Peso Modelli 3D (.glb / polycount) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **WebGL & 3D** | Memory Disposal & Cleanup | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Bundle & Build** | Chunk Splitting (Three.js isolato) | 🟢 / 🟡 / 🔴 | [Dettaglio] |
| **Asset & Cache** | Compressione Texture & Service Worker | 🟢 / 🟡 / 🔴 | [Dettaglio] |

---

### 2. Colli di Bottiglia Rilevati
- 🔴 **Criticità di Prestazione**: [Elementi che bloccano il thread principale o affaticano la GPU]
- 🟡 **Margini di Guadagno**: [Ottimizzazioni per ridurre il peso e migliorare il framerate]
- 🟢 **Punti di Forza**: [Best practice già attive con successo]

---

### 3. Azioni Correttive Raccomandate (con Codice Pronto)
[Fornire il codice esatto per ottimizzare il canvas, comprimere asset o correggere il chunking]
```

### Fase 3: Applicazione Diretta dei Fix
Proponi all'utente di implementare direttamente:
- Impostazione di `dpr={[1, 1.5]}` o `dpr={[1, 2]}` per proteggere dispositivi mobile e 4K.
- Rimozione o riduzione del tempo bloccante artificiale dello splash screen.
- Ottimizzazione di `vite.config.js` con chunking intelligente per isolare Three.js.
- Aggiunta di cleanup/dispose su scene e geometrie.
