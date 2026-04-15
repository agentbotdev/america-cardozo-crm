import { supabase } from './supabaseClient';
import { Property, Photo, PropertyType } from '../types';

// Cache para propiedades
let propertiesCache: { data: Property[]; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

/** Campos necesarios para la card de propiedad (sin select *) */
const LIST_SELECT = [
    'tokko_id', 'titulo', 'barrio',
    'precio_venta', 'precio_alquiler', 'moneda_venta', 'moneda_alquiler', 'moneda',
    'foto_portada_url', 'tipo_operacion', 'tipo_propiedad',
    'ambientes', 'dormitorios', 'banos', 'superficie_cubierta', 'estado', 'created_at',
].join(', ');

export const PAGE_SIZE = 24;

/** Normaliza una fila de propiedades para la lista/cards (sin fotos) */
const normalizeForCard = (p: Record<string, unknown>): Property => ({
    ...(p as unknown as Property),
    id: String(p['tokko_id'] ?? ''),
    fotos: [],
    titulo: (p['titulo'] as string | undefined) ?? `Propiedad en ${p['barrio'] ?? 'Venta/Alquiler'}`,
    tipo: ((p['tipo_propiedad'] as string | undefined) ?? 'otro') as PropertyType,
    direccion_completa: '',
    ambientes: (p['ambientes'] as number | undefined) ?? 0,
    dormitorios: (p['dormitorios'] as number | undefined) ?? 0,
    banos_completos: (p['banos'] as number | undefined) ?? 0,
    sup_cubierta: (p['superficie_cubierta'] as number | undefined) ?? 0,
    sup_total_lote: 0,
    foto_portada: (p['foto_portada_url'] as string | undefined)
        ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    moneda: (p['tipo_operacion'] === 'venta'
        ? ((p['moneda_venta'] as string | undefined) ?? 'USD')
        : ((p['moneda_alquiler'] as string | undefined) ?? 'ARS')) as 'USD' | 'ARS',
});

export const propertiesService = {
    /**
     * Obtiene una página de propiedades publicadas (no borrador).
     * Usa select específico y range para paginación eficiente.
     */
    fetchPropertiesPage: async (page: number = 0): Promise<{ data: Property[]; count: number }> => {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error, count } = await supabase
            .from('propiedades')
            .select(LIST_SELECT, { count: 'exact' })
            .neq('estado', 'borrador')
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            data: (data as unknown as Record<string, unknown>[] ?? []).map(normalizeForCard),
            count: count ?? 0,
        };
    },

    /**
     * Obtiene todas las captaciones (estado = 'borrador').
     * Son pocas — no requieren paginación.
     */
    fetchBorradores: async (): Promise<Property[]> => {
        const { data, error } = await supabase
            .from('propiedades')
            .select(LIST_SELECT)
            .eq('estado', 'borrador')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data as unknown as Record<string, unknown>[] ?? []).map(normalizeForCard);
    },

    fetchProperties: async (activeType?: 'published' | 'acquisition', forceRefresh = false) => {
        // Usar cache si está disponible y es reciente
        if (!forceRefresh && propertiesCache && Date.now() - propertiesCache.timestamp < CACHE_DURATION) {
            return propertiesCache.data;
        }

        const startTime = performance.now();

        let query = supabase
            .from('propiedades')
            .select('*');

        if (activeType === 'published') {
            query = query.neq('estado', 'borrador');
        } else if (activeType === 'acquisition') {
            query = query.eq('estado', 'borrador');
        }

        // 1. Fetch properties sin ordenar por 'created_at' en DB para evitar error 42703 si la tabla fue modificada
        const { data, error } = await query.limit(100);

        if (error) {
            console.error('❌ Supabase fetch error:', error);
            throw error;
        }

        // Fetch photos separately to avoid PostgREST relationship errors
        let allFotos: any[] = [];
        if (data && data.length > 0) {
            const propertyIds = data.map(p => p.id || p.tokko_id || '').filter(id => id !== '');
            if (propertyIds.length > 0) {
                const { data: fotosData } = await supabase
                    .from('fotos')
                    .select('*')
                    .in('propiedad_id', propertyIds);
                
                if (fotosData) {
                    allFotos = fotosData;
                }
            }
        }

        const props = (data || []).map(p => {
            const propertyIdString = String(p.tokko_id || p.id || '');
            const propFotos = allFotos
                .filter(f => f.propiedad_id === propertyIdString)
                .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

            // Cover photo: DB column > photos table > default
            const coverPhoto = propFotos.find((f: any) => f.es_portada) || propFotos[0];
            const foto_portada = p.foto_portada_url
                || coverPhoto?.thumbnail
                || coverPhoto?.url
                || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400';

            // Price: use separated columns (already in DB from Tokko sync)
            const precio = p.tipo_operacion === 'venta'
                ? (p.precio_venta || p.precio)
                : (p.precio_alquiler || p.precio);
            const moneda = p.tipo_operacion === 'venta'
                ? (p.moneda_venta || p.moneda || 'USD')
                : (p.moneda_alquiler || p.moneda || 'ARS');

            return {
                ...p,
                id: propertyIdString,
                fotos: propFotos,
                titulo: p.titulo || p.direccion || `Propiedad en ${p.barrio || p.ciudad || 'Venta/Alquiler'}`,
                tipo: p.tipo_propiedad || 'otro',
                direccion_completa: p.direccion || p.direccion_publica || '',
                ambientes: p.ambientes || 0,
                dormitorios: p.dormitorios || 0,
                banos_completos: p.banos || 0,
                sup_cubierta: p.superficie_cubierta || p.metros_cubiertos || 0,
                sup_total: p.superficie_total || 0,
                foto_portada,
                moneda,
                precio,
            };
        });

        const endTime = performance.now();
        void endTime; // performance tracking — remove in future if unneeded

        // Actualizar cache
        propertiesCache = {
            data: props,
            timestamp: Date.now()
        };

        return props;
    },

    // Invalidar cache cuando se guarda una propiedad
    invalidateCache: () => {
        propertiesCache = null;
    },

    saveProperty: async (property: Partial<Property>) => {
        const { id, fotos, foto_portada, banos_completos, sup_cubierta, moneda, precio, ...dataToSave } = property as any;

        const mappedData = {
            ...dataToSave,
            banos: banos_completos,
            superficie_cubierta: sup_cubierta,
            updated_at: new Date().toISOString()
        };

        if (property.tipo_operacion === 'venta') {
            mappedData.precio_venta = precio;
            mappedData.moneda_venta = moneda;
        } else {
            mappedData.precio_alquiler = precio;
            mappedData.moneda_alquiler = moneda;
        }

        const cover = (fotos as Photo[])?.find(f => f.es_portada)?.thumbnail
            || (fotos as Photo[])?.find(f => f.es_portada)?.url
            || (fotos as Photo[])?.[0]?.thumbnail
            || (fotos as Photo[])?.[0]?.url;

        if (cover) {
            mappedData.foto_portada_url = cover;
        }

        let savedId;
        if (id && !id.toString().startsWith('temp-')) {
            const { error } = await supabase
                .from('propiedades')
                .update(mappedData)
                .eq('tokko_id', id);
            if (error) throw error;
            savedId = id;
        } else {
            const { data, error } = await supabase
                .from('propiedades')
                .insert([{ ...mappedData, created_at: new Date().toISOString() }])
                .select()
                .single();
            if (error) throw error;
            savedId = data.id;
        }

        // Sync Photos
        if (fotos && Array.isArray(fotos)) {
            const { data: currentDbFotos } = await supabase
                .from('fotos')
                .select('id')
                .eq('propiedad_id', savedId);

            const currentDbIds = currentDbFotos?.map(f => f.id) || [];
            const incomingIds = fotos.filter(f => f.id).map(f => f.id);

            const idsToDelete = currentDbIds.filter(id => !incomingIds.includes(id));
            if (idsToDelete.length > 0) {
                await supabase.from('fotos').delete().in('id', idsToDelete);
            }

            for (const [index, photo] of (fotos as Photo[]).entries()) {
                const photoData = {
                    url: photo.url,
                    url_original: photo.url_original,
                    thumbnail: photo.thumbnail,
                    es_portada: photo.es_portada,
                    es_plano: photo.es_plano,
                    orden: photo.orden ?? index,
                    descripcion: photo.descripcion,
                    propiedad_id: savedId
                };

                if (photo.id) {
                    await supabase.from('fotos').update(photoData).eq('id', photo.id);
                } else {
                    await supabase.from('fotos').insert(photoData);
                }
            }
        }

        // Invalidar cache después de guardar
        propertiesService.invalidateCache();

        return savedId;
    },

    deleteProperty: async (id: string) => {
        const { error } = await supabase
            .from('propiedades')
            .delete()
            .eq('id', id);
        if (error) throw error;

        // Invalidar cache después de eliminar
        propertiesService.invalidateCache();

        return true;
    }
};
