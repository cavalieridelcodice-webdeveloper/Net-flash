import React, { useState } from 'react';
import { useSpeedTest } from '../../hooks/useSpeedTest';
import { useServerSelection } from '../../hooks/useServerSelection';
import { formatSpeed } from '../../utils/formatSpeed';
import { formatLatency } from '../../utils/formatLatency';

import { Header } from '../../components/Header/Header';
import { SpeedGauge } from '../../components/SpeedGauge/SpeedGauge';
import { MetricCard } from '../../components/MetricCard/MetricCard';
import { TestControls } from '../../components/TestControls/TestControls';
import { TestProgress } from '../../components/TestProgress/TestProgress';
import { ServerInfo } from '../../components/ServerInfo/ServerInfo';
import { MascotBadge } from '../../components/MascotBadge/MascotBadge';
import { ResultsSummary } from '../../components/ResultsSummary/ResultsSummary';
import { SettingsModal } from '../../components/SettingsModal/SettingsModal';

import { ShieldCheck, Zap, AlertTriangle, Cpu } from 'lucide-react';
import './Home.css';

export function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    servers,
    selectedServer,
    selectedServerId,
    selectServer,
    addCustomServer,
    testServerPing,
    findBestServer,
    isAutoSelecting,
    isPinging,
    pingLatency
  } = useServerSelection();

  const {
    status,
    downloadSpeed,
    uploadSpeed,
    ping,
    jitter,
    clientIp,
    currentProgress,
    currentPhaseProgress,
    errorMessage,
    history,
    startTest,
    abortTest,
    clearHistory
  } = useSpeedTest(selectedServer);

  const isTesting = ['connecting', 'ping', 'download', 'upload'].includes(status);
  const isCompleted = status === 'completed';

  // Calcolo formattazione metriche per i singoli widget
  const dlFmt = formatSpeed(downloadSpeed);
  const ulFmt = formatSpeed(uploadSpeed);
  const pingFmt = formatLatency(ping, 'ping');
  const jitterFmt = formatLatency(jitter, 'jitter');

  // Qualità Download: scala reale a 6 livelli (FCC / AGCOM)
  const getDlQuality = (mbps) => {
    if (mbps <= 0) return { label: null, color: null };
    if (mbps >= 500) return { label: 'Ultra Gigabit', color: 'var(--color-green-neon)' };
    if (mbps >= 100) return { label: 'Fibra Veloce', color: 'var(--color-green-neon)' };
    if (mbps >= 30)  return { label: 'Buona', color: 'var(--color-cyan)' };
    if (mbps >= 10)  return { label: 'Sufficiente', color: 'var(--color-amber)' };
    if (mbps >= 2)   return { label: 'Lenta', color: 'var(--color-amber)' };
    return { label: 'Molto Lenta', color: 'var(--color-red)' };
  };

  // Qualità Upload: scala reale a 5 livelli
  const getUlQuality = (mbps) => {
    if (mbps <= 0) return { label: null, color: null };
    if (mbps >= 100) return { label: 'Eccellente', color: 'var(--color-magenta)' };
    if (mbps >= 50)  return { label: 'Ottimo', color: 'var(--color-magenta)' };
    if (mbps >= 15)  return { label: 'Standard', color: 'var(--color-cyan)' };
    if (mbps >= 5)   return { label: 'Limitato', color: 'var(--color-amber)' };
    return { label: 'Molto Lento', color: 'var(--color-red)' };
  };

  const dlQuality = getDlQuality(dlFmt.raw);
  const ulQuality = getUlQuality(ulFmt.raw);

  // Valore principale visualizzato sul tachimetro:
  // Mostra il download durante download/completed/ready, o l'upload durante la fase upload
  const activeGaugeSpeed = status === 'upload' ? (uploadSpeed || 0) : (downloadSpeed || 0);

  return (
    <div className="netflash-home-page">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        isTesting={isTesting}
      />

      <main className="netflash-main-container">
        {/* Banner Trust & Affidabilità */}
        <section className="hero-section">
          <div className="hero-trust-badges">
            <span className="trust-pill">
              <ShieldCheck size={14} className="pill-icon" />
              100% Senza Pubblicità
            </span>
            <span className="trust-pill">
              <Zap size={14} className="pill-icon cyan" />
              Motore Reale LibreSpeed
            </span>
            <span className="trust-pill">
              <Cpu size={14} className="pill-icon magenta" />
              Nessun Tracker Terze Parti
            </span>
          </div>
        </section>

        {/* Notifica di Errore Resiliente */}
        {status === 'error' && (
          <div className="error-alert-banner" role="alert">
            <AlertTriangle size={22} className="alert-icon" />
            <div className="error-text-wrap">
              <strong>Impossibile completare la misurazione</strong>
              <p>{errorMessage || 'Errore di connessione con il server LibreSpeed configurato.'}</p>
            </div>
          </div>
        )}

        {/* Sezione Tachimetro Centrale & Controlli */}
        <section className="gauge-action-section">
          <SpeedGauge 
            speed={activeGaugeSpeed} 
            phase={status} 
            isTesting={isTesting}
          />

          <TestControls 
            status={status} 
            onStart={startTest} 
            onAbort={abortTest} 
          />

          {(isTesting || status === 'completed') && (
            <TestProgress 
              currentPhase={status} 
              overallProgress={currentProgress} 
            />
          )}
        </section>

        {/* Bento Grid delle 4 Metriche Fondamentali */}
        <section className="metrics-bento-grid" aria-label="Metriche di rete">
          <MetricCard
            type="download"
            label="DOWNLOAD"
            value={dlFmt.value}
            unit={dlFmt.unit}
            isActive={status === 'download'}
            trendProgress={status === 'download' ? currentPhaseProgress : null}
            quality={dlQuality.label}
            qualityColor={dlQuality.color}
          />

          <MetricCard
            type="upload"
            label="UPLOAD"
            value={ulFmt.value}
            unit={ulFmt.unit}
            isActive={status === 'upload'}
            trendProgress={status === 'upload' ? currentPhaseProgress : null}
            quality={ulQuality.label}
            qualityColor={ulQuality.color}
          />

          <MetricCard
            type="ping"
            label="PING (LATENZA)"
            value={pingFmt.value}
            unit={pingFmt.unit}
            isActive={status === 'ping'}
            quality={pingFmt.quality}
            qualityColor={pingFmt.qualityColor}
          />

          <MetricCard
            type="jitter"
            label="JITTER (VARIAZIONE)"
            value={jitterFmt.value}
            unit={jitterFmt.unit}
            isActive={status === 'ping'}
            quality={jitterFmt.quality}
            qualityColor={jitterFmt.qualityColor}
          />
        </section>

        {/* Assistente Mascotte & Dettagli Server */}
        <div className="assistant-server-split">
          <MascotBadge 
            status={status} 
            downloadSpeed={downloadSpeed} 
            ping={ping} 
          />

          <ServerInfo 
            server={selectedServer}
            clientIp={clientIp}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onTestPing={testServerPing}
            isPinging={isPinging || isAutoSelecting}
            pingLatency={pingLatency}
          />
        </div>

        {/* Scheda Riepilogo Diagnostica al Termine del Test */}
        {isCompleted && (
          <ResultsSummary
            download={dlFmt.raw}
            upload={ulFmt.raw}
            ping={ping || 0}
            jitter={jitter || 0}
            serverName={selectedServer.name}
            timestamp={new Date().toLocaleString()}
          />
        )}
      </main>

      {/* Footer Tecnico e Privacy */}
      <footer className="netflash-footer">
        <div className="footer-inner">
          <p className="footer-copyright">
            © {new Date().getFullYear()} <strong>NetFlash</strong> — Powered by <a href="https://github.com/librespeed/speedtest" target="_blank" rel="noopener noreferrer">LibreSpeed Core</a>.
          </p>
          <div className="footer-links">
            <button type="button" className="footer-link-btn" onClick={() => setIsSettingsOpen(true)}>
              Impostazioni Server
            </button>
            <span className="dot-divider">•</span>
            <button type="button" className="footer-link-btn" onClick={() => setIsSettingsOpen(true)}>
              Privacy & Trasparenza
            </button>
          </div>
        </div>
      </footer>

      {/* Finestra Modale Impostazioni */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        servers={servers}
        selectedServerId={selectedServerId}
        onSelectServer={selectServer}
        onAddCustomServer={addCustomServer}
        history={history}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
