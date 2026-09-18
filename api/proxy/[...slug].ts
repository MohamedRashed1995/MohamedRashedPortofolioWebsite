// api/proxy/[...slug].ts
const PROD_BACKEND_URL = 'https://mohamedrashedportofolio.runasp.net';

// Minimal Node-style request/response shapes for Vercel serverless runtime.
// Self-contained to avoid requiring @vercel/node dependency.
interface MinimalRequest {
  url?: string;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface MinimalResponse {
  status(code: number): MinimalResponse;
  setHeader(name: string, value: string): MinimalResponse;
  json(body: unknown): void;
  send(body: unknown): void;
  end(body?: unknown): void;
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  try {
    // 1. Determine upstream path and query string
    let upstreamPath = '';
    const rawUrl = req.url || '';

    if (rawUrl.includes('/api/proxy')) {
      const parsed = new URL(rawUrl, PROD_BACKEND_URL);
      const subPath = parsed.pathname.replace(/^\/api\/proxy\/?/, '');
      const cleanSubPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
      upstreamPath = `/api${cleanSubPath}${parsed.search}`;
    } else if (req.query?.slug) {
      const slugParts = Array.isArray(req.query.slug) ? req.query.slug : [req.query.slug];
      const subPath = slugParts.join('/');
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(req.query)) {
        if (key === 'slug' || value === undefined) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
      const queryString = searchParams.toString();
      upstreamPath = `/api/${subPath}${queryString ? `?${queryString}` : ''}`;
    } else {
      const searchIndex = rawUrl.indexOf('?');
      const search = searchIndex !== -1 ? rawUrl.substring(searchIndex) : '';
      upstreamPath = `/api/v1/projects${search}`;
    }

    const upstreamUrl = `${PROD_BACKEND_URL}${upstreamPath}`;

    // 2. Prepare headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (auth) {
      headers['Authorization'] = Array.isArray(auth) ? auth[0] : auth;
    }

    const contentType = req.headers['content-type'] || req.headers['Content-Type'];
    if (contentType) {
      headers['Content-Type'] = Array.isArray(contentType) ? contentType[0] : contentType;
    }

    // 3. Prepare body for write requests
    let body: string | undefined = undefined;
    const method = (req.method || 'GET').toUpperCase();

    if (method !== 'GET' && method !== 'HEAD') {
      if (req.body !== undefined && req.body !== null) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(req.body)) {
          body = req.body.toString('utf-8');
        } else {
          body = JSON.stringify(req.body);
        }
      } else if (typeof (req as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === 'function') {
        const chunks: Uint8Array[] = [];
        for await (const chunk of req as AsyncIterable<Uint8Array | string>) {
          if (typeof chunk === 'string') {
            chunks.push(new TextEncoder().encode(chunk));
          } else {
            chunks.push(chunk);
          }
        }
        if (chunks.length > 0) {
          const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
          const combined = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }
          body = new TextDecoder().decode(combined);
        }
      }
    }

    // 4. Server-to-server request to MonsterASP backend
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body,
    });

    const statusCode = upstreamResponse.status;
    const responseContentType = upstreamResponse.headers.get('content-type') || '';

    if (statusCode === 204) {
      res.status(204).end();
      return;
    }

    if (responseContentType.includes('application/json')) {
      const data = await upstreamResponse.json();
      res.status(statusCode).json(data);
    } else {
      const text = await upstreamResponse.text();
      res.status(statusCode).send(text);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upstream request failed';
    res.status(502).json({ error: 'Bad Gateway', message });
  }
}
