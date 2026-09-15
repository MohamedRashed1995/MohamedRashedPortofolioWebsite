import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const backendTarget =
  process.env.VITE_BACKEND_URL ||
  (process.env.VITE_API_BASE_URL && !process.env.VITE_API_BASE_URL.includes('localhost')
    ? process.env.VITE_API_BASE_URL
    : 'http://mohamedrashedportofolio.runasp.net');

function backendProxyPlugin(): Plugin {
  return {
    name: 'backend-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const cleanBase = backendTarget.replace(/\/+$/, '');
        const targetUrl = `${cleanBase}${req.url}`;

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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
