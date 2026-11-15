/**
 * NetFlash — Vercel API Route: /api/garbage
 * Stream dati verso il browser per misurare la velocità di download reale.
 *
 * Architettura: Vercel Edge → Internet → Browser utente
 * Il dato percorre la vera connessione internet dell'utente → misurazione reale.
 * Prima tenta di usare GARR Italia (latenza minore per utenti italiani),
 * poi usa dati generati localmente dall'edge Vercel più vicino come fallback.
 */

import https from 'https';
import crypto from 'crypto';

// Pool HTTPS riusabile verso GARR
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 16,
  timeout: 10000
});

// Chunk da 256KB pre-allocato per massima efficienza
const GARBAGE_CHUNK = crypto.randomBytes(256 * 1024);

const GARR_SERVERS = [
  { host: 'st-be-bo1.infra.garr.it' },
  { host: 'st-be-ba1.infra.garr.it' }
];

export const config = {
  maxDuration: 30
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename=random.dat');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const ckSize = Math.max(1, Math.min(200, parseInt(url.searchParams.get('ckSize') || '100', 10)));
  const r = url.searchParams.get('r') || Math.random();

  // Prova GARR (latenza più bassa per Italia), poi fallback edge locale
  let tried = 0;

  function tryGarr() {
    if (tried >= GARR_SERVERS.length) {
      streamLocal();
      return;
    }
    const srv = GARR_SERVERS[tried++];
    const extReq = https.request(
      {
        hostname: srv.host,
        port: 443,
        path: `/garbage.php?cors=true&ckSize=${ckSize}&r=${r}`,
        method: 'GET',
        agent,
        timeout: 5000,
        headers: { 'User-Agent': 'NetFlash/3.0', 'Accept': '*/*' }
      },
      (extRes) => {
        if (extRes.statusCode !== 200) {
          extRes.resume();
          tryGarr();
          return;
        }
        // Streaming diretto GARR → browser senza buffering
        extRes.pipe(res, { end: true });
      }
    );
    extReq.on('timeout', () => { extReq.destroy(); tryGarr(); });
    extReq.on('error', () => tryGarr());
    extReq.end();
  }

  /**
   * Fallback: genera dati casuale dall'edge Vercel.
   * I dati viaggiano comunque: Vercel datacenter → Internet → Browser utente.
   * La bottleneck È la connessione internet dell'utente → misurazione reale e onesta.
   */
  function streamLocal() {
    const totalBytes = ckSize * 1024 * 1024;
    let sent = 0;

    res.status(200);

    function sendNext() {
      if (res.writableEnded || res.destroyed) return;
      if (sent >= totalBytes) {
        res.end();
        return;
      }
      const remaining = totalBytes - sent;
      const slice = remaining < GARBAGE_CHUNK.length
        ? GARBAGE_CHUNK.slice(0, remaining)
        : GARBAGE_CHUNK;

      const canContinue = res.write(slice);
      sent += slice.length;

      if (canContinue) {
        setImmediate(sendNext);
      } else {
        res.once('drain', sendNext);
      }
    }

    sendNext();
  }

  tryGarr();
}
