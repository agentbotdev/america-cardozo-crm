import React from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface HomeChartsProps {
  chartsData: {
    visitasSemanales: any[];
    leadStatusData: any[];
    leadsBySourceData: any[];
    chartPorOperacion?: any[];
  }
}

export const HomeCharts: React.FC<HomeChartsProps> = ({ chartsData }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Actividad Semanal */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-black text-slate-800">Actividad Semanal</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Nuevas Oportunidades vs Visitas Realizadas</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Oportunidades</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />Visitas</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartsData.visitasSemanales} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
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
              <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gLeads)" />
              <Area type="monotone" dataKey="visitas" stroke="#6366f1" strokeWidth={2.5} fill="url(#gVisitas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estado del Pipeline */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4">Estado del Pipeline</h3>
        <div className="h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartsData.leadStatusData}
                innerRadius={52} outerRadius={72}
                paddingAngle={4} dataKey="value"
                cornerRadius={6} stroke="none"
              >
                {chartsData.leadStatusData.map((_, i) => (
                  <Cell key={i} fill={chartsData.leadStatusData[i].color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800">
              {chartsData.leadStatusData.reduce((acc, curr) => acc + curr.value, 0)}
            </span>
            <p className="text-[9px] uppercase text-slate-400 font-black tracking-wider">Total</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center mt-2">
          {chartsData.leadStatusData.map((e, i) => (
            <span key={i} className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
              {e.name}
            </span>
          ))}
        </div>
      </div>

      {/* Fuente de Oportunidades */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4">Fuente de Oportunidades</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartsData.leadsBySourceData} layout="vertical" barSize={14} margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={65} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(100,116,139,0.06)' }} contentStyle={{ borderRadius: '8px', background: '#1e293b', color: '#fff', border: 'none' }} itemStyle={{ color: '#fff' }} />
              <Bar dataKey="value" fill="#64748b" radius={[0, 6, 6, 0]}>
                {chartsData.leadsBySourceData.map((_, i) => (
                  <Cell key={i} fill={['#3b82f6','#6366f1','#10b981','#f59e0b','#f43f5e'][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actividad Por Operación */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm xl:col-span-2">
        <h3 className="text-sm font-black text-slate-800 mb-4">Oportunidades por Operación</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartsData.chartPorOperacion || []} barSize={24} margin={{ left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(100,116,139,0.06)' }} contentStyle={{ borderRadius: '8px', background: '#1e293b', color: '#fff', border: 'none' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {(chartsData.chartPorOperacion || []).map((_, i) => (
                  <Cell key={i} fill={['#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
