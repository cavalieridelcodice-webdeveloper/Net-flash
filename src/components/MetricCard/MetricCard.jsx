import React, { useState, useRef } from 'react';
import { Download, Upload, Activity, Zap, Info, RotateCcw } from 'lucide-react';
import './MetricCard.css';

const ICON_MAP = {
  download: Download,
  upload: Upload,
  ping: Activity,
  jitter: Zap
};

const METRIC_EXPLANATIONS = {
  download: {
    tag: "COS'È IL DOWNLOAD?",
    simple: 'La velocità di ricezione dei dati da Internet al tuo dispositivo.',
    practical: 'Streaming 4K fluido, apertura istantanea delle pagine e download rapido di giochi o file pesanti.',
    rule: 'Più è alto (in Mbps), più rapido è ogni caricamento.'
  },
  upload: {
    tag: "COS'È L'UPLOAD?",
    simple: 'La velocità con cui invii dati dal tuo dispositivo verso la rete.',
    practical: 'Videochiamate nitide senza scatti, invio rapido di foto/video e backup su Cloud (Drive, iCloud).',
    rule: 'Più è alto (in Mbps), più veloce è la trasmissione.'
  },
  ping: {
    tag: "COS'È IL PING (LATENZA)?",
    simple: 'Il tempo di risposta della linea in millisecondi (ms) per raggiungere il server e tornare indietro.',
    practical: 'Reattività immediata nei videogiochi online (FPS/multiplayer) e sincronizzazione audio/video perfetta.',
    rule: 'Più è basso (es. < 30 ms), più la risposta è immediata e fluida.'
  },
  jitter: {
    tag: "COS'È IL JITTER?",
    simple: 'La stabilità della linea: misura le oscillazioni e variazioni della latenza tra un pacchetto e l’altro.',
    practical: 'Un valore basso evita improvvisi blocchi (lag spike), desincronizzazioni e audio robotico a scatti.',
    rule: 'Più è vicino a 0 ms, più la connessione è solida, costante e affidabile.'
  }
};

export function MetricCard({
  type = 'download',
  label,
  value,
  unit,
  isActive = false,
  quality,
  qualityColor,
  trendProgress = null
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const touchStartY = useRef(0);
  const isScrollingRef = useRef(false);

  const IconComponent = ICON_MAP[type] || Activity;
  const explanation = METRIC_EXPLANATIONS[type] || METRIC_EXPLANATIONS.download;

  const handleToggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleCardClick = (e) => {
    // Se l'utente stava scrollando la descrizione, non rigirare la card
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      return;
    }
    handleToggleFlip();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleFlip();
    }
  };

  // Previene il flip accidentale quando si fa drag/scroll touch sul retro
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    isScrollingRef.current = false;
  };

  const handleTouchMove = (e) => {
    const diff = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (diff > 8) {
      isScrollingRef.current = true;
    }
  };

  return (
    <div
      className={`metric-card-wrapper ${type} ${isActive ? 'measuring-active' : ''} ${isFlipped ? 'is-flipped' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      role="button"
      tabIndex={0}
      aria-label={`${label}. ${isFlipped ? 'Mostra dati velocità' : 'Clicca per spiegazione semplice'}`}
      aria-expanded={isFlipped}
      title={isFlipped ? 'Clicca per tornare ai dati' : `Clicca per scoprire cos'è ${label}`}
    >
      <div className="metric-card-flipper">
        {/* FACCIATA FRONTALE (MISURAZIONE & DATI) */}
        <div className="metric-card-face metric-card-front">
          <div className="metric-card-header">
            <div className="metric-icon-wrap" aria-hidden="true">
              <IconComponent size={20} className="metric-icon" />
            </div>
            <span className="metric-label">{label}</span>

            {isActive ? (
              <span className="live-pulse-badge">LIVE</span>
            ) : (
              <span className="metric-flip-hint" aria-hidden="true">
                <Info size={13} className="hint-info-icon" />
                <span className="hint-info-text">Info</span>
              </span>
            )}
          </div>

          <div className="metric-card-body">
            <div className="metric-value-row">
              <span className="metric-val tabular-nums">{value ?? '--'}</span>
              <span className="metric-unit">{unit}</span>
            </div>

            {quality && (
              <div className="metric-quality-row">
                <span
                  className="quality-pill"
                  style={{ color: qualityColor || 'var(--text-secondary)' }}
                >
                  <span
                    className="quality-dot"
                    style={{ backgroundColor: qualityColor || 'var(--text-secondary)' }}
                  />
                  {quality}
                </span>
              </div>
            )}
          </div>

          {trendProgress !== null && (
            <div className="metric-progress-track">
              <div
                className="metric-progress-bar"
                style={{ width: `${Math.max(0, Math.min(100, trendProgress))}%` }}
              />
            </div>
          )}

          <div className="metric-card-bottom-cue" aria-hidden="true">
            <span className="cue-text">Tocca per info</span>
            <RotateCcw size={10} className="cue-icon" />
          </div>
        </div>

        {/* FACCIATA POSTERIORE (SPIEGAZIONE SEMPLICE & SCROLLABILE) */}
        <div className="metric-card-face metric-card-back">
          <div className="metric-card-header back-header">
            <div className="metric-icon-wrap back-icon-wrap" aria-hidden="true">
              <IconComponent size={16} className="metric-icon" />
            </div>
            <span className="metric-label-back">{explanation.tag}</span>
            <span className="back-flip-badge" aria-hidden="true" title="Torna ai dati">
              <RotateCcw size={12} />
            </span>
          </div>

          {/* Area centrale con scrollbar visibile e fluida */}
          <div 
            className="metric-back-body"
            onClick={(e) => {
              // Permette di selezionare il testo o scorrere senza scatenare il flip
              e.stopPropagation();
            }}
          >
            <p className="metric-back-simple">{explanation.simple}</p>

            <div className="metric-back-practical">
              <strong className="practical-title">Nel quotidiano:</strong>
              <span className="practical-content">{explanation.practical}</span>
            </div>

            <div className="metric-back-rule">
              <span className="rule-dot" />
              <span className="rule-text">{explanation.rule}</span>
            </div>
          </div>

          <div className="metric-back-footer">
            <button
              type="button"
              className="metric-return-prompt"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip();
              }}
              title="Torna alla misurazione"
            >
              <RotateCcw size={12} className="return-icon" />
              <span>Tocca per tornare</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
