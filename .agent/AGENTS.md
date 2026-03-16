# AGENTE — America Cardozo CRM

> Config del agente para este proyecto. Leer al inicio de cada sesión.

## Proyecto
- **Nombre:** CRM America Cardozo (Inmobiliaria)
- **Stack:** Vite + React 19 + TypeScript + Supabase + N8N
- **Root:** `C:\Users\Ignacio\Desktop\America Crdozo CRM ZIP\`
- **Estado:** En desarrollo activo. Ver semáforo abajo.

---

## 🔴 Semáforo de Módulos

| Módulo | Estado | Deuda crítica |
|---|---|---|
| Seguridad | 🔴 CRÍTICO | API keys hardcodeadas, sin auth, sin RLS |
| Auth / Login | 🔴 Sin implementar | No existe PrivateRoute ni Login.tsx |
| Properties | 🟡 UI lista | Búsqueda usa mock data, prop mismatch |
| Leads | 🟡 UI lista | Sin pipeline Kanban, sin backend real |
| Visits | 🟡 UI lista | Sin conexión real a Supabase |
| Calendar | 🟡 Roto | Client Secret expuesto en frontend |
| Reports / Metrics | 🟡 Mock | Sin datos reales de Supabase |
| Chat | 🔴 Solo UI | Sin backend ni conexión real |
| Support | 🔴 Solo UI | Sin tabla en Supabase |
| N8N / Agente IA | 🔴 Sin crear | Diseñado en agents/ia/AGENTS.md |
| Tokko Sync | 🔴 Sin crear | Diseñado en agents/integraciones/AGENTS.md |

---

## 📋 Bugs Abiertos

| ID | Severidad | Descripción | Archivo |
|---|---|---|---|
| BUG-001 | 🔴 CRITICO | API Key Gemini hardcodeada | `services/geminiService.ts:9` |
| BUG-002 | 🔴 CRITICO | Google Client Secret en frontend | `services/googleCalendarService.ts:5` |
| BUG-003 | 🔴 CRITICO | Sin autenticación — CRM accesible sin login | `App.tsx` |
| BUG-004 | 🟡 ALTO | `geminiService.ts` duplicado de `openaiService.ts` | `services/` |
| BUG-005 | 🟡 ALTO | Búsqueda global usa MOCK_DATA | `components/AppLayout.tsx:106` |
| BUG-006 | 🟡 MEDIO | Prop mismatch: `imagen_principal` → `foto_portada` | múltiples |
| BUG-007 | 🟡 MEDIO | Sin RLS en tablas de Supabase | Supabase dashboard |

---

## 🗺️ Routing de Sub-Agentes

```
Tarea de UX / React / componentes     → agents/frontend/AGENTS.md
Tarea de DB / Auth / Supabase         → agents/backend/AGENTS.md
Tarea de N8N / IA / WhatsApp          → agents/ia/AGENTS.md
Tarea de Tokko / Google Calendar      → agents/integraciones/AGENTS.md
```

---

## 🏃 Sprint Actual: SPRINT 1 — Seguridad + Auth
**Objetivo:** Dejar el CRM con login real y sin secrets expuestos.
**SOPs a usar:** Ver `.agent/sop/`

---

## ⚙️ Reglas Globales del Proyecto
- ❌ Zero secrets en código fuente
- ❌ Zero mock data en producción
- ❌ Zero nodos n8n sin verificar en `n8n-node-validator`
- ✅ Siempre TypeScript estricto (`noImplicitAny: true`)
- ✅ Siempre actualizar este semáforo al terminar una tarea
- ✅ Siempre testear en mobile (320px) además de desktop
