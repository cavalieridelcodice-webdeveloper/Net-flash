import { useState, useEffect, useCallback, useMemo } from 'react';

const SERVER_STORAGE_KEY = 'netflash_server_config_v5';
const SELECTED_SERVER_KEY = 'netflash_selected_server_id_v5';

export const CANDIDATE_SERVERS = [
  {
    id: 'wan-relay',
    name: 'NetFlash WAN Relay (Italia Gigabit)',
    location: 'Bologna GARR • Snodo Nazionale',
    server: '/',
    dlURL: 'api/wan/garbage',
    ulURL: 'api/wan/empty',
    pingURL: 'api/wan/empty',
    getIpURL: 'api/wan/getIP',
    isLocal: false,
    badgeText: 'Ottimizzato WAN'
  },
  {
    id: 'librespeed-garr-bo',
    name: 'LibreSpeed Bologna (GARR)',
    location: 'Bologna, Italia (GARR Gigabit)',
    server: 'https://st-be-bo1.infra.garr.it/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Rete Ricerca Italia'
  },
  {
    id: 'librespeed-garr-ba',
    name: 'LibreSpeed Bari (GARR)',
    location: 'Bari, Italia (GARR Gigabit)',
    server: 'https://st-be-ba1.infra.garr.it/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Rete Ricerca Italia'
  },
  {
    id: 'librespeed-frankfurt',
    name: 'LibreSpeed Francoforte',
    location: 'Francoforte, DE (Clouvider DE-CIX)',
    server: 'https://fra.speedtest.clouvider.net/backend/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Hub Europeo DE'
  },
  {
    id: 'librespeed-amsterdam',
    name: 'LibreSpeed Amsterdam',
    location: 'Amsterdam, NL (AMS-IX)',
    server: 'https://ams.speedtest.clouvider.net/backend/',
    dlURL: 'garbage.php',
    ulURL: 'empty.php',
    pingURL: 'empty.php',
    getIpURL: 'getIP.php',
    isLocal: false,
    badgeText: 'Hub Europeo NL'
  },
  {
    id: 'local-direct',
    name: 'NetFlash Local Direct Engine',
    location: 'Loopback Mac (RAM/CPU - No Internet)',
    server: '/',
    dlURL: 'api/garbage',
    ulURL: 'api/empty',
    pingURL: 'api/empty',
    getIpURL: 'api/getIP',
    isLocal: true,
    badgeText: 'Test Locale Loopback'
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
    return 'auto'; // Di default selezione automatica come Ookla
  });

  const [autoResolvedServer, setAutoResolvedServer] = useState(CANDIDATE_SERVERS[0]);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);

  // Ping a un singolo server con timeout e CORS
  const testSingleServerPing = useCallback(async (targetServer) => {
    const start = performance.now();
    try {
      const base = targetServer.server.endsWith('/') ? targetServer.server : `${targetServer.server}/`;
      const pingUrl = targetServer.pingURL.startsWith('http') ? targetServer.pingURL : `${base}${targetServer.pingURL}`;
      const sep = pingUrl.includes('?') ? '&' : '?';
      const corsParam = targetServer.server.startsWith('http') ? 'cors=true&' : '';

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

  // Algoritmo Selezione Automatica Server Migliore (come Ookla Speedtest)
  const findBestServer = useCallback(async () => {
    setIsAutoSelecting(true);
    try {
      const pingableCandidates = CANDIDATE_SERVERS.filter((s) => !s.isLocal);

      const results = await Promise.all(
        pingableCandidates.map(async (candidate) => {
          const latency = await testSingleServerPing(candidate);
          return { server: candidate, latency };
        })
      );

      // Ordina per latenza crescente
      results.sort((a, b) => a.latency - b.latency);

      const best = results[0];
      if (best && best.latency < 9999) {
        setAutoResolvedServer({
          ...best.server,
          isAutoSelected: true,
          measuredPing: best.latency,
          name: `${best.server.name.replace(/\(.*?\)/g, '').trim()} (🎯 Miglior Server • ${best.latency} ms)`
        });
        setPingLatency(best.latency);
      } else {
        setAutoResolvedServer(CANDIDATE_SERVERS[0]);
      }
    } catch (e) {
      console.warn('Errore auto-selezione server:', e);
      setAutoResolvedServer(CANDIDATE_SERVERS[0]);
    } finally {
      setIsAutoSelecting(false);
    }
  }, [testSingleServerPing]);

  // All'avvio dell'app cerca subito il miglior server in background
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
      console.warn('Errore salvataggio server selezionato:', e);
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
