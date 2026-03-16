---
description: Crear el agente WhatsApp que califica leads automáticamente via N8N
---

# Crear Agente IA — Calificador de Leads WhatsApp (WORKFLOW-001)

**Skills requeridas:** `n8n-ai-agents-expert`, `whatsapp-evolution-api`, `system-prompt-architect`, `n8n-workflow-tester`, `supabase-n8n-patterns`

**Prerrequisito:** Leer `agents/ia/AGENTS.md` — tiene el system prompt de "Amelia" ya escrito.

## Paso 1 — Verificar nodos disponibles en n8n
Consultar `n8n-node-validator` para confirmar que estos nodos existen:
- `n8n-nodes-base.webhook` ✅
- `@n8n/n8n-nodes-langchain.agent` ✅
- `@n8n/n8n-nodes-langchain.openAi` ✅ (model)
- `n8n-nodes-base.supabase` ✅
- `n8n-nodes-base.httpRequest` ✅ (para Evolution API)

## Paso 2 — Crear el workflow en n8n vía MCP
Estructura del workflow:
```
Webhook (Evolution API) 
  → Filter (solo mensajes de texto de números nuevos)
  → IF (¿ya existe lead en Supabase?)
  → AI Agent "Amelia" (gpt-4o-mini, system prompt del agents/ia/AGENTS.md)
  → Switch (intención: "quiero comprar" / "quiero alquilar" / "solo consulta")
  → Supabase (crear/actualizar lead con score de calificación)
  → HTTP Request (responder por WhatsApp via Evolution API)
```

## Paso 3 — Configurar el AI Agent
- Modelo: `gpt-4o-mini`
- Temperature: `0.3`
- System prompt: copiar desde `agents/ia/AGENTS.md` → sección "System Prompt Amelia"
- Memory: activar `Window Buffer Memory` con ventana de 10 mensajes

## Paso 4 — Conectar Evolution API
Usar `n8n-nodes-base.httpRequest` para enviar respuestas:
```
POST https://[tu-evolution-api]/message/sendText/[instancia]
Headers: apikey: [credencial en n8n]
Body: { number: "{{$json.from}}", text: "{{$json.response}}" }
```

## Paso 5 — Conectar Supabase
Al calificar un lead, upsert en tabla `leads`:
```
phone → de Evolution API
name → extraído por IA del texto
intent → "comprar" | "alquilar" | "consulta"
budget → extraído por IA si menciona presupuesto
zone → extraído por IA si menciona zona
score → calculado: 0-100
status → "nuevo" siempre al crear
source → "whatsapp"
```

## Paso 6 — Agregar Sticky Note al inicio del workflow
```
# AGENTE AMELIA — Calificador de Leads
Versión: 1.0
Instancia EVO: [nombre]
Modelo: gpt-4o-mini
Creado: [fecha]
```

## Paso 7 — Testear con 5 conversaciones distintas
1. "hola quiero comprar un departamento en Palermo de 2 ambientes"
2. "necesito alquilar algo en zona norte, presupuesto 300k"
3. "cuánto sale la propiedad de la foto?"
4. mensaje en inglés
5. mensaje sin contexto inmobiliario

Verificar que Supabase recibe el lead correctamente en cada caso.

## Paso 8 — Activar y monitorear
Activar el workflow. Monitorear las primeras 24h de ejecuciones.

## Verificación
- [ ] Webhook de Evolution API conectado
- [ ] Amelia responde con coherencia en los 5 tests
- [ ] Leads creados correctamente en Supabase
- [ ] Sticky note de documentación agregada
- [ ] Actualizar `agents/ia/AGENTS.md`: WORKFLOW-001 → ✅ Activo
