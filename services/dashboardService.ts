import { supabase } from './supabaseClient';
import { visitasService } from './visitasService';

export const dashboardService = {
  /**
   * Carga todos los KPI counters en un solo round-trip (Promise.all).
   * visitasStats usa visitasService que ya tiene su propio Promise.all interno.
   */
  getStats: async () => {
    const [leadsRes, propsRes, visitsRes, hotLeadsRes, visitasStats] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('propiedades').select('*', { count: 'exact', head: true }),
      supabase.from('visitas').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*').eq('temperatura', 'caliente').limit(5),
      visitasService.getVisitasStats(),
    ]);

    return {
      totalLeads:      leadsRes.count    ?? 0,
      propertiesCount: propsRes.count    ?? 0,
      visitsScheduled: visitsRes.count   ?? 0,
      hotLeadsCount:   hotLeadsRes.data?.length ?? 0,
      hotLeads:        hotLeadsRes.data  ?? [],
      // Visitas reales de esta semana y este mes (via visitasService)
      visitasEstaSemana: visitasStats.estaSemana,
      visitasEsteMes:    visitasStats.esteMes,
    };
  },

  getChartData: async () => {
    // Se podría usar funciones Postgres para estas agregaciones.
    // Por ahora: fetch + aggregate en JS (dataset pequeño).
    const { data: leads } = await supabase
      .from('leads')
      .select('temperatura, fuente_consulta');

    if (!leads) return null;

    // 1. Estado del pipeline
    const statusCounts = leads.reduce((acc: Record<string, number>, lead) => {
      const status = lead.temperatura || 'nuevo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const leadStatusData = [
      { name: 'Frío',      value: statusCounts.frio      || 0, color: '#94a3b8' },
      { name: 'Tibio',     value: statusCounts.tibio     || 0, color: '#6366f1' },
      { name: 'Caliente',  value: statusCounts.caliente  || 0, color: '#f59e0b' },
      { name: 'Cerrado',   value: statusCounts.cerrado   || 0, color: '#10b981' },
    ];

    // 2. Fuentes de leads
    const sourceCounts = leads.reduce((acc: Record<string, number>, lead) => {
      const source = lead.fuente_consulta || 'Otro';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const leadsBySourceData = Object.entries(sourceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return { leadStatusData, leadsBySourceData };
  },
};
