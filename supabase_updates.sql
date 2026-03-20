-- BLOQUE 2: Taxonomía y asignaciones
-- Ejecutar en el SQL Editor de Supabase

-- 1. Añadir vendedor_asignado a propiedades
ALTER TABLE public.propiedades
ADD COLUMN IF NOT EXISTS vendedor_asignado UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Añadir vendedor_asignado a leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS vendedor_asignado UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Añadir estado_seguimiento a leads (basado en taxonomia)
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS estado_seguimiento TEXT DEFAULT 'Nuevo' CHECK (
  estado_seguimiento IN (
    'Nuevo',
    'Contactado',
    'En seguimiento',
    'Visita agendada',
    'Negociación',
    'Ganado',
    'Perdido'
  )
);
