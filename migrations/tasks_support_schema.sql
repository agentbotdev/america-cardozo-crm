-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRACIONES PARA MÓDULOS TAREAS Y SOPORTE
-- CRM América Cardozo
-- ══════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────────
-- PARTE A: TAREAS
-- ──────────────────────────────────────────────────────────────────────────────

-- Tabla principal de tareas (ya existe, verificar estructura)
-- Si no existe, ejecutar:
CREATE TABLE IF NOT EXISTS tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(30) DEFAULT 'pendiente',
  fecha_vencimiento TIMESTAMPTZ,
  creado_por VARCHAR(100) NOT NULL,
  asignado_a VARCHAR(100)[],
  lead_id UUID,
  propiedad_id TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de mensajes internos entre equipo
CREATE TABLE IF NOT EXISTS mensajes_internos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  de VARCHAR(100) NOT NULL,
  para VARCHAR(100) NOT NULL,
  texto TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de comentarios en tareas
CREATE TABLE IF NOT EXISTS comentarios_tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
  usuario VARCHAR(100) NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para tareas
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_prioridad ON tareas(prioridad);
CREATE INDEX IF NOT EXISTS idx_tareas_vencimiento ON tareas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_asignado ON tareas USING GIN(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_lead ON tareas(lead_id);

-- Índices para mensajes internos
CREATE INDEX IF NOT EXISTS idx_mensajes_de ON mensajes_internos(de);
CREATE INDEX IF NOT EXISTS idx_mensajes_para ON mensajes_internos(para);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes_internos(leido);

-- Índices para comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_tarea ON comentarios_tareas(tarea_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created ON comentarios_tareas(created_at);

-- ──────────────────────────────────────────────────────────────────────────────
-- PARTE B: SOPORTE
-- ──────────────────────────────────────────────────────────────────────────────

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS soporte_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ticket SERIAL UNIQUE,
  asunto TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(30) DEFAULT 'abierto',
  creado_por VARCHAR(100),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de mensajes dentro de tickets
CREATE TABLE IF NOT EXISTS soporte_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES soporte_tickets(id) ON DELETE CASCADE,
  usuario VARCHAR(100) NOT NULL,
  rol VARCHAR(20) DEFAULT 'cliente',
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para tickets de soporte
CREATE INDEX IF NOT EXISTS idx_tickets_user ON soporte_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON soporte_tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON soporte_tickets(created_at);

-- Índices para mensajes de soporte
CREATE INDEX IF NOT EXISTS idx_soporte_msgs_ticket ON soporte_mensajes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_soporte_msgs_created ON soporte_mensajes(created_at);

-- ══════════════════════════════════════════════════════════════════════════════
-- FIN DE MIGRACIONES
-- ══════════════════════════════════════════════════════════════════════════════

-- INSTRUCCIONES:
-- 1. Ejecutar este script en la consola SQL de Supabase
-- 2. Verificar que todas las tablas se crearon correctamente
-- 3. Si la tabla 'tareas' ya existe, omitir su CREATE TABLE
-- 4. Los índices se crean solo si no existen (IF NOT EXISTS)
