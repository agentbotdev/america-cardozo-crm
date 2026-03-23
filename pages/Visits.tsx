import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Visit, VisitStatus, Lead, Property } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, X, User, ChevronLeft, ChevronRight, Filter, CalendarDays, LayoutGrid, List as ListIcon, AlertCircle } from 'lucide-react';
import { visitsService } from '../services/visitsService';
import { leadsService } from '../services/leadsService';
import { propertiesService } from '../services/propertiesService';
import { motion, AnimatePresence } from 'framer-motion';
import { VENDEDORES, ESTADOS_VISITA, getVendedorIniciales, CALIFICACIONES_VISITA } from '../config/taxonomy';

// ══════════════════════════════════════════════════════════════════════════════
// HELPER: Get month calendar days
// ══════════════════════════════════════════════════════════════════════════════
const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: Date[] = [];

  // Previous month days (padding)
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
    days.push(prevDate);
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Next month days (padding to complete grid)
  const remainingDays = 42 - days.length; // 6 rows x 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: LeadSearchInput
// ══════════════════════════════════════════════════════════════════════════════
const LeadSearchInput: React.FC<{
  leads: Lead[];
  selectedId: string;
  onSelect: (lead: Lead) => void;
}> = ({ leads, selectedId, onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = leads.find(l => l.id === selectedId);

  const filtered = useMemo(
    () =>
      query.trim() === ''
        ? leads
        : leads.filter(
            l =>
              l.nombre.toLowerCase().includes(query.toLowerCase()) ||
              (l.email || '').toLowerCase().includes(query.toLowerCase()) ||
              (l.telefono || '').includes(query)
          ),
    [leads, query]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(o => !o)}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
      >
        {selected ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{selected.nombre}</p>
            <p className="text-xs text-slate-500">{selected.telefono}</p>
          </div>
        ) : (
          <>
            <User size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400 font-semibold">Seleccionar lead...</span>
          </>
        )}
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-slate-50">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none font-medium"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400 font-medium">
                No se encontraron leads
              </div>
            ) : (
              filtered.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onSelect(lead);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
                >
                  <p className="text-sm font-bold text-slate-900">{lead.nombre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lead.telefono}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: VisitFormModal (with fixed header/footer + scrollable body)
// ══════════════════════════════════════════════════════════════════════════════
const VisitFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: Visit) => void;
  visitToEdit?: Visit | null;
  leads: Lead[];
  properties: Property[];
  prefilledDate?: string; // For double-click on calendar day
}> = ({ isOpen, onClose, onSave, visitToEdit, leads, properties, prefilledDate }) => {
  const [formData, setFormData] = useState<Partial<Visit>>({
    lead_id: '',
    lead_nombre: '',
    property_id: '',
    property_titulo: '',
    fecha: prefilledDate || new Date().toISOString().split('T')[0],
    hora: '10:00',
    estado: 'pendiente',
    notas: '',
    vendedor_asignado: '',
  });

  useEffect(() => {
    if (visitToEdit) {
      setFormData(visitToEdit);
    } else if (prefilledDate) {
      setFormData(prev => ({ ...prev, fecha: prefilledDate }));
    } else {
      setFormData({
        lead_id: leads[0]?.id || '',
        lead_nombre: leads[0]?.nombre || '',
        property_id: '',
        property_titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        estado: 'pendiente',
        notas: '',
        vendedor_asignado: '',
      });
    }
  }, [visitToEdit, isOpen, leads, prefilledDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id || !formData.fecha || !formData.hora) {
      alert('Por favor completa Lead, Fecha y Hora');
      return;
    }
    onSave(formData as Visit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* HEADER - FIXED */}
        <div className="flex justify-between items-center p-8 pb-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">
            {visitToEdit ? 'Editar Visita' : 'Nueva Visita'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 pt-6">
          <form id="visit-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Lead */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Lead <span className="text-red-500">*</span>
              </label>
              <LeadSearchInput
                leads={leads}
                selectedId={formData.lead_id || ''}
                onSelect={l =>
                  setFormData({ ...formData, lead_id: l.id, lead_nombre: l.nombre })
                }
              />
            </div>

            {/* Propiedad */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Propiedad
              </label>
              <select
                value={formData.property_id}
                onChange={e =>
                  setFormData({
                    ...formData,
                    property_id: e.target.value,
                    property_titulo:
                      properties.find(p => p.id === e.target.value)?.titulo || '',
                  })
                }
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none hover:bg-slate-100 transition-colors"
              >
                <option value="">Seleccionar Propiedad...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendedor Asignado */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Vendedor Asignado
              </label>
              <select
                value={formData.vendedor_asignado || ''}
                onChange={e => setFormData({ ...formData, vendedor_asignado: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none hover:bg-slate-100 transition-colors"
              >
                <option value="">Sin asignar</option>
                {VENDEDORES.map(v => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none hover:bg-slate-100 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.hora}
                  onChange={e => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none hover:bg-slate-100 transition-colors"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value as VisitStatus })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none hover:bg-slate-100 transition-colors"
              >
                {ESTADOS_VISITA.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notas Previas */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Notas Previas
              </label>
              <textarea
                value={formData.notas}
                onChange={e => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Información adicional para la visita..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium resize-none outline-none hover:bg-slate-100 transition-colors"
              />
            </div>
          </form>
        </div>

        {/* FOOTER - FIXED */}
        <div className="p-8 pt-6 border-t border-slate-100">
          <button
            type="submit"
            form="visit-form"
            className="w-full py-4 text-white bg-slate-900 rounded-2xl font-black hover:bg-slate-800 transition-colors shadow-lg"
          >
            {visitToEdit ? 'Guardar Cambios' : 'Crear Visita'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: Calendar View (with double-click functionality)
// ══════════════════════════════════════════════════════════════════════════════
const CalendarView: React.FC<{
  visits: Visit[];
  onVisitClick: (v: Visit) => void;
  onDayDoubleClick: (date: string) => void;
  onDayWithVisitsDoubleClick: (visits: Visit[]) => void;
}> = ({ visits, onVisitClick, onDayDoubleClick, onDayWithVisitsDoubleClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getVisitsForDay = (date: Date): Visit[] => {
    const dateString = date.toISOString().split('T')[0];
    return visits.filter(v => v.fecha === dateString);
  };

  const handleDayClick = (date: Date, dayVisits: Visit[]) => {
    const dateString = date.toISOString().split('T')[0];

    if (clickTimer) {
      // Double click detected
      clearTimeout(clickTimer);
      setClickTimer(null);

      if (dayVisits.length === 0) {
        // Double click on empty day → open modal with pre-filled date
        onDayDoubleClick(dateString);
      } else {
        // Double click on day with visits → open side panel with list
        onDayWithVisitsDoubleClick(dayVisits);
      }
    } else {
      // First click, wait for potential second click
      const timer = setTimeout(() => {
        setClickTimer(null);
        // Single click does nothing for now
      }, 300);
      setClickTimer(timer);
    }
  };

  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-black text-slate-400 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, idx) => {
          const dateString = date.toISOString().split('T')[0];
          const isCurrentMonth = date.getMonth() === month;
          const isToday = dateString === todayString;
          const dayVisits = getVisitsForDay(date);

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(date, dayVisits)}
              className={`
                aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all
                ${isCurrentMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 text-slate-300'}
                ${isToday ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-100'}
                ${dayVisits.length > 0 ? 'hover:border-indigo-300' : 'hover:border-slate-200'}
              `}
            >
              <span
                className={`text-sm font-bold mb-1 ${
                  isToday ? 'text-indigo-600' : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {date.getDate()}
              </span>

              {/* Visit dots */}
              {dayVisits.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-center">
                  {dayVisits.slice(0, 3).map((visit, i) => {
                    const estadoColor =
                      ESTADOS_VISITA.find(e => e.value === visit.estado)?.color || 'gray';
                    const colorMap: { [key: string]: string } = {
                      blue: 'bg-blue-500',
                      indigo: 'bg-indigo-500',
                      emerald: 'bg-emerald-500',
                      red: 'bg-red-500',
                      gray: 'bg-gray-400',
                    };
                    return (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${colorMap[estadoColor] || 'bg-gray-400'}`}
                      />
                    );
                  })}
                  {dayVisits.length > 3 && (
                    <span className="text-[8px] font-black text-slate-400">
                      +{dayVisits.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          Pendiente
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          Confirmada
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          Realizada
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          Cancelada
        </div>
      </div>

      {visits.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-slate-400 font-medium text-sm">
            Sin visitas este mes. Hacé doble click en un día para agendar.
          </p>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: Day Visits Panel (side panel showing visits for a specific day)
// ══════════════════════════════════════════════════════════════════════════════
const DayVisitsPanel: React.FC<{
  visits: Visit[];
  onClose: () => void;
  onVisitClick: (v: Visit) => void;
}> = ({ visits, onClose, onVisitClick }) => {
  if (visits.length === 0) return null;

  const date = visits[0]?.fecha || '';
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Visitas del día</h2>
              <p className="text-sm text-slate-500 font-medium capitalize mt-1">{formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {visits
              .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
              .map(visit => {
                const estadoInfo = ESTADOS_VISITA.find(e => e.value === visit.estado);
                const colorMap: { [key: string]: string } = {
                  blue: 'bg-blue-50 text-blue-700 border-blue-200',
                  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  red: 'bg-red-50 text-red-700 border-red-200',
                  gray: 'bg-gray-50 text-gray-700 border-gray-200',
                };
                const badgeClass =
                  colorMap[estadoInfo?.color || 'gray'] || 'bg-gray-50 text-gray-700';

                return (
                  <div
                    key={visit.id}
                    onClick={() => {
                      onVisitClick(visit);
                      onClose();
                    }}
                    className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-indigo-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-lg font-black text-slate-900">{visit.hora} hs</span>
                      </div>
                      <span
                        className={`text-xs font-black uppercase px-3 py-1 rounded-full border-2 ${badgeClass}`}
                      >
                        {estadoInfo?.label}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 mb-1">{visit.lead_nombre}</p>
                    <p className="text-sm text-slate-500 mb-2">{visit.property_titulo}</p>

                    {visit.vendedor_asignado && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-[10px] font-black text-indigo-600">
                            {getVendedorIniciales(visit.vendedor_asignado)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {VENDEDORES.find(v => v.value === visit.vendedor_asignado)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: Kanban View (4 columns, mobile responsive with tabs)
// ══════════════════════════════════════════════════════════════════════════════
const KanbanView: React.FC<{
  visits: Visit[];
  onVisitClick: (v: Visit) => void;
}> = ({ visits, onVisitClick }) => {
  const [mobileTab, setMobileTab] = useState<string>('pendiente');

  const columns = useMemo(
    () => [
      { value: 'pendiente', label: 'Pendiente', color: 'bg-amber-500', textColor: 'text-amber-700' },
      { value: 'confirmada', label: 'Confirmada', color: 'bg-blue-500', textColor: 'text-blue-700' },
      { value: 'realizada', label: 'Realizada', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
      { value: 'cancelada', label: 'Cancelada', color: 'bg-red-500', textColor: 'text-red-700' },
    ],
    []
  );

  const getColumnVisits = (estado: string) => visits.filter(v => v.estado === estado);

  return (
    <>
      {/* MOBILE: Tabs */}
      <div className="md:hidden mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {columns.map(col => {
            const count = getColumnVisits(col.value).length;
            return (
              <button
                key={col.value}
                onClick={() => setMobileTab(col.value)}
                className={`
                  flex-shrink-0 px-4 py-3 rounded-xl font-black text-sm transition-all
                  ${
                    mobileTab === col.value
                      ? `${col.color} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-500'
                  }
                `}
              >
                {col.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Mobile List */}
        <div className="space-y-3 mt-4">
          {getColumnVisits(mobileTab).map(visit => (
            <VisitCard key={visit.id} visit={visit} onClick={() => onVisitClick(visit)} />
          ))}
          {getColumnVisits(mobileTab).length === 0 && (
            <div className="text-center py-12 text-slate-400 font-medium">
              No hay visitas en este estado
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP: Columns */}
      <div className="hidden md:flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => {
          const columnVisits = getColumnVisits(col.value);
          return (
            <div key={col.value} className="min-w-[320px] flex-shrink-0">
              {/* Column Header */}
              <div
                className={`${col.color} text-white rounded-t-2xl px-5 py-4 flex items-center justify-between`}
              >
                <h3 className="font-black uppercase text-sm tracking-wider">{col.label}</h3>
                <span className="bg-white/30 text-white font-black text-xs px-3 py-1 rounded-full">
                  {columnVisits.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="bg-slate-50/50 border-2 border-slate-100 border-t-0 rounded-b-2xl p-4 min-h-[500px]">
                <div className="space-y-3">
                  {columnVisits.map(visit => (
                    <VisitCard key={visit.id} visit={visit} onClick={() => onVisitClick(visit)} />
                  ))}
                  {columnVisits.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">
                      Sin visitas
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: VisitCard (used in Kanban)
// ══════════════════════════════════════════════════════════════════════════════
const VisitCard: React.FC<{ visit: Visit; onClick: () => void }> = ({ visit, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="font-black text-slate-900 text-base leading-tight">{visit.lead_nombre}</p>
        {visit.vendedor_asignado && (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-indigo-600">
              {getVendedorIniciales(visit.vendedor_asignado)}
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500 truncate mb-3">{visit.property_titulo || 'Sin propiedad'}</p>

      <div className="flex items-center gap-2 text-xs font-bold">
        <div className="flex items-center gap-1.5 text-slate-600">
          <CalendarIcon size={14} className="text-slate-400" />
          {new Date(visit.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
          })}
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5 text-indigo-600">
          <Clock size={14} className="text-indigo-400" />
          {visit.hora} hs
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: ListView (table)
// ══════════════════════════════════════════════════════════════════════════════
const ListView: React.FC<{
  visits: Visit[];
  onVisitClick: (v: Visit) => void;
}> = ({ visits, onVisitClick }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
              Lead
            </th>
            <th className="p-4 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
              Propiedad
            </th>
            <th className="p-4 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
              Fecha
            </th>
            <th className="p-4 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
              Hora
            </th>
            <th className="p-4 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
              Estado
            </th>
            <th className="p-4 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
              Vendedor
            </th>
          </tr>
        </thead>
        <tbody>
          {visits.map(visit => {
            const estadoInfo = ESTADOS_VISITA.find(e => e.value === visit.estado);
            const colorMap: { [key: string]: string } = {
              blue: 'bg-blue-50 text-blue-700',
              indigo: 'bg-indigo-50 text-indigo-700',
              emerald: 'bg-emerald-50 text-emerald-700',
              red: 'bg-red-50 text-red-700',
              gray: 'bg-gray-50 text-gray-700',
            };
            const badgeClass = colorMap[estadoInfo?.color || 'gray'] || 'bg-gray-50 text-gray-700';

            return (
              <tr
                key={visit.id}
                onClick={() => onVisitClick(visit)}
                className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="p-4 font-bold text-slate-900">{visit.lead_nombre}</td>
                <td className="p-4 text-sm text-slate-600">
                  {visit.property_titulo || 'Sin propiedad'}
                </td>
                <td className="p-4 text-sm font-bold text-slate-900">{visit.fecha}</td>
                <td className="p-4 text-sm font-bold text-indigo-600">{visit.hora} hs</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${badgeClass}`}
                  >
                    {estadoInfo?.label}
                  </span>
                </td>
                <td className="p-4">
                  {visit.vendedor_asignado ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-[10px] font-black text-indigo-600">
                          {getVendedorIniciales(visit.vendedor_asignado)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {VENDEDORES.find(v => v.value === visit.vendedor_asignado)?.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {visits.length === 0 && (
        <div className="py-16 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No hay visitas para mostrar</p>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: VisitDetailPanel (side panel with visit details + actions)
// ══════════════════════════════════════════════════════════════════════════════
const VisitDetailPanel: React.FC<{
  visit: Visit;
  onClose: () => void;
  onEdit: (v: Visit) => void;
  onStatusChange: (v: Visit, s: VisitStatus, nota?: string, calificacion?: string) => void;
}> = ({ visit, onClose, onEdit, onStatusChange }) => {
  const estadoInfo = ESTADOS_VISITA.find(e => e.value === visit.estado);

  const handleMarcarRealizada = () => {
    const nota = window.prompt('¿Cómo fue la visita? (Notas del resultado):');
    if (nota === null) return; // User cancelled

    const calificacion = window.prompt(
      'Calificación del lead:\n1) Muy Interesado\n2) Interesado\n3) Dudoso\n4) No Interesado\n\nIngresa el número:'
    );
    if (calificacion === null) return;

    const calificacionMap: { [key: string]: string } = {
      '1': 'muy_interesado',
      '2': 'interesado',
      '3': 'dudoso',
      '4': 'no_interesado',
    };

    const calificacionValue = calificacionMap[calificacion] || 'interesado';

    onStatusChange(visit, 'realizada', nota, calificacionValue);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">Detalle de Visita</h2>
            <button
              onClick={onClose}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Visit Info Card */}
          <div className="bg-slate-50 rounded-3xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-black text-xl text-slate-900 mb-1">{visit.lead_nombre}</h3>
                <p className="text-sm text-slate-600 font-medium">
                  {visit.property_titulo || 'Sin propiedad asignada'}
                </p>
              </div>
              {estadoInfo && (
                <span
                  className={`text-xs font-black uppercase px-3 py-1.5 rounded-full ${
                    {
                      blue: 'bg-blue-100 text-blue-700',
                      indigo: 'bg-indigo-100 text-indigo-700',
                      emerald: 'bg-emerald-100 text-emerald-700',
                      red: 'bg-red-100 text-red-700',
                      gray: 'bg-gray-100 text-gray-700',
                    }[estadoInfo.color] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {estadoInfo.label}
                </span>
              )}
            </div>

            <div className="space-y-3 mt-5">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon size={18} className="text-slate-400" />
                <span className="font-bold text-slate-900">
                  {new Date(visit.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={18} className="text-slate-400" />
                <span className="font-bold text-indigo-600">{visit.hora} hs</span>
              </div>
              {visit.vendedor_asignado && (
                <div className="flex items-center gap-3 text-sm">
                  <User size={18} className="text-slate-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-[10px] font-black text-indigo-600">
                        {getVendedorIniciales(visit.vendedor_asignado)}
                      </span>
                    </div>
                    <span className="font-medium text-slate-700">
                      {VENDEDORES.find(v => v.value === visit.vendedor_asignado)?.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {visit.notas && (
              <div className="mt-5 pt-5 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Notas</p>
                <p className="text-sm text-slate-700 font-medium">{visit.notas}</p>
              </div>
            )}

            {visit.nota_resultado && (
              <div className="mt-5 pt-5 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Resultado de la Visita</p>
                <p className="text-sm text-slate-700 font-medium">{visit.nota_resultado}</p>
              </div>
            )}

            {visit.calificacion_lead && (
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Calificación del Lead</p>
                <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700">
                  {CALIFICACIONES_VISITA.find(c => c.value === visit.calificacion_lead)?.label}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {visit.estado !== 'realizada' && visit.estado !== 'cancelada' && (
              <>
                <button
                  onClick={handleMarcarRealizada}
                  className="w-full py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black rounded-2xl transition-colors"
                >
                  Marcar como Realizada
                </button>
                {visit.estado !== 'confirmada' && (
                  <button
                    onClick={() => onStatusChange(visit, 'confirmada')}
                    className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-2xl transition-colors"
                  >
                    Confirmar Visita
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de cancelar esta visita?')) {
                      onStatusChange(visit, 'cancelada');
                    }
                  }}
                  className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-700 font-black rounded-2xl transition-colors"
                >
                  Cancelar Visita
                </button>
              </>
            )}

            <button
              onClick={() => {
                onEdit(visit);
                onClose();
              }}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl transition-colors"
            >
              Editar Visita
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Visits
// ══════════════════════════════════════════════════════════════════════════════
const Visits: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'kanban' | 'list'>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For calendar double-click
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);
  const [dayVisits, setDayVisits] = useState<Visit[] | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vData, lData, pData] = await Promise.all([
        visitsService.fetchVisits(),
        leadsService.fetchLeads(),
        propertiesService.fetchProperties(),
      ]);
      setVisits(vData as Visit[]);
      setLeads(lData as Lead[]);
      setProperties(pData as Property[]);
    } catch (err: any) {
      console.error('Error loading visits:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisit = async (v: Visit) => {
    try {
      await visitsService.saveVisit(v);
      await loadData();
      setVisitToEdit(null);
      setPrefilledDate(undefined);
    } catch (err: any) {
      console.error('Error saving visit:', err);
      alert('Error al guardar la visita: ' + err.message);
    }
  };

  const handleStatusChange = async (
    v: Visit,
    newStatus: VisitStatus,
    nota?: string,
    calificacion?: 'muy_interesado' | 'interesado' | 'dudoso' | 'no_interesado'
  ) => {
    try {
      const updatedVisit: Partial<Visit> = {
        ...v,
        estado: newStatus,
        ...(nota ? { nota_resultado: nota } : {}),
        ...(calificacion ? { calificacion_lead: calificacion } : {}),
      };
      await visitsService.saveVisit(updatedVisit as Visit);
      await loadData();
      setSelectedVisit(null);
    } catch (err: any) {
      console.error('Error updating visit status:', err);
      alert('Error al actualizar el estado: ' + err.message);
    }
  };

  const handleDayDoubleClick = (date: string) => {
    setPrefilledDate(date);
    setIsModalOpen(true);
  };

  const handleDayWithVisitsDoubleClick = (visitsForDay: Visit[]) => {
    setDayVisits(visitsForDay);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Cargando visitas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error al cargar visitas</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-16 h-full flex flex-col relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Agenda de Visitas</h1>
          <p className="text-slate-500 font-bold text-sm uppercase mt-1">
            {visits.length} visitas • {visits.filter(v => v.estado === 'pendiente' || v.estado === 'confirmada').length} próximas
          </p>
        </div>
        <div className="flex gap-4">
          {/* View Tabs - More visible with icons */}
          <div className="bg-white p-1.5 rounded-2xl border-2 border-slate-100 flex shadow-md">
            <button
              onClick={() => setView('calendar')}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all
                ${view === 'calendar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <CalendarDays size={18} />
              <span className="hidden sm:inline">Calendario</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all
                ${view === 'kanban' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all
                ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <ListIcon size={18} />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          <button
            onClick={() => {
              setVisitToEdit(null);
              setPrefilledDate(undefined);
              setIsModalOpen(true);
            }}
            className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">NUEVA</span>
          </button>
        </div>
      </div>

      {/* Views */}
      <div className="flex-1">
        {view === 'calendar' && (
          <CalendarView
            visits={visits}
            onVisitClick={setSelectedVisit}
            onDayDoubleClick={handleDayDoubleClick}
            onDayWithVisitsDoubleClick={handleDayWithVisitsDoubleClick}
          />
        )}
        {view === 'kanban' && <KanbanView visits={visits} onVisitClick={setSelectedVisit} />}
        {view === 'list' && <ListView visits={visits} onVisitClick={setSelectedVisit} />}
      </div>

      {/* Modals & Panels */}
      <VisitFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVisitToEdit(null);
          setPrefilledDate(undefined);
        }}
        onSave={handleSaveVisit}
        visitToEdit={visitToEdit}
        leads={leads}
        properties={properties}
        prefilledDate={prefilledDate}
      />

      <AnimatePresence>
        {selectedVisit && (
          <VisitDetailPanel
            visit={selectedVisit}
            onClose={() => setSelectedVisit(null)}
            onEdit={v => {
              setVisitToEdit(v);
              setIsModalOpen(true);
            }}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dayVisits && (
          <DayVisitsPanel
            visits={dayVisits}
            onClose={() => setDayVisits(null)}
            onVisitClick={v => {
              setDayVisits(null);
              setSelectedVisit(v);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Visits;
