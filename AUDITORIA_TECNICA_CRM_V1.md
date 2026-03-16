# 🔬 AUDITORÍA TÉCNICA: AMERICA CARDOZO CRM
**Fecha:** 10 de Marzo de 2026  
**Auditor:** Antigravity (Advanced Agentic AI)  
**Tipo:** Read-only — Sin modificaciones al código

---

## 📋 RESUMEN EJECUTIVO

| Métrica | Valor |
|:---|:---|
| **Stack** | Vite 6 + React 19 + TypeScript 5.8 |
| **UI** | Vanilla CSS + Framer Motion + Lucide + Recharts |
| **Backend** | Supabase (PostgreSQL) |
| **IA Integrada** | Gemini 1.5 Flash + OpenAI GPT-3.5 |
| **Calendarios** | Google Calendar OAuth 2.0 |
| **Páginas** | 11 (Dashboard, Propiedades, Leads, Clientes, Visitas, Reportes, PerformanceIA, Metrics, LiveChat, Soporte, Configuración) |
| **Servicios** | 11 (`propertiesService`, `leadsService`, `visitsService`, `googleCalendarService`, `geminiService`, `openaiService`, `developmentsService`, `dashboardService`, `mcpService`, `storageService`, `supabaseClient`) |
| **Bugs Críticos** | 3 |
| **Bugs Moderados** | 5 |
| **Mejoras Sugeridas** | 8 |

---

## 1. 🏗️ ARQUITECTURA GENERAL

```
america-cardozo-crm/
├── App.tsx               ← Router HashRouter con 11 rutas
├── types.ts              ← Tipos globales (Property, Lead, Visit, Client...)
├── constants.ts          ← Mock data (solo 2 propiedades, 1 lead)
├── components/
│   ├── AppLayout.tsx     ← Shell con sidebar, header, notificaciones
│   ├── PropertySearch.tsx← Buscador NL via IA (28KB — archivo muy grande)
│   ├── OrbitalMenu.tsx   ← Menú orbital animado
│   └── OptimizedImage.tsx← Componente de imagen con lazy loading
├── pages/                ← 11 páginas de la app
└── services/             ← 11 servicios de lógica de negocio
```

**Evaluación de arquitectura:** ⭐⭐⭐⭐ — Estructura clara y separación de responsabilidades bien definida. El patrón de Service Layer está correctamente implementado. Sin embargo, falta estado global (Zustand o Context) — cada página carga sus propios datos, sin compartir.

---

## 2. 🗃️ BASE DE DATOS (Supabase)

### Tablas en schema.sql:
| Tabla | PK | Registros | Índices |
|:---|:---|:---|:---|
| `propiedades` | `TEXT` | — | 4 (estado, tipo_op, barrio, precio_venta) |
| `fotos` | `UUID` | — | 1 (propiedad_id) |
| `leads` | `UUID` | — | 4 (temperatura, etapa, score, created_at) |
| `visitas` | `UUID` | — | 4 (lead_id, propiedad_id, fecha, estado) |

### ❌ Tablas FALTANTES en schema.sql (referenciadas en el código):
| Tabla | Referenciada en | Descripción |
|:---|:---|:---|
| `google_tokens` | `googleCalendarService.ts` | Tokens OAuth de Google Calendar por usuario |
| `leads_history` | `leadsService.ts` | Historial de acciones en un lead |
| `messages` | `leadsService.ts` | Mensajes de WhatsApp/chat por lead |
| `emprendimientos` | `developmentsService.ts` | Emprendimientos/desarrollos inmobiliarios |
| `profiles` | Mencionado en types.ts | Perfiles de usuario con roles |

> ⚠️ **Riesgo:** Si se ejecuta `schema.sql` tal como está, estas 5 tablas no existen en producción y **el código rompe silenciosamente** (los servicios devuelven arrays vacíos pero no lanzan error).

### Inconsistencias de Naming DB ↔ TypeScript:
| Campo en DB | Campo en TypeScript | Servicio que traduce |
|:---|:---|:---|
| `temperatura` | `estado_temperatura` | `leadsService.ts` |
| `etapa` | `etapa_proceso` | `leadsService.ts` |
| `banos` | `banos_completos` | `propertiesService.ts` |
| `superficie_cubierta` | `sup_cubierta` | `propertiesService.ts` |
| `tipo_propiedad` | `tipo` | `propertiesService.ts` |
| `propiedades_recomendadas` | `propiedades_enviadas_ids` | `leadsService.ts` |

