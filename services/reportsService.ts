import { supabase } from './supabaseClient';

export interface DateRange {
  desde?: string;
  hasta?: string;
}

export const reportsService = {
  // ========== LEADS DASHBOARD ==========
  fetchLeadsData: async (dateRange: DateRange = {}) => {
    try {
      console.log('🔄 Fetching leads data...');
      const startTime = performance.now();

      // Build date filter
      let query = supabase.from('leads').select('*');
      if (dateRange.desde) query = query.gte('created_at', dateRange.desde);
      if (dateRange.hasta) query = query.lte('created_at', dateRange.hasta);

      const { data: leads, error } = await query;
      if (error) throw error;

      // Calculate KPIs
      const totalLeads = leads?.length || 0;
      const hotLeads = leads?.filter(l => ['caliente', 'ultra_caliente'].includes(l.temperatura)).length || 0;
      const leadsWithResponse = leads?.filter(l => l.ultima_interaccion).length || 0;
      const responseRate = totalLeads > 0 ? ((leadsWithResponse / totalLeads) * 100).toFixed(1) : '0';
      const avgScore = totalLeads > 0
        ? (leads!.reduce((sum, l) => sum + (l.score || 0), 0) / totalLeads).toFixed(1)
        : '0';
      const closedLeads = leads?.filter(l => l.temperatura === 'cerrado').length || 0;
      const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(0) : '0';
      const sinRespuesta = leads?.filter(l => !l.ultima_interaccion).length || 0;

      // Aggregate by source - format for Recharts
      const bySourceRaw: Record<string, number> = {};
      leads?.forEach(l => {
        const source = l.fuente_consulta || 'Otro';
        bySourceRaw[source] = (bySourceRaw[source] || 0) + 1;
      });
      const chartBySource = Object.entries(bySourceRaw).map(([name, value]) => ({ name, value }));

      // Aggregate by month - format for Recharts
      const byMonthRaw: Record<string, number> = {};
      leads?.forEach(l => {
        const month = new Date(l.created_at).toLocaleDateString('es', { month: 'short', year: 'numeric' });
        byMonthRaw[month] = (byMonthRaw[month] || 0) + 1;
      });
      const chartByMonth = Object.entries(byMonthRaw).map(([name, value]) => ({ name, value }));

      // Aggregate by temperatura - format for Recharts PieChart
      const byTempRaw: Record<string, number> = {};
      leads?.forEach(l => {
        const temp = l.temperatura || 'sin_clasificar';
        byTempRaw[temp] = (byTempRaw[temp] || 0) + 1;
      });
      const chartByTemperatura = Object.entries(byTempRaw).map(([name, value]) => ({ name, value }));

      // Aggregate by etapa - format for Recharts
      const byEtapaRaw: Record<string, number> = {};
      leads?.forEach(l => {
        const etapa = l.etapa_proceso || 'sin_etapa';
        byEtapaRaw[etapa] = (byEtapaRaw[etapa] || 0) + 1;
      });
      const chartByEtapa = Object.entries(byEtapaRaw).map(([name, value]) => ({ name, value }));

      const endTime = performance.now();
      console.log(`✅ Leads data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        totalLeads,
        hotLeads,
        responseRate: `${responseRate}%`,
        avgScore,
        conversionRate: `${conversionRate}%`,
        sinRespuesta,
        chartBySource,
        chartByMonth,
        chartByTemperatura,
        chartByEtapa,
        rawLeads: leads || [] // For CSV export
      };
    } catch (error) {
      console.error('❌ Error fetching leads data:', error);
      return null;
    }
  },

  // ========== SALES DASHBOARD ==========
  fetchSalesData: async (dateRange: DateRange = {}) => {
    try {
      console.log('🔄 Fetching sales data...');
      const startTime = performance.now();

      // Get closed sales leads
      let query = supabase.from('leads')
        .select('*')
        .eq('temperatura', 'cerrado')
        .eq('busca_venta', true);

      if (dateRange.desde) query = query.gte('created_at', dateRange.desde);
      if (dateRange.hasta) query = query.lte('created_at', dateRange.hasta);

      const { data: sales, error } = await query;
      if (error) throw error;

      // Calculate KPIs
      const totalSales = sales?.length || 0;
      const gmv = sales?.reduce((sum, s) => sum + (s.presupuesto_max || 0), 0) || 0;
      const avgTicket = totalSales > 0 ? gmv / totalSales : 0;
      const commission = gmv * 0.03; // 3% commission rate

      // Get active pipeline
      const { data: pipeline } = await supabase
        .from('leads')
        .select('*')
        .eq('busca_venta', true)
        .in('temperatura', ['tibio', 'caliente', 'ultra_caliente']);

      const pipelineCount = pipeline?.length || 0;

      // Average closing days (estimate based on created_at to updated_at)
      const avgClosingDays = totalSales > 0
        ? Math.round(sales!.reduce((sum, s) => {
            const created = new Date(s.created_at).getTime();
            const updated = new Date(s.updated_at || s.created_at).getTime();
            const days = Math.round((updated - created) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / totalSales)
        : 0;

      // Chart data: sales by month
      const byMonthRaw: Record<string, number> = {};
      sales?.forEach(s => {
        const month = new Date(s.created_at).toLocaleDateString('es', { month: 'short' });
        byMonthRaw[month] = (byMonthRaw[month] || 0) + 1;
      });
      const chartByMonth = Object.entries(byMonthRaw).map(([name, value]) => ({ name, value }));

      // Chart data: sales by vendedor
      const byVendedorRaw: Record<string, number> = {};
      sales?.forEach(s => {
        const vendedor = s.vendedor_asignado || 'Sin asignar';
        byVendedorRaw[vendedor] = (byVendedorRaw[vendedor] || 0) + 1;
      });
      const chartByVendedor = Object.entries(byVendedorRaw).map(([name, value]) => ({ name, value }));

      // Chart data: GMV evolution by month
      const gmvByMonthRaw: Record<string, number> = {};
      sales?.forEach(s => {
        const month = new Date(s.created_at).toLocaleDateString('es', { month: 'short' });
        gmvByMonthRaw[month] = (gmvByMonthRaw[month] || 0) + (s.presupuesto_max || 0);
      });
      const chartGmvByMonth = Object.entries(gmvByMonthRaw).map(([name, gmv]) => ({ name, gmv }));

      const endTime = performance.now();
      console.log(`✅ Sales data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        gmv: `$${(gmv / 1000000).toFixed(1)}M`,
        totalSales,
        pipelineCount,
        avgClosingDays: `${avgClosingDays}d`,
        commission: `$${(commission / 1000).toFixed(0)}k`,
        avgTicket: `$${(avgTicket / 1000).toFixed(0)}k`,
        chartByMonth,
        chartByVendedor,
        chartGmvByMonth,
        rawSales: sales || []
      };
    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
      return null;
    }
  },

  // ========== RENTALS DASHBOARD ==========
  fetchRentalsData: async (dateRange: DateRange = {}) => {
    try {
      console.log('🔄 Fetching rentals data...');
      const startTime = performance.now();

      // Get closed rental leads
      let query = supabase.from('leads')
        .select('*')
        .eq('temperatura', 'cerrado')
        .eq('busca_alquiler', true);

      if (dateRange.desde) query = query.gte('created_at', dateRange.desde);
      if (dateRange.hasta) query = query.lte('created_at', dateRange.hasta);

      const { data: rentals, error } = await query;
      if (error) throw error;

      // Calculate KPIs
      const activeContracts = rentals?.length || 0;
      const totalRentalValue = rentals?.reduce((sum, r) => sum + (r.presupuesto_max || 0), 0) || 0;

      // Get rental properties to calculate vacancy
      const { data: rentalProps } = await supabase
        .from('propiedades')
        .select('estado')
        .eq('tipo_operacion', 'alquiler');

      const totalRentalProps = rentalProps?.length || 0;
      const vacantProps = rentalProps?.filter(p => p.estado === 'publicada' || p.estado === 'activo').length || 0;
      const vacancyRate = totalRentalProps > 0 ? ((vacantProps / totalRentalProps) * 100).toFixed(1) : '0';

      // Estimate renewals (leads that were closed > 12 months ago)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const renewals = rentals?.filter(r => new Date(r.created_at) < oneYearAgo).length || 0;
      const renewalRate = activeContracts > 0 ? ((renewals / activeContracts) * 100).toFixed(0) : '0';

      // Chart data: alquileres by month
      const byMonthRaw: Record<string, number> = {};
      rentals?.forEach(r => {
        const month = new Date(r.created_at).toLocaleDateString('es', { month: 'short' });
        byMonthRaw[month] = (byMonthRaw[month] || 0) + 1;
      });
      const chartByMonth = Object.entries(byMonthRaw).map(([name, value]) => ({ name, value }));

      // Chart data: alquileres by vendedor
      const byVendedorRaw: Record<string, number> = {};
      rentals?.forEach(r => {
        const vendedor = r.vendedor_asignado || 'Sin asignar';
        byVendedorRaw[vendedor] = (byVendedorRaw[vendedor] || 0) + 1;
      });
      const chartByVendedor = Object.entries(byVendedorRaw).map(([name, value]) => ({ name, value }));

      // Chart data: distribución rangos de precio
      const priceRanges = { '<200k': 0, '200-400k': 0, '400-600k': 0, '>600k': 0 };
      rentals?.forEach(r => {
        const price = r.presupuesto_max || 0;
        if (price < 200000) priceRanges['<200k']++;
        else if (price < 400000) priceRanges['200-400k']++;
        else if (price < 600000) priceRanges['400-600k']++;
        else priceRanges['>600k']++;
      });
      const chartByPriceRange = Object.entries(priceRanges).map(([name, value]) => ({ name, value }));

      const endTime = performance.now();
      console.log(`✅ Rentals data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        activeContracts,
        totalRentalValue: `$${(totalRentalValue / 1000000).toFixed(1)}M`,
        vacancyRate: `${vacancyRate}%`,
        renewalRate: `${renewalRate}%`,
        avgYield: '5.8%', // Placeholder
        chartByMonth,
        chartByVendedor,
        chartByPriceRange,
        rawRentals: rentals || []
      };
    } catch (error) {
      console.error('❌ Error fetching rentals data:', error);
      return null;
    }
  },

  // ========== PROPERTIES DASHBOARD ==========
  fetchPropertiesData: async (dateRange: DateRange = {}) => {
    try {
      console.log('🔄 Fetching properties data...');
      const startTime = performance.now();

      // Get all properties (no date filter for stock analysis)
      const { data: properties, error } = await supabase.from('propiedades').select('*');
      if (error) throw error;

      // Calculate KPIs
      const totalProperties = properties?.length || 0;
      const publicadas = properties?.filter(p => p.estado === 'publicada').length || 0;
      const enCaptacion = properties?.filter(p => p.estado === 'captacion').length || 0;
      const totalValue = properties?.reduce((sum, p) => sum + (p.precio_venta_usd || 0), 0) || 0;

      // Average aging (days in market) - calculate from created_at
      const now = Date.now();
      const avgAging = totalProperties > 0
        ? Math.round(properties!.reduce((sum, p) => {
            const created = new Date(p.created_at).getTime();
            const days = Math.round((now - created) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / totalProperties)
        : 0;

      const totalViews = 0; // Placeholder - would need views tracking

      const propsWithoutPhoto = properties?.filter(p => !p.foto_portada_url || p.foto_portada_url === '').length || 0;
      const publicationEfficiency = totalProperties > 0
        ? (((totalProperties - propsWithoutPhoto) / totalProperties) * 100).toFixed(0)
        : '0';

      // Properties older than 90 days
      const staleProperties = properties?.filter(p => {
        const created = new Date(p.created_at).getTime();
        const days = Math.round((now - created) / (1000 * 60 * 60 * 24));
        return days > 90;
      }).length || 0;

      // Chart data: distribution by estado
      const byEstadoRaw: Record<string, number> = {};
      properties?.forEach(p => {
        const estado = p.estado || 'sin_estado';
        byEstadoRaw[estado] = (byEstadoRaw[estado] || 0) + 1;
      });
      const chartByEstado = Object.entries(byEstadoRaw).map(([name, value]) => ({ name, value }));

      // Chart data: properties by tipo
      const byTipoRaw: Record<string, number> = {};
      properties?.forEach(p => {
        const tipo = p.tipo_propiedad || 'Otro';
        byTipoRaw[tipo] = (byTipoRaw[tipo] || 0) + 1;
      });
      const chartByTipo = Object.entries(byTipoRaw)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

      // Chart data: properties by zona
      const byZonaRaw: Record<string, number> = {};
      properties?.forEach(p => {
        const zona = p.zona || 'Sin zona';
        byZonaRaw[zona] = (byZonaRaw[zona] || 0) + 1;
      });
      const chartByZona = Object.entries(byZonaRaw)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

      // Chart data: publicadas por mes
      const byMonthRaw: Record<string, number> = {};
      properties?.filter(p => p.estado === 'publicada').forEach(p => {
        const month = new Date(p.created_at).toLocaleDateString('es', { month: 'short' });
        byMonthRaw[month] = (byMonthRaw[month] || 0) + 1;
      });
      const chartByMonth = Object.entries(byMonthRaw).map(([name, value]) => ({ name, value }));

      const endTime = performance.now();
      console.log(`✅ Properties data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        totalProperties,
        publicadas,
        enCaptacion,
        totalValue: `$${(totalValue / 1000000).toFixed(0)}M`,
        avgAging: `${avgAging}d`,
        totalViews: `${(totalViews / 1000).toFixed(1)}k`,
        publicationEfficiency,
        propsWithoutPhoto,
        staleProperties,
        chartByEstado,
        chartByTipo,
        chartByZona,
        chartByMonth,
        rawProperties: properties || []
      };
    } catch (error) {
      console.error('❌ Error fetching properties data:', error);
      return null;
    }
  },

  // ========== CAPTACIÓN DASHBOARD ==========
  fetchCaptacionData: async (dateRange: DateRange = {}) => {
    try {
      console.log('🔄 Fetching captacion data...');
      const startTime = performance.now();

      // Set default date range to last 30 days if not provided
      const hasta = dateRange.hasta || new Date().toISOString();
      const desde = dateRange.desde || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get newly captured properties
      const { data: newProperties, error } = await supabase
        .from('propiedades')
        .select('*')
        .gte('created_at', desde)
        .lte('created_at', hasta);

      if (error) throw error;

      const newCaptaciones = newProperties?.length || 0;
      const incomingValue = newProperties?.reduce((sum, p) => sum + (p.precio_venta_usd || 0), 0) || 0;

      // Count exclusive properties (those in captacion state)
      const exclusiveCount = newProperties?.filter(p => p.estado === 'captacion').length || 0;
      const exclusivityRate = newCaptaciones > 0
        ? ((exclusiveCount / newCaptaciones) * 100).toFixed(0)
        : '0';

      // Tasaciones (properties in captacion state)
      const tasaciones = exclusiveCount;

      // Conversion rate (properties that went from captacion to publicada)
      const convertedProps = newProperties?.filter(p =>
        p.estado === 'publicada'
      ).length || 0;
      const conversionRate = newCaptaciones > 0
        ? ((convertedProps / newCaptaciones) * 100).toFixed(0)
        : '0';

      // Chart data: captaciones by month
      const byMonthRaw: Record<string, number> = {};
      newProperties?.forEach(p => {
        const month = new Date(p.created_at).toLocaleDateString('es', { month: 'short' });
        byMonthRaw[month] = (byMonthRaw[month] || 0) + 1;
      });
      const chartByMonth = Object.entries(byMonthRaw).map(([name, value]) => ({ name, value }));

      // Chart data: captaciones by zona
      const byZonaRaw: Record<string, number> = {};
      newProperties?.forEach(p => {
        const zona = p.zona || 'Sin zona';
        byZonaRaw[zona] = (byZonaRaw[zona] || 0) + 1;
      });
      const chartByZona = Object.entries(byZonaRaw)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

      // Chart data: captaciones by tipo
      const byTipoRaw: Record<string, number> = {};
      newProperties?.forEach(p => {
        const tipo = p.tipo_propiedad || 'Otro';
        byTipoRaw[tipo] = (byTipoRaw[tipo] || 0) + 1;
      });
      const chartByTipo = Object.entries(byTipoRaw).map(([name, value]) => ({ name, value }));

      // Chart data: captaciones by vendedor (if field exists)
      const byVendedorRaw: Record<string, number> = {};
      newProperties?.forEach(p => {
        const vendedor = (p as any).vendedor_asignado || 'Sin asignar';
        byVendedorRaw[vendedor] = (byVendedorRaw[vendedor] || 0) + 1;
      });
      const chartByVendedor = Object.entries(byVendedorRaw).map(([name, value]) => ({ name, value }));

      const endTime = performance.now();
      console.log(`✅ Captacion data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        newCaptaciones,
        exclusivityRate: `${exclusivityRate}%`,
        incomingValue: `$${(incomingValue / 1000000).toFixed(1)}M`,
        conversionRate: `${conversionRate}%`,
        tasaciones,
        chartByMonth,
        chartByZona,
        chartByTipo,
        chartByVendedor,
        rawCaptaciones: newProperties || []
      };
    } catch (error) {
      console.error('❌ Error fetching captacion data:', error);
      return null;
    }
  }
};
