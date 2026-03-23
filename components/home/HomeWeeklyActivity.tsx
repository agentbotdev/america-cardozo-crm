import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../services/supabaseClient';
import { VENDEDORES } from '../../config/taxonomy';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyData {
  dia: string;
  fecha: Date;
  [key: string]: any;
}

export const HomeWeeklyActivity: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [visitasData, setVisitasData] = useState<WeeklyData[]>([]);
  const [cierresData, setCierresData] = useState<WeeklyData[]>([]);
  const [derivacionesData, setDerivacionesData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  const vendedorColors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f59e0b', '#10b981', '#14b8a6', '#64748b'
  ];

  useEffect(() => {
    loadWeeklyData();
  }, [weekOffset]);

  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Monday as start
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (weekOffset * 7));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      const weekDates = getWeekDates();
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = new Date(weekDates[6]);
      endDate.setHours(23, 59, 59);
      const endDateStr = endDate.toISOString();

      // Initialize data structure
      const visitasMap: WeeklyData[] = weekDates.map(date => ({
        dia: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()],
        fecha: date
      }));

      const cierresMap: WeeklyData[] = weekDates.map(date => ({
        dia: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()],
        fecha: date
      }));

      const derivacionesMap: WeeklyData[] = weekDates.map(date => ({
        dia: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()],
        fecha: date,
        derivaciones: 0
      }));

      // Fetch visits
      const { data: visitas } = await supabase
        .from('visitas')
        .select('fecha, vendedor_asignado, estado')
        .gte('fecha', startDate)
        .lte('fecha', endDateStr)
        .eq('estado', 'realizada');

      // Fetch closed leads (cierres)
      const { data: cierres } = await supabase
        .from('leads')
        .select('created_at, vendedor_asignado, temperatura')
        .gte('created_at', startDate)
        .lte('created_at', endDateStr)
        .eq('temperatura', 'cerrado');

      // Fetch AI derivations
      const { data: derivaciones } = await supabase
        .from('leads')
        .select('created_at, temperatura')
        .gte('created_at', startDate)
        .lte('created_at', endDateStr)
        .eq('temperatura', 'derivado');

      // Process visitas by vendedor
      VENDEDORES.forEach(vendedor => {
        visitasMap.forEach(dayData => {
          const dayStart = new Date(dayData.fecha);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayData.fecha);
          dayEnd.setHours(23, 59, 59, 999);

          const count = (visitas || []).filter(v => {
            const visitDate = new Date(v.fecha);
            return v.vendedor_asignado === vendedor.value &&
                   visitDate >= dayStart && visitDate <= dayEnd;
          }).length;

          dayData[vendedor.iniciales] = count;
        });
      });

      // Process cierres by vendedor
      VENDEDORES.forEach(vendedor => {
        cierresMap.forEach(dayData => {
          const dayStart = new Date(dayData.fecha);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayData.fecha);
          dayEnd.setHours(23, 59, 59, 999);

          const count = (cierres || []).filter(c => {
            const cierreDate = new Date(c.created_at);
            return c.vendedor_asignado === vendedor.value &&
                   cierreDate >= dayStart && cierreDate <= dayEnd;
          }).length;

          dayData[vendedor.iniciales] = count;
        });
      });

      // Process derivaciones
      derivacionesMap.forEach(dayData => {
        const dayStart = new Date(dayData.fecha);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayData.fecha);
        dayEnd.setHours(23, 59, 59, 999);

        const count = (derivaciones || []).filter(d => {
          const derivDate = new Date(d.created_at);
          return derivDate >= dayStart && derivDate <= dayEnd;
        }).length;

        dayData.derivaciones = count;
      });

      setVisitasData(visitasMap);
      setCierresData(cierresMap);
      setDerivacionesData(derivacionesMap);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekDates = getWeekDates();
  const weekLabel = `${weekDates[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-64 mb-4" />
        <div className="space-y-4">
          <div className="h-64 bg-slate-100 rounded" />
          <div className="h-64 bg-slate-100 rounded" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-indigo-500" />
          <div>
            <h3 className="text-base font-black text-slate-800">Actividad Semanal por Vendedor</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{weekLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            disabled={weekOffset >= 0}
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chart 1: Visitas por vendedor */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Visitas Realizadas</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitasData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    background: '#1e293b',
                    color: '#fff'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                  iconType="circle"
                />
                {VENDEDORES.map((vendedor, idx) => (
                  <Line
                    key={vendedor.value}
                    type="monotone"
                    dataKey={vendedor.iniciales}
                    stroke={vendedorColors[idx]}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name={vendedor.iniciales}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cierres por vendedor */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Cierres Realizados</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cierresData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    background: '#1e293b',
                    color: '#fff'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                  iconType="circle"
                />
                {VENDEDORES.map((vendedor, idx) => (
                  <Line
                    key={vendedor.value}
                    type="monotone"
                    dataKey={vendedor.iniciales}
                    stroke={vendedorColors[idx]}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name={vendedor.iniciales}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Derivaciones del AI Agent */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Derivaciones del AI Agent</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={derivacionesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="derivacionesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    background: '#1e293b',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="derivaciones"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f97316' }}
                  activeDot={{ r: 7 }}
                  fill="url(#derivacionesGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
