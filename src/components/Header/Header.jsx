import React from 'react';
import { Settings, Download } from 'lucide-react';
import { BrandLogo } from '../BrandLogo/BrandLogo';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import './Header.css';

export function Header({ onOpenSettings, isTesting = false }) {
  const { isInstalled, installApp } = usePwaInstall();

  return (
    <header className="netflash-header">
      <div className="header-inner">
        <BrandLogo compact={false} showMascot={true} />

        <div className="header-actions">
          {!isInstalled && (
            <button
              type="button"
              className="btn-header-install"
              onClick={installApp}
              disabled={isTesting}
              title="Scarica e installa NetFlash come app standalone su Mac, Windows o Android"
            >
              <Download size={15} />
              <span className="install-label">Installa App</span>
            </button>
          )}

          <div className="engine-status-pill" title="Motore open-source LibreSpeed attivo">
            <span className="live-engine-dot" />
            <span className="engine-txt">LIBRESPEED CORE</span>
          </div>

          <button
            type="button"
            className="btn-header-settings"
            onClick={onOpenSettings}
            disabled={isTesting}
            aria-label="Apri impostazioni e server"
          >
            <Settings size={18} className="settings-gear" />
            <span className="settings-label">Impostazioni</span>
          </button>
        </div>
      </div>
    </header>
  );
}