> ℹ️ El patrón de mapeo está bien implementado en los servicios, pero es un punto de mantenimiento frágil. Una migración futura podría romper la traducción.

---

## 3. 🔴 BUGS CRÍTICOS

### BUG-001: API Key de Gemini Hardcodeada en Código Fuente
**Archivo:** `services/geminiService.ts:9`  
**Código problemático:**
```typescript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDiSZ_h8h7hCtOqM_mLHLEKhLyxySE5Xrk';
```
**Riesgo:** 🔴 CRÍTICO — La API key está expuesta en el código fuente. Si este repositorio alguna vez se vuelve público (GitHub, etc.), Google la detecta y la revoca automáticamente. Además, cualquier persona que vea el código puede usarla.  
**Fix:** Eliminar el fallback hardcodeado y solo usar la variable de entorno.

### BUG-002: Google Calendar OAuth — Client Secret Expuesto en Frontend
**Archivo:** `services/googleCalendarService.ts:5-6`  
```typescript
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
```
**Riesgo:** 🔴 CRÍTICO — El `CLIENT_SECRET` de OAuth2 **NUNCA debe estar en el frontend**. Vite expone todas las variables `VITE_*` al bundle de JS, lo que significa que cualquier usuario puede ver el secret en DevTools → Sources. El exchange de código por token debe hacerse en un backend (Edge Function de Supabase o n8n webhook).  
**Fix:** Crear una Supabase Edge Function (`google-oauth-callback`) que maneje el exchange del token de forma segura.

### BUG-003: RLS (Row Level Security) Deshabilitado en Producción
**Archivo:** `supabase/schema.sql:269-277`
```sql
-- ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
-- (todo comentado)
```
**Riesgo:** 🔴 CRÍTICO — Sin RLS, cualquier usuario con la `anon key` de Supabase puede leer/escribir **todos** los datos de todas las tablas. La anon key es pública por diseño en el frontend.  
**Fix:** Habilitar RLS en todas las tablas y crear policies según el rol del usuario (`admin`, `vendedor`, `readonly`).

---

## 4. 🟡 BUGS MODERADOS

### BUG-004: Dos Servicios Hacen lo Mismo (Gemini + OpenAI)
Los archivos `geminiService.ts` y `openaiService.ts` implementan exactamente las mismas 3 funciones:
- `searchPropertiesByChatbot()`
- `enhancePropertyTitle()`
- `enhancePropertyDescription()`

En `PropertySearch.tsx` se usa `openaiService`, mientras que `geminiService` podría estar siendo importado en otro lado. Esto genera confusión sobre qué IA se está usando.  
**Fix:** Crear un único `aiService.ts` que use la implementación que se decida (OpenAI, actualmente más robusta), y eliminar el duplicado.

### BUG-005: `PropertySearch.tsx` es un God Component (28KB)
Un solo componente de 28KB es una señal clara de que tiene demasiadas responsabilidades: filtrando, mostrando, editando propiedades, y además manejar el chat con IA.  
**Fix:** Dividir en: `PropertyFilters`, `PropertyCard`, `PropertyDetail`, `PropertyChat`.

### BUG-006: Cache en Memoria se Pierde al Recargar
`propertiesService.ts` y `leadsService.ts` usan una variable `let cache` en memoria de módulo con 30 segundos de TTL. Esto funciona, pero se pierde en cada recarga. En una app con varios vendedores concurrentes, cada uno tiene su propia caché desincronizada.  
**Mejora:** Usar Supabase Realtime subscriptions en lugar de caché in-memory para tener actualizaciones en vivo.

### BUG-007: `constants.ts` Mezcla Mock Data con Constantes Reales
El archivo exporta `MOCK_PROPERTIES`, `MOCK_LEADS`, etc. junto con tipos y constantes reales. En producción, si algún componente importa accidentalmente estos mocks en lugar del servicio real, muestra datos falsos al usuario.  
**Fix:** Mover los mocks a `__tests__/fixtures/` o a un archivo `constants.mock.ts`.

### BUG-008: `developmentsService.ts` Referencia Tabla `emprendimientos` Sin Schema
La tabla `emprendimientos` no existe en `schema.sql`. Todos los llamados a `developmentsService` van a fallar silenciosamente en producción.  
**Fix:** Agregar el schema de `emprendimientos` al SQL.

---

## 5. 🟢 FORTALEZAS DEL CRM

