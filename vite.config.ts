import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
    plugins: [react()],
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
