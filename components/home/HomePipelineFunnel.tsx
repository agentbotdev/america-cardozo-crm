import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { supabase } from '../../services/supabaseClient';
import { ETAPAS_PROCESO } from '../../config/taxonomy';
import { TrendingDown } from 'lucide-react';

export const HomePipelineFunnel: React.FC = () => {
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setLoading(true);

      // Fetch lead counts for each stage
      const stageCounts = await Promise.all(
        ETAPAS_PROCESO.map(async (etapa) => {
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('etapa_proceso', etapa.value);

          return {
            name: etapa.label,
            value: count || 0,
            fullName: etapa.label
          };
        })
      );

      setPipelineData(stageCounts);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c026d3', '#db2777', '#e11d48', '#10b981'];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
        <div className="h-64 bg-slate-100 rounded" />
      </div>
    );
  }

  const totalLeads = pipelineData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-black text-slate-800">Pipeline Completo de Leads</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {totalLeads} oportunidades en proceso
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <TrendingDown size={16} className="text-blue-500" />
          <span className="font-bold text-slate-600">Embudo de Conversión</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pipelineData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
              {pipelineData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: '#1e293b'
                }}
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap gap-2 justify-center">
          {pipelineData.map((stage, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              {stage.name}: {stage.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
