import { supabase } from './supabaseClient';

// ── Tipos ──────────────────────────────────────────────
export interface ReportKPI {
  title: string;
  value: string;
  trend: string;
  color: string;
}

export interface MonthlyDataPoint {
  mes: string;
  valor: number;
  mes_corto: string;
}

export interface SourceDataPoint {
  name: string;
  value: number;
}

export interface BarrioDataPoint {
  barrio: string;
  cantidad: number;
}

// ── Helpers ────────────────────────────────────────────
const formatCurrency = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
};

const formatNumber = (n: number): string => {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

const getMonthLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '');
};

const getMonthYear = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getLast6Months = (): { key: string; label: string }[] => {
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', ''),
    });
  }
  return months;
};

// ── Reports Service ────────────────────────────────────
export const reportsService = {

  // ═══════════════════════════════════════════════════════
  // TAB 1: LEADS
  // ═══════════════════════════════════════════════════════
  getLeadsReport: async () => {
    const [
      { data: leads, count: totalLeads },
      { count: hotLeads },
      { count: cerrados },
      { count: activos },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact' }),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .or('temperatura.eq.caliente,temperatura.eq.ultra_caliente'),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .eq('estado_lead', 'ganado'),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .eq('estado_lead', 'activo'),
    ]);

    const total = totalLeads || 0;
    const hot = hotLeads || 0;
    const won = cerrados || 0;
    const active = activos || 0;
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0';
    const avgScore = leads && leads.length > 0
      ? (leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length).toFixed(1)
      : '0';

    // Leads por fuente
    const sourceCounts: Record<string, number> = {};
    (leads || []).forEach(l => {
      const src = l.fuente_consulta || l.origen || 'Directo';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });
    const bySource: SourceDataPoint[] = Object.entries(sourceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Leads por mes (últimos 6 meses)
    const months = getLast6Months();
    const monthlyLeads: MonthlyDataPoint[] = months.map(m => ({
      mes: m.key,
      mes_corto: m.label,
      valor: (leads || []).filter(l => l.created_at && getMonthYear(l.created_at) === m.key).length,
    }));

    // Leads por temperatura
    const tempCounts: Record<string, number> = {};
    (leads || []).forEach(l => {
      const temp = l.temperatura || 'frio';
      tempCounts[temp] = (tempCounts[temp] || 0) + 1;
    });

    // Leads por etapa
    const etapaCounts: Record<string, number> = {};
    (leads || []).forEach(l => {
      const etapa = l.etapa || 'contacto_inicial';
      etapaCounts[etapa] = (etapaCounts[etapa] || 0) + 1;
    });

    return {
      kpis: [
        { title: 'Total Leads', value: formatNumber(total), trend: total > 0 ? `${total}` : '0', color: 'blue' },
        { title: 'Score Prom.', value: avgScore, trend: `/${100}`, color: 'indigo' },
        { title: 'Leads Hot', value: hot.toString(), trend: total > 0 ? `${((hot/total)*100).toFixed(0)}%` : '0%', color: 'rose' },
        { title: 'Conversión', value: `${conversionRate}%`, trend: `${won} ganados`, color: 'amber' },
        { title: 'Activos', value: active.toString(), trend: total > 0 ? `${((active/total)*100).toFixed(0)}% activos` : '0%', color: 'emerald' },
      ] as ReportKPI[],
      bySource,
      monthlyLeads,
      byTemperature: Object.entries(tempCounts).map(([name, value]) => ({ name, value })),
      byEtapa: Object.entries(etapaCounts).map(([name, value]) => ({ name, value })),
      total,
    };
  },

  // ═══════════════════════════════════════════════════════
  // TAB 2: VENTAS
  // ═══════════════════════════════════════════════════════
  getSalesReport: async () => {
    const { data: props } = await supabase.from('propiedades')
      .select('tipo_operacion, estado, precio_venta, moneda_venta, tipo_propiedad, barrio, created_at')
      .or('tipo_operacion.ilike.%venta%,tipo_operacion.ilike.%Venta%');

    const allSale = props || [];
    const totalSale = allSale.length;

    // Valor total del inventario en venta
    const totalValueUSD = allSale.reduce((sum, p) => {
      const price = p.precio_venta || 0;
      return sum + Number(price);
    }, 0);

    // Propiedades vendidas (reservadas = vendidas en este contexto)
    const vendidas = allSale.filter(p => p.estado === 'reservada').length;

    // Por tipo de propiedad
    const typeCounts: Record<string, number> = {};
    allSale.forEach(p => {
      const t = p.tipo_propiedad || 'Otro';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    // Por barrio
    const barrioCounts: Record<string, number> = {};
    allSale.forEach(p => {
      const b = p.barrio || 'Sin barrio';
      barrioCounts[b] = (barrioCounts[b] || 0) + 1;
    });
    const topBarrios: BarrioDataPoint[] = Object.entries(barrioCounts)
      .map(([barrio, cantidad]) => ({ barrio, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Mensual
    const months = getLast6Months();
    const monthlySales: MonthlyDataPoint[] = months.map(m => ({
      mes: m.key,
      mes_corto: m.label,
      valor: allSale.filter(p => p.created_at && getMonthYear(p.created_at) === m.key).length,
    }));

    return {
      kpis: [
        { title: 'GMV Total', value: formatCurrency(totalValueUSD), trend: `${totalSale} props`, color: 'emerald' },
        { title: 'En Venta', value: totalSale.toString(), trend: 'activas', color: 'indigo' },
        { title: 'Vendidas', value: vendidas.toString(), trend: totalSale > 0 ? `${((vendidas/totalSale)*100).toFixed(0)}%` : '0%', color: 'blue' },
        { title: 'Precio Prom.', value: totalSale > 0 ? formatCurrency(totalValueUSD / totalSale) : '$0', trend: 'USD', color: 'amber' },
        { title: 'Tipos', value: Object.keys(typeCounts).length.toString(), trend: 'categorías', color: 'rose' },
      ] as ReportKPI[],
      topBarrios,
      monthlySales,
      byType: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
      total: totalSale,
      totalValue: totalValueUSD,
    };
  },

  // ═══════════════════════════════════════════════════════
  // TAB 3: ALQUILER
  // ═══════════════════════════════════════════════════════
  getRentalReport: async () => {
    const { data: props } = await supabase.from('propiedades')
      .select('tipo_operacion, estado, precio_alquiler, moneda_alquiler, tipo_propiedad, barrio, created_at')
      .or('tipo_operacion.ilike.%alquiler%,tipo_operacion.ilike.%Alquiler%,tipo_operacion.ilike.%rent%');

    const allRental = props || [];
    const totalRental = allRental.length;

    // Recaudación total mensual estimada
    const monthlyRevenue = allRental.reduce((sum, p) => sum + Number(p.precio_alquiler || 0), 0);

    // Alquiladas/reservadas
    const alquiladas = allRental.filter(p => p.estado === 'reservada').length;

    // Vacancia
    const disponibles = allRental.filter(p => p.estado === 'activo').length;
    const vacancyRate = totalRental > 0 ? ((disponibles / totalRental) * 100).toFixed(1) : '0';

    // Yield promedio (simplificado)
    const avgRent = totalRental > 0 ? monthlyRevenue / totalRental : 0;

    // Por barrio
    const barrioCounts: Record<string, number> = {};
    allRental.forEach(p => {
      const b = p.barrio || 'Sin barrio';
      barrioCounts[b] = (barrioCounts[b] || 0) + 1;
    });

    // Mensual
    const months = getLast6Months();
    const monthlyRentals: MonthlyDataPoint[] = months.map(m => ({
      mes: m.key,
      mes_corto: m.label,
      valor: allRental.filter(p => p.created_at && getMonthYear(p.created_at) === m.key).length,
    }));

    return {
      kpis: [
        { title: 'En Alquiler', value: totalRental.toString(), trend: 'unidades', color: 'purple' },
        { title: 'Recaudación', value: formatCurrency(monthlyRevenue), trend: '/mes', color: 'emerald' },
        { title: 'Vacancia', value: `${vacancyRate}%`, trend: `${disponibles} disp.`, color: 'blue' },
        { title: 'Alquiladas', value: alquiladas.toString(), trend: totalRental > 0 ? `${((alquiladas/totalRental)*100).toFixed(0)}%` : '0%', color: 'amber' },
        { title: 'Renta Prom.', value: formatCurrency(avgRent), trend: '/mes', color: 'rose' },
      ] as ReportKPI[],
      monthlyRentals,
      byBarrio: Object.entries(barrioCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
      total: totalRental,
      totalRevenue: monthlyRevenue,
    };
  },

  // ═══════════════════════════════════════════════════════
  // TAB 4: STOCK (Propiedades)
  // ═══════════════════════════════════════════════════════
  getStockReport: async () => {
    const { data: props, count: totalCount } = await supabase.from('propiedades')
      .select('tipo_operacion, estado, precio, precio_venta, precio_alquiler, moneda, tipo_propiedad, barrio, dormitorios, metros_cubiertos, superficie_total, created_at', { count: 'exact' });

    const all = props || [];
    const total = totalCount || all.length;

    // Valor total del inventario
    const totalInventoryValue = all.reduce((sum, p) => sum + Number(p.precio_venta || p.precio || 0), 0);

    // Aging: avg días desde created_at
    const now = Date.now();
    const avgAgingDays = all.length > 0
      ? Math.round(all.reduce((sum, p) => {
          const created = p.created_at ? new Date(p.created_at).getTime() : now;
          return sum + (now - created) / (1000 * 60 * 60 * 24);
        }, 0) / all.length)
      : 0;

    // Por tipo de operación
    const opCounts: Record<string, number> = {};
    all.forEach(p => {
      const op = p.tipo_operacion || 'Sin definir';
      opCounts[op] = (opCounts[op] || 0) + 1;
    });

    // Por tipo de propiedad
    const typeCounts: Record<string, number> = {};
    all.forEach(p => {
      const t = p.tipo_propiedad || 'Otro';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    // Por barrio (top 5)
    const barrioCounts: Record<string, number> = {};
    all.forEach(p => {
      const b = p.barrio || 'Sin barrio';
      barrioCounts[b] = (barrioCounts[b] || 0) + 1;
    });
    const topBarrios: BarrioDataPoint[] = Object.entries(barrioCounts)
      .map(([barrio, cantidad]) => ({ barrio, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);

    // Por estado
    const statusCounts: Record<string, number> = {};
    all.forEach(p => {
      const s = p.estado || 'activo';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // Mensual (creación de propiedades)
    const months = getLast6Months();
    const monthlyStock: MonthlyDataPoint[] = months.map(m => ({
      mes: m.key,
      mes_corto: m.label,
      valor: all.filter(p => p.created_at && getMonthYear(p.created_at) === m.key).length,
    }));

    // Precio promedio
    const avgPrice = all.length > 0
      ? all.reduce((s, p) => s + Number(p.precio_venta || p.precio || 0), 0) / all.length
      : 0;

    return {
      kpis: [
        { title: 'Total Stock', value: total.toString(), trend: 'unidades', color: 'indigo' },
        { title: 'Valor Inventario', value: formatCurrency(totalInventoryValue), trend: 'USD', color: 'emerald' },
        { title: 'Aging Medio', value: `${avgAgingDays}d`, trend: 'días publicado', color: 'blue' },
        { title: 'Precio Prom.', value: formatCurrency(avgPrice), trend: 'USD', color: 'amber' },
        { title: 'Categorías', value: Object.keys(typeCounts).length.toString(), trend: 'tipos', color: 'rose' },
      ] as ReportKPI[],
      topBarrios,
      monthlyStock,
      byType: Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      byOperation: Object.entries(opCounts).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      total,
      totalInventoryValue,
    };
  },

  // ═══════════════════════════════════════════════════════
  // TAB 5: CAPTACIÓN
  // ═══════════════════════════════════════════════════════
  getAcquisitionReport: async () => {
    // Captación = propiedades recientemente añadidas al sistema
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      { data: recentProps, count: recentCount },
      { data: allProps, count: totalCount },
    ] = await Promise.all([
      supabase.from('propiedades')
        .select('tipo_operacion, tipo_propiedad, barrio, precio_venta, moneda_venta, created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('propiedades')
        .select('tipo_operacion, tipo_propiedad, barrio, precio_venta, moneda_venta, created_at', { count: 'exact' }),
    ]);

    const recent = recentProps || [];
    const all = allProps || [];
    const newCount = recentCount || 0;
    const totalAll = totalCount || 0;

    // Valor de propiedades nuevas
    const newValue = recent.reduce((sum, p) => sum + Number(p.precio_venta || 0), 0);

    // Tasa de captación (nuevas/total últimos 30 días)
    const captacionRate = totalAll > 0 ? ((newCount / totalAll) * 100).toFixed(1) : '0';

    // Por tipo
    const typeCounts: Record<string, number> = {};
    recent.forEach(p => {
      const t = p.tipo_propiedad || 'Otro';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    // Mensual
    const months = getLast6Months();
    const monthlyCaptacion: MonthlyDataPoint[] = months.map(m => ({
      mes: m.key,
      mes_corto: m.label,
      valor: all.filter(p => p.created_at && getMonthYear(p.created_at) === m.key).length,
    }));

    return {
      kpis: [
        { title: 'Nuevas (30d)', value: newCount.toString(), trend: 'captaciones', color: 'rose' },
        { title: 'Valor Ingreso', value: formatCurrency(newValue), trend: 'USD', color: 'emerald' },
        { title: 'Tasa Captación', value: `${captacionRate}%`, trend: 'del total', color: 'blue' },
        { title: 'Total Sistema', value: totalAll.toString(), trend: 'propiedades', color: 'indigo' },
        { title: 'Categorías', value: Object.keys(typeCounts).length.toString(), trend: 'tipos nuevos', color: 'amber' },
      ] as ReportKPI[],
      monthlyCaptacion,
      byType: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
      newCount,
      totalAll,
    };
  },

  // ═══════════════════════════════════════════════════════
  // EXPORT: Genera CSV con datos reales
  // ═══════════════════════════════════════════════════════
  getExportData: async (tab: string) => {
    const rows: string[][] = [['Sección', 'Métrica', 'Valor']];

    if (tab === 'leads') {
      const data = await reportsService.getLeadsReport();
      data.kpis.forEach(k => rows.push(['Leads', k.title, k.value]));
      data.bySource.forEach(s => rows.push(['Leads - Fuente', s.name, s.value.toString()]));
    } else if (tab === 'sales') {
      const data = await reportsService.getSalesReport();
      data.kpis.forEach(k => rows.push(['Ventas', k.title, k.value]));
      data.topBarrios.forEach(b => rows.push(['Ventas - Barrio', b.barrio, b.cantidad.toString()]));
    } else if (tab === 'alquiler') {
      const data = await reportsService.getRentalReport();
      data.kpis.forEach(k => rows.push(['Alquiler', k.title, k.value]));
    } else if (tab === 'stock') {
      const data = await reportsService.getStockReport();
      data.kpis.forEach(k => rows.push(['Stock', k.title, k.value]));
      data.topBarrios.forEach(b => rows.push(['Stock - Barrio', b.barrio, b.cantidad.toString()]));
    } else if (tab === 'captacion') {
      const data = await reportsService.getAcquisitionReport();
      data.kpis.forEach(k => rows.push(['Captación', k.title, k.value]));
    }

    return rows;
  },
};
