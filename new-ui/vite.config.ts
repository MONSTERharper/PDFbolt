import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const packageJson = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'package.json'), 'utf-8'),
) as { version: string };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/app/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-192.png', 'pwa-512.png'],
        manifest: {
          name: 'PDFbolt — Online PDF tools',
          short_name: 'PDFbolt',
          description:
            'Merge, split, compress, and convert PDFs online. Files are processed securely and not stored after download.',
          theme_color: '#FF3300',
          background_color: '#E4E3E0',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mjs}'],
          navigateFallback: '/app/index.html',
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: '../src/main/resources/static/app',
      emptyOutDir: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'happy-dom',
      include: ['src/**/*.test.ts'],
      globals: true,
      restoreMocks: true,
      clearMocks: true,
    },
  };
});
