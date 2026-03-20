import { supabase } from './supabaseClient';
import { Lead } from '../types';

// Cache para leads
let leadsCache: { data: Lead[]; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

export const leadsService = {
    fetchLeads: async (forceRefresh = false) => {
        // Usar cache si está disponible y es reciente
        if (!forceRefresh && leadsCache && Date.now() - leadsCache.timestamp < CACHE_DURATION) {
            console.log('✅ Using cached leads');
            return leadsCache.data;
        }

        console.log('🔄 Fetching leads from Supabase...');
        const startTime = performance.now();

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200); // Límite razonable

        if (error) {
            console.error('❌ Leads fetch error:', error);
            throw error;
        }

        const leads = (data || []).map(l => ({
            ...l,
            id: String(l.id),
            nombre: l.nombre || 'Sin Nombre',
            telefono: l.telefono || '',
            email: l.email || '',
            fuente_consulta: l.fuente_consulta || l.origen || 'WhatsApp',
            estado_temperatura: l.estado_temperatura || l.temperatura || 'Frio',
            etapa_proceso: l.etapa_proceso || l.etapa || 'Inicio',
            estado_seguimiento: l.estado_seguimiento || 'Nuevo',
            busca_venta: l.busca_venta || l.tipo_operacion_buscada === 'venta',
            busca_alquiler: l.busca_alquiler || l.tipo_operacion_buscada === 'alquiler',
            propiedades_enviadas_ids: l.propiedades_enviadas_ids || l.propiedades_recomendadas || []
        }));

        const endTime = performance.now();
        console.log(`✅ Fetched ${leads.length} leads in ${(endTime - startTime).toFixed(0)}ms`);

        // Actualizar cache
        leadsCache = {
            data: leads,
            timestamp: Date.now()
        };

        return leads;
    },

    invalidateCache: () => {
        leadsCache = null;
        console.log('🗑️ Leads cache invalidated');
    },

    saveLead: async (lead: Partial<Lead>) => {
        const { id, estado_temperatura, etapa_proceso, estado_seguimiento, busca_venta, busca_alquiler, propiedades_enviadas_ids, ...rest } = lead;

        const dataToSave: any = {
            ...rest,
            temperatura: estado_temperatura,
            etapa: etapa_proceso,
            estado_seguimiento: estado_seguimiento,
            tipo_operacion_buscada: busca_venta ? 'venta' : (busca_alquiler ? 'alquiler' : undefined),
            propiedades_recomendadas: propiedades_enviadas_ids,
            updated_at: new Date().toISOString()
        };

        let savedId;
        if (id && !id.toString().startsWith('temp-')) {
            const { error } = await supabase
                .from('leads')
                .update(dataToSave)
                .eq('id', id);
            if (error) throw error;
            savedId = id;
        } else {
            const { data, error } = await supabase
                .from('leads')
                .insert([{ ...dataToSave, created_at: new Date().toISOString() }])
                .select()
                .single();
            if (error) throw error;
            savedId = data.id;
        }

        // Invalidar cache
        leadsService.invalidateCache();

        return savedId;
    },

    updateLeadStatus: async (leadId: string, newStatus: string) => {
        const { error } = await supabase
            .from('leads')
            .update({ estado_seguimiento: newStatus, updated_at: new Date().toISOString() })
            .eq('id', leadId);
        
        if (error) {
            console.error('❌ Error updating lead status:', error);
            throw error;
        }
        
        leadsService.invalidateCache();
    },

    updateLeadStage: async (leadId: string, newStage: string) => {
        const { error } = await supabase
            .from('leads')
            .update({ 
                etapa_proceso: newStage, 
                etapa: newStage, // fallback
                updated_at: new Date().toISOString() 
            })
            .eq('id', leadId);
        
        if (error) {
            console.error('❌ Error updating lead stage:', error);
            throw error;
        }
        
        leadsService.invalidateCache();
        return { error: null };
    },

    createLead: async (leadData: any) => {
        return leadsService.saveLead(leadData);
    },

    updateLead: async (id: string, leadData: any) => {
        return leadsService.saveLead({ ...leadData, id });
    },

    async assignPropertyToLead(leadId: string, propertyId: string) {
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select('propiedades_recomendadas')
            .eq('id', leadId)
            .single();

        if (fetchError) throw fetchError;

        const currentIds = lead.propiedades_recomendadas || [];
        if (!currentIds.includes(propertyId)) {
            const newIds = [...currentIds, propertyId];
            const { error: updateError } = await supabase
                .from('leads')
                .update({ propiedades_recomendadas: newIds })
                .eq('id', leadId);

            if (updateError) throw updateError;

            // Invalidar cache
            leadsService.invalidateCache();
        }
    },

    fetchLeadHistory: async (leadId: string) => {
        try {
            const { data, error } = await supabase
                .from('leads_history')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false })
                .limit(50);
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
                .order('created_at', { ascending: true })
                .limit(100);
            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    saveMessage: async (message: { lead_id: string; text: string; sender: 'user' | 'agent' | 'bot' }) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    lead_id: message.lead_id,
                    text: message.text,
                    sender: message.sender,
                    timestamp: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('❌ Error saving message:', error);
                throw error;
            }

            console.log('✅ Message saved successfully');
            return data;
        } catch (error) {
            console.error('❌ Failed to save message:', error);
            throw error;
        }
    }
};
