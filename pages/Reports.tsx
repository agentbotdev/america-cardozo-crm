
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, Home, Key, Zap, Target,
  Activity, Filter, Download, ChevronRight, ChevronLeft,
  ArrowUpRight, ArrowDownRight, Sparkles, Clock, CheckCircle2,
  Building2, Briefcase, Layers, RotateCcw, Star,
  Eye, SlidersHorizontal, X as XIcon, Loader2, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { reportsService, type ReportKPI, type MonthlyDataPoint, type SourceDataPoint, type BarrioDataPoint } from '../services/reportsService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6'];

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  blue: Users,
  indigo: Target,
  rose: Sparkles,
  amber: CheckCircle2,
  emerald: DollarSign,
  purple: Key,
};

// ── Reusable KPI Card ──────────────────────────────────
const KPICard = ({ title, value, trend, delay = 0, color = 'indigo' }: {
  key?: React.Key; title: string; value: string; trend: string; delay?: number; color?: string;
}) => {
  const Icon = iconMap[color] || Activity;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group h-full flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

// ── Monthly Chart Card ─────────────────────────────────
const MonthlyChartCard = ({ title, data, color = '#6366f1' }: {
  title: string; data: MonthlyDataPoint[]; color?: string;
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
    <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Últimos 6 meses</p>
    <div className="h-[200px] w-full flex-1">
      {data.some(d => d.valor > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
            <XAxis dataKey="mes_corto" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold', fontSize: '12px' }}
              formatter={(v: number) => [v, 'Cantidad']}
            />
            <Area type="monotone" dataKey="valor" stroke={color} fill={`url(#grad-${color.replace('#','')})`} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-300">
          <div className="text-center">
            <Activity size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Sin datos aún</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ── Bar Chart Card (Horizontal) ────────────────────────
const DistributionCard = ({ title, data }: {
  title: string; data: SourceDataPoint[];
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
    <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Distribución</p>
    {data.length > 0 ? (
      <div className="flex-1 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 6)} layout="vertical" margin={{ left: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold', fontSize: '12px' }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="h-[200px] flex items-center justify-center text-slate-300">
        <div className="text-center">
          <Layers size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs font-medium">Sin datos</p>
        </div>
      </div>
    )}
  </div>
);

// ── Pie Chart Card ─────────────────────────────────────
const PieChartCard = ({ title, data }: {
  title: string; data: SourceDataPoint[];
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
    <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Composición</p>
    {data.length > 0 ? (
      <>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {data.map((_, i) => <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.slice(0, 5).map((d, i) => (
            <span key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {d.name}
            </span>
          ))}
        </div>
      </>
    ) : (
      <div className="h-[180px] flex items-center justify-center text-slate-300">
        <div className="text-center">
          <Target size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs font-medium">Sin datos</p>
        </div>
      </div>
    )}
  </div>
);

// ── Top Barrios Card ───────────────────────────────────
const TopBarriosCard = ({ title, data }: {
  title: string; data: BarrioDataPoint[];
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
    <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Densidad geográfica</p>
    {data.length > 0 ? (
      <div className="space-y-3 flex-1">
        {data.map((b, i) => (
          <div key={b.barrio} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-indigo-500 w-5">{i + 1}</span>
              <span className="text-xs font-bold text-slate-700">{b.barrio}</span>
            </div>
            <span className="text-sm font-black text-slate-900">{b.cantidad}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center text-slate-300">
        <p className="text-xs font-medium">Sin datos de barrios</p>
      </div>
    )}
  </div>
);

// ── Stat Highlight Card (dark) ─────────────────────────
const StatHighlightCard = ({ label, value, subtitle, icon: Icon }: {
  label: string; value: string; subtitle: string; icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <div className="bg-slate-900 rounded-2xl p-6 text-white h-full relative overflow-hidden flex flex-col justify-between shadow-lg">
    <div className="relative z-10">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">{label}</h3>
      <p className="text-4xl font-black tracking-tight text-indigo-400">{value}</p>
      <p className="text-xs font-medium text-slate-400 mt-3 leading-relaxed">{subtitle}</p>
    </div>
    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
      <Icon size={120} />
    </div>
  </div>
);

// ── Loading State ──────────────────────────────────────
const LoadingState = () => (
  <div className="flex items-center justify-center h-[400px]">
    <div className="text-center">
      <Loader2 size={36} className="mx-auto mb-3 text-indigo-500 animate-spin" />
      <p className="text-sm font-bold text-slate-400">Cargando datos...</p>
    </div>
  </div>
);

// ── Empty State ────────────────────────────────────────
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-[300px]">
    <div className="text-center">
      <AlertCircle size={36} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm font-medium text-slate-400">{message}</p>
      <p className="text-xs text-slate-300 mt-1">Los datos aparecerán aquí cuando se carguen registros.</p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// DASHBOARDS POR TAB
// ════════════════════════════════════════════════════════

const LeadsDashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof reportsService.getLeadsReport>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getLeadsReport().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!data) return <EmptyState message="Error al cargar datos de leads" />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.kpis.map((k, i) => <KPICard key={k.title} title={k.title} value={k.value} trend={k.trend} color={k.color} delay={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChartCard title="Leads por Mes" data={data.monthlyLeads} color="#6366f1" />
        </div>
        <DistributionCard title="Leads por Fuente" data={data.bySource} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PieChartCard title="Por Temperatura" data={data.byTemperature} />
        <PieChartCard title="Por Etapa" data={data.byEtapa} />
        <StatHighlightCard
          label="Total en Sistema"
          value={data.total.toString()}
          subtitle="Leads registrados en la base de datos en tiempo real."
          icon={Users}
        />
      </div>
    </div>
  );
};

const SalesDashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof reportsService.getSalesReport>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getSalesReport().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!data) return <EmptyState message="Error al cargar datos de ventas" />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.kpis.map((k, i) => <KPICard key={k.title} title={k.title} value={k.value} trend={k.trend} color={k.color} delay={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChartCard title="Propiedades en Venta por Mes" data={data.monthlySales} color="#10b981" />
        </div>
        <TopBarriosCard title="Top Barrios en Venta" data={data.topBarrios} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PieChartCard title="Por Tipo de Propiedad" data={data.byType} />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Valor del Inventario</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Resumen financiero</p>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Total (Venta)</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {data.totalValue >= 1_000_000 ? `$${(data.totalValue / 1_000_000).toFixed(1)}M` : `$${(data.totalValue / 1000).toFixed(0)}k`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Propiedades en Venta</p>
              <p className="text-3xl font-black text-emerald-600">{data.total}</p>
            </div>
          </div>
        </div>
        <StatHighlightCard
          label="Mercado de Ventas"
          value={`${data.total} props`}
          subtitle="Total de propiedades en la cartera de ventas actualmente."
          icon={DollarSign}
        />
      </div>
    </div>
  );
};

const AlquilerDashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof reportsService.getRentalReport>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getRentalReport().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!data) return <EmptyState message="Error al cargar datos de alquiler" />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.kpis.map((k, i) => <KPICard key={k.title} title={k.title} value={k.value} trend={k.trend} color={k.color} delay={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChartCard title="Alquileres por Mes" data={data.monthlyRentals} color="#8b5cf6" />
        </div>
        <DistributionCard title="Top Barrios Alquiler" data={data.byBarrio} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Métricas de Renta</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Resumen de ocupación</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Unidades</p>
              <p className="text-3xl font-black text-slate-900">{data.total}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recaudación/mes</p>
              <p className="text-3xl font-black text-emerald-600">
                {data.totalRevenue >= 1_000_000 ? `$${(data.totalRevenue / 1_000_000).toFixed(1)}M` : `$${(data.totalRevenue / 1000).toFixed(0)}k`}
              </p>
            </div>
          </div>
        </div>
        <StatHighlightCard
          label="Portfolio Alquiler"
          value={`${data.total}`}
          subtitle="Propiedades en cartera de alquiler actual."
          icon={Key}
        />
      </div>
    </div>
  );
};

const StockDashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof reportsService.getStockReport>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getStockReport().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!data) return <EmptyState message="Error al cargar datos de stock" />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.kpis.map((k, i) => <KPICard key={k.title} title={k.title} value={k.value} trend={k.trend} color={k.color} delay={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChartCard title="Incorporación de Stock por Mes" data={data.monthlyStock} color="#f59e0b" />
        </div>
        <TopBarriosCard title="Densidad Geográfica" data={data.topBarrios} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PieChartCard title="Por Tipo de Propiedad" data={data.byType} />
        <PieChartCard title="Por Operación" data={data.byOperation} />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Estado del Inventario</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Por estado actual</p>
          <div className="flex-1 space-y-3">
            {data.byStatus.map((s, i) => {
              const total = data.byStatus.reduce((sum, x) => sum + x.value, 0);
              const pct = total > 0 ? ((s.value / total) * 100).toFixed(0) : '0';
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-600 flex-1 capitalize">{s.name}</span>
                  <span className="text-xs font-black text-slate-900">{s.value}</span>
                  <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const CaptacionDashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof reportsService.getAcquisitionReport>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getAcquisitionReport().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!data) return <EmptyState message="Error al cargar datos de captación" />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.kpis.map((k, i) => <KPICard key={k.title} title={k.title} value={k.value} trend={k.trend} color={k.color} delay={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChartCard title="Captación por Mes" data={data.monthlyCaptacion} color="#f43f5e" />
        </div>
        <PieChartCard title="Nuevas por Tipo" data={data.byType} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Resumen de Captación</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Últimos 30 días</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nuevas</p>
              <p className="text-3xl font-black text-rose-600">{data.newCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sistema</p>
              <p className="text-3xl font-black text-slate-900">{data.totalAll}</p>
            </div>
          </div>
        </div>
        <StatHighlightCard
          label="Pipeline de Captación"
          value={`${data.newCount}`}
          subtitle="Propiedades incorporadas en los últimos 30 días."
          icon={Target}
        />
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// MAIN HUB
// ════════════════════════════════════════════════════════

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'sales' | 'alquiler' | 'stock' | 'captacion'>('stock');
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ desde: '', hasta: '', tipo: 'todos' });

  const tabOrder = ['leads', 'sales', 'alquiler', 'stock', 'captacion'] as const;
  const currentIdx = tabOrder.indexOf(activeTab);
  const goPrev = () => currentIdx > 0 && setActiveTab(tabOrder[currentIdx - 1]);
  const goNext = () => currentIdx < tabOrder.length - 1 && setActiveTab(tabOrder[currentIdx + 1]);

  const categories = [
    { id: 'leads', label: 'LEADS', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'sales', label: 'VENTA', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'alquiler', label: 'ALQUILER', icon: Key, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'stock', label: 'PROPIEDADES', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'captacion', label: 'CAPTACIÓN', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  // Export CSV with real data
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const rows = await reportsService.getExportData(activeTab);
      const csvContent = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-24 animate-fade-in px-4 md:px-0 bg-[#F8FAFC]">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-8 pt-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-slate-900 rounded-full" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analytics Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Reportes
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Datos en tiempo real desde Supabase. Métricas de leads, ventas, alquileres, stock y captación.
          </p>
        </div>

        <div className="flex w-full lg:w-auto gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-lg">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 transition-colors rounded-xl border ${showFilters ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'text-slate-500 hover:text-slate-900 bg-slate-50 border-slate-100'}`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-indigo-500" /> Filtros Avanzados
                </h3>
                <button onClick={() => setShowFilters(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <XIcon size={13} className="text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Desde</label>
                  <input type="date" value={filters.desde} onChange={e => setFilters({ ...filters, desde: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hasta</label>
                  <input type="date" value={filters.hasta} onChange={e => setFilters({ ...filters, hasta: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                  <select value={filters.tipo} onChange={e => setFilters({ ...filters, tipo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 appearance-none">
                    <option value="todos">Venta + Alquiler</option>
                    <option value="venta">Solo Ventas</option>
                    <option value="alquiler">Solo Alquiler</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setFilters({ desde: '', hasta: '', tipo: 'todos' })}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Limpiar
                </button>
                <button onClick={() => setShowFilters(false)}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors active:scale-95">
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="w-8 h-8 flex-shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex gap-2 flex-1 justify-center overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border relative group shrink-0
                ${activeTab === cat.id
                  ? `${cat.bg} ${cat.color} border-transparent shadow-lg`
                  : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600'
                }`}
            >
              <cat.icon size={14} className="shrink-0" />
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIdx === tabOrder.length - 1}
          className="w-8 h-8 flex-shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[800px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {activeTab === 'leads' && <LeadsDashboard />}
            {activeTab === 'sales' && <SalesDashboard />}
            {activeTab === 'alquiler' && <AlquilerDashboard />}
            {activeTab === 'stock' && <StockDashboard />}
            {activeTab === 'captacion' && <CaptacionDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports;
