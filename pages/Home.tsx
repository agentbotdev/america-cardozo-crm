import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw, Bell, BellOff, X, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { dashboardService } from '../services/dashboardService';
import { Lead } from '../types';

import { HomeKPIs } from '../components/home/HomeKPIs';
import { HomeCharts } from '../components/home/HomeCharts';
import { HomeHotLeads } from '../components/home/HomeHotLeads';
import { HomeQuickActions } from '../components/home/HomeQuickActions';
import { HomeTasksWidget } from '../components/home/HomeTasksWidget';
import { HomeFeed } from '../components/home/HomeFeed';

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalLeads: 0, leadsNuevos: 0, leadsSinContactar: 0,
    propertiesCount: 0, propertiesReserved: 0,
    visitsScheduled: 0, hotLeadsCount: 0,
    tasaConversion: 0, visitasSemana: 0, diasCierre: 0,
  });

  const [charts, setCharts] = useState({
    leadStatusData: [] as any[],
    leadsBySourceData: [] as any[],
    visitasSemanales: [] as any[],
    chartPorOperacion: [] as any[]
  });

  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Sparklines Data (Mocked for smooth UI logic)
  const sparkLeads   = useMemo(() => [4, 7, 5, 9, 6, 11, 8], []);
  const sparkProps   = useMemo(() => [12, 12, 13, 11, 14, 13, 14], []);
  const sparkVisitas = useMemo(() => [2, 3, 1, 4, 3, 2, 5], []);
  const sparkConv    = useMemo(() => [18, 22, 19, 25, 21, 28, 24], []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, chartData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getChartData(),
      ]);

      setStats({
        totalLeads:         statsData.totalLeads ?? 0,
        leadsNuevos:        Math.floor((statsData.totalLeads ?? 0) * 0.1),
        leadsSinContactar:  Math.floor((statsData.totalLeads ?? 0) * 0.2),
        propertiesCount:    statsData.propertiesCount ?? 0,
        propertiesReserved: Math.floor((statsData.propertiesCount ?? 0) * 0.05),
        visitsScheduled:    statsData.visitsScheduled ?? 0,
        hotLeadsCount:      statsData.hotLeadsCount ?? 0,
        tasaConversion:     24,
        visitasSemana:      statsData.visitsScheduled > 0 ? Math.min(statsData.visitsScheduled, 7) : 5,
        diasCierre:         18,
      });

      setHotLeads((statsData as any).hotLeads || []);

      if (chartData) {
        setCharts({
          leadStatusData:    chartData.leadStatusData || [],
          leadsBySourceData: chartData.leadsBySourceData || [],
          visitasSemanales:  [
            { dia: 'Lun', leads: 4, visitas: 2 },
            { dia: 'Mar', leads: 7, visitas: 3 },
            { dia: 'Mié', leads: 5, visitas: 1 },
            { dia: 'Jue', leads: 9, visitas: 4 },
            { dia: 'Vie', leads: 6, visitas: 3 },
            { dia: 'Sáb', leads: 3, visitas: 2 },
            { dia: 'Dom', leads: 2, visitas: 1 }
          ],
          chartPorOperacion: [
            { name: 'Venta', value: 35 }, { name: 'Alquiler', value: 45 }, { name: 'Desarrollo', value: 10 }
          ]
        });
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setNotifications([
      { id: '1', type: 'hot',      title: '🔥 Oportunidad caliente',       message: 'Juan Pérez abrió 3 propiedades en los últimos 10 min', time: 'ahora',    read: false, icon: '🔥' },
      { id: '2', type: 'visit',    title: 'Visita confirmada',       message: 'María García confirmó para mañana a las 15:00 hs',    time: 'hace 5m',  read: false, icon: '📅' },
      { id: '3', type: 'lead',     title: 'Nueva oportunidad desde portal', message: 'Lucas Fernández consultó por 3 amb en Palermo',        time: 'hace 12m', read: false, icon: '👤' },
    ]);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
        const newLead = payload.new as any;
        setNotifications(prev => [{
          id:      `lead-${Date.now()}`,
          type:    'lead',
          title:   'Nueva oportunidad',
          message: `${newLead.nombre || 'Un contacto'} acaba de ingresar.`,
          time:    'ahora',
          read:    false,
          icon:    '👤',
        }, ...prev].slice(0, 20));
        loadDashboard();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadDashboard]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAll = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl animate-pulse h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {showNotifPanel && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifPanel(false)}
          onMarkRead={markRead}
          onClearAll={clearAll}
        />
      )}

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
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

        {/* 10 KPIs */}
        <HomeKPIs 
          stats={stats} 
          sparkLeads={sparkLeads} 
          sparkProps={sparkProps} 
          sparkVisitas={sparkVisitas} 
          sparkConv={sparkConv} 
        />

        {/* Cuerpos principales */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* Main Charts area (col-span-2) */}
          <div className="xl:col-span-2 space-y-6">
            <HomeCharts chartsData={charts} />
            
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
                  {hotLeads.length > 0 ? `${hotLeads.length} oportunidades detectadas` : 'Sistema en monitoreo'}
                </h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {hotLeads.length > 0 
                    ? `${hotLeads[0]?.nombre} muestra señales de cierre inminente. Contactar en las próximas 2 hs maximiza probabilidad de cierre.`
                    : 'La inteligencia artificial no ha detectado anomalías o leads calientes en este momento.'}
                </p>
                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500">
                  <Sparkles size={13} className="text-slate-300" /> Ver Análisis
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar part 1 */}
          <div className="space-y-6 flex flex-col h-full">
            <HomeQuickActions />
            <HomeHotLeads hotLeads={hotLeads} />
            <div className="flex-1 min-h-[300px]">
              <HomeTasksWidget />
            </div>
          </div>

          {/* Right sidebar part 2 (Actividad) */}
          <div className="space-y-6 flex flex-col h-full min-h-[500px]">
             <HomeFeed />
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
