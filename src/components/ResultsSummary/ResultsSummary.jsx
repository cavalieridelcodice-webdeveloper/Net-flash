import React, { useState, useMemo } from 'react';
import { Gamepad2, Tv, Video, CloudUpload, Download, Share2, Check, Award, ShieldAlert, Zap } from 'lucide-react';
import './ResultsSummary.css';

export function ResultsSummary({
  download = 0,
  upload = 0,
  ping = 0,
  jitter = 0,
  serverName = 'LibreSpeed Direct Server',
  timestamp
}) {
  const [copied, setCopied] = useState(false);

  // Analisi diagnostica scientifica e precisa
  const diagnostics = useMemo(() => {
    const dl = Number(download) || 0;
    const ul = Number(upload) || 0;
    const p = Number(ping) || 0;
    const j = Number(jitter) || 0;

    // 1. Gaming & Competitivo
    let gaming = { status: 'pass', badge: 'Ottimo', detail: 'Latenza ultra-bassa (<30ms), ideale per FPS competitivi' };
    if (p > 100) {
      gaming = { status: 'warn', badge: 'Sconsigliato', detail: `Latenza elevata (${p.toFixed(0)} ms), rischio lag frequente` };
    } else if (p > 60 || j > 15) {
      gaming = { status: 'warn', badge: 'Medio', detail: `Ritardo percettibile (${p.toFixed(0)} ms), accettabile per casual gaming` };
    } else if (p > 35) {
      gaming = { status: 'pass', badge: 'Buono', detail: `Buona reattività (${p.toFixed(0)} ms), adatto per multiplayer online` };
    }

    // 2. Streaming 4K / 8K
    let streaming = { status: 'pass', badge: 'Perfetto 4K HDR', detail: 'Buffer istantaneo e massima risoluzione senza pause' };
    if (dl >= 200) {
      streaming = { status: 'pass', badge: 'Ultra HD Multi-Device', detail: 'Streaming contemporaneo 4K/8K su più TV e tablet' };
    } else if (dl >= 50) {
      streaming = { status: 'pass', badge: 'Perfetto 4K HDR', detail: 'Buffer istantaneo e video nitido a 60 fps' };
    } else if (dl >= 20) {
      streaming = { status: 'pass', badge: 'Fluido 4K singolo', detail: 'Supporta 1 flusso 4K continuo (minimo 20 Mbps)' };
    } else if (dl >= 8) {
      streaming = { status: 'warn', badge: 'Limitato a 1080p', detail: 'Consigliata risoluzione Full HD, possibile buffering in 4K' };
    } else {
      streaming = { status: 'warn', badge: 'Standard / SD', detail: 'Banda insufficiente per video ad alta risoluzione' };
    }

    // 3. Videochiamate & Smart Working
    let videoCall = { status: 'pass', badge: 'Fluido & Stabile', detail: 'Audio nitido e video HD 1080p per Meet e Zoom' };
    if (ul >= 20 && p <= 50 && j <= 8) {
      videoCall = { status: 'pass', badge: 'Qualità Studio', detail: 'Zero scatti, condivisione schermo e voce cristallina' };
    } else if (ul >= 8 && p <= 90 && j <= 20) {
      videoCall = { status: 'pass', badge: 'Buono (HD)', detail: 'Videochiamate stabili e condivisione file senza intoppi' };
    } else if (ul >= 3) {
      videoCall = { status: 'warn', badge: 'Accettabile', detail: 'Videochiamata base, possibili cali di risoluzione momentanei' };
    } else {
      videoCall = { status: 'warn', badge: 'Critico', detail: `Upload limitato (${ul.toFixed(1)} Mbps), rischio caduta connessione` };
    }

    // 4. Upload File & Cloud Backup
    let cloud = { status: 'pass', badge: 'Veloce', detail: 'Backup rapido su Google Drive, iCloud e OneDrive' };
    if (ul >= 80) {
      cloud = { status: 'pass', badge: 'Ultra Veloce', detail: 'Invio video pesanti e file gigabyte in pochi istanti' };
    } else if (ul >= 25) {
      cloud = { status: 'pass', badge: 'Veloce (>25 Mbps)', detail: 'Backup rapido su Cloud e invio allegati pesanti' };
    } else if (ul >= 8) {
      cloud = { status: 'pass', badge: 'Standard', detail: 'Adeguato per documenti, foto e sincronizzazione quotidiana' };
    } else {
      cloud = { status: 'warn', badge: 'Lento (<8 Mbps)', detail: 'Tempi di caricamento prolungati per video e file voluminosi' };
    }

    // Verdetto sintetico globale della connessione
    let globalVerdict = {
      title: 'Fibra Ultra Gigabit Top Performance',
      color: 'var(--color-green-neon)',
      badge: 'Classe A+ (Elite)'
    };

    if (dl >= 400 && p <= 30) {
      globalVerdict = { title: 'Linea Gigabit ad Altissime Prestazioni', color: 'var(--color-green-neon)', badge: 'Classe A+ (Ultra)' };
    } else if (dl >= 100 && p <= 50) {
      globalVerdict = { title: 'Ottima Fibra FTTH / Ultra Broadband', color: 'var(--color-green-neon)', badge: 'Classe A (Ottima)' };
    } else if (dl >= 100 && p > 70) {
      globalVerdict = { title: 'Download Rapido con Latenza Rilevante', color: 'var(--color-amber)', badge: 'Classe B+ (Streaming OK)' };
    } else if (dl >= 30) {
      globalVerdict = { title: 'Connessione Broadband Standard', color: 'var(--color-cyan)', badge: 'Classe B (Buona)' };
    } else {
      globalVerdict = { title: 'Connessione Base a Banda Ridotta', color: 'var(--color-amber)', badge: 'Classe C (Base)' };
    }

    return { gaming, streaming, videoCall, cloud, globalVerdict };
  }, [download, upload, ping, jitter]);

  const handleExportCSV = () => {
    const csvContent = [
      'Data,Download (Mbps),Upload (Mbps),Ping (ms),Jitter (ms),Server',
      `"${timestamp || new Date().toLocaleString()}",${download},${upload},${ping},${jitter},"${serverName}"`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NetFlash_Result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const shareText = `🚀 NetFlash Speed Test\n📥 Download: ${download} Mbps\n📤 Upload: ${upload} Mbps\n⚡ Ping: ${ping} ms | Jitter: ${jitter} ms\n🌐 Server: ${serverName}\nMotore LibreSpeed Reale — Test professionale`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="results-summary-card" aria-label="Analisi approfondita della connessione">
      {/* Header con titolo e azioni */}
      <div className="results-summary-header">
        <div className="summary-title-wrap">
          <div className="summary-badge-row">
            <h3 className="summary-title">DIAGNOSTICA QUALITÀ DELLA LINEA</h3>
            <span
              className="summary-global-badge"
              style={{ color: diagnostics.globalVerdict.color, borderColor: diagnostics.globalVerdict.color }}
            >
              <Zap size={12} />
              {diagnostics.globalVerdict.badge}
            </span>
          </div>
          <p className="summary-subtitle">{diagnostics.globalVerdict.title}</p>
        </div>

        <div className="summary-action-btns">
          <button 
            type="button" 
            className="btn-export-csv" 
            onClick={handleExportCSV}
            title="Esporta i risultati in formato CSV"
          >
            <Download size={14} />
            <span className="btn-label-text">Esporta CSV</span>
          </button>

          <button 
            type="button" 
            className="btn-share-res" 
            onClick={handleShare}
            title="Copia il riepilogo negli appunti"
          >
            {copied ? <Check size={14} color="var(--color-green-neon)" /> : <Share2 size={14} />}
            <span className="btn-label-text">{copied ? 'Copiato!' : 'Condividi'}</span>
          </button>
        </div>
      </div>

      {/* Griglia 4 Casi d'Uso Chiave con Verdetto Dettagliato */}
      <div className="use-cases-grid">
        {/* 1. Gaming */}
        <div className={`use-case-box ${diagnostics.gaming.status}`}>
          <div className="use-case-icon-frame">
            <Gamepad2 size={20} />
          </div>
          <div className="use-case-info">
            <div className="case-header-line">
              <span className="case-name">Gaming Online & VR</span>
              <span className={`case-tag-pill ${diagnostics.gaming.status}`}>
                {diagnostics.gaming.badge}
              </span>
            </div>
            <span className="case-verdict">{diagnostics.gaming.detail}</span>
          </div>
        </div>

        {/* 2. Streaming */}
        <div className={`use-case-box ${diagnostics.streaming.status}`}>
          <div className="use-case-icon-frame">
            <Tv size={20} />
          </div>
          <div className="use-case-info">
            <div className="case-header-line">
              <span className="case-name">Streaming 4K / 8K</span>
              <span className={`case-tag-pill ${diagnostics.streaming.status}`}>
                {diagnostics.streaming.badge}
              </span>
            </div>
            <span className="case-verdict">{diagnostics.streaming.detail}</span>
          </div>
        </div>

        {/* 3. Video Call */}
        <div className={`use-case-box ${diagnostics.videoCall.status}`}>
          <div className="use-case-icon-frame">
            <Video size={20} />
          </div>
          <div className="use-case-info">
            <div className="case-header-line">
              <span className="case-name">Video Call & Smart Working</span>
              <span className={`case-tag-pill ${diagnostics.videoCall.status}`}>
                {diagnostics.videoCall.badge}
              </span>
            </div>
            <span className="case-verdict">{diagnostics.videoCall.detail}</span>
          </div>
        </div>

        {/* 4. Upload Cloud */}
        <div className={`use-case-box ${diagnostics.cloud.status}`}>
          <div className="use-case-icon-frame">
            <CloudUpload size={20} />
          </div>
          <div className="use-case-info">
            <div className="case-header-line">
              <span className="case-name">Upload File & Backup Cloud</span>
              <span className={`case-tag-pill ${diagnostics.cloud.status}`}>
                {diagnostics.cloud.badge}
              </span>
            </div>
            <span className="case-verdict">{diagnostics.cloud.detail}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
