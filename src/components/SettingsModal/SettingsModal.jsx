import React, { useState, useEffect } from 'react';
import { X, Server, History, Shield, Plus, Trash2, Check, ExternalLink } from 'lucide-react';
import './SettingsModal.css';

export function SettingsModal({
  isOpen,
  onClose,
  servers,
  selectedServerId,
  onSelectServer,
  onAddCustomServer,
  history,
  onClearHistory
}) {
  const [activeTab, setActiveTab] = useState('servers'); // 'servers' | 'history' | 'privacy'
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      setAddError('Inserisci l\'URL del server LibreSpeed');
      return;
    }
    try {
      new URL(customUrl);
    } catch {
      setAddError('URL non valido. Includi http:// o https://');
      return;
    }

    onAddCustomServer({
      name: customName.trim() || 'Custom LibreSpeed Node',
      location: 'Custom Remote',
      server: customUrl.trim(),
      dlURL: 'garbage.php',
      ulURL: 'empty.php',
      pingURL: 'empty.php',
      getIpURL: 'getIP.php'
    });

    setCustomName('');
    setCustomUrl('');
    setShowAddForm(false);
    setAddError(null);
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="settings-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">IMPOSTAZIONI & INFRASTRUTTURA</h2>
            <span className="modal-subtitle">Gestione server LibreSpeed, storico e trasparenza dati</span>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Chiudi finestra">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'servers' ? 'active' : ''}`}
            onClick={() => setActiveTab('servers')}
          >
            <Server size={16} />
            <span>Server Motore</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            <span>Storico Locale ({history.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={16} />
            <span>Privacy & Costi</span>
          </button>
        </div>

        <div className="modal-tab-content">
          {activeTab === 'servers' && (
            <div className="tab-pane servers-pane">
              <p className="tab-description">
                NetFlash si connette direttamente a endpoint compatibili con le specifiche ufficiali LibreSpeed. 
                Tutti i test generano traffico di rete reale multi-stream.
              </p>

              <div className="servers-list">
                {servers.map((s) => (
                  <div
                    key={s.id}
                    className={`server-item-card ${selectedServerId === s.id ? 'selected' : ''}`}
                    onClick={() => onSelectServer(s.id)}
                  >
                    <div className="server-item-left">
                      <div className="server-item-name-row">
                        <span className="server-name">{s.name}</span>
                        {s.isLocal ? (
                          <span className="local-tag">⚡ Loopback Mac (Interno)</span>
                        ) : (
                          <span className="wan-tag">🌐 Internet Reale</span>
                        )}
                      </div>
                      <span className="server-loc-desc">{s.location}</span>
                      <span className="server-url-meta">{s.server}</span>
                    </div>

                    <div className="server-item-right">
                      {selectedServerId === s.id ? (
                        <span className="active-check-badge">
                          <Check size={16} />
                          <span>In Uso</span>
                        </span>
                      ) : (
                        <span className="select-prompt-txt">Seleziona</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!showAddForm ? (
                <button
                  type="button"
                  className="btn-add-server-trigger"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus size={16} />
                  <span>Aggiungi Server LibreSpeed Personalizzato</span>
                </button>
              ) : (
                <form className="add-server-form" onSubmit={handleAddSubmit}>
                  <h4 className="form-legend">Configura Nuovo Endpoint LibreSpeed</h4>
                  <div className="form-group">
                    <label htmlFor="custom-server-name">Nome Descrittivo</label>
                    <input
                      id="custom-server-name"
                      type="text"
                      placeholder="es. Server Docker Locale o VPS Francoforte"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="custom-server-url">URL Base Server (con protocollo e CORS abilitato)</label>
                    <input
                      id="custom-server-url"
                      type="url"
                      placeholder="https://speedtest.tuodominio.com/ o http://localhost:8080/"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                  </div>
                  {addError && <span className="form-err-msg">{addError}</span>}
                  <div className="form-actions-row">
                    <button type="submit" className="btn-confirm-add">Salva Server</button>
                    <button type="button" className="btn-cancel-add" onClick={() => setShowAddForm(false)}>Annulla</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-pane history-pane">
              <div className="history-pane-header">
                <span className="history-count">Ultime misurazioni archiviate in locale nel browser</span>
                {history.length > 0 && (
                  <button type="button" className="btn-clear-history" onClick={onClearHistory}>
                    <Trash2 size={14} />
                    <span>Cancella Tutto</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="history-empty-state">
                  <p>Nessun test registrato in questa sessione.</p>
                  <span>Esegui il tuo primo test dalla dashboard per visualizzare i trend storici.</span>
                </div>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Data / Ora</th>
                        <th>Download</th>
                        <th>Upload</th>
                        <th>Ping</th>
                        <th>Jitter</th>
                        <th>Server</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record) => (
                        <tr key={record.id}>
                          <td>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</td>
                          <td className="highlight-dl tabular-nums">{record.download} Mbps</td>
                          <td className="highlight-ul tabular-nums">{record.upload} Mbps</td>
                          <td className="tabular-nums">{record.ping} ms</td>
                          <td className="tabular-nums">{record.jitter} ms</td>
                          <td className="server-cell">{record.serverName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="tab-pane privacy-pane">
              <h4 className="pane-section-title">Trasparenza, Privacy & Costi</h4>
              
              <div className="privacy-features-grid">
                <div className="privacy-feature-card">
                  <span className="pf-title">Zero Pubblicità</span>
                  <p>Nessun banner, video popup o annuncio ingannevole. L'interfaccia rimane pulita e focalizzata solo sui dati di connessione.</p>
                </div>

                <div className="privacy-feature-card">
                  <span className="pf-title">Zero Tracker Commerciali</span>
                  <p>Nessun cookie di profilazione o codice di tracciamento terze parti (Google Analytics, Meta Pixel, ecc.).</p>
                </div>

                <div className="privacy-feature-card">
                  <span className="pf-title">Nessun Account Richiesto</span>
                  <p>Lo storico delle misurazioni viene memorizzato esclusivamente sul tuo dispositivo (LocalStorage del browser).</p>
                </div>

                <div className="privacy-feature-card">
                  <span className="pf-title">Avviso Traffico & Hosting</span>
                  <p>I test ad alta velocità generano centinaia di megabyte di traffico effettivo. Se esegui un server su cloud pubblico con banda tariffata a consumo, tieni conto del traffico generato.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
