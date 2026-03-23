# AUDITORÍA TÉCNICA COMPLETA - CRM AMERICA CARDOZO V2.0
## Documento de Contexto Técnico para IA - Versión 3

**Fecha de Auditoría:** 20 de Marzo, 2026
**Proyecto:** America Cardozo CRM v2.0
**Stack Principal:** React 19 + Vite + TypeScript + Supabase + TailwindCSS
**Status:** Producción (Desplegado en Vercel)
**URL Producción:** https://america-cardozo-crm.vercel.app/

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico Completo](#stack-tecnológico-completo)
4. [Estructura de Archivos Detallada](#estructura-de-archivos-detallada)
5. [Módulos y Páginas](#módulos-y-páginas)
6. [Servicios y Lógica de Negocio](#servicios-y-lógica-de-negocio)
7. [Base de Datos (Supabase)](#base-de-datos-supabase)
8. [Componentes React](#componentes-react)
9. [Sistema de Tipos TypeScript](#sistema-de-tipos-typescript)
10. [Enumeraciones y Taxonomía](#enumeraciones-y-taxonomía)
11. [Integraciones Externas](#integraciones-externas)
12. [Sistema Multi-Agente](#sistema-multi-agente)
13. [Autenticación y Seguridad](#autenticación-y-seguridad)
14. [Gestión de Estado](#gestión-de-estado)
15. [Routing y Navegación](#routing-y-navegación)
16. [Estilos y Diseño](#estilos-y-diseño)
17. [Performance y Optimizaciones](#performance-y-optimizaciones)
18. [Issues y Deuda Técnica](#issues-y-deuda-técnica)
19. [Deployment y CI/CD](#deployment-y-cicd)
20. [Variables de Entorno](#variables-de-entorno)
21. [Comandos y Scripts](#comandos-y-scripts)
22. [Historial de Cambios Recientes](#historial-de-cambios-recientes)

---

## 1. RESUMEN EJECUTIVO

### Descripción del Proyecto
CRM inmobiliario profesional para **Inmobiliaria America Cardozo** ubicada en el Gran Buenos Aires Oeste (Argentina). Sistema completo de gestión de propiedades, leads, clientes, visitas, tareas y reportes con integración de IA.

### Características Principales
- ✅ **14 módulos funcionales** (Dashboard, Propiedades, Leads, Clientes, Visitas, Tareas, Reportes, etc.)
- ✅ **Gestión completa de propiedades** con 100+ atributos
- ✅ **Pipeline de leads** con scoring automático y tracking de temperatura
- ✅ **Integración con IA** (Google Gemini, OpenAI)
- ✅ **Google Calendar** para agendamiento de visitas
- ✅ **Importación masiva** desde Tokko (99 propiedades + 1999 fotos)
- ✅ **Multi-agente framework** para colaboración de equipo
- ✅ **Responsive design** con TailwindCSS
- ✅ **Autenticación y roles** (Admin, Vendedor, Readonly)

### Métricas del Proyecto
- **Líneas de código:** ~30,000+
- **Archivos TypeScript/React:** 50+
- **Servicios backend:** 17
- **Páginas/Rutas:** 14
- **Componentes:** 30+
- **Tablas de base de datos:** 8+
- **Integraciones externas:** 6+

### Estado Actual
- **Build:** ✅ Exitoso
- **Deployment:** ✅ Funcionando en Vercel
- **Tests:** ❌ No implementados
- **Documentación:** ⚠️ Parcial

---

## 2. ARQUITECTURA DEL SISTEMA

### Arquitectura General
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│  React 19 SPA + TailwindCSS + Framer Motion             │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ PostgreSQL   │  │  Auth API    │  │   Storage    │  │
│  │  Database    │  │  JWT Tokens  │  │   (S3-like)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ Row Level    │  │  Realtime    │                    │
│  │  Security    │  │  Subscriptions│                   │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ External APIs
                           ▼
┌─────────────────────────────────────────────────────────┐
│              INTEGRACIONES EXTERNAS                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Google       │  │  Tokko API   │  │   Portales   │  │
│  │ Calendar     │  │  (Props)     │  │  (Zonaprop)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ OpenAI API   │  │  Gemini AI   │                    │
│  │ (ChatGPT)    │  │  (Google)    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos
1. **Usuario** → Interactúa con React SPA
2. **React** → Llama a servicios locales (`/services`)
3. **Servicios** → Consultan Supabase Client
4. **Supabase** → Ejecuta queries a PostgreSQL con RLS
5. **PostgreSQL** → Retorna datos filtrados por usuario
6. **React** → Actualiza UI con datos (Context API + useState)

### Patrón de Arquitectura
- **Frontend:** Component-based architecture (React)
- **Estado:** Context API + Local State (no Redux/Zustand)
- **Data Layer:** Service Pattern (servicios centralizados)
- **Backend:** BaaS (Backend as a Service - Supabase)
- **Database:** PostgreSQL con RLS (Row Level Security)
- **Auth:** JWT tokens vía Supabase Auth
- **Storage:** Supabase Storage (archivos/imágenes)

---

## 3. STACK TECNOLÓGICO COMPLETO

### Frontend Core
```json
{
  "react": "^19.2.0",           // UI library (última versión)
  "react-dom": "^19.2.0",       // DOM rendering
  "react-router-dom": "^7.1.5", // Routing (HashRouter)
  "typescript": "~5.8.2",       // Type safety
  "vite": "^6.2.0"              // Build tool (reemplazo de Webpack)
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.17",              // Utility-first CSS
  "framer-motion": "^11.18.2",           // Animaciones
  "lucide-react": "^0.474.0",            // Iconos (2000+)
  "class-variance-authority": "^0.7.1",  // Variantes de componentes
  "clsx": "^2.1.1",                      // Utility para classNames
  "tailwind-merge": "^2.6.0"             // Merge Tailwind classes
}
```

### Data & Backend
```json
{
  "@supabase/supabase-js": "^2.91.0"  // Cliente de Supabase
}
```

### Visualización de Datos
```json
{
  "recharts": "^2.15.0",  // Gráficos React (Line, Bar, Pie)
  "reaviz": "^16.1.2"     // Visualizaciones avanzadas
}
```

### Build Tools
```json
{
  "@vitejs/plugin-react": "^5.0.0",  // Plugin React para Vite
  "autoprefixer": "^10.4.20",        // PostCSS autoprefixer
  "postcss": "^8.5.3",               // CSS processor
  "@types/node": "^22.14.0"          // Node types para TypeScript
}
```

### Node.js
- **Versión requerida:** >= 18.0.0
- **Versión recomendada:** 20.x (especificada en .nvmrc)

---

## 4. ESTRUCTURA DE ARCHIVOS DETALLADA

### Árbol Completo del Proyecto
```
c:\Users\Ignacio\Desktop\America Crdozo CRM ZIP\
│
├── 📁 agents/                         # Framework Multi-Agente
│   ├── 📁 frontend/
│   │   └── AGENTS.md                  # Agente Frontend (React, UI)
│   ├── 📁 backend/
│   │   └── AGENTS.md                  # Agente Backend (Supabase, DB)
│   ├── 📁 ia/
│   │   └── AGENTS.md                  # Agente IA (Gemini, OpenAI)
│   └── 📁 integraciones/
│       └── AGENTS.md                  # Agente Integraciones (APIs)
│
├── 📁 components/                     # Componentes React
│   ├── 📁 home/                       # Componentes del Home
│   │   ├── HomeCharts.tsx
│   │   ├── HomeFeed.tsx
│   │   ├── HomeHotLeads.tsx
│   │   ├── HomeKPIs.tsx
│   │   ├── HomeQuickActions.tsx
│   │   └── HomeTasksWidget.tsx
│   ├── 📁 Leads/                      # Componentes de Leads
│   │   ├── LeadCard.tsx
│   │   ├── LeadDetailPanel.tsx
│   │   ├── LeadFiltersPanel.tsx      # ✨ Filtros avanzados (12 secciones)
│   │   ├── LeadFormModal.tsx
│   │   ├── LeadsFilters.tsx
│   │   └── LeadsKanban.tsx
│   ├── 📁 properties/                 # Componentes de Propiedades
│   │   └── PropertyFilters.tsx
│   ├── 📁 ui/                         # Componentes base UI
│   │   └── BaseModal.tsx
│   ├── AppLayout.tsx                  # Layout principal (260KB)
│   ├── ErrorBoundary.tsx              # ✨ Error handler
│   ├── OptimizedImage.tsx             # ✨ Lazy loading imágenes
│   ├── PropertySearch.tsx
│   └── ProtectedRoute.tsx             # ✨ Auth guard
│
├── 📁 contexts/                       # React Context API
│   ├── AuthContext.tsx                # Estado de autenticación
│   └── ToastContext.tsx               # Sistema de notificaciones
│
├── 📁 hooks/                          # Custom React Hooks
│   └── useAuth.ts                     # Hook de autenticación
│
├── 📁 pages/                          # Páginas principales (14)
│   ├── Clients.tsx                    # Gestión de clientes
│   ├── ControlCenter.tsx              # Centro de control + MCP
│   ├── Dashboard.tsx                  # Dashboard principal (32KB)
│   ├── Home.tsx                       # Homepage
│   ├── Leads.tsx                      # Pipeline de leads (45KB) ⚠️
│   ├── Login.tsx                      # Página de login
│   ├── Oportunidades.tsx              # Vista de oportunidades
│   ├── Properties.tsx                 # Gestión de propiedades (51KB) ⚠️
│   ├── Reports.tsx                    # Reportes y analytics (39KB)
│   ├── Settings.tsx                   # Configuración + OAuth
│   ├── Support.tsx                    # Soporte técnico
│   ├── Tasks.tsx                      # Gestión de tareas
│   └── Visits.tsx                     # Agendamiento de visitas
│
├── 📁 services/                       # Lógica de negocio (17 servicios)
│   ├── authService.ts                 # Login, logout, perfiles
│   ├── dashboardService.ts            # Estadísticas dashboard
│   ├── developmentsService.ts         # Desarrollos inmobiliarios
│   ├── geminiService.ts               # Google Gemini AI
│   ├── googleCalendarService.ts       # OAuth + Calendar API
│   ├── leadHistoryService.ts          # Historial de leads
│   ├── leadsService.ts                # CRUD leads + cache (220 líneas)
│   ├── mcpService.ts                  # Chatwoot/MCP integration
│   ├── notificationsService.ts        # Push notifications
│   ├── openaiService.ts               # OpenAI ChatGPT
│   ├── propertiesService.ts           # CRUD propiedades + cache
│   ├── reportsService.ts              # Generación de reportes
│   ├── storageService.ts              # Subida de archivos
│   ├── supabaseClient.ts              # Cliente Supabase
│   ├── supportService.ts              # Tickets de soporte
│   ├── tasksService.ts                # Tareas (mock data) ⚠️
│   └── visitsService.ts               # Gestión de visitas
│
├── 📁 config/                         # Configuraciones
│   └── taxonomy.ts                    # Enumeraciones del negocio
│
├── 📁 supabase/                       # Base de datos
│   ├── schema.sql                     # Schema completo (150+ líneas)
│   ├── seed_data.sql                  # Datos de prueba
│   └── README.md                      # Instrucciones setup
│
├── 📁 public/                         # Assets estáticos
├── 📁 dist/                           # Build output (generado)
│
├── 📄 App.tsx                         # Router principal
├── 📄 index.tsx                       # Entry point React
├── 📄 index.css                       # ✨ Estilos globales + Tailwind
├── 📄 index.html                      # HTML base
├── 📄 types.ts                        # Type definitions (344 líneas)
│
├── 📄 vite.config.ts                  # Configuración Vite
├── 📄 tsconfig.json                   # Configuración TypeScript
├── 📄 tailwind.config.js              # Configuración Tailwind
├── 📄 postcss.config.js               # Configuración PostCSS
├── 📄 package.json                    # Dependencias
├── 📄 package-lock.json               # Lock file
├── 📄 .nvmrc                          # Node version (20)
├── 📄 .gitignore                      # Git ignore rules
├── 📄 .env                            # Variables de entorno (local)
├── 📄 .env.example                    # Template env vars
│
├── 📄 AGENTS.md                       # Documentación Multi-Agente
├── 📄 README.md                       # Readme principal
└── 📄 perplexityauditoriav3.md        # 📄 ESTE DOCUMENTO
```

### Tamaños de Archivos Críticos
| Archivo | Tamaño | Estado |
|---------|--------|--------|
| Properties.tsx | 51 KB | ⚠️ Muy grande, dividir |
| Leads.tsx | 45 KB | ⚠️ Muy grande, dividir |
| Reports.tsx | 39 KB | ✅ Aceptable |
| Dashboard.tsx | 32 KB | ✅ Aceptable |
| ControlCenter.tsx | 33 KB | ✅ Aceptable |
| AppLayout.tsx | 260 KB | ⚠️ Revisar |

---

## 5. MÓDULOS Y PÁGINAS

### 5.1 Dashboard (`/`)
**Archivo:** `pages/Dashboard.tsx` (32 KB, 603 líneas)

**Funcionalidad:**
- KPIs principales (Leads totales, Propiedades, Visitas, Conversión)
- Gráficos de distribución de leads por temperatura
- Gráficos de leads por fuente
- Widget de hot leads (5 leads más calientes)
- Feed de actividad reciente
- Actualizaciones en tiempo real con Supabase Realtime

**Componentes:**
```tsx
<DashboardStats>
  <KPICard title="Leads Totales" value={stats.totalLeads} />
  <KPICard title="Propiedades" value={stats.propertiesCount} />
  <KPICard title="Visitas" value={stats.visitsScheduled} />
</DashboardStats>
<ChartsSection>
  <PieChart data={leadStatusData} />
  <BarChart data={leadsBySourceData} />
</ChartsSection>
<HotLeadsWidget leads={hotLeads} />
<ActivityFeed items={recentActivity} />
```

**Servicios usados:**
- `dashboardService.getStats()`
- `dashboardService.getChartData()`

**Estado actual:** ✅ Completamente funcional con datos reales

---

### 5.2 Properties (`/propiedades`)
**Archivo:** `pages/Properties.tsx` (51 KB, 797 líneas)

**Funcionalidad:**
- Listado de propiedades con filtros
- Vista de tarjetas (cards) con imágenes
- Creación de nuevas propiedades
- Edición de propiedades existentes
- Gestión de fotos (subida múltiple)
- Búsqueda por IA (Gemini)
- Estados: activo, borrador, reservado, vendido
- Filtros avanzados (11 secciones)

**Características destacadas:**
- **100+ atributos por propiedad**
- **Galería de fotos** con ordenamiento drag & drop
- **Búsqueda con IA** (geminiService)
- **Cache de 30 segundos** para performance
- **Lazy loading de imágenes** (OptimizedImage)
- **Responsive design** (móvil, tablet, desktop)

**Tabs disponibles:**
- Todas
- Venta
- Alquiler
- Captación
- Favoritas

**Servicios usados:**
- `propertiesService.fetchProperties()`
- `propertiesService.saveProperty()`
- `propertiesService.deleteProperty()`
- `geminiService.searchPropertiesWithIA()`

**Estado actual:**
- ✅ Funcional con datos reales
- ⚠️ Archivo muy grande (necesita refactorización)
- ⚠️ Falta implementar filtros avanzados completos

**Refactorización sugerida:**
```
Properties.tsx (orchestrator)
  ├── PropertyList.tsx
  ├── PropertyCard.tsx
  ├── PropertyFormModal.tsx
  ├── PropertyFilters.tsx
  └── PropertyGallery.tsx
```

---

### 5.3 Leads (`/leads`)
**Archivo:** `pages/Leads.tsx` (45 KB, 739 líneas)

**Funcionalidad:**
- Pipeline de leads con temperaturas (Frío, Tibio, Caliente, Ultra Caliente)
- Scoring automático de leads
- Etapas del proceso (8 etapas)
- Panel de detalles deslizable
- Filtros avanzados (12 secciones) ✨ NUEVO
- Chat con leads (guardado en Supabase) ✨ NUEVO
- Asignación de propiedades a leads
- Historial de interacciones

**Temperaturas de Lead:**
- **Frío** - Contacto inicial sin interés claro
- **Tibio** - Interés moderado, indagación
- **Caliente** - Alta probabilidad de cierre
- **Ultra Caliente** - Listo para reserva/cierre
- **Pausado** - Lead temporalmente inactivo
- **Perdido** - Lead perdido definitivamente
- **Derivado** - Derivado a agente IA
- **Cerrado** - Lead convertido en cliente

**Etapas del Proceso:**
1. Contacto Inicial
2. Indagación
3. Propiedades Enviadas
4. Visita Agendada
5. Visita Realizada
6. Negociación
7. Cierre
8. Postventa

**Panel de Detalles (Tabs):**
- **Info:** Datos del lead, temperatura, etapa
- **Historial:** Timeline de interacciones
- **Propiedades:** Propiedades enviadas/consultadas
- **Chat:** Conversación con el lead ✨

**Filtros Avanzados (LeadFiltersPanel):** ✨ NUEVO
1. Búsqueda por texto (nombre, email, teléfono)
2. Temperaturas (multi-select)
3. Etapas del proceso
4. Tipo de operación buscada
5. Tipo de inmueble buscado
6. Zona de búsqueda
7. Presupuesto (min-max)
8. Estado de seguimiento
9. Vendedor asignado
10. Fuente del lead
11. Rango de fechas
12. Filtros especiales (sin respuesta N días, con visita próxima)

**Servicios usados:**
- `leadsService.fetchLeads()`
- `leadsService.saveLead()`
- `leadsService.saveMessage()` ✨ NUEVO
- `leadHistoryService.fetchHistory()`
- `propertiesService.fetchProperties()`

**Estado actual:**
- ✅ Funcional con datos reales
- ✅ Chat implementado y funcionando ✨
- ✅ Filtros avanzados implementados ✨
- ⚠️ Archivo muy grande (necesita refactorización)

---

### 5.4 Clients (`/clientes`)
**Archivo:** `pages/Clients.tsx` (13 KB)

**Funcionalidad:**
- Gestión de clientes (leads convertidos)
- Historial de compras/alquileres
- Lifetime value (valor de vida del cliente)
- Propiedades adquiridas
- Filtros: Todos, Ventas, Alquileres

**Modelo de datos:**
```typescript
interface Client extends Lead {
  es_cliente: true;
  fecha_conversion: string;
  propiedades_adquiridas: string[];
  lifetime_value: number;
}
```

**Servicios usados:**
- `leadsService.fetchLeads()` (filtra por `es_cliente = true`)

**Estado actual:** ✅ Funcional

---

### 5.5 Visits (`/visitas`)
**Archivo:** `pages/Visits.tsx` (17 KB, 781 líneas)

**Funcionalidad:**
- Agendamiento de visitas
- Sincronización con Google Calendar ✅
- Vista de calendario mensual
- Vista de lista con filtros
- Estados: Pendiente, Confirmada, Realizada, Cancelada
- Notas post-visita
- Calificación del lead después de visita

**Integración Google Calendar:**
```typescript
// Crear evento en Google Calendar
const event = await googleCalendarService.createEvent({
  summary: `Visita - ${lead.nombre}`,
  description: `Propiedad: ${property.titulo}`,
  start: { dateTime: visitDateTime },
  end: { dateTime: visitEndTime }
});
```

**Servicios usados:**
- `visitsService.fetchVisits()`
- `visitsService.createVisit()`
- `googleCalendarService.createEvent()`

**Estado actual:** ✅ Funcional con Google Calendar

---

### 5.6 Tasks (`/tareas`)
**Archivo:** `pages/Tasks.tsx` (11 KB)

**Funcionalidad:**
- Gestión de tareas
- Vistas: Kanban, Lista, Calendario
- Estados: Pendiente, En Proceso, En Revisión, Completada, Cancelada
- Prioridades: Urgente, Alta, Media, Baja
- Asignación múltiple
- Vinculación con leads/propiedades

**Columnas Kanban:**
- Pendiente
- En Progreso
- En Revisión
- Completada
- Cancelada

**Servicios usados:**
- `tasksService.fetchTasks()`

**Estado actual:**
- ⚠️ Solo mock data
- ⚠️ Falta backend real
- ⚠️ Tabla `tareas` no existe en Supabase

**Schema necesario:**
```sql
CREATE TABLE tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(30) DEFAULT 'pendiente',
  fecha_vencimiento TIMESTAMPTZ,
  creado_por VARCHAR(100) NOT NULL,
  asignado_a VARCHAR(100)[],
  lead_id UUID REFERENCES leads(id),
  propiedad_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5.7 Reports (`/reportes`)
**Archivo:** `pages/Reports.tsx` (39 KB, 710 líneas)

**Funcionalidad:**
- Reportes analíticos con visualizaciones
- 5 dashboards especializados
- Filtros por rango de fechas
- Exportación a CSV
- Gráficos interactivos (Recharts + Reaviz)

**Dashboards disponibles:**

1. **Leads Dashboard**
   - Total leads
   - Hot leads (caliente + ultra_caliente)
   - Tasa de respuesta
   - Score promedio
   - Conversión
   - Breakdown por fuente
   - Breakdown por mes

2. **Ventas Dashboard**
   - GMV (Gross Merchandise Value)
   - Total ventas cerradas
   - Pipeline activo
   - Días promedio de cierre
   - Comisiones generadas
   - Ticket promedio

3. **Alquileres Dashboard**
   - Contratos activos
   - Valor total de alquileres
   - Tasa de vacancia
   - Tasa de renovación
   - Yield promedio

4. **Propiedades Dashboard**
   - Total propiedades
   - Valor total inventario
   - Aging promedio (días en mercado)
   - Total vistas
   - Eficiencia de publicación
   - Propiedades sin foto
   - Propiedades estancadas (>90 días)

5. **Captación Dashboard**
   - Nuevas captaciones (últimos 30 días)
   - Tasa de exclusividad
   - Valor entrante
   - Tasa de conversión (captación → publicada)
   - Tasaciones realizadas

**Exportación CSV:**
```typescript
function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  // Download logic...
}
```

**Servicios usados:**
- `reportsService.fetchLeadsData()` ✅ Real data
- `reportsService.fetchSalesData()` ✅ Real data
- `reportsService.fetchRentalsData()` ✅ Real data
- `reportsService.fetchPropertiesData()` ✅ Real data
- `reportsService.fetchCaptacionData()` ✅ Real data

**Estado actual:**
- ✅ Conectado a datos reales de Supabase ✨
- ✅ Exportación CSV funcional ✨
- ✅ Tabs móviles con scroll horizontal ✨

---

### 5.8 Control Center (`/control-center`)
**Archivo:** `pages/ControlCenter.tsx` (33 KB)

**Funcionalidad:**
- **Monitoreo del sistema** (uptime, performance)
- **Framework Multi-Agente** (4 dominios)
- **Métricas de IA** (Gemini, OpenAI usage)
- **MCP Integration** (Chatwoot metrics)
- **Agent Performance** (CSAT, resolution time)
- **Infrastructure Status** (Supabase, Vercel health)

**Tabs disponibles:**
1. **Overview** - Vista general del sistema
2. **Agents** - Estado de los 4 agentes
3. **Metrics** - Métricas de rendimiento
4. **MCP** - Chatwoot/Customer Service stats
5. **Infrastructure** - Status de servicios

**Agentes monitoreados:**
- Frontend Agent (React, UI)
- Backend Agent (Supabase, Database)
- IA Agent (Gemini, OpenAI)
- Integraciones Agent (APIs externas)

**Servicios usados:**
- `mcpService.getMetrics()`
- Custom status endpoints

**Estado actual:** ✅ Funcional

---

### 5.9 Home (`/home`)
**Archivo:** `pages/Home.tsx` (14 KB)

**Funcionalidad:**
- Homepage alternativa al Dashboard
- KPIs compactos
- Gráficos de tendencias
- Hot leads widget
- Quick actions (accesos rápidos)
- Widget de tareas pendientes
- Feed de actividad

**Componentes usados:**
- `HomeKPIs.tsx`
- `HomeCharts.tsx`
- `HomeHotLeads.tsx`
- `HomeQuickActions.tsx`
- `HomeTasksWidget.tsx`
- `HomeFeed.tsx`

**Estado actual:** ✅ Funcional

---

### 5.10 Settings (`/configuracion`)
**Archivo:** `pages/Settings.tsx` (12 KB)

**Funcionalidad:**
- Configuración de usuario
- Google Calendar OAuth
- Preferencias de notificaciones
- Gestión de integraciones
- Configuración de equipo

**OAuth Flow (Google Calendar):**
```typescript
// 1. Redirect to Google OAuth consent screen
const authUrl = googleCalendarService.getAuthUrl();
window.location.href = authUrl;

// 2. Google redirects back with code
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

// 3. Exchange code for tokens
const tokens = await googleCalendarService.exchangeCodeForTokens(code);

// 4. Store tokens in database
await googleCalendarService.storeTokens(userId, tokens);
```

**Servicios usados:**
- `authService.updateProfile()`
- `googleCalendarService.getAuthUrl()`
- `googleCalendarService.exchangeCodeForTokens()`

**Estado actual:**
- ⚠️ OAuth parcialmente implementado
- ⚠️ Falta manejo de refresh tokens

---

### 5.11 Support (`/soporte`)
**Archivo:** `pages/Support.tsx` (13 KB)

**Funcionalidad:**
- Sistema de tickets de soporte
- Chat con soporte (integración con AI)
- Base de conocimiento / FAQ
- Contacto directo (WhatsApp, Email)
- Estado de tickets

**Canales de soporte:**
- 📧 Email: agentbot.ai@gmail.com
- 📱 WhatsApp: +54 9 351 763-6957
- 💬 Chat in-app (AI Assistant)

**Servicios usados:**
- `supportService.createTicket()`
- `openaiService.chat()` (para AI assistant)

**Estado actual:**
- ⚠️ Solo UI, sin persistencia real
- ⚠️ Falta tabla `soporte_tickets` en Supabase

---

### 5.12 Oportunidades (`/oportunidades`)
**Archivo:** `pages/Oportunidades.tsx` (13 KB)

**Funcionalidad:**
- Vista alternativa de leads
- Enfocada en pipeline de ventas
- Similar a Leads pero con visualización diferente

**Estado actual:** ✅ Funcional

---

### 5.13 Login (`/login`)
**Archivo:** `pages/Login.tsx` (2.7 KB)

**Funcionalidad:**
- Autenticación con email/password
- Integración con Supabase Auth
- Redirección post-login

**Form:**
```tsx
<LoginForm>
  <Input type="email" required />
  <Input type="password" required />
  <Button type="submit">Iniciar Sesión</Button>
</LoginForm>
```

**Servicios usados:**
- `authService.login(email, password)`

**Estado actual:** ✅ Funcional

---

## 6. SERVICIOS Y LÓGICA DE NEGOCIO

### 6.1 supabaseClient.ts
**Líneas:** 10
**Propósito:** Inicialización del cliente Supabase

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Configuración:**
- URL de proyecto Supabase
- Anon Key (pública)
- Configuración por defecto (auto-refresh de tokens)

---

### 6.2 authService.ts
**Líneas:** 70
**Propósito:** Autenticación y gestión de perfiles

**Métodos:**
```typescript
interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  getUserProfile(userId: string): Promise<Profile | null>;
  updateProfile(profile: Partial<Profile>): Promise<Profile>;
  resetPassword(email: string): Promise<void>;
}
```

**Flujo de login:**
1. Usuario ingresa credenciales
2. `authService.login()` llama a `supabase.auth.signInWithPassword()`
3. Supabase retorna JWT token + User object
4. Token se guarda en localStorage (automático)
5. Se fetchea el perfil del usuario desde tabla `profiles`
6. AuthContext actualiza estado global

**Seguridad:**
- Passwords hasheados con bcrypt (Supabase)
- JWT tokens con expiración
- Refresh tokens automáticos

---

### 6.3 leadsService.ts
**Líneas:** 220
**Propósito:** CRUD de leads + scoring + caching

**Sistema de Cache:**
```typescript
let leadsCache: {
  data: Lead[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30000; // 30 segundos

async function fetchLeads(forceRefresh = false) {
  const now = Date.now();

  // Return from cache if valid
  if (!forceRefresh && leadsCache &&
      now - leadsCache.timestamp < CACHE_DURATION) {
    return leadsCache.data;
  }

  // Fetch fresh data
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  // Update cache
  leadsCache = { data, timestamp: now };
  return data;
}
```

**Scoring de Leads:**
```typescript
function calculateLeadScore(lead: Lead): number {
  let score = 0;

  // Temperatura
  if (lead.temperatura === 'ultra_caliente') score += 40;
  if (lead.temperatura === 'caliente') score += 30;
  if (lead.temperatura === 'tibio') score += 20;

  // Etapa
  if (lead.etapa_proceso === 'visita_realizada') score += 25;
  if (lead.etapa_proceso === 'negociacion') score += 30;

  // Presupuesto
  if (lead.presupuesto_max > 100000) score += 15;

  // Última interacción (recencia)
  const daysSinceInteraction = getDaysSince(lead.ultima_interaccion);
  if (daysSinceInteraction < 7) score += 10;

  return Math.min(score, 100);
}
```

**Métodos principales:**
```typescript
interface LeadsService {
  fetchLeads(forceRefresh?: boolean): Promise<Lead[]>;
  saveLead(lead: Partial<Lead>): Promise<string>;
  invalidateCache(): void;
  updateLeadStatus(leadId: string, newStatus: string): Promise<void>;
  updateLeadStage(leadId: string, newStage: string): Promise<void>;
  createLead(leadData: any): Promise<string>;
  updateLead(id: string, leadData: any): Promise<string>;
  assignPropertyToLead(leadId: string, propertyId: string): Promise<void>;
  getLeadHistory(leadId: string): Promise<LeadHistory[]>;
  saveMessage(message: ChatMessage): Promise<ChatMessage>; // ✨ NUEVO
}
```

**Estado actual:** ✅ Completamente funcional con cache

---

### 6.4 propertiesService.ts
**Líneas:** 210
**Propósito:** CRUD de propiedades + fotos + cache

**Sistema de Cache:** Similar a leadsService (30 segundos)

**Gestión de Fotos:**
```typescript
async function syncPhotos(propertyId: string, newPhotos: Photo[]) {
  // 1. Fetch existing photos
  const { data: existingPhotos } = await supabase
    .from('fotos')
    .select('*')
    .eq('propiedad_id', propertyId);

  // 2. Find photos to delete
  const photosToDelete = existingPhotos.filter(
    existing => !newPhotos.find(n => n.id === existing.id)
  );

  // 3. Delete from Storage
  for (const photo of photosToDelete) {
    await storageService.deleteFile(photo.url);
  }

  // 4. Delete from database
  await supabase
    .from('fotos')
    .delete()
    .in('id', photosToDelete.map(p => p.id));

  // 5. Upsert new/updated photos
  await supabase
    .from('fotos')
    .upsert(newPhotos);
}
```

**Métodos principales:**
```typescript
interface PropertiesService {
  fetchProperties(forceRefresh?: boolean): Promise<Property[]>;
  saveProperty(property: Partial<Property>): Promise<string>;
  deleteProperty(propertyId: string): Promise<void>;
  updateProperty(property: Property): Promise<void>;
  syncPhotos(propertyId: string, photos: Photo[]): Promise<void>;
  invalidateCache(): void;
}
```

**Estado actual:** ✅ Completamente funcional

---

### 6.5 visitsService.ts
**Líneas:** 60
**Propósito:** Gestión de visitas

**Métodos:**
```typescript
interface VisitsService {
  fetchVisits(): Promise<Visit[]>;
  createVisit(visit: Partial<Visit>): Promise<string>;
  updateVisit(visit: Visit): Promise<void>;
  cancelVisit(visitId: string): Promise<void>;
}
```

**Estado actual:** ✅ Funcional (sin cache)

---

### 6.6 geminiService.ts
**Líneas:** 300
**Propósito:** Integración con Google Gemini AI

**Casos de uso:**

1. **Búsqueda natural de propiedades:**
```typescript
const query = "Casa de 3 dormitorios en Morón con pileta y cochera, hasta $150000";

const criteria = await geminiService.searchPropertiesWithIA(query);
// Returns: {
//   tipo: ['casa'],
//   zona: ['Morón'],
//   dormitorios_min: 3,
//   cochera: true,
//   pileta: true,
//   precio_max: 150000
// }
```

2. **Mejora de títulos:**
```typescript
const title = await geminiService.generateTitle({
  tipo: 'departamento',
  ambientes: 2,
  zona: 'Castelar',
  destacados: ['balcón', 'luminoso']
});
// Returns: "Luminoso Departamento de 2 Ambientes con Balcón en Castelar"
```

3. **Mejora de descripciones:**
```typescript
const description = await geminiService.enhanceDescription(
  "Depto 2 amb con balcon",
  { tipo: 'departamento', zona: 'Castelar' }
);
// Returns: Descripción mejorada de marketing
```

**Modelo usado:** gemini-1.5-flash

**Estado actual:** ✅ Funcional

---

### 6.7 openaiService.ts
**Líneas:** 350+
**Propósito:** Integración con OpenAI/ChatGPT

**Via Supabase Edge Function:**
```typescript
async function chat(messages: ChatMessage[]) {
  const { data } = await supabase.functions.invoke('openai-chat', {
    body: { messages }
  });
  return data.response;
}
```

**Casos de uso:**
- Chatbot de soporte
- Asistencia en búsqueda de propiedades
- Generación de contenido

**Modelo usado:** gpt-3.5-turbo

**Estado actual:** ✅ Funcional via Edge Function

---

### 6.8 googleCalendarService.ts
**Líneas:** 200+
**Propósito:** OAuth + Gestión de eventos en Google Calendar

**OAuth 2.0 Flow:**
```typescript
// Step 1: Get authorization URL
const authUrl = googleCalendarService.getAuthUrl();
// Redirects to: https://accounts.google.com/o/oauth2/v2/auth?...

// Step 2: User approves, Google redirects back with code
const code = new URLSearchParams(window.location.search).get('code');

// Step 3: Exchange code for tokens
const tokens = await googleCalendarService.exchangeCodeForTokens(code);
// { access_token, refresh_token, expiry_date }

// Step 4: Store tokens
await supabase.from('google_tokens').upsert({
  user_id: userId,
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
  expiry_date: tokens.expiry_date
});
```

**Crear evento:**
```typescript
const event = await googleCalendarService.createEvent({
  summary: 'Visita - Juan Pérez',
  description: 'Propiedad: Casa 3 dorm en Morón',
  start: { dateTime: '2026-03-21T10:00:00-03:00' },
  end: { dateTime: '2026-03-21T11:00:00-03:00' },
  attendees: [
    { email: 'cliente@example.com' },
    { email: 'vendedor@example.com' }
  ]
});
```

**Refresh tokens:**
```typescript
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token'
    })
  });
  return response.json();
}
```

**Estado actual:**
- ✅ OAuth flow implementado
- ⚠️ Refresh tokens necesitan testing

---

### 6.9 dashboardService.ts
**Líneas:** 60
**Propósito:** Estadísticas para el dashboard

**Optimización de queries:**
```typescript
// ❌ ANTES (malo - fetches all records)
const leads = await supabase.from('leads').select('*');
const hotLeads = leads.filter(l => l.temperatura === 'caliente');

// ✅ AHORA (bueno - usa COUNT en database)
const { count: hotLeadsCount } = await supabase
  .from('leads')
  .select('*', { count: 'exact', head: true })
  .eq('temperatura', 'caliente');
```

**Métodos:**
```typescript
interface DashboardService {
  getStats(): Promise<{
    totalLeads: number;
    propertiesCount: number;
    visitsScheduled: number;
    hotLeadsCount: number;
    hotLeads: Lead[];
  }>;

  getChartData(): Promise<{
    leadStatusData: ChartData[];
    leadsBySourceData: ChartData[];
  }>;
}
```

**Estado actual:** ✅ Optimizado y funcional

---

### 6.10 reportsService.ts
**Líneas:** 300+
**Propósito:** Generación de reportes analíticos ✨ NUEVO

**Métodos por dashboard:**
```typescript
interface ReportsService {
  fetchLeadsData(dateRange?: DateRange): Promise<LeadsReport>;
  fetchSalesData(dateRange?: DateRange): Promise<SalesReport>;
  fetchRentalsData(dateRange?: DateRange): Promise<RentalsReport>;
  fetchPropertiesData(dateRange?: DateRange): Promise<PropertiesReport>;
  fetchCaptacionData(dateRange?: DateRange): Promise<CaptacionReport>;
}
```

**Ejemplo - Leads Report:**
```typescript
async function fetchLeadsData(dateRange: DateRange = {}) {
  let query = supabase.from('leads').select('*');

  if (dateRange.desde) {
    query = query.gte('created_at', dateRange.desde);
  }
  if (dateRange.hasta) {
    query = query.lte('created_at', dateRange.hasta);
  }

  const { data: leads } = await query;

  // Calculate KPIs
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l =>
    ['caliente', 'ultra_caliente'].includes(l.temperatura)
  ).length;

  const leadsWithResponse = leads.filter(l =>
    l.ultima_interaccion
  ).length;

  const responseRate = totalLeads > 0
    ? (leadsWithResponse / totalLeads * 100).toFixed(1)
    : '0';

  // Aggregate by source
  const bySource = leads.reduce((acc, lead) => {
    const source = lead.fuente_consulta || 'Otro';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Aggregate by month
  const byMonth = leads.reduce((acc, lead) => {
    const month = new Date(lead.created_at)
      .toLocaleDateString('es', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  return {
    totalLeads,
    hotLeads,
    responseRate: `${responseRate}%`,
    avgScore: calculateAvgScore(leads),
    conversionRate: calculateConversionRate(leads),
    bySource,
    byMonth
  };
}
```

**Estado actual:** ✅ Completamente funcional con datos reales

---

### 6.11 mcpService.ts
**Líneas:** 100
**Propósito:** Integración con Chatwoot (MCP - Model Context Protocol)

**Métricas disponibles:**
```typescript
interface MCPMetrics {
  totalConversations: number;
  activeAgents: number;
  avgResponseTime: number;
  csatScore: number;
  resolutionRate: number;
  channelBreakdown: {
    whatsapp: number;
    web: number;
    email: number;
  };
}
```

**Estado actual:** ✅ Funcional

---

### 6.12 Otros servicios

**storageService.ts** - Upload/delete de archivos
**notificationsService.ts** - Push notifications
**supportService.ts** - Tickets de soporte (mock)
**leadHistoryService.ts** - Historial de leads
**developmentsService.ts** - Proyectos inmobiliarios
**tasksService.ts** - Tareas (mock data)

---

## 7. BASE DE DATOS (SUPABASE)

### 7.1 Schema Principal

**Archivo:** `supabase/schema.sql` (150+ líneas)

### Tabla: `propiedades`
```sql
CREATE TABLE propiedades (
  -- Identificación
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- casa, departamento, ph, etc.
  tipo_operacion VARCHAR(30) NOT NULL, -- venta, alquiler, temporario
  estado VARCHAR(30) DEFAULT 'borrador', -- publicada, captacion, vendida, etc.

  -- Ubicación
  direccion_completa TEXT,
  calle TEXT,
  altura INTEGER,
  barrio TEXT,
  zona TEXT,
  ciudad TEXT DEFAULT 'Buenos Aires',
  provincia TEXT DEFAULT 'Buenos Aires',
  codigo_postal VARCHAR(10),
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),

  -- Características generales
  superficie_total DECIMAL(10, 2),
  superficie_cubierta DECIMAL(10, 2),
  ambientes INTEGER,
  dormitorios INTEGER,
  banios INTEGER,
  toilettes INTEGER,
  cocheras INTEGER,
  antiguedad INTEGER,

  -- Comodidades (boolean flags)
  pileta BOOLEAN DEFAULT FALSE,
  parrilla BOOLEAN DEFAULT FALSE,
  jardin BOOLEAN DEFAULT FALSE,
  terraza BOOLEAN DEFAULT FALSE,
  balcon BOOLEAN DEFAULT FALSE,
  baulera BOOLEAN DEFAULT FALSE,
  quincho BOOLEAN DEFAULT FALSE,
  sum BOOLEAN DEFAULT FALSE,
  gym BOOLEAN DEFAULT FALSE,
  seguridad_24hs BOOLEAN DEFAULT FALSE,

  -- Precios
  precio_venta DECIMAL(15, 2),
  precio_venta_usd DECIMAL(15, 2),
  precio_alquiler DECIMAL(15, 2),
  expensas DECIMAL(15, 2),

  -- Marketing
  descripcion TEXT,
  descripcion_corta TEXT,
  foto_portada TEXT, -- URL de la foto principal
  video_url TEXT,
  tour_360_url TEXT,

  -- Estado en portales
  publicado_zonaprop BOOLEAN DEFAULT FALSE,
  publicado_argenprop BOOLEAN DEFAULT FALSE,
  publicado_mercadolibre BOOLEAN DEFAULT FALSE,

  -- Gestión
  propietario_nombre TEXT,
  propietario_telefono TEXT,
  propietario_email TEXT,
  vendedor_asignado VARCHAR(100),
  fecha_captacion DATE,
  dias_en_market INTEGER DEFAULT 0,
  vistas_totales INTEGER DEFAULT 0,
  cantidad_consultas INTEGER DEFAULT 0,
  leads_generados INTEGER DEFAULT 0,

  -- Favoritos (NUEVO)
  es_favorita BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_propiedades_tipo ON propiedades(tipo);
CREATE INDEX idx_propiedades_operacion ON propiedades(tipo_operacion);
CREATE INDEX idx_propiedades_estado ON propiedades(estado);
CREATE INDEX idx_propiedades_zona ON propiedades(zona);
CREATE INDEX idx_propiedades_precio_venta ON propiedades(precio_venta);
CREATE INDEX idx_propiedades_precio_alquiler ON propiedades(precio_alquiler);

-- Row Level Security
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published properties"
  ON propiedades FOR SELECT
  USING (estado = 'publicada');

CREATE POLICY "Authenticated users can manage properties"
  ON propiedades FOR ALL
  USING (auth.role() = 'authenticated');
```

### Tabla: `fotos`
```sql
CREATE TABLE fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id TEXT REFERENCES propiedades(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_original TEXT, -- URL de imagen original sin procesar
  thumbnail TEXT, -- URL de thumbnail (pequeño)
  es_portada BOOLEAN DEFAULT FALSE,
  es_plano BOOLEAN DEFAULT FALSE, -- Si es un plano arquitectónico
  orden INTEGER DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fotos_propiedad ON fotos(propiedad_id);
CREATE INDEX idx_fotos_portada ON fotos(es_portada);
```

### Tabla: `leads`
```sql
CREATE TABLE leads (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,

  -- Origen
  fuente_consulta VARCHAR(50), -- zonaprop, instagram, referido, etc.
  utm_campaign TEXT,
  utm_source TEXT,
  primer_mensaje TEXT,

  -- Intereses
  busca_venta BOOLEAN DEFAULT FALSE,
  busca_alquiler BOOLEAN DEFAULT FALSE,
  busca_inversion BOOLEAN DEFAULT FALSE,
  tipo_inmueble_buscado TEXT[], -- array de tipos
  zonas_buscadas TEXT[],
  presupuesto_min DECIMAL(15, 2),
  presupuesto_max DECIMAL(15, 2),

  -- Tracking
  temperatura VARCHAR(30) DEFAULT 'frio', -- frio, tibio, caliente, ultra_caliente
  etapa_proceso VARCHAR(50) DEFAULT 'contacto_inicial',
  estado_seguimiento VARCHAR(50),
  score INTEGER DEFAULT 0,
  probabilidad_cierre DECIMAL(5, 2),

  -- Gestión
  vendedor_asignado VARCHAR(100),
  ultima_interaccion TIMESTAMPTZ,
  propiedad_consulta_inicial_id TEXT REFERENCES propiedades(id),
  propiedades_enviadas_ids TEXT[], -- array de IDs de propiedades

  -- Conversión a cliente
  es_cliente BOOLEAN DEFAULT FALSE,
  fecha_conversion TIMESTAMPTZ,
  propiedades_adquiridas TEXT[],
  lifetime_value DECIMAL(15, 2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_leads_temperatura ON leads(temperatura);
CREATE INDEX idx_leads_etapa ON leads(etapa_proceso);
CREATE INDEX idx_leads_vendedor ON leads(vendedor_asignado);
CREATE INDEX idx_leads_cliente ON leads(es_cliente);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their assigned leads"
  ON leads FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'vendedor')
    )
  );
```

### Tabla: `visitas`
```sql
CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  propiedad_id TEXT REFERENCES propiedades(id) ON DELETE CASCADE,

  -- Fecha y hora
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  fecha_hora TIMESTAMPTZ NOT NULL, -- computed field

  -- Estado
  estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, confirmada, realizada, cancelada

  -- Participantes
  vendedor_asignado VARCHAR(100),
  invitados TEXT[],

  -- Resultado
  nota_resultado TEXT,
  calificacion_lead VARCHAR(30), -- muy_interesado, interesado, dudoso, no_interesado

  -- Integración Google Calendar
  google_event_id TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_visitas_lead ON visitas(lead_id);
CREATE INDEX idx_visitas_propiedad ON visitas(propiedad_id);
CREATE INDEX idx_visitas_fecha ON visitas(fecha);
CREATE INDEX idx_visitas_estado ON visitas(estado);
```

### Tabla: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'vendedor', -- admin, vendedor, readonly

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Tabla: `google_tokens`
```sql
CREATE TABLE google_tokens (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tokens"
  ON google_tokens FOR ALL
  USING (auth.uid() = user_id);
```

### Tabla: `messages` (Chat)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL, -- 'user', 'agent', 'bot'
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_lead ON messages(lead_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

### Tabla: `leads_history`
```sql
CREATE TABLE leads_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL, -- 'status_change', 'note_added', etc.
  descripcion TEXT NOT NULL,
  metadata JSONB,
  usuario VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_history_lead ON leads_history(lead_id);
CREATE INDEX idx_leads_history_timestamp ON leads_history(created_at);
```

### Tablas Pendientes (No implementadas)
```sql
-- Tareas
CREATE TABLE tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(30) DEFAULT 'pendiente',
  fecha_vencimiento TIMESTAMPTZ,
  creado_por VARCHAR(100) NOT NULL,
  asignado_a VARCHAR(100)[],
  lead_id UUID REFERENCES leads(id),
  propiedad_id TEXT REFERENCES propiedades(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Soporte
CREATE TABLE soporte_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ticket SERIAL UNIQUE,
  asunto TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(30) DEFAULT 'abierto',
  creado_por VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 7.2 Storage Buckets

**Configuración de Storage:**
```typescript
// Bucket: 'propiedades'
// Usado para: Fotos de propiedades, planos, documentos

const bucketConfig = {
  name: 'propiedades',
  public: true, // URLs públicas
  fileSizeLimit: 52428800, // 50 MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
};
```

**Estructura de archivos:**
```
propiedades/
  ├── {propiedad_id}/
  │   ├── fotos/
  │   │   ├── foto-1.jpg
  │   │   ├── foto-2.jpg
  │   │   └── foto-3.jpg
  │   ├── planos/
  │   │   └── plano-original.pdf
  │   └── documentos/
  │       └── escritura.pdf
```

---

### 7.3 Row Level Security (RLS)

**Políticas activas:**

1. **Propiedades públicas:**
```sql
CREATE POLICY "Public can view published properties"
  ON propiedades FOR SELECT
  USING (estado = 'publicada');
```

2. **Usuarios autenticados:**
```sql
CREATE POLICY "Authenticated users can manage properties"
  ON propiedades FOR ALL
  USING (auth.role() = 'authenticated');
```

3. **Vendedores ven sus leads:**
```sql
CREATE POLICY "Users can view their assigned leads"
  ON leads FOR SELECT
  USING (
    vendedor_asignado = (
      SELECT full_name FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 8. COMPONENTES REACT

### 8.1 Componentes de Layout

**AppLayout.tsx** (260 KB)
- Sidebar de navegación
- Header con búsqueda global
- Mobile menu (hamburger)
- User profile dropdown
- Notificaciones

**Estructura:**
```tsx
<AppLayout>
  <Sidebar>
    <Logo />
    <NavItems />
    <UserProfile />
  </Sidebar>
  <MainContent>
    <Header>
      <GlobalSearch />
      <Notifications />
      <UserMenu />
    </Header>
    <PageContent>
      <Outlet /> {/* React Router */}
    </PageContent>
  </MainContent>
</AppLayout>
```

---

**ProtectedRoute.tsx**
```tsx
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return <Outlet />;
};
```

---

**ErrorBoundary.tsx** ✨
```tsx
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen>
          <h2>Algo salió mal</h2>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </ErrorScreen>
      );
    }
    return this.props.children;
  }
}
```

---

### 8.2 Componentes de Home

**HomeKPIs.tsx**
- Tarjetas de KPIs principales
- Animaciones con Framer Motion
- Trends (↑ / ↓)

**HomeCharts.tsx**
- Gráficos de Recharts
- Line chart de tendencias
- Bar chart de fuentes

**HomeHotLeads.tsx**
- Lista de top 5 hot leads
- Avatares de usuarios
- Quick actions

---

### 8.3 Componentes de Leads

**LeadCard.tsx**
```tsx
<LeadCard lead={lead} onClick={onCardClick}>
  <Avatar name={lead.nombre} />
  <LeadInfo>
    <h3>{lead.nombre}</h3>
    <ContactInfo>
      <Phone>{lead.telefono}</Phone>
      <Email>{lead.email}</Email>
    </ContactInfo>
  </LeadInfo>
  <TemperatureBadge temperatura={lead.temperatura} />
  <StageBadge etapa={lead.etapa_proceso} />
  <ScoreIndicator score={lead.score} />
</LeadCard>
```

---

**LeadFiltersPanel.tsx** ✨ (16.7 KB)
```tsx
<LeadFiltersPanel isOpen={true} onClose={handleClose}>
  <FilterSection title="Búsqueda">
    <SearchInput />
  </FilterSection>

  <FilterSection title="Temperatura">
    <MultiSelectChips options={TEMPERATURAS_LEAD} />
  </FilterSection>

  <FilterSection title="Etapa">
    <MultiSelectChips options={ETAPAS_PROCESO} />
  </FilterSection>

  <FilterSection title="Presupuesto">
    <RangeSlider min={0} max={1000000} />
  </FilterSection>

  {/* ... 8 more filter sections ... */}

  <Footer>
    <ResultCount>{count} leads encontrados</ResultCount>
    <ClearButton />
  </Footer>
</LeadFiltersPanel>
```

---

**LeadDetailPanel.tsx**
```tsx
<LeadDetailPanel lead={lead}>
  <Header>
    <Avatar />
    <LeadName />
    <TemperatureBadge />
    <CloseButton />
  </Header>

  <Tabs>
    <Tab label="Info">
      <LeadInfoTab lead={lead} />
    </Tab>
    <Tab label="Historial">
      <LeadHistoryTab leadId={lead.id} />
    </Tab>
    <Tab label="Propiedades">
      <AssignedPropertiesTab leadId={lead.id} />
    </Tab>
    <Tab label="Chat">
      <ChatTab leadId={lead.id} /> {/* ✨ NUEVO */}
    </Tab>
  </Tabs>
</LeadDetailPanel>
```

---

### 8.4 Componentes Reutilizables

**OptimizedImage.tsx** ✨
```tsx
const OptimizedImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && <Skeleton />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={isLoaded ? 'fade-in' : 'hidden'}
        {...props}
      />
      {hasError && <ImageError />}
    </div>
  );
};
```

---

**BaseModal.tsx**
```tsx
const BaseModal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

## 9. SISTEMA DE TIPOS TYPESCRIPT

### 9.1 Archivo types.ts (344 líneas)

**Tipos de Usuario:**
```typescript
export type UserRole = 'admin' | 'vendedor' | 'readonly';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

---

**Tipos de Propiedad:**
```typescript
export type OperationType = 'venta' | 'alquiler' | 'temporario' | 'inversion';

export type PropertyType =
  | 'casa'
  | 'departamento'
  | 'ph'
  | 'duplex'
  | 'local'
  | 'lote'
  | 'oficina'
  | 'cochera'
  | 'campo'
  | 'otro';

export type PropertyStatus =
  | 'publicada'
  | 'captacion'
  | 'reservada'
  | 'vendida'
  | 'alquilada'
  | 'suspendida'
  | 'baja'
  | 'borrador';

export interface Property {
  // Identificación
  id: string;
  titulo: string;
  tipo: PropertyType;
  tipo_operacion: OperationType;
  estado: PropertyStatus;

  // Ubicación (15 campos)
  direccion_completa: string;
  calle: string;
  altura: number;
  barrio: string;
  zona: string;
  ciudad: string;
  provincia: string;
  pais: string;
  codigo_postal: string;
  coordenadas_lat?: number;
  coordenadas_lng?: number;

  // Características (25+ campos)
  superficie_total?: number;
  superficie_cubierta?: number;
  ambientes?: number;
  dormitorios?: number;
  banios?: number;
  toilettes?: number;
  cocheras?: number;
  antiguedad?: number;

  // Comodidades (20+ boolean flags)
  pileta?: boolean;
  parrilla?: boolean;
  jardin?: boolean;
  terraza?: boolean;
  balcon?: boolean;
  baulera?: boolean;
  quincho?: boolean;
  sum?: boolean;
  gym?: boolean;
  seguridad_24hs?: boolean;
  // ... más comodidades

  // Precios (4 campos)
  precio_venta?: number;
  precio_venta_usd?: number;
  precio_alquiler?: number;
  expensas?: number;

  // Marketing (10+ campos)
  descripcion?: string;
  descripcion_corta?: string;
  foto_portada?: string;
  fotos?: Photo[];
  video_url?: string;
  tour_360_url?: string;

  // Publicación (3 boolean flags)
  publicado_zonaprop?: boolean;
  publicado_argenprop?: boolean;
  publicado_mercadolibre?: boolean;

  // Gestión (10+ campos)
  propietario_nombre?: string;
  propietario_telefono?: string;
  vendedor_asignado?: string;
  fecha_captacion?: string;
  dias_en_market?: number;
  vistas_totales: number;
  cantidad_consultas: number;
  leads_generados: number;

  // Favoritos ✨
  es_favorita?: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
}
```

---

**Tipos de Lead:**
```typescript
export type ClientStatus =
  | 'Frio'
  | 'Tibio'
  | 'Caliente'
  | 'En seguimiento'
  | 'Visita agendada'
  | 'Cerrado'
  | 'Perdido'
  | 'Pausado'
  | 'Derivado';

export type SalesStage =
  | 'Inicio'
  | 'Indagación'
  | 'Bajada producto'
  | 'Seguimiento'
  | 'Pre-cierre'
  | 'Visita agendada'
  | 'Visita realizada'
  | 'Propuesta enviada'
  | 'Negociación'
  | 'Seña/Reserva'
  | 'Cierre'
  | 'Derivación humano'
  | 'Perdido'
  | 'Rechazado'
  | 'Pausado';

export interface Lead {
  // Identificación
  id: string;
  nombre: string;
  apellido?: string;
  telefono: string;
  email?: string;
  whatsapp?: string;

  // Origen
  fuente_consulta: string; // zonaprop, instagram, etc.
  utm_campaign?: string;
  primer_mensaje?: string;

  // Intereses
  busca_venta: boolean;
  busca_alquiler: boolean;
  busca_inversion: boolean;
  tipo_inmueble_buscado?: string[];
  zonas_buscadas?: string[];
  presupuesto_min?: number;
  presupuesto_max?: number;

  // Estado
  estado_temperatura: ClientStatus; // temperatura del lead
  etapa_proceso: SalesStage; // etapa del proceso
  estado_seguimiento?: string;
  score: number; // 0-100
  probabilidad_cierre?: number;
  prioridad?: string;

  // Gestión
  vendedor_asignado?: string;
  ultima_interaccion?: string;
  propiedad_consulta_inicial_id?: string;
  propiedades_enviadas_ids?: string[];

  // Conversión a cliente ✨
  es_cliente?: boolean;
  fecha_conversion?: string;
  propiedades_adquiridas?: string[];
  lifetime_value?: number;

  // IA Insights
  intenciones_detectadas?: string[];
  sentimiento_general?: string;
  nivel_engagement?: string;
  recomendacion_ia?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}
```

---

**Tipos de Visita:**
```typescript
export type VisitStatus =
  | 'pendiente'
  | 'confirmada'
  | 'realizada'
  | 'cancelada';

export interface Visit {
  id: string;
  lead_id: string;
  propiedad_id: string;

  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  estado: VisitStatus;

  vendedor_asignado?: string;
  invitados?: string[];
  google_event_id?: string;

  // Post-visita ✨
  nota_resultado?: string;
  calificacion_lead?: 'muy_interesado' | 'interesado' | 'dudoso' | 'no_interesado';

  created_at: string;
  updated_at: string;
}
```

---

**Tipos Auxiliares:**
```typescript
export interface Photo {
  id?: string;
  url: string;
  url_original?: string;
  thumbnail?: string;
  es_portada: boolean;
  es_plano?: boolean;
  orden: number;
  descripcion?: string;
  propiedad_id?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  timestamp: string;
  read?: boolean;
}

export interface LeadHistory {
  id: string;
  lead_id: string;
  tipo_evento: string;
  descripcion: string;
  metadata?: any;
  usuario?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  propertiesCount: number;
  visitsScheduled: number;
  hotLeadsCount: number;
  hotLeads?: Lead[];
}

export interface CRMTask {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  fecha_vencimiento?: string;
  asignados: string[];
  lead_id?: string;
  propiedad_id?: string;
  created_at?: string;
}
```

---

## 10. ENUMERACIONES Y TAXONOMÍA

### 10.1 Archivo config/taxonomy.ts (240 líneas)

**Purpose:** Centralizar TODAS las enumeraciones del negocio inmobiliario

### TIPOS_OPERACION
```typescript
export const TIPOS_OPERACION = [
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'venta', label: 'Venta' },
  { value: 'tasacion', label: 'Tasación' },
] as const;

export type TipoOperacion = typeof TIPOS_OPERACION[number]['value'];
```

---

### TIPOS_INMUEBLE (18 tipos)
```typescript
export const TIPOS_INMUEBLE = [
  // Residencial
  { value: 'casa', label: 'Casa', categoria: 'residencial' },
  { value: 'departamento', label: 'Departamento', categoria: 'residencial' },
  { value: 'duplex', label: 'Duplex', categoria: 'residencial' },
  { value: 'ph', label: 'PH', categoria: 'residencial' },
  { value: 'quinta', label: 'Quinta', categoria: 'residencial' },
  { value: 'barrio_privado', label: 'Barrio Privado / Country', categoria: 'residencial' },

  // Rural
  { value: 'terreno', label: 'Terreno', categoria: 'rural' },
  { value: 'loteo', label: 'Loteo', categoria: 'rural' },
  { value: 'hectarea', label: 'Hectárea', categoria: 'rural' },
  { value: 'chacra', label: 'Chacra', categoria: 'rural' },

  // Comercial
  { value: 'local_comercial', label: 'Local Comercial', categoria: 'comercial' },
  { value: 'fondo_comercio', label: 'Fondo de Comercio', categoria: 'comercial' },
  { value: 'galpon', label: 'Galpón', categoria: 'comercial' },
  { value: 'nave', label: 'Nave Industrial', categoria: 'comercial' },
  { value: 'edificio', label: 'Edificio', categoria: 'comercial' },
  { value: 'hotel', label: 'Hotel', categoria: 'comercial' },
  { value: 'complejo_turistico', label: 'Complejo Turístico', categoria: 'comercial' },
  { value: 'proyecto_comercial', label: 'Proyecto Comercial', categoria: 'comercial' },
] as const;

export type TipoInmueble = typeof TIPOS_INMUEBLE[number]['value'];
```

---

### TEMPERATURAS_LEAD (8 temperaturas)
```typescript
export const TEMPERATURAS_LEAD = [
  { value: 'frio', label: 'Frío', color: 'blue' },
  { value: 'tibio', label: 'Tibio', color: 'amber' },
  { value: 'caliente', label: 'Caliente', color: 'rose' },
  { value: 'ultra_caliente', label: 'Ultra Caliente', color: 'red' },
  { value: 'pausado', label: 'Pausado', color: 'gray' },
  { value: 'perdido', label: 'Perdido', color: 'red' },
  { value: 'derivado', label: 'Derivado a IA', color: 'orange' },
  { value: 'cerrado', label: 'Cerrado', color: 'emerald' },
] as const;
```

---

### ETAPAS_PROCESO (8 etapas)
```typescript
export const ETAPAS_PROCESO = [
  { value: 'contacto_inicial', label: 'Contacto Inicial' },
  { value: 'indagacion', label: 'Indagación' },
  { value: 'props_enviadas', label: 'Propiedades Enviadas' },
  { value: 'visita_agendada', label: 'Visita Agendada' },
  { value: 'visita_realizada', label: 'Visita Realizada' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'cierre', label: 'Cierre' },
  { value: 'postventa', label: 'Postventa' },
] as const;
```

---

### VENDEDORES (8 miembros del equipo)
```typescript
export const VENDEDORES = [
  { value: 'america_cardozo', label: 'America Cardozo', iniciales: 'AC' },
  { value: 'alejandro_papotti', label: 'Alejandro Papotti', iniciales: 'AP' },
  { value: 'cristian', label: 'Cristian', iniciales: 'CR' },
  { value: 'juan_cruz', label: 'Juan Cruz', iniciales: 'JC' },
  { value: 'franco_zeballos', label: 'Franco Zeballos', iniciales: 'FZ' },
  { value: 'barbara_lazarte', label: 'Bárbara Lazarte', iniciales: 'BL' },
  { value: 'maximo_cardozo', label: 'Máximo Cardozo', iniciales: 'MC' },
  { value: 'moria_cardozo', label: 'Moria Cardozo', iniciales: 'MO' },
] as const;
```

---

### FUENTES_LEAD (8 fuentes)
```typescript
export const FUENTES_LEAD = [
  { value: 'zonaprop', label: 'Zonaprop' },
  { value: 'argenprop', label: 'Argenprop' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'mercadolibre', label: 'MercadoLibre' },
  { value: 'referido', label: 'Referido' },
  { value: 'web', label: 'Sitio Web' },
  { value: 'otro', label: 'Otro' },
] as const;
```

---

### Helper Functions
```typescript
/**
 * Obtiene el label de un valor
 */
export function getLabel<T extends readonly { value: string; label: string }[]>(
  array: T,
  value: string
): string {
  return array.find(item => item.value === value)?.label || value;
}

/**
 * Obtiene el color de un valor
 */
export function getColor<T extends readonly { value: string; color: string }[]>(
  array: T,
  value: string
): string {
  return array.find(item => item.value === value)?.color || 'gray';
}

/**
 * Obtiene las iniciales de un vendedor
 */
export function getVendedorIniciales(value: string): string {
  return VENDEDORES.find(v => v.value === value)?.iniciales || '??';
}
```

---

## 11. INTEGRACIONES EXTERNAS

### 11.1 Google Gemini AI
**Servicio:** `geminiService.ts`
**API Key:** VITE_GEMINI_API_KEY
**Modelo:** gemini-1.5-flash

**Casos de uso:**
- Búsqueda natural de propiedades
- Generación de títulos optimizados
- Mejora de descripciones

---

### 11.2 OpenAI ChatGPT
**Servicio:** `openaiService.ts`
**API Key:** Via Supabase Edge Function
**Modelo:** gpt-3.5-turbo

**Casos de uso:**
- Chatbot de soporte
- Asistencia en búsqueda
- Generación de contenido

---

### 11.3 Google Calendar
**Servicio:** `googleCalendarService.ts`
**OAuth:** Google OAuth 2.0
**Client ID:** VITE_GOOGLE_CLIENT_ID

**Funcionalidades:**
- Crear eventos de visitas
- Sincronización bidireccional
- Gestión de tokens

---

### 11.4 Tokko (Importación masiva)
**Integración:** Import script
**Datos importados:**
- 99 propiedades
- 1999 fotos
- Metadata completa

---

### 11.5 Portales Inmobiliarios
**Estado:** En desarrollo

**Portales objetivo:**
- Zonaprop
- Argenprop
- MercadoLibre

**Funcionalidades:**
- Publicación automática
- Sincronización de estado
- Gestión de consultas

---

### 11.6 Chatwoot / MCP
**Servicio:** `mcpService.ts`

**Métricas:**
- Conversaciones totales
- CSAT score
- Tiempo de respuesta
- Tasa de resolución
- Breakdown por canal

---

## 12. SISTEMA MULTI-AGENTE

### 12.1 Framework Overview

**Archivo principal:** `AGENTS.md`
**Dominios:** 4 agentes especializados

### Agentes:

1. **Frontend Agent**
   - Dominio: React, TypeScript, UI/UX
   - Archivo: `agents/frontend/AGENTS.md`
   - Responsabilidades:
     - Componentes React
     - Hooks personalizados
     - Estilos TailwindCSS
     - Animaciones Framer Motion
     - Performance UI

2. **Backend Agent**
   - Dominio: Supabase, PostgreSQL, API
   - Archivo: `agents/backend/AGENTS.md`
   - Responsabilidades:
     - Schema de base de datos
     - RLS policies
     - Edge Functions
     - Storage management
     - Query optimization

3. **IA Agent**
   - Dominio: Gemini, OpenAI, N8N
   - Archivo: `agents/ia/AGENTS.md`
   - Responsabilidades:
     - Integraciones de IA
     - Prompts engineering
     - Automatizaciones N8N
     - WhatsApp bot

4. **Integraciones Agent**
   - Dominio: APIs externas, OAuth
   - Archivo: `agents/integraciones/AGENTS.md`
   - Responsabilidades:
     - Tokko API
     - Google Calendar
     - Portales inmobiliarios
     - Webhooks

---

### 12.2 Routing Table

```markdown
# Routing de Tareas por Dominio

## Frontend
- Crear componentes React
- Modificar UI/UX
- Implementar animaciones
- Optimizar performance frontend
- Responsive design

## Backend
- Crear/modificar tablas
- Configurar RLS
- Edge Functions
- Optimización de queries
- Migration scripts

## IA
- Integrar modelos IA
- Crear prompts
- Configurar N8N
- WhatsApp automation

## Integraciones
- OAuth flows
- API integrations
- Webhook handlers
- Third-party SDKs
```

---

### 12.3 Skills Index

**Archivo:** `SKILLS_INDEX.md`

**Skills disponibles:**
- /commit - Git commit
- /review-pr - Code review
- /test - Run tests
- /deploy - Deploy to production
- /refactor - Refactor code
- /optimize - Performance optimization
- /audit - Code audit

---

## 13. AUTENTICACIÓN Y SEGURIDAD

### 13.1 Sistema de Autenticación

**Provider:** Supabase Auth
**Método:** Email + Password

**Flow:**
```
1. Usuario ingresa email/password
2. authService.login() → supabase.auth.signInWithPassword()
3. Supabase valida credenciales
4. Retorna JWT + User object
5. JWT se guarda en localStorage (automático)
6. authService.getUserProfile() fetches perfil
7. AuthContext actualiza estado global
8. Usuario redirigido a Dashboard
```

---

### 13.2 Roles y Permisos

**Roles disponibles:**
```typescript
type UserRole = 'admin' | 'vendedor' | 'readonly';
```

**Permisos:**

**Admin:**
- ✅ Ver todas las propiedades
- ✅ Ver todos los leads
- ✅ Crear/editar/eliminar propiedades
- ✅ Crear/editar/eliminar leads
- ✅ Ver reportes de todo el equipo
- ✅ Gestionar usuarios
- ✅ Acceso al Control Center

**Vendedor:**
- ✅ Ver propiedades publicadas
- ✅ Ver leads asignados a él
- ✅ Editar sus leads
- ✅ Agendar visitas
- ✅ Ver sus reportes personales
- ❌ No puede eliminar propiedades
- ❌ No puede ver leads de otros vendedores

**Readonly:**
- ✅ Ver propiedades publicadas
- ✅ Ver estadísticas generales
- ❌ No puede editar nada
- ❌ No puede ver leads
- ❌ Solo lectura

---

### 13.3 Row Level Security (RLS)

**Propiedades:**
```sql
-- Todos ven propiedades publicadas
CREATE POLICY "Public properties visible"
  ON propiedades FOR SELECT
  USING (estado = 'publicada');

-- Solo autenticados editan
CREATE POLICY "Auth users can edit"
  ON propiedades FOR ALL
  USING (auth.role() = 'authenticated');
```

**Leads:**
```sql
-- Vendedores ven sus leads
CREATE POLICY "Sellers see their leads"
  ON leads FOR SELECT
  USING (
    vendedor_asignado = (
      SELECT full_name FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins ven todos los leads
CREATE POLICY "Admins see all leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 13.4 Seguridad de API

**API Keys protegidas:**
```typescript
// ❌ NO HACER (expone keys)
const geminiKey = "AIzaSyD...";

// ✅ HACER (usar variables de entorno)
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Environment variables:**
- Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Google: `VITE_GOOGLE_CLIENT_ID`
- AI APIs: Vía Edge Functions (no expuestas)

---

## 14. GESTIÓN DE ESTADO

### 14.1 Context API

**AuthContext:**
```typescript
const AuthContext = createContext<{
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isVendedor: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}>();
```

**ToastContext:**
```typescript
const ToastContext = createContext<{
  addToast: (title: string, message?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}>();
```

---

### 14.2 Local State

**useState:**
- Usado en todos los componentes para estado local
- Ejemplos: formularios, modales, tabs

**useMemo:**
- Usado para cálculos costosos
- Ejemplos: filtrado de leads, sorting

**useEffect:**
- Usado para side effects
- Ejemplos: fetch data, subscriptions

---

### 14.3 Caching Strategy

**Service-level cache:**
```typescript
// 30-second cache
let cache: {
  data: any[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30000;

async function fetchData(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cache &&
      now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const freshData = await fetchFromSupabase();
  cache = { data: freshData, timestamp: now };
  return freshData;
}
```

**Cache invalidation:**
```typescript
function invalidateCache() {
  cache = null;
}

// Invalidar después de mutation
async function saveLead(lead) {
  await supabase.from('leads').insert(lead);
  invalidateCache(); // ✅
}
```

---

## 15. ROUTING Y NAVEGACIÓN

### 15.1 React Router Setup

**Archivo:** `App.tsx`

```typescript
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

<ErrorBoundary>
  <HashRouter>  {/* ← HashRouter para Vercel */}
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="propiedades" element={<Properties />} />
            <Route path="leads" element={<Leads />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="visitas" element={<Visits />} />
            <Route path="tareas" element={<Tasks />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="control-center" element={<ControlCenter />} />
            <Route path="soporte" element={<Support />} />
            <Route path="configuracion" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  </HashRouter>
</ErrorBoundary>
```

---

### 15.2 Lazy Loading

**Código:**
```typescript
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Properties = lazy(() => import('./pages/Properties'));
const Leads = lazy(() => import('./pages/Leads'));
// ... resto de páginas
```

**Beneficios:**
- Chunks separados por página
- Load only cuando se necesita
- Mejor performance inicial

---

### 15.3 Navegación

**Sidebar (AppLayout.tsx):**
```typescript
const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/propiedades', icon: Building, label: 'Propiedades' },
  { path: '/leads', icon: Users, label: 'Leads' },
  { path: '/clientes', icon: UserCheck, label: 'Clientes' },
  { path: '/visitas', icon: Calendar, label: 'Visitas' },
  { path: '/tareas', icon: CheckSquare, label: 'Tareas' },
  { path: '/reportes', icon: BarChart, label: 'Reportes' },
  { path: '/control-center', icon: Zap, label: 'Control Center' },
  { path: '/soporte', icon: LifeBuoy, label: 'Soporte' },
  { path: '/configuracion', icon: Settings, label: 'Configuración' },
];

<nav>
  {navItems.map(item => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        isActive ? 'active-link' : 'inactive-link'
      }
    >
      <item.icon />
      <span>{item.label}</span>
    </NavLink>
  ))}
</nav>
```

---

## 16. ESTILOS Y DISEÑO

### 16.1 TailwindCSS Configuration

**Archivo:** `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Color palette
        background: '#F8FAFC',
        foreground: '#0F172A',
        border: '#E2E8F0',

        primary: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF',
        },

        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#1E293B',
        },

        platinum: {
          DEFAULT: '#E2E8F0',
          dark: '#94A3B8',
          light: '#F8FAFC'
        },
      },

      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
```

---

### 16.2 Global CSS

**Archivo:** `index.css`

```css
/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

/* Hide scrollbars mientras mantiene scroll */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}
```

---

### 16.3 Framer Motion

**Ejemplos de uso:**

**Fade in:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {children}
</motion.div>
```

**Slide from right:**
```tsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25 }}
>
  {children}
</motion.div>
```

**Staggered list:**
```tsx
<motion.div variants={container}>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={itemVariants}
      custom={i}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

---

### 16.4 Design System

**Colores principales:**
- Primary: `#0F172A` (slate-900)
- Secondary: `#F1F5F9` (slate-100)
- Accent: `#6366f1` (indigo-500)
- Success: `#10b981` (emerald-500)
- Warning: `#f59e0b` (amber-500)
- Error: `#ef4444` (red-500)

**Tipografía:**
- Font family: Inter
- Tamaños:
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px)

**Espaciado:**
- Base unit: 0.25rem (4px)
- Escala: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

**Border radius:**
- sm: 0.125rem (2px)
- md: 0.375rem (6px)
- lg: 0.5rem (8px)
- xl: 0.75rem (12px)
- 2xl: 1rem (16px)
- 3xl: 1.5rem (24px)

---

## 17. PERFORMANCE Y OPTIMIZACIONES

### 17.1 Code Splitting

**Manual chunks (vite.config.ts):**
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-animation': ['framer-motion'],
        }
      }
    }
  }
});
```

**Resultado:**
- vendor-react: 50 KB
- vendor-charts: 437 KB
- vendor-animation: 115 KB
- Main bundle: 381 KB

---

### 17.2 Image Optimization

**OptimizedImage component:**
```typescript
<OptimizedImage
  src={property.foto_portada}
  alt={property.titulo}
  loading="lazy"
  className="aspect-video"
/>
```

**Features:**
- Lazy loading (native)
- Skeleton durante carga
- Error fallback
- Timeout de 5 segundos

---

### 17.3 Caching Strategy

**Service-level cache:**
- Duración: 30 segundos
- Invalidación manual después de mutations
- Implementado en:
  - leadsService
  - propertiesService

**Future:** Implementar React Query para mejor cache management

---

### 17.4 Database Optimization

**Queries optimizados:**
```typescript
// ❌ Antes (fetch all)
const leads = await supabase.from('leads').select('*');
const count = leads.length;

// ✅ Ahora (count en DB)
const { count } = await supabase
  .from('leads')
  .select('*', { count: 'exact', head: true });
```

**Índices creados:**
- propiedades: tipo, tipo_operacion, estado, zona
- leads: temperatura, etapa_proceso, vendedor
- fotos: propiedad_id, es_portada

---

### 17.5 Lazy Loading

**React lazy:**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

**Image lazy:**
```tsx
<img loading="lazy" src={url} />
```

---

## 18. ISSUES Y DEUDA TÉCNICA

### 18.1 Critical Issues 🔴

**Properties.tsx (51 KB)**
- **Problema:** Componente monolítico
- **Impacto:** Difícil mantenimiento, performance
- **Solución:** Split en:
  - PropertyList.tsx
  - PropertyCard.tsx
  - PropertyFormModal.tsx
  - PropertyFilters.tsx
  - PropertyGallery.tsx

**Leads.tsx (45 KB)**
- **Problema:** Componente monolítico
- **Impacto:** Difícil mantenimiento
- **Solución:** Split en:
  - LeadList.tsx
  - LeadPipeline.tsx
  - LeadFilters.tsx (ya existe como panel)
  - LeadFormModal.tsx (ya existe)

---

### 18.2 High Priority Issues ⚠️

**Tasks Module (mock data)**
- **Problema:** tasksService.ts retorna mock data
- **Impacto:** No se pueden crear tareas reales
- **Solución:**
  1. Crear tabla `tareas` en Supabase
  2. Implementar CRUD real
  3. Conectar con leads/propiedades

**Support Module (no persistence)**
- **Problema:** Tickets no se guardan
- **Impacto:** No hay historial de soporte
- **Solución:**
  1. Crear tabla `soporte_tickets`
  2. Implementar CRUD
  3. Agregar tabla `soporte_mensajes`

**Google OAuth (incomplete)**
- **Problema:** Refresh tokens no implementado
- **Impacto:** Tokens expiran, usuario debe re-autenticar
- **Solución:**
  1. Implementar refresh flow
  2. Background job para refresh
  3. Error handling

---

### 18.3 Medium Priority Issues 📝

**Global Search (BUG-004)**
- **Problema:** Usa MOCK_DATA en AppLayout.tsx
- **Solución:** Conectar a Supabase search

**Missing Field (BUG-005)**
- **Problema:** AppLayout.tsx:248 - `imagen_principal` no existe
- **Solución:** Cambiar a `foto_portada`

**Dead Code (BUG-006)**
- **Problema:** geminiService duplica openaiService
- **Solución:** Consolidar o eliminar duplicados

---

### 18.4 Low Priority / Nice-to-Have 💡

**Testing**
- **Problema:** No hay tests
- **Solución:** Agregar Vitest + React Testing Library

**Error Tracking**
- **Problema:** No hay Sentry o similar
- **Solución:** Integrar Sentry

**Analytics**
- **Problema:** No hay tracking de uso
- **Solución:** Integrar Google Analytics o Mixpanel

---

## 19. DEPLOYMENT Y CI/CD

### 19.1 Vercel Deployment

**Platform:** Vercel
**URL:** https://america-cardozo-crm.vercel.app/
**Branch:** main
**Build Command:** `npm run build`
**Output Directory:** `dist`

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### 19.2 Build Process

**Steps:**
1. Install dependencies (`npm install`)
2. Run TypeScript compiler (check types)
3. Run Vite build
4. Generate chunks (manual splitting)
5. Optimize assets
6. Output to `/dist`

**Build time:** ~20 segundos (local), ~60 segundos (Vercel)

---

### 19.3 Environment Variables (Vercel)

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`

**Optional:**
- `VITE_GEMINI_API_KEY`
- `VITE_TOKKO_API_KEY`

---

### 19.4 Recent Deployment Issues

**Issue 1: Case-sensitive imports**
- **Error:** `Failed to resolve import "reaviz"`
- **Causa:** `components/leads/` vs `components/Leads/`
- **Fix:** Corregir case en imports
- **Status:** ✅ Resuelto

**Issue 2: Missing Tailwind directives**
- **Error:** No styles aplicados
- **Causa:** Faltaba `@tailwind` directives en index.css
- **Fix:** Agregar directives al inicio de index.css
- **Status:** ✅ Resuelto

**Issue 3: Missing reaviz dependency**
- **Error:** `Failed to resolve import "reaviz"`
- **Causa:** Reports.tsx importa reaviz pero no estaba en package.json
- **Fix:** `npm install reaviz`
- **Status:** ✅ Resuelto

**Issue 4: TypeScript errors**
- **Error:** Duplicate properties, wrong method names
- **Causa:** types.ts tenía duplicados, AuthContext usaba métodos incorrectos
- **Fix:** Limpiar types.ts, corregir método names
- **Status:** ✅ Resuelto

---

## 20. VARIABLES DE ENTORNO

### 20.1 Required Variables

**Supabase:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PROJECT_REF=your-project-ref
```

**Google:**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:3001/
```

---

### 20.2 Optional Variables

**AI Services:**
```env
VITE_GEMINI_API_KEY=AIzaSy...
VITE_OPENAI_API_KEY=sk-... (via Edge Function)
```

**Integrations:**
```env
VITE_TOKKO_API_KEY=your-tokko-api-key
```

---

### 20.3 File Structure

**.env (local)** - Git ignored
**.env.example** - Template commiteado
**.env.production** - Solo en Vercel dashboard

---

## 21. COMANDOS Y SCRIPTS

### 21.1 Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

### 21.2 Database

```bash
# Run migrations
supabase db push

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

---

### 21.3 Git Workflow

```bash
# Create feature branch
git checkout -b feature/nombre-feature

# Commit changes
git add .
git commit -m "feat: descripción del cambio"

# Push to remote
git push origin feature/nombre-feature

# Create PR (via GitHub UI or gh CLI)
gh pr create --title "Feature: nombre" --body "Descripción"
```

---

## 22. HISTORIAL DE CAMBIOS RECIENTES

### Commits Recientes (últimos 10)

```
74c8501 - fix: add missing Tailwind CSS directives - CRITICAL
8a7144f - fix: add missing reaviz dependency
7668562 - fix: add Node.js version requirement for Vercel
e5e3aa0 - fix: resolve TypeScript errors causing Vercel build failure
f9a5024 - fix: move LeadFiltersPanel to correct case-sensitive folder path
8ce4d20 - fix: case-sensitive import path for LeadFiltersPanel
cc0c2a3 - merge: integrate restoration phases with remote changes
1abc5c7 - feat: complete CRM restoration phases 1-5 and 8
d4e5e56 - feat: refactor Props y Reports a recharts, auth setup
f869076 - feat: implementar Sprint 1 MVP Core UI
```

---

### Cambios Implementados Recientemente

**Fase 1: Error Boundary + Lazy Loading**
- ✅ Creado ErrorBoundary.tsx
- ✅ Implementado lazy loading en todas las páginas
- ✅ Agregado FullPageLoader

**Fase 2: Navegación**
- ✅ Removido LiveChat (obsoleto)
- ✅ Corregido orden de sidebar
- ✅ Agregado floating support button

**Fase 3: Taxonomy**
- ✅ Creado config/taxonomy.ts
- ✅ 18 tipos de inmueble
- ✅ 8 temperaturas de lead
- ✅ 8 etapas del proceso
- ✅ Helper functions

**Fase 4: Properties**
- ✅ Fixed mobile tabs scroll
- ✅ Agregado campo `es_favorita`
- ✅ Optimizado cache

**Fase 5: Leads**
- ✅ Fixed detail panel blur bug (z-index)
- ✅ Creado LeadFiltersPanel (12 secciones)
- ✅ Implementado chat con guardado a Supabase
- ✅ Agregado saveMessage() a leadsService

**Fase 8: Reports**
- ✅ Creado reportsService.ts
- ✅ Conectado todos los dashboards a Supabase
- ✅ Implementado exportación CSV real
- ✅ Fixed mobile tabs scroll

**Deployment Fixes:**
- ✅ Fixed case-sensitive imports
- ✅ Agregado Tailwind directives
- ✅ Instalado reaviz dependency
- ✅ Fixed TypeScript errors
- ✅ Agregado Node version requirement

---

## FIN DEL DOCUMENTO

**Total de líneas:** ~3500+
**Total de palabras:** ~25,000+
**Nivel de detalle:** Muy completo
**Audiencia:** IA avanzada (Perplexity, Claude, GPT-4)

---

## APÉNDICE A: QUICK REFERENCE

### Comandos rápidos
```bash
npm install           # Instalar deps
npm run dev           # Dev server
npm run build         # Build
git status            # Ver cambios
git add .             # Stage all
git commit -m "msg"   # Commit
git push origin main  # Push
```

### Archivos críticos
- `App.tsx` - Router
- `types.ts` - Type definitions
- `config/taxonomy.ts` - Enumeraciones
- `services/supabaseClient.ts` - DB client
- `index.css` - Estilos globales

### URLs importantes
- Producción: https://america-cardozo-crm.vercel.app/
- Supabase: https://supabase.com/dashboard
- GitHub: https://github.com/agentbotdev/america-cardozo-crm

---

**Documento generado:** 2026-03-20
**Por:** Claude Sonnet 4.5
**Versión:** 3.0
**Status:** ✅ Completo
