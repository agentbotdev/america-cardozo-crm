import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, Calendar, DollarSign, TrendingUp, ArrowUpRight, Sparkles, Zap, Star, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { supabase } from '../services/supabaseClient';
import { dashboardService } from '../services/dashboardService';
import { Lead } from '../types';

// ---- Data Preparation for Charts ----
const leadStatusData = [
  { name: 'Nuevo', value: 15, color: '#94a3b8' }, // Slate 400
  { name: 'Contactado', value: 25, color: '#6366f1' }, // Indigo 500
  { name: 'En Visita', value: 10, color: '#3b82f6' }, // Blue 500
  { name: 'Negociación', value: 5, color: '#f59e0b' }, // Amber 500
  { name: 'Cerrado', value: 8, color: '#10b981' }, // Emerald 500
];

const leadsBySourceData = [
  { name: 'Portales', value: 45 },
  { name: 'WhatsApp', value: 30 },
  { name: 'Redes', value: 15 },
  { name: 'Referidos', value: 10 },
];

const activityData = Array.from({ length: 15 }, (_, i) => ({
  day: `Dia ${i + 1}`,
  leads: Math.floor(Math.random() * 10) + 2,
}));

// ---- Components ----
interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  delay: number;
  color?: 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon: Icon, delay, color = 'slate' }) => {
  const colorStyles = {
    slate: {
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      badgeBg: 'bg-slate-50 text-slate-600 border-slate-200'
    },
    indigo: {
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    blue: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    emerald: {
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    amber: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    rose: {
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-100'
    },
  };

  const theme = colorStyles[color];
  const isPositive = subtext && !subtext.includes('-');

  return (
    <div
      className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-white/60 opacity-50 rounded-bl-[100px] -mr-6 -mt-6 transition-all group-hover:scale-110"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center shadow-sm border border-white/50`}>
            <Icon size={24} className="drop-shadow-sm" />
          </div>
          {subtext && (
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
              <TrendingUp size={12} className={isPositive ? '' : 'rotate-180'} /> {subtext}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
    <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
    <span className="text-slate-800">{children}</span>
  </h3>
);

interface QuickActionCardProps {
  icon: React.ElementType;
  label: string;
  desc: string;
}
const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon: Icon, label, desc }) => (
  <div className="group bg-white/40 hover:bg-white border border-white/50 hover:border-slate-200 p-4 rounded-2xl transition-all duration-300 cursor-pointer flex items-center gap-4 hover:shadow-md">
    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-600 group-hover:text-white">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-slate-700 text-sm group-hover:text-slate-900">{label}</h4>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    propertiesCount: 0,
    visitsScheduled: 0,
    hotLeadsCount: 0
  });
  const [charts, setCharts] = useState({
    leadStatusData: [] as any[],
    leadsBySourceData: [] as any[]
  });
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, chartData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getChartData()
      ]);

      setStats({
        totalLeads: statsData.totalLeads,
        propertiesCount: statsData.propertiesCount,
        visitsScheduled: statsData.visitsScheduled,
        hotLeadsCount: statsData.hotLeadsCount
      });

      setHotLeads(statsData.hotLeads as any || []);

      if (chartData) {
        setCharts({
          leadStatusData: chartData.leadStatusData,
          leadsBySourceData: chartData.leadsBySourceData
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Leads"
          value={stats.totalLeads}
          subtext="+12% vs mes"
          icon={Users}
          delay={0}
          color="blue"
        />
        <KpiCard
          title="Stock Propiedades"
          value={stats.propertiesCount}
          subtext="Unidades activas"
          icon={Building2}
          delay={100}
          color="emerald"
        />
        <KpiCard
          title="Visitas Agendadas"
          value={stats.visitsScheduled}
          subtext="Historial total"
          icon={Calendar}
          delay={200}
          color="indigo"
        />
        <KpiCard
          title="Hot Leads"
          value={stats.hotLeadsCount}
          subtext="Oportunidades"
          icon={Sparkles}
          delay={300}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column: Charts */}
        <div className="xl:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>

          {/* Activity Chart */}
          <div className="glass-card p-8 rounded-3xl bg-white/60">
            <div className="flex justify-between items-center mb-6">
              <SectionTitle>Actividad de Leads</SectionTitle>
              <select className="bg-white border border-slate-200 text-xs font-medium text-slate-500 rounded-lg px-3 py-1 outline-none hover:border-slate-400 transition-colors">
                <option>Últimos 30 días</option>
                <option>Últimos 7 días</option>
              </select>
            </div>
            <div className="h-72 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: '#1E293B', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl bg-white/60">
              <SectionTitle>Estado del Pipeline</SectionTitle>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.leadStatusData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={6}
                      stroke="none"
                    >
                      {charts.leadStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1E293B', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">{stats.totalLeads}</span>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {charts.leadStatusData.map((entry, i) => (
                  <div key={i} className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl bg-white/60">
              <SectionTitle>Fuente de Leads</SectionTitle>
              <div className="h-48 px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.leadsBySourceData} layout="vertical" barSize={16} margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', background: '#1E293B', color: '#fff', border: 'none' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" fill="#64748b" radius={[0, 4, 4, 0]}>
                      {charts.leadsBySourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#475569' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>

          {/* AI Insight - Updated to Obsidian/Black Theme */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-400/50 text-white relative overflow-hidden group border border-slate-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-700 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-lg overflow-hidden flex items-center justify-center shadow-lg border border-white/20">
                  <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">AI Agent Active</span>
              </div>
              <h4 className="text-xl font-bold leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">2 Oportunidades detectadas hoy</h4>
              <p className="text-sm text-slate-300 mb-6 font-medium leading-relaxed">El lead Juan Pérez muestra comportamiento de cierre inminente basado en interacciones recientes.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-white">
                <Sparkles size={14} className="text-slate-300" /> Ver Análisis Detallado
              </button>
            </div>
          </div>

          {/* Quick Access Stack */}
          <div className="glass-card p-6 rounded-3xl bg-white/60">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-slate-900" />
              <span className="text-slate-700">Accesos Rápidos</span>
            </h3>
            <div className="space-y-3">
              <QuickActionCard icon={Sparkles} label="Nueva Captación" desc="Registrar propiedad" />
              <QuickActionCard icon={Zap} label="Lead Rápido" desc="Ingreso manual" />
              <QuickActionCard icon={Star} label="Ver Destacados" desc="Propiedades top" />
            </div>
          </div>

          {/* Hot Leads List */}
          <div className="glass-card p-6 rounded-3xl bg-white/60">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-slate-700">🔥 Hot Leads</span>
              </h3>
              <button className="text-xs text-slate-500 font-bold hover:text-slate-900 transition-colors">Ver todo</button>
            </div>
            <div className="space-y-3">
              {hotLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-3 bg-white/50 hover:bg-white rounded-2xl transition-all duration-300 border border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {lead.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-black transition-colors">{lead.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">{lead.email || 'Sin email'} • {lead.telefono || 'Sin tel'}</p>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    {lead.score || 0}/100
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
