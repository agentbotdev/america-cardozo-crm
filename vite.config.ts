import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// SPRINT 0 — BUG-007 CORREGIDO
// Se eliminó el bloque `define` que inyectaba process.env.GEMINI_API_KEY
// en el bundle estático de producción (texto plano visible para cualquier usuario).
//
// REGLA: NUNCA usar el bloque `define` para exponer API keys.
// Las llamadas de IA van a través de Supabase Edge Functions (aiService.ts).
// Las variables VITE_* son públicas por diseño de Vite — no usarlas para secrets.

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'LOGOCORTOAGENT.jpg'],
            manifest: {
                name: 'América Cardozo CRM',
                short_name: 'AC CRM',
                description: 'CRM inmobiliario para América Cardozo',
                theme_color: '#6366f1',
                background_color: '#F8FAFC',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                // SPA: todas las rutas de navegación van a index.html
                navigateFallback: 'index.html',
                // Precachear assets estáticos del build
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        // NetworkFirst para Supabase: CRM con datos en tiempo real.
                        // Intenta red primero; si no responde en 10s cae al cache.
                        // Ideal: datos frescos cuando hay conexión, fallback offline.
                        urlPattern: /^https:\/\/kywossjvyttklegvqgtt\.supabase\.co\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24, // 24 horas
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                            networkTimeoutSeconds: 10,
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false, // No activar SW en dev para no interferir con HMR
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                    'vendor-charts': ['recharts'],
                }
            }
        }
    }
});
