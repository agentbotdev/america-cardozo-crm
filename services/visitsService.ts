
import { supabase } from './supabaseClient';
import { Visit } from '../types';

export const visitsService = {
    async fetchVisits() {
        const { data, error } = await supabase
            .from('visitas')
            .select('*')
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async saveVisit(visit: Partial<Visit>) {
        const { id, ...visitData } = visit;

        if (id && id.toString().includes('-')) { // Real UUID or newly generated UUID
            // Existing visit (if it's a UUID)
            const { data, error } = await supabase
                .from('visitas')
                .update(visitData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            // New visit
            const { data, error } = await supabase
                .from('visitas')
                .insert([visitData])
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
