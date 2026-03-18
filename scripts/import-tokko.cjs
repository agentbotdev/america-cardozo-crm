/**
 * Import Tokko Broker properties → Supabase
 * 
 * Usage: node scripts/import-tokko.cjs
 * 
 * Fetches all 99 properties from Tokko API, maps them to Supabase schema,
 * upserts properties + photos, and logs the sync result.
 */

const TOKKO_API_KEY = '66368c945908aa80155efbe2dc607631ceef80b5';
const TOKKO_BASE = 'https://www.tokkobroker.com/api/v1';
const SUPABASE_URL = 'https://kywossjvyttklegvqgtt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d29zc2p2eXR0a2xlZ3ZxZ3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTUxODMsImV4cCI6MjA4NDQ3MTE4M30.iPXqPjvCAsYCK4k2XwEadYKdX9mGkcvWx-6GFLDBqJ4';

const PAGE_SIZE = 20;

// ---- Helpers ----

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function supabaseRequest(path, method, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${res.status} — ${text}`);
  }
  return res;
}

// ---- Tokko Fetching ----

async function fetchAllProperties() {
  let all = [];
  let offset = 0;
  let total = null;

  while (total === null || offset < total) {
    const url = `${TOKKO_BASE}/property/?key=${TOKKO_API_KEY}&lang=es_ar&format=json&limit=${PAGE_SIZE}&offset=${offset}`;
    console.log(`   📥 Fetching offset=${offset}...`);
    const data = await fetchJSON(url);
    total = data.meta.total_count;
    all = all.concat(data.objects);
    offset += PAGE_SIZE;
    // Small delay to be nice to the API
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`   ✅ Fetched ${all.length} / ${total} properties from Tokko`);
  return all;
}

// ---- Mapping ----

function parseLocation(loc) {
  if (!loc) return {};
  const full = loc.full_location || '';
  const parts = full.split(' | ');
  return {
    location_full: full,
    location_short: loc.short_location || '',
    zona: loc.name || '',
    provincia: parts.length >= 2 ? parts[1] : '',
    barrio: loc.name || '',
    ciudad: parts.length >= 3 ? parts[2] : '',
  };
}

function parseOperations(ops) {
  const result = {
    tipo_operacion: null,
    precio_venta: null,
    precio_alquiler: null,
    moneda_venta: null,
    moneda_alquiler: null,
    precio: null,
    moneda: null,
  };

  if (!ops || ops.length === 0) return result;

  for (const op of ops) {
    const price = op.prices && op.prices[0];
    if (!price) continue;

    if (op.operation_type === 'Venta' || op.operation_id === 1) {
      result.precio_venta = price.price;
      result.moneda_venta = price.currency;
      if (!result.tipo_operacion) result.tipo_operacion = 'venta';
    } else if (op.operation_type === 'Alquiler' || op.operation_id === 2) {
      result.precio_alquiler = price.price;
      result.moneda_alquiler = price.currency;
      if (!result.tipo_operacion) result.tipo_operacion = 'alquiler';
    } else if (op.operation_type === 'Alquiler temporario' || op.operation_id === 3) {
      result.precio_alquiler = price.price;
      result.moneda_alquiler = price.currency;
      if (!result.tipo_operacion) result.tipo_operacion = 'temporario';
    }
  }

  // Set generic precio/moneda from first operation
  const firstOp = ops[0];
  const firstPrice = firstOp.prices && firstOp.prices[0];
  if (firstPrice) {
    result.precio = firstPrice.price;
    result.moneda = firstPrice.currency;
  }

  // If both venta and alquiler, set tipo_operacion to first
  if (result.precio_venta && result.precio_alquiler) {
    result.tipo_operacion = 'venta'; // Primary
  }

  return result;
}

function mapProperty(p) {
  const loc = parseLocation(p.location);
  const ops = parseOperations(p.operations);
  const owner = p.internal_data?.property_owners?.[0];

  // Determine status
  let estado = 'activo';
  if (p.deleted_at) estado = 'baja';
  else if (p.status === 1) estado = 'activo';
  else if (p.status === 2) estado = 'activo'; // status 2 also seems active based on test
  else if (p.status === 3) estado = 'reservada';

  // Find cover photo
  const coverPhoto = p.photos?.find(ph => ph.is_front_cover) || p.photos?.[0];

  return {
    tokko_id: String(p.id),
    titulo: p.publication_title || p.address || `Propiedad ${p.id}`,
    descripcion: p.description || '',
    reference_code: p.reference_code || '',
    tipo_propiedad: p.type?.name || '',
    tipo_propiedad_id: p.type?.id || null,
    tipo_propiedad_code: p.type?.code || '',
    tokko_status: p.status,
    estado,
    url_publica: p.public_url || '',
    url_booking: p.booking_url || '',
    foto_portada_url: coverPhoto?.thumb || coverPhoto?.image || null,

    // Characteristics
    ambientes: p.room_amount || 0,
    dormitorios: p.suite_amount || 0,
    banos: p.bathroom_amount || 0,
    toilettes: p.toilet_amount || 0,
    cocheras: p.parking_lot_amount || 0,
    plantas: p.floors_amount || 0,
    antiguedad: p.age || 0,
    living: p.living_amount || 0,
    comedor: p.dining_room || 0,

    // Surfaces
    superficie_total: parseFloat(p.surface) || 0,
    metros_cubiertos: parseFloat(p.roofed_surface) || 0,
    superficie_cubierta: parseFloat(p.roofed_surface) || 0,
    superficie_semicubierta: parseFloat(p.semiroofed_surface) || 0,
    superficie_descubierta: parseFloat(p.unroofed_surface) || 0,
    frente: parseFloat(p.front_measure) || 0,
    fondo: parseFloat(p.depth_measure) || 0,

    // Location
    direccion: p.address || '',
    direccion_publica: p.fake_address || p.address || '',
    direccion_real: p.real_address || p.address || '',
    coordenadas_lat: p.geo_lat ? parseFloat(p.geo_lat) : null,
    coordenadas_lng: p.geo_long ? parseFloat(p.geo_long) : null,
    ...loc,

    // Prices
    ...ops,

    // Extras
    expensas: p.expenses || 0,
    apto_credito: p.credit_eligible || '',
    estado_propiedad: p.property_condition || '',
    orientacion: p.orientation || null,

    // Contact
    productor_nombre: p.producer?.name || '',
    productor_email: p.producer?.email || '',
    productor_telefono: p.producer?.phone || p.producer?.cellphone || '',
    propietario_nombre: owner?.name || '',
    propietario_telefono: owner?.phone || owner?.cellphone || '',
    propietario_email: owner?.email || '',

    // Flags
    tags: [...(p.custom_tags || []), ...(p.tags?.map(t => t.name || t) || [])],
    tiene_video: (p.videos && p.videos.length > 0) || false,
    destacada_web: p.is_starred_on_web || false,
    alquiler_temporal: p.has_temporary_rent || false,
    precio_visible: p.web_price !== false,

    // Timestamps
    tokko_created_at: p.created_at || null,
    tokko_deleted_at: p.deleted_at || null,
    last_sync_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapPhotos(tokkoId, photos) {
  if (!photos || photos.length === 0) return [];
  return photos.map((ph, idx) => ({
    propiedad_id: String(tokkoId),
    url: ph.image || '',
    url_original: ph.original || '',
    thumbnail: ph.thumb || '',
    es_portada: ph.is_front_cover || false,
    es_plano: ph.is_blueprint || false,
    orden: ph.order || idx + 1,
    descripcion: ph.description || '',
  }));
}

// ---- Main ----

async function main() {
  console.log('🚀 Tokko → Supabase Import Starting...\n');
  const startTime = Date.now();
  let propsProcessed = 0;
  let propsNew = 0;
  let propsError = 0;
  let totalPhotos = 0;
  const errors = [];

  try {
    // 1. Fetch all properties from Tokko
    console.log('1️⃣  Fetching properties from Tokko API...');
    const tokkoProperties = await fetchAllProperties();

    // 2. Map & upsert each property
    console.log('\n2️⃣  Importing properties to Supabase...');
    
    // Process in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < tokkoProperties.length; i += BATCH_SIZE) {
      const batch = tokkoProperties.slice(i, i + BATCH_SIZE);
      const mappedBatch = batch.map(mapProperty);

      try {
        await supabaseRequest('propiedades', 'POST', mappedBatch);
        propsNew += batch.length;
        console.log(`   ✅ Batch ${Math.floor(i/BATCH_SIZE)+1}: ${batch.length} properties upserted`);
      } catch (err) {
        console.error(`   ❌ Batch ${Math.floor(i/BATCH_SIZE)+1} FAILED:`, err.message);
        // Try one by one
        for (const prop of batch) {
          try {
            const mapped = mapProperty(prop);
            await supabaseRequest('propiedades', 'POST', [mapped]);
            propsNew++;
          } catch (e2) {
            propsError++;
            errors.push({ tokko_id: prop.id, error: e2.message });
            console.error(`   ❌ Property ${prop.id} FAILED:`, e2.message);
          }
        }
      }
      propsProcessed += batch.length;
    }

    // 3. Import photos
    console.log('\n3️⃣  Importing photos...');
    for (const prop of tokkoProperties) {
      const photos = mapPhotos(prop.id, prop.photos);
      if (photos.length === 0) continue;

      try {
        // Delete existing photos for this property first
        await supabaseRequest(
          `fotos?propiedad_id=eq.${prop.id}`,
          'DELETE'
        );
        // Insert new photos in batches
        const PHOTO_BATCH = 20;
        for (let j = 0; j < photos.length; j += PHOTO_BATCH) {
          const photoBatch = photos.slice(j, j + PHOTO_BATCH);
          await supabaseRequest('fotos', 'POST', photoBatch);
        }
        totalPhotos += photos.length;
      } catch (err) {
        console.error(`   ❌ Photos for property ${prop.id} FAILED:`, err.message);
        errors.push({ tokko_id: prop.id, error: `Photos: ${err.message}` });
      }
    }
    console.log(`   ✅ Imported ${totalPhotos} photos total`);

    // 4. Log sync
    console.log('\n4️⃣  Logging sync result...');
    const duration = Math.round((Date.now() - startTime) / 1000);
    const syncLog = {
      estado: errors.length === 0 ? 'exitoso' : 'parcial',
      props_procesadas: propsProcessed,
      props_nuevas: propsNew,
      props_actualizadas: 0,
      props_desactivadas: 0,
      props_error: propsError,
      errores: errors.length > 0 ? JSON.stringify(errors) : null,
      duracion_segundos: duration,
      ejecutado_por: 'import-tokko.cjs',
    };
    await supabaseRequest('sync_log', 'POST', [syncLog]);

  } catch (err) {
    console.error('\n💥 FATAL ERROR:', err.message);
    process.exit(1);
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`
╔══════════════════════════════════════════╗
║       IMPORT COMPLETE                    ║
╠══════════════════════════════════════════╣
║ Properties processed:  ${String(propsProcessed).padStart(4)}              ║
║ Properties imported:   ${String(propsNew).padStart(4)}              ║
║ Properties failed:     ${String(propsError).padStart(4)}              ║
║ Photos imported:       ${String(totalPhotos).padStart(4)}              ║
║ Duration:              ${String(duration).padStart(4)}s             ║
║ Errors:                ${String(errors.length).padStart(4)}              ║
╚══════════════════════════════════════════╝
`);

  if (errors.length > 0) {
    console.log('⚠️ Errors:');
    errors.forEach(e => console.log(`   - tokko_id=${e.tokko_id}: ${e.error}`));
  }
}

main().catch(err => {
  console.error('💥 Unhandled error:', err);
  process.exit(1);
});
