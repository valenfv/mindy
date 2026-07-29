import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BRAND_BACKGROUND = '#faf7f1'
const BRAND_THEME = '#3d6b60'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'splash/*.png',
      ],
      manifest: {
        id: '/',
        name: 'Mindy',
        short_name: 'Mindy',
        description:
          'Diario guiado de pensamientos, emociones y conductas. Tus entradas se guardan únicamente en este dispositivo.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        background_color: BRAND_BACKGROUND,
        theme_color: BRAND_THEME,
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: '/icons/icon-64.png', sizes: '64x64', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // El PDF puede pesar: subimos el límite de precache para el bundle de jsPDF.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Las dependencias cambian mucho menos que la app: en chunks aparte, una
        // actualización de Mindy no invalida su caché en el service worker.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-db': ['dexie', 'dexie-react-hooks'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    alias: {
      // El módulo virtual del service worker no existe en el entorno de tests.
      'virtual:pwa-register/react': path.resolve(
        __dirname,
        './src/test/pwa-register-stub.ts',
      ),
    },
  },
})
