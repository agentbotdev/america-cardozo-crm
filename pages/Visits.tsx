import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Visit, VisitStatus, Lead, Property } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Plus, LayoutList, CalendarDays, X, Check, Map, User, ChevronLeft, ChevronRight, Edit, ArrowRight, Share2, Globe, Mail, Trash2, Building, Building2, ChevronUp, ChevronDown } from 'lucide-react';
import { googleCalendarService } from '../services/googleCalendarService';
import { visitsService } from '../services/visitsService';
import { leadsService } from '../services/leadsService';
import { propertiesService } from '../services/propertiesService';

const VisitFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (visit: Visit) => void;
    visitToEdit?: Visit | null;
    leads: Lead[];
    properties: Property[];
}> = ({ isOpen, onClose, onSave, visitToEdit, leads, properties }) => {
    const [formData, setFormData] = useState<Partial<Visit> & { sync_google?: boolean }>({
        lead_id: '',
        lead_nombre: '',
        property_id: '',
        property_titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        estado: 'agendada',
        tipo_reunion: 'propiedad',
        notas: '',
        invitados: [],
        sync_google: true
    });
    const [newAttendee, setNewAttendee] = useState('');

    useEffect(() => {
        if (visitToEdit) {
            setFormData(visitToEdit);
        } else {
            setFormData({
                lead_id: leads[0]?.id || '',
                lead_nombre: leads[0]?.nombre || '',
                property_id: properties[0]?.id || '',
                property_titulo: properties[0]?.titulo || '',
                fecha: new Date().toISOString().split('T')[0],
                hora: '10:00',
                estado: 'agendada',
                tipo_reunion: 'propiedad',
                notas: '',
                invitados: [],
                sync_google: true
            });
        }
    }, [visitToEdit, isOpen, leads, properties]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: visitToEdit?.id || `VIS-${Math.floor(Math.random() * 10000)}`,
            ...formData as Visit
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative animate-fade-in p-6 md:p-10 border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{visitToEdit ? 'Editar Visita' : 'Agendar Visita'}</h2>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all" aria-label="Cerrar"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, tipo_reunion: 'propiedad' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.tipo_reunion === 'propiedad' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            <Building2 size={14} /> Visita Propiedad
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, tipo_reunion: 'empresa' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.tipo_reunion === 'empresa' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            <Building size={14} /> Reunión Empresa
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead / Cliente</label>
                        <select
                            value={formData.lead_id}
                            onChange={e => {
                                const lead = leads.find(l => l.id === e.target.value);
                                setFormData({ ...formData, lead_id: e.target.value, lead_nombre: lead?.nombre || '' });
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
                        >
                            <option value="">Seleccionar Lead...</option>
                            {leads.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                        </select>
                    </div>
                    {formData.tipo_reunion === 'propiedad' && (
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Propiedad</label>
                            <select
                                value={formData.property_id}
                                onChange={e => {
                                    const prop = properties.find(p => p.id === e.target.value);
                                    setFormData({ ...formData, property_id: e.target.value, property_titulo: prop?.titulo || '' });
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
                            >
                                <option value="">Seleccionar Propiedad...</option>
                                {properties.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción / Notas</label>
                        <textarea
                            value={formData.notas}
                            onChange={e => setFormData({ ...formData, notas: e.target.value })}
                            placeholder="Detalles sobre la reunión..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invitados Adicionales</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="email"
                                value={newAttendee}
                                onChange={e => setNewAttendee(e.target.value)}
                                placeholder="ejemplo@email.com"
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newAttendee && !formData.invitados?.includes(newAttendee)) {
                                        setFormData({ ...formData, invitados: [...(formData.invitados || []), newAttendee] });
                                        setNewAttendee('');
                                    }
                                }}
                                className="bg-slate-900 text-white p-3 rounded-xl hover:bg-indigo-600 transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.invitados?.map(email => (
                                <div key={email} className="bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-indigo-100">
                                    <span className="text-[10px] font-bold text-indigo-700">{email}</span>
                                    <button type="button" onClick={() => setFormData({ ...formData, invitados: formData.invitados?.filter(i => i !== email) })}>
                                        <X size={12} className="text-indigo-400 hover:text-indigo-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hora</label>
                            <input
                                type="time"
                                value={formData.hora}
                                onChange={e => setFormData({ ...formData, hora: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <input
                            type="checkbox"
                            id="sync_google"
                            checked={formData.sync_google}
                            onChange={e => setFormData({ ...formData, sync_google: e.target.checked })}
                            className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-50 transition-all cursor-pointer"
                        />
                        <label htmlFor="sync_google" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-2">
                            <Globe size={14} className="text-indigo-400" /> Sincronizar con Google Calendar
                        </label>
                    </div>
                    <button type="submit" className="w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-indigo-600 shadow-xl transition-all active:scale-95 mt-4">
                        {visitToEdit ? 'Guardar Cambios' : 'Agendar Visita'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const VisitDetailPanel: React.FC<{
    visit: Visit;
    onClose: () => void;
    onEdit: (v: Visit) => void;
    onStatusChange: (v: Visit, s: VisitStatus) => void;
}> = ({ visit, onClose, onEdit, onStatusChange }) => {
    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-white/95 backdrop-blur-2xl shadow-2xl z-200 transform transition-transform duration-500 animate-slide-in-right p-6 md:p-10 border-l border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Detalle Visita</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID Ref: {visit.id}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(visit)}
                        className="p-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-2xl transition-all"
                    >
                        <Edit size={20} />
                    </button>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"><X size={20} /></button>
                </div>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar pb-10">
                {/* Main Info */}
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem]"></div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{visit.property_titulo}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 relative z-10">
                        <MapPin size={12} /> Ubicación Propiedad
                    </div>

                    <div className="flex items-center gap-5 bg-white p-5 rounded-3xl shadow-sm mb-4 border border-slate-50">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                            {visit.lead_nombre.charAt(0)}
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-900 tracking-tight">{visit.lead_nombre}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Calificado</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center gap-3">
                            <CalendarDays size={18} className="text-indigo-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                                <p className="text-xs font-black text-slate-800">{visit.fecha}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center gap-3">
                            <Clock size={18} className="text-indigo-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</p>
                                <p className="text-xs font-black text-slate-800">{visit.hora} hs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline / Status Tracking */}
                <div className="px-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Seguimiento de Visita</h3>
                    <div className="relative pl-8 border-l-2 border-slate-100 space-y-10">
                        {visit.timeline?.map((event, idx) => (
                            <div key={event.id} className="relative">
                                <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-indigo-400 shadow-sm shadow-indigo-100"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{event.timestamp}</span>
                                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{event.status}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">{event.comment}</p>
                                </div>
                            </div>
                        ))}
                        {(!visit.timeline || visit.timeline.length === 0) && (
                            <p className="text-xs text-slate-400 italic">No hay actividad registrada aún.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => onStatusChange(visit, 'realizada')}
                        className="py-5 bg-emerald-50 text-emerald-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-3"
                    >
                        <Check size={16} strokeWidth={3} /> Marcar Realizada
                    </button>
                    <button
                        onClick={() => onStatusChange(visit, 'cancelada')}
                        className="py-5 bg-rose-50 text-rose-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                    >
                        <X size={16} strokeWidth={3} /> Cancelar Cita
                    </button>
                </div>
            </div>
        </div>
    )
}

// Full Month Calendar Grid
const CalendarGrid: React.FC<{ visits: Visit[]; onVisitClick: (v: Visit) => void }> = ({ visits, onVisitClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDays = useMemo(() => {
        const totalDays = daysInMonth(year, month);
        const startOffset = firstDayOfMonth(year, month);
        const days = [];

        // Previous month days for padding
        const prevMonthTotalDays = daysInMonth(year, month - 1);
        for (let i = startOffset - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthTotalDays - i),
                currentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                date: new Date(year, month, i),
                currentMonth: true
            });
        }

        // Next month days for padding
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false
            });
        }

        return days;
    }, [year, month]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const getVisitsForDay = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateString = `${y}-${m}-${d}`;
        return visits.filter(v => v.fecha === dateString);
    }

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-4 lg:p-10 shadow-2xl shadow-slate-200/50 border border-white/60 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-10 px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <div className="text-center min-w-[180px]">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">{monthNames[month]}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{year}</p>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                </div>
                <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-lg transition-all active:scale-95"
                >
                    Hoy
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar scroll-smooth flex-1">
                <div className="min-w-[700px] md:min-w-[800px] h-full flex flex-col">
                    <div className="grid grid-cols-7 mb-6 px-4">
                        {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-3 flex-1 pb-4">
                        {calendarDays.map((dayObj, idx) => {
                            const dayVisits = getVisitsForDay(dayObj.date);
                            const isToday = dayObj.date.toDateString() === new Date().toDateString();

                            return (
                                <div key={idx} className={`min-h-[100px] md:min-h-[120px] border border-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-4 transition-all relative flex flex-col gap-2 
                                    ${dayObj.currentMonth ? 'bg-white shadow-sm' : 'bg-slate-50/30 opacity-40'} 
                                    ${isToday ? 'ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'hover:shadow-lg hover:-translate-y-1'}`}>

                                    <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl mb-1
                                        ${isToday ? 'bg-slate-900 text-white shadow-indigo-200' : 'text-slate-400'}`}>
                                        {dayObj.date.getDate()}
                                    </span>

                                    <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[80px]">
                                        {dayVisits.map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => onVisitClick(v)}
                                                className={`text-[9px] p-2.5 rounded-xl cursor-pointer font-black uppercase tracking-tight transition-all hover:scale-[1.03] border-l-[3px] shadow-sm
                                                    ${v.estado === 'confirmada' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' :
                                                        v.estado === 'cancelada' ? 'bg-rose-50 text-rose-700 border-rose-500 opacity-60' :
                                                            v.estado === 'realizada' ? 'bg-slate-50 text-slate-500 border-slate-300' :
                                                                'bg-indigo-50 text-indigo-700 border-indigo-500'}`}
                                            >
                                                <div className="flex items-center gap-1 opacity-60 mb-0.5 text-[8px]">
                                                    <Clock size={8} /> {v.hora}
                                                </div>
                                                <div className="truncate">{v.lead_nombre}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Visits: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preselectedPropertyId = queryParams.get('propertyId');

    const [view, setView] = useState<'calendar' | 'pipeline'>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ... useEffect to open modal if preselectedPropertyId changes ...
    useEffect(() => {
        if (preselectedPropertyId && properties.length > 0) {
            const prop = properties.find(p => p.id === preselectedPropertyId);
            if (prop) {
                setVisitToEdit(null);
                setIsModalOpen(true);
            }
        }
    }, [preselectedPropertyId, properties]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [vData, lData, pData] = await Promise.all([
                visitsService.fetchVisits(),
                leadsService.fetchLeads(),
                propertiesService.fetchProperties()
            ]);
            setVisits(vData as Visit[]);
            setLeads(lData as Lead[]);
            setProperties(pData as Property[]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveVisit = async (visitData: Visit & { sync_google?: boolean }) => {
        try {
            setIsSyncing(true);
            const { sync_google, ...cleanVisit } = visitData;

            // 1. Google Sync
            if (sync_google) {
                try {
                    if (visitToEdit?.google_event_id) {
                        await googleCalendarService.updateVisitEvent(visitToEdit.google_event_id, cleanVisit);
                    } else {
                        const event = await googleCalendarService.createVisitEvent(cleanVisit);
                        cleanVisit.google_event_id = event.id;
                    }
                } catch (err) {
                    console.error('Failed to sync with Google:', err);
                }
            }

            // 2. Database Save
            const savedVisit = await visitsService.saveVisit(cleanVisit);

            // 3. UI Update
            if (visitToEdit) {
                setVisits(visits.map(v => v.id === savedVisit.id ? savedVisit : v));
            } else {
                setVisits([savedVisit, ...visits]);
            }

            setIsModalOpen(false);
            setVisitToEdit(null);
        } catch (error) {
            console.error('Error saving visit:', error);
            alert('Error al guardar la visita.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleStatusChange = async (visit: Visit, newStatus: VisitStatus) => {
        try {
            let updatedVisit = { ...visit, estado: newStatus, updated_at: new Date().toISOString() };

            if (newStatus === 'cancelada' && visit.google_event_id) {
                try {
                    const confirmCancel = window.confirm('¿Deseas eliminar también el evento de Google Calendar?');
                    if (confirmCancel) {
                        await googleCalendarService.deleteVisitEvent(visit.google_event_id);
                        updatedVisit.google_event_id = undefined;
                    }
                } catch (err) {
                    console.error('Failed to delete Google event:', err);
                }
            }

            const saved = await visitsService.saveVisit(updatedVisit);
            setVisits(visits.map(v => v.id === saved.id ? saved : v));
            setSelectedVisit(null);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const pipelineStages = [
        { id: 'agendada', label: 'Programadas', color: 'bg-indigo-50 text-indigo-600' },
        { id: 'confirmada', label: 'Confirmadas', color: 'bg-emerald-50 text-emerald-600' },
        { id: 'realizada', label: 'Realizadas', color: 'bg-slate-100 text-slate-500' }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in pb-16 transform-gpu">
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-3">Agenda Visitas</h1>
                    <p className="text-slate-400 font-bold text-xs md:text-base uppercase tracking-[0.2em]">Gestión de citas y recorridos presenciales.</p>
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="bg-slate-100/50 p-1.5 rounded-[1.8rem] flex shadow-inner border border-slate-100">
                        <button
                            onClick={() => setView('calendar')}
                            className={`p-4 rounded-2xl transition-all ${view === 'calendar' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                            <CalendarDays size={20} />
                        </button>
                        <button
                            onClick={() => setView('pipeline')}
                            className={`p-4 rounded-2xl transition-all ${view === 'pipeline' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                            <LayoutList size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setVisitToEdit(null);
                            setIsModalOpen(true);
                        }}
                        className="flex-1 md:flex-none bg-slate-900 text-white px-12 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} /> <span className="hidden sm:inline">{isSyncing ? 'Guardando...' : 'NUEVA VISITA'}</span><span className="sm:hidden">NUEVA</span>
                    </button>
                </div>
            </div>

            <VisitFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setVisitToEdit(null);
                }}
                onSave={handleSaveVisit}
                visitToEdit={visitToEdit}
                leads={leads}
                properties={properties}
            />

            {selectedVisit && (
                <VisitDetailPanel
                    visit={selectedVisit}
                    onClose={() => setSelectedVisit(null)}
                    onStatusChange={handleStatusChange}
                    onEdit={(v) => {
                        setVisitToEdit(v);
                        setIsModalOpen(true);
                        setSelectedVisit(null);
                    }}
                />
            )}

            {view === 'calendar' ? (
                <CalendarGrid visits={visits} onVisitClick={setSelectedVisit} />
            ) : (
                <div className="flex gap-8 overflow-x-auto pb-8 h-[calc(100vh-350px)] no-scrollbar px-4 md:px-0">
                    {pipelineStages.map(stage => (
                        <div key={stage.id} className="min-w-[300px] md:min-w-[400px] bg-slate-50/50 border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col shadow-inner">
                            <div className="flex justify-between items-center mb-8 px-4">
                                <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.2em]">{stage.label}</h3>
                                <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-slate-900 shadow-sm border border-slate-100">
                                    {visits.filter(v => v.estado === stage.id).length}
                                </span>
                            </div>
                            <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                                {visits.filter(v => v.estado === stage.id).map(visit => (
                                    <div key={visit.id} onClick={() => setSelectedVisit(visit)} className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl cursor-pointer transition-all border border-transparent hover:border-indigo-100 group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{visit.fecha} • {visit.hora}</div>
                                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                <ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-400" />
                                            </div>
                                        </div>
                                        <div className="font-black text-slate-900 text-base mb-2 tracking-tight">{visit.lead_nombre}</div>
                                        <div className="text-xs font-bold text-slate-400 truncate">{visit.property_titulo}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Visits;