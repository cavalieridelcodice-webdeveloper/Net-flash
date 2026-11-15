import { useState, useEffect, useCallback, useMemo } from 'react';

const SERVER_STORAGE_KEY = 'netflash_server_config_v6';
const SELECTED_SERVER_KEY = 'netflash_selected_server_id_v6';

/**
 * Lista server candidati per l'auto-selezione.
 * Tutti i server remoti supportano CORS con ?cors=true (LibreSpeed standard).
 * Il server "netflash-api" usa le Vercel API Routes — nessun problema CORS, massima compatibilità.
 */
export const CANDIDATE_SERVERS = [
  // ─── SERVER VERCEL API (Relay ottimizzato, nessun CORS, funziona sempre) ───
  {
    id: 'netflash-api',
    name: 'NetFlash Cloud (Vercel Edge)',
    location: 'Edge Network Globale • Nodo Più Vicino',
    server: '/',
    dlURL: 'api/garbage',
    ulURL: 'api/empty',
    pingURL: 'api/empty',
    getIpURL: 'api/getIP',
    isLocal: false,
    isVercelApi: true,
    badgeText: 'NetFlash Server',
    priority: 1
  },
  // ─── SERVER ITALIA ───
  {
    id: 'garr-bologna',
    name: 'GARR Bologna (Fibra 10G)',
    location: 'Bologna, Italia — Rete Ricerca Nazionale',
    server: 'https://st-be-bo1.infra.garr.it/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Italia 10 Gbps',
    priority: 2
  },
  {
    id: 'garr-bari',
    name: 'GARR Bari (Fibra 10G)',
    location: 'Bari, Italia — Rete Ricerca Nazionale',
    server: 'https://st-be-ba1.infra.garr.it/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Italia 10 Gbps',
    priority: 2
  },
  // ─── SERVER EUROPA ───
  {
    id: 'clouvider-frankfurt',
    name: 'Clouvider Francoforte (DE-CIX)',
    location: 'Francoforte, Germania — Hub Europeo',
    server: 'https://fra.speedtest.clouvider.net/backend/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Europa DE',
    priority: 3
  },
  {
    id: 'clouvider-amsterdam',
    name: 'Clouvider Amsterdam (AMS-IX)',
    location: 'Amsterdam, Olanda — Hub Europeo',
    server: 'https://ams.speedtest.clouvider.net/backend/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Europa NL',
    priority: 3
  },
  {
    id: 'clouvider-london',
    name: 'Clouvider Londra (LINX)',
    location: 'Londra, UK — Hub Europeo',
    server: 'https://lon.speedtest.clouvider.net/backend/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Europa UK',
    priority: 3
  },
  // ─── TEST LOCALE (solo per debug, non misura velocità internet) ───
  {
    id: 'local-direct',
    name: 'NetFlash Local Engine (Solo Debug)',
    location: 'Loopback Locale — Non misura velocità internet',
    server: '/',
    dlURL: 'api/garbage',
    ulURL: 'api/empty',
    pingURL: 'api/empty',
    getIpURL: 'api/getIP',
    isLocal: true,
    badgeText: 'Debug Locale',
    priority: 99
  }
];

export const AUTO_SERVER_META = {
  id: 'auto',
  name: '🎯 Selezione Automatica (Server Migliore)',
  location: 'Rilevamento automatico del nodo con minor latenza',
  isAuto: true
};

export const DEFAULT_SERVERS = [AUTO_SERVER_META, ...CANDIDATE_SERVERS];

