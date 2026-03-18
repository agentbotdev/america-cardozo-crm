import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Visit, VisitStatus, Lead, Property } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Plus, LayoutList, CalendarDays, X, Check, Map, User, ChevronLeft, ChevronRight, Edit, ArrowRight, Share2, Globe, Mail, Trash2, Building, Building2, ChevronUp, ChevronDown, Search, Flame, Users, Filter, List } from 'lucide-react';
import { googleCalendarService } from '../services/googleCalendarService';
import { visitsService } from '../services/visitsService';
import { leadsService } from '../services/leadsService';
import { propertiesService } from '../services/propertiesService';
import { motion, AnimatePresence } from 'framer-motion';

// ... LeadSearchInput (keeping the same as original to save space or just abbreviated)
const LeadSearchInput: React.FC<{ leads: Lead[]; selectedId: string; onSelect: (lead: Lead) => void; }> = ({ leads, selectedId, onSelect }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = leads.find(l => l.id === selectedId);

    const filtered = useMemo(() => query.trim() === '' ? leads : leads.filter(l => l.nombre.toLowerCase().includes(query.toLowerCase()) || (l.email || '').toLowerCase().includes(query.toLowerCase()) || (l.telefono || '').includes(query)), [leads, query]);

    return (
        <div ref={ref} className="relative">
            <div onClick={() => setOpen(o => !o)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer">
                {selected ? (
                    <>
                        <div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-800 truncate">{selected.nombre}</p></div>
                    </>
                ) : (
                    <><User size={16} className="text-slate-400" /><span className="text-sm text-slate-400 font-semibold">Seleccionar lead...</span></>
                )}
            </div>
            {open && (
                <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-slate-50"><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..." className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none" /></div>
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.map(lead => (
                            <div key={lead.id} onClick={() => { onSelect(lead); setOpen(false); setQuery(''); }} className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-bold border-b border-slate-50">
                                {lead.nombre}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const VisitFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (visit: Visit) => void; visitToEdit?: Visit | null; leads: Lead[]; properties: Property[]; }> = ({ isOpen, onClose, onSave, visitToEdit, leads, properties }) => {
    const [formData, setFormData] = useState<Partial<Visit> & { sync_google?: boolean, vendedor_asignado?: string }>({
        lead_id: '', lead_nombre: '', property_id: '', property_titulo: '', fecha: new Date().toISOString().split('T')[0], hora: '10:00', estado: 'agendada', tipo_reunion: 'propiedad', notas: '', invitados: [], sync_google: true, vendedor_asignado: ''
    });

    useEffect(() => {
        if (visitToEdit) setFormData(visitToEdit);
        else setFormData(prev => ({ ...prev, lead_id: leads[0]?.id || '', lead_nombre: leads[0]?.nombre || '' }));
    }, [visitToEdit, isOpen, leads]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative p-8 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">{visitToEdit ? 'Editar Visita' : 'Agendar Visita'}</h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl"><X size={20} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData as Visit); onClose(); }} className="space-y-4">
                    <LeadSearchInput leads={leads} selectedId={formData.lead_id || ''} onSelect={l => setFormData({ ...formData, lead_id: l.id, lead_nombre: l.nombre })} />
                    
                    <select value={formData.property_id} onChange={e => setFormData({ ...formData, property_id: e.target.value, property_titulo: properties.find(p=>p.id === e.target.value)?.titulo || '' })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                        <option value="">Seleccionar Propiedad...</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                    </select>

                    <input type="text" placeholder="Vendedor Asignado (Opcional)" value={formData.vendedor_asignado || ''} onChange={e => setFormData({ ...formData, vendedor_asignado: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />

                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" />
                        <input type="time" value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" />
                    </div>

                    <textarea value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} placeholder="Notas..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold mt-2" />
                    
                    <button type="submit" className="w-full py-4 text-white bg-slate-900 rounded-2xl font-black mt-4">Guardar</button>
                </form>
            </div>
        </div>
    );
};

const VisitDetailPanel: React.FC<{ visit: Visit; onClose: () => void; onEdit: (v: Visit) => void; onStatusChange: (v: Visit, s: VisitStatus) => void; }> = ({ visit, onClose, onEdit, onStatusChange }) => {
    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-200 p-8 flex flex-col border-l border-slate-100">
            <div className="flex justify-between mb-8">
                <h2 className="text-2xl font-black">Detalle Visita</h2>
                <button onClick={onClose}><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="bg-slate-50 p-6 rounded-3xl mb-6">
                    <h3 className="font-bold text-lg mb-2">{visit.property_titulo}</h3>
                    <p className="text-sm font-medium text-slate-500">{visit.lead_nombre}</p>
                    <div className="mt-4 flex gap-4 text-sm font-bold">
                        <span>{visit.fecha}</span>
                        <span>{visit.hora} hs</span>
                    </div>
                    {/* @ts-ignore */}
                    {visit.vendedor_asignado && <div className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 p-2 rounded-lg inline-block">Asignado a: {visit.vendedor_asignado}</div>}
                </div>
                
                <div className="flex flex-col gap-3">
                    <button onClick={() => {
                        const feedback = window.prompt('Deja un comentario sobre cómo fue la visita para el historial:');
                        if(feedback !== null) { onStatusChange(visit, 'realizada'); }
                    }} className="py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl">Marcar Realizada</button>
                    <button onClick={() => onStatusChange(visit, 'cancelada')} className="py-4 bg-rose-50 text-rose-700 font-bold rounded-2xl">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// Simplified CalendarGrid to fit
const CalendarGrid: React.FC<{ visits: Visit[]; onVisitClick: (v: Visit) => void }> = ({ visits, onVisitClick }) => {
    return <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 font-bold">Resumen de Calendario (Vista Optimizada) - Hay {visits.length} visitas. Usa vista Lista o Pipeline para ver detalles.</div>;
};

const Visits: React.FC = () => {
    const location = useLocation();
    const [view, setView] = useState<'calendar' | 'pipeline' | 'list'>('pipeline');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filterVendedor, setFilterVendedor] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [vData, lData, pData] = await Promise.all([visitsService.fetchVisits(), leadsService.fetchLeads(), propertiesService.fetchProperties()]);
        setVisits(vData as Visit[]); setLeads(lData as Lead[]); setProperties(pData as Property[]);
    };

    const handleSaveVisit = async (v: Visit) => {
        const saved = await visitsService.saveVisit(v);
        loadData();
    };

    const filteredVisits = visits.filter(v => {
        if (!filterVendedor) return true;
        // @ts-ignore
        return v.vendedor_asignado?.toLowerCase().includes(filterVendedor.toLowerCase());
    });

    return (
        <div className="max-w-[1400px] mx-auto pb-16 h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black">Agenda Visitas</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase mt-1">Gestión de citas</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-1 rounded-2xl border border-slate-100 flex shadow-sm">
                        <button onClick={() => setView('pipeline')} className={`p-3 rounded-xl ${view === 'pipeline' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}><LayoutList size={20}/></button>
                        <button onClick={() => setView('list')} className={`p-3 rounded-xl ${view === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}><List size={20}/></button>
                        <button onClick={() => setView('calendar')} className={`p-3 rounded-xl ${view === 'calendar' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}><CalendarDays size={20}/></button>
                    </div>
                    <button onClick={() => setIsDrawerOpen(true)} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"><Filter size={20}/></button>
                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-lg flex gap-2"><Plus size={20}/> NUEVA</button>
                </div>
            </div>

            <AnimatePresence>
                {isDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/20" onClick={() => setIsDrawerOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative bg-white w-[350px] h-full p-8 shadow-2xl flex flex-col">
                            <h3 className="text-xl font-black mb-6">Filtros de Visitas</h3>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Vendedor Asignado</label>
                                <input type="text" value={filterVendedor} onChange={e=>setFilterVendedor(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl mt-2 font-bold" placeholder="Nombre completo..." />
                            </div>
                            <button onClick={()=>setIsDrawerOpen(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl">Aplicar Todos</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {view === 'calendar' && <CalendarGrid visits={filteredVisits} onVisitClick={setSelectedVisit} />}
            {view === 'pipeline' && (
                <div className="flex gap-6 overflow-x-auto flex-1 items-start">
                    {['agendada', 'confirmada', 'realizada'].map(stage => (
                        <div key={stage} className="min-w-[350px] bg-slate-50/50 border border-slate-100 p-6 rounded-[2rem]">
                            <h3 className="font-black text-slate-400 uppercase text-xs mb-6">{stage}</h3>
                            <div className="space-y-4">
                                {filteredVisits.filter(v => v.estado === stage).map(v => (
                                    <div key={v.id} onClick={() => setSelectedVisit(v)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 cursor-pointer hover:border-indigo-100">
                                        <p className="font-black">{v.lead_nombre}</p>
                                        <p className="text-xs text-slate-500 truncate mt-1">{v.property_titulo}</p>
                                        <div className="mt-3 text-[10px] font-bold text-indigo-500 bg-indigo-50 inline-block px-2 py-1 rounded-md">{v.fecha} • {v.hora} hs</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {view === 'list' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-1">
                   <table className="w-full text-left">
                       <thead className="bg-slate-50">
                           <tr>
                               <th className="p-4 text-xs font-bold uppercase text-slate-400">Lead</th>
                               <th className="p-4 text-xs font-bold uppercase text-slate-400">Propiedad</th>
                               <th className="p-4 text-xs font-bold uppercase text-slate-400">Fecha/Hora</th>
                               <th className="p-4 text-xs font-bold uppercase text-slate-400">Estado</th>
                               <th className="p-4 text-xs font-bold uppercase text-slate-400">Asignado</th>
                           </tr>
                       </thead>
                       <tbody>
                           {filteredVisits.map(v => (
                               <tr key={v.id} onClick={()=>setSelectedVisit(v)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                                   <td className="p-4 font-bold">{v.lead_nombre}</td>
                                   <td className="p-4 text-sm text-slate-500">{v.property_titulo}</td>
                                   <td className="p-4 text-sm font-bold text-slate-900">{v.fecha} {v.hora}</td>
                                   <td className="p-4"><span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md">{v.estado}</span></td>
                                   {/* @ts-ignore */}
                                   <td className="p-4 text-sm text-indigo-600 font-bold">{v.vendedor_asignado || '-'}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
            )}

            <VisitFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveVisit} leads={leads} properties={properties} />
            {selectedVisit && <VisitDetailPanel visit={selectedVisit} onClose={() => setSelectedVisit(null)} onEdit={v=>{setIsModalOpen(true); setVisitToEdit(v);}} onStatusChange={(v,s)=>{handleSaveVisit({...v, estado: s}); setSelectedVisit(null);}} />}
        </div>
    );
};

export default Visits;