---
description: Implementar las correcciones de seguridad críticas del CRM (Sprint 1)
---

# Implementar Seguridad Crítica — Sprint 1

**Skills requeridas:** `api-security-best-practices`, `nextjs-supabase-auth`, `cc-skill-security-review`

**Prerrequisito:** Leer `agents/backend/AGENTS.md` antes de comenzar.

## Paso 1 — Remover API Key hardcodeada de geminiService.ts
Abrir `services/geminiService.ts` línea 9 y reemplazar el valor hardcodeado:
```ts
// ANTES (INSEGURO):
const API_KEY = "AIzaSy...hardcodeada";

// DESPUÉS:
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY no definida");
```

## Paso 2 — Eliminar geminiService.ts (es duplicado de openaiService.ts)
1. Verificar que no haya imports de `geminiService` en ningún otro archivo
2. Si los hay, reemplazarlos con el equivalente de `openaiService.ts`
3. Eliminar `services/geminiService.ts`

## Paso 3 — Crear Supabase Edge Function para Google OAuth
Crear `supabase/functions/google-oauth-exchange/index.ts`:
```ts
// La función recibe el authorization_code y hace el exchange SEGURO
// El CLIENT_SECRET solo vive aquí, nunca en el frontend
```
Deployar con: `supabase functions deploy google-oauth-exchange`

## Paso 4 — Actualizar googleCalendarService.ts
Cambiar la llamada del token exchange para que apunte a la Edge Function en lugar de hacer el POST a Google directamente con el secret expuesto.

## Paso 5 — Verificar .env.local
Confirmar que existen estas variables:
```
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
Crear `.env.example` sin valores reales.

## Paso 6 — Activar RLS en Supabase
En Supabase SQL Editor, ejecutar el script que está en `agents/backend/AGENTS.md` sección "Políticas de Seguridad RLS".

## Verificación
- [ ] `geminiService.ts` eliminado
- [ ] No hay secrets en el frontend
- [ ] Edge Function deployada y testeada
- [ ] RLS activado en todas las tablas
- [ ] `.env.example` creado
- [ ] Actualizar semáforo en `AGENTS.md` raíz: Settings ✅
