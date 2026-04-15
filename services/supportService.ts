import { supabase } from './supabaseClient';
import { SupportTicket, SupportMessage } from '../types';

export type { SupportTicket, SupportMessage };

export const supportService = {
  // ══════════════════════════════════════════════════════════════════════════
  // TICKETS
  // ══════════════════════════════════════════════════════════════════════════

  getTickets: async (userId?: string): Promise<SupportTicket[]> => {
    try {
      let query = supabase
        .from('soporte_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Catch error fetching tickets:', error);
      return [];
    }
  },

  createTicket: async (
    ticket: Omit<SupportTicket, 'id' | 'numero_ticket' | 'created_at' | 'updated_at'>
  ): Promise<SupportTicket> => {
    try {
      const { data, error } = await supabase
        .from('soporte_tickets')
        .insert([
          {
            asunto: ticket.asunto,
            categoria: ticket.categoria,
            prioridad: ticket.prioridad || 'media',
            estado: ticket.estado || 'abierto',
            creado_por: ticket.creado_por,
            user_id: ticket.user_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Catch error creating ticket:', error);
      throw error;
    }
  },

  updateTicketStatus: async (
    ticketId: string,
    estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado'
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('soporte_tickets')
        .update({
          estado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket status:', error);
      }
    } catch (error) {
      console.error('Catch error updating ticket status:', error);
    }
  },

  deleteTicket: async (ticketId: string): Promise<void> => {
    try {
      const { error } = await supabase.from('soporte_tickets').delete().eq('id', ticketId);

      if (error) {
        console.error('Error deleting ticket:', error);
      }
    } catch (error) {
        console.error('Catch error deleting ticket:', error);
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MENSAJES DE TICKETS
  // ══════════════════════════════════════════════════════════════════════════

  getTicketMessages: async (ticketId: string): Promise<SupportMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('soporte_mensajes')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ticket messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Catch error fetching ticket messages:', error);
      return [];
    }
  },

  sendMessage: async (
    ticketId: string,
    usuario: string,
    texto: string,
    rol: 'cliente' | 'dev' | 'support' = 'cliente'
  ): Promise<SupportMessage> => {
    try {
      const { data, error } = await supabase
        .from('soporte_mensajes')
        .insert([
          {
            ticket_id: ticketId,
            usuario,
            rol,
            texto,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Update ticket's updated_at timestamp
      await supabase
        .from('soporte_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return data;
    } catch (error) {
      console.error('Catch error sending message:', error);
      throw error;
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════

  getTicketStats: async () => {
    try {
      const { data: tickets, error } = await supabase.from('soporte_tickets').select('*');

      if (error) {
        console.error('Error fetching ticket stats:', error);
        return {
          total: 0,
          abiertos: 0,
          resueltos: 0,
          byCategoria: {},
        };
      }

      const byCategoria: { [key: string]: number } = {};
      tickets?.forEach(t => {
        byCategoria[t.categoria] = (byCategoria[t.categoria] || 0) + 1;
      });

      return {
        total: tickets?.length || 0,
        abiertos: tickets?.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso').length || 0,
        resueltos: tickets?.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado').length || 0,
        byCategoria,
      };
    } catch (error) {
      console.error('Catch error fetching ticket stats:', error);
      return {
        total: 0,
        abiertos: 0,
        resueltos: 0,
        byCategoria: {},
      };
    }
  },
};
