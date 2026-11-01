import { useState, useEffect, useRef, useCallback } from 'react';
import { LibreSpeedService } from '../services/libreSpeedService';

const HISTORY_STORAGE_KEY = 'netflash_history_v1';

export function useSpeedTest(activeServer) {
  const [status, setStatus] = useState('ready'); // 'ready' | 'connecting' | 'ping' | 'download' | 'upload' | 'completed' | 'aborted' | 'error'
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [jitter, setJitter] = useState(null);
  const [clientIp, setClientIp] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0); // 0 - 100 overall
  const [currentPhaseProgress, setCurrentPhaseProgress] = useState(0); // 0 - 100 current step
  const [errorMessage, setErrorMessage] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const serviceRef = useRef(null);

  // Inizializza o aggiorna il servizio LibreSpeed con il server selezionato
  useEffect(() => {
    serviceRef.current = new LibreSpeedService({ server: activeServer });
    return () => {
      if (serviceRef.current) {
        serviceRef.current.abortTest();
      }
    };
  }, [activeServer]);

  const startTest = useCallback(() => {
    if (!serviceRef.current) return;

    // Reset metriche
    setStatus('connecting');
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    setJitter(null);
    setCurrentProgress(0);
    setCurrentPhaseProgress(0);
    setErrorMessage(null);

    // Registra callback del servizio
    serviceRef.current.onUpdate((data) => {
      // data.testState:
      // -1 = non avviato
      //  0 = avvio / getIP
      //  1 = download
      //  2 = ping + jitter
      //  3 = upload
      //  4 = completato
      //  5 = abort

      if (data.clientIp) {
        setClientIp(data.clientIp);
      }

      if (data.testState === 0) {
        setStatus('connecting');
        setCurrentProgress(5);
      } else if (data.testState === 2) {
        setStatus('ping');
        if (data.pingStatus) setPing(parseFloat(data.pingStatus));
        if (data.jitterStatus) setJitter(parseFloat(data.jitterStatus));
        const pProg = Math.round((data.pingProgress || 0) * 100);
        setCurrentPhaseProgress(pProg);
        setCurrentProgress(10 + Math.round((data.pingProgress || 0) * 20));
      } else if (data.testState === 1) {
        setStatus('download');
        if (data.dlStatus) setDownloadSpeed(parseFloat(data.dlStatus));
        const dlProg = Math.round((data.dlProgress || 0) * 100);
        setCurrentPhaseProgress(dlProg);
        setCurrentProgress(30 + Math.round((data.dlProgress || 0) * 35));
      } else if (data.testState === 3) {
        setStatus('upload');
        if (data.ulStatus) setUploadSpeed(parseFloat(data.ulStatus));
        const ulProg = Math.round((data.ulProgress || 0) * 100);
        setCurrentPhaseProgress(ulProg);
        setCurrentProgress(65 + Math.round((data.ulProgress || 0) * 35));
      }
    });

    serviceRef.current.onComplete((results) => {
      if (results.aborted) {
        setStatus('aborted');
        return;
      }

      setStatus('completed');
      setCurrentProgress(100);
      setCurrentPhaseProgress(100);

      // Salva nello storico locale
      const testRecord = {
        id: `test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        download: results.download,
        upload: results.upload,
        ping: results.ping,
        jitter: results.jitter,
        ip: results.clientIp,
        serverName: results.server?.name || 'LibreSpeed Server'
      };

      setHistory((prev) => {
        const updated = [testRecord, ...prev].slice(0, 20); // Conserva ultimi 20 test
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Errore salvataggio storico:', e);
        }
        return updated;
      });
    });

    serviceRef.current.onError((err) => {
      setStatus('error');
      setErrorMessage(err.message || 'Si è verificato un errore durante la misurazione della rete.');
    });

    // Avvia esecuzione reale
    serviceRef.current.startTest();
  }, []);

  const abortTest = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.abortTest();
      setStatus('aborted');
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
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
  };
}
