import React, { useState } from 'react';
import { ChevronDown, MapPin, Building2, DollarSign, Home, BedDouble, Bath, Ruler, Calendar, Tag, ArrowUpDown, RotateCcw } from 'lucide-react';
import { PropertyType, OperationType, PropertyStatus } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

export interface PropertyFiltersState {
  searchTerm: string;
  operationType: OperationType | 'todas';
  propertyTypes: PropertyType[];
  rooms: number | null;
  bathrooms: number | null;
  priceMin: number | null;
  priceMax: number | null;
  features: string[];
  // New fields
  moneda: 'USD' | 'ARS' | 'todas';
  barrio: string;
  superficieMin: number | null;
  superficieMax: number | null;
  antiguedadRange: string | null;
  estadoPublicacion: PropertyStatus[];
  sortBy: string;
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<PropertyFiltersState>>;
  onClear: () => void;
  resultsCount: number;
  availableBarrios?: string[];
}

// --- Section wrapper with collapse ---
const FilterSection = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0 pb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
            <Icon size={14} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{title}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: 'casa', label: 'Casa' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'ph', label: 'PH' },
  { id: 'duplex', label: 'Duplex' },
  { id: 'local', label: 'Local' },
  { id: 'lote', label: 'Lote/Terreno' },
  { id: 'oficina', label: 'Oficina' },
  { id: 'cochera', label: 'Cochera' },
  { id: 'campo', label: 'Campo' },
  { id: 'otro', label: 'Otro' },
];

const STATUS_OPTIONS: { id: PropertyStatus; label: string; color: string }[] = [
  { id: 'publicada', label: 'Publicada', color: 'emerald' },
  { id: 'reservada', label: 'Reservada', color: 'orange' },
  { id: 'vendida', label: 'Vendida', color: 'slate' },
  { id: 'alquilada', label: 'Alquilada', color: 'purple' },
  { id: 'borrador', label: 'Borrador', color: 'slate' },
  { id: 'captacion', label: 'Captación', color: 'blue' },
];

const FEATURES = [
  { id: 'cochera', label: 'Cochera' },
  { id: 'balcon', label: 'Balcón' },
  { id: 'terraza', label: 'Terraza' },
  { id: 'patio', label: 'Patio' },
  { id: 'pileta', label: 'Pileta' },
  { id: 'parrilla', label: 'Parrilla' },
  { id: 'seguridad_24hs', label: 'Seg. 24hs' },
  { id: 'apto_profesional', label: 'Apto Prof.' },
  { id: 'acepta_mascotas', label: 'Mascotas' },
  { id: 'ascensor', label: 'Ascensor' },
  { id: 'aire_acondicionado', label: 'A/C' },
  { id: 'calefaccion', label: 'Calefacción' },
  { id: 'apto_credito', label: 'Apto Crédito' },
];

