// api/proxy/[...slug].ts

const PROD_BACKEND_URL =
  'https://mohamedrashedportofolio.runasp.net';

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
  const value =
    headers[name] ??
    headers[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === 'string'
    ? value
    : undefined;
}

function setCorsHeaders(
  req: MinimalRequest,
  res: MinimalResponse,
): void {
  const origin = getHeader(
    req.headers,
    'origin',
  );

  if (origin) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      origin,
    );
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

  res.setHeader(
    'Access-Control-Expose-Headers',
    'X-Proxy-By, X-Upstream-Status, X-Upstream-Method, X-Upstream-Path',
  );

  res.setHeader(
    'Access-Control-Max-Age',
    '86400',
  );
}

function resolveSubPath(
  req: MinimalRequest,
  parsedUrl: URL,
): string | null {
  const proxyPrefix = '/api/proxy';

  let subPath = '';

  if (
    parsedUrl.pathname.startsWith(
      proxyPrefix,
    )
  ) {
    subPath =
      parsedUrl.pathname.slice(
        proxyPrefix.length,
      );
  }

  if (!subPath && req.query?.slug) {
    const slugValue = Array.isArray(
      req.query.slug,
    )
      ? req.query.slug
      : [req.query.slug];

    subPath = `/${slugValue.join('/')}`;
  }

  subPath = subPath
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/');

  while (subPath.startsWith('api/')) {
    subPath = subPath
      .slice(4)
      .replace(/^\/+/, '');
  }

  return subPath || null;
}

function buildQueryString(
  req: MinimalRequest,
  parsedUrl: URL,
): string {
  const params = new URLSearchParams(
    parsedUrl.search,
  );

  params.delete('slug');

  if (req.query) {
    for (const [key, value] of Object.entries(
      req.query,
    )) {
      if (
        key === 'slug' ||
        value === undefined ||
        params.has(key)
      ) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(key, item);
        }
      } else {
        params.append(key, value);
      }
    }
  }

  const query =
    params.toString();

  return query
    ? `?${query}`
    : '';
}

function buildRequestBody(
  req: MinimalRequest,
  method: string,
): string | undefined {
  if (
    method === 'GET' ||
    method === 'HEAD' ||
    method === 'OPTIONS'
  ) {
    return undefined;
  }

  if (
    req.body === undefined ||
    req.body === null
  ) {
    return undefined;
  }

  if (typeof req.body === 'string') {
    return req.body || undefined;
  }

  return JSON.stringify(req.body);
}

export default async function handler(
  req: MinimalRequest,
  res: MinimalResponse,
) {
  setCorsHeaders(req, res);

  const method =
    (req.method || 'GET').toUpperCase();

  // Handle browser preflight locally.
  // Never forward OPTIONS to MonsterASP.
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const parsedUrl =
      new URL(
        req.url || '',
        'https://vercel.local',
      );

    const subPath =
      resolveSubPath(
        req,
        parsedUrl,
      );

    if (!subPath) {
      res.status(404).json({
        proxyError: 'InvalidProxyPath',
        message: 'Invalid proxy path.',
      });
      return;
    }

    const queryString =
      buildQueryString(
        req,
        parsedUrl,
      );

    const upstreamPath =
      `/api/${subPath}${queryString}`;

    const upstreamUrl =
      `${PROD_BACKEND_URL}${upstreamPath}`;

    const headers: Record<
      string,
      string
    > = {
      Accept:
        getHeader(
          req.headers,
          'accept',
        ) || 'application/json',
    };

    const authorization =
      getHeader(
        req.headers,
        'authorization',
      );

    if (authorization) {
      headers.Authorization =
        authorization;
    }

    const contentType =
      getHeader(
        req.headers,
        'content-type',
      );

    if (contentType) {
      headers['Content-Type'] =
        contentType;
    }

    const userAgent =
      getHeader(
        req.headers,
        'user-agent',
      );

    if (userAgent) {
      headers['User-Agent'] =
        userAgent;
    }

    const body =
      buildRequestBody(
        req,
        method,
      );

    if (
      body !== undefined &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] =
        'application/json';
    }

    let upstreamResponse: Response;

    try {
      upstreamResponse =
        await fetch(
          upstreamUrl,
          {
            method,
            headers,
            body,
          },
        );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to reach upstream backend.';

      res.setHeader(
        'X-Proxy-By',
        'Vercel-Proxy',
      );

      res.setHeader(
        'X-Upstream-Method',
        method,
      );

      res.setHeader(
        'X-Upstream-Path',
        upstreamPath,
      );

      res.status(502).json({
        proxyError:
          'UpstreamUnreachable',
        method,
        upstreamPath,
        message,
      });

      return;
    }

    const statusCode =
      upstreamResponse.status;

    const responseContentType =
      upstreamResponse.headers.get(
        'content-type',
      ) || '';

    // Diagnostics
    res.setHeader(
      'X-Proxy-By',
      'Vercel-Proxy',
    );

    res.setHeader(
      'X-Upstream-Status',
      String(statusCode),
    );

    res.setHeader(
      'X-Upstream-Method',
      method,
    );

    res.setHeader(
      'X-Upstream-Path',
      upstreamPath,
    );

    if (statusCode === 204) {
      res.status(204).end();
      return;
    }

    if (
      responseContentType.includes(
        'application/json',
      )
    ) {
      const data =
        await upstreamResponse
          .json()
          .catch(() => null);

      res.status(statusCode).json(data);
      return;
    }

    const text =
      await upstreamResponse.text();

    res.status(statusCode).send(text);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Proxy execution failed.';

    res.status(502).json({
      proxyError:
        'ProxyExecutionFailure',
      message,
    });
  }
}
