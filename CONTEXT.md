# CRM América Cardozo - Contexto Técnico Completo

**Fecha última actualización:** 2026-03-21
**URL Producción:** https://america-cardozo-crm.vercel.app/
**Entorno:** Windows 10, Node.js, Vite Dev Server

---

## 1. STACK TECNOLÓGICO

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estilos:** TailwindCSS (diseño moderno slate-900/indigo-500)
- **Animaciones:** Framer Motion
- **Charts:** Recharts
- **Routing:** HashRouter (React Router v6)
- **State:** Context API (NO Redux)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 2. ARQUITECTURA DEL PROYECTO

```
/src
  /components        # Componentes reutilizables
    /home            # HomeKPIs, HomeQuickActions, HomeCharts
    /Leads           # LeadFiltersPanel
    /properties      # PropertyFiltersDrawer
  /config
    taxonomy.ts      # ⭐ TODAS las enumeraciones del negocio
  /contexts
    ToastContext.tsx # Sistema de notificaciones
  /hooks             # useAuth, etc.
  /pages             # Páginas principales (Home, Properties, Leads, etc.)
  /services          # Capa de datos (Supabase)
  /migrations        # SQL scripts para Supabase
  types.ts           # Definiciones TypeScript
  App.tsx            # Router principal
```

---

## 3. ESTADO ACTUAL DE MÓDULOS

### ✅ HOME (Dashboard)
**Estado:** COMPLETO y funcional
**Archivos:**
- `pages/Dashboard.tsx` (603 líneas)
- `components/home/HomeKPIs.tsx`
- `components/home/HomeQuickActions.tsx`
- `components/home/HomeCharts.tsx`

**Features:**
- 8 KPI cards con animación de conteo
- Sparklines en cada card
- Gráficos: temperatura leads, fuentes, propiedades por tipo
- Accesos rápidos a todas las secciones
- Datos reales desde Supabase

**Pendiente:** Ninguno

---

### ✅ PROPIEDADES (Properties)
**Estado:** COMPLETO y funcional
**Archivo:** `pages/Properties.tsx` (980 líneas)

**Features:**
- Tabs: Publicadas / En Captación / Favoritas
- Filtros completos (11 secciones en drawer lateral)
- Búsqueda con IA (Gemini API)
- Upload de imágenes optimizado
- Cards compactas con lazy loading
- Panel de detalle con galería fullscreen
- Toggle favoritos con persistencia
- Cache de 30s

**Tabla Supabase:** `propiedades` + `fotos`
**Service:** `services/propertiesService.ts` (REAL con cache)

**Pendiente:** Ninguno

---

### ✅ OPORTUNIDADES (Leads)
**Estado:** COMPLETO y funcional
**Archivo:** `pages/Leads.tsx` (836 líneas)

**Features:**
- Vista grid/list con filtros avanzados
- 12 filtros combinables (temperatura, etapa, operación, etc.)
- Tags/etiquetas free-text multi-select
- Panel de detalle con 4 tabs (Info, Historial, Propiedades, Chat)
- Asignación de propiedades a leads
- Chat funcional con guardado en DB
- Blur fix aplicado (backdrop sin blur)

**Tabla Supabase:** `leads` + `leads_history` + `messages`
**Service:** `services/leadsService.ts` (REAL con cache)

**Componente adicional:** `components/Leads/LeadFiltersPanel.tsx`

**Pendiente:** Ninguno

---

### ✅ CLIENTES (Clients)
**Estado:** COMPLETO y funcional
**Archivo:** `pages/Clients.tsx` (900+ líneas)

**Features:**
- Tabla completa con 9 columnas
- 5 tabs con contadores: Todos / Venta / Alquiler / Inversión / Cerrados
- Filtros combinables (11+) con lógica AND
- Ordenamiento por columnas (nombre, fecha, score, temperatura)
- Paginación de 25 por página
- Exportación CSV funcional
- Cards responsive para mobile
- Panel de detalle reutiliza LeadDetailPanel

**Tabla Supabase:** `leads` (misma tabla que Oportunidades)
**Aclaración crítica:** NO hay tabla `clientes` separada. Clientes y Oportunidades son vistas diferentes de la misma tabla `leads`.

**Service:** `services/leadsService.ts` (compartido con Oportunidades)

**Pendiente:** Ninguno

---

