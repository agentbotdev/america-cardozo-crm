import { supabase } from './supabaseClient';
import { LeadHistory } from '../types';

export const leadHistoryService = {
  getHistory: async (leadId: string): Promise<LeadHistory[]> => {
    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map created_at to date for frontend compatibility if needed
    return (data || []).map(item => ({
      ...item,
      date: item.created_at
    }));
  },

  addEntry: async (entry: Omit<LeadHistory, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('lead_history')
      .insert({
        lead_id: entry.lead_id,
        type: entry.type,
        stage: entry.stage,
        title: entry.title,
        description: entry.description,
        user_id: entry.user_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
