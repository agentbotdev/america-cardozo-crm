import { supabase } from './supabaseClient';
import { Lead } from '../types';

export const leadsService = {
    fetchLeads: async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    saveLead: async (lead: Partial<Lead>) => {
        const { id, ...dataToSave } = lead;
        if (id && !id.toString().startsWith('temp-')) {
            const { error } = await supabase
                .from('leads')
                .update({ ...dataToSave, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            return id;
        } else {
            const { data, error } = await supabase
                .from('leads')
                .insert([{ ...dataToSave, created_at: new Date().toISOString() }])
                .select()
                .single();
            if (error) throw error;
            return data.id;
        }
    },

    // These will return empty arrays if tables don't exist yet, 
    // preventing crashes while we transition from mocks.
    fetchLeadHistory: async (leadId: string) => {
        try {
            const { data, error } = await supabase
                .from('leads_history')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });
            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    fetchLeadMessages: async (leadId: string) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: true });
            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    }
};
