
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, Home, Key, Zap, Target,
  Activity, Filter, Download, ChevronRight,
  ArrowUpRight, ArrowDownRight, Sparkles, Clock, CheckCircle2,
  Building2, Briefcase, Layers, RotateCcw, Star, MoreHorizontal,
  Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart as ReBarChart, Bar as ReBar, LineChart, Line,
  CartesianGrid
} from 'recharts';
import {
  BarChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  BarSeries,
  Bar,
  GridlineSeries,
  Gridline
} from 'reaviz';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// --- CUSTOM HIGH-FIDELITY COMPONENTS ---

const KPICard = ({ title, value, trend, icon: Icon, delay = 0, color = 'indigo' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group h-full flex flex-col justify-between transform-gpu"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3.5 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={22} />
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${trend.includes('+') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{title}</p>
      <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
    </div>
  </motion.div>
);

const GroupedIncidentReportCard = ({ title, metrics, chartData }: any) => {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 flex flex-col h-full overflow-hidden transform-gpu transition-all hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{title} Report</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Analytical insights by source</p>
        </div>
        <div className="flex gap-2">
          {['Directo', 'Web', 'Referido', 'Bot'].map((l, i) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[240px] mb-8 w-full">
        <BarChart
          height={240}
          data={chartData || [
            { key: 'Jan', data: [{ key: 'A', data: 20 }, { key: 'B', data: 35 }, { key: 'C', data: 45 }, { key: 'D', data: 15 }] },
            { key: 'Feb', data: [{ key: 'A', data: 25 }, { key: 'B', data: 40 }, { key: 'C', data: 50 }, { key: 'D', data: 20 }] },
            { key: 'Mar', data: [{ key: 'A', data: 15 }, { key: 'B', data: 30 }, { key: 'C', data: 40 }, { key: 'D', data: 25 }] },
            { key: 'Apr', data: [{ key: 'A', data: 30 }, { key: 'B', data: 45 }, { key: 'C', data: 55 }, { key: 'D', data: 10 }] },
          ]}
          yAxis={<LinearYAxis axisLine={null} tickSeries={<LinearYAxisTickSeries line={null} label={null} />} />}
          xAxis={<LinearXAxis type="category" tickSeries={<LinearXAxisTickSeries label={<LinearXAxisTickLabel padding={10} rotation={-45} fill="#94a3b8" />} />} />}
          series={<BarSeries type="grouped" layout="vertical" bar={<Bar width={8} glow={{ blur: 20, opacity: 0.7 }} gradient={null} />} colorScheme={COLORS} groupPadding={20} />}
          gridlines={<GridlineSeries line={<Gridline strokeColor="rgba(148, 163, 184, 0.1)" />} />}
        />
      </div>

      <div className="space-y-5 border-t border-slate-50 pt-8 mt-auto">
        <div className="grid grid-cols-2 gap-8 mb-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volumen Crítico</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">321</span>
              <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-lg">↑ 12%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volumen Total</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">1,120</span>
              <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg">↓ 4%</span>
            </div>
          </div>
        </div>

        {metrics?.map((m: any, i: number) => (
          <div key={i} className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                {m.icon}
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{m.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{m.value}</span>
              {m.trend === 'up' ? <ArrowUpRight size={14} className="text-rose-500" /> : <ArrowDownRight size={14} className="text-emerald-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GlowingLineCard = ({ title, trend = "+5.2%" }: any) => (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 flex flex-col h-full overflow-hidden relative group">
    <div className="mb-8">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{title}</h3>
        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{trend}</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Data Monitor: Q1 2024</p>
    </div>
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={[
          { n: 'Jan', v1: 40, v2: 60 }, { n: 'Feb', v1: 70, v2: 45 },
          { n: 'Mar', v1: 55, v2: 80 }, { n: 'Apr', v1: 90, v2: 55 },
          { n: 'May', v1: 85, v2: 95 }, { n: 'Jun', v1: 110, v2: 70 },
        ]}>
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
          <XAxis dataKey="n" hide /> <YAxis hide />
          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 'bold' }} />
          <Line type="monotone" dataKey="v1" stroke="#6366f1" strokeWidth={5} dot={false} filter="url(#glow)" />
          <Line type="monotone" dataKey="v2" stroke="#f59e0b" strokeWidth={5} dot={false} filter="url(#glow)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="flex justify-between mt-6 pt-6 border-t border-slate-50">
      {['Ene', 'Mar', 'Jun'].map(m => <span key={m} className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{m}</span>)}
    </div>
  </div>
);

const StatisticsCard = ({ title, value, subtext }: any) => (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 flex flex-col h-full overflow-hidden">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{title}</p>
    <div className="flex items-baseline gap-2 mb-4">
      <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{value}</h3>
      <span className="text-sm font-bold text-slate-300">USD</span>
    </div>
    <p className="text-emerald-500 text-[11px] font-black tracking-widest mb-8">{subtext}</p>
    <div className="h-[120px] w-full mb-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[{ v: 10 }, { v: 25 }, { v: 18 }, { v: 35 }, { v: 25 }, { v: 45 }, { v: 30 }]}>
          <Area type="monotone" dataKey="v" stroke="#1e293b" fill="#f8fafc" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="space-y-5 mt-auto">
      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>Dominancia del Mercado</span>
        <span className="text-slate-900">84.2%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: '60%' }}></div>
        <div className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: '25%' }}></div>
        <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '15%' }}></div>
      </div>
    </div>
  </div>
);

const FunnelCard = ({ title, color = "#10b981" }: any) => (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 flex flex-col h-full overflow-hidden">
    <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-6">
      <div>
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-1">{title} Rate</h3>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-black text-slate-900 tracking-tighter">16.9%</span>
          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm">+2.1%</span>
        </div>
      </div>
      <button className="bg-slate-900 text-white p-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-600 transition-all active:scale-95">DETALLES</button>
    </div>
    <div className="h-[180px] w-full mb-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[{ n: 1, v: 20 }, { n: 2, v: 45 }, { n: 3, v: 30 }, { n: 4, v: 65 }, { n: 5, v: 45 }, { n: 6, v: 85 }]}>
          <Area type="monotone" dataKey="v" stroke={color} fill={`${color}10`} strokeWidth={5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-auto">
      <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600">Entrantes</p>
        <p className="text-2xl font-black text-slate-900">3,842</p>
      </div>
      <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-rose-600">Salidas</p>
        <p className="text-2xl font-black text-slate-900">1,256</p>
      </div>
    </div>
  </div>
);

// --- MAIN REPORT DASHBOARDS PER CATEGORY ---

const commonMetrics = [
  { label: 'Tiempo de Respuesta Promedio', value: '6 Horas', icon: <Zap size={14} />, trend: 'up' },
  { label: 'Tiempo de Resolución de Incidencias', value: '4 Horas', icon: <Clock size={14} />, trend: 'up' },
  { label: 'Escalado de Incidencias', value: '10%', icon: <Target size={14} />, trend: 'down' }
];

const LeadsDashboard = () => (
  <div className="space-y-10 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard title="Total Leads" value="1,245" trend="+12%" icon={Users} color="blue" />
      <KPICard title="Tasa Respuesta" value="98.2%" trend="+4%" icon={Zap} color="emerald" />
      <KPICard title="Lead Score Avg" value="7.4" trend="+0.5" icon={Target} color="indigo" />
      <KPICard title="Leads Hot" value="42" trend="+8" icon={Sparkles} color="rose" />
      <KPICard title="Conversión" value="28%" trend="+2%" icon={CheckCircle2} color="amber" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <GroupedIncidentReportCard title="Adquisición de Leads" metrics={commonMetrics} />
      </div>
      <div className="lg:col-span-1">
        <StatisticsCard title="Lifetime Value Estimado" value="4.00T" subtext="+7.79% VS MES ANTERIOR" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GlowingLineCard title="Interés Entrante" />
      <div className="bg-slate-900 rounded-[3rem] p-8 text-white h-full relative overflow-hidden flex flex-col justify-between shadow-2xl">
        <div className="relative z-10">
          <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Retention Score</h3>
          <p className="text-7xl font-black tracking-tighter text-indigo-400">84.2%</p>
          <p className="text-sm font-bold text-slate-400 mt-6 leading-relaxed max-w-xs">Eficiencia de retención proyectada por AgentBot Pro.</p>
        </div>
        <div className="mt-8 relative z-10">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: '84.2%' }}></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Activity size={200} /></div>
      </div>
      <FunnelCard title="Cualificación de Leads" color="#6366f1" />
    </div>
  </div>
);

