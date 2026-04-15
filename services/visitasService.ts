import { supabase } from './supabaseClient';
import { Visita } from '../types';

// ─────────────────────────────────────────────────────────────────
// NOTAS DE ARQUITECTURA:
//
// Schema real de la tabla 'visitas':
//   id, lead_id (FK→leads), property_id, propiedad_id (duplicado),
//   property_titulo, cliente_nombre, cliente_telefono,
//   fecha (date), hora (text), fecha_visita (timestamptz),
//   estado (default='pendiente_confirmacion'),
//   pipeline_stage (default='pendiente'),
//   tipo_reunion (default='propiedad'),
//   mensaje_original, created_at
//
// FKs declaradas: solo lead_id → leads.id
// property_id NO tiene FK formal → no se puede usar JOIN automático de Supabase.
// property_titulo está desnormalizado en la fila — no hace falta JOIN a propiedades.
// ─────────────────────────────────────────────────────────────────

/**
 * Select base — incluye JOIN a leads via FK declarada.
 * Los campos de propiedad se leen directo de las columnas desnormalizadas.
 */
const VISITA_SELECT = `
  *,
  lead:leads(id, nombre, apellido, telefono, email)
`;

/** Normaliza una fila raw de la DB al tipo Visita */
const normalizeVisita = (row: any): Visita => ({
  ...row,
  id: String(row.id),
  lead_id: row.lead_id ? String(row.lead_id) : undefined,
});

export const visitasService = {
  /**
   * Obtiene todas las visitas, ordenadas por fecha descendente.
   * Incluye datos del lead relacionado via JOIN.
   */
  async getVisitas(): Promise<Visita[]> {
    try {
      const { data, error } = await supabase
        .from('visitas')
        .select(VISITA_SELECT)
        .order('fecha', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('❌ visitasService.getVisitas:', error);
        throw error;
      }

      return (data || []).map(normalizeVisita);
    } catch (error) {
      console.error('❌ visitasService.getVisitas error:', error);
      throw error;
    }
  },

  /**
   * Obtiene visitas filtradas por lead (cliente).
   */
  async getVisitasByCliente(clienteId: string): Promise<Visita[]> {
    try {
      const { data, error } = await supabase
        .from('visitas')
        .select(VISITA_SELECT)
        .eq('lead_id', clienteId)
        .order('fecha', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ visitasService.getVisitasByCliente:', error);
        throw error;
      }

      return (data || []).map(normalizeVisita);
    } catch (error) {
      console.error('❌ visitasService.getVisitasByCliente error:', error);
      throw error;
    }
  },

  /**
   * Obtiene visitas filtradas por propiedad.
   * Busca en property_id Y propiedad_id (columna duplicada — deuda técnica DB).
   */
  async getVisitasByPropiedad(propiedadId: string): Promise<Visita[]> {
    try {
      const { data, error } = await supabase
        .from('visitas')
        .select(VISITA_SELECT)
        .or(`property_id.eq.${propiedadId},propiedad_id.eq.${propiedadId}`)
        .order('fecha', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ visitasService.getVisitasByPropiedad:', error);
        throw error;
      }

      return (data || []).map(normalizeVisita);
    } catch (error) {
      console.error('❌ visitasService.getVisitasByPropiedad error:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva visita.
   * Retorna el registro creado con su UUID asignado por la DB.
   */
  async createVisita(
    data: Omit<Visita, 'id' | 'created_at' | 'lead'>
  ): Promise<Visita | null> {
    try {
      const { data: created, error } = await supabase
        .from('visitas')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
        }])
        .select(VISITA_SELECT)
        .single();

      if (error) {
        console.error('❌ visitasService.createVisita:', error);
        throw error;
      }

      return created ? normalizeVisita(created) : null;
    } catch (error) {
      console.error('❌ visitasService.createVisita error:', error);
      throw error;
    }
  },

  /**
   * Actualiza una visita existente.
   * Retorna el registro actualizado.
   */
  async updateVisita(id: string, data: Partial<Visita>): Promise<Visita | null> {
    try {
      // Excluir campos que no pertenecen a la DB
      const { lead, ...dbData } = data as any;

      const { data: updated, error } = await supabase
        .from('visitas')
        .update(dbData)
        .eq('id', id)
        .select(VISITA_SELECT)
        .single();

      if (error) {
        console.error('❌ visitasService.updateVisita:', error);
        throw error;
      }

      return updated ? normalizeVisita(updated) : null;
    } catch (error) {
      console.error('❌ visitasService.updateVisita error:', error);
      throw error;
    }
  },

  /**
   * Elimina una visita por ID.
   * Retorna true si se eliminó correctamente.
   */
  async deleteVisita(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('visitas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ visitasService.deleteVisita:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ visitasService.deleteVisita error:', error);
      return false;
    }
  },

  /**
   * Estadísticas de visitas para el Dashboard.
   * Tres COUNT en paralelo: total, esta semana, este mes.
   */
  async getVisitasStats(): Promise<{
    total: number;
    estaSemana: number;
    esteMes: number;
  }> {
    try {
      // Inicio de semana (lunes) y mes actual
      const ahora = new Date();

      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      inicioMes.setHours(0, 0, 0, 0);

      // Lunes de la semana actual
      const diaSemana = ahora.getDay(); // 0=dom, 1=lun...
      const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
      const inicioSemana = new Date(ahora);
      inicioSemana.setDate(ahora.getDate() - diasDesdeElLunes);
      inicioSemana.setHours(0, 0, 0, 0);

      const [totalRes, semanaRes, mesRes] = await Promise.all([
        supabase
          .from('visitas')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('visitas')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', inicioSemana.toISOString()),

        supabase
          .from('visitas')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', inicioMes.toISOString()),
      ]);

      if (totalRes.error) {
        console.error('❌ visitasService.getVisitasStats (total):', totalRes.error);
      }
      if (semanaRes.error) {
        console.error('❌ visitasService.getVisitasStats (semana):', semanaRes.error);
      }
      if (mesRes.error) {
        console.error('❌ visitasService.getVisitasStats (mes):', mesRes.error);
      }

      return {
        total: totalRes.count ?? 0,
        estaSemana: semanaRes.count ?? 0,
        esteMes: mesRes.count ?? 0,
      };
    } catch (error) {
      console.error('❌ visitasService.getVisitasStats error:', error);
      return { total: 0, estaSemana: 0, esteMes: 0 };
    }
  },
};
