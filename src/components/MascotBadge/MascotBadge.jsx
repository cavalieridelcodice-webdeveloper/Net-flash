import React, { useMemo } from 'react';
import { Sparkles, ThumbsUp, Activity, AlertCircle } from 'lucide-react';
import './MascotBadge.css';

export function MascotBadge({
  status = 'ready', // 'ready' | 'connecting' | 'ping' | 'download' | 'upload' | 'completed' | 'aborted' | 'error'
  downloadSpeed = null,
  uploadSpeed = null,
  ping = null,
  jitter = null
}) {
  const speechData = useMemo(() => {
    switch (status) {
      case 'connecting':
        return {
          title: 'Connessione in corso...',
          text: 'Negoziazione con il server LibreSpeed e handshake TCP/SSL avviato. Pronti allo sprint!',
          mood: 'analyzing'
        };
      case 'ping':
        return {
          title: 'Controllo Reattività & Jitter',
          text: 'Calcolo dei tempi di risposta del server in tempo reale. Ogni millisecondo fa la differenza!',
          mood: 'analyzing'
        };
      case 'download':
        return {
          title: 'Sprint di Download!',
          text: 'Misurazione della banda in ricezione con streaming multi-connessione. Nessun dato simulato!',
          mood: 'speed'
        };
      case 'upload':
        return {
          title: 'Test di Upload in corso!',
          text: 'Verifica del flusso in trasmissione dati verso la rete. Stabilità e throughput continuo.',
          mood: 'speed'
        };
      case 'completed': {
        const dl = Number(downloadSpeed) || 0;
        const ul = Number(uploadSpeed) || 0;
        const p = Number(ping) || 0;

        // Analisi incrociata intelligente di Banda + Latenza
        if (dl >= 500 && p <= 30) {
          return {
            title: 'Fibra Gigabit da Record!',
            text: `Velocità straordinaria (${dl.toFixed(1)} Mbps) e latenza bassissima (${p.toFixed(0)} ms). Prestazioni top di gamma assolute!`,
            mood: 'success'
          };
        }

        if (dl >= 100 && p <= 45) {
          return {
            title: 'Connessione Fibra Promossa a Pieni Voti!',
            text: `Download fulmineo (${dl.toFixed(1)} Mbps) con ottima reattività (${p.toFixed(0)} ms). Ideale per gaming a zero lag e streaming 4K/8K contemporaneo.`,
            mood: 'success'
          };
        }

        if (dl >= 100 && p > 70) {
          return {
            title: 'Download Veloce, Latenza Migliorabile',
            text: `Banda di scaricamento ottima (${dl.toFixed(1)} Mbps) per filmati 4K e file pesanti, ma la latenza di ${p.toFixed(0)} ms potrebbe farsi sentire nei giochi online veloci.`,
            mood: 'neutral'
          };
        }

        if (dl >= 30 && p <= 50) {
          return {
            title: 'Buona Linea Broadband Fluida',
            text: `Connessione solida da ${dl.toFixed(1)} Mbps con buon ping (${p.toFixed(0)} ms). Navigazione reattiva, videochiamate HD stabili e smart working sereno.`,
            mood: 'success'
          };
        }

        if (dl >= 30 && p > 50) {
          return {
            title: 'Banda Adeguata per lo Streaming',
            text: `Velocità di ${dl.toFixed(1)} Mbps adatta per video HD e lavoro quotidiano. Latenza rilevata a ${p.toFixed(0)} ms.`,
            mood: 'neutral'
          };
        }

        if (dl > 0) {
          return {
            title: 'Velocità Base Misurata',
            text: `Rilevati ${dl.toFixed(1)} Mbps in download. La linea è adatta per navigazione web, messaggistica e musica in streaming.`,
            mood: 'neutral'
          };
        }

        return {
          title: 'Misurazione Conclusa!',
          text: 'Test reale completato. Consulta la diagnostica per scoprire i dettagli d\'uso pratico.',
          mood: 'success'
        };
      }
      case 'aborted':
        return {
          title: 'Test Annullato',
          text: 'Misurazione interrotta manualmente. Puoi ripartire in qualsiasi momento con un clic su Avvia Test.',
          mood: 'neutral'
        };
      case 'error':
        return {
          title: 'Verifica Connessione Server',
          text: 'Impossibile completare il trasferimento dati. Verifica la connessione di rete o seleziona un altro server.',
          mood: 'error'
        };
      default:
        return {
          title: 'NetFlash ti dà il benvenuto!',
          text: 'Speed test di livello SaaS con motore LibreSpeed, 100% privo di banner invasivi. Clicca su Avvia Test per iniziare.',
          mood: 'ready'
        };
    }
  }, [status, downloadSpeed, uploadSpeed, ping, jitter]);

  return (
    <aside className={`mascot-reaction-card mood-${speechData.mood}`} aria-label="Mascotte NetFlash">
      <div className="mascot-avatar-container">
        <div className="mascot-img-wrapper">
          <img 
            src="/mascot-logo.jpg" 
            alt="Mascotte NetFlash — Esperto di Velocità Internet" 
            className="mascot-round-img"
          />
        </div>
        <div className="mascot-live-indicator" title="Mascotte attiva">
          {speechData.mood === 'success' ? (
            <ThumbsUp size={12} className="indicator-icon" />
          ) : speechData.mood === 'error' ? (
            <AlertCircle size={12} className="indicator-icon" />
          ) : (
            <Sparkles size={12} className="indicator-icon" />
          )}
        </div>
      </div>

      <div className="mascot-speech-bubble">
        <div className="bubble-speaker-tag">
          <span className="speaker-name">FLASH ASSISTANT</span>
          <span className="speaker-role">Network Quality Engine</span>
        </div>
        <h4 className="speech-title">{speechData.title}</h4>
        <p className="speech-text">{speechData.text}</p>
      </div>
    </aside>
  );
}
