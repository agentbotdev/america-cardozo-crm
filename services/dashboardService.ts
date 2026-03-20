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
        // Optimized: Use database aggregation instead of fetching all records
        // For temperature counts, we'll use Postgres aggregate functions via RPC

        // Get counts by temperatura using separate queries (more efficient than fetching all)
        const [frioCount, tibioCount, calienteCount, cerradoCount, allLeads] = await Promise.all([
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperatura', 'frio'),
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperatura', 'tibio'),
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperatura', 'caliente'),
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperatura', 'cerrado'),
            // For source aggregation, limit to recent leads only (last 1000)
            supabase.from('leads').select('fuente_consulta').order('created_at', { ascending: false }).limit(1000)
        ]);

        // 1. Status Data (using counts from database)
        const leadStatusData = [
            { name: 'Frío', value: frioCount.count || 0, color: '#94a3b8' },
            { name: 'Tibio', value: tibioCount.count || 0, color: '#6366f1' },
            { name: 'Caliente', value: calienteCount.count || 0, color: '#f59e0b' },
            { name: 'Cerrado', value: cerradoCount.count || 0, color: '#10b981' },
        ];

        // 2. Source Data (aggregate from limited dataset)
        const sourceCounts: Record<string, number> = {};
        if (allLeads.data) {
            allLeads.data.forEach(lead => {
                const source = lead.fuente_consulta || 'Otro';
                sourceCounts[source] = (sourceCounts[source] || 0) + 1;
            });
        }

        const leadsBySourceData = Object.entries(sourceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);

        return { leadStatusData, leadsBySourceData };
    }
};
