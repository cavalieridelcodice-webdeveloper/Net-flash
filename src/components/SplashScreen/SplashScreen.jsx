import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Cpu, Smartphone, Laptop, Monitor } from 'lucide-react';
import './SplashScreen.css';

export function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1600; // 1.6 secondi di caricamento accattivante

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(current);

      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 550); // Attesa completamento animazione fade out
        }, 200);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  const getStatusText = () => {
    if (progress < 25) return 'Calibrazione interfaccia cyberpunk...';
    if (progress < 55) return 'Inizializzazione motore LibreSpeed Core...';
    if (progress < 85) return 'Configurazione nodi di rete ad alta velocità...';
    return 'Motore pronto allo sprint!';
  };

  return (
    <div
      className={`splash-screen-overlay ${isFadingOut ? 'fade-out' : ''}`}
      onClick={handleSkip}
      title="Tocca per entrare subito"
      role="dialog"
      aria-modal="true"
    >
      {/* Texture di sfondo a reticolo & aloni neon */}
      <div className="splash-cyber-grid" />
      <div className="splash-glow-orb cyan" />
      <div className="splash-glow-orb magenta" />

      <div className="splash-center-stage">
        {/* Logo Mascotte con cornice energetica rotante */}
        <div className="splash-emblem-wrap">
          <div className="splash-energy-ring" />
          <div className="splash-energy-ring outer" />
          <div className="splash-logo-frame">
            <img
              src="/android-chrome-192x192.png"
              alt="NetFlash Logo"
              className="splash-mascot-img"
              onError={(e) => {
                e.target.src = '/mascot-logo.jpg';
              }}
            />
          </div>
          <div className="splash-sparkle-pill">
            <Zap size={14} className="sparkle-icon" />
          </div>
        </div>

        {/* Titolo e Branding Cyber */}
        <div className="splash-brand-block">
          <h1 className="splash-title">
            NETFL<span className="splash-flash-icon">⚡</span>SH
          </h1>
          <div className="splash-badge-pill">
            <Cpu size={12} className="badge-icon" />
            <span>PREMIUM SPEED ENGINE</span>
          </div>
        </div>

        {/* Barra di Avanzamento Futuristica */}
        <div className="splash-progress-block">
          <div className="splash-progress-track">
            <div
              className="splash-progress-bar"
              style={{ width: `${progress}%` }}
            />
            <div
              className="splash-progress-glow-head"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="splash-status-row">
            <span className="splash-status-txt">{getStatusText()}</span>
            <span className="splash-percent-txt tabular-nums">{progress}%</span>
          </div>
        </div>

        {/* Tag PWA Multi-Platform */}
        <div className="splash-pwa-platforms">
          <span className="platforms-legend">PWA STANDALONE APP PER:</span>
          <div className="platform-badges-row">
            <span className="platform-tag">
              <Laptop size={13} />
              <span>Mac</span>
            </span>
            <span className="platform-tag">
              <Monitor size={13} />
              <span>Windows</span>
            </span>
            <span className="platform-tag">
              <Smartphone size={13} />
              <span>Android</span>
            </span>
            <span className="platform-tag">
              <ShieldCheck size={13} />
              <span>iOS</span>
            </span>
          </div>
        </div>

        <button type="button" className="splash-skip-btn" onClick={handleSkip}>
          Tocca per saltare ➔
        </button>
      </div>
    </div>
  );
}

