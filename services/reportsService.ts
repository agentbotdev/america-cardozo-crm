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

      // Aggregate by source
      const bySource: Record<string, number> = {};
      leads?.forEach(l => {
        const source = l.fuente_consulta || 'Otro';
        bySource[source] = (bySource[source] || 0) + 1;
      });

      // Aggregate by month
      const byMonth: Record<string, number> = {};
      leads?.forEach(l => {
        const month = new Date(l.created_at).toLocaleDateString('es', { month: 'short' });
        byMonth[month] = (byMonth[month] || 0) + 1;
      });

      const endTime = performance.now();
      console.log(`✅ Leads data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        totalLeads,
        hotLeads,
        responseRate: `${responseRate}%`,
        avgScore,
        conversionRate: `${conversionRate}%`,
        bySource,
        byMonth
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
        .eq('operacion_buscada', 'venta');

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
      const { data: pipeline, error: pipelineError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('operacion_buscada', 'venta')
        .in('temperatura', ['tibio', 'caliente', 'ultra_caliente']);

      if (pipelineError) throw pipelineError;

      const pipelineCount = pipeline?.length || 0;

      // Average closing days (estimate based on created_at to updated_at)
      const avgClosingDays = totalSales > 0
        ? Math.round(sales!.reduce((sum, s) => {
            const created = new Date(s.created_at).getTime();
            const updated = new Date(s.updated_at).getTime();
            const days = Math.round((updated - created) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / totalSales)
        : 0;

      const endTime = performance.now();
      console.log(`✅ Sales data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        gmv: `$${(gmv / 1000000).toFixed(1)}M`,
        totalSales,
        pipelineCount,
        avgClosingDays: `${avgClosingDays}d`,
        commission: `$${(commission / 1000).toFixed(0)}k`,
        avgTicket: `$${(avgTicket / 1000).toFixed(0)}k`
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
        .eq('operacion_buscada', 'alquiler');

      if (dateRange.desde) query = query.gte('created_at', dateRange.desde);
      if (dateRange.hasta) query = query.lte('created_at', dateRange.hasta);

      const { data: rentals, error } = await query;
      if (error) throw error;

      // Calculate KPIs
      const activeContracts = rentals?.length || 0;
      const totalRentalValue = rentals?.reduce((sum, r) => sum + (r.presupuesto_max || 0), 0) || 0;

      // Get rental properties to calculate vacancy
      const { data: rentalProps, error: propsError } = await supabase
        .from('propiedades')
        .select('estado')
        .eq('tipo_operacion', 'alquiler');

      if (propsError) throw propsError;

      const totalRentalProps = rentalProps?.length || 0;
      const vacantProps = rentalProps?.filter(p => p.estado === 'activo' || p.estado === 'publicada').length || 0;
      const vacancyRate = totalRentalProps > 0 ? ((vacantProps / totalRentalProps) * 100).toFixed(1) : '0';

      // Estimate renewals (leads that were closed > 12 months ago)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const renewals = rentals?.filter(r => new Date(r.created_at) < oneYearAgo).length || 0;
      const renewalRate = activeContracts > 0 ? ((renewals / activeContracts) * 100).toFixed(0) : '0';

      const endTime = performance.now();
      console.log(`✅ Rentals data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        activeContracts,
        totalRentalValue: `$${(totalRentalValue / 1000000).toFixed(1)}M`,
        vacancyRate: `${vacancyRate}%`,
        renewalRate: `${renewalRate}%`,
        avgYield: '5.8%' // This would need property purchase prices to calculate accurately
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

      // Get all properties
      let query = supabase.from('propiedades').select('*');
      if (dateRange.desde) query = query.gte('created_at', dateRange.desde);
      if (dateRange.hasta) query = query.lte('created_at', dateRange.hasta);

      const { data: properties, error } = await query;
      if (error) throw error;

      // Calculate KPIs
      const totalProperties = properties?.length || 0;
      const totalValue = properties?.reduce((sum, p) => sum + (p.precio_venta || 0), 0) || 0;

      // Average aging (days in market)
      const avgAging = totalProperties > 0
        ? Math.round(properties!.reduce((sum, p) => sum + (p.dias_en_market || 0), 0) / totalProperties)
        : 0;

      const totalViews = properties?.reduce((sum, p) => sum + (p.vistas_totales || 0), 0) || 0;

      const propsWithoutPhoto = properties?.filter(p => !p.foto_portada || p.fotos?.length === 0).length || 0;
      const publicationEfficiency = totalProperties > 0
        ? (((totalProperties - propsWithoutPhoto) / totalProperties) * 100).toFixed(0)
        : '0';

      // Properties older than 90 days
      const staleProperties = properties?.filter(p => (p.dias_en_market || 0) > 90).length || 0;

      const endTime = performance.now();
      console.log(`✅ Properties data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        totalProperties,
        totalValue: `$${(totalValue / 1000000).toFixed(0)}M`,
        avgAging: `${avgAging}d`,
        totalViews: `${(totalViews / 1000).toFixed(1)}k`,
        publicationEfficiency: `${publicationEfficiency}%`,
        propsWithoutPhoto,
        staleProperties
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
      const incomingValue = newProperties?.reduce((sum, p) => sum + (p.precio_venta || 0), 0) || 0;

      // Count exclusive properties (those with exclusividad flag or similar)
      // Note: Assuming exclusivity would be marked in estado or a custom field
      const exclusiveCount = newProperties?.filter(p =>
        p.estado === 'captacion' || p.propietario_nombre
      ).length || 0;
      const exclusivityRate = newCaptaciones > 0
        ? ((exclusiveCount / newCaptaciones) * 100).toFixed(0)
        : '0';

      // Tasaciones (would need a separate table, using captacion estado as proxy)
      const tasaciones = newProperties?.filter(p => p.estado === 'captacion').length || 0;

      // Conversion rate (properties that went from captacion to publicada)
      const convertedProps = newProperties?.filter(p =>
        p.estado === 'publicada' || p.estado === 'activo'
      ).length || 0;
      const conversionRate = newCaptaciones > 0
        ? ((convertedProps / newCaptaciones) * 100).toFixed(0)
        : '0';

      const endTime = performance.now();
      console.log(`✅ Captacion data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      return {
        newCaptaciones,
        exclusivityRate: `${exclusivityRate}%`,
        incomingValue: `$${(incomingValue / 1000000).toFixed(1)}M`,
        conversionRate: `${conversionRate}%`,
        tasaciones
      };
    } catch (error) {
      console.error('❌ Error fetching captacion data:', error);
      return null;
    }
  }
};
