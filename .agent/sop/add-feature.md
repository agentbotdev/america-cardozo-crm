# SOP — Agregar una Feature Nueva

**Usar cuando:** Hay que implementar algo nuevo que no existe todavía en el CRM.

---

## Proceso

### 1. Entender el scope antes de tocar código
Responder estas 4 preguntas:
- **¿Qué** debe hacer la feature? (comportamiento esperado)
- **¿Dónde** va? (qué página, qué componente, qué tabla de Supabase)
- **¿Afecta** a otros módulos? (por ej: una nueva columna puede romper queries existentes)
- **¿Tiene** diseño? (si no hay referencia visual, seguir el glassmorphism actual)

### 2. Clasificar la feature
```
Feature de UI pura         → Solo React, sin API
Feature conectada a DB     → React + Supabase query
Feature con automatización → React + Supabase + N8N workflow
Feature de integración     → HTTP Request a Tokko / Google / Evolution
```

### 3. Orden de implementación
Siempre este orden (de adentro hacia afuera):

```
1. Tipo en types.ts           → Definir la forma del dato
2. DB en Supabase             → Crear tabla/columna si es necesario
3. Service TS                 → Función que llama a Supabase
4. Hook custom                → useFeature() que envuelve el service
5. Componente UI              → Usa el hook, NO llama a Supabase directo
6. Conectar a la página       → Integrar el componente en la page
7. Actualizar AppLayout       → Si la feature necesita nav o search
```

### 4. Convenciones del proyecto

**Naming:**
- Hooks → `use + Entidad` (ej: `useLeads`, `useVisits`)
- Services → `entidadService.ts` en `src/services/`
- Componentes → PascalCase en carpeta de su página (`components/leads/LeadCard.tsx`)
- Tipos → en `src/types.ts`, no crear archivos de tipos separados

**UI:**
- Usar las clases Tailwind existentes, no inventar nuevas
- Framer Motion para todas las animaciones (`initial`, `animate`, `exit`)
- Colores del sistema: revisar `tailwind.config.js` antes de hardcodear
- Responsive: testear en 320px (mobile), 768px (tablet), 1280px (desktop)

**Supabase:**
- Siempre usar `supabaseClient` del `src/services/supabaseClient.ts`, no instanciar nuevo
- Filtrar por `user_id` o `vendedor_id` para respetar RLS
- Usar `.single()` solo cuando es seguro que existe el registro

### 5. Checkpoints antes de terminar
- [ ] Funciona en mobile (320px de ancho)
- [ ] No hay `console.error` en la consola del browser
- [ ] TypeScript sin errores (`npm run build` pasa limpio)
- [ ] RLS considera la nueva tabla/columna
- [ ] Si es feature nueva → actualizar semáforo en `.agent/AGENTS.md`

---

## Features planificadas por módulo

| Feature | Módulo | Complejidad | Depende de |
|---|---|---|---|
| Login page + roles | Auth | Alta | — |
| Pipeline Kanban | Leads | Media | Leads backend real |
| Notificaciones realtime | Global | Media | Supabase Realtime |
| Agente WhatsApp "Amelia" | N8N | Alta | Evolution API |
| Sync Tokko → CRM | Integraciones | Alta | Tokko API key |
| Búsqueda global real | AppLayout | Baja | Supabase queries |
| Support tickets | Support | Media | tabla support_tickets |
