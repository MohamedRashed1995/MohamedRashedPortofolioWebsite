import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { loadEnv, type Plugin } from 'vite';

function injectSocialMetadata(siteUrl: string): Plugin {
  return {
    name: 'inject-social-metadata',
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        const ogImage = await readFile(fileURLToPath(new URL('./public/og-image.jpg', import.meta.url)));
        const version = createHash('sha256').update(ogImage).digest('hex').slice(0, 12);
        const normalizedSiteUrl = siteUrl.replace(/\/$/, '');

        return html
          .replaceAll('__SITE_URL__', normalizedSiteUrl)
          .replaceAll('__OG_IMAGE_VERSION__', version);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredSiteUrl = env.VITE_SITE_URL || process.env.VITE_SITE_URL;
  const vercelUrl = env.VERCEL_URL || process.env.VERCEL_URL;
  const siteUrl = configuredSiteUrl || (vercelUrl ? `https://${vercelUrl}` : 'https://localhost:3000');

  return {
  plugins: [react(), injectSocialMetadata(siteUrl)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
  };
});