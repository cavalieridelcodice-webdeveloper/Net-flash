import React from 'react';
import { Server, ShieldCheck, Globe, RefreshCw, SlidersHorizontal, Wifi, Cpu } from 'lucide-react';
import './ServerInfo.css';

export function ServerInfo({
  server,
  clientIp,
  onOpenSettings,
  onTestPing,
  isPinging = false,
  pingLatency = null
}) {
  const isLocal = server?.isLocal;
  const rawIp = clientIp ? clientIp.replace(/::ffff:/g, '') : null;

  return (
    <div className={`server-info-card ${isLocal ? 'mode-local-card' : 'mode-wan-card'}`}>
      {/* Intestazione Superiore: Titolo + Azioni Rapide */}
      <div className="server-header-row">
        <div className="server-header-left">
          <div className="server-badge-icon" aria-hidden="true">
            {isLocal ? (
              <Cpu size={16} className="server-icon-symbol local" />
            ) : (
              <Server size={16} className="server-icon-symbol wan" />
            )}
          </div>
          <div className="server-header-texts">
            <span className="server-main-heading">SERVER DI MISURAZIONE</span>
            <div className="server-mode-status">
              <span className={`status-beacon ${isLocal ? 'beacon-local' : 'beacon-wan'}`} />
              <span className="mode-status-txt">
                {isLocal ? 'Loopback Interno (RAM Mac)' : 'Internet Reale (Fibra WAN)'}
              </span>
            </div>
          </div>
        </div>

        <div className="server-header-actions">
          {onTestPing && (
            <button
              type="button"
              className="btn-ping-pill"
              onClick={() => onTestPing(server)}
              disabled={isPinging}
              title="Testa la latenza diretta verso questo server"
            >
              <RefreshCw size={13} className={isPinging ? 'icon-spin' : ''} />
              <span>
                {isPinging ? 'Ping...' : pingLatency !== null ? `${pingLatency} ms` : 'Ping'}
              </span>
            </button>
          )}

          <button
            type="button"
            className="btn-server-pill"
            onClick={onOpenSettings}
            title="Seleziona un altro server o configura endpoint personalizzato"
          >
            <SlidersHorizontal size={13} />
            <span>Cambia Server</span>
          </button>
        </div>
      </div>

      {/* Sezione Centrale: Nome Server & Badge di Transito Premium */}
      <div className="server-body-row">
        <div className="server-name-wrap">
          <span className="server-display-name">
            {server?.name || 'LibreSpeed Direct Server'}
          </span>
        </div>

        {/* Chip di Transito Internet Reale (Snodo UE) ad alto impatto grafico */}
        <div
          className="server-transit-chip"
          title="Rotta di transito certificata su fibra ottica e throughput di rete reale"
        >
          <span className="transit-live-dot" />
          <Globe size={13} className="transit-globe" />
          <span className="transit-title">
            {server?.location || 'Transito Internet Reale • Snodo UE'}
          </span>
        </div>
      </div>

      {/* Barra Inferiore: Client IP & Rete Provider */}
      <div className="server-footer-network-bar">
        <div className="network-info-group">
          <ShieldCheck size={14} className="network-shield-icon" />
          <span className="network-tag-label">CLIENT IP:</span>
          <span
            className="network-ip-display tabular-nums"
            title={rawIp || 'In attesa del test'}
          >
            {rawIp || 'In attesa di rilevamento dal test...'}
          </span>
        </div>

        <span className="network-tier-pill">
          {isLocal ? 'Test Locale' : 'Diretto FTTH'}
        </span>
      </div>
    </div>
  );
}