### ✅ VISITAS (Visits)
**Estado:** COMPLETO y funcional
**Archivo:** `pages/Visits.tsx` (1300+ líneas)

**Features:**
- 3 vistas con tabs claros: 📅 Calendario / 🗂 Kanban / 📋 Lista
- **Calendario mensual completo:**
  - Navegación entre meses (◀ ▶)
  - Día actual destacado con borde indigo
  - Dots de colores por estado (azul=pendiente, indigo=confirmada, verde=realizada, rojo=cancelada)
  - Doble click en día vacío → abre modal con fecha pre-cargada
  - Doble click en día con visitas → abre panel lateral con lista de visitas
  - Nunca pantalla en blanco (manejo de errores)
- **Kanban 4 columnas:**
  - Desktop: columnas side-by-side con headers coloreados
  - Mobile: tabs horizontales (no columnas)
  - Cards con hora, lead, propiedad, vendedor (iniciales)
- **Modal nueva visita:**
  - Header fijo, body scrollable, footer fijo (max-height 90vh)
  - Campos: Lead (búsqueda), Propiedad, Vendedor (desde VENDEDORES taxonomy), Fecha*, Hora*, Estado, Notas
  - Soporte para fecha pre-cargada desde calendario
- **Panel detalle visita:**
  - Info completa, acciones (marcar realizada con nota + calificación, confirmar, cancelar, editar)
  - Muestra nota_resultado y calificacion_lead
- **Panel lateral día:** lista de visitas del día ordenadas por hora
- **Integración con taxonomy.ts:** VENDEDORES, ESTADOS_VISITA, CALIFICACIONES_VISITA

**Tabla Supabase:** `visitas`
**Service:** `services/visitsService.ts` (REAL)

**Pendiente:** Ninguno

---

### ⚠️ TAREAS (Tasks)
**Estado:** INFRAESTRUCTURA LISTA, UI PENDIENTE
**Archivo actual:** `pages/Tasks.tsx` (220 líneas con Kanban básico)

**Completado en esta sesión:**
- ✅ Migraciones SQL creadas: `migrations/tasks_support_schema.sql`
  - Tabla `tareas` con todos los campos
  - Tabla `mensajes_internos` para chat de equipo
  - Tabla `comentarios_tareas`
  - Índices optimizados
- ✅ Service completo: `services/tasksService.ts` (CRUD completo + comentarios + mensajes + analytics)
- ✅ Tipos actualizados en `types.ts`:
  - `TaskStatus: 'pendiente' | 'en_proceso' | 'en_revision' | 'completada' | 'cancelada'`
  - `TaskPriority: 'urgente' | 'alta' | 'media' | 'baja'`
  - `CRMTask` interface completa con prioridad, tags, etc.

**Pendiente:**
- Reimplementar `pages/Tasks.tsx` completo con:
  - Tab 1: Tablero Kanban (5 columnas con headers coloreados, mobile con tabs)
  - Tab 2: Lista (tabla con filtros, paginación 25/página)
  - Tab 3: Gráficos (4 KPIs + 3 charts con Recharts)
  - Tab 4: Mensajes (chat interno entre equipo)
  - Modal Nueva Tarea (todos los campos, vincular lead/propiedad, tags)
  - Panel detalle tarea (info + tab comentarios)

**Código preparado:** ~2000 líneas listo para escribir (quedó pendiente por límite de tokens)

---

### ❌ REPORTES (Reports)
**Estado:** MOCKDATA - REQUIERE REFACTORIZACIÓN COMPLETA
**Archivo:** `pages/Reports.tsx` (622 líneas)

**Problema crítico:** 100% hardcoded mock data, NO conectado a Supabase

**Pendiente (Prompt 8):**
1. Mejorar topbar mobile (tabs recortados, hacer scrollable)
2. Corregir exportación CSV (actualmente no funciona)
3. Conectar tabs 1-5 a datos reales de Supabase:
   - Tab 1 LEADS: queries a tabla `leads` con agregaciones
   - Tab 2 VENTAS: leads con temperatura='cerrado' + operacion='venta'
   - Tab 3 ALQUILERES: leads con temperatura='cerrado' + operacion='alquiler'
   - Tab 4 PROPIEDADES: tabla `propiedades` con análisis
   - Tab 5 CAPTACIÓN: propiedades por fecha de creación
