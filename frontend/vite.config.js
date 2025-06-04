import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/india-map-portal2/', // 👈️ Required for GitHub Pages subpath
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/india-map-portal2/', // 👈️ Fix this to match your GitHub repo name
        name: 'India Map GeoPortal',
        short_name: 'GeoPortal',
        description: 'Open-source India map portal with vector layers and interactivity',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/india-map-portal2/', // 👈️ Make sure it starts from repo base
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
