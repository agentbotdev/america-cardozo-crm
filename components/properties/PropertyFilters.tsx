import React from 'react';
import { Search, MapPin, Building2, DollarSign, Home, BedDouble, Bath } from 'lucide-react';
import { PropertyType, OperationType } from '../../types';

export interface PropertyFiltersState {
  searchTerm: string;
  operationType: OperationType | 'todas';
  propertyTypes: PropertyType[];
  rooms: number | null;
  bathrooms: number | null;
  priceMin: number | null;
  priceMax: number | null;
  features: string[];
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<PropertyFiltersState>>;
  onClear: () => void;
  resultsCount: number;
}

const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa', icon: Home },
  { id: 'departamento', label: 'Departamento', icon: Building2 },
  { id: 'ph', label: 'PH', icon: Home },
  { id: 'lote', label: 'Lote/Terreno', icon: MapPin },
  { id: 'oficina', label: 'Oficina', icon: Building2 },
];

const FEATURES = [
  { id: 'cochera', label: 'Cochera' },
  { id: 'balcon', label: 'Balcón' },
  { id: 'terraza', label: 'Terraza' },
  { id: 'patio', label: 'Patio' },
  { id: 'pileta', label: 'Pileta' },
  { id: 'parrilla', label: 'Parrilla' },
  { id: 'seguridad_24hs', label: 'Seguridad 24hs' },
  { id: 'apto_profesional', label: 'Apto Profesional' },
  { id: 'acepta_mascotas', label: 'Apto Mascotas' },
];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ filters, setFilters, onClear, resultsCount }) => {
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

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-8 sticky top-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filtros</h3>
        <button onClick={onClear} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
          Limpiar
        </button>
      </div>

      {/* Operación */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operación</label>
        <div className="flex bg-slate-50 p-1 rounded-2xl flex-wrap">
          {['todas', 'venta', 'alquiler', 'temporario'].map(op => (
            <button
              key={op}
              onClick={() => setFilters(prev => ({ ...prev, operationType: op as any }))}
              className={`flex-1 py-2 px-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                filters.operationType === op ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de Propiedad */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Propiedad</label>
        <div className="flex flex-col gap-2">
          {PROPERTY_TYPES.map(type => {
            const Icon = type.icon;
            const isActive = filters.propertyTypes.includes(type.id as PropertyType);
            return (
              <button
                key={type.id}
                onClick={() => togglePropertyType(type.id as PropertyType)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                  isActive ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon size={14} />
                </div>
                <span className="text-xs font-bold">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Habitaciones y Baños */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dorms.</label>
          <div className="flex gap-1 justify-between">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setFilters(prev => ({ ...prev, rooms: prev.rooms === num ? null : num }))}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all border flex items-center justify-center ${
                  filters.rooms === num ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {num}{num === 4 && '+'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baños</label>
          <div className="flex gap-1 justify-between">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setFilters(prev => ({ ...prev, bathrooms: prev.bathrooms === num ? null : num }))}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all border flex items-center justify-center ${
                  filters.bathrooms === num ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {num}{num === 4 && '+'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Precio */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rango de Precio</label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="Desde"
              value={filters.priceMin || ''}
              onChange={e => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : null }))}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <span className="text-slate-300">-</span>
          <div className="relative flex-1">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="Hasta"
              value={filters.priceMax || ''}
              onChange={e => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : null }))}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Características</label>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map(feat => {
            const isActive = filters.features.includes(feat.id);
            return (
              <button
                key={feat.id}
                onClick={() => toggleFeature(feat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {feat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Resultados visualizados</span>
          <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded-full">{resultsCount} prop.</span>
        </div>
      </div>
    </div>
  );
};
