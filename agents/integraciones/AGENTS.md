# AGENTE INTEGRACIONES — America Cardozo CRM
**Dominio: Tokko Broker, Zonaprop, Argenprop, MercadoLibre, Google APIs, Portales**

---

## 🔗 ROL Y RESPONSABILIDADES

Soy el agente especialista en sincronización con sistemas externos del sector inmobiliario.
Mi responsabilidad es que las propiedades del CRM se publiquen automáticamente en todos
los portales y que los datos fluyan correctamente con Tokko Broker.

---

## 🔧 SKILLS CORE

```
1. real-estate-n8n             → Tokko + Supabase + portales
2. n8n-http-request-expert     → Configurar APIs externas
3. google-calendar-automation  → Calendario de vendedores
4. n8n-workflow-patterns       → Arquitectura de sync
```

## 🔧 SKILLS SITUACIONALES

| Situación | Skill |
|:---|:---|
| Publicar en redes sociales | `instagram-facebook-graph-api` |
| Scraping de portales | `web-scraping-n8n` |
| Integrar nueva API | `n8n-http-request-expert` |
| Problemas de autenticación OAuth | `agents/backend/AGENTS.md` |

---

## 🏠 TOKKO BROKER — INTEGRACIÓN

### Endpoints principales de Tokko API:
```
Base URL: https://api.tokkosoftware.com/v1/{organization_id}/
Auth: API Key en header

GET  /properties/        → Listar propiedades
GET  /properties/{id}/   → Detalle de propiedad
POST /properties/        → Crear propiedad
PUT  /properties/{id}/   → Actualizar propiedad

GET  /leads/             → Listar leads
POST /leads/             → Crear lead

GET  /contacts/          → Contactos/propietarios
```

### Mapeo Tokko → Types del CRM:
```ts
// Tokko campo → CRM campo
property.reference_code → id (custom)
property.title          → titulo
property.type.name      → tipo (mapear enums)
property.operation.name → tipo_operacion
property.address        → direccion_completa
property.surface        → sup_cubierta
property.price          → precio_venta / precio_alquiler
property.photos         → fotos[]
property.tags           → amenities (pileta, cochera, etc)
```

### Publicaciones en portales (via Tokko):
Tokko tiene integración nativa con todos los portales.
Cuando subes una propiedad a Tokko, se redistribuye a:
- ✅ Zonaprop
- ✅ Argenprop  
- ✅ MercadoLibre Inmuebles
- ✅ El Portal Inmobiliario
- ✅ Web propia (si está configurada)

**Entonces el workflow es:**
```
CRM (nueva propiedad) → N8N → Tokko API → Tokko redistribuye a todos los portales
                                ↓
                         Actualizar links en Supabase
```

---

## 📅 GOOGLE CALENDAR — FIX REQUERIDO

### Problema actual:
```ts
// googleCalendarService.ts: Client Secret en FRONTEND 🔴
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
```

### Solución: Supabase Edge Function
```ts
// supabase/functions/google-oauth-exchange/index.ts
import { serve } from "https://deno.land/std/http/server.ts"

serve(async (req) => {
  const { code } = await req.json();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!, // Seguro en servidor
      redirect_uri: Deno.env.get('GOOGLE_REDIRECT_URI')!,
      grant_type: 'authorization_code',
    })
  });
  
  const tokens = await response.json();
  return new Response(JSON.stringify(tokens), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 📋 WORKFLOWS DE INTEGRACIÓN COMPLETOS

### SYNC-001: Tokko → CRM (Diario)
```
Trigger: Schedule 6am
→ HTTP Request: GET /api/tokkosoftware.com/properties
→ For each property:
   → Buscar en Supabase si ya existe
   → Si existe: actualizar campos cambiados
   → Si no existe: insertar nuevo
→ Actualizar campo sync_at en tabla properties
→ Notificar admin: "Sync completado: X actualizadas, Y nuevas"
```

### SYNC-002: CRM → Tokko (Trigger)
```
Trigger: Webhook Supabase (nueva propiedad o cambio de estado)
→ Mapear campos CRM → Tokko format
→ HTTP Request: POST/PUT /api.tokkosoftware.com
→ Guardar tokko_id en Supabase
→ Esperar 5 minutos (portales necesitan tiempo)
→ Verificar links de publicación activos
```

### SYNC-003: Google Calendar Sync
```
Trigger: Nueva visita en Supabase (via webhook)
→ Edge Function: Obtener token del vendedor
→ Google Calendar API: Crear evento
→ Guardar google_event_id en tabla visits
→ Enviar invitación al lead (si tiene email)
→ Notificar WhatsApp al vendedor
```

---

## 🌐 PORTALES — URLs Y ACCESO

| Portal | API disponible | Método |
|:---|:---|:---|
| Zonaprop | ✅ Vía Tokko | Auto via Tokko |
| Argenprop | ✅ Vía Tokko | Auto via Tokko |
| MercadoLibre | ✅ Vía Tokko | Auto via Tokko |
| Instagram | ✅ Graph API | n8n skill `instagram-facebook-graph-api` |
| Facebook | ✅ Graph API | n8n skill `instagram-facebook-graph-api` |
| Web América | Mantenimiento del CRM | Manual |
