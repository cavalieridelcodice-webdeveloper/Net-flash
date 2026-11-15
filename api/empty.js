/**
 * NetFlash — Vercel API Route: /api/empty
 * Endpoint per test Upload (assorbe dati POST) e Ping (risposta vuota istantanea).
 *
 * IMPORTANTE: Il ping risponde SUBITO dall'edge Vercel — nessun relay esterno.
 * Questo garantisce latenza reale utente → Vercel, non rallentata da hop aggiuntivi.
 * L'upload assorbe lo stream e risponde OK senza blocchi.
 */

export const config = {
  maxDuration: 30,
  api: {
    bodyParser: false
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
    // Upload test: assorbi lo stream e rispondi immediatamente OK
    // Non fare relay a server esterni — causerebbe latenza e possibili blocchi
    req.on('data', () => {}); // consuma i dati senza accumularli in memoria
    req.on('end', () => {
      res.status(200).end('');
    });
    req.on('error', () => {
      res.status(200).end('');
    });
    return;
  }

  // GET: risposta vuota immediata dall'edge Vercel per ping reale
  // Misura la latenza utente → nodo Vercel più vicino (es. Milano, Parigi, Zurigo)
  res.status(200).end('');
}
