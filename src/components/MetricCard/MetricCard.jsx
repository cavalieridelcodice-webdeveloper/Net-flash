import React, { useState } from 'react';
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
    simple: 'La velocità con cui ricevi dati da Internet sul tuo dispositivo.',
    practical: 'Streaming video in 4K, apertura istantanea dei siti web e download di giochi o file pesanti.',
    rule: 'Più è alto (in Mbps), più rapido è ogni caricamento.'
  },
  upload: {
    tag: "COS'È L'UPLOAD?",
    simple: 'La velocità con cui invii dati dal tuo dispositivo verso la rete.',
    practical: 'Videochiamate nitide senza scatti, invio rapido di foto e video ad amici e backup sul Cloud.',
    rule: 'Più è alto (in Mbps), più veloce è la trasmissione.'
  },
  ping: {
    tag: "COS'È IL PING (LATENZA)?",
    simple: 'Il tempo in millisecondi (ms) impiegato da un segnale per raggiungere il server e tornare indietro.',
    practical: 'Reattività nei videogiochi online e sincronizzazione audio/video perfetta nelle chiamate.',
    rule: 'Più è basso (es. < 30 ms), più la risposta è immediata.'
  },
  jitter: {
    tag: "COS'È IL JITTER?",
    simple: 'La stabilità del Ping, ovvero quanto varia e oscilla la connessione da un momento all’altro.',
    practical: 'Un jitter basso evita improvvisi blocchi (lag spike) e audio a scatti durante videochiamate e gaming.',
    rule: 'Più è vicino a 0 ms, più la linea è solida e stabile.'
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
  const IconComponent = ICON_MAP[type] || Activity;
  const explanation = METRIC_EXPLANATIONS[type] || METRIC_EXPLANATIONS.download;

  const handleToggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleFlip();
    }
  };

  return (
    <div
      className={`metric-card-wrapper ${type} ${isActive ? 'measuring-active' : ''} ${isFlipped ? 'is-flipped' : ''}`}
      onClick={handleToggleFlip}
      onKeyDown={handleKeyDown}
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

        {/* FACCIATA POSTERIORE (SPIEGAZIONE SEMPLICE) */}
        <div className="metric-card-face metric-card-back">
          <div className="metric-card-header back-header">
            <div className="metric-icon-wrap back-icon-wrap" aria-hidden="true">
              <IconComponent size={18} className="metric-icon" />
            </div>
            <span className="metric-label-back">{explanation.tag}</span>
            <span className="back-flip-badge" aria-hidden="true">
              <RotateCcw size={12} />
            </span>
          </div>

          <div className="metric-back-body">
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
            <span className="metric-return-prompt">
              <RotateCcw size={11} className="return-icon" />
              Tocca per tornare
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
