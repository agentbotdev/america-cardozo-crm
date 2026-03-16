---
description: Protocolo de inicio de sesión del agente en el CRM America Cardozo
---

# Protocolo de Inicio de Sesión del Agente

Ejecutá este protocolo al comienzo de CADA sesión nueva en este proyecto.

## Paso 1 — Leer el estado actual del proyecto
Lee el archivo `AGENTS.md` en la raíz del proyecto:
```
C:\Users\Ignacio\Desktop\America Crdozo CRM ZIP\AGENTS.md
```
Identificá:
- Semáforo de módulos (qué está ✅ listo, 🟡 en progreso, 🔴 bloqueado)
- Bugs abiertos pendientes
- Sprint actual activo

## Paso 2 — Leer el SKILLS_INDEX
Lee `SKILLS_INDEX.md` para conocer los combos disponibles:
```
C:\Users\Ignacio\Desktop\America Crdozo CRM ZIP\SKILLS_INDEX.md
```

## Paso 3 — Identificar el dominio de la tarea
Según lo que pide el usuario, navegar al sub-agente correspondiente:
- UX/UI/React → `agents/frontend/AGENTS.md`
- Supabase/DB/Auth → `agents/backend/AGENTS.md`
- N8N/AI/WhatsApp → `agents/ia/AGENTS.md`
- Tokko/Google Calendar → `agents/integraciones/AGENTS.md`

## Paso 4 — Declarar antes de ejecutar
Antes de tocar cualquier archivo decirle al usuario:
> "Voy a usar [sub-agente] + skills: [lista]. Plan: [qué voy a hacer]. ¿Arrancamos?"

## Paso 5 — Ejecutar respetando las reglas del sub-agente
- Nunca modificar el esquema de Supabase sin hacer backup SQL primero
- Nunca hardcodear API keys
- Nunca crear nodos n8n sin verificarlos en `n8n-node-validator`
- Siempre testear el workflow antes de activarlo

## Paso 6 — Actualizar el AGENTS.md raíz al finalizar
Marcar en el semáforo el módulo completado y registrar bugs resueltos.
