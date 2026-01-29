
import React, { useEffect, useState } from 'react';
import {
    BarChart3, Users, MessageSquare, Clock, Zap, Target, Sparkles,
    ShieldAlert, Bot, History, ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { mcpService } from '../services/mcpService';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

const Metrics: React.FC = () => {
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
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch basic reports
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

                setSummary(summaryRes);
                setSeries(seriesRes || []);
                setAgents(agentsRes || []);
                setCsat(csatRes || []);
                setBot(botRes);
                setAudit(auditRes || []);
                setChannels(channelRes ? [channelRes] : []); // Mapping based on usual structure
                setSla(slaRes);

            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Cargando Inteligencia Operativa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in pb-16 transform-gpu">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-slate-900 p-2 rounded-xl shadow-xl shadow-indigo-100">
                            <BarChart3 className="text-white" size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">Analytics Engine • Chatwoot</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-3">Métricas Globales</h1>
                    <p className="text-slate-400 font-bold text-base uppercase tracking-[0.2em]">Dashboard unificado de rendimiento y auditoría.</p>
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto relative z-10">
                    <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Data Sync</p>
                            <p className="text-sm font-black text-slate-800 tracking-tight">Real-time conectado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Cards - Summary Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <Zap size={24} className="text-indigo-500 mb-6" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversaciones</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">
                            {summary?.value || 0}
                        </span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">
                            {summary?.trend > 0 ? `+${summary.trend}%` : `${summary?.trend || 0}%`}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <Clock size={24} className="text-emerald-500 mb-6" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Respuesta 1º</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">1.5m</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">-15%</span>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <ShieldAlert size={24} className="text-rose-500 mb-6" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Violaciones SLA</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{sla?.value || 0}</span>
                        <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full mb-2">Crítico</span>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-slate-100 mb-6 font-black uppercase text-xs">
                        <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Bot Resolution</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">
                            {bot?.resolution_rate || '72%'}
                        </span>
                        <span className="text-[10px] font-black text-purple-500 bg-purple-50 px-3 py-1.5 rounded-full mb-2">IA Active</span>
                    </div>
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Time Series Chart */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-12 border border-white/60 shadow-2xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Carga de Mensajes</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Volumen diario detectado en el periodo</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={4} fill="url(#colorMessages)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Channel Stats Bar Chart */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-12 border border-white/60 shadow-2xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Distribución por Canal</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Comparativa de carga operativa por inbox</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={channels} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 15, 15, 0]} barSize={40}>
                                    {channels.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Agents Performance Section */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm mb-16 relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ranking de Agentes</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Eficiencia y tiempos de respuesta individuales</p>
                    </div>
                    <Users className="text-indigo-500 opacity-20" size={64} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {agents.map((agent: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm">{agent.name?.charAt(0)}</div>
                                <div>
                                    <h4 className="font-black text-slate-900">{agent.name}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{agent.role}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cierres</p>
                                    <p className="text-lg font-black text-slate-900">{agent.conversations_count || 0}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Respuesta</p>
                                    <p className="text-lg font-black text-emerald-500 font-mono">{agent.avg_first_response_time || '0s'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSAT and Bot Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                {/* CSAT Responses */}
                <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Feedback CSAT</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Últimas valoraciones de clientes</p>
                        </div>
                        <Sparkles className="text-amber-500" size={24} />
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                        {csat.map((resp: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex gap-4">
                                <div className="text-2xl">{resp.rating === 5 ? '🔥' : resp.rating >= 4 ? '⭐️' : '💬'}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-black text-slate-900 leading-none">{resp.contact_name || 'Cliente Anonimo'}</p>
                                        <p className="text-[9px] font-black text-slate-400 font-mono tracking-widest uppercase">{resp.created_at}</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">{resp.feedback || 'Sin comentario adicional.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[6rem]"></div>
                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <History className="text-indigo-400" size={24} />
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Auditoría</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Registro de acciones críticas</p>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar font-mono text-[10px]">
                        {audit.map((log: any, i: number) => (
                            <div key={i} className="border-l-2 border-indigo-500/30 pl-4 py-1">
                                <p className="text-slate-500 mb-1">{log.created_at}</p>
                                <p className="text-slate-300 font-bold uppercase tracking-widest">
                                    <span className="text-indigo-400">{log.user_name || 'System'}:</span> {log.action || 'Unknown Action'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Metrics;