const ANTIGUEDAD_OPTIONS = [
  { id: '0-5', label: 'A estrenar (0-5)' },
  { id: '6-15', label: '6 a 15 años' },
  { id: '16-30', label: '16 a 30 años' },
  { id: '30+', label: 'Más de 30 años' },
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Más recientes' },
  { id: 'oldest', label: 'Más antiguos' },
  { id: 'price-asc', label: 'Precio ↑' },
  { id: 'price-desc', label: 'Precio ↓' },
  { id: 'surface-desc', label: 'Mayor superficie' },
];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters, setFilters, onClear, resultsCount, availableBarrios = []
}) => {
  const togglePropertyType = (type: PropertyType) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleStatus = (status: PropertyStatus) => {
    setFilters(prev => ({
      ...prev,
      estadoPublicacion: prev.estadoPublicacion.includes(status)
        ? prev.estadoPublicacion.filter(s => s !== status)
        : [...prev.estadoPublicacion, status]
    }));
  };

  const activeCount = [
    filters.operationType !== 'todas' ? 1 : 0,
    filters.propertyTypes.length,
    filters.barrio ? 1 : 0,
    (filters.priceMin || filters.priceMax) ? 1 : 0,
    filters.moneda !== 'todas' ? 1 : 0,
    (filters.superficieMin || filters.superficieMax) ? 1 : 0,
    filters.rooms ? 1 : 0,
    filters.bathrooms ? 1 : 0,
    filters.antiguedadRange ? 1 : 0,
    filters.features.length,
    filters.estadoPublicacion.length,
    filters.sortBy ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-1">
      {/* Header with clear + count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900">{resultsCount}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">resultados</span>
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors">
            <RotateCcw size={12} />
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      {/* 1. Tipo Operación */}
      <FilterSection title="Operación" icon={Tag} defaultOpen={true}>
        <div className="flex bg-slate-50 p-1 rounded-2xl flex-wrap gap-0.5">
          {['todas', 'venta', 'alquiler', 'temporario', 'inversion'].map(op => (
            <button
              key={op}
              onClick={() => setFilters(prev => ({ ...prev, operationType: op as OperationType | 'todas' }))}
              className={`flex-1 py-2 px-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all min-w-[60px] ${
                filters.operationType === op ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {op === 'todas' ? 'Todas' : op === 'inversion' ? 'Inv.' : op.charAt(0).toUpperCase() + op.slice(1)}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* 2. Tipo Propiedad */}
      <FilterSection title="Tipo Propiedad" icon={Home} defaultOpen={true}>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map(type => {
            const isActive = filters.propertyTypes.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => togglePropertyType(type.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* 3. Ubicación */}
      <FilterSection title="Ubicación" icon={MapPin} defaultOpen={false}>
        <input
          type="text"
          placeholder="Barrio, zona o ciudad..."
          value={filters.barrio}
          onChange={e => setFilters(prev => ({ ...prev, barrio: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300"
        />
        {availableBarrios.length > 0 && filters.barrio && (
          <div className="flex flex-wrap gap-1 mt-2">
            {availableBarrios
              .filter(b => b.toLowerCase().includes(filters.barrio.toLowerCase()))
              .slice(0, 6)
              .map(b => (
                <button
                  key={b}
                  onClick={() => setFilters(prev => ({ ...prev, barrio: b }))}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {b}
                </button>
              ))}
          </div>
        )}
      </FilterSection>

      {/* 4. Precio */}
      <FilterSection title="Rango Precio" icon={DollarSign} defaultOpen={true}>
        <div className="flex items-center gap-2 mb-3">
          {(['todas', 'USD', 'ARS'] as const).map(m => (
            <button
              key={m}
              onClick={() => setFilters(prev => ({ ...prev, moneda: m }))}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                filters.moneda === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
            >
              {m === 'todas' ? 'Todas' : m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="number"
              placeholder="Desde"
              value={filters.priceMin || ''}
              onChange={e => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : null }))}
              className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <span className="text-slate-200 text-xs">—</span>
          <div className="relative flex-1">
            <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="number"
              placeholder="Hasta"
              value={filters.priceMax || ''}
              onChange={e => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : null }))}
              className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </FilterSection>

      {/* 5. Superficie */}
      <FilterSection title="Superficie (m²)" icon={Ruler} defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filters.superficieMin || ''}
            onChange={e => setFilters(prev => ({ ...prev, superficieMin: e.target.value ? Number(e.target.value) : null }))}
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <span className="text-slate-200 text-xs">—</span>
          <input
            type="number"
            placeholder="Máx"
            value={filters.superficieMax || ''}
            onChange={e => setFilters(prev => ({ ...prev, superficieMax: e.target.value ? Number(e.target.value) : null }))}
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </FilterSection>

      {/* 6. Dormitorios + Baños */}
      <FilterSection title="Ambientes" icon={BedDouble} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dorms.</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setFilters(prev => ({ ...prev, rooms: prev.rooms === num ? null : num }))}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                    filters.rooms === num ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {num}{num === 4 && '+'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Baños</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setFilters(prev => ({ ...prev, bathrooms: prev.bathrooms === num ? null : num }))}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                    filters.bathrooms === num ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {num}{num === 4 && '+'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* 7. Antigüedad */}
      <FilterSection title="Antigüedad" icon={Calendar} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {ANTIGUEDAD_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilters(prev => ({ ...prev, antiguedadRange: prev.antiguedadRange === opt.id ? null : opt.id }))}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                filters.antiguedadRange === opt.id ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* 8. Características */}
      <FilterSection title="Características" icon={Building2} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {FEATURES.map(feat => {
            const isActive = filters.features.includes(feat.id);
            return (
              <button
                key={feat.id}
                onClick={() => toggleFeature(feat.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {feat.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* 9. Estado Publicación */}
      <FilterSection title="Estado" icon={Tag} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(status => {
            const isActive = filters.estadoPublicacion.includes(status.id);
            return (
              <button
                key={status.id}
                onClick={() => toggleStatus(status.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* 10. Ordenar */}
      <FilterSection title="Ordenar por" icon={ArrowUpDown} defaultOpen={false}>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilters(prev => ({ ...prev, sortBy: prev.sortBy === opt.id ? '' : opt.id }))}
              className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                filters.sortBy === opt.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};
