import { supabase } from './supabaseClient';
import { Property, Photo } from '../types';

// Cache para propiedades
let propertiesCache: { data: Property[]; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

export const propertiesService = {
    fetchProperties: async (activeType?: 'published' | 'acquisition', forceRefresh = false) => {
        // Usar cache si está disponible y es reciente
        if (!forceRefresh && propertiesCache && Date.now() - propertiesCache.timestamp < CACHE_DURATION) {
            console.log('✅ Using cached properties');
            return propertiesCache.data;
        }

        console.log('🔄 Fetching properties from Supabase...');
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
        console.log(`✅ Fetched ${props.length} properties in ${(endTime - startTime).toFixed(0)}ms`);

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
        console.log('🗑️ Properties cache invalidated');
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
                .eq('id', id);
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