export function useServerSelection() {
  const [servers, setServers] = useState(() => {
    try {
      const saved = localStorage.getItem(SERVER_STORAGE_KEY);
      if (saved) {
        const customServers = JSON.parse(saved);
        const defaultIds = new Set(DEFAULT_SERVERS.map((s) => s.id));
        const userCustoms = customServers.filter((s) => !defaultIds.has(s.id));
        return [...DEFAULT_SERVERS, ...userCustoms];
      }
    } catch {
      // fallback
    }
    return DEFAULT_SERVERS;
  });

  const [selectedServerId, setSelectedServerId] = useState(() => {
    try {
      const savedId = localStorage.getItem(SELECTED_SERVER_KEY);
      if (savedId && DEFAULT_SERVERS.some((s) => s.id === savedId)) {
        return savedId;
      }
    } catch {
      // fallback
    }
    return 'auto';
  });

  const [autoResolvedServer, setAutoResolvedServer] = useState(CANDIDATE_SERVERS[0]);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);

  /**
   * Pinga un singolo server e restituisce la latenza in ms (o 9999 se non raggiungibile).
   * Per server isVercelApi usa la stessa origin → nessun problema CORS garantito.
   */
  const testSingleServerPing = useCallback(async (targetServer) => {
    const start = performance.now();
    try {
      let pingUrl;
      if (targetServer.isVercelApi || targetServer.isLocal) {
        // Server relativo: stessa origin, nessun CORS
        pingUrl = `/${targetServer.pingURL}`;
      } else {
        const base = targetServer.server.endsWith('/') ? targetServer.server : `${targetServer.server}/`;
        pingUrl = `${base}${targetServer.pingURL}`;
      }

      const sep = pingUrl.includes('?') ? '&' : '?';
      const corsParam = (!targetServer.isVercelApi && !targetServer.isLocal) ? 'cors=true&' : '';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${pingUrl}${sep}${corsParam}t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return 9999;
      return Math.round(performance.now() - start);
    } catch {
      return 9999;
    }
  }, []);

  /**
   * Algoritmo auto-selezione server migliore.
   * 1. Pinga tutti i candidati in parallelo
   * 2. Il server NetFlash Cloud (Vercel API) ha bonus priorità: -20ms artificiali
   *    (garantisce CORS su qualsiasi ISP/dispositivo)
   * 3. Sceglie il nodo con latenza effettiva più bassa
   */
  const findBestServer = useCallback(async () => {
    setIsAutoSelecting(true);
    try {
      const pingableCandidates = CANDIDATE_SERVERS.filter((s) => !s.isLocal);

      const results = await Promise.all(
        pingableCandidates.map(async (candidate) => {
          const latency = await testSingleServerPing(candidate);
          // Bonus per server Vercel API: sempre funziona, nessun CORS, nodo edge più vicino
          const adjustedLatency = candidate.isVercelApi ? Math.max(1, latency - 20) : latency;
          return { server: candidate, latency, adjustedLatency };
        })
      );

      // Ordina per latenza aggiustata
      results.sort((a, b) => a.adjustedLatency - b.adjustedLatency);

      const best = results[0];
      if (best && best.latency < 9999) {
        setAutoResolvedServer({
          ...best.server,
          isAutoSelected: true,
          measuredPing: best.latency,
          name: `${best.server.name.replace(/\(.*?\)/g, '').trim()} (🎯 Auto • ${best.latency} ms)`
        });
        setPingLatency(best.latency);
      } else {
        // Tutti irraggiungibili → usa NetFlash Cloud (sempre disponibile)
        setAutoResolvedServer(CANDIDATE_SERVERS[0]);
      }
    } catch (e) {
      console.warn('Errore auto-selezione server:', e);
      setAutoResolvedServer(CANDIDATE_SERVERS[0]);
    } finally {
      setIsAutoSelecting(false);
    }
  }, [testSingleServerPing]);

  // All'avvio cerca subito il miglior server in background
  useEffect(() => {
    if (selectedServerId === 'auto') {
      findBestServer();
    }
  }, [selectedServerId, findBestServer]);

  // Server attualmente attivo per il test
  const selectedServer = useMemo(() => {
    if (selectedServerId === 'auto') {
      return autoResolvedServer || CANDIDATE_SERVERS[0];
    }
    return servers.find((s) => s.id === selectedServerId) || CANDIDATE_SERVERS[0];
  }, [selectedServerId, autoResolvedServer, servers]);

  const selectServer = useCallback((id) => {
    setSelectedServerId(id);
    try {
      localStorage.setItem(SELECTED_SERVER_KEY, id);
    } catch (e) {
      console.warn('Errore salvataggio server:', e);
    }
  }, []);

  const addCustomServer = useCallback((customConfig) => {
    const newServer = {
      id: `custom_${Date.now()}`,
      name: customConfig.name || 'Server LibreSpeed Personalizzato',
      location: customConfig.location || 'Server Remoto',
      server: customConfig.server.endsWith('/') ? customConfig.server : `${customConfig.server}/`,
      dlURL: customConfig.dlURL || 'garbage.php',
      ulURL: customConfig.ulURL || 'empty.php',
      pingURL: customConfig.pingURL || 'empty.php',
      getIpURL: customConfig.getIpURL || 'getIP.php',
      isLocal: false,
      badgeText: 'Server Personalizzato'
    };

    setServers((prev) => {
      const updated = [...prev, newServer];
      try {
        localStorage.setItem(
          SERVER_STORAGE_KEY,
          JSON.stringify(updated.filter((s) => !s.isLocal && !s.isAuto))
        );
      } catch (e) {
        console.warn('Errore salvataggio server:', e);
      }
      return updated;
    });

    selectServer(newServer.id);
    return newServer;
  }, [selectServer]);

  const testServerPing = useCallback(async (serverToTest) => {
    const target = serverToTest || selectedServer;
    setIsPinging(true);
    const latency = await testSingleServerPing(target);
    setIsPinging(false);
    if (latency < 9999) {
      setPingLatency(latency);
      return latency;
    }
    setPingLatency(null);
    return null;
  }, [selectedServer, testSingleServerPing]);

  return {
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
  };
}
