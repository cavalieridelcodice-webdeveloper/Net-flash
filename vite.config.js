import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import https from 'https';

// Plugin middleware che fornisce gli endpoint nativi LibreSpeed reali durante lo sviluppo
function libreSpeedDevPlugin() {
  // Pre-allochiamo 1MB di dati pseudocasuali per streaming ad alta efficienza (test locale)
  const randomChunk = crypto.randomBytes(1024 * 1024);

  // Agent HTTPS ad altissime prestazioni per evitare colli di bottiglia TCP
  const highPerfAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 50,
    timeout: 30000
  });

  // Helper per chiamate esterne WAN con streaming multi-chunk
  const fetchWanStream = (targetUrl, clientRes, reqTimeout = 15000) => {
    const parsed = new URL(targetUrl);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: `${parsed.pathname}${parsed.search}`,
      method: 'GET',
      agent: highPerfAgent,
      headers: {
        'User-Agent': 'NetFlash-SpeedEngine/2.0',
        'Accept': '*/*'
      },
      timeout: reqTimeout
    };

    const extReq = https.request(options, (extRes) => {
      clientRes.statusCode = extRes.statusCode || 200;
      clientRes.setHeader('Content-Type', extRes.headers['content-type'] || 'application/octet-stream');
      clientRes.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      extRes.pipe(clientRes);
    });

    extReq.on('timeout', () => {
      extReq.destroy();
      if (!clientRes.headersSent) {
        clientRes.statusCode = 504;
        clientRes.end('WAN Gateway Timeout');
      }
    });

    extReq.on('error', (err) => {
      console.warn('Errore proxy WAN relay:', err.message);
      if (!clientRes.headersSent) {
        clientRes.statusCode = 502;
        clientRes.end('WAN Relay Error');
      }
    });

    extReq.end();
  };

  return {
    name: 'librespeed-dev-backend',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // CORS headers universali
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        // ==========================================
        // 1. ENDPOINT WAN RELAY (INTERNET REALE AD ALTO THROUGHPUT)
        // ==========================================
        if (url === '/api/wan/empty') {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

          if (req.method === 'POST') {
            const extReq = https.request({
              hostname: 'st-be-bo1.infra.garr.it',
              port: 443,
              path: '/empty.php?cors=true',
              method: 'POST',
              agent: highPerfAgent,
              headers: {
                'Content-Type': 'application/octet-stream',
                'Connection': 'keep-alive'
              },
              timeout: 15000
            }, (extRes) => {
              extRes.on('data', () => {});
              extRes.on('end', () => {
                res.statusCode = 200;
                res.end('OK');
              });
            });

            extReq.on('error', () => {
              // Fallback se GARR ha ritardi: assorbi lo stream per non bloccare
              req.on('data', () => {});
              req.on('end', () => {
                res.statusCode = 200;
                res.end('OK');
              });
            });

            req.pipe(extReq);
            return;
          }

          // Ping reale a nodo nazionale a bassa latenza (Bologna GARR)
          const startPing = Date.now();
          const pingReq = https.request({
            hostname: 'st-be-bo1.infra.garr.it',
            port: 443,
            path: '/empty.php?cors=true',
            method: 'GET',
            agent: highPerfAgent,
            timeout: 5000
          }, () => {
            res.statusCode = 200;
            res.setHeader('X-Latency-Ms', String(Date.now() - startPing));
            res.end('');
          });

          pingReq.on('error', () => {
            res.statusCode = 200;
            res.end('');
          });

          pingReq.end();
          return;
        }

        if (url === '/api/wan/garbage') {
          const searchParams = new URL(req.url, 'http://localhost').searchParams;
          const chunks = searchParams.get('ckSize') || '50';
          // Scarica dati reali dal nodo italiano GARR a bassa latenza
          const target = `https://st-be-bo1.infra.garr.it/garbage.php?cors=true&ckSize=${chunks}&r=${Math.random()}`;
          fetchWanStream(target, res);
          return;
        }

        if (url === '/api/wan/getIP') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

          // Rileva dinamicamente QUALSIASI gestore (Fastweb, TIM, Vodafone, Iliad, WindTre, ecc.)
          const ipReq = https.get('https://ipwho.is/', { timeout: 4000 }, (ipRes) => {
            let body = '';
            ipRes.on('data', (d) => { body += d; });
            ipRes.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const publicIp = parsed.ip || 'Rete Internet';
                const ispName = parsed.connection?.isp || parsed.connection?.org || 'Gestore Rete';
                const city = parsed.city ? `(${parsed.city})` : '';

                res.statusCode = 200;
                res.end(JSON.stringify({
                  processedString: `${publicIp} - ${ispName} ${city}`,
                  rawIspInfo: {
                    ip: publicIp,
                    isp: ispName,
                    org: parsed.connection?.org || ispName,
                    city: parsed.city || '',
                    country: parsed.country || 'Italia'
                  }
                }));
              } catch {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  processedString: 'Connessione Internet Rilevata',
                  rawIspInfo: { ip: '', isp: 'Rete Internet' }
                }));
              }
            });
          });

          ipReq.on('error', () => {
            res.statusCode = 200;
            res.end(JSON.stringify({
              processedString: 'Connessione Internet Rilevata',
              rawIspInfo: { ip: '', isp: 'Rete Internet' }
            }));
          });
          return;
        }

        // ==========================================
        // 2. ENDPOINT TEST LOCALE (LOOPBACK MAC RAM)
        // ==========================================
        if (url === '/api/empty' || url.endsWith('/empty.php')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          if (req.method === 'POST') {
            req.on('data', () => {});
            req.on('end', () => {
              res.statusCode = 200;
              res.end('OK');
            });
            return;
          }

          res.statusCode = 200;
          res.end('');
          return;
        }

        if (url === '/api/garbage' || url.endsWith('/garbage.php')) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Content-Disposition', 'attachment; filename=random.dat');

          const searchParams = new URL(req.url, 'http://localhost').searchParams;
          const chunksToSend = Math.max(1, Math.min(100, parseInt(searchParams.get('ckSize') || '50', 10)));

          let sent = 0;
          const sendChunk = () => {
            if (sent >= chunksToSend || res.writableEnded || res.destroyed) {
              if (!res.writableEnded) res.end();
              return;
            }
            const canContinue = res.write(randomChunk);
            sent++;
            if (canContinue) {
              setImmediate(sendChunk);
            } else {
              res.once('drain', sendChunk);
            }
          };

          sendChunk();
          return;
        }

        if (url === '/api/getIP' || url.endsWith('/getIP.php')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

          const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
          const payload = {
            processedString: `${clientIp} - Test Locale (Loopback Mac)`,
            rawIspInfo: {
              ip: clientIp,
              isp: 'Loopback Interno',
              org: 'Mac Memory Bus',
              country: 'Local Network'
            }
          };
          res.statusCode = 200;
          res.end(JSON.stringify(payload));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), libreSpeedDevPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
