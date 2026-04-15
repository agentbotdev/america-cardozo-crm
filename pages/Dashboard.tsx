import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Calendar, DollarSign, TrendingUp, ArrowUpRight,
  Sparkles, Zap, Star, Building2, Bell, BellOff, X, Activity,
  Clock, Target, BarChart3, ChevronRight, Flame, AlertCircle,
  RefreshCw, Home, UserPlus
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';
import { supabase } from '../services/supabaseClient';
import { dashboardService } from '../services/dashboardService';
import { Lead } from '../types';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: 'lead' | 'visit' | 'property' | 'hot';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}

// ── Hook: contador animado ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start = () => {
      startTimeRef.current = performance.now();
      const tick = (now: number) => {
        const elapsed = now - (startTimeRef.current ?? now);
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    start();
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

// ── Mini Sparkline ─────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ');
  return (
    <svg viewBox="0 0 100 60" className="w-full h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    spark: '#3b82f6', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', spark: '#10b981', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  spark: '#6366f1', badge: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    spark: '#f43f5e', badge: 'bg-rose-50 text-rose-600 border-rose-100' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   spark: '#f59e0b', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  spark: '#8b5cf6', badge: 'bg-violet-50 text-violet-600 border-violet-100' },
  cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-600',    spark: '#06b6d4', badge: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  slate:   { bg: 'bg-slate-50',   icon: 'text-slate-600',   spark: '#64748b', badge: 'bg-slate-50 text-slate-600 border-slate-200' },
};
type ColorKey = keyof typeof colorMap;

interface KpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  subtext?: string;
  positive?: boolean;
  icon: React.ElementType;
  delay: number;
  color: ColorKey;
  sparkData?: number[];
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, suffix = '', subtext, positive = true, icon: Icon, delay, color, sparkData }) => {
  const theme = colorMap[color];
  const animated = useCountUp(value);

  return (
    <div
      className="bg-white border border-slate-100 p-5 rounded-3xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/60"
      style={{ opacity: 0, transform: 'translateY(16px)', animation: `slideUp 0.5s ease forwards ${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`w-11 h-11 rounded-2xl ${theme.bg} ${theme.icon} flex items-center justify-center shadow-sm`}>
          <Icon size={22} />
        </div>
        {subtext && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${positive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
            <TrendingUp size={10} className={positive ? '' : 'rotate-180'} />
            {subtext}
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 tracking-tight">{animated}{suffix}</h3>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline data={sparkData} color={theme.spark} />
        </div>
      )}
    </div>
  );
};

// ── Notificaciones ─────────────────────────────────────────────────────────────
const notifIcons: Record<string, string> = {
  lead: '👤', visit: '📅', property: '🏠', hot: '🔥',
};

const NotificationPanel: React.FC<{
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}> = ({ notifications, onClose, onMarkRead, onClearAll }) => (
  <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
    <div
      className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col"
      style={{ animation: 'slideInRight 0.3s ease' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <h3 className="font-black text-slate-800 text-lg">Notificaciones</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button onClick={onClearAll} className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors">
              Marcar todas leídas
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <BellOff size={32} />
            <p className="text-sm font-semibold">Sin notificaciones</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                {notifIcons[n.type] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// ── Dashboard principal ────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalLeads: 0, propertiesCount: 0, visitsScheduled: 0, hotLeadsCount: 0,
    tasaConversion: 0, visitasSemana: 0, publicadas: 0, diasCierre: 0,
    visitasEsteMes: 0,
  });
  const [charts, setCharts] = useState({
    leadStatusData: [] as any[],
    leadsBySourceData: [] as any[],
    visitasSemanales: [] as any[],
  });
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Sparkline data: simulados (7 días)
  const sparkLeads   = useMemo(() => [4, 7, 5, 9, 6, 11, 8], []);
  const sparkProps   = useMemo(() => [12, 12, 13, 11, 14, 13, 14], []);
  const sparkVisitas = useMemo(() => [2, 3, 1, 4, 3, 2, 5], []);
  const sparkConv    = useMemo(() => [18, 22, 19, 25, 21, 28, 24], []);

  // Visitas semanales (datos de ejemplo para el Area chart principal)
  const visitasSemanalesBase = useMemo(() => [
    { dia: 'Lun', leads: 4, visitas: 2 },
    { dia: 'Mar', leads: 7, visitas: 3 },
    { dia: 'Mié', leads: 5, visitas: 1 },
    { dia: 'Jue', leads: 9, visitas: 4 },
    { dia: 'Vie', leads: 6, visitas: 3 },
    { dia: 'Sáb', leads: 3, visitas: 2 },
    { dia: 'Dom', leads: 2, visitas: 1 },
  ], []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, chartData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getChartData(),
      ]);

      setStats({
        totalLeads:      statsData.totalLeads      ?? 0,
        propertiesCount: statsData.propertiesCount ?? 0,
        visitsScheduled: statsData.visitsScheduled ?? 0,
        hotLeadsCount:   statsData.hotLeadsCount   ?? 0,
        // TODO Sprint 2: calcular tasa real (cierres / leads) — necesita campo 'cerrado' en DB
        tasaConversion:  0,
        // Visitas de esta semana — dato real desde visitasService.getVisitasStats()
        visitasSemana:   statsData.visitasEstaSemana ?? 0,
        // TODO Sprint 2: filtrar propiedades donde publicada_web_america = true
        publicadas:      statsData.propertiesCount ?? 0,
        // TODO Sprint 2: calcular promédio de días entre created_at y fecha de cierre
        diasCierre:      0,
        visitasEsteMes:  statsData.visitasEsteMes  ?? 0,
      });

      setHotLeads((statsData as any).hotLeads || []);

      if (chartData) {
        setCharts({
          leadStatusData:   chartData.leadStatusData,
          leadsBySourceData: chartData.leadsBySourceData,
          visitasSemanales:  visitasSemanalesBase,
        });
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [visitasSemanalesBase]);

  // Notificaciones de ejemplo iniciales
  useEffect(() => {
    setNotifications([
      { id: '1', type: 'hot',      title: '🔥 Lead caliente',       message: 'Juan Pérez abrió 3 propiedades en los últimos 10 min', time: 'ahora',    read: false, icon: '🔥' },
      { id: '2', type: 'visit',    title: 'Visita confirmada',       message: 'María García confirmó para mañana a las 15:00 hs',    time: 'hace 5m',  read: false, icon: '📅' },
      { id: '3', type: 'lead',     title: 'Nuevo lead desde portal', message: 'Lucas Fernández consultó por 3 amb en Palermo',        time: 'hace 12m', read: false, icon: '👤' },
      { id: '4', type: 'property', title: 'Propiedad destacada',     message: 'Av. Santa Fe 1234 recibió 8 consultas hoy',           time: 'hace 1h',  read: true,  icon: '🏠' },
    ]);
  }, []);

  // Supabase Realtime para notificaciones
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
        const newLead = payload.new as any;
        setNotifications(prev => [{
          id:      `lead-${Date.now()}`,
          type:    'lead',
          title:   'Nuevo lead ingresado',
          message: `${newLead.nombre || 'Lead'} acaba de ingresar al sistema`,
          time:    'ahora',
          read:    false,
          icon:    '👤',
        }, ...prev].slice(0, 20));
        loadDashboard();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitas' }, payload => {
        setNotifications(prev => [{
          id:      `visit-${Date.now()}`,
          type:    'visit',
          title:   'Nueva visita agendada',
          message: 'Se agendó una nueva visita',
          time:    'ahora',
          read:    false,
          icon:    '📅',
        }, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadDashboard]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const clearAll = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // ── Skeleton ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl animate-pulse h-36">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 mb-3" />
              <div className="h-2 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-7 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS de animaciones */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      {/* Panel de notificaciones */}
      {showNotifPanel && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifPanel(false)}
          onMarkRead={markRead}
          onClearAll={clearAll}
        />
      )}

      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header con título + campanita + refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Actualizado {lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboard}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-95"
              title="Actualizar"
            >
              <RefreshCw size={17} />
            </button>
            <button
              onClick={() => setShowNotifPanel(true)}
              className="relative w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-95"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── 8 KPI Cards ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Leads"        value={stats.totalLeads}      subtext="+12% vs mes" positive  icon={Users}       delay={0}   color="blue"    sparkData={sparkLeads} />
          <KpiCard title="Stock Propiedades"  value={stats.propertiesCount} subtext="Activas"               icon={Building2}   delay={60}  color="emerald" sparkData={sparkProps} />
          <KpiCard title="Visitas Agendadas"  value={stats.visitsScheduled} subtext="Total hist."            icon={Calendar}    delay={120} color="indigo"  sparkData={sparkVisitas} />
          <KpiCard title="Hot Leads 🔥"       value={stats.hotLeadsCount}   subtext="+3 hoy" positive        icon={Flame}       delay={180} color="rose"    sparkData={[1,2,2,3,2,4,3]} />
          {/* TODO Sprint 2: tasaConversion = cierres/leads — requiere campo cerrado en DB */}
          <KpiCard title="Tasa Conversión"    value={stats.tasaConversion}  suffix="%" subtext="Próximo sprint"  icon={Target}    delay={240} color="amber"   sparkData={sparkConv} />
          {/* Visitas Esta Semana — dato real desde visitasService.getVisitasStats() */}
          <KpiCard title="Visitas Esta Semana" value={stats.visitasSemana}                                   icon={Activity}    delay={300} color="violet"  sparkData={[2,3,1,4,3,2,5]} />
          {/* TODO Sprint 2: filtrar por publicada_web_america = true */}
          <KpiCard title="Publicadas Activas" value={stats.publicadas}                                       icon={Home}        delay={360} color="cyan"    sparkData={sparkProps} />
          {/* TODO Sprint 2: calcular promedio de días entre created_at y cierre */}
          <KpiCard title="Días Prom. Cierre"  value={stats.diasCierre}      subtext="Sprint 2"                icon={Clock}       delay={420} color="slate"   sparkData={[22,20,21,19,20,18,18]} />
        </div>

        {/* ── Fila principal: chart grande + sidebar ─────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* IZQUIERDA: charts */}
          <div className="xl:col-span-2 space-y-6">

            {/* Area chart dual: leads + visitas */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-slate-800">Actividad Semanal</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Leads ingresados vs visitas realizadas</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Leads</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />Visitas</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.visitasSemanales} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gLeads"   x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gVisitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', background: '#1e293b', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="leads"   stroke="#3b82f6" strokeWidth={2.5} fill="url(#gLeads)"   />
                    <Area type="monotone" dataKey="visitas" stroke="#6366f1" strokeWidth={2.5} fill="url(#gVisitas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dos charts: Pie pipeline + Bar fuentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pie */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 mb-4">Estado del Pipeline</h3>
                <div className="h-44 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.leadStatusData}
                        innerRadius={52} outerRadius={72}
                        paddingAngle={4} dataKey="value"
                        cornerRadius={6} stroke="none"
                      >
                        {charts.leadStatusData.map((_, i) => (
                          <Cell key={i} fill={charts.leadStatusData[i].color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800">{stats.totalLeads}</span>
                    <p className="text-[9px] uppercase text-slate-400 font-black tracking-wider">Total</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {charts.leadStatusData.map((e, i) => (
                    <span key={i} className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bar fuentes */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 mb-4">Fuente de Leads</h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.leadsBySourceData} layout="vertical" barSize={14} margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={65} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(100,116,139,0.06)' }} contentStyle={{ borderRadius: '8px', background: '#1e293b', color: '#fff', border: 'none' }} itemStyle={{ color: '#fff' }} />
                      <Bar dataKey="value" fill="#64748b" radius={[0, 6, 6, 0]}>
                        {charts.leadsBySourceData.map((_, i) => (
                          <Cell key={i} fill={['#3b82f6','#6366f1','#10b981','#f59e0b','#f43f5e'][i % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA: sidebar */}
          <div className="space-y-5">

            {/* AI Insight */}
            <div className="bg-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-800/20 text-white relative overflow-hidden group border border-slate-700">
              <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-900/40 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
                    <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">AI Agent Active</span>
                </div>
                <h4 className="text-base font-black leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  2 oportunidades detectadas
                </h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Juan Pérez muestra señales de cierre inminente. Contactar en las próximas 2 hs maximiza probabilidad de cierre.
                </p>
                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500">
                  <Sparkles size={13} className="text-slate-300" /> Ver Análisis
                </button>
              </div>
            </div>

            {/* Accesos rápidos funcionales */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
                <Zap size={15} className="text-amber-500" /> Accesos Rápidos
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Home,     label: 'Nueva Captación', desc: 'Registrar propiedad',   action: () => navigate('/propiedades'),                 color: 'bg-emerald-50 text-emerald-600' },
                  { icon: UserPlus, label: 'Lead Rápido',      desc: 'Ingreso manual',         action: () => navigate('/leads'),                       color: 'bg-blue-50 text-blue-600' },
                  { icon: Star,     label: 'Ver Destacados',   desc: 'Propiedades top',        action: () => navigate('/propiedades'),                  color: 'bg-amber-50 text-amber-600' },
                  { icon: Calendar, label: 'Agendar Visita',   desc: 'Nueva visita',           action: () => navigate('/visitas'),                      color: 'bg-indigo-50 text-indigo-600' },
                  { icon: BarChart3,label: 'Ver Reportes',     desc: 'Análisis completo',       action: () => navigate('/reportes'),                    color: 'bg-violet-50 text-violet-600' },
                ].map(({ icon: Ic, label, desc, action, color }, i) => (
                  <button
                    key={i}
                    onClick={action}
                    className="w-full group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Ic size={17} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs font-black text-slate-700 group-hover:text-slate-900">{label}</p>
                      <p className="text-[10px] text-slate-400">{desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Hot Leads */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Flame size={15} className="text-rose-500" /> Hot Leads
                </h3>
                <button onClick={() => navigate('/leads')} className="text-[10px] text-slate-400 hover:text-slate-800 font-black transition-colors flex items-center gap-1">
                  Ver todo <ChevronRight size={11} />
                </button>
              </div>
              <div className="space-y-2">
                {hotLeads.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Sin hot leads por ahora</p>
                ) : hotLeads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => navigate('/leads')}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-white rounded-2xl transition-all duration-200 border border-slate-100 hover:border-slate-200 hover:shadow-sm cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                      {lead.nombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate group-hover:text-black">{lead.nombre}</p>
                      <p className="text-[10px] text-slate-400 truncate">{lead.email || lead.telefono || 'Sin contacto'}</p>
                    </div>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 flex-shrink-0">
                      {(lead as any).score ?? 0}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
