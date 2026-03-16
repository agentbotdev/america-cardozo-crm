---
description: Implementar sincronización automática de propiedades desde Tokko Broker al CRM
---

# Implementar Sync Tokko → CRM (WORKFLOW-002)

**Skills requeridas:** `real-estate-n8n`, `n8n-http-request-expert`, `supabase-n8n-patterns`, `n8n-scheduling-triggers`, `n8n-workflow-tester`

**Prerrequisito:** Leer `agents/integraciones/AGENTS.md` — tiene el mapeo de campos Tokko → CRM.

## Paso 1 — Obtener credenciales de Tokko API
La API de Tokko Broker requiere:
- API Key de la cuenta de America Cardozo
- Base URL: `https://www.tokkobroker.com/api/v1/`
- Documentación: https://developers.tokkobroker.com/

Guardar la API Key en las credenciales de n8n (NO en el workflow).

## Paso 2 — Crear el workflow de sync
Estructura:
```
Schedule Trigger (cada 6 horas)
  → HTTP Request GET /property/?key=[api_key]&format=json&limit=100
  → Loop Over Items (paginar si hay más de 100)
  → Set (mapear campos Tokko → schema CRM)
  → Supabase UPSERT en tabla properties
  → IF (¿propiedades nuevas o modificadas?)
  → HTTP Request (notificar vendedores asignados via WhatsApp)
```

## Paso 3 — Mapeo de campos Tokko → CRM
Ver `agents/integraciones/AGENTS.md` para el mapeo completo. Campos clave:
```
tokko.id → properties.tokko_id (agg para detectar duplicados)
tokko.address.display_address → properties.direccion
tokko.operations[0].prices[0].price → properties.precio
tokko.photos[0].image → properties.foto_portada
tokko.status.name → properties.estado
tokko.agent.id → properties.vendedor_id (buscar en profiles)
```

## Paso 4 — Configurar el UPSERT en Supabase
```sql
-- La operación de upsert usa tokko_id como clave única
-- Si ya existe → actualiza precio y estado
-- Si no existe → inserta como nueva
ON CONFLICT (tokko_id) DO UPDATE SET
  precio = EXCLUDED.precio,
  estado = EXCLUDED.estado,
  updated_at = NOW()
```

## Paso 5 — Agregar columna tokko_id a la tabla properties
Ejecutar en Supabase:
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tokko_id TEXT UNIQUE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
```

## Paso 6 — Crear webhook para sincronización manual
Además del schedule, agregar un Webhook trigger para poder disparar la sync manualmente desde el CRM (botón "Sincronizar Tokko" en el dashboard).

## Paso 7 — Documentar con Sticky Note
```
# SYNC TOKKO — America Cardozo
Fuente: Tokko Broker API v1
Frecuencia: Cada 6 horas + manual
Última sync: {{$now}}
Propiedades procesadas: {{$json.count}}
```

## Verificación
- [ ] Propiedades de Tokko aparecen en Supabase
- [ ] UPSERT funciona (sin duplicados)
- [ ] Schedule activado cada 6 horas
- [ ] Webhook manual disponible
- [ ] Actualizar `agents/integraciones/AGENTS.md`: WORKFLOW-002 → ✅ Activo
