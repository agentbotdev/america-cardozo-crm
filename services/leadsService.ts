import { supabase } from './supabaseClient';
import { Lead } from '../types';

export const leadsService = {
    fetchLeads: async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        return (data || []).map(l => ({
            ...l,
            id: String(l.id),
            estado_temperatura: l.temperatura,
            etapa_proceso: l.etapa,
            busca_venta: l.tipo_operacion_buscada === 'venta',
            busca_alquiler: l.tipo_operacion_buscada === 'alquiler',
            propiedades_enviadas_ids: l.propiedades_recomendadas || []
        }));
    },

    saveLead: async (lead: Partial<Lead>) => {
        const { id, estado_temperatura, etapa_proceso, busca_venta, busca_alquiler, propiedades_enviadas_ids, ...rest } = lead;

        const dataToSave: any = {
            ...rest,
            temperatura: estado_temperatura,
            etapa: etapa_proceso,
            tipo_operacion_buscada: busca_venta ? 'venta' : (busca_alquiler ? 'alquiler' : undefined),
            propiedades_recomendadas: propiedades_enviadas_ids,
            updated_at: new Date().toISOString()
        };

        if (id && !id.toString().startsWith('temp-')) {
            const { error } = await supabase
                .from('leads')
                .update(dataToSave)
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

    async assignPropertyToLead(leadId: string, propertyId: string) {
        // 1. Fetch current lead
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select('propiedades_recomendadas')
            .eq('id', leadId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Update array
        const currentIds = lead.propiedades_recomendadas || [];
        if (!currentIds.includes(propertyId)) {
            const newIds = [...currentIds, propertyId];
            const { error: updateError } = await supabase
                .from('leads')
                .update({ propiedades_recomendadas: newIds })
                .eq('id', leadId);

            if (updateError) throw updateError;
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
