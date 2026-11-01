import React, { useState } from 'react';
import { Gamepad2, Tv, Video, CloudUpload, Download, Share2, Check } from 'lucide-react';
import { formatSpeed } from '../../utils/formatSpeed';
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

  // Valutazioni basate su standard di settore verificabili (FCC, ITU, Steam/Discord)
  const isGamingGood = ping <= 45 && jitter <= 10;
  const isStreaming4K = download >= 25;
  const isVideoCallGood = upload >= 8 && ping <= 80 && jitter <= 15;
  const isCloudFast = upload >= 30;

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
    const shareText = `🚀 NetFlash Speed Test\n📥 Download: ${download} Mbps\n📤 Upload: ${upload} Mbps\n⚡ Ping: ${ping} ms | Jitter: ${jitter} ms\nMotore LibreSpeed senza pubblicità`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="results-summary-card" aria-label="Analisi approfondita della connessione">
      <div className="results-summary-header">
        <div>
          <h3 className="summary-title">DIAGNOSTICA QUALITÀ DELLA LINEA</h3>
          <p className="summary-subtitle">Valutazione oggettiva basata sulle metriche reali rilevate</p>
        </div>

        <div className="summary-action-btns">
          <button 
            type="button" 
            className="btn-export-csv" 
            onClick={handleExportCSV}
            title="Esporta i risultati in formato CSV"
          >
            <Download size={14} />
            <span>Esporta CSV</span>
          </button>

          <button 
            type="button" 
            className="btn-share-res" 
            onClick={handleShare}
            title="Copia il riepilogo negli appunti"
          >
            {copied ? <Check size={14} color="var(--color-green-neon)" /> : <Share2 size={14} />}
            <span>{copied ? 'Copiato!' : 'Condividi'}</span>
          </button>
        </div>
      </div>

      <div className="use-cases-grid">
        <div className={`use-case-box ${isGamingGood ? 'pass' : 'warn'}`}>
          <div className="use-case-icon-frame">
            <Gamepad2 size={20} />
          </div>
          <div className="use-case-info">
            <span className="case-name">Gaming Online & VR</span>
            <span className="case-verdict">
              {isGamingGood ? 'Ottimo (Bassa Latenza)' : 'Possibile Latenza / Jitter'}
            </span>
          </div>
        </div>

        <div className={`use-case-box ${isStreaming4K ? 'pass' : 'warn'}`}>
          <div className="use-case-icon-frame">
            <Tv size={20} />
          </div>
          <div className="use-case-info">
            <span className="case-name">Streaming 4K / 8K</span>
            <span className="case-verdict">
              {isStreaming4K ? 'Perfetto (Buffer Istantaneo)' : 'Limitato a 1080p'}
            </span>
          </div>
        </div>

        <div className={`use-case-box ${isVideoCallGood ? 'pass' : 'warn'}`}>
          <div className="use-case-icon-frame">
            <Video size={20} />
          </div>
          <div className="use-case-info">
            <span className="case-name">Video Call & Meet HD</span>
            <span className="case-verdict">
              {isVideoCallGood ? 'Fluido & Stabile' : 'Possibili Perdite Frame'}
            </span>
          </div>
        </div>

        <div className={`use-case-box ${isCloudFast ? 'pass' : 'warn'}`}>
          <div className="use-case-icon-frame">
            <CloudUpload size={20} />
          </div>
          <div className="use-case-info">
            <span className="case-name">Upload File & Backup</span>
            <span className="case-verdict">
              {isCloudFast ? 'Veloce (>30 Mbps)' : 'Upload Standard'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
