import { supabase } from './supabaseClient';
import { SupportTicket } from '../types';

export const supportService = {
  getTickets: async (userId: string): Promise<SupportTicket[]> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createTicket: async (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...ticket,
        status: 'Abierto'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateTicketStatus: async (ticketId: string, status: 'Abierto' | 'Cerrado' | 'En Proceso') => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId);
    
    if (error) throw error;
  }
};
