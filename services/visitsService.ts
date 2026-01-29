
import { supabase } from './supabaseClient';
import { Visit } from '../types';

export const visitsService = {
    async fetchVisits() {
        const { data, error } = await supabase
            .from('visitas')
            .select('*')
            .order('fecha_visita', { ascending: false });

        if (error) throw error;

        return (data || []).map(v => ({
            ...v,
            id: String(v.id),
            property_id: String(v.propiedad_id),
            fecha: v.fecha_visita ? v.fecha_visita.split('T')[0] : '',
            hora: v.fecha_visita ? v.fecha_visita.split('T')[1]?.substring(0, 5) : '',
        }));
    },

    async saveVisit(visit: Partial<Visit>) {
        const { id, fecha, hora, property_id, ...rest } = visit;

        // Merge fecha and hora into fecha_visita
        const fecha_visita = fecha && hora ? `${fecha}T${hora}:00` : (fecha ? `${fecha}T00:00:00` : null);

        const dataToSave: any = {
            ...rest,
            propiedad_id: property_id ? BigInt(property_id) : null,
            fecha_visita,
            updated_at: new Date().toISOString()
        };

        if (id && !id.toString().startsWith('temp-')) {
            const { data, error } = await supabase
                .from('visitas')
                .update(dataToSave)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('visitas')
                .insert([{ ...dataToSave, created_at: new Date().toISOString() }])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    async deleteVisit(id: string) {
        const { error } = await supabase
            .from('visitas')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
