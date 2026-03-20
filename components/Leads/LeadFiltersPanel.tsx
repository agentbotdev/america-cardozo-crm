import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, DollarSign, MapPin, Calendar, Filter, Users, Zap } from 'lucide-react';
import {
  TEMPERATURAS_LEAD,
  ETAPAS_PROCESO,
  TIPOS_OPERACION,
  TIPOS_INMUEBLE,
  ESTADOS_SEGUIMIENTO,
  VENDEDORES,
  FUENTES_LEAD,
  getLabel,
  getColor
} from '../../config/taxonomy';

export interface LeadFilters {
  searchText: string;
  temperaturas: string[];
  etapas: string[];
  operaciones: string[];
  tiposInmueble: string[];
  zonas: string[];
  presupuestoMin?: number;
  presupuestoMax?: number;
  estadosSeguimiento: string[];
  vendedores: string[];
  fuentes: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  sinRespuestaDias?: number;
  conVisitaProxima: boolean;
}

interface LeadFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  resultCount: number;
}

export const LeadFiltersPanel: React.FC<LeadFiltersPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultCount
}) => {
  const updateFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: keyof LeadFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as any);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchText: '',
      temperaturas: [],
      etapas: [],
      operaciones: [],
      tiposInmueble: [],
      zonas: [],
      estadosSeguimiento: [],
      vendedores: [],
      fuentes: [],
      conVisitaProxima: false
    });
  };

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
        const colorClass = showColors && option.color
          ? `bg-${option.color}-100 text-${option.color}-600 border-${option.color}-200`
          : 'bg-slate-100 text-slate-600 border-slate-200';

        return (
          <button
            key={option.value}
            onClick={() => onToggle(option.value)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
              isSelected
                ? showColors && option.color
                  ? `bg-${option.color}-500 text-white border-${option.color}-600 shadow-lg`
                  : 'bg-slate-900 text-white border-slate-900 shadow-lg'
                : `${colorClass} hover:border-slate-300`
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 w-full sm:w-[500px] lg:w-[600px] h-full bg-white shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
              <Filter size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Filtros Avanzados</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {resultCount} {resultCount === 1 ? 'lead encontrado' : 'leads encontrados'}
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
          {/* 1. Text Search */}
          <FilterSection title="Búsqueda de Texto">
            <div className="relative">
              <Search className="absolute left-4 top-4 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={filters.searchText}
                onChange={(e) => updateFilter('searchText', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </FilterSection>

          {/* 2. Temperatura */}
          <FilterSection title="Temperatura">
            <MultiSelectChips
              options={TEMPERATURAS_LEAD}
              selected={filters.temperaturas}
              onToggle={(value) => toggleArrayValue('temperaturas', value)}
              showColors={true}
            />
          </FilterSection>

          {/* 3. Etapa del Proceso */}
          <FilterSection title="Etapa del Proceso">
            <MultiSelectChips
              options={ETAPAS_PROCESO}
              selected={filters.etapas}
              onToggle={(value) => toggleArrayValue('etapas', value)}
            />
          </FilterSection>

          {/* 4. Tipo de Operación */}
          <FilterSection title="Tipo de Operación Buscada">
            <MultiSelectChips
              options={TIPOS_OPERACION}
              selected={filters.operaciones}
              onToggle={(value) => toggleArrayValue('operaciones', value)}
            />
          </FilterSection>

          {/* 5. Tipo de Inmueble */}
          <FilterSection title="Tipo de Inmueble Buscado">
            <div className="space-y-4">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Residencial</p>
              <MultiSelectChips
                options={TIPOS_INMUEBLE.filter(t => t.categoria === 'residencial')}
                selected={filters.tiposInmueble}
                onToggle={(value) => toggleArrayValue('tiposInmueble', value)}
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-4">Rural</p>
              <MultiSelectChips
                options={TIPOS_INMUEBLE.filter(t => t.categoria === 'rural')}
                selected={filters.tiposInmueble}
                onToggle={(value) => toggleArrayValue('tiposInmueble', value)}
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-4">Comercial</p>
              <MultiSelectChips
                options={TIPOS_INMUEBLE.filter(t => t.categoria === 'comercial')}
                selected={filters.tiposInmueble}
                onToggle={(value) => toggleArrayValue('tiposInmueble', value)}
              />
            </div>
          </FilterSection>

          {/* 6. Zona de Búsqueda */}
          <FilterSection title="Zona de Búsqueda">
            <input
              type="text"
              placeholder="Ej: Villa Carlos Paz, Córdoba Capital..."
              value={filters.zonas.join(', ')}
              onChange={(e) => updateFilter('zonas', e.target.value.split(',').map(z => z.trim()).filter(Boolean))}
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </FilterSection>

          {/* 7. Presupuesto */}
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
                    onChange={(e) => updateFilter('presupuestoMin', e.target.value ? Number(e.target.value) : undefined)}
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
                    onChange={(e) => updateFilter('presupuestoMax', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* 8. Estado de Seguimiento */}
          <FilterSection title="Estado de Seguimiento">
            <MultiSelectChips
              options={ESTADOS_SEGUIMIENTO}
              selected={filters.estadosSeguimiento}
              onToggle={(value) => toggleArrayValue('estadosSeguimiento', value)}
              showColors={true}
            />
          </FilterSection>

          {/* 9. Vendedor Asignado */}
          <FilterSection title="Vendedor Asignado">
            <div className="flex flex-wrap gap-2">
              {VENDEDORES.map(vendedor => {
                const isSelected = filters.vendedores.includes(vendedor.value);
                return (
                  <button
                    key={vendedor.value}
                    onClick={() => toggleArrayValue('vendedores', vendedor.value)}
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

          {/* 10. Fuente del Lead */}
          <FilterSection title="Fuente del Lead">
            <MultiSelectChips
              options={FUENTES_LEAD}
              selected={filters.fuentes}
              onToggle={(value) => toggleArrayValue('fuentes', value)}
            />
          </FilterSection>

          {/* 11. Rango de Fechas */}
          <FilterSection title="Rango de Fechas">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={filters.fechaDesde || ''}
                    onChange={(e) => updateFilter('fechaDesde', e.target.value)}
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
                    onChange={(e) => updateFilter('fechaHasta', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* 12. Filtros Especiales */}
          <FilterSection title="Filtros Especiales">
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="visita-proxima"
                  checked={filters.conVisitaProxima}
                  onChange={(e) => updateFilter('conVisitaProxima', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="visita-proxima" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Con visita próxima agendada
                </label>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">
                  Sin respuesta hace (días)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 7"
                  value={filters.sinRespuestaDias || ''}
                  onChange={(e) => updateFilter('sinRespuestaDias', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Limpiar Todo
          </button>
          <button
            onClick={onClose}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
          >
            Aplicar Filtros ({resultCount})
          </button>
        </div>
      </motion.div>
    </>
  );
};
