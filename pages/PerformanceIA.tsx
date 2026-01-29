import React from 'react';
import {
    BrainCircuit, TrendingUp, Users, MessageSquare, AlertCircle,
    Sparkles, CheckCircle, BarChart3, ArrowUpRight, Zap, Target, Search, Filter
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

const conversionTrend = [
    { name: 'Lun', valor: 12 },
    { name: 'Mar', valor: 18 },
    { name: 'Mie', valor: 15 },
    { name: 'Jue', valor: 22 },
    { name: 'Vie', valor: 30 },
    { name: 'Sab', valor: 25 },
    { name: 'Dom', valor: 10 },
];

const objectionsData = [
    { label: 'Precio', value: 35, color: '#f59e0b' },
    { label: 'Zona', value: 25, color: '#6366f1' },
    { label: 'Financiación', value: 20, color: '#10b981' },
    { label: 'Mascotas', value: 12, color: '#3b82f6' },
    { label: 'Otros', value: 8, color: '#94a3b8' },
];

const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#3b82f6', '#94a3b8'];

const PerformanceIA: React.FC = () => {
    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in pb-16 transform-gpu">
            {/* Header with AI Branding */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-xl shadow-indigo-100 border border-slate-200">
                            <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">Flor AI • Performance</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-3">Inteligencia Operativa</h1>
                    <p className="text-slate-400 font-bold text-base uppercase tracking-[0.2em]">Métricas de conversión y análisis semántico de Flor.</p>
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto relative z-10">
                    <div className="bg-emerald-50 px-8 py-5 rounded-[2rem] border border-emerald-100 flex items-center gap-4 shadow-sm">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-tight">Estado Agente</p>
                            <p className="text-sm font-black text-slate-800 tracking-tight">Flor está Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Zap size={24} className="text-indigo-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Conversiones IA</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">84%</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">+4.2%</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Leads calificados por Flor esta semana.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Target size={24} className="text-emerald-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Tiempo Respuesta</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">1.2m</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">-15s</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Promedio de respuesta omnicanal.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[6rem] group-hover:scale-110 transition-transform"></div>
                    <Users size={24} className="text-purple-500 mb-6 relative z-10" strokeWidth={3} />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Interacciones</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">2.4k</span>
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full mb-2">+12%</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Chats procesados por Flor vs Humano.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Conversion Chart */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-12 border border-white/60 shadow-2xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tendencia de Conversión</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Efectividad de Flor en cierre de agendas</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={conversionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                                    dy={15}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '20px',
                                        border: '1px solid #F1F5F9',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '15px'
                                    }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '5px', color: '#1E293B' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="valor"
                                    stroke="#4F46E5"
                                    strokeWidth={5}
                                    fillOpacity={1}
                                    fill="url(#colorConv)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Objections Chart */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-12 border border-white/60 shadow-2xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Detección de Objeciones</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Motivos principales detectados por Flor</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={objectionsData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    width={140}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '20px',
                                        border: '1px solid #F1F5F9',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 15, 15, 0]} barSize={35}>
                                    {objectionsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Insights & Log Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Insights Section */}
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

                {/* Real-time Log Section */}
                <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-bl-[10rem]"></div>
                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="p-3 bg-white/10 text-indigo-400 rounded-2xl">
                            <BrainCircuit size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Análisis en Vivo</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Logs de procesamiento de lenguaje natural</p>
                        </div>
                    </div>

                    <div className="flex-1 bg-black/40 rounded-[2.5rem] p-8 border border-white/5 font-mono text-[10px] leading-relaxed relative overflow-hidden group">
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
        </div>
    );
};

export default PerformanceIA;
