import React, { useMemo } from 'react';
import { Sparkles, ThumbsUp } from 'lucide-react';
import './MascotBadge.css';

export function MascotBadge({
  status = 'ready', // 'ready' | 'connecting' | 'ping' | 'download' | 'upload' | 'completed' | 'aborted' | 'error'
  downloadSpeed = null,
  ping = null
}) {
  const speechData = useMemo(() => {
    switch (status) {
      case 'connecting':
        return {
          title: 'Sincronizzazione in corso...',
          text: 'Negoziazione con il server LibreSpeed e handshake di rete avviato. Pronti allo sprint!',
          mood: 'analyzing'
        };
      case 'ping':
        return {
          title: 'Controllo Reattività',
          text: 'Calcolo di latenza e jitter in tempo reale. Ogni millisecondo fa la differenza!',
          mood: 'analyzing'
        };
      case 'download':
        return {
          title: 'Accelerazione Download!',
          text: 'Flusso multi-stream al massimo throughput. Nessun numero fittizio, solo dati reali trasferiti!',
          mood: 'speed'
        };
      case 'upload':
        return {
          title: 'Trasmissione Upload!',
          text: 'Stiamo verificando la banda in salita con pacchetti continui. Ottima tenuta del canale!',
          mood: 'speed'
        };
      case 'completed':
        if (downloadSpeed && downloadSpeed >= 100) {
          return {
            title: 'Connessione Turbo Approvata!',
            text: `Velocità eccezionale (${downloadSpeed.toFixed(1)} Mbps). Pollice in su per gaming a zero lag e streaming Ultra HD!`,
            mood: 'success'
          };
        }
        return {
          title: 'Test Completato!',
          text: 'Misurazione reale conclusa e registrata. Tutti i parametri sono pronti per essere analizzati.',
          mood: 'success'
        };
      case 'aborted':
        return {
          title: 'Test Annullato',
          text: 'Misurazione interrotta. Puoi ripartire in qualsiasi momento con un clic su Avvia Test.',
          mood: 'neutral'
        };
      case 'error':
        return {
          title: 'Verifica Connessione Server',
          text: 'Impossibile completare il trasferimento. Verifica lo stato del server o seleziona un altro endpoint.',
          mood: 'error'
        };
      default:
        return {
          title: 'NetFlash ti dà il benvenuto!',
          text: 'Speed test di livello SaaS, 100% privo di banner o tracker invasivi. Clicca su Avvia Test per iniziare.',
          mood: 'ready'
        };
    }
  }, [status, downloadSpeed, ping]);

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
