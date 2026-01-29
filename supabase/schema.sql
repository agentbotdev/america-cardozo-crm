-- =====================================================
-- SCHEMA DE SUPABASE - AMERICA CARDOZO CRM
-- =====================================================
-- Este archivo contiene el schema completo de la base de datos
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- =====================================================

-- 1. TABLA DE PROPIEDADES
-- =====================================================

CREATE TABLE IF NOT EXISTS propiedades (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('casa', 'departamento', 'ph', 'duplex', 'local', 'lote', 'oficina', 'cochera', 'campo', 'otro')),
  tipo_operacion TEXT CHECK (tipo_operacion IN ('venta', 'alquiler', 'temporario', 'inversion')),
  estado TEXT CHECK (estado IN ('publicada', 'captacion', 'reservada', 'vendida', 'alquilada', 'suspendida', 'baja', 'borrador')) DEFAULT 'borrador',
  
  -- Ubicación
  direccion_completa TEXT,
  calle TEXT,
  altura INTEGER,
  barrio TEXT,
  zona TEXT,
  ciudad TEXT,
  provincia TEXT,
  pais TEXT DEFAULT 'Argentina',
  codigo_postal TEXT,
  coordenadas_lat FLOAT,
  coordenadas_lng FLOAT,
  link_google_maps TEXT,
  tipo_calle TEXT,
  
  -- Características Físicas
  ambientes INTEGER DEFAULT 0,
  dormitorios INTEGER DEFAULT 0,
  banos INTEGER DEFAULT 0,
  toilettes INTEGER DEFAULT 0,
  cochera BOOLEAN DEFAULT false,
  cantidad_cocheras INTEGER DEFAULT 0,
  balcon BOOLEAN DEFAULT false,
  terraza BOOLEAN DEFAULT false,
  patio BOOLEAN DEFAULT false,
  jardin BOOLEAN DEFAULT false,
  quincho BOOLEAN DEFAULT false,
  parrilla BOOLEAN DEFAULT false,
  pileta BOOLEAN DEFAULT false,
  lavadero BOOLEAN DEFAULT false,
  baulera BOOLEAN DEFAULT false,
  
  -- Superficies
  superficie_cubierta FLOAT DEFAULT 0,
  sup_semicubierta FLOAT,
  sup_descubierta FLOAT,
  sup_total_lote FLOAT,
  
  -- Adicionales
  antiguedad INTEGER,
  estado_general TEXT,
  orientacion TEXT,
  luminosidad TEXT,
  cantidad_plantas INTEGER,
  piso_edificio INTEGER,
  ascensor BOOLEAN DEFAULT false,
  calefaccion BOOLEAN DEFAULT false,
  aire_acondicionado BOOLEAN DEFAULT false,
  seguridad BOOLEAN DEFAULT false,
  apto_profesional BOOLEAN DEFAULT false,
  acepta_mascotas BOOLEAN DEFAULT false,
  
  -- Amenities
  edificio_barrio_nombre TEXT,
  sum BOOLEAN DEFAULT false,
  gimnasio BOOLEAN DEFAULT false,
  pileta_comun BOOLEAN DEFAULT false,
  seguridad_24hs BOOLEAN DEFAULT false,
  expensas_mensuales FLOAT,
  
  -- Servicios
  agua BOOLEAN DEFAULT false,
  gas BOOLEAN DEFAULT false,
  cloacas BOOLEAN DEFAULT false,
  luz BOOLEAN DEFAULT false,
  internet BOOLEAN DEFAULT false,
  
  -- Legal
  escritura BOOLEAN DEFAULT false,
  plano_aprobado BOOLEAN DEFAULT false,
  apto_credito BOOLEAN DEFAULT false,
  
  -- Precios
  precio_venta FLOAT,
  precio_alquiler FLOAT,
  moneda_venta TEXT DEFAULT 'USD',
  moneda_alquiler TEXT DEFAULT 'ARS',
  acepta_permuta BOOLEAN DEFAULT false,
  comision_inmobiliaria FLOAT,
  historial_precios JSONB,
  
  -- Marketing
  publicada_mercadolibre BOOLEAN DEFAULT false,
  link_mercadolibre TEXT,
  publicada_zonaprop BOOLEAN DEFAULT false,
  link_zonaprop TEXT,
  publicada_argenprop BOOLEAN DEFAULT false,
  link_argenprop TEXT,
  publicada_web_america BOOLEAN DEFAULT false,
  link_web_america TEXT,
  foto_portada_url TEXT,
  video BOOLEAN DEFAULT false,
  link_video TEXT,
  tour_360 BOOLEAN DEFAULT false,
  link_tour_360 TEXT,
  
  -- Gestión
  tareas_pendientes TEXT[],
  prioridad_tareas TEXT,
  captador_id TEXT,
  fecha_captacion DATE,
  fecha_publicacion DATE,
  dias_en_market INTEGER,
  propietario_nombre TEXT,
  propietario_telefono TEXT,
  
  -- Analítica
  cantidad_consultas INTEGER DEFAULT 0,
  vistas_totales INTEGER DEFAULT 0,
  leads_generados INTEGER DEFAULT 0,
  
  -- Timestamps
  fecha_alta_sistema TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_propiedades_estado ON propiedades(estado);
