import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import crypto from 'node:crypto';

const backendTarget =
  process.env.VITE_BACKEND_URL ||
  (process.env.VITE_API_BASE_URL && !process.env.VITE_API_BASE_URL.includes('localhost')
    ? process.env.VITE_API_BASE_URL
    : 'https://mohamedrashedportofolio.runasp.net');

function backendProxyPlugin(): Plugin {
  return {
    name: 'backend-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        if (req.url.startsWith('/api/cloudinary-sign')) {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'wcdjihwt';
          const apiKey = process.env.CLOUDINARY_API_KEY;
          const apiSecret = process.env.CLOUDINARY_API_SECRET;

          if (!cloudName || !apiKey || !apiSecret) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Cloudinary environment variables missing (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).' }));
            return;
          }

          const timestamp = Math.floor(Date.now() / 1000);
          const publicId = 'portfolio_profile_avatar';
          const invalidate = 'true';

          const paramsToSign: Record<string, string | number> = {
            invalidate,
            public_id: publicId,
            timestamp,
          };

          const signatureString = Object.keys(paramsToSign)
            .sort()
            .map((k) => `${k}=${paramsToSign[k]}`)
            .join('&');

          const signature = crypto
            .createHash('sha1')
            .update(signatureString + apiSecret)
            .digest('hex');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ signature, timestamp, apiKey, cloudName, publicId, invalidate }));
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
          res.setHeader('Access-Control-Max-Age', '86400');
          res.end();
          return;
        }

        const cleanBase = backendTarget.replace(/\/+$/, '');
        let targetPath = req.url || '';

        // Strip /api/proxy prefix to /api so that /api/proxy/v1/... maps to /api/v1/...
        if (targetPath.startsWith('/api/proxy/api/')) {
          targetPath = '/api/' + targetPath.slice('/api/proxy/api/'.length).replace(/^\/+/, '');
        } else if (targetPath.startsWith('/api/proxy/')) {
          targetPath = '/api/' + targetPath.slice('/api/proxy/'.length).replace(/^\/+/, '');
        } else if (targetPath === '/api/proxy') {
          targetPath = '/api';
        }

        // Collapse duplicate slashes in the path portion while preserving query string
        const [pPart, ...qParts] = targetPath.split('?');
        const cleanPPart = pPart.replace(/\/+/g, '/');
        const qPart = qParts.length > 0 ? `?${qParts.join('?')}` : '';
        targetPath = `${cleanPPart}${qPart}`;

        const targetUrl = `${cleanBase}${targetPath}`;

        (async () => {
          try {
            const headers: Record<string, string> = {};
            for (const [key, val] of Object.entries(req.headers)) {
              const lower = key.toLowerCase();
              if (lower !== 'host' && lower !== 'connection' && lower !== 'content-length' && typeof val === 'string') {
                headers[key] = val;
              }
            }

            const init: RequestInit = {
              method: req.method,
              headers,
            };

            if (req.method !== 'GET' && req.method !== 'HEAD') {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }
              if (chunks.length > 0) {
                init.body = Buffer.concat(chunks);
              }
            }

            const response = await fetch(targetUrl, init);
            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              if (key.toLowerCase() !== 'content-encoding') {
                res.setHeader(key, value);
              }
            });
            const arrayBuffer = await response.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err: unknown) {
            const cause = (err as { cause?: Error })?.cause;
            const message = err instanceof Error ? `${err.message} (${cause?.message || cause || ''})` : String(err);
            console.error('[backend-proxy-error]:', err);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: message }));
          }
        })();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), backendProxyPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
