import React from 'react';
import { Lead } from '../../types';
import { LeadCard } from './LeadCard';

interface LeadsKanbanProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadDrop: (leadId: string, newStatus: string) => void;
}

const KANBAN_STAGES = [
  { id: 'contacto_inicial', label: 'Contacto Inicial', color: 'slate' },
  { id: 'indagacion', label: 'Indagación', color: 'indigo' },
  { id: 'props_enviadas', label: 'Props. Enviadas', color: 'purple' },
  { id: 'visita_agendada', label: 'Visita Agendada', color: 'blue' },
  { id: 'negociacion', label: 'Negociación', color: 'amber' },
  { id: 'cierre', label: 'Cierre', color: 'emerald' }
];

const statusColors: Record<string, string> = {
  frio: 'bg-blue-100 text-blue-600',
  tibio: 'bg-amber-100 text-amber-600',
  caliente: 'bg-rose-100 text-rose-600',
  ultra_caliente: 'bg-red-100 text-red-600'
};

const stageColors: Record<string, string> = {
  contacto_inicial: 'bg-slate-100 text-slate-600',
  indagacion: 'bg-indigo-100 text-indigo-600',
  props_enviadas: 'bg-purple-100 text-purple-600',
  visita_agendada: 'bg-blue-100 text-blue-600',
  negociacion: 'bg-amber-100 text-amber-600',
  cierre: 'bg-emerald-100 text-emerald-600'
};

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({ leads, onLeadClick, onLeadDrop }) => {
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    if (e.dataTransfer.setDragImage) {
       // Optional: Set custom drag image
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onLeadDrop(leadId, stageId);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto p-6 md:p-8 custom-scrollbar">
      <div className="flex gap-6 min-w-max h-full">
        {KANBAN_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.etapa === stage.id || (stage.id === 'contacto_inicial' && !l.etapa));
          
          return (
            <div 
              key={stage.id} 
              className="w-[320px] flex flex-col h-full bg-slate-50/50 rounded-[2rem] border border-slate-100/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-100/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${stage.color}-500 shadow-sm`} />
                  <h3 className="font-black text-slate-700 uppercase tracking-widest text-[11px]">{stage.label}</h3>
                </div>
                <span className={`bg-white px-3 py-1 rounded-xl text-[10px] font-black text-slate-500 shadow-sm border border-slate-100`}>
                  {stageLeads.length}
                </span>
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1 min-h-[500px]">
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="transform transition-transform active:scale-95 cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-xl"
                  >
                    <LeadCard 
                      lead={lead} 
                      onClick={onLeadClick}
                      statusColors={statusColors}
                      stageColors={stageColors}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