CREATE INDEX IF NOT EXISTS idx_propiedades_tipo_operacion ON propiedades(tipo_operacion);
CREATE INDEX IF NOT EXISTS idx_propiedades_barrio ON propiedades(barrio);
CREATE INDEX IF NOT EXISTS idx_propiedades_precio_venta ON propiedades(precio_venta);

-- =====================================================
-- 2. TABLA DE FOTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id TEXT REFERENCES propiedades(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  es_portada BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_propiedad_id ON fotos(propiedad_id);

-- =====================================================
-- 3. TABLA DE LEADS
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  rango_etario TEXT,
  ciudad_actual TEXT,
  
  -- Origen
  fuente_consulta TEXT,
  utm_campaign TEXT,
  primer_mensaje TEXT,
  
  -- Tipo de búsqueda
  tipo_operacion_buscada TEXT DEFAULT 'venta',
  tipo_propiedad_buscada TEXT[],
  zonas_interes TEXT[],
  presupuesto_max FLOAT,
  
  -- Estado y Pipeline
  temperatura TEXT CHECK (temperatura IN ('frio', 'tibio', 'caliente', 'ultra_caliente', 'pausado', 'perdido', 'derivado', 'cerrado')) DEFAULT 'tibio',
  etapa TEXT DEFAULT 'contacto_inicial',
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  probabilidad_cierre FLOAT,
  prioridad TEXT,
  
  -- IA Insights
  intenciones_detectadas TEXT[],
  sentimiento_general TEXT,
  nivel_engagement TEXT,
  recomendacion_ia TEXT,
  
  -- Relaciones
  propiedad_consulta_inicial_id TEXT,
  propiedades_enviadas_ids TEXT[],
  cantidad_visitas_agendadas INTEGER DEFAULT 0,
  responsable_asignado_id TEXT,
  
  -- Notas
  notas_internas TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_temperatura ON leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON leads(etapa);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- =====================================================
-- 4. TABLA DE VISITAS
-- =====================================================

CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  lead_nombre TEXT,
  propiedad_id TEXT REFERENCES propiedades(id) ON DELETE CASCADE,
  property_titulo TEXT,
  vendedor_id TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado TEXT CHECK (estado IN ('agendada', 'confirmada', 'en_curso', 'realizada', 'cancelada', 'reprogramada')) DEFAULT 'agendada',
  pipeline_stage TEXT DEFAULT 'pendiente',
  notas TEXT,
  timeline JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitas_lead_id ON visitas(lead_id);
CREATE INDEX IF NOT EXISTS idx_visitas_propiedad_id ON visitas(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_estado ON visitas(estado);

-- =====================================================
-- 5. TRIGGER PARA UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_propiedades_updated_at BEFORE UPDATE ON propiedades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitas_updated_at BEFORE UPDATE ON visitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) - OPCIONAL
-- =====================================================
-- Descomentar si deseas habilitar seguridad a nivel de fila
-- Por ahora, las tablas son de acceso público para desarrollo

-- ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

-- Policy para permitir lectura pública
-- CREATE POLICY "Permitir lectura pública de propiedades"
--   ON propiedades FOR SELECT
--   USING (true);

-- =====================================================
-- FINALIZADO
-- =====================================================
-- Las tablas están listas para recibir datos
-- Próximo paso: ejecutar seed_data.sql para cargar datos de prueba
