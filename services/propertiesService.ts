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
            .select(`
                *,
                fotos (
                    id,
                    url,
                    url_original,
                    thumbnail,
                    es_portada,
                    es_plano,
                    orden,
                    descripcion
                )
            `);

        if (activeType === 'published') {
            query = query.neq('estado', 'borrador');
        } else if (activeType === 'acquisition') {
            query = query.eq('estado', 'borrador');
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(100);

        if (error) {
            console.error('❌ Supabase fetch error:', error);
            throw error;
        }

        const props = (data || []).map(p => {
            // Find cover photo with fallback
            const coverPhoto = p.fotos?.find((f: any) => f.es_portada) || p.fotos?.[0];

            // Priorizar thumbnail > url > foto_portada_url > default
            let foto_portada = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400';

            if (coverPhoto?.thumbnail) {
                foto_portada = coverPhoto.thumbnail;
            } else if (coverPhoto?.url) {
                foto_portada = coverPhoto.url;
            } else if (p.foto_portada_url) {
                foto_portada = p.foto_portada_url;
            }

            return {
                ...p,
                id: String(p.id),
                tipo: p.tipo_propiedad || 'otro',
                direccion_completa: p.direccion || p.direccion_publica || '',
                banos_completos: p.banos || 0,
                sup_cubierta: p.superficie_cubierta || 0,
                foto_portada,
                moneda: p.tipo_operacion === 'venta' ? (p.moneda_venta || 'USD') : (p.moneda_alquiler || 'ARS'),
                precio: p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler,
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
