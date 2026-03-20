import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Smartphone, ArrowRight } from 'lucide-react';
import { Lead } from '../types';
import { leadsService } from '../services/leadsService';
import { propertiesService } from '../services/propertiesService';

import { LeadCard } from '../components/Leads/LeadCard';
import { LeadsKanban } from '../components/Leads/LeadsKanban';
import { LeadsFilters } from '../components/Leads/LeadsFilters';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { LeadDetailPanel } from '../components/Leads/LeadDetailPanel';

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

const Oportunidades: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'caliente' | 'tibio' | 'frio'>('todos');
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc'>('date');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, propsData] = await Promise.all([
        leadsService.fetchLeads(),
        propertiesService.fetchProperties()
      ]);
      setLeads(leadsData as any);
      setProperties(propsData as any);
    } catch (error) {
      console.error('Error loading leads/properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadDrop = async (leadId: string, newStage: string) => {
    try {
      setLeads(leads.map(l => l.id === leadId ? { ...l, etapa: newStage } : l));
      const { error } = await leadsService.updateLeadStage(leadId, newStage);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating stage:', err);
      // Revert if error
      loadData();
    }
  };

  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => {
      const matchesSearch = (lead.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                            (lead.telefono?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'todos' || lead.temperatura === activeFilter;
      return matchesSearch && matchesFilter;
    });

    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.presupuesto_max || 0) - (b.presupuesto_max || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.presupuesto_max || 0) - (a.presupuesto_max || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [searchTerm, activeFilter, sortBy, leads]);

  return (
    <>
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-[190]"
              onClick={() => setSelectedLead(null)}
            />
            <LeadDetailPanel
              lead={selectedLead}
              properties={properties}
              onClose={() => setSelectedLead(null)}
              onEdit={(l) => {
                setSelectedLead(null);
                setEditingLead(l);
                setIsModalOpen(true);
              }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto animate-fade-in pb-16 px-4 md:px-0 h-full flex flex-col">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-8 shrink-0">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-3">Oportunidades</h1>
            <p className="text-slate-400 font-bold text-xs md:text-base uppercase tracking-[0.2em]">Gestión inteligente en Kanban</p>
          </div>
          <button
            onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-slate-900 text-white px-12 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> NUEVO LEAD
          </button>
        </div>

        <LeadFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingLead(null); }}
          leadToEdit={editingLead}
          onSave={async (updatedData: any) => {
            try {
              if (editingLead) {
                await leadsService.updateLead(editingLead.id, updatedData);
              } else {
                await leadsService.createLead(updatedData);
              }
              await loadData();
              setIsModalOpen(false);
              setEditingLead(null);
            } catch (error) {
              console.error('Error saving lead:', error);
              alert('Error al guardar el lead');
            }
          }}
        />

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[70vh] overflow-hidden">
          <LeadsFilters
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            activeFilter={activeFilter} setActiveFilter={setActiveFilter}
            sortBy={sortBy} setSortBy={setSortBy}
            viewMode={viewMode} setViewMode={setViewMode}
          />

          <div className="flex-1 bg-slate-50/30 overflow-hidden flex flex-col">
            {loading ? (
              <div className="py-48 text-center bg-transparent flex-1">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.4em]">Cargando Leads...</p>
              </div>
            ) : viewMode === 'kanban' ? (
               <LeadsKanban leads={filteredLeads} onLeadClick={setSelectedLead} onLeadDrop={handleLeadDrop} />
            ) : (
                <div className="flex-1 overflow-x-auto no-scrollbar overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50/30 text-[10px] uppercase text-slate-400 font-black tracking-[0.3em] border-b border-slate-50 sticky top-0 z-10 backdrop-blur-xl">
                      <tr>
                        <th className="px-10 py-7">Perfil del Prospecto</th>
                        <th className="px-10 py-7">Tipo de Interés</th>
                        <th className="px-10 py-7">Pipeline / Status</th>
                        <th className="px-10 py-7">Inteligencia AgentBot</th>
                        <th className="px-10 py-7 text-right">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setSelectedLead(lead)}
                          className="group hover:bg-slate-50/50 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-600 bg-white"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-2 ring-white">
                                {lead.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="text-[15px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-none mb-2">{lead.nombre}</p>
                                <div className="flex items-center gap-2">
                                  <Smartphone size={10} className="text-slate-400" />
                                  <p className="text-[11px] text-slate-400 font-bold tracking-tight">{lead.telefono}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">{(lead.tipo_operacion_buscada || 'venta').toUpperCase()}</span>
                              <span className="text-sm font-black text-slate-700 leading-none">{lead.tipo_propiedad_buscada?.[0] || 'Inmueble'}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex gap-3">
                              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${statusColors[lead.temperatura] || 'bg-slate-100 text-slate-600'}`}>
                                {lead.temperatura || 'N/A'}
                              </span>
                              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${stageColors[lead.etapa] || 'bg-slate-100 text-slate-600'}`}>
                                {lead.etapa || 'Nuevo'}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${lead.score}%` }}
                                  className={`h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)] ${lead.score > 70 ? 'bg-emerald-500' : lead.score > 40 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                />
                              </div>
                              <span className="text-[11px] font-black text-slate-900 tracking-widest">{lead.score || 0}/100</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="p-3.5 text-slate-200 group-hover:text-indigo-600 transition-all hover:bg-white hover:shadow-lg rounded-[1.2rem] inline-block border border-transparent hover:border-slate-100">
                              <ArrowRight size={20} strokeWidth={3} />
                            </div>
                          </td>
                        </motion.tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="py-24 text-center bg-slate-50/20">
                            <Users size={64} className="mx-auto mb-8 text-slate-200 animate-pulse" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-lg">No se han encontrado prospectos</p>
                            <button onClick={() => { setSearchTerm(''); setActiveFilter('todos'); }} className="mt-6 text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">Reiniciar Búsqueda</button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Oportunidades;
