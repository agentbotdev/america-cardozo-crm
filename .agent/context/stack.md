# Stack Técnico — America Cardozo CRM

## Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI Library |
| TypeScript | 5.x | Tipado estricto |
| Vite | 5.x | Build tool + dev server |
| Tailwind CSS | 3.x | Estilos base |
| Framer Motion | 11.x | Animaciones premium |
| React Router DOM | 6.x | Routing (HashRouter) |
| Lucide React | latest | Iconos |
| Recharts | 2.x | Gráficos SOLO aquí, no agregar otra lib |

## Backend / Servicios
| Tecnología | Uso |
|---|---|
| Supabase | Auth + PostgreSQL + Realtime + Storage + Edge Functions |
| OpenAI API | AI features (via `services/openaiService.ts`) |
| Evolution API | WhatsApp Business |
| N8N | Automatización + Agentes IA |
| Tokko Broker API | CRM inmobiliario externo |
| Google Calendar API | Calendarios de vendedores |

## Estructura de `src/`
```
src/
├── pages/           ← 11 páginas (Dashboard, Properties, Leads, Visits, ...)
├── components/      ← AppLayout, Sidebar, etc.
├── services/        ← openaiService.ts, supabaseClient.ts, googleCalendarService.ts
├── context/         ← (crear) AuthContext.tsx
├── hooks/           ← (crear) useProperties, useLeads, useVisits
├── stores/          ← (crear) useCRMStore.ts con Zustand
├── types.ts         ← TODOS los tipos del dominio — no duplicar aquí
├── constants.ts     ← Mock data (reemplazar progresivamente con Supabase)
└── App.tsx          ← Router principal + layouts
```

## Variables de Entorno (`.env.local`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY=
VITE_GEMINI_API_KEY=          ← mover de geminiService.ts
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=
# VITE_GOOGLE_CLIENT_SECRET  ← NO va aquí, va en Edge Function
```

## Comandos
```bash
npm run dev          # dev server en localhost:5173
npm run build        # build de producción
npm run preview      # preview del build
```

## Decisión: ¿Por qué HashRouter?
Se usa `HashRouter` (URLs con #) en lugar de `BrowserRouter`.
- Permite desplegar en cualquier hosting estático sin configurar el servidor
- Desventaja: no funciona bien con SSR, SEO limitado
- **No cambiar** a menos que se migre a Next.js en Sprint futuro

## Decisión: Gemini vs OpenAI
- `geminiService.ts` es DUPLICADO de `openaiService.ts` → eliminar
- Quedarse solo con OpenAI para tener un solo punto de control de AI
