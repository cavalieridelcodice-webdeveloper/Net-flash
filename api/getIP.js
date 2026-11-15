/**
 * NetFlash — Vercel API Route: /api/getIP
 * Rileva IP pubblico e ISP dell'utente da qualsiasi gestore (Fastweb, TIM, Iliad, Vodafone, WindTre, ecc.)
 */

import https from 'https';

export const config = {
  maxDuration: 10
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // IP reale dell'utente (Vercel lo passa nell'header x-forwarded-for)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || '';

  // Prova a rilevare ISP da ipwho.is (gratuito, nessuna API key richiesta)
  try {
    const ipData = await new Promise((resolve, reject) => {
      const targetUrl = clientIp
        ? `https://ipwho.is/${clientIp}`
        : 'https://ipwho.is/';

      const req2 = https.get(targetUrl, { timeout: 4000 }, (resp) => {
        let body = '';
        resp.on('data', (d) => { body += d; });
        resp.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch { reject(new Error('parse error')); }
        });
      });
      req2.on('error', reject);
      req2.on('timeout', () => { req2.destroy(); reject(new Error('timeout')); });
    });

    const publicIp = ipData.ip || clientIp || 'IP non rilevato';
    const ispName = ipData.connection?.isp || ipData.connection?.org || ipData.org || 'Gestore Rete';
    const city = ipData.city ? `(${ipData.city})` : '';
    const country = ipData.country || '';

    res.status(200).json({
      processedString: `${publicIp} - ${ispName} ${city}`,
      rawIspInfo: {
        ip: publicIp,
        isp: ispName,
        org: ipData.connection?.org || ispName,
        city: ipData.city || '',
        country
      }
    });
  } catch {
    // Fallback: risponde solo con l'IP senza info ISP
    res.status(200).json({
      processedString: clientIp || 'Connessione Internet',
      rawIspInfo: {
        ip: clientIp || '',
        isp: 'Rilevamento ISP non disponibile',
        org: '',
        city: '',
        country: ''
      }
    });
  }
}
