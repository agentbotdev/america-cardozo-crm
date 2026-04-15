import { supabase } from './supabaseClient';
import { CRMTask } from '../types';

export interface TaskComment {
  id: string;
  tarea_id: string;
  usuario: string;
  texto: string;
  created_at: string;
}

export interface InternalMessage {
  id: string;
  de: string;
  para: string;
  texto: string;
  leido: boolean;
  created_at: string;
}

export const tasksService = {
  // ══════════════════════════════════════════════════════════════════════════
  // CRUD DE TAREAS
  // ══════════════════════════════════════════════════════════════════════════

  fetchTasks: async (): Promise<CRMTask[]> => {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return (data || []).map(t => ({
      ...t,
      id: String(t.id),
      asignados: t.asignados || [],
      tags: t.etiquetas || [],
      estado: t.estado as any,
    })) as CRMTask[];
  },

  createTask: async (task: Omit<CRMTask, 'id' | 'created_at' | 'updated_at'>): Promise<CRMTask> => {
    const { data, error } = await supabase
      .from('tareas')
      .insert([
        {
          titulo: task.titulo,
          descripcion: task.descripcion,
          prioridad: task.prioridad || 'media',
          estado: task.estado || 'pendiente',
          fecha_vencimiento: task.fecha_vencimiento,
          asignados: task.asignados || [],
          lead_id: task.lead_id,
          propiedad_id: task.propiedad_id,
          etiquetas: task.tags || [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return {
      ...data,
      id: String(data.id),
      asignados: data.asignados || [],
      tags: data.etiquetas || [],
      estado: data.estado as any,
    } as CRMTask;
  },

  saveTask: async (task: CRMTask): Promise<CRMTask> => {
    // If task has no id or temp id, create new
    if (!task.id || task.id.startsWith('temp-')) {
      return tasksService.createTask(task);
    }

    // Otherwise update
    const { data, error } = await supabase
      .from('tareas')
      .update({
        titulo: task.titulo,
        descripcion: task.descripcion,
        prioridad: task.prioridad,
        estado: task.estado,
        fecha_vencimiento: task.fecha_vencimiento,
        asignados: task.asignados || [],
        lead_id: task.lead_id,
        propiedad_id: task.propiedad_id,
        etiquetas: task.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return {
      ...data,
      id: String(data.id),
      asignados: data.asignados || [],
      tags: data.etiquetas || [],
      estado: data.estado as any,
    } as CRMTask;
  },

  updateTaskStatus: async (id: string, estado: string): Promise<void> => {
    const { error } = await supabase
      .from('tareas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tareas').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // COMENTARIOS
  // ══════════════════════════════════════════════════════════════════════════

  fetchComments: async (tareaId: string): Promise<TaskComment[]> => {
    const { data, error } = await supabase
      .from('comentarios_tareas')
      .select('*')
      .eq('tarea_id', tareaId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return data || [];
  },

  addComment: async (tareaId: string, usuario: string, texto: string): Promise<TaskComment> => {
    const { data, error } = await supabase
      .from('comentarios_tareas')
      .insert([
        {
          tarea_id: tareaId,
          usuario,
          texto,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return data;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MENSAJES INTERNOS
  // ══════════════════════════════════════════════════════════════════════════

  fetchMessages: async (de?: string, para?: string): Promise<InternalMessage[]> => {
    let query = supabase.from('mensajes_internos').select('*');

    if (de && para) {
      // Get conversation between two users (both directions)
      query = query.or(`and(de.eq.${de},para.eq.${para}),and(de.eq.${para},para.eq.${de})`);
    } else if (para) {
      // Get messages sent to specific user
      query = query.eq('para', para);
    } else if (de) {
      // Get messages sent by specific user
      query = query.eq('de', de);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  },

  sendMessage: async (de: string, para: string, texto: string): Promise<InternalMessage> => {
    const { data, error } = await supabase
      .from('mensajes_internos')
      .insert([
        {
          de,
          para,
          texto,
          leido: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return data;
  },

  markMessageRead: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('mensajes_internos')
      .update({ leido: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  getUnreadCount: async (para: string): Promise<number> => {
    const { count, error } = await supabase
      .from('mensajes_internos')
      .select('*', { count: 'exact', head: true })
      .eq('para', para)
      .eq('leido', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════

  getTaskStats: async () => {
    const { data: tasks, error } = await supabase.from('tareas').select('*');

    if (error) {
      console.error('Error fetching task stats:', error);
      return {
        total: 0,
        completadas: 0,
        vencidas: 0,
        enProgreso: 0,
        byStatus: {},
        byPriority: {},
      };
    }

    const now = new Date();
    const vencidas = tasks?.filter(
      t =>
        t.fecha_vencimiento &&
        new Date(t.fecha_vencimiento) < now &&
        t.estado !== 'completada' &&
        t.estado !== 'cancelada'
    ).length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const completadasEsteMes = tasks?.filter(
      t =>
        t.estado === 'completada' &&
        t.updated_at &&
        new Date(t.updated_at) >= thisMonth
    ).length;

    const byStatus: { [key: string]: number } = {};
    const byPriority: { [key: string]: number } = {};

    tasks?.forEach(t => {
      byStatus[t.estado] = (byStatus[t.estado] || 0) + 1;
      byPriority[t.prioridad] = (byPriority[t.prioridad] || 0) + 1;
    });

    return {
      total: tasks?.length || 0,
      completadas: completadasEsteMes || 0,
      vencidas: vencidas || 0,
      enProgreso: byStatus['en_progreso'] || 0,
      byStatus,
      byPriority,
    };
  },
};
