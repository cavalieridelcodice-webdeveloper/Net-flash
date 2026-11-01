---
name: motion-gsap-director
description: >-
  Guida avanzata per animazioni web, micro-interazioni e fluidità a livello Awwwards con GSAP 3,
  ScrollTrigger, Lenis smooth scroll, magnetic hover, text reveal ed effetti di profondità senza
  impattare sulle prestazioni o sul frame rate. Da usare quando si creano o perfezionano animazioni,
  transizioni e coreografie interattive.
---

# Skill: Direzione del Movimento, Micro-Interazioni & GSAP (Studio Grade)

Questa skill guida l'agente nella progettazione e realizzazione di animazioni fluide, organiche e coreografate per siti web di fascia alta, trasformando interfacce statiche in esperienze digitali reattive e vive senza sacrificare i 60 FPS o l'accessibilità.

---

## 1. Architettura di Animazione in React (Prevenzione Memory Leak)

In ambiente React, qualsiasi animazione GSAP **deve** seguire il pattern di isolamento e pulizia (`gsap.context`) per evitare glitch durante l'HMR (Hot Module Replacement) o memory leak al cambio di rotta:

### Il Pattern `gsap.context()` Obbligatorio
```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Definiamo il contesto vincolato al ref del contenitore
    const ctx = gsap.context(() => {
      
      // Tutte le animazioni e gli ScrollTrigger creati qui dentro
      // verranno automaticamente tracciati e puliti
      gsap.fromTo(
        '.animated-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, containerRef); // 👈 Scope selettori isolato

    // 2. Cleanup automatico di tutti i trigger e timeline allo smontaggio
    return () => ctx.revert();
  }, []);

  return <section ref={containerRef}>...</section>;
};
```

---

## 2. Le Tecniche di Movimento "Studio AAA"

### A. Easing Fisici e Naturali (Bandire l'Ease `linear` e `ease-in-out` generico)
Niente rende un sito "finto" quanto un'animazione lineare o con rimbalzi fanciulleschi. Usare curve esponenziali e decadimenti naturali:
- **`power3.out` / `power4.out`**: Decelerazione cinematografica elegante per entrate e reveal di testi.
- **`expo.out`**: Movimento iper-reattivo iniziale con arresto graduale e morbidissimo.
- **`back.out(1.4)`**: Leggerissimo overshoot elastico per bottoni, badge e modali (non superare 1.4-1.7 per evitare effetti cartooneschi).

### B. ScrollTrigger: Scansioni Scenografiche & Parallasse
1. **Trigger a Scatto (Entrata Naturale)**:
   - `start: 'top 85%'` (attiva quando l'elemento entra nella parte bassa dello schermo).
   - `toggleActions: 'play none none reverse'` (ripete elegantemente se l'utente risale).
2. **Scrubbing Sincronizzato con lo Scroll (`scrub: 1` o `scrub: 1.5`)**:
   - Usare `scrub: 1` anziché `scrub: true` per introdurre una leggera inerzia (smoothing) tra il movimento della rotellina e l'animazione.
3. **Pinning di Sezione (Sezioni Orizzontali o Fisse)**:
   - Bloccare una sezione mentre le card scorrono orizzontalmente o si sovrappongono a strati:
     ```javascript
     ScrollTrigger.create({
       trigger: containerRef.current,
       pin: true,
       start: 'top top',
       end: '+=1500',
       scrub: 1
     });
     ```

### C. Text Revelations (Svelamento Tipografico Dinamico)
Invece del classico fade-in piatto, svela i titoli con maschere e ritardo sequenziale:
1. **Clip-Path Reveal (Taglio a Tendina)**:
   ```css
   .reveal-text {
     clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
     overflow: hidden;
   }
   ```
   In GSAP:
   ```javascript
   gsap.fromTo('.reveal-text span', 
     { y: '110%', rotateZ: 3 }, 
     { y: '0%', rotateZ: 0, duration: 1.2, ease: 'power4.out', stagger: 0.08 }
   );
   ```
2. **Decryption / Scramble Effect (per siti Cyber & Tech)**:
   - Sostituire temporaneamente i caratteri di un titolo con simboli random (`#`, `%`, `0`, `1`, `X`) per 0.4 secondi prima di comporre la parola finale.

---

## 3. Micro-Interazioni Fisiche & Cursore

I siti d'agenzia premium fanno sentire l'utente "connesso" con la pagina attraverso risposte tattili e visive immediate:

### A. Pulsanti Magnetici (Magnetic Button)
Il pulsante si muove leggermente verso il cursore del mouse quando l'utente si avvicina:
```javascript
const handleMouseMove = (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  // Attira il pulsante fino a un massimo di 15-20px
  gsap.to(btn, {
    x: x * 0.35,
    y: y * 0.35,
    duration: 0.3,
    ease: 'power2.out'
  });
};

const handleMouseLeave = () => {
  // Ritorna alla posizione di riposo con elasticità
  gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
};
```

### B. Card 3D Tilt con Prospettiva
Applicare una rotazione sugli assi X e Y proporzionale alle coordinate del mouse:
- `transform: perspective(1000px) rotateX(...) rotateY(...) scale3d(1.02, 1.02, 1.02)`
- Riflesso di luce dinamico (`radial-gradient` posizionato su `(e.clientX, e.clientY)`) che si muove sotto la superficie della card.

---

## 4. Regole d'Oro di Prestazione per le Animazioni (GPU Friendly)

1. **La Regola del Compositor (Zero Reflow)**:
   - Animare **ESCLUSIVAMENTE**:
     - `transform` (`x`, `y`, `scale`, `rotation`, `skew`)
     - `opacity`
   - **VIETATO animare**: `width`, `height`, `top`, `left`, `margin`, `padding`, `filter: blur()` su elementi di grandi dimensioni. Modificare queste proprietà forza il ricalcolo dell'intero layout del browser (Reflow/Repaint) e fa crollare gli FPS sotto i 30.
2. **`will-change` con Parsimonia**:
   - Applicare `will-change: transform, opacity;` solo durante l'animazione o su elementi chiave, rimuovendolo a riposo per non saturare la memoria VRAM.
3. **Rispetto dell'Accessibilità (`prefers-reduced-motion`)**:
   - Inserire sempre un controllo condizionale:
     ```javascript
     const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
     if (prefersReducedMotion) return; // Salta o esegui solo un fade immediato
     ```

---

## 5. Checklist del Movimento per Nuovi Progetti

- [ ] Tutte le animazioni GSAP sono racchiuse in `gsap.context()` con cleanup `ctx.revert()`?
- [ ] Vengono usati easing fisici ed esponenziali (`power3.out`, `expo.out`) al posto di quelli lineari?
- [ ] Gli ScrollTrigger hanno trigger specifici e non scattano all'improvviso?
- [ ] Le proprietà animate sono limitate a `transform` e `opacity` (zero cali di FPS)?
- [ ] Gli elementi interattivi (card, bottoni, menu) hanno micro-feedback fluidi e reattivi?
- [ ] Il sito rispetta le preferenze utente di riduzione del movimento?