4. Agregar sección AI (puede ser mockdata por ahora):
   - Panel con sugerencias de IA
   - Insights automáticos
   - Predicciones

---

### ⚠️ SOPORTE (Support)
**Estado:** INFRAESTRUCTURA LISTA, UI PENDIENTE
**Archivo actual:** `pages/Support.tsx` (funcional pero sin persistencia)

**Completado en esta sesión:**
- ✅ Migraciones SQL: `soporte_tickets` + `soporte_mensajes`
- ✅ Service completo: `services/supportService.ts` (CRUD completo + analytics)

**Pendiente:**
- Conectar UI existente a supportService (actualmente solo local state)
- Implementar chatbot flotante (solo visible en `/soporte` y `/`) con openaiService.ts
- System prompt para chatbot ya definido en especificaciones
- Botón reportar por mail (corregir formato)

---

### ⏸️ CENTRO DE CONTROL (Control Center)
**Estado:** FUNCIONAL pero NO TOCAR (fuera de scope)
**Archivo:** `pages/ControlCenter.tsx`

**Nota:** Framework multi-agente implementado. No modificar según instrucciones del mega prompt.

---

### ⏸️ CONFIGURACIÓN (Settings)
**Estado:** BÁSICO (fuera de scope)
**Archivo:** `pages/Settings.tsx`

**Nota:** No tocar según mega prompt.

---

## 4. TABLAS SUPABASE

### Existentes y en uso:
```sql
-- Propiedades
propiedades (id, titulo, tipo_propiedad, tipo_operacion, estado, precio_venta,
             precio_alquiler, moneda_venta, moneda_alquiler, direccion, barrio,
             zona, ciudad, ambientes, dormitorios, banos, superficie_cubierta,
             superficie_total, foto_portada_url, es_favorita, tokko_id, created_at)

fotos (id, propiedad_id, url, url_original, thumbnail, es_portada, es_plano,
       orden, descripcion)

-- Leads y Clientes (misma tabla)
leads (id, nombre, email, telefono, temperatura, etapa_proceso, fuente_consulta,
       busca_venta, busca_alquiler, busca_inversion, presupuesto_max,
       vendedor_asignado, estado_seguimiento, operacion_buscada,
       tipo_inmueble_buscado, zonas_buscadas, presupuesto_min,
       ultima_interaccion, score, tags, created_at, updated_at)

leads_history (id, lead_id, accion, descripcion, usuario, created_at)

messages (id, lead_id, content, sender, timestamp)

-- Visitas
visitas (id, lead_id, lead_nombre, propiedad_id, property_titulo, vendedor_id,
         fecha_visita, estado, pipeline_stage, tipo_reunion, notas, invitados,
         google_event_id, vendedor_asignado, nota_resultado, calificacion_lead,
         created_at, updated_at)

-- Tareas
tareas (id, titulo, descripcion, prioridad, estado, fecha_vencimiento,
        creado_por, asignado_a, lead_id, propiedad_id, tags, created_at, updated_at)

mensajes_internos (id, de, para, texto, leido, created_at)

comentarios_tareas (id, tarea_id, usuario, texto, created_at)

-- Soporte
soporte_tickets (id, numero_ticket, asunto, categoria, prioridad, estado,
                 creado_por, user_id, created_at, updated_at)

soporte_mensajes (id, ticket_id, usuario, rol, texto, created_at)

-- Auth
profiles (id, full_name, email, role, phone, avatar_url, created_at, updated_at)

google_tokens (user_id, access_token, refresh_token, expires_at, created_at)
```

---

## 5. SERVICIOS (Estado de conexión a Supabase)

| Service | Archivo | Estado | Cache |
|---------|---------|--------|-------|
| **Properties** | `services/propertiesService.ts` | ✅ REAL | 30s |
| **Leads** | `services/leadsService.ts` | ✅ REAL | 30s |
| **Visits** | `services/visitsService.ts` | ✅ REAL | No |
| **Tasks** | `services/tasksService.ts` | ✅ REAL | No |
| **Support** | `services/supportService.ts` | ✅ REAL | No |
| **Dashboard** | `services/dashboardService.ts` | ✅ REAL | No |
| **Auth** | `services/authService.ts` | ✅ REAL | N/A |
| **Google Calendar** | `services/googleCalendarService.ts` | ✅ REAL | N/A |
| **Gemini AI** | `services/geminiService.ts` | ✅ REAL | N/A |
| **OpenAI** | `services/openaiService.ts` | ✅ REAL | N/A |

