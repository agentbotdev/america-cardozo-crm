import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, DollarSign, Calendar, X, Home, Building } from 'lucide-react';
import { TEMPERATURAS_LEAD, ETAPAS_PROCESO, VENDEDORES, FUENTES_LEAD } from '../../config/taxonomy';

export interface ClientFiltersState {
  searchText: string;
  temperaturas: string[];
  etapas: string[];
  operaciones: string[];
  vendedores: string[];
  fuentes: string[];
  presupuestoMin?: number;
  presupuestoMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  scoreMin?: number;
  sinRespuestaDias?: number;
  conVisitaProxima: boolean;
}

interface ClientFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ClientFiltersState;
  onFilterChange: <K extends keyof ClientFiltersState>(key: K, value: ClientFiltersState[K]) => void;
  onToggleArrayValue: (key: keyof ClientFiltersState, value: string) => void;
  onClearAll: () => void;
  filteredCount: number;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</h4>
    {children}
  </div>
);

const MultiSelectChips: React.FC<{
  options: readonly { value: string; label: string; color?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  showColors?: boolean;
}> = ({ options, selected, onToggle, showColors = false }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(option => {
      const isSelected = selected.includes(option.value);
      return (
        <button
          key={option.value}
          onClick={() => onToggle(option.value)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
            isSelected
              ? showColors && option.color
                ? `bg-${option.color}-500 text-white border-${option.color}-600 shadow-lg`
                : 'bg-slate-900 text-white border-slate-900 shadow-lg'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const ClientFilters: React.FC<ClientFiltersProps> = ({
  isOpen, onClose, filters, onFilterChange, onToggleArrayValue, onClearAll, filteredCount
}) => {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 w-full sm:w-[500px] lg:w-[600px] h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
              <Filter size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                Filtros Avanzados
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {filteredCount} {filteredCount === 1 ? 'lead encontrado' : 'leads encontrados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          <FilterSection title="Búsqueda de Texto">
            <div className="relative">
              <Search className="absolute left-4 top-4 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={filters.searchText}
                onChange={(e) => onFilterChange('searchText', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </FilterSection>

          <FilterSection title="Temperatura">
            <MultiSelectChips
              options={TEMPERATURAS_LEAD}
              selected={filters.temperaturas}
              onToggle={(value) => onToggleArrayValue('temperaturas', value)}
              showColors={true}
            />
          </FilterSection>

          <FilterSection title="Etapa del Proceso">
            <MultiSelectChips
              options={ETAPAS_PROCESO}
              selected={filters.etapas}
              onToggle={(value) => onToggleArrayValue('etapas', value)}
            />
          </FilterSection>

          <FilterSection title="Tipo de Operación (combinable)">
            <div className="space-y-3">
              {[
                { value: 'venta', label: 'Venta', icon: Home },
                { value: 'alquiler', label: 'Alquiler', icon: Building },
                { value: 'inversion', label: 'Inversión', icon: DollarSign }
              ].map(op => (
                <div key={op.value} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id={`op-${op.value}`}
                    checked={filters.operaciones.includes(op.value)}
                    onChange={() => onToggleArrayValue('operaciones', op.value)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <op.icon size={18} className="text-slate-400" />
                  <label htmlFor={`op-${op.value}`} className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                    {op.label}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Vendedor Asignado">
            <div className="flex flex-wrap gap-2">
              {VENDEDORES.map(vendedor => {
                const isSelected = filters.vendedores.includes(vendedor.value);
                return (
                  <button
                    key={vendedor.value}
                    onClick={() => onToggleArrayValue('vendedores', vendedor.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {vendedor.iniciales}
                    </div>
                    {vendedor.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Fuente del Lead">
            <MultiSelectChips
              options={FUENTES_LEAD}
              selected={filters.fuentes}
              onToggle={(value) => onToggleArrayValue('fuentes', value)}
            />
          </FilterSection>

          <FilterSection title="Presupuesto (USD)">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Mínimo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.presupuestoMin || ''}
                    onChange={(e) => onFilterChange('presupuestoMin', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Máximo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.presupuestoMax || ''}
                    onChange={(e) => onFilterChange('presupuestoMax', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Fecha de Creación">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={filters.fechaDesde || ''}
                    onChange={(e) => onFilterChange('fechaDesde', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={filters.fechaHasta || ''}
                    onChange={(e) => onFilterChange('fechaHasta', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Score Mínimo">
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreMin || 0}
                onChange={(e) => onFilterChange('scoreMin', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">0</span>
                <span className="text-2xl font-black text-slate-900">{filters.scoreMin || 0}</span>
                <span className="text-xs font-bold text-slate-400">100</span>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Filtros Especiales">
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="visita-proxima-clients"
                  checked={filters.conVisitaProxima}
                  onChange={(e) => onFilterChange('conVisitaProxima', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="visita-proxima-clients" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Con visita próxima agendada
                </label>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">
                  Sin respuesta hace (días)
                </label>
                <select
                  value={filters.sinRespuestaDias || ''}
                  onChange={(e) => onFilterChange('sinRespuestaDias', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="3">Más de 3 días</option>
                  <option value="7">Más de 7 días</option>
                  <option value="15">Más de 15 días</option>
                  <option value="30">Más de 30 días</option>
                </select>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
          <button
            onClick={onClearAll}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Limpiar Todo
          </button>
          <button
            onClick={onClose}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
          >
            Aplicar Filtros ({filteredCount})
          </button>
        </div>
      </motion.div>
    </>
  );
};
