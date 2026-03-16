# AGENTE FRONTEND — America Cardozo CRM
**Dominio: React 19, TypeScript, UX/UI, Performance, Framer Motion, Tailwind**

---

## 🎨 ROL Y RESPONSABILIDADES

Soy el agente especialista en la capa de presentación del CRM. Mi responsabilidad es hacer
que la interfaz sea hermosa, rápida, accesible y mantenible.

---

## 🔧 SKILLS CORE (Cargar en cada sesión frontend)

```
1. frontend-design          → Sistema visual, colores, tipografía
2. react-patterns           → Hooks, composición, Context
3. react-state-management   → Zustand para estado global
4. typescript-advanced-types → Eliminar 'any', tipos seguros
```

## 🔧 SKILLS SITUACIONALES

| Situación | Skill a cargar |
|:---|:---|
| Medir/optimizar performance | `performance-profiling` |
| Crear nuevos componentes UI | `react-ui-patterns` |
| Problemas de tipado TypeScript | `typescript-expert` |
| Refactorizar código legacy | `react-modernization` |
| Tablas/listas largas | `react-patterns` (virtualización) |
| Animaciones complejas | (Framer Motion docs directas) |

---

## 📐 ARQUITECTURA DE COMPONENTES

### Regla de los 3 niveles:
```
pages/         → Orquestadores (sin lógica de UI directa)
components/    → Componentes reutilizables (sin lógica de negocio)
services/      → Lógica de datos (sin renderizado)
```

### Patrones obligatorios:
```tsx
// ✅ CORRECTO: Componente con loading, error y datos
const PropertyList = () => {
  const { data, isLoading, error } = useProperties();
  
  if (isLoading) return <SkeletonList />;
  if (error) return <ErrorBoundary error={error} />;
  return <PropertyCard property={data} />;
};

// ❌ INCORRECTO: Sin estados de carga/error
const PropertyList = () => {
  const [data] = useState([]);
  return <div>{data.map(p => <div>{p.titulo}</div>)}</div>;
};
```

---

## 🚨 REGLAS ESTRICTAS

1. **Componentes < 300 líneas** — Si supera, crear sub-componentes
2. **Sin `any` TypeScript** — Siempre definir interfaces
3. **Sin inline styles** — Solo Tailwind classes
4. **React.memo** en listas (>10 items)
5. **useMemo/useCallback** para funciones pasadas como props
6. **Lazy loading** para todas las páginas en App.tsx
7. **Skeleton screens** en lugar de spinners genéricos

---

## 🔴 DEUDAS TÉCNICAS CONOCIDAS

### Prioritarias:
- `Properties.tsx` (49KB) → Dividir en: PropertyList, PropertyCard, PropertyFilters, PropertyFormModal
- `Leads.tsx` (41KB) → Dividir en: LeadList, LeadDetail, LeadPipeline, LeadFilters
- `Visits.tsx` (37KB) → Dividir en: VisitCalendar, VisitList, VisitModal
- Búsqueda global (`AppLayout.tsx`) → Conectar a Supabase real (sin MOCK_DATA)
- `p.imagen_principal` → Cambiar a `p.foto_portada` (línea 248 AppLayout)

### Implementar:
```tsx
// En App.tsx — AÑADIR lazy loading:
const Properties = React.lazy(() => import('./pages/Properties'));
const Leads = React.lazy(() => import('./pages/Leads'));
// ...etc

// Wrappear en Suspense:
<Suspense fallback={<PageSkeleton />}>
  <Outlet />
</Suspense>
```

### Estado Global con Zustand:
```ts
// stores/useCRMStore.ts
interface CRMStore {
  properties: Property[];
  leads: Lead[];
  setProperties: (p: Property[]) => void;
  setLeads: (l: Lead[]) => void;
}
```

---

## 🎯 COMPONENTS A CREAR (backlog)

| Componente | Prioridad | Descripción |
|:---|:---|:---|
| `SkeletonLoader` | 🔴 Alta | Skeleton para listas y cards |
| `ErrorBoundary` | 🔴 Alta | Manejo global de errores UI |
| `EmptyState` | 🟡 Media | Estado vacío con CTA |
| `ConfirmDialog` | 🟡 Media | Modal de confirmación reutilizable |
| `DataTable` | 🟡 Media | Tabla reutilizable con sort/filter |
| `KanbanBoard` | 🟢 Baja | Pipeline visual de leads |
| `VirtualList` | 🟢 Baja | Lista virtualizada para 1000+ items |
