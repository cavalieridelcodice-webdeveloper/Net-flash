/**
 * NetFlash — Vercel API Route: /api/garbage
 * Relay ad alta velocità verso il server LibreSpeed italiano GARR Bologna.
 * Questo endpoint viene usato per il test di Download reale.
 * Elimina i problemi CORS poiché la richiesta parte dal server Vercel (server-side).
 */

import https from 'https';

// Pool HTTPS riusabile per massimizzare throughput verso GARR
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 32,
  maxFreeSockets: 16,
  timeout: 30000
});

// Server GARR priorità: Bologna → Bari → Fallback random bytes
const GARR_SERVERS = [
  { host: 'st-be-bo1.infra.garr.it', label: 'Bologna' },
  { host: 'st-be-ba1.infra.garr.it', label: 'Bari' }
];

export const config = {
  maxDuration: 30
};

export default function handler(req, res) {
  // CORS universale — qualsiasi dominio può usare questo endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'application/octet-stream');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const ckSize = url.searchParams.get('ckSize') || '100';
  const r = url.searchParams.get('r') || Math.random();

  // Prova i server GARR in ordine — NESSUN fallback locale.
  // Se tutti i server sono irraggiungibili, restituisce 503 invece di dati falsi.
  function tryServer(index) {
    if (index >= GARR_SERVERS.length) {
      // Tutti i server GARR non raggiungibili: errore reale, non dati inventati
      if (!res.headersSent) {
        res.status(503).end('Speed test servers temporarily unavailable. Please retry.');
      }
      return;
    }

    const srv = GARR_SERVERS[index];
    const path = `/garbage.php?cors=true&ckSize=${ckSize}&r=${r}`;

    const extReq = https.request(
      {
        hostname: srv.host,
        port: 443,
        path,
        method: 'GET',
        agent,
        timeout: 8000,
        headers: {
          'User-Agent': 'NetFlash-SpeedEngine/3.0',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      },
      (extRes) => {
        if (extRes.statusCode !== 200) {
          extRes.resume();
          tryServer(index + 1);
          return;
        }
        res.status(200);
        // Stream diretto: nessuna bufferizzazione, massima velocità
        extRes.pipe(res, { end: true });
      }
    );

    extReq.on('timeout', () => {
      extReq.destroy();
      tryServer(index + 1);
    });

    extReq.on('error', () => {
      tryServer(index + 1);
    });

    extReq.end();
  }

  tryServer(0);
}