const SalesDashboard = () => (
  <div className="space-y-10 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard title="GMV USD" value="$12.5M" trend="+18%" icon={DollarSign} color="emerald" />
      <KPICard title="Pipeline" value="156" trend="+12" icon={Layers} color="indigo" />
      <KPICard title="Cierre Medio" value="42d" trend="-4d" icon={Clock} color="blue" />
      <KPICard title="Comisiones" value="$375k" trend="+14%" icon={Zap} color="amber" />
      <KPICard title="Alcance Metas" value="92%" trend="+5%" icon={Target} color="rose" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <GroupedIncidentReportCard title="Operación de Ventas" metrics={commonMetrics} />
      </div>
      <div className="lg:col-span-1">
        <StatisticsCard title="Ingresos Proyectados" value="1.25M" subtext="+12.2% SOBRE FORECAST" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GlowingLineCard title="Velocidad de Ventas" trend="+14.2%" />
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl">
        <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8">Broker Performance</h3>
        <div className="space-y-8">
          {['Carolina', 'Andrés', 'Sofía'].map((n, i) => (
            <div key={n} className="flex items-center gap-5 group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-lg">{n.charAt(0)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black text-slate-800">{n} Mendes</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{100 - i * 15}% GOAL</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" style={{ width: `${100 - i * 15}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FunnelCard title="Cierres de Ventas" color="#10b981" />
    </div>
  </div>
);

const AlquilerDashboard = () => (
  <div className="space-y-10 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard title="Contratos Activos" value="482" trend="+14" icon={Key} color="purple" />
      <KPICard title="Recaudación" value="$2.4M" trend="+5%" icon={DollarSign} color="emerald" />
      <KPICard title="Vacancia" value="2.4%" trend="-1.1%" icon={Building2} color="blue" />
      <KPICard title="Renovaciones" value="85%" trend="+2%" icon={RotateCcw} color="amber" />
      <KPICard title="Yield Avg" value="5.8%" trend="+0.2%" icon={Activity} color="rose" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <GroupedIncidentReportCard title="Rotación de Alquileres" metrics={commonMetrics} />
      </div>
      <div className="lg:col-span-1">
        <StatisticsCard title="Valor Renta Total" value="2.40M" subtext="+4.1% TENDENCIA ALTA" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GlowingLineCard title="Crecimiento Ocupación" />
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl flex flex-col justify-between">
        <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-6">Evolución Yield</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={[{ n: 'Q1', v: 4.5 }, { n: 'Q2', v: 5.1 }, { n: 'Q3', v: 4.9 }, { n: 'Q4', v: 5.8 }]}>
              <XAxis dataKey="n" hide />
              <ReBar dataKey="v" fill="#8b5cf6" radius={[15, 15, 0, 0]} barSize={40} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <FunnelCard title="Conversión Reservas" color="#8b5cf6" />
    </div>
  </div>
);

const StockDashboard = () => (
  <div className="space-y-10 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard title="Unidades Stock" value="842" trend="+32" icon={Home} color="indigo" />
      <KPICard title="Valor Inventario" value="$182M" trend="+4%" icon={DollarSign} color="emerald" />
      <KPICard title="Aging Medio" value="84d" trend="-12d" icon={Clock} color="blue" />
      <KPICard title="Vistas Totales" value="25.4k" trend="+18%" icon={Eye} color="rose" />
      <KPICard title="Eficiencia Pub" value="92%" trend="+5%" icon={CheckCircle2} color="amber" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <GroupedIncidentReportCard title="Profundidad de Inventario" metrics={commonMetrics} />
      </div>
      <div className="lg:col-span-1">
        <StatisticsCard title="Valuación Activos" value="182M" subtext="+2.8% APRECIACIÓN MERCADO" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GlowingLineCard title="Absorción de Mercado" />
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl">
        <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8">Densidad Geográfica</h3>
        <div className="space-y-6">
          {['Palermo', 'Recoleta', 'Nordelta'].map((b, i) => (
            <div key={b} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer border border-slate-100">
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{b}</span>
              <span className="text-sm font-black text-slate-900">{200 - i * 40} Unid.</span>
            </div>
          ))}
        </div>
      </div>
      <FunnelCard title="Embudo Listados" color="#06b6d4" />
    </div>
  </div>
);

const CaptacionDashboard = () => (
  <div className="space-y-10 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard title="Nuevas Captac." value="24" trend="+4" icon={Briefcase} color="rose" />
      <KPICard title="Exclusividades" value="85%" trend="+5%" icon={Star} color="amber" />
      <KPICard title="Valor Entrante" value="$8.2M" trend="+1.2M" icon={DollarSign} color="emerald" />
      <KPICard title="Tasa Conversión" value="68%" trend="+5%" icon={RotateCcw} color="blue" />
      <KPICard title="Tasaciones" value="152" trend="+22" icon={Layers} color="indigo" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <GroupedIncidentReportCard title="Pipeline Adquisición" metrics={commonMetrics} />
      </div>
      <div className="lg:col-span-1">
        <StatisticsCard title="Meta Adquisición" value="12.5M" subtext="74% DE OBJETIVO Q1" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GlowingLineCard title="Velocidad Autorización" />
      <div className="bg-slate-900 rounded-[3rem] p-8 text-white h-full shadow-2xl relative overflow-hidden flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-xl border border-white/10">
            <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 relative z-10">Proyección IA</h3>
        </div>
        <p className="text-4xl font-black tracking-tighter leading-tight relative z-10">AgentBot proyecta un crecimiento del <span className="text-rose-500">22%</span> en captaciones exclusivas para Q2.</p>
        <div className="absolute -bottom-10 -right-10 opacity-5 scale-150 rotate-12"><Target size={200} /></div>
      </div>
      <FunnelCard title="Embudo Captación" color="#f43f5e" />
    </div>
  </div>
);

// --- HUB COMPONENT ---

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'sales' | 'alquiler' | 'stock' | 'captacion'>('leads');
  const [isExporting, setIsExporting] = useState(false);

  const categories = [
    { id: 'leads', label: 'LEADS', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'sales', label: 'VENTA', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'alquiler', label: 'ALQUILER', icon: Key, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'stock', label: 'PROPIEDADES', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'captacion', label: 'CAPTACIÓN', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte de BI generado y procesado exitosamente.');
    }, 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-24 animate-fade-in px-4 md:px-0 transform-gpu bg-[#F8FAFC]">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-10 pt-6">
        <div className="space-y-5 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1.5 bg-slate-900 rounded-full shadow-lg"></div>
            <span className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Business Intelligence Pro v4.5</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Analytical Hub</h1>
          <p className="text-sm sm:text-base lg:text-xl font-medium text-slate-500 tracking-tight leading-relaxed">
            Módulo predictivo avanzado para el monitoreo en tiempo real de activos inmobiliarios y eficiencia de ventas.
          </p>
        </div>

        <div className="flex w-full lg:w-auto gap-4 p-4 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] sm:text-[12px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {isExporting ? <RotateCcw size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'GENERANDO...' : 'EXPORT BI REPORT'}
          </button>
          <button className="p-6 text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 rounded-full border border-slate-100 shadow-inner">
            <Filter size={24} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-16 overflow-x-auto no-scrollbar pb-4 transform-gpu">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`flex items-center gap-4 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 border relative group shrink-0
              ${activeTab === cat.id
                ? `${cat.bg} ${cat.color} border-transparent shadow-xl scale-105 z-10`
                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600'
              }`}
          >
            <cat.icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
            <span className="whitespace-nowrap">{cat.label}</span>
            {activeTab === cat.id && (
              <motion.div layoutId="bi-tab-marker" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Analytics Content */}
      <div className="min-h-[1400px] transform-gpu">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
