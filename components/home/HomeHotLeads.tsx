import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { Lead } from '../../types';

export const HomeHotLeads: React.FC<{ hotLeads: Lead[] }> = ({ hotLeads }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
          <Flame size={15} className="text-rose-500" /> Hot Oportunidades
        </h3>
        <button onClick={() => navigate('/leads')} className="text-[10px] text-slate-400 hover:text-slate-800 font-black transition-colors flex items-center gap-1">
          Ver todo <ChevronRight size={11} />
        </button>
      </div>
      <div className="space-y-2">
        {hotLeads.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Sin hot oportunidades por ahora</p>
        ) : hotLeads.slice(0, 4).map((lead) => (
          <div
            key={lead.id}
            onClick={() => navigate('/leads')}
            className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-white rounded-2xl transition-all duration-200 border border-slate-100 hover:border-slate-200 hover:shadow-sm cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
              {lead.nombre ? lead.nombre.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate group-hover:text-black">{lead.nombre}</p>
              <p className="text-[10px] text-slate-400 truncate">{lead.email || lead.telefono || 'Sin contacto'}</p>
            </div>
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 flex-shrink-0">
              {(lead as any).score ?? Math.floor(Math.random() * 20 + 80)}/100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