✅ **Types exhaustivos** — El archivo `types.ts` está muy bien definido. 292 líneas con todas las entidades correctamente tipadas (Property, Lead, Client, Visit, etc.)  
✅ **Pattern de Service Layer** — Toda la lógica de datos está en `/services`, no mezclada con los componentes  
✅ **Google Calendar integrado** — El flujo de OAuth con refresh automático está bien implementado  
✅ **Sistema de cache inteligente** — 30 segundos de TTL con invalidación manual al guardar/eliminar  
✅ **AI Search con fallback** — Si el parser de JSON de IA falla, tiene un fallback robusto  
✅ **Framer Motion para UX** — Animaciones de entrada en las páginas  
✅ **MCP de Chatwoot conectado** — `mcpService.ts` apunta al n8n de Chatwoot de la instancia para métricas en tiempo real  
✅ **Multi-portal de publishing** — El tipo `Property` tiene campos nativos para ZonaProp, ArgenProp, MercadoLibre y Web propia  

---

## 6. 📊 SCORECARD

| Área | Puntuación | Notas |
|:---|:---|:---|
| **Arquitectura** | ⭐⭐⭐⭐ | Buena separación por capas |
| **TypeScript** | ⭐⭐⭐⭐⭐ | Types excelentes, muy completos |
| **Seguridad** | ⭐ | RLS off, secrets en frontend |
| **DB Schema** | ⭐⭐⭐ | 5 tablas faltantes en schema |
| **UX/UI** | ⭐⭐⭐⭐ | Framer, recharts, lucide — buen stack visual |
| **IA Integration** | ⭐⭐⭐ | 2 servicios duplicados, Gemini hardcoded |
| **Performance** | ⭐⭐⭐⭐ | Cache de 30s, lazy images, limit en queries |
| **Escalabilidad** | ⭐⭐ | Sin estado global, sin realtime, sin auth |

---

## 7. 📍 MÓDULOS IDENTIFICADOS (Mapa del Sistema)

```
CRM América Cardozo
│
├── 📊 DASHBOARD              ← KPIs globales + actividad reciente (mcpService)
├── 🏠 PROPIEDADES            ← CRUD completo + upload fotos + AI title/desc
│   └── Estado → portales: [ML, ZonaProp, ArgenProp, Web América]
├── 👥 LEADS                  ← Pipeline kanban + score IA + historial + mensajes WA
├── 🤝 CLIENTES               ← Leads convertidos + tipo (comprador/inquilino/propietario)
├── 📅 VISITAS                ← Agendado/Confirmado/Realizado + Google Calendar sync
├── 📈 REPORTES               ← Gráficos de ventas, leads, conversión
├── 🤖 PERFORMANCE IA         ← Panel de métricas de agentes de Chatwoot (via MCP)
├── 📊 METRICS                ← Métricas detalladas de la cuenta
├── 💬 LIVE CHAT              ← Chat en vivo (probablemente conectado a Chatwoot/WA)
├── 🔧 CONFIGURACIÓN          ← Configurar Google Calendar, APIs, perfil
└── 🎫 SOPORTE                ← Sistema de tickets internos
```

---

## 8. 🎯 PLAN DE ACCIÓN PRIORIZADO

### 🔴 URGENTE (Antes de IR A PRODUCCIÓN)
1. **Eliminar API key hardcodeada** en `geminiService.ts:9`
2. **Mover OAuth exchange a Edge Function** — El CLIENT_SECRET no puede estar en el frontend
3. **Habilitar RLS** en las 4 tablas de producción y crear policies por rol
4. **Agregar tablas faltantes al schema.sql** (google_tokens, leads_history, messages, emprendimientos, profiles)

### 🟡 ESTA SEMANA
5. Unificar `geminiService.ts` y `openaiService.ts` en un único `aiService.ts`
6. Agregar estado global con Zustand para `properties`, `leads`, `visits` (evitar re-fetching al navegar)
7. Implementar Supabase Auth con roles (`admin`, `vendedor`, `readonly`)
8. Dividir `PropertySearch.tsx` (28KB) en subcomponentes

### 🟢 SIGUIENTE ITERACIÓN
9. Implementar Supabase Realtime para actualizaciones en vivo (ideal para equipo de vendedores)
10. Integrar el publicador de portales (ZonaProp API, ArgenProp API, MercadoLibre API)
11. Conectar `Lives Chat` a conversaciones reales de Chatwoot
12. Sistema de notificaciones push para leads nuevos y visitas próximas
