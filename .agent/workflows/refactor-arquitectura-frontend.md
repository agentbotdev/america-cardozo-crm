---
description: Refactorizar los componentes grandes y configurar el estado global con Zustand
---

# Refactorizar Arquitectura Frontend (Sprint 2)

**Skills requeridas:** `react-patterns`, `frontend-developer`, `react-state-management`, `react-best-practices`, `cc-skill-frontend-patterns`

**Prerrequisito:** Auth implementada. Leer `agents/frontend/AGENTS.md`.

## Paso 1 — Instalar Zustand
```bash
npm install zustand
```

## Paso 2 — Crear el store central del CRM
Crear `stores/useCRMStore.ts`:
```ts
interface CRMState {
  properties: Property[];
  leads: Lead[];
  visits: Visit[];
  notifications: Notification[];
  currentUser: Profile | null;
  setProperties: (props: Property[]) => void;
  setLeads: (leads: Lead[]) => void;
  addNotification: (notif: Notification) => void;
}
```

## Paso 3 — Crear hooks custom por entidad
- `hooks/useProperties.ts` → fetch + mutación de propiedades
- `hooks/useLeads.ts` → fetch + mutación de leads
- `hooks/useVisits.ts` → fetch + mutación de visitas
- `hooks/useNotifications.ts` → suscripción a Supabase Realtime

Cada hook sigue el patrón:
```ts
export function useProperties() {
  const { properties, setProperties } = useCRMStore();
  // Fetch de Supabase si está vacío
  // Devuelve { data, loading, error, refetch }
}
```

## Paso 4 — Conectar búsqueda global a datos reales
En `components/AppLayout.tsx` líneas 106-109:
- Reemplazar `MOCK_LEADS` y `MOCK_PROPERTIES` con queries a Supabase
- Agregar debounce de 300ms para no disparar una query por cada tecla
- Usar `ilike` de Supabase para búsqueda fuzzy

## Paso 5 — Dividir Properties.tsx (49KB → 4 componentes)
Crear la estructura:
```
pages/Properties.tsx (orquestador, max 100 líneas)
components/properties/
  ├── PropertyList.tsx
  ├── PropertyCard.tsx
  ├── PropertyFilters.tsx  
  └── PropertyFormModal.tsx
```

## Paso 6 — Arreglar prop mismatch imagen_principal → foto_portada
Buscar en todo el proyecto:
```bash
grep -r "imagen_principal" src/
```
Reemplazar todos con `foto_portada` (el nombre correcto del tipo en `types.ts`).

## Paso 7 — Agregar React.lazy + Suspense en App.tsx
```tsx
const Properties = React.lazy(() => import('./pages/Properties'));
const Leads = React.lazy(() => import('./pages/Leads'));
// etc

<Suspense fallback={<SkeletonLoader />}>
  <Routes>...</Routes>
</Suspense>
```

## Paso 8 — Crear SkeletonLoader y ErrorBoundary
- `components/SkeletonLoader.tsx` — skeleton animado glassmorphism
- `components/ErrorBoundary.tsx` — catch de errores a nivel de árbol React

## Verificación
- [ ] Zustand instalado y store funcional
- [ ] Búsqueda global usa datos reales
- [ ] `Properties.tsx` dividido en 4 componentes
- [ ] Prop `imagen_principal` corregida a `foto_portada` en todo el proyecto
- [ ] Code splitting activo (verificar en DevTools → Network → JS chunks)
- [ ] Actualizar semáforo en `AGENTS.md`: Properties ✅, Leads ✅
