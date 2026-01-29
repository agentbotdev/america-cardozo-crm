import { supabase } from './supabaseClient';
import { Property, Photo } from '../types';

export interface Development {
    id: string;
    nombre: string;
    tipo: 'edificio' | 'loteo' | 'barrio_cerrado' | 'comercial' | 'otro';
    direccion: string;
    ciudad: string;
    zona?: string;
    estado_obra: 'pozo' | 'en_construccion' | 'preventa' | 'entregado' | 'lanzamiento';
    fecha_entrega?: string;
    descripcion: string;
    foto_portada_url: string;
    foto_portada?: string; // UI mapped field
    unidades_totales: number;
    amenities: string[];
    fotos?: Photo[];
    created_at?: string;
    updated_at?: string;
}

export const developmentsService = {
    async fetchDevelopments() {
        const { data, error } = await supabase
            .from('emprendimientos')
            .select('*, fotos(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(d => ({
            ...d,
            // Map a single cover image for the UI
            foto_portada: d.foto_portada_url || d.fotos?.find((f: any) => f.es_portada)?.url || d.fotos?.[0]?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'
        })) as Development[];
    },

    async saveDevelopment(dev: Partial<Development>) {
        const { id, fotos, foto_portada, ...dataToSave } = dev;
        const isNew = !id;

        // Set the cover URL in the main table
        const cover = (fotos as Photo[])?.find(f => f.es_portada)?.url || (fotos as Photo[])?.[0]?.url;
        if (cover) {
            (dataToSave as any).foto_portada_url = cover;
        }

        let result;
        if (isNew) {
            const { data, error } = await supabase
                .from('emprendimientos')
                .insert([dataToSave])
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('emprendimientos')
                .update(dataToSave)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        // --- Sync Photos ---
        if (fotos && Array.isArray(fotos)) {
            const { data: currentDbFotos } = await supabase
                .from('fotos')
                .select('id')
                .eq('emprendimiento_id', result.id);

            const currentDbIds = currentDbFotos?.map(f => f.id) || [];
            const incomingIds = (fotos as Photo[]).filter(f => f.id).map(f => f.id);

            const idsToDelete = currentDbIds.filter(dbId => !incomingIds.includes(dbId));
            if (idsToDelete.length > 0) {
                await supabase.from('fotos').delete().in('id', idsToDelete);
            }

            for (const [index, photo] of (fotos as Photo[]).entries()) {
                const photoData = {
                    url: photo.url,
                    es_portada: photo.es_portada,
                    orden: photo.orden ?? index,
                    descripcion: photo.descripcion,
                    emprendimiento_id: result.id
                };

                if (photo.id) {
                    await supabase.from('fotos').update(photoData).eq('id', photo.id);
                } else {
                    await supabase.from('fotos').insert(photoData);
                }
            }
        }

        return result as Development;
    },

    async deleteDevelopment(id: string) {
        const { error } = await supabase
            .from('emprendimientos')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async fetchUnitsByDevelopment(developmentId: string) {
        const { data, error } = await supabase
            .from('propiedades')
            .select('*')
            .eq('emprendimiento_id', developmentId);

        if (error) throw error;
        return data as any[];
    }
};
