import crypto from 'crypto';

// Minimal Node-style request/response shapes for the Vercel serverless runtime.
// Kept local so this function does not require the @vercel/node types package.
type SignResponseBody = Record<string, string | number>;

interface MinimalRequest {
  method?: string;
}

interface MinimalResponse {
  status(code: number): {
    json(body: SignResponseBody): void;
  };
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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
