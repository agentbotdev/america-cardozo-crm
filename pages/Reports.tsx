import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reportsService } from '../services/reportsService';
import {
  Users, DollarSign, Home, Key, Zap, Target, Activity, Filter, Download,
  ChevronRight, ChevronLeft, ArrowUpRight, Sparkles, Clock, CheckCircle2,
  Building2, Briefcase, Star, RotateCcw, Eye, X as XIcon, Layers, Brain,
  MessageSquare, TrendingUp, AlertCircle
} from 'lucide-react';
import {
  BarChart as ReBarChart, Bar as ReBar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const KPICard = ({ title, value, trend, icon: Icon, delay = 0, color = 'indigo' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.05 }}
    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group h-full flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3.5 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={22} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
          trend.includes('+') || trend.includes('↑')
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{title}</p>
      <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
    </div>
  </motion.div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-32">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando datos...</p>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-center justify-center py-32">
    <div className="text-center max-w-md">
      <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
      <h3 className="text-lg font-black text-slate-800 mb-2">Error al cargar datos</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        Reintentar
      </button>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex items-center justify-center py-32">
    <div className="text-center max-w-md">
      <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-black text-slate-800 mb-2">Sin datos para el período</h3>
      <p className="text-sm text-slate-500">Intenta ajustar el rango de fechas o los filtros aplicados.</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD LEADS
// ═══════════════════════════════════════════════════════════════════════════

const LeadsDashboard = ({ data }: { data: any }) => {
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <KPICard title="Total Leads" value={data.totalLeads?.toLocaleString() || '0'} trend="+12%" icon={Users} color="blue" delay={0} />
        <KPICard title="Hot Leads" value={data.hotLeads?.toLocaleString() || '0'} trend="+8" icon={Sparkles} color="rose" delay={1} />
        <KPICard title="Tasa Respuesta" value={data.responseRate || '0%'} trend="+4%" icon={Zap} color="emerald" delay={2} />
        <KPICard title="Score Avg" value={data.avgScore || '0'} trend="+0.5" icon={Target} color="indigo" delay={3} />
        <KPICard title="Conversión" value={data.conversionRate || '0%'} trend="+2%" icon={CheckCircle2} color="amber" delay={4} />
        <KPICard title="Sin Respuesta" value={data.sinRespuesta?.toLocaleString() || '0'} trend={undefined} icon={Clock} color="slate" delay={5} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads por Fuente */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Leads por Fuente</h3>
          <div className="h-[300px]">
            {data.chartBySource && data.chartBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartBySource} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Leads por Mes */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Evolución Mensual</h3>
          <div className="h-[300px]">
            {data.chartByMonth && data.chartByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Distribución por Temperatura */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Distribución Temperatura</h3>
          <div className="h-[300px]">
            {data.chartByTemperatura && data.chartByTemperatura.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.chartByTemperatura} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.chartByTemperatura.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Leads por Etapa */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Leads por Etapa</h3>
          <div className="h-[300px]">
            {data.chartByEtapa && data.chartByEtapa.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByEtapa} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD VENTAS
// ═══════════════════════════════════════════════════════════════════════════

const SalesDashboard = ({ data }: { data: any }) => {
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="GMV Total" value={data.gmv || '$0M'} trend="+18%" icon={DollarSign} color="emerald" delay={0} />
        <KPICard title="Ventas Cerradas" value={data.totalSales?.toLocaleString() || '0'} trend="+12" icon={CheckCircle2} color="indigo" delay={1} />
        <KPICard title="Pipeline Activo" value={data.pipelineCount?.toLocaleString() || '0'} trend="+14" icon={Layers} color="blue" delay={2} />
        <KPICard title="Días Cierre Avg" value={data.avgClosingDays || '0d'} trend="-4d" icon={Clock} color="amber" delay={3} />
        <KPICard title="Comisiones" value={data.commission || '$0k'} trend="+14%" icon={Zap} color="rose" delay={4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cierres por Mes */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Cierres por Mes</h3>
          <div className="h-[300px]">
            {data.chartByMonth && data.chartByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Cierres por Vendedor */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Cierres por Vendedor</h3>
          <div className="h-[300px]">
            {data.chartByVendedor && data.chartByVendedor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByVendedor} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Evolución GMV */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 lg:col-span-2">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Evolución GMV por Mes</h3>
          <div className="h-[300px]">
            {data.chartGmvByMonth && data.chartGmvByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartGmvByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="gmv" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD ALQUILERES
// ═══════════════════════════════════════════════════════════════════════════

const AlquilerDashboard = ({ data }: { data: any }) => {
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Contratos Activos" value={data.activeContracts?.toLocaleString() || '0'} trend="+14" icon={Key} color="purple" delay={0} />
        <KPICard title="Recaudación Total" value={data.totalRentalValue || '$0M'} trend="+5%" icon={DollarSign} color="emerald" delay={1} />
        <KPICard title="Tasa Vacancia" value={data.vacancyRate || '0%'} trend="-1.1%" icon={Building2} color="blue" delay={2} />
        <KPICard title="Tasa Renovación" value={data.renewalRate || '0%'} trend="+2%" icon={RotateCcw} color="amber" delay={3} />
        <KPICard title="Yield Promedio" value={data.avgYield || '0%'} trend="+0.2%" icon={Activity} color="rose" delay={4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alquileres por Mes */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Alquileres por Mes</h3>
          <div className="h-[300px]">
            {data.chartByMonth && data.chartByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Alquileres por Vendedor */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Alquileres por Vendedor</h3>
          <div className="h-[300px]">
            {data.chartByVendedor && data.chartByVendedor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByVendedor} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Distribución Rangos de Precio */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 lg:col-span-2">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Distribución Rangos de Precio</h3>
          <div className="h-[300px]">
            {data.chartByPriceRange && data.chartByPriceRange.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.chartByPriceRange} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.chartByPriceRange.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD PROPIEDADES
// ═══════════════════════════════════════════════════════════════════════════

const StockDashboard = ({ data }: { data: any }) => {
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        <KPICard title="Total Stock" value={data.totalProperties?.toLocaleString() || '0'} trend="+32" icon={Home} color="indigo" delay={0} />
        <KPICard title="Publicadas" value={data.publicadas?.toLocaleString() || '0'} trend="+5%" icon={CheckCircle2} color="emerald" delay={1} />
        <KPICard title="En Captación" value={data.enCaptacion?.toLocaleString() || '0'} trend="+8" icon={Briefcase} color="amber" delay={2} />
        <KPICard title="Valor Inventario" value={data.totalValue || '$0M'} trend="+4%" icon={DollarSign} color="blue" delay={3} />
        <KPICard title="Aging Medio" value={data.avgAging || '0d'} trend="-12d" icon={Clock} color="rose" delay={4} />
        <KPICard title="Sin Foto" value={data.propsWithoutPhoto?.toLocaleString() || '0'} trend={undefined} icon={Eye} color="slate" delay={5} />
        <KPICard title="Estancadas >90d" value={data.staleProperties?.toLocaleString() || '0'} trend={undefined} icon={AlertCircle} color="rose" delay={6} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución por Estado */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Distribución por Estado</h3>
          <div className="h-[300px]">
            {data.chartByEstado && data.chartByEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.chartByEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.chartByEstado.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Top 10 Tipos */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Top 10 Tipos</h3>
          <div className="h-[300px]">
            {data.chartByTipo && data.chartByTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByTipo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Top 10 Zonas */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Top 10 Zonas</h3>
          <div className="h-[300px]">
            {data.chartByZona && data.chartByZona.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByZona} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Publicadas por Mes */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Publicadas por Mes</h3>
          <div className="h-[300px]">
            {data.chartByMonth && data.chartByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD CAPTACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CaptacionDashboard = ({ data }: { data: any }) => {
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Nuevas Captac." value={data.newCaptaciones?.toLocaleString() || '0'} trend="+4" icon={Briefcase} color="rose" delay={0} />
        <KPICard title="Exclusividades" value={data.exclusivityRate || '0%'} trend="+5%" icon={Star} color="amber" delay={1} />
        <KPICard title="Valor Entrante" value={data.incomingValue || '$0M'} trend="+1.2M" icon={DollarSign} color="emerald" delay={2} />
        <KPICard title="Tasa Conversión" value={data.conversionRate || '0%'} trend="+5%" icon={RotateCcw} color="blue" delay={3} />
        <KPICard title="Tasaciones" value={data.tasaciones?.toLocaleString() || '0'} trend="+22" icon={Layers} color="indigo" delay={4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Captaciones por Mes */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Captaciones por Mes</h3>
          <div className="h-[300px]">
            {data.chartByMonth && data.chartByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Top 10 Zonas */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Captaciones por Zona</h3>
          <div className="h-[300px]">
            {data.chartByZona && data.chartByZona.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByZona} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Captaciones por Tipo */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Captaciones por Tipo</h3>
          <div className="h-[300px]">
            {data.chartByTipo && data.chartByTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.chartByTipo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <ReBar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Captaciones por Vendedor */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Captaciones por Vendedor</h3>
          <div className="h-[300px]">
            {data.chartByVendedor && data.chartByVendedor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.chartByVendedor} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.chartByVendedor.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD IA (MOCKDATA)
// ═══════════════════════════════════════════════════════════════════════════

const IADashboard = () => {
  // Mockdata estructurado según Prompt 8
  const mockConversacionesPorDia = Array.from({ length: 30 }, (_, i) => ({
    name: `Día ${i + 1}`,
    conversaciones: Math.floor(Math.random() * 80) + 40
  }));

  const mockDistribucionCanal = [
    { name: 'Zonaprop', value: 580 },
    { name: 'WhatsApp', value: 420 },
    { name: 'Instagram', value: 310 },
    { name: 'Argenprop', value: 280 },
    { name: 'Web', value: 157 },
    { name: 'Otros', value: 100 }
  ];

  const mockTopIntenciones = [
    { name: 'Precio Alquiler', value: 420 },
    { name: 'Disponibilidad', value: 380 },
    { name: 'Info Barrio', value: 290 },
    { name: 'Sacar Turno', value: 245 },
    { name: 'Precio Venta', value: 198 },
    { name: 'Características', value: 167 },
    { name: 'Financiación', value: 134 },
    { name: 'Tasación', value: 98 },
    { name: 'Info Expensas', value: 87 },
    { name: 'Contacto Dueño', value: 72 }
  ];

  const mockNoResuelto = [
    { name: 'Documentación Legal', value: 45 },
    { name: 'Negociación Precio', value: 38 },
    { name: 'Visita Urgente', value: 31 },
    { name: 'Consulta Jurídica', value: 24 },
    { name: 'Otro', value: 19 }
  ];

  const mockFunnel = [
    { name: 'Derivaciones', value: 312 },
    { name: 'Contacto Humano', value: 280 },
    { name: 'Visita', value: 89 },
    { name: 'Cierre', value: 37 }
  ];

  // Heatmap 7x24 (lunes a domingo, 0-23 horas)
  const mockHeatmap = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      // Horas pico: 9-11hs y 18-21hs en días hábiles
      const isDayTime = day < 5 && ((hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 21));
      return isDayTime ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30) + 10;
    })
  );

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Conversaciones" value="1,847" trend="+12%" icon={MessageSquare} color="indigo" delay={0} />
        <KPICard title="Sin Intervención" value="73%" trend="+5%" icon={Brain} color="emerald" delay={1} />
        <KPICard title="Derivaciones" value="312" trend="+8" icon={Users} color="amber" delay={2} />
        <KPICard title="Tasa Contención" value="83%" trend="+2%" icon={CheckCircle2} color="rose" delay={3} />
        <KPICard title="Tiempo Respuesta" value="8s" trend="-2s" icon={Clock} color="blue" delay={4} />
        <KPICard title="Leads Calificados" value="234" trend="+14" icon={Target} color="purple" delay={5} />
        <KPICard title="Deriv → Visita" value="28%" trend="+3%" icon={TrendingUp} color="cyan" delay={6} />
        <KPICard title="Deriv → Cierre" value="12%" trend="+1%" icon={DollarSign} color="emerald" delay={7} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversaciones por Día */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Conversaciones por Día</h3>
            <select className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <option>Día</option>
              <option>Semana</option>
              <option>Mes</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockConversacionesPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" style={{ fontSize: '10px', fontWeight: 'bold' }} tick={{ display: 'none' }} />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="conversaciones" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por Canal */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Distribución por Canal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockDistribucionCanal} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {mockDistribucionCanal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Intenciones */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Top 10 Intenciones</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mockTopIntenciones} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <ReBar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consultas No Resueltas */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Consultas No Resueltas</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mockNoResuelto} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <ReBar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel Post-Derivación */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
        <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Funnel Post-Derivación</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={mockFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '12px', fontWeight: 'bold' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              <ReBar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Deriv → Contacto</p>
            <p className="text-xl font-black text-slate-900">90%</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Contacto → Visita</p>
            <p className="text-xl font-black text-slate-900">32%</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Visita → Cierre</p>
            <p className="text-xl font-black text-slate-900">42%</p>
          </div>
        </div>
      </div>

      {/* Heatmap 7x24 */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
        <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Actividad por Hora (Heatmap 7×24)</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Hours header */}
            <div className="grid grid-cols-25 gap-1 mb-2">
              <div className="w-12"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-[9px] font-bold text-slate-400 text-center">{i}</div>
              ))}
            </div>
            {/* Heatmap grid */}
            {mockHeatmap.map((dayData, dayIndex) => (
              <div key={dayIndex} className="grid grid-cols-25 gap-1 mb-1">
                <div className="text-[10px] font-black text-slate-400 uppercase w-12 flex items-center">{daysOfWeek[dayIndex]}</div>
                {dayData.map((intensity, hourIndex) => {
                  const bgColor = intensity > 80
                    ? 'bg-indigo-600'
                    : intensity > 60
                    ? 'bg-indigo-500'
                    : intensity > 40
                    ? 'bg-indigo-400'
                    : intensity > 20
                    ? 'bg-indigo-200'
                    : 'bg-slate-100';
                  return (
                    <div key={hourIndex} className={`h-8 rounded ${bgColor} transition-all hover:scale-110 cursor-pointer`} title={`${daysOfWeek[dayIndex]} ${hourIndex}:00 - ${intensity}%`}></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6 text-[10px] font-bold text-slate-400 uppercase">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 rounded"></div>
            <span>Bajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-300 rounded"></div>
            <span>Medio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
            <span>Alto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN REPORTS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'sales' | 'alquiler' | 'stock' | 'captacion' | 'ia'>('leads');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ desde: '', hasta: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const tabOrder = ['leads', 'sales', 'alquiler', 'stock', 'captacion', 'ia'] as const;
  const currentIdx = tabOrder.indexOf(activeTab);
  const goPrev = () => currentIdx > 0 && setActiveTab(tabOrder[currentIdx - 1]);
  const goNext = () => currentIdx < tabOrder.length - 1 && setActiveTab(tabOrder[currentIdx + 1]);

  const categories = [
    { id: 'leads', label: 'Leads', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'sales', label: 'Ventas', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'alquiler', label: 'Alquileres', icon: Key, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'stock', label: 'Propiedades', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'captacion', label: 'Captación', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'ia', label: 'IA', icon: Brain, color: 'text-cyan-600', bg: 'bg-cyan-50' }
  ];

  // Shortcuts de fecha
  const applyDateShortcut = (shortcut: 'hoy' | 'semana' | 'mes' | 'año') => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let desde = '';

    switch (shortcut) {
      case 'hoy':
        desde = today;
        break;
      case 'semana':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        desde = weekAgo.toISOString().split('T')[0];
        break;
      case 'mes':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        desde = monthAgo.toISOString().split('T')[0];
        break;
      case 'año':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        desde = yearAgo.toISOString().split('T')[0];
        break;
    }

    setFilters({ desde, hasta: today });
  };

  // Fetch data when tab or filters change
  useEffect(() => {
    if (activeTab === 'ia') {
      // IA tab uses mockdata, no fetch needed
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateRange = { desde: filters.desde, hasta: filters.hasta };
        let data = null;

        switch (activeTab) {
          case 'leads':
            data = await reportsService.fetchLeadsData(dateRange);
            break;
          case 'sales':
            data = await reportsService.fetchSalesData(dateRange);
            break;
          case 'alquiler':
            data = await reportsService.fetchRentalsData(dateRange);
            break;
          case 'stock':
            data = await reportsService.fetchPropertiesData(dateRange);
            break;
          case 'captacion':
            data = await reportsService.fetchCaptacionData(dateRange);
            break;
        }

        if (!data) {
          setError('No se pudieron cargar los datos. Intenta de nuevo.');
        }
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, filters.desde, filters.hasta]);

  // Export CSV con BOM
  const exportToCSV = (data: Record<string, any>[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h] ?? '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
        }).join(',')
      )
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!dashboardData) {
      alert('No hay datos para exportar. Espera a que carguen los datos.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let dataToExport: any[] = [];
    let filename = `reporte-${activeTab}-${today}.csv`;

    switch (activeTab) {
      case 'leads':
        dataToExport = dashboardData.rawLeads || [];
        break;
      case 'sales':
        dataToExport = dashboardData.rawSales || [];
        break;
      case 'alquiler':
        dataToExport = dashboardData.rawRentals || [];
        break;
      case 'stock':
        dataToExport = dashboardData.rawProperties || [];
        break;
      case 'captacion':
        dataToExport = dashboardData.rawCaptaciones || [];
        break;
      case 'ia':
        alert('La exportación CSV no está disponible para el dashboard de IA (mockdata).');
        return;
    }

    exportToCSV(dataToExport, filename);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-24 animate-fade-in px-4 md:px-0 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-10 pt-6">
        <div className="space-y-5 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1.5 bg-slate-900 rounded-full shadow-lg"></div>
            <span className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Business Intelligence Pro v4.5
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">
            Analytical Hub
          </h1>
          <p className="text-sm sm:text-base lg:text-xl font-medium text-slate-500 tracking-tight leading-relaxed">
            Módulo predictivo avanzado para el monitoreo en tiempo real de activos inmobiliarios y eficiencia de ventas.
          </p>
        </div>

        <div className="flex w-full lg:w-auto gap-4 p-4 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
          <button
            onClick={handleExportCSV}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] sm:text-[12px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            <Download size={16} />
            EXPORT CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-6 transition-colors rounded-full border shadow-inner ${
              showFilters ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'text-slate-500 hover:text-slate-900 bg-slate-50 border-slate-100'
            }`}
          >
            <Filter size={24} />
          </button>
        </div>
      </div>

      {/* Panel filtros + shortcuts */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-5 bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <Filter size={15} className="text-indigo-500" /> Filtros de Fecha
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <XIcon size={13} className="text-slate-500" />
              </button>
            </div>

            {/* Shortcuts */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => applyDateShortcut('hoy')}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                Hoy
              </button>
              <button
                onClick={() => applyDateShortcut('semana')}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                Esta Semana
              </button>
              <button
                onClick={() => applyDateShortcut('mes')}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                Este Mes
              </button>
              <button
                onClick={() => applyDateShortcut('año')}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                Este Año
              </button>
            </div>

            {/* Date inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Desde</label>
                <input
                  type="date"
                  value={filters.desde}
                  onChange={e => setFilters({ ...filters, desde: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hasta</label>
                <input
                  type="date"
                  value={filters.hasta}
                  onChange={e => setFilters({ ...filters, hasta: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setFilters({ desde: '', hasta: '' })}
                className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs con scroll mobile */}
      <div className="flex items-center gap-2 mb-16 overflow-x-auto scrollbar-hide pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Flecha izquierda */}
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="w-9 h-9 flex-shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Tabs */}
        <div className="flex gap-2 flex-1 justify-center overflow-x-auto scrollbar-hide px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`flex items-center gap-3 px-4 sm:px-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 border relative group shrink-0 ${
                activeTab === cat.id
                  ? `${cat.bg} ${cat.color} border-transparent shadow-xl scale-105 z-10`
                  : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <cat.icon size={15} className="shrink-0 transition-transform group-hover:scale-110" />
              <span className="whitespace-nowrap">{cat.label}</span>
              {activeTab === cat.id && (
                <motion.div layoutId="bi-tab-marker" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={goNext}
          disabled={currentIdx === tabOrder.length - 1}
          className="w-9 h-9 flex-shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Analytics Content */}
      <div className="min-h-[1400px]">
        {loading && <LoadingState />}
        {error && !loading && <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'leads' && <LeadsDashboard data={dashboardData} />}
              {activeTab === 'sales' && <SalesDashboard data={dashboardData} />}
              {activeTab === 'alquiler' && <AlquilerDashboard data={dashboardData} />}
              {activeTab === 'stock' && <StockDashboard data={dashboardData} />}
              {activeTab === 'captacion' && <CaptacionDashboard data={dashboardData} />}
              {activeTab === 'ia' && <IADashboard />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Reports;
