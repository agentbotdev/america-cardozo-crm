import { supabase } from './supabaseClient';
import { Property, Photo } from '../types';

export const propertiesService = {
    fetchProperties: async (activeType?: 'published' | 'acquisition') => {
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

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }

        const props = (data || []).map(p => {
            // Find cover photo: priority es_portada -> first image -> default
            const coverPhoto = p.fotos?.find((f: any) => f.es_portada) || p.fotos?.[0];
            const foto_portada = coverPhoto?.thumbnail || coverPhoto?.url || p.foto_portada_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

            return {
                ...p,
                id: String(p.id),
                banos_completos: p.banos || 0,
                sup_cubierta: p.superficie_cubierta || 0,
                foto_portada,
                moneda: p.tipo_operacion === 'venta' ? (p.moneda_venta || 'USD') : (p.moneda_alquiler || 'ARS'),
                precio: p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler,
            };
        });

        console.log(`Fetched ${props.length} properties. First:`, props[0]);
        return props;
    },

    saveProperty: async (property: Partial<Property>) => {
        const { id, fotos, foto_portada, banos_completos, sup_cubierta, moneda, precio, ...dataToSave } = property as any;

        // Prepare data matching schema
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

        // Set the cover URL in the main table for faster listing
        const cover = (fotos as Photo[])?.find(f => f.es_portada)?.url || (fotos as Photo[])?.[0]?.url;
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

        // --- Sync Photos ---
        if (fotos && Array.isArray(fotos)) {
            // 1. Get current photos in DB for this property
            const { data: currentDbFotos } = await supabase
                .from('fotos')
                .select('id')
                .eq('propiedad_id', savedId);

            const currentDbIds = currentDbFotos?.map(f => f.id) || [];
            const incomingIds = fotos.filter(f => f.id).map(f => f.id);

            // 2. Delete photos that are no longer present
            const idsToDelete = currentDbIds.filter(id => !incomingIds.includes(id));
            if (idsToDelete.length > 0) {
                await supabase.from('fotos').delete().in('id', idsToDelete);
            }

            // 3. Update existing photos and insert new ones
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

        return savedId;
    },

    deleteProperty: async (id: string) => {
        const { error } = await supabase
            .from('propiedades')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};
