# America Cardozo CRM

CRM profesional para gestión de leads, propiedades, clientes y visitas en bienes raíces.

## 🚀 Deployment en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "Add New Project"
4. Importa el repositorio: `agentbotdev/america-cardozo-crm`
5. Configura las **variables de entorno**:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase
   - `VITE_TOKKO_API_KEY`: Tu API Key de Tokko
6. Haz clic en "Deploy"

### Opción 2: Deploy desde la CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer deploy
vercel

# Para producción
vercel --prod
```

## 🔧 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_TOKKO_API_KEY=tu_tokko_api_key
```

## 📦 Instalación Local

```bash
npm install
npm run dev
```

## 🏗️ Build para Producción

```bash
npm run build
npm run preview
```

## 🌐 URL del Repositorio

https://github.com/agentbotdev/america-cardozo-crm

---

**Desarrollado con React + Vite + TypeScript + Supabase**
