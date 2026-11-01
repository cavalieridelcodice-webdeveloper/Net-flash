import React, { useMemo } from 'react';
import { formatSpeed } from '../../utils/formatSpeed';
import './SpeedGauge.css';

export function SpeedGauge({
  speed = 0,
  maxSpeed = 1000,
  phase = 'ready', // 'ready' | 'connecting' | 'ping' | 'download' | 'upload' | 'completed' | 'aborted' | 'error'
  isTesting = false
}) {
  const currentSpeed = speed || 0;
  const formatted = useMemo(() => formatSpeed(currentSpeed), [currentSpeed]);

  // Calcolo dell'angolo di rotazione dell'ago (-120° a +120° = arco di 240°)
  const angle = useMemo(() => {
    if (phase === 'ready' || phase === 'error' || phase === 'aborted') {
      return -120;
    }
    if (phase === 'ping' || phase === 'connecting') {
      return -100;
    }

    // Scala logaritmica/fluida per rappresentare bene sia 5 Mbps che 1000 Mbps
    const val = Math.max(0, currentSpeed);
    let ratio = 0;
    if (val <= 10) {
      ratio = (val / 10) * 0.2; // 0 - 10 Mbps = 20% arco
    } else if (val <= 100) {
      ratio = 0.2 + ((val - 10) / 90) * 0.4; // 10 - 100 Mbps = 40% arco
    } else if (val <= 500) {
      ratio = 0.6 + ((val - 100) / 400) * 0.25; // 100 - 500 Mbps = 25% arco
    } else {
      ratio = 0.85 + Math.min(1, (val - 500) / 500) * 0.15; // 500 - 1000 Mbps = 15% arco
    }

    return -120 + ratio * 240;
  }, [currentSpeed, phase]);

  // Lunghezza del tratto attivo SVG (circonferenza r=130: 2 * PI * 130 * (240/360) = 544.5px)
  const arcLength = 544.5;
  const strokeDashoffset = useMemo(() => {
    if (phase === 'ready' || phase === 'error' || phase === 'aborted') {
      return arcLength;
    }
    if (phase === 'ping' || phase === 'connecting') {
      return arcLength * 0.95;
    }
    const ratio = Math.max(0, Math.min(1, (angle + 120) / 240));
    return arcLength * (1 - ratio);
  }, [angle, phase]);

  // Coordinate del cursore luminoso integrato perfettamente lungo l'arco circolare (r=130)
  const cursorCoords = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 160 + 130 * Math.sin(rad),
      y: 160 - 130 * Math.cos(rad)
    };
  }, [angle]);

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'connecting':
        return 'CONNESSIONE IN CORSO...';
      case 'ping':
        return 'ANALISI LATENZA & JITTER';
      case 'download':
        return 'MISURAZIONE DOWNLOAD';
      case 'upload':
        return 'MISURAZIONE UPLOAD';
      case 'completed':
        return 'TEST COMPLETATO';
      case 'aborted':
        return 'TEST ANNULLATO';
      case 'error':
        return 'ERRORE DI RETE';
      default:
        return 'PRONTO AL TEST';
    }
  }, [phase]);

  const phaseBadgeColor = useMemo(() => {
    switch (phase) {
      case 'download':
        return 'var(--color-cyan)';
      case 'upload':
        return 'var(--color-magenta)';
      case 'ping':
        return 'var(--color-green-neon)';
      case 'completed':
        return 'var(--color-green)';
      case 'error':
        return 'var(--color-red)';
      default:
        return 'var(--text-muted)';
    }
  }, [phase]);

  return (
    <div className={`speed-gauge-container ${isTesting ? 'active-test' : ''}`}>
      <div className="gauge-glow-backdrop" />
      
      <svg className="speed-gauge-svg" viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          {/* Gradiente identico al cruscotto tachimetro della mascotte NetFlash */}
          <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="35%" stopColor="#00ff88" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ff0055" />
          </linearGradient>

          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Traccia di sfondo dell'arco (inattiva) */}
        <circle
          className="gauge-track-bg"
          cx="160"
          cy="160"
          r="130"
          fill="none"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="544.5 816.8"
          strokeDashoffset="0"
          transform="rotate(150 160 160)"
        />

        {/* Tacche graduate */}
        {[0, 10, 50, 100, 250, 500, 1000].map((tickVal, i) => {
          // Calcola l'angolo per ogni tacca
          let ratio = 0;
          if (tickVal <= 10) ratio = (tickVal / 10) * 0.2;
          else if (tickVal <= 100) ratio = 0.2 + ((tickVal - 10) / 90) * 0.4;
          else if (tickVal <= 500) ratio = 0.6 + ((tickVal - 100) / 400) * 0.25;
          else ratio = 0.85 + ((tickVal - 500) / 500) * 0.15;

          const tickAngle = -120 + ratio * 240;
          const rad = ((tickAngle + 90) * Math.PI) / 180;
          const x1 = 160 + 112 * Math.cos(rad);
          const y1 = 160 + 112 * Math.sin(rad);
          const x2 = 160 + 120 * Math.cos(rad);
          const y2 = 160 + 120 * Math.sin(rad);

          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Traccia attiva colorata */}
        <circle
          className="gauge-track-active"
          cx="160"
          cy="160"
          r="130"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="544.5 816.8"
          strokeDashoffset={strokeDashoffset}
          transform="rotate(150 160 160)"
          filter="url(#gaugeGlow)"
        />

        {/* Indicatore luminoso integrato perfettamente sull'arco del tachimetro */}
        <g 
          className="gauge-cursor-glow"
          style={{ 
            transition: isTesting ? 'all 0.18s linear' : 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: phase === 'ready' || phase === 'error' || phase === 'aborted' ? 0.4 : 1
          }}
        >
          {/* Alone esterno neon del cursore */}
          <circle
            cx={cursorCoords.x}
            cy={cursorCoords.y}
            r="12"
            fill="rgba(0, 240, 255, 0.25)"
            filter="url(#gaugeGlow)"
          />
          {/* Anello guida concentrico */}
          <circle
            cx={cursorCoords.x}
            cy={cursorCoords.y}
            r="6"
            fill="#070a14"
            stroke="var(--color-cyan)"
            strokeWidth="2.5"
          />
          {/* Nucleo bianco luminoso centrale */}
          <circle
            cx={cursorCoords.x}
            cy={cursorCoords.y}
            r="3"
            fill="#ffffff"
          />
        </g>
      </svg>

      {/* Lettura centrale numerica */}
      <div className="gauge-center-content">
        <div 
          className="gauge-phase-badge" 
          style={{ borderColor: phaseBadgeColor, color: phaseBadgeColor }}
        >
          <span className="phase-dot" style={{ backgroundColor: phaseBadgeColor }} />
          {phaseLabel}
        </div>

        <div className="gauge-speed-readout">
          <span className="gauge-speed-val tabular-nums">
            {formatted.value}
          </span>
          <span className="gauge-speed-unit">
            {formatted.unit}
          </span>
        </div>

        <div className="gauge-scale-limits">
          <span>0 Mbps</span>
          <span>1 Gbps+</span>
        </div>
      </div>
    </div>
  );
}
