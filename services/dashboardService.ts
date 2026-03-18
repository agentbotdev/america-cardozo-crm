import { supabase } from './supabaseClient';

export const dashboardService = {
  getStats: async () => {
    // Current date calculations for relative metrics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const todayStr = now.toISOString().split('T')[0];

    const [
      { count: totalLeads },
      { count: propertiesCount },
      { count: visitsTotal },
      { data: hotLeads },
      { count: leadsNuevos },
      { count: leadsSinContactar },
      { count: propertiesReserved },
      { count: closeLeads },
      { count: visitasSemana }
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('propiedades').select('*', { count: 'exact', head: true }),
      supabase.from('visitas').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*').eq('temperatura', 'caliente').order('created_at', { ascending: false }).limit(5),
      supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('estado', '1_nuevo'),
      supabase.from('propiedades').select('*', { count: 'exact', head: true }).eq('estado', 'reservada'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('estado', '7_cerrado_exito'),
      supabase.from('visitas').select('*', { count: 'exact', head: true }).gte('fecha', todayStr) // simplified as >= today
    ]);

    // Calcular tasa de conversion real si hay leads, sino fallback a 0
    const conversionRate = totalLeads ? Math.round(((closeLeads || 0) / totalLeads) * 100) : 0;
    
    // Fallbacks si no hay datos complejos
    const diasPromedioCierre = 14; 
    
    return {
      totalLeads: totalLeads || 0,
      propertiesCount: propertiesCount || 0,
      visitsScheduled: visitsTotal || 0,
      hotLeadsCount: hotLeads?.length || 0,
      hotLeads: hotLeads || [],
      leadsNuevos: leadsNuevos || 0,
      leadsSinContactar: leadsSinContactar || 0,
      propertiesReserved: propertiesReserved || 0,
      tasaConversion: conversionRate,
      visitasSemana: visitasSemana || 0,
      diasCierre: diasPromedioCierre,
      publicadas: propertiesCount || 0 // Assuming all non-archived are "publicadas" for now
    };
  },

  getChartData: async () => {
    // Data para charts
    const { data: leads } = await supabase.from('leads').select('temperatura, fuente, created_at, operacion');
    const { data: visits } = await supabase.from('visitas').select('fecha');

    if (!leads) return null;

    // 1. Status Data (Pipeline Temp)
    const statusCounts = leads.reduce((acc: any, lead) => {
      const status = lead.temperatura || 'nuevo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const leadStatusData = [
      { name: 'Frío', value: statusCounts.frio || 0, color: '#94a3b8' },
      { name: 'Tibio', value: statusCounts.tibio || 0, color: '#6366f1' },
      { name: 'Caliente', value: statusCounts.caliente || 0, color: '#f59e0b' },
      { name: 'Cerrado', value: statusCounts.cerrado || 0, color: '#10b981' },
    ];

    // 2. Source Data
    const sourceCounts = leads.reduce((acc: any, lead) => {
      const source = lead.fuente || 'Otro';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const leadsBySourceData = Object.entries(sourceCounts).map(([name, value]) => ({
      name,
      value
    })).sort((a: any, b: any) => b.value - a.value).slice(0, 5);

    // 3. Actividad por operación (Para reemplazar "por vendedor")
    const operacionCounts = leads.reduce((acc: any, lead) => {
      const op = lead.operacion || 'Sin definir';
      acc[op] = (acc[op] || 0) + 1;
      return acc;
    }, {});

    const chartPorOperacion = Object.entries(operacionCounts).map(([name, value]) => ({
      name,
      value
    })).sort((a: any, b: any) => b.value - a.value);

    // 4. Actividad Semanal (Leads vs Visitas)
    // Build a map for the last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyActivity = last7Days.map(dateStr => {
      const leadsToday = leads.filter(l => l.created_at?.startsWith(dateStr)).length;
      const visitsToday = (visits || []).filter(v => v.fecha === dateStr).length;
      // Convert to day name, e.g. "Lun"
      const dayName = new Date(dateStr).toLocaleDateString('es-AR', { weekday: 'short' }).substring(0, 3);
      return {
        dia: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        leads: leadsToday,
        visitas: visitsToday
      };
    });

    return { 
      leadStatusData, 
      leadsBySourceData, 
      chartPorOperacion, 
      visitasSemanales: dailyActivity 
    };
  }
};
