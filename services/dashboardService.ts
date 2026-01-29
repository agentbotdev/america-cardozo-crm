import { supabase } from './supabaseClient';

export const dashboardService = {
    getStats: async () => {
        const [leadsRes, propsRes, visitsRes, hotLeadsRes] = await Promise.all([
            supabase.from('leads').select('*', { count: 'exact', head: true }),
            supabase.from('propiedades').select('*', { count: 'exact', head: true }),
            supabase.from('visitas').select('*', { count: 'exact', head: true }),
            supabase.from('leads').select('*').eq('temperatura', 'caliente').limit(5)
        ]);

        return {
            totalLeads: leadsRes.count || 0,
            propertiesCount: propsRes.count || 0,
            visitsScheduled: visitsRes.count || 0,
            hotLeadsCount: hotLeadsRes.data?.length || 0,
            hotLeads: hotLeadsRes.data || []
        };
    },

    getChartData: async () => {
        // In a real production app, you'd use Postgres functions for these aggregations
        // For now, we fetch and aggregate to ensure "Real Data" feel.

        const { data: leads } = await supabase.from('leads').select('temperatura, fuente_consulta, created_at');

        if (!leads) return null;

        // 1. Status Data
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
            const source = lead.fuente_consulta || 'Otro';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        const leadsBySourceData = Object.entries(sourceCounts).map(([name, value]) => ({
            name,
            value
        })).sort((a: any, b: any) => b.value - a.value).slice(0, 4);

        return { leadStatusData, leadsBySourceData };
    }
};
