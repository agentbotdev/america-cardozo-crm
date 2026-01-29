-- =====================================================
-- DATOS DE PRUEBA - AMERICA CARDOZO CRM
-- =====================================================
-- Ejecutar DESPUÉS de schema.sql
-- Este script carga datos demo para testing
-- =====================================================

-- =====================================================
-- 1. PROPIEDADES DEMO
-- =====================================================

-- Propiedad 1: Casa en Nordelta
INSERT INTO propiedades (
  id, titulo, tipo, tipo_operacion, estado,
  direccion_completa, calle, altura, barrio, zona, ciudad, provincia, codigo_postal,
  ambientes, dormitorios, banos, toilettes, cochera, cantidad_cocheras,
  balcon, terraza, patio, jardin, quincho, parrilla, pileta, lavadero, baulera,
  superficie_cubierta, sup_total_lote,
  ascensor, calefaccion, aire_acondicionado, seguridad, apto_profesional, acepta_mascotas,
  sum, gimnasio, pileta_comun, seguridad_24hs,
  agua, gas, cloacas, luz, internet,
  escritura, plano_aprobado, apto_credito,
  precio_venta, moneda_venta, acepta_permuta,
  publicada_mercadolibre, publicada_zonaprop, publicada_argenprop, publicada_web_america,
  foto_portada_url,
  cantidad_consultas, vistas_totales, leads_generados
) VALUES (
  'p1', 'Moderna Casa en Nordelta', 'casa', 'venta', 'publicada',
  'Av. Del Golf 230, Nordelta, Tigre', 'Av. Del Golf', 230, 'Nordelta', 'Norte', 'Tigre', 'Buenos Aires', '1670',
  6, 4, 5, 2, true, 3,
  true, true, true, true, true, true, true, true, true,
  380, 450,
  false, true, true, true, false, true,
  true, true, false, true,
  true, true, true, true, true,
  true, true, true,
  850000, 'USD', true,
  true, true, true, true,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  14, 450, 12
);

