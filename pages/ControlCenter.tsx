import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, BarChart3, Server, MessageSquare, Zap, Clock, ShieldAlert,
  Users, Sparkles, History, BrainCircuit, Target, CheckCircle, ArrowUpRight,
  Database, Activity, Wifi, Terminal, Key, Cpu
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { mcpService } from '../services/mcpService';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

// Mock data for IA Performance
const conversionTrend = [
  { name: 'Lun', valor: 12 }, { name: 'Mar', valor: 18 }, { name: 'Mie', valor: 15 },
  { name: 'Jue', valor: 22 }, { name: 'Vie', valor: 30 }, { name: 'Sab', valor: 25 }, { name: 'Dom', valor: 10 }
];
const objectionsData = [
  { label: 'Precio', value: 35, color: '#f59e0b' }, { label: 'Zona', value: 25, color: '#6366f1' },
  { label: 'Financiación', value: 20, color: '#10b981' }, { label: 'Mascotas', value: 12, color: '#3b82f6' },
  { label: 'Otros', value: 8, color: '#94a3b8' }
];

export default function ControlCenter() {
  const [activeTab, setActiveTab] = useState<'ia' | 'metrics' | 'infra' | 'mcp'>('ia');
  
  // Data State for Metrics
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [csat, setCsat] = useState<any[]>([]);
  const [bot, setBot] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [sla, setSla] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'metrics' && summary === null) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [summaryRes, seriesRes, agentsRes, csatRes, botRes, auditRes, channelRes, slaRes] = await Promise.all([
            mcpService.getSummaryTotals().catch(() => null),
            mcpService.getDetailedSeries().catch(() => null),
            mcpService.getAgentPerformance().catch(() => []),
            mcpService.getCsatResponses().catch(() => []),
            mcpService.getBotMetrics().catch(() => null),
            mcpService.getAuditLogs().catch(() => []),
            mcpService.getChannelStats().catch(() => null),
            mcpService.getSlaReports().catch(() => null)
          ]);
          setSummary(summaryRes); setSeries(seriesRes || []); setAgents(agentsRes || []);
          setCsat(csatRes || []); setBot(botRes); setAudit(auditRes || []);
          setChannels(channelRes ? [channelRes] : []); setSla(slaRes);
        } catch (error) {
          console.error("Error fetching metrics:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab, summary]);

  const tabs = [
    { id: 'ia', label: 'AGENTE IA', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'metrics', label: 'METRICAS GLOBALES', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'infra', label: 'INFRAESTRUCTURA', icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'mcp', label: 'CHATWOOT / MCP', icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50' }
  ] as const;

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in pb-16 transform-gpu flex flex-col min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8 relative z-10 shrink-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl shadow-slate-200 ring-1 ring-slate-800">
              <Zap className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Centro de Mando</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-3">Control Center</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Monitoreo absoluto de sistemas y rendimiento.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center mb-12 relative z-20 shrink-0">
        <div className="bg-white/60 backdrop-blur-xl p-2 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-100 scale-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50 scale-95 hover:scale-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === tab.id ? tab.bg : 'bg-transparent'}`}>
                <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-current'} strokeWidth={3} />
              </div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* TAB: AGENTE IA (Performance) */}
          {activeTab === 'ia' && (
            <motion.div key="ia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Metric Cards - AI */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Zap size={24} className="text-indigo-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Conversiones IA</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">84%</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">+4.2%</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Leads calificados por Flor esta semana.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Target size={24} className="text-emerald-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Tiempo Respuesta</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">1.2m</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">-15s</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Promedio de respuesta omnicanal.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Users size={24} className="text-purple-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Interacciones</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">2.4k</span>
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full mb-2">+12%</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Chats procesados por Flor vs Humano.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Sparkles size={24} className="text-amber-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Feeling Positivo</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">92%</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">Excelente</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Análisis semántico de satisfacción.</p>
                </div>
              </div>

              {/* Real-time Log Section & Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-50 rounded-bl-[8rem] opacity-50"></div>
                      <div className="flex items-center gap-4 mb-10 relative z-10">
                          <div className="p-3 bg-amber-100/50 text-amber-600 rounded-2xl">
                              <Sparkles size={24} strokeWidth={3} />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Estrategia de Flor</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sugerencias proactivas de la IA</p>
                          </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                          {[
                              { text: "Detección de alta fricción en leads de Facebook a las 22hs. Recomiendo activar respuesta inmediata.", type: 'warning' },
                              { text: "El 15% de los leads solicita financiación. Sugiero automatizar envío de tablas hipotecarias.", type: 'tip' },
                              { text: "La objeción 'Precio' bajó un 5% tras el nuevo script de cierre optimizado.", type: 'success' }
                          ].map((insight, i) => (
                              <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all group/item">
                                  <div className={`w-1.5 h-auto rounded-full ${insight.type === 'warning' ? 'bg-amber-400' : insight.type === 'tip' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></div>
                                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest group-hover/item:text-slate-900 transition-colors">{insight.text}</p>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-bl-[10rem]"></div>
                      <div className="flex items-center gap-4 mb-10 relative z-10">
                          <div className="p-3 bg-white/10 text-indigo-400 rounded-2xl">
                              <BrainCircuit size={24} strokeWidth={3} />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black text-white tracking-tight">Análisis en Vivo</h3>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Logs de NLP / n8n</p>
                          </div>
                      </div>

                      <div className="flex-1 bg-black/40 rounded-[2.5rem] p-8 border border-white/5 font-mono text-[10px] leading-relaxed relative overflow-hidden">
                          <div className="absolute top-4 right-6 flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                              <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                              <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                          </div>
                          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                              <span className="text-indigo-400 font-black tracking-[0.2em] uppercase">Flor_IA_Engine v2.4</span>
                          </div>
                          <div className="space-y-3">
                              <p className="flex gap-4"><span className="text-slate-600">[14:23:45]</span> <span className="text-emerald-400 font-bold">INTENT:</span> <span className="text-slate-300">USER_INTEREST_HIGH</span></p>
                              <p className="flex gap-4"><span className="text-slate-600">[14:24:01]</span> <span className="text-indigo-400 font-bold">ENTITIES:</span> <span className="text-slate-400">prop: "Palermo SOHO", price: "240k"</span></p>
                              <p className="flex gap-4"><span className="text-slate-600">[14:24:12]</span> <span className="text-amber-400 font-bold">ACTION:</span> <span className="text-slate-100">AUTO_SCHEDULE_VISIT_TRIGGERED</span></p>
                              <p className="flex gap-4"><span className="text-slate-600">[14:24:30]</span> <span className="text-emerald-500 font-bold">STATUS:</span> <span className="text-slate-400 text-[9px] italic">Success. Syncing with Google Cal...</span></p>
                          </div>

                          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              <span>Confidence Score: 0.988</span>
                              <span className="text-indigo-400 animate-pulse">Processing...</span>
                          </div>
                      </div>
                  </div>
              </div>
            </motion.div>
          )}

          {/* TAB: METRICAS GLOBALES */}
          {activeTab === 'metrics' && (
            <motion.div key="metrics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Cargando Métricas...</p>
                    </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          <MessageSquare size={24} className="text-indigo-500 mb-6" strokeWidth={3} />
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversaciones</h3>
                          <div className="flex items-end gap-3">
                              <span className="text-5xl font-black text-slate-900 tracking-tighter">{summary?.value || 3402}</span>
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">{summary?.trend > 0 ? `+${summary.trend}%` : '+5%'}</span>
                          </div>
                      </div>

                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          <Clock size={24} className="text-emerald-500 mb-6" strokeWidth={3} />
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Respuesta 1º</h3>
                          <div className="flex items-end gap-3">
                              <span className="text-5xl font-black text-slate-900 tracking-tighter">1.5m</span>
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">-15%</span>
                          </div>
                      </div>

                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          <ShieldAlert size={24} className="text-rose-500 mb-6" strokeWidth={3} />
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Violaciones SLA</h3>
                          <div className="flex items-end gap-3">
                              <span className="text-5xl font-black text-slate-900 tracking-tighter">{sla?.value || '2'}</span>
                              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full mb-2">Atención</span>
                          </div>
                      </div>

                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-slate-100 mb-6 font-black uppercase text-xs">
                              <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                          </div>
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Bot Resolution</h3>
                          <div className="flex items-end gap-3">
                              <span className="text-5xl font-black text-slate-900 tracking-tighter">{bot?.resolution_rate || '72%'}</span>
                              <span className="text-[10px] font-black text-purple-500 bg-purple-50 px-3 py-1.5 rounded-full mb-2">IA Active</span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-slate-100 pt-12">
                     {/* Time Series Chart */}
                      <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-12 border border-white/60 shadow-xl shadow-slate-200/50">
                          <div className="flex justify-between items-center mb-10">
                              <div>
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Carga de Mensajes</h3>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Volumen diario detectado en el periodo</p>
                              </div>
                          </div>
                          <div className="h-[400px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={series.length ? series : conversionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                      <defs>
                                          <linearGradient id="colorsMsg" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                          </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                      <XAxis dataKey={series.length ? "timestamp" : "name"} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                                      <YAxis hide />
                                      <Tooltip />
                                      <Area type="monotone" dataKey={series.length ? "value" : "valor"} stroke="#10B981" strokeWidth={4} fill="url(#colorsMsg)" />
                                  </AreaChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                      
                      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                          <div className="flex justify-between items-center mb-10">
                              <div>
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ranking de Agentes</h3>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Eficiencia individual y tiempos</p>
                              </div>
                          </div>
                          <div className="space-y-4">
                              {(agents.length ? agents : [{name:'Demo Agent', role:'Ventas', conversations_count:145, avg_first_response_time:'1.2m'}]).map((agent: any, i: number) => (
                                  <div key={i} className="flex gap-4 items-center bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                                      <div className="w-12 h-12 rounded-2xl bg-white flex justify-center items-center shadow-sm font-black text-slate-800">{agent.name?.charAt(0) || 'D'}</div>
                                      <div className="flex-1">
                                          <h4 className="font-bold text-slate-800 text-sm leading-none">{agent.name}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{agent.role}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-lg font-black text-indigo-600">{agent.conversations_count}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Chats</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB: INFRAESTRUCTURA */}
          {activeTab === 'infra' && (
            <motion.div key="infra" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-bl-[6rem] blur-2xl"></div>
                      <Database size={24} className="text-emerald-400 mb-6 relative z-10" strokeWidth={3} />
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Supabase DB Status</h3>
                      <div className="flex items-end gap-3 relative z-10 mb-2">
                          <span className="text-4xl font-black tracking-tighter">Healthy</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Latencia 42ms</span>
                      </div>
                  </div>

                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-[6rem] blur-2xl"></div>
                      <Server size={24} className="text-indigo-400 mb-6 relative z-10" strokeWidth={3} />
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">VPS N8N Engine</h3>
                      <div className="flex items-end gap-3 relative z-10 mb-2">
                          <span className="text-4xl font-black tracking-tighter">Running</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Uptime 99.9%</span>
                      </div>
                  </div>

                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-bl-[6rem] blur-2xl"></div>
                      <Cpu size={24} className="text-amber-400 mb-6 relative z-10" strokeWidth={3} />
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">VPS Server Load</h3>
                      <div className="flex items-end gap-3 relative z-10 mb-2">
                          <span className="text-4xl font-black tracking-tighter">35%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                         <div className="bg-amber-400 h-1 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                  </div>

                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-bl-[6rem] blur-2xl"></div>
                      <Activity size={24} className="text-rose-400 mb-6 relative z-10" strokeWidth={3} />
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">API Rate Limits</h3>
                      <div className="flex items-end gap-3 relative z-10 mb-2">
                          <span className="text-4xl font-black tracking-tighter">Safe</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tokko & OpenAI APIs</span>
                  </div>
               </div>
            </motion.div>
          )}

          {/* TAB: CHATWOOT / MCP */}
          {activeTab === 'mcp' && (
            <motion.div key="mcp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
                      <div className="flex items-center gap-4 mb-10">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                              <Terminal size={24} strokeWidth={3} />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">MCP Server Status</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Conexión con Chatwoot Live Chat</p>
                          </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                             <div>
                                 <h4 className="font-bold text-slate-900 text-sm">Status Conexión</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">WebSocket / REST</p>
                             </div>
                             <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                Conectado
                             </div>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                             <div>
                                 <h4 className="font-bold text-slate-900 text-sm">Último Heartbeat</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronización de threads</p>
                             </div>
                             <p className="text-sm font-black text-slate-600">Hace 2 min</p>
                         </div>
                      </div>
                  </div>

                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
                      <div className="flex items-center gap-4 mb-10">
                          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                              <Key size={24} strokeWidth={3} />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Tokens</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestión de credenciales seguras</p>
                          </div>
                      </div>
                      
                      <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[11px] text-slate-300">
                         <p className="mb-4"><span className="text-indigo-400 font-bold">CHATWOOT_API_KEY:</span> •••••••••••••••••</p>
                         <p className="mb-4"><span className="text-indigo-400 font-bold">WEBHOOK_SECRET:</span> •••••••••••••••••</p>
                         <p><span className="text-emerald-400 font-bold">N8N_WORKFLOW_ID:</span> 18r92kd02</p>
                      </div>
                  </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
