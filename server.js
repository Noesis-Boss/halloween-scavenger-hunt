import http from 'node:http';
import https from 'node:https';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const MAX_BODY = 64 * 1024;

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export function createRequestHandler(stateFile = path.join(root, 'data', 'state.json')) {
  let state = { clues: null, teams: null, alerts: [], updatedAt: 0 };

  async function loadState() {
    if (existsSync(stateFile)) {
      try {
        state = JSON.parse(await readFile(stateFile, 'utf8'));
      } catch {}
    }
  }

  async function persistState() {
    state.updatedAt = Date.now();
    await mkdir(path.dirname(stateFile), { recursive: true });
    await writeFile(stateFile, JSON.stringify(state, null, 2));
  }

  const ready = loadState();

  return async (req, res) => {
    await ready;
    try {
      const url = new URL(req.url, 'http://localhost');

      if (req.method === 'GET' && url.pathname === '/api/state') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(state));
      }

      if (req.method === 'POST' && url.pathname === '/api/state') {
        const data = await readJson(req);
        if (!Array.isArray(data.clues) || !Array.isArray(data.teams) || !Array.isArray(data.alerts)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid state payload' }));
        }
        state.clues = data.clues;
        state.teams = data.teams;
        state.alerts = data.alerts.slice(0, 100);
        await persistState();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, updatedAt: state.updatedAt }));
      }

      if (req.method === 'GET' && url.pathname === '/api/alerts') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify({ alerts: state.alerts }));
      }

      if (req.method === 'POST' && url.pathname === '/api/hunt-complete') {
        const data = await readJson(req);
        if (!data.teamName || typeof data.teamName !== 'string' || typeof data.score !== 'number') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid alert payload' }));
        }
        const entry = {
          id: String(data.id || `alert-${Date.now()}`),
          teamName: data.teamName.slice(0, 80),
          score: data.score,
          message: String(data.message || `${data.teamName} finished!`).slice(0, 240),
          timestamp: Number(data.timestamp) || Date.now(),
          viewed: false
        };
        if (!state.alerts.some(a => a.id === entry.id)) {
          state.alerts.unshift(entry);
          if (state.alerts.length > 100) state.alerts.pop();
          await persistState();
        }

        if (process.env.WEBHOOK_URL) {
          fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
          }).catch(() => {});
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'DELIVERED_HTTP_200', alert: entry }));
      }

      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        const html = await readFile(path.join(root, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(html);
      }

      if (req.method === 'GET' && url.pathname === '/print.html') {
        const html = await readFile(path.join(root, 'print.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(html);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad request' }));
    }
  };
}

export function createAppServer(stateFile) {
  return http.createServer(createRequestHandler(stateFile));
}

async function ensureTlsCert(certDir = path.join(root, 'data')) {
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');
  if (!existsSync(keyPath) || !existsSync(certPath)) {
    await mkdir(certDir, { recursive: true });
    execFileSync('openssl', [
      'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
      '-keyout', keyPath, '-out', certPath,
      '-days', '365', '-subj', '/CN=spookhunt.local'
    ], { stdio: 'ignore' });
  }
  return { key: readFileSync(keyPath), cert: readFileSync(certPath) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const httpsPort = Number(process.env.HTTPS_PORT || 3443);
  const handler = createRequestHandler();

  http.createServer(handler).listen(port, '0.0.0.0', () => {
    console.log(`SpookHunt HTTP  running at http://localhost:${port}`);
  });

  ensureTlsCert().then(tlsOpts => {
    https.createServer(tlsOpts, handler).listen(httpsPort, '0.0.0.0', () => {
      console.log(`SpookHunt HTTPS running at https://0.0.0.0:${httpsPort} (live phone camera QR enabled)`);
    });
  }).catch(() => {});
}
