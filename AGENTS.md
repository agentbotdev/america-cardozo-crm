# AGENTS.md MULTI-AGENTE — America Cardozo CRM
**Sistema Multi-Agente para CRM Inmobiliario | Versión 2.0**

---

## 🏗️ ARQUITECTURA GENERAL

```
ORQUESTADOR RAÍZ (este archivo)
├── agents/frontend/AGENTS.md   → UX, React, TypeScript, Performance
├── agents/backend/AGENTS.md    → Supabase, Auth, API, Seguridad  
├── agents/ia/AGENTS.md         → N8N, Prompts, Agentes IA
└── agents/integraciones/AGENTS.md → Tokko, Portales, Google APIs
```

---

## 📋 PROTOCOLO DEL ORQUESTADOR

### Cuando recibas una tarea:
1. **Identifica el dominio** usando la tabla de routing
2. **Selecciona máximo 7 skills** del SKILLS_INDEX.md ampliado
3. **Lee el AGENTS.md hijo** del dominio correspondiente
4. **Declara** qué skills y qué hijo vas a usar ANTES de empezar
5. **Ejecuta** la tarea con el contexto del agente hijo

---

## 🗺️ TABLA DE ROUTING

| Si la tarea involucra... | Usar AGENTS.md hijo |
|:---|:---|
| Componentes React, UI, CSS, animaciones, UX | `agents/frontend/` |
| Supabase, SQL, auth, seguridad, API | `agents/backend/` |
| N8N, prompts, agentes IA, WhatsApp, automatización | `agents/ia/` |
| Tokko, Zonaprop, Argenprop, MercadoLibre, Google Calendar | `agents/integraciones/` |
| Bugs que cruzan dominos | Usar 2 agentes en paralelo |
| Deploy, Vercel, CI/CD | `agents/backend/` + skills deployment |

---

## 📁 ESTADO ACTUAL DEL PROYECTO (Actualizar cada sesión)

### Semáforo de Módulos
| Módulo | Estado DB | Estado UI | Prioridad Fix |
|:---|:---|:---|:---|
| Dashboard | ⚠️ Parcial | ✅ OK | Media |
| Properties | ✅ OK | ⚠️ Monolito 49KB | Alta |
| Leads | ✅ OK | ⚠️ Sin estado global | Alta |
| Visits | ✅ OK | ✅ OK | Baja |
| Clients | ⚠️ Sin tabla propia | ⚠️ Usa datos leads | Alta |
| Reports | ⚠️ Sin queries reales | ⚠️ UI-only | Media |
| Live Chat | ❌ Sin backend | ⚠️ UI-only | Media |
| PerformanceIA | ❌ Sin datos reales | ⚠️ UI-only | Media |
| Settings | ⚠️ Google OAuth con bug | ✅ UI OK | 🔴 CRÍTICO |
| Support | ❌ Sin tabla | ⚠️ UI-only | Baja |
| Metrics | ⚠️ Datos mock | ⚠️ UI-only | Media |

### Bugs Críticos Abiertos
```
BUG-003: Sin sistema de autenticación → CRM público
✅ BUG-001: API Key Gemini hardcodeada en geminiService.ts:9 (Fixed: Moved to Edge Function openai-chat)
✅ BUG-002: Google Client Secret en frontend (Fixed: Moved to Edge Function google-calendar-auth)
✅ BUG-004: Búsqueda global usa MOCK_DATA (Fixed: Uses Supabase)
✅ BUG-005: typeof Property falta imagen_principal (Fixed: Uses foto_portada)
✅ BUG-006: geminiService.ts duplica openaiService.ts (Fixed: Deleted)
```

---

## 🔧 REGLAS GLOBALES (NO ROMPER)

1. **TypeScript estricto** — Prohibido usar `any` sin comentario justificativo
2. **Sin secrets en frontend** — Todo secret va en Supabase Edge Functions o n8n
3. **Componentes < 300 líneas** — Si supera, crear sub-componentes
4. **Loading + Error state** — Todo fetch debe tener ambos estados
5. **Mobile first** — Probar en 375px antes de desktop
6. **RLS en TODAS las tablas** — El usuario solo ve sus datos
7. **Backup antes de cambiar** — No tocar WARMER EVO ni workflows de producción
