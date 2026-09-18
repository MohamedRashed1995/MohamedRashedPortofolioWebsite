// api/proxy/[...slug].ts

const PROD_BACKEND_URL = 'https://mohamedrashedportofolio.runasp.net';

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

function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function setCorsHeaders(
  req: MinimalRequest,
  res: MinimalResponse,
): void {
  const origin = getHeader(req.headers, 'origin') || '*';

  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, X-Requested-With',
  );

  res.setHeader('Access-Control-Expose-Headers', 'X-Proxy-By, X-Upstream-Status');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(
  req: MinimalRequest,
  res: MinimalResponse,
) {
  setCorsHeaders(req, res);

  const method = (req.method || 'GET').toUpperCase();

  // Handle browser preflight locally.
  // Never forward OPTIONS to MonsterASP.
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const rawUrl = req.url || '';
    const parsedUrl = new URL(rawUrl, 'https://vercel.local');

    const proxyPrefix = '/api/proxy';
    let subPath = '';

    if (parsedUrl.pathname.startsWith(proxyPrefix) && !parsedUrl.pathname.includes('[...slug]')) {
      subPath = parsedUrl.pathname.slice(proxyPrefix.length);
    } else if (req.query?.slug) {
      const slugParts = Array.isArray(req.query.slug) ? req.query.slug : [req.query.slug];
      subPath = slugParts.join('/');
    } else if (parsedUrl.searchParams.has('slug')) {
      const slugParts = parsedUrl.searchParams.getAll('slug');
      subPath = slugParts.join('/');
    }

    let cleanSubPath = subPath.replace(/^\/+/, '');

    // Prevent double /api/ if cleanSubPath starts with api/
    while (cleanSubPath.startsWith('api/')) {
      cleanSubPath = cleanSubPath.slice(4).replace(/^\/+/, '');
    }

    cleanSubPath = cleanSubPath.replace(/\/+/g, '/');

    if (!cleanSubPath) {
      res.status(404).json({ error: 'ProxyError', message: 'Invalid proxy path', upstreamPath: '' });
      return;
    }

    // Preserve query string (excluding Vercel's injected `slug` parameter)
    const searchParams = new URLSearchParams(parsedUrl.search);
    searchParams.delete('slug');

    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (key === 'slug' || value === undefined) continue;
        if (!searchParams.has(key)) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value);
          }
        }
      }
    }

    const qs = searchParams.toString();
    const queryString = qs ? `?${qs}` : '';

    const upstreamPath = `/api/${cleanSubPath}${queryString}`;
    const upstreamUrl = `${PROD_BACKEND_URL}${upstreamPath}`;

    const headers: Record<string, string> = {};

    const accept = getHeader(req.headers, 'accept') || 'application/json';
    headers.Accept = accept;

    const authorization = getHeader(req.headers, 'authorization');
    if (authorization) {
      headers.Authorization = authorization;
    }

    const contentType = getHeader(req.headers, 'content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const userAgent = getHeader(req.headers, 'user-agent') || 'Vercel-Proxy';
    headers['User-Agent'] = userAgent;

    let body: string | undefined;

    if (method !== 'GET' && method !== 'HEAD') {
      if (req.body !== undefined && req.body !== null) {
        if (typeof req.body === 'string') {
          body = req.body.length > 0 ? req.body : undefined;
        } else if (
          typeof req.body === 'object' &&
          Object.keys(req.body as object).length === 0 &&
          method === 'DELETE'
        ) {
          body = undefined;
        } else {
          body = JSON.stringify(req.body);
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
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

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(upstreamUrl, {
        method,
        headers,
        body,
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : 'Network connection failure';
      res.status(502).json({
        proxyError: 'UpstreamUnreachable',
        upstreamUrl,
        upstreamPath,
        message: `Vercel proxy was unable to reach upstream backend: ${msg}`,
      });
      return;
    }

    const statusCode = upstreamResponse.status;
    const responseContentType = upstreamResponse.headers.get('content-type') || '';

    res.setHeader('X-Proxy-By', 'Vercel-Proxy');
    res.setHeader('X-Upstream-Status', String(statusCode));

    if (statusCode === 204) {
      res.status(204).end();
      return;
    }

    if (responseContentType.includes('application/json')) {
      const data = await upstreamResponse.json().catch(() => null);
      res.status(statusCode).json(data);
      return;
    }

    const text = await upstreamResponse.text();

    if (statusCode === 503) {
      res.status(503);
      if (typeof res.json === 'function' && (!text || text.includes('<html>'))) {
        res.json({
          proxyError: 'UpstreamServiceUnavailable',
          upstreamStatus: 503,
          upstreamPath,
          message: 'Upstream MonsterASP/IIS backend returned 503 Service Unavailable.',
          details: text ? text.slice(0, 500) : undefined,
        });
        return;
      }
    }

    if (typeof res.send === 'function') {
      res.status(statusCode).send(text);
    } else {
      res.status(statusCode).end(text);
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Internal proxy execution error';

    res.status(502).json({
      proxyError: 'ProxyExecutionFailure',
      error: 'Bad Gateway',
      message,
    });
  }
}
