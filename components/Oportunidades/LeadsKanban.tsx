import React from 'react';
import { LEAD_STATUS } from '../../config/taxonomy';
import { Lead } from '../../types';
import { LeadCard } from './LeadCard';

interface LeadsKanbanProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadDrop: (leadId: string, newStatus: string) => void;
}

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({ leads, onLeadClick, onLeadDrop }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onLeadDrop(leadId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-8 pt-4 no-scrollbar min-h-[60vh] px-2 h-full snap-x snap-mandatory">
      {LEAD_STATUS.map(status => {
        const columnLeads = leads.filter(l => (l.estado_seguimiento || 'Nuevo') === status);
        
        return (
          <div
            key={status}
            className="flex-shrink-0 w-[340px] bg-slate-50/70 rounded-[2.5rem] border border-slate-100/60 overflow-hidden flex flex-col snap-start shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100/60 bg-white/50 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">{status}</h3>
              <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-black min-w-[28px] h-7 px-2 flex items-center justify-center rounded-full shadow-sm">
                {columnLeads.length}
              </span>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {columnLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
              ))}
              
              {columnLeads.length === 0 && (
                <div className="h-32 border-2 border-dashed border-slate-200/60 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 pointer-events-none">+</div>
                  Arrastra aquí
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
