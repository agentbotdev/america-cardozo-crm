import React from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Mail, FileText, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { Lead } from '../../types';

interface LeadDetailPanelProps {
  lead: Lead;
  properties: any[];
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ lead, properties, onClose, onEdit }) => {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-[200] flex flex-col border-l border-slate-100"
    >
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xl">
            {lead.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{lead.nombre}</h2>
            <div className="flex gap-2">
              <span className="bg-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">
                {lead.temperatura}
              </span>
              <span className="bg-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-slate-100">
                {lead.etapa}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(lead)}
            className="p-3 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-2xl transition-all shadow-sm border border-slate-100"
          >
            Editar
          </button>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-400 rounded-2xl transition-all shadow-sm border border-slate-100">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 bg-slate-50/20">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-500" /> Información de Contacto
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-50 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Teléfono</p>
                <p className="font-bold text-slate-700">{lead.telefono}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-50 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                <p className="font-bold text-slate-700">{lead.email || 'No proporcionado'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
            <Building size={16} className="text-indigo-500" /> Interés principal
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operación</p>
              <p className="font-bold text-slate-800 text-lg capitalize">{lead.tipo_operacion_buscada || 'No especificado'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inmueble</p>
              <p className="font-bold text-slate-800 text-lg capitalize">{lead.tipo_propiedad_buscada?.[0] || 'Todos'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presupuesto</p>
              <p className="font-bold text-slate-800 text-lg">
                {lead.presupuesto_max ? `USD ${lead.presupuesto_max.toLocaleString()}` : 'A confirmar'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score AgentBot</p>
              <p className="font-black text-indigo-600 text-lg">{lead.score}/100</p>
            </div>
          </div>
        </div>

        {(lead.notas || lead.transcripcion_audio) && (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> Notas y Transcripciones
            </h3>
            {lead.notas && (
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notas Manuales</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed border border-slate-100/50">
                  {lead.notas}
                </p>
              </div>
            )}
            {lead.transcripcion_audio && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Transcripción de IA</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic leading-relaxed border border-slate-100/50">
                  "{lead.transcripcion_audio}"
                </p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </motion.div>
  );
};
