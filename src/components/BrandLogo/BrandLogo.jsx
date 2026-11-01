import React from 'react';
import './BrandLogo.css';

export function BrandLogo({ compact = false, showMascot = true, className = '' }) {
  return (
    <div className={`netflash-brand-logo ${compact ? 'compact' : ''} ${className}`}>
      {showMascot && (
        <div className="mascot-badge-frame" aria-hidden="true">
          <img 
            src="/mascot-logo.jpg" 
            alt="NetFlash Mascot" 
            className="mascot-badge-img"
          />
          <span className="badge-glow-ring" />
        </div>
      )}
      <div className="brand-typography">
        <span className="brand-title">
          NETFL<span className="lightning-char">⚡</span>SH
        </span>
        {!compact && (
          <span className="brand-tagline">
            PREMIUM SPEED ENGINE
          </span>
        )}
      </div>
    </div>
  );
}