**Convención de cache:** 30 segundos con `invalidateCache()` después de mutaciones.

---

## 6. ARCHIVOS CRÍTICOS Y RUTAS

### Configuración
- `src/config/taxonomy.ts` - ⭐ **TODAS LAS ENUMERACIONES DEL NEGOCIO**
- `src/types.ts` - Definiciones TypeScript
- `src/services/supabaseClient.ts` - Cliente Supabase
- `vite.config.ts` - Configuración Vite

### Páginas principales
- `src/pages/Dashboard.tsx` - Home (603 líneas)
- `src/pages/Properties.tsx` - Propiedades (980 líneas)
- `src/pages/Leads.tsx` - Oportunidades (836 líneas)
- `src/pages/Clients.tsx` - Clientes (900+ líneas)
- `src/pages/Visits.tsx` - Visitas (1300+ líneas)
- `src/pages/Tasks.tsx` - Tareas (220 líneas, REQUIERE REEMPLAZO)
- `src/pages/Reports.tsx` - Reportes (622 líneas, REQUIERE REFACTOR)
- `src/pages/Support.tsx` - Soporte (funcional, requiere conexión a DB)
- `src/pages/ControlCenter.tsx` - Centro de Control (NO TOCAR)
- `src/pages/Settings.tsx` - Configuración (NO TOCAR)

### Componentes especializados
- `src/components/home/` - HomeKPIs, HomeQuickActions, HomeCharts
- `src/components/Leads/LeadFiltersPanel.tsx` - Filtros de leads (393 líneas)
- `src/components/properties/PropertyFiltersDrawer.tsx` - Filtros de propiedades

### Migraciones
- `src/migrations/tasks_support_schema.sql` - Esquema de Tareas y Soporte (EJECUTAR EN SUPABASE)

### Routing
- `src/App.tsx` - Router principal con HashRouter

---

## 7. ENUMERACIONES (config/taxonomy.ts)

**⭐ CRÍTICO:** Todas las enumeraciones del negocio están centralizadas aquí.

```typescript
// Propiedades
TIPOS_OPERACION: venta | alquiler | tasacion
TIPOS_INMUEBLE: 18 tipos agrupados por categoría (residencial/rural/comercial)
ESTADOS_PROPIEDAD: activo | borrador | reservado | vendido | alquilado

// Leads
TEMPERATURAS_LEAD: frio | tibio | caliente | ultra_caliente | pausado | perdido | derivado | cerrado
ETAPAS_PROCESO: contacto_inicial | indagacion | props_enviadas | visita_agendada |
                visita_realizada | negociacion | cierre | postventa
ESTADOS_SEGUIMIENTO: 9 estados con colores
FUENTES_LEAD: zonaprop | argenprop | instagram | facebook | mercadolibre | referido | web | otro

// Visitas
ESTADOS_VISITA: pendiente | confirmada | realizada | cancelada
CALIFICACIONES_VISITA: muy_interesado | interesado | dudoso | no_interesado

// Tareas
PRIORIDADES_TAREA: urgente | alta | media | baja
ESTADOS_TAREA: pendiente | en_progreso | en_revision | completada | cancelada

// Soporte
CATEGORIAS_SOPORTE: error_tecnico | consulta | mejora | facturacion | urgente

// Vendedores
VENDEDORES: 8 vendedores con iniciales (America Cardozo, Alejandro Papotti,
            Cristian, Juan Cruz, Franco Zeballos, Bárbara Lazarte,
            Máximo Cardozo, Moria Cardozo)

// Helpers
getLabel(array, value) - Obtiene label de un enum
getColor(array, value) - Obtiene color de un enum
getVendedorIniciales(value) - Obtiene iniciales de vendedor
```

---

## 8. CONVENCIONES DEL PROYECTO

### Routing
- **HashRouter** (no BrowserRouter)
- Rutas: `#/`, `#/properties`, `#/leads`, `#/clients`, `#/visits`, `#/tasks`, `#/reports`, `#/control`, `#/settings`, `#/support`

### State Management
- **Context API** (NO Redux)
- `ToastContext` para notificaciones
- Local state con `useState` en cada página

