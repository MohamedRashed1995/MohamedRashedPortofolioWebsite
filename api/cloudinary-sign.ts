import crypto from 'crypto';

// Minimal Node-style request/response shapes for the Vercel serverless runtime.
// Kept local so this function does not require the @vercel/node types package.
type SignResponseBody = Record<string, string | number>;

interface MinimalRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface MinimalResponse {
  status(code: number): {
    json(body: SignResponseBody | { error: string }): void;
  };
}

function getHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  name: string
): string | undefined {
  if (!headers) return undefined;
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
}

function verifyJwtLocally(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    if (signatureB64 !== expectedSig) return false;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

async function verifyTokenWithBackend(authHeader: string): Promise<boolean> {
  try {
    const backendTarget =
      process.env.VITE_BACKEND_URL ||
      (process.env.VITE_API_BASE_URL && !process.env.VITE_API_BASE_URL.includes('localhost')
        ? process.env.VITE_API_BASE_URL
        : 'https://mohamedrashedportofolio.runasp.net');
    const verifyUrl = `${backendTarget.replace(/\/+$/, '')}/api/v1/admin/inquiries`;
    const checkRes = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });
    return checkRes.ok;
  } catch {
    return false;
  }
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = getHeader(req.headers, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token missing.' });
    return;
  }

  let isValid = false;
  const jwtSecret = process.env.Jwt__Secret || process.env.JWT_SECRET;
  if (jwtSecret) {
    isValid = verifyJwtLocally(token, jwtSecret);
  }

  if (!isValid) {
    isValid = await verifyTokenWithBackend(authHeader);
  }

  if (!isValid) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired admin token.' });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ error: 'Cloudinary env vars missing' });
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

  res.status(200).json({ signature, timestamp, apiKey, cloudName, publicId, invalidate });
}