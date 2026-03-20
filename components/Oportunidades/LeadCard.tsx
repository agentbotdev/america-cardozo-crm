import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Lead } from '../../types';

const statusColors: Record<string, string> = {
  frio: 'bg-blue-100 text-blue-600',
  tibio: 'bg-amber-100 text-amber-600',
  caliente: 'bg-rose-100 text-rose-600',
  ultra_caliente: 'bg-red-100 text-red-600',
  pausado: 'bg-slate-100 text-slate-600',
  perdido: 'bg-red-100 text-red-600',
  derivado: 'bg-orange-100 text-orange-600',
  cerrado: 'bg-green-100 text-green-600'
};

export const LeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({ lead, onClick }) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', lead.id);
      }}
      onClick={onClick}
      className="bg-white border border-slate-100 p-5 rounded-[1.5rem] space-y-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-indigo-200 transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-[100%] pointer-events-none group-hover:from-indigo-50 transition-colors"></div>
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-xs shadow-inner overflow-hidden relative">
            <span className="relative z-10 text-white">{lead.nombre.charAt(0)}</span>
             <div className={`absolute inset-0 opacity-20 ${lead.score > 70 ? 'bg-emerald-500' : lead.score > 40 ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 leading-tight truncate max-w-[180px]">{lead.nombre}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-tight">{lead.telefono}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-2 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
           <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${statusColors[lead.estado_temperatura] || 'bg-slate-100 text-slate-600'}`}>
              {lead.estado_temperatura}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600`}>
              {(lead.tipo_operacion_buscada || lead.busca_alquiler ? 'alquiler' : 'venta')}
            </span>
        </div>
        <div className="flex items-center justify-between w-full pt-1">
            <span className="text-xs font-black text-slate-900">
               {lead.presupuesto_max ? `USD ${lead.presupuesto_max.toLocaleString()}` : 'Presupuesto: ?'}
            </span>
           <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
            <span className={`text-[10px] font-black ${lead.score > 70 ? 'text-emerald-500' : lead.score > 40 ? 'text-indigo-500' : 'text-rose-500'}`}>{lead.score}%</span>
           </div>
        </div>
      </div>
    </div>
  );
};
