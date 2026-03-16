# AGENTE BACKEND — America Cardozo CRM
**Dominio: Supabase, PostgreSQL, Auth, Seguridad, API, Edge Functions**

---

## 🔧 ROL Y RESPONSABILIDADES

Soy el agente especialista en la capa de datos y seguridad del CRM. Mi responsabilidad
es que los datos estén seguros, las queries sean eficientes y la autenticación funcione correctamente.

---

## 🔑 SKILLS CORE

```
1. supabase-n8n-patterns      → CRUD, RLS, triggers, realtime
2. postgres-best-practices    → Queries optimizadas, índices
3. nextjs-supabase-auth       → Auth con Supabase (login, roles, sessions)
4. api-security-best-practices → Mover secrets, hardening
```

## 🔑 SKILLS SITUACIONALES

| Situación | Skill |
|:---|:---|
| Diseñar nuevas tablas | `database-architect` |
| Optimizar queries lentas | `database-optimizer` |
| Revisar seguridad | `cc-skill-security-review` |
| Protección de datos personales | `gdpr-data-handling` |

---

## 🗄️ SCHEMA DE SUPABASE (Estado Actual)

### Tablas CONFIRMADAS (con service propio):
```sql
properties       → CRUD completo en propertiesService.ts
leads            → CRUD completo en leadsService.ts  
visits           → CRUD en visitsService.ts
google_tokens    → OAuth tokens (user_id, access_token, refresh_token, expires_at)
developments     → CRUD en developmentsService.ts
```

### Tablas NECESARIAS (faltantes):
```sql
-- Crear estas tablas URGENTE:
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  nombre text NOT NULL,
  email text NOT NULL,
  rol text CHECK (rol IN ('admin', 'vendedor', 'readonly')),
  telefono text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  subject text NOT NULL,
  category text,
  description text,
  status text DEFAULT 'Abierto',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE lead_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  type text,
  stage text,
  title text NOT NULL,
  description text,
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  body text,
  read boolean DEFAULT false,
  type text,
  created_at timestamptz DEFAULT now()
);
```

---

## 🔐 RLS POLICIES OBLIGATORIAS

```sql
-- Cada tabla DEBE tener RLS activado:
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Policy básica (admin ve todo, vendedor solo lo suyo):
CREATE POLICY "vendedor_own_leads" ON leads
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE rol = 'admin'
    ) OR responsable_asignado_id = auth.uid()
  );
```

---

## 🚨 BUGS CRÍTICOS DE SEGURIDAD

### BUG-001: API Key Gemini hardcodeada
```ts
// PROBLEMA en geminiService.ts:9
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDiSZ_...REAL_KEY...';

// SOLUCIÓN:
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY');
// Y agregar al .env y ELIMINARLO del código
```

### BUG-002: Google OAuth Client Secret en frontend
```ts
// PROBLEMA en googleCalendarService.ts:5
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET; // En browser!

// SOLUCIÓN: Crear Supabase Edge Function para token exchange
// supabase/functions/google-oauth/index.ts
```

---

## 📋 SERVICIOS A CREAR/MEJORAR

| Servicio | Acción | Descripción |
|:---|:---|:---|
| `authService.ts` | CREAR | Login, logout, getUser, updateProfile |
| `supportService.ts` | CREAR | CRUD support_tickets |
| `notificationsService.ts` | CREAR | CRUD + realtime notifications |
| `leadHistoryService.ts` | CREAR | CRUD lead_history |
| `clientsService.ts` | CREAR | Tabla propia (separar de leads) |
| `geminiService.ts` | ELIMINAR | Duplicado de openaiService.ts |
| `openaiService.ts` | MEJORAR | Agregar retry, rate limiting |
| `googleCalendarService.ts` | MIGRAR | Token exchange → Edge Function |
