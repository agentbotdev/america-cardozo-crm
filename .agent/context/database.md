# Schema de Base de Datos — Supabase

## Tablas EXISTENTES (confirmadas por los services)

### `properties`
Propiedades inmobiliarias del CRM.
```sql
id            UUID PRIMARY KEY
titulo        TEXT
descripcion   TEXT
precio        NUMERIC
tipo          TEXT  -- 'Casa', 'Departamento', 'Local', etc.
estado        TEXT  -- 'Disponible', 'Reservada', 'Vendida', 'Alquilada'
operacion     TEXT  -- 'Venta', 'Alquiler'
direccion     TEXT
zona          TEXT
foto_portada  TEXT  -- URL (⚠️ BUG-006: en código aparece como imagen_principal)
fotos         TEXT[] -- Array de URLs
dormitorios   INT
banos         INT
superficie    NUMERIC
vendedor_id   UUID REFERENCES auth.users(id)
tokko_id      TEXT UNIQUE  -- (AGREGAR) para sync con Tokko Broker
last_synced_at TIMESTAMPTZ  -- (AGREGAR)
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `leads`
Potenciales clientes / consultas.
```sql
id            UUID PRIMARY KEY
nombre        TEXT
apellido      TEXT
email         TEXT
phone         TEXT
estado        TEXT  -- 'nuevo', 'contactado', 'calificado', 'perdido', 'convertido'
fuente        TEXT  -- 'whatsapp', 'web', 'llamada', 'tokko', 'referido'
interes       TEXT  -- 'compra', 'alquiler'
presupuesto   NUMERIC
zona_interes  TEXT
score         INT   -- 0-100, asignado por Amelia (agente IA)
vendedor_id   UUID REFERENCES auth.users(id)
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `visits`
Visitas agendadas a propiedades.
```sql
id            UUID PRIMARY KEY
lead_id       UUID REFERENCES leads(id)
property_id   UUID REFERENCES properties(id)
vendedor_id   UUID REFERENCES auth.users(id)
fecha         TIMESTAMPTZ
estado        TEXT  -- 'programada', 'realizada', 'cancelada', 'no_show'
google_event_id TEXT  -- ID del evento en Google Calendar
notas         TEXT
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `google_tokens`
Tokens OAuth de Google Calendar por usuario.
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id) UNIQUE
access_token    TEXT
refresh_token   TEXT
expires_at      TIMESTAMPTZ
calendar_id     TEXT DEFAULT 'primary'
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## Tablas FALTANTES (crear en Sprint 1-2)

### `profiles` (URGENTE — necesaria para auth y roles)
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT CHECK (role IN ('admin','vendedor','readonly')) DEFAULT 'vendedor',
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `support_tickets`
```sql
CREATE TABLE support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID REFERENCES leads(id),
  vendedor_id UUID REFERENCES auth.users(id),
  titulo      TEXT NOT NULL,
  descripcion TEXT,
  estado      TEXT CHECK (estado IN ('abierto','en_proceso','resuelto')) DEFAULT 'abierto',
  prioridad   TEXT CHECK (prioridad IN ('baja','media','alta','urgente')) DEFAULT 'media',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  tipo        TEXT,  -- 'nuevo_lead', 'visita_confirmada', 'tokko_sync', etc.
  titulo      TEXT,
  body        TEXT,
  leida       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Políticas RLS (aplicar a TODAS las tablas)
```sql
-- Ejemplo para properties:
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Admin ve todo
CREATE POLICY "admin_all" ON properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Vendedor ve solo sus propiedades
CREATE POLICY "vendedor_own" ON properties
  FOR ALL USING (vendedor_id = auth.uid());
```
Aplicar el mismo patrón a: `leads`, `visits`, `support_tickets`, `notifications`.
