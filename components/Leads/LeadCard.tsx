import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Lead } from '../../types';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  statusColors: Record<string, string>;
  stageColors: Record<string, string>;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, statusColors, stageColors }) => {
  return (
    <div
      onClick={() => onClick(lead)}
      className="bg-white border border-slate-100 p-5 rounded-[1.5rem] space-y-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-indigo-100 active:scale-95"
      draggable
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
            {lead.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pr-2">
            <p className="font-black text-slate-800 leading-tight truncate">{lead.nombre}</p>
            <p className="text-[10px] text-slate-400 font-bold truncate">{lead.telefono}</p>
          </div>
        </div>
        <div className="p-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg border border-slate-100 shrink-0">
          <ArrowRight size={14} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${statusColors[lead.temperatura] || 'bg-slate-100 text-slate-600'}`}>
          {lead.temperatura}
        </span>
        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${stageColors[lead.etapa] || 'bg-slate-100 text-slate-600'}`}>
          {lead.etapa}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${lead.score}%` }} />
        </div>
        <span className="text-[10px] font-black text-slate-700 tracking-widest">{lead.score}%</span>
      </div>
      
      {lead.tipo_operacion_buscada && (
        <div className="pt-2 mt-2 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lead.tipo_operacion_buscada}</span>
            <span className="text-xs font-black text-slate-800">{lead.presupuesto_max ? `USD ${lead.presupuesto_max.toLocaleString()}` : 'A Confirmar'}</span>
        </div>
      )}
    </div>
  );
};
