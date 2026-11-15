/**
 * NetFlash — Vercel API Route: /api/empty
 * Endpoint per test Upload e Ping reale verso GARR.
 * Assorbe i dati POST (upload) e risponde vuoto per ping.
 */

import https from 'https';

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 32,
  timeout: 30000
});

const GARR_SERVERS = [
  { host: 'st-be-bo1.infra.garr.it' },
  { host: 'st-be-ba1.infra.garr.it' }
];

export const config = {
  maxDuration: 30,
  api: {
    bodyParser: false // necessario per ricevere lo stream di upload grezzo
  }
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Upload test: relay verso GARR o assorbi localmente
    function tryUpload(index) {
      if (index >= GARR_SERVERS.length) {
        // Fallback locale: assorbi e rispondi OK
        req.on('data', () => {});
        req.on('end', () => {
          res.status(200).end('');
        });
        return;
      }

      const srv = GARR_SERVERS[index];
      const extReq = https.request(
        {
          hostname: srv.host,
          port: 443,
          path: '/empty.php?cors=true',
          method: 'POST',
          agent,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Connection': 'keep-alive'
          }
        },
        (extRes) => {
          extRes.on('data', () => {});
          extRes.on('end', () => {
            res.status(200).end('');
          });
        }
      );

      extReq.on('timeout', () => {
        extReq.destroy();
        tryUpload(index + 1);
      });

      extReq.on('error', () => {
        tryUpload(index + 1);
      });

      req.pipe(extReq);
    }

    tryUpload(0);
    return;
  }

  // GET: risposta vuota istantanea per test ping (latenza reale verso il server Vercel edge)
  res.status(200).end('');
}
