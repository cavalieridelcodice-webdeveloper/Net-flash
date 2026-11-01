/**
 * LibreSpeed Service — Wrapper modulare e resiliente per il Web Worker ufficiale LibreSpeed
 * Esegue misurazioni reali di rete (Download, Upload, Ping, Jitter, IP).
 */

export class LibreSpeedService {
  constructor(options = {}) {
    this.workerPath = options.workerPath || '/speedtest_worker.js';
    this.worker = null;
    this.statusInterval = null;
    this.isRunning = false;
    this.onUpdateCallback = null;
    this.onCompleteCallback = null;
    this.onErrorCallback = null;

    // Server predefinito (locale o personalizzato)
    this.activeServer = options.server || {
      name: 'NetFlash Direct Engine (Vite Dev / Local)',
      server: '/',
      dlURL: 'api/garbage',
      ulURL: 'api/empty',
      pingURL: 'api/empty',
      getIpURL: 'api/getIP'
    };
  }

  setServer(serverConfig) {
    if (this.isRunning) {
      throw new Error('Impossibile cambiare server mentre il test è in esecuzione');
    }
    this.activeServer = { ...this.activeServer, ...serverConfig };
  }

  getServer() {
    return this.activeServer;
  }

  /**
   * Avvia il ciclo di speed test
   * @param {Object} customSettings - Opzioni avanzate LibreSpeed
   */
  startTest(customSettings = {}) {
    if (this.isRunning) {
      console.warn('Speed test già in esecuzione');
      return;
    }

    try {
      this.isRunning = true;
      this.worker = new Worker(`${this.workerPath}?t=${Date.now()}`);

      let lastState = -1;

      this.worker.onmessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          
          if (this.onUpdateCallback) {
            this.onUpdateCallback(data);
          }

          // Transizione di stato
          // testState: -1=not started, 0=starting, 1=download, 2=ping+jitter, 3=upload, 4=finished, 5=aborted
          if (data.testState >= 4) {
            this._cleanup();
            if (this.onCompleteCallback) {
              const isDlFail = data.dlStatus === 'Fail';
              const isUlFail = data.ulStatus === 'Fail';
              const isPingFail = data.pingStatus === 'Fail';

              if (isDlFail && isPingFail) {
                if (this.onErrorCallback) {
                  this.onErrorCallback(new Error(`Impossibile comunicare con il server "${this.activeServer.name}". Il server potrebbe essere offline o non raggiungibile. Prova a selezionare "NetFlash WAN Relay" o un altro server.`));
                  return;
                }
              }

              this.onCompleteCallback({
                aborted: data.testState === 5,
                download: !isDlFail && data.dlStatus ? parseFloat(data.dlStatus) : 0,
                upload: !isUlFail && data.ulStatus ? parseFloat(data.ulStatus) : 0,
                ping: !isPingFail && data.pingStatus ? parseFloat(data.pingStatus) : 0,
                jitter: data.jitterStatus && data.jitterStatus !== 'Fail' ? parseFloat(data.jitterStatus) : 0,
                clientIp: data.clientIp || '',
                server: this.activeServer
              });
            }
          }
          lastState = data.testState;
        } catch (err) {
          console.error('Errore parsing dati LibreSpeed worker:', err);
        }
      };

      this.worker.onerror = (err) => {
        console.error('Errore nel Web Worker LibreSpeed:', err);
        this._cleanup();
        if (this.onErrorCallback) {
          const detail = err?.message || '';
          this.onErrorCallback(new Error(detail ? `Errore Web Worker: ${detail}` : `Impossibile completare la misurazione con il server "${this.activeServer?.name || ''}". Prova a selezionare "NetFlash WAN Relay" o un altro server.`));
        }
      };

      // Poll periodico di stato ogni 100ms per fluidità a 60 FPS
      this.statusInterval = setInterval(() => {
        if (this.worker && this.isRunning) {
          this.worker.postMessage('status');
        }
      }, 100);

      // Normalizzazione percorsi server
      const base = this.activeServer.server.endsWith('/')
        ? this.activeServer.server
        : `${this.activeServer.server}/`;

      const isRemote = !this.activeServer.isLocal && this.activeServer.server.startsWith('http');

      const settings = {
        test_order: 'IP_P_D_U', // IP -> Ping & Jitter -> Download -> Upload
        time_dl_max: 10,
        time_ul_max: 10,
        time_auto: true,
        count_ping: 10,
        mpot: isRemote,
        url_dl: this.activeServer.dlURL.startsWith('http') ? this.activeServer.dlURL : `${base}${this.activeServer.dlURL}`,
        url_ul: this.activeServer.ulURL.startsWith('http') ? this.activeServer.ulURL : `${base}${this.activeServer.ulURL}`,
        url_ping: this.activeServer.pingURL.startsWith('http') ? this.activeServer.pingURL : `${base}${this.activeServer.pingURL}`,
        url_getIp: this.activeServer.getIpURL.startsWith('http') ? this.activeServer.getIpURL : `${base}${this.activeServer.getIpURL}`,
        getIp_ispInfo: true,
        xhr_dlMultistream: 4,
        xhr_ulMultistream: 3,
        garbagePhp_chunkSize: 100,
        ...customSettings
      };

      this.worker.postMessage(`start ${JSON.stringify(settings)}`);
    } catch (err) {
      this._cleanup();
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
    }
  }

  /**
   * Interrompe immediatamente il test in corso
   */
  abortTest() {
    if (!this.isRunning || !this.worker) return;
    try {
      this.worker.postMessage('abort');
    } catch (e) {
      console.warn('Errore invio comando abort:', e);
    }
    this._cleanup();
  }

  _cleanup() {
    this.isRunning = false;
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch (e) {
        // ignore
      }
      this.worker = null;
    }
  }

  onUpdate(callback) {
    this.onUpdateCallback = callback;
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }
}

export const defaultLibreSpeedService = new LibreSpeedService();