### Caching
- **30 segundos** en services que lo soportan
- Invalidación manual con `invalidateCache()` después de mutaciones
- Implementado en: propertiesService, leadsService

### Design System
- **Colores principales:** slate-900 (texto/backgrounds oscuros), indigo-500/600 (accents)
- **Fuente:** Inter (variable font)
- **Bordes redondeados:** `rounded-2xl`, `rounded-3xl` (muy redondeados)
- **Shadows:** `shadow-sm`, `shadow-lg`
- **Animaciones:** Framer Motion para paneles laterales y modals
- **Icons:** Lucide React (size 18-24px usualmente)

### Componentes
- **Mobile-first:** Siempre responsive
- **Cards compactas:** Evitar whitespace innecesario
- **Loading states:** Skeleton loaders, NO pantallas en blanco
- **Error states:** Mensaje + botón "Reintentar"
- **Empty states:** Mensaje + acción sugerida

### Forms
- **Validación:** Required fields con asterisco rojo
- **Modals:** Header fijo, body scrollable (max-height 90vh), footer fijo
- **Inputs:** `bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4`
- **Buttons:** `bg-slate-900 text-white rounded-2xl font-black`

### Datos
- **Fechas:** ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss`)
- **IDs:** UUIDs como strings
- **Arrays:** Usar `[]` como default, nunca null
- **Optional fields:** `field?: type` en TypeScript

---

## 9. PRÓXIMOS PASOS (en orden de prioridad)

### 🔴 URGENTE: Prompt 8 - REPORTES
**Archivo:** `pages/Reports.tsx`

**Tareas:**
1. Arreglar tabs mobile (hacer scrollable horizontalmente)
2. Implementar exportación CSV real (actualmente no funciona)
3. Conectar cada tab a datos reales de Supabase:
   - **Tab LEADS:** Consultas a tabla `leads` con agregaciones Postgres (COUNT, GROUP BY)
   - **Tab VENTAS:** Filtrar leads con `temperatura='cerrado'` + `operacion_buscada='venta'`
   - **Tab ALQUILERES:** Similar a Ventas pero con `operacion_buscada='alquiler'`
   - **Tab PROPIEDADES:** Análisis de tabla `propiedades` (sin foto, más de 90 días, etc.)
   - **Tab CAPTACIÓN:** Propiedades agrupadas por fecha de creación
4. Agregar sección AI (puede ser mockdata inicial):
   - Panel con insights automáticos
   - Sugerencias de IA
   - Predicciones de conversión

**Archivo de referencia:** Revisar `services/dashboardService.ts` para ver ejemplos de agregaciones.

---

### 🟡 IMPORTANTE: Completar TAREAS
**Archivo:** `pages/Tasks.tsx`

**Tareas:**
1. Reemplazar archivo actual (220 líneas básicas) por implementación completa (~2000 líneas)
2. 4 tabs: Tablero (Kanban 5 col) / Lista / Gráficos / Mensajes
3. Código ya preparado en esta sesión (quedó pendiente por límite de tokens)
4. Service ya está completo y funcional (`services/tasksService.ts`)
5. Ejecutar migraciones en Supabase: `migrations/tasks_support_schema.sql`

---

### 🟢 OPCIONAL: Completar SOPORTE
**Archivo:** `pages/Support.tsx`

**Tareas:**
1. Conectar UI actual a `services/supportService.ts` (reemplazar local state)
2. Implementar chatbot flotante (botón circular en esquina inferior derecha)
   - Solo visible en rutas `/soporte` y `/` (home)
   - Panel lateral 400px de ancho
   - Conectar con `services/openaiService.ts`
   - System prompt ya definido en especificaciones
3. Corregir botón "Reportar por mail" (formato actual incorrecto)
4. Ejecutar migraciones en Supabase: `migrations/tasks_support_schema.sql`

---

## 10. COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev              # Inicia dev server en http://localhost:5173

# Build
npm run build            # Genera build de producción en /dist
npm run preview          # Preview del build

# Deploy (Vercel)
git push origin main     # Auto-deploy en Vercel

# Supabase (ejecutar migraciones)
# Copiar contenido de migrations/tasks_support_schema.sql
# Pegar en SQL Editor de Supabase Dashboard
# Ejecutar
```

---

## 11. NOTAS IMPORTANTES