-- Fotos para Propiedad 1
INSERT INTO fotos (propiedad_id, url, es_portada, orden) VALUES
('p1', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', true, 1),
('p1', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', false, 2),
('p1', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', false, 3);

-- Propiedad 2: Departamento en Recoleta
INSERT INTO propiedades (
  id, titulo, tipo, tipo_operacion, estado,
  direccion_completa, calle, altura, barrio, zona, ciudad, provincia, codigo_postal,
  ambientes, dormitorios, banos, toilettes, cochera, cantidad_cocheras,
  balcon, terraza, patio, jardin, lavadero, baulera,
  superficie_cubierta, sup_total_lote,
  ascensor, calefaccion, aire_acondicionado, seguridad,
  agua, gas, cloacas, luz, internet,
  escritura, plano_aprobado, apto_credito,
  precio_venta, moneda_venta, acepta_permuta,
  publicada_mercadolibre, publicada_zonaprop, publicada_argenprop, publicada_web_america,
  foto_portada_url,
  cantidad_consultas, vistas_totales, leads_generados
) VALUES (
  'p2', 'Piso Exclusivo Recoleta', 'departamento', 'venta', 'publicada',
  'Av. Alvear 1800, Recoleta, CABA', 'Av. Alvear', 1800, 'Recoleta', 'CABA', 'CABA', 'Buenos Aires', '1014',
  5, 3, 3, 1, true, 2,
  true, false, false, false, true, true,
  260, 280,
  true, true, true, true,
  true, true, true, true, true,
  true, true, true,
  1200000, 'USD', false,
  true, true, true, true,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  8, 320, 5
);

INSERT INTO fotos (propiedad_id, url, es_portada, orden) VALUES
('p2', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', true, 1),
('p2', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d', false, 2);

-- Propiedad 3: Departamento en Palermo
INSERT INTO propiedades (
  id, titulo, tipo, tipo_operacion, estado,
  calle, altura, barrio, zona, ciudad, provincia,
  ambientes, dormitorios, banos, cochera, cantidad_cocheras,
  balcon, superficie_cubierta,
  ascensor, calefaccion, aire_acondicionado,
  agua, gas, cloacas, luz, internet,
  precio_venta, moneda_venta,
  foto_portada_url,
  publicada_web_america, cantidad_consultas, vistas_totales
) VALUES (
  'p3', 'Moderno 2 Ambientes en Palermo Soho', 'departamento', 'venta', 'publicada',
  'Gorriti', 4500, 'Palermo', 'CABA', 'CABA', 'Buenos Aires',
  2, 1, 1, false, 0,
  true, 55,
  true, true, true,
  true, true, true, true, true,
  180000, 'USD',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  true, 22, 180
);

INSERT INTO fotos (propiedad_id, url, es_portada) VALUES
('p3', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', true);

-- Propiedad 4: Casa en San Isidro
INSERT INTO propiedades (
  id, titulo, tipo, tipo_operacion, estado,
  calle, altura, barrio, zona, ciudad, provincia,
  ambientes, dormitorios, banos, cochera, cantidad_cocheras,
  patio, jardin, parrilla, superficie_cubierta,
  calefaccion, agua, gas, cloacas, luz,
  precio_venta, moneda_venta,
  foto_portada_url,
  publicada_web_america
) VALUES (
  'p4', 'Hermosa Casa Familiar San Isidro', 'casa', 'venta', 'publicada',
  'Diego Carman', 800, 'San Isidro', 'Norte', 'San Isidro', 'Buenos Aires',
  5, 3, 2, true, 2,
  true, true, true, 220,
  true, true, true, true, true,
  450000, 'USD',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
  true
);

INSERT INTO fotos (propiedad_id, url, es_portada) VALUES
('p4', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', true);

-- Propiedad 5: Departamento para alquiler
INSERT INTO propiedades (
  id, titulo, tipo, tipo_operacion, estado,
  calle, altura, barrio, zona, ciudad, provincia,
  ambientes, dormitorios, banos, superficie_cubierta,
  ascensor, agua, gas, luz,
  precio_alquiler, moneda_alquiler, expensas_mensuales,
  foto_portada_url,
  publicada_web_america
) VALUES (
  'p5', '3 Ambientes Luminoso - Belgrano', 'departamento', 'alquiler', 'publicada',
  'Juramento', 2200, 'Belgrano', 'CABA', 'CABA', 'Buenos Aires',
  3, 2, 1, 75,
  true, true, true, true,
  850000, 'ARS', 120000,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  true
);

INSERT INTO fotos (propiedad_id, url, es_portada) VALUES
('p5', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', true);

-- Propiedades 6-10: Más variedad
INSERT INTO propiedades (id, titulo, tipo, tipo_operacion, estado, barrio, ciudad, provincia, dormitorios, banos, superficie_cubierta, precio_venta, moneda_venta, foto_portada_url, publicada_web_america, calle, altura) VALUES
('p6', 'PH Moderno en Villa Urquiza', 'ph', 'venta', 'publicada', 'Villa Urquiza', 'CABA', 'Buenos Aires', 2, 2, 110, 280000, 'USD', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d', true, 'Monroe', 4800),
('p7', 'Loft Industrial Barracas', 'departamento', 'venta', 'publicada', 'Barracas', 'CABA', 'Buenos Aires', 1, 1, 65, 150000, 'USD', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', true, 'Suárez', 1200),
('p8', 'Casa Quinta en Pilar', 'casa', 'venta', 'publicada', 'Pilar', 'Pilar', 'Buenos Aires', 4, 3, 320, 550000, 'USD', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be', true, 'Ruta 8', 1500),
('p9', 'Oficina Premium Puerto Madero', 'oficina', 'alquiler', 'publicada', 'Puerto Madero', 'CABA', 'Buenos Aires', 0, 2, 180, 3500000, 'ARS', 'https://images.unsplash.com/photo-1497366216548-37526070297c', true, 'Juana Manso', 500),
('p10', 'Duplex con Terraza - Caballito', 'duplex', 'venta', 'publicada', 'Caballito', 'CABA', 'Buenos Aires', 3, 2, 140, 320000, 'USD', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e', true, 'Acoyte', 600);

-- Fotos para propiedades adicionales
INSERT INTO fotos (propiedad_id, url, es_portada) VALUES
('p6', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d', true),
('p7', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', true),
('p8', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be', true),
('p9', 'https://images.unsplash.com/photo-1497366216548-37526070297c', true),
('p10', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e', true);

-- =====================================================
-- 2. LEADS DEMO
-- =====================================================

INSERT INTO leads (
  nombre, apellido, telefono, email,
  fuente_consulta, tipo_operacion_buscada, tipo_propiedad_buscada, zonas_interes,
  presupuesto_max, temperatura, etapa, score,
  intenciones_detectadas, sentimiento_general, nivel_engagement,
  propiedades_enviadas_ids
) VALUES 
('Juan', 'García', '+54 9 11 1234-5678', 'juan.garcia@email.com',
 'Zonaprop', 'venta', ARRAY['casa', 'duplex'], ARRAY['Nordelta', 'Santa Barbara'],
 500000, 'caliente', 'indagacion', 85,
 ARRAY['Mudanza rápida', 'Interés en Nordelta'], 'Positivo', 'Alto',
 ARRAY['p1']
),

('María', 'Rodríguez', '+54 9 11 2345-6789', 'maria.r@gmail.com',
 'MercadoLibre', 'venta', ARRAY['departamento'], ARRAY['Recoleta', 'Palermo'],
 200000, 'caliente', 'props_enviadas', 78,
 ARRAY['Primera vivienda', 'Buen presupuesto'], 'Muy positivo', 'Alto',
 ARRAY['p2', 'p3']
),

('Carlos', 'Pérez', '+54 9 11 3456-7890', 'carlos.perez@hotmail.com',
 'Web America', 'alquiler', ARRAY['departamento'], ARRAY['Belgrano', 'Núñez'],
 800000, 'tibio', 'contacto_inicial', 60,
 ARRAY['Mudanza urgente'], 'Neutro', 'Medio',
 NULL
),

('Ana', 'López', '+54 9 11 4567-8901', 'ana.lopez@yahoo.com',
 'Referido', 'venta', ARRAY['casa'], ARRAY['San Isidro', 'Vicente López'],
 600000, 'caliente', 'visita_agendada', 92,
 ARRAY['Familia grande', 'Necesita jardín'], 'Muy positivo', 'Muy alto',
 ARRAY['p4']
),

('Luis', 'Martínez', '+54 9 11 5678-9012', 'luis.m@outlook.com',
 'Instagram', 'venta', ARRAY['departamento', 'ph'], ARRAY['Palermo', 'Villa Urquiza'],
 250000, 'tibio', 'indagacion', 55,
 ARRAY['Primera inversión'], 'Positivo', 'Medio',
 ARRAY['p6', 'p7']
),

('Sofía', 'González', '+54 9 11 6789-0123', 'sofia.g@gmail.com',
 'Zonaprop', 'venta', ARRAY['departamento'], ARRAY['Belgrano', 'Recoleta'],
 180000, 'caliente', 'negociacion', 88,
 ARRAY['Pre-aprobación crédito'], 'Muy positivo', 'Alto',
 ARRAY['p3']
),

('Miguel', 'Fernández', '+54 9 11 7890-1234', NULL,
 'Facebook', 'alquiler', ARRAY['departamento'], ARRAY['Caballito', 'Flores'],
 600000, 'frio', 'contacto_inicial', 30,
 NULL, 'Neutro', 'Bajo',
 NULL
),

('Elena', 'Sánchez', '+54 9 11 8901-2345', 'elena.sanchez@email.com',
 'Web America', 'venta', ARRAY['casa', 'quinta'], ARRAY['Pilar', 'Escobar'],
 700000, 'tibio', 'props_enviadas', 65,
 ARRAY['Busca más espacio'], 'Positivo', 'Medio',
 ARRAY['p8']
),

('Pedro', 'Díaz', '+54 9 11 9012-3456', 'pedro.diaz@company.com',
 'Google Ads', 'alquiler', ARRAY['oficina'], ARRAY['Puerto Madero', 'Catalinas'],
 4000000, 'caliente', 'visita_realizada', 80,
 ARRAY['Empresa en expansión'], 'Positivo', 'Alto',
 ARRAY['p9']
),

('Laura', 'Torres', '+54 9 11 0123-4567', 'laura.t@gmail.com',
 'Referido', 'venta', ARRAY['departamento'], ARRAY['Palermo', 'Belgrano'],
 200000, 'caliente', 'indagacion', 75,
 ARRAY['Joven profesional'], 'Muy positivo', 'Alto',
 ARRAY['p3', 'p5']
);

-- Leads adicionales con menos detalles (10 más)
INSERT INTO leads (nombre, telefono, fuente_consulta, tipo_operacion_buscada, temperatura, etapa, score) VALUES
('Martín Castro', '+54 9 11 1111-2222', 'Zonaprop', 'venta', 'tibio', 'contacto_inicial', 50),
('Lucía Romero', '+54 9 11 2222-3333', 'ArgentProp', 'alquiler', 'frio', 'contacto_inicial', 40),
('Fernando Díaz', '+54 9 11 3333-4444', 'MercadoLibre', 'venta', 'caliente', 'props_enviadas', 82),
('Claudia Morales', '+54 9 11 4444-5555', 'Web America', 'venta', 'tibio', 'indagacion', 58),
('Ricardo Vega', '+54 9 11 5555-6666', 'Facebook', 'alquiler', 'frio', 'pausado', 25),
('Daniela Silva', '+54 9 11 6666-7777', 'Instagram', 'venta', 'caliente', 'visita_agendada', 90),
('Gustavo Rojas', '+54 9 11 7777-8888', 'Referido', 'venta', 'tibio', 'contacto_inicial', 55),
('Valeria Núñez', '+54 9 11 8888-9999', 'Google', 'alquiler', 'caliente', 'negociacion', 85),
('Hernán Ramos', '+54 9 11 9999-0000', 'Zonaprop', 'venta', 'frio', 'perdido', 20),
('Patricia Méndez', '+54 9 11 0000-1111', 'Web America', 'venta', 'caliente', 'cierre', 95);

-- =====================================================
-- 3. VISITAS DEMO
-- =====================================================

INSERT INTO visitas (lead_id, lead_nombre, propiedad_id, property_titulo, vendedor_id, fecha, hora, estado, pipeline_stage)
SELECT 
  l.id,
  l.nombre || ' ' || COALESCE(l.apellido, ''),
  'p1',
  'Moderna Casa en Nordelta',
  'agent-1',
  CURRENT_DATE + INTERVAL '2 days',
  '10:00',
  'agendada',
  'pendiente'
FROM leads l
WHERE l.nombre = 'Juan'
LIMIT 1;

INSERT INTO visitas (lead_id, lead_nombre, propiedad_id, property_titulo, vendedor_id, fecha, hora, estado, pipeline_stage)
SELECT 
  l.id,
  l.nombre || ' ' || COALESCE(l.apellido, ''),
  'p4',
  'Hermosa Casa Familiar San Isidro',
  'agent-1',
  CURRENT_DATE + INTERVAL '3 days',
  '15:00',
  'confirmada',
  'preparacion'
FROM leads l
WHERE l.nombre = 'Ana'
LIMIT 1;

INSERT INTO visitas (lead_id, lead_nombre, propiedad_id, property_titulo, vendedor_id, fecha, hora, estado, pipeline_stage, notas)
SELECT 
  l.id,
  l.nombre || ' ' || COALESCE(l.apellido, ''),
  'p9',
  'Oficina Premium Puerto Madero',
  'agent-1',
  CURRENT_DATE - INTERVAL '1 day',
  '14:00',
  'realizada',
  'seguimiento',
  'Muy interesado, está evaluando el espacio con el equipo'
FROM leads l
WHERE l.nombre = 'Pedro'
LIMIT 1;

-- =====================================================
-- FINALIZADO
-- =====================================================
-- Datos de prueba cargados exitosamente
-- Próximo paso: verificar datos en Supabase Dashboard
