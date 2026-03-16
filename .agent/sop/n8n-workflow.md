# SOP — N8N: Crear o Modificar un Workflow

**Usar cuando:** Hay que crear automatizaciones, agentes IA, o integraciones via N8N.

---

## Regla #1 — Anti-alucinación de nodos
**SIEMPRE** verificar que el nodo existe antes de usarlo.

Nodos VÁLIDOS en este proyecto:
```
n8n-nodes-base.webhook
n8n-nodes-base.scheduleTrigger
n8n-nodes-base.httpRequest          ← comodín para cualquier API sin nodo nativo
n8n-nodes-base.supabase
n8n-nodes-base.if
n8n-nodes-base.switch
n8n-nodes-base.set
n8n-nodes-base.code
n8n-nodes-base.merge
n8n-nodes-base.splitInBatches
@n8n/n8n-nodes-langchain.agent
@n8n/n8n-nodes-langchain.openAi
@n8n/n8n-nodes-langchain.lmOpenAi
@n8n/n8n-nodes-langchain.memoryBufferWindow
@n8n/n8n-nodes-langchain.toolsAgent
```

**NUNCA inventar nodos como:**
- ❌ `n8n-nodes-base.whatsapp`
- ❌ `n8n-nodes-base.evolutionApi`
- ❌ `n8n-nodes-base.tokko`

Para WhatsApp → usar `n8n-nodes-base.httpRequest` a Evolution API.
Para Tokko → usar `n8n-nodes-base.httpRequest` a Tokko API.

---

## Proceso de creación

### 1. Diseñar el flujo en texto primero
```
Trigger → Transform → Decision → Action → Supabase → Notificación
```
Validar que cada nodo de la lista existe.

### 2. Crear via MCP
```
mcp_n8n-mcp_n8n_create_workflow(name, nodes, connections)
```

### 3. Validar antes de activar
```
mcp_n8n-mcp_n8n_validate_workflow(id)
```
Si hay errores, usar `mcp_n8n-mcp_n8n_autofix_workflow(id)` primero.

### 4. Testear con casos reales
Mínimo 5 inputs distintos:
1. Caso feliz típico
2. Caso con datos incompletos
3. Caso extremo (texto muy largo, número muy grande)
4. Caso en español con acentos / ñ
5. Caso que debería fallar (verificar que falla bien)

### 5. Agregar Sticky Note de documentación
```
# NOMBRE DEL WORKFLOW — America Cardozo
Versión: 1.0
Fecha: [fecha]
Propósito: [qué hace]
Trigger: [cómo se activa]
Output: [qué produce]
Credenciales: [qué creds usa]
```

### 6. Activar y monitorear 24h

---

## Workflows planificados para este CRM

| ID | Nombre | Estado | Trigger |
|---|---|---|---|
| WF-001 | Agente Amelia — Calificador WhatsApp | 🔴 Pendiente | Webhook Evolution API |
| WF-002 | Sync Tokko → Supabase | 🔴 Pendiente | Schedule 6h + Webhook manual |
| WF-003 | Seguimiento Automático de Leads | 🔴 Pendiente | Schedule diario |
| WF-004 | Notificación Nueva Visita | 🔴 Pendiente | Supabase Realtime |
| WF-005 | Reporte Semanal de Métricas | 🔴 Pendiente | Schedule lunes 9am |

---

## Credenciales necesarias en n8n
- Supabase: URL + Service Role Key
- OpenAI: API Key
- Evolution API: apikey + URL de instancia
- Tokko Broker: API Key
- Google: OAuth (vía Edge Function, no directo)