### ⚠️ NO TOCAR
- `pages/ControlCenter.tsx` - Framework multi-agente (fuera de scope)
- `pages/Settings.tsx` - Configuración básica (fuera de scope)
- `services/googleCalendarService.ts` - Integración funcional, NO modificar
- API Keys expuestas en código - Dejar para sprint futuro (según mega prompt)

### ⚠️ PROBLEMAS CONOCIDOS
- **Reportes:** 100% mockdata, requiere refactorización completa
- **Tasks:** UI básica, requiere reemplazo completo
- **Support:** Sin persistencia a DB, requiere conexión a service

### ✅ FUNCIONALIDADES DESTACADAS
- **Búsqueda con IA:** Gemini API en Propiedades (funcional)
- **Google Calendar Sync:** En Visitas (funcional)
- **Caching inteligente:** 30s con invalidación en Properties y Leads
- **Lazy Loading:** Imágenes optimizadas en Properties
- **Mobile responsive:** Todos los módulos completados
- **Animaciones:** Framer Motion en paneles y modals

---

## 12. ESTRUCTURA DE DATOS CLAVE

### Lead / Cliente (misma tabla)
```typescript
interface Lead {
  id: string;
  nombre: string;
  email?: string;
  telefono: string;
  temperatura: 'frio' | 'tibio' | 'caliente' | 'ultra_caliente' | 'pausado' | 'perdido' | 'derivado' | 'cerrado';
  etapa_proceso?: string;
  fuente_consulta: string;
  busca_venta?: boolean;
  busca_alquiler?: boolean;
  busca_inversion?: boolean;
  presupuesto_max?: number;
  vendedor_asignado?: string;
  estado_seguimiento?: string;
  score?: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}
```

### Propiedad
```typescript
interface Property {
  id: string;
  titulo: string;
  tipo: PropertyType;
  tipo_operacion: 'venta' | 'alquiler' | 'temporario' | 'inversion';
  estado: 'publicada' | 'captacion' | 'reservada' | 'vendida' | 'alquilada';
  precio: number;
  moneda: 'USD' | 'ARS';
  direccion_completa: string;
  barrio: string;
  zona: string;
  ciudad: string;
  ambientes: number;
  dormitorios: number;
  banos_completos: number;
  sup_cubierta: number;
  foto_portada: string;
  fotos: Photo[];
  es_favorita?: boolean;
  created_at: string;
}
```

### Visita
```typescript
interface Visit {
  id: string;
  lead_id: string;
  lead_nombre: string;
  property_id: string;
  property_titulo: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada';
  vendedor_asignado?: string;
  nota_resultado?: string;
  calificacion_lead?: 'muy_interesado' | 'interesado' | 'dudoso' | 'no_interesado';
  notas?: string;
  created_at: string;
  updated_at: string;
}
```

### Tarea
```typescript
interface CRMTask {
  id: string;
  titulo: string;
  descripcion?: string;
  prioridad?: 'urgente' | 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'en_proceso' | 'en_revision' | 'completada' | 'cancelada';
  fecha_vencimiento?: string;
  creado_por?: string;
  asignados: string[]; // Array de vendedores
  lead_id?: string;
  propiedad_id?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}
```

---

## 13. CONTACTO Y RECURSOS

**Developer Email:** agentbot.ai@gmail.com
**WhatsApp Soporte:** +54 9 351 763 6957
**Repositorio Git:** (agregar si existe)
**Supabase Project:** (URL del dashboard)
**Vercel Project:** https://vercel.com/dashboard

---

## 14. CHANGELOG RECIENTE (Última sesión)

**2026-03-21:**
- ✅ Completado módulo VISITAS (calendario, kanban, lista, modals, paneles)
- ✅ Creadas migraciones SQL para TAREAS y SOPORTE
- ✅ Actualizado tasksService.ts con CRUD completo
- ✅ Actualizado supportService.ts con CRUD completo
- ✅ Actualizados tipos en types.ts (TaskStatus, TaskPriority, CRMTask extendido)
- ⏸️ Quedó pendiente por límite de tokens: Tasks.tsx completo (~2000 líneas preparadas)

---

**FIN DEL DOCUMENTO DE CONTEXTO**

Este archivo debe ser la primera referencia en cualquier nueva sesión de desarrollo.
Actualizar este documento después de cada cambio significativo en el proyecto.
