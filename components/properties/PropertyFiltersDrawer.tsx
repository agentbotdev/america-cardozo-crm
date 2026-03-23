import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { TIPOS_INMUEBLE, VENDEDORES, TIPOS_OPERACION } from '../../config/taxonomy';
import { motion, AnimatePresence } from 'framer-motion';

export interface PropertyFilters {
  tipo_operacion?: string[];
  tipo_inmueble?: string[];
  zona?: string;
  precio_min?: number;
  precio_max?: number;
  ambientes?: number[];
  dormitorios?: number[];
  superficie_min?: number;
  superficie_max?: number;
  comodidades?: string[];
  estado?: string[];
  publicado_en?: string[];
  vendedor?: string;
}

interface PropertyFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  resultCount: number;
}

export const PropertyFiltersDrawer: React.FC<PropertyFiltersDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  resultCount
}) => {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: PropertyFilters = {};
    setLocalFilters(emptyFilters);
    onChange(emptyFilters);
  };

  const toggleArrayValue = (key: keyof PropertyFilters, value: string | number) => {
    const current = (localFilters[key] as any[]) || [];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setLocalFilters({ ...localFilters, [key]: newValue.length > 0 ? newValue : undefined });
  };

  const toggleCheckbox = (value: string) => {
    const current = localFilters.comodidades || [];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setLocalFilters({ ...localFilters, comodidades: newValue.length > 0 ? newValue : undefined });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <SlidersHorizontal size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Filtros</h2>
                  <p className="text-xs text-slate-400 font-semibold">{resultCount} propiedades</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tipo de Operación */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Tipo de Operación
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_OPERACION.map(tipo => {
                    const isSelected = localFilters.tipo_operacion?.includes(tipo.value);
                    return (
                      <button
                        key={tipo.value}
                        onClick={() => toggleArrayValue('tipo_operacion', tipo.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {tipo.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipo de Inmueble */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Tipo de Inmueble
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS_INMUEBLE.map(tipo => {
                    const isSelected = localFilters.tipo_inmueble?.includes(tipo.value);
                    return (
                      <button
                        key={tipo.value}
                        onClick={() => toggleArrayValue('tipo_inmueble', tipo.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {tipo.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zona / Barrio */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Zona / Barrio
                </label>
                <input
                  type="text"
                  value={localFilters.zona || ''}
                  onChange={e => setLocalFilters({ ...localFilters, zona: e.target.value || undefined })}
                  placeholder="Ej: Castelar, Morón, Ituzaingó..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Precio (USD)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={localFilters.precio_min || ''}
                      onChange={e => setLocalFilters({ ...localFilters, precio_min: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Mínimo"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={localFilters.precio_max || ''}
                      onChange={e => setLocalFilters({ ...localFilters, precio_max: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Máximo"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Ambientes */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Ambientes
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(num => {
                    const isSelected = localFilters.ambientes?.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleArrayValue('ambientes', num)}
                        className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {num}{num === 5 && '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dormitorios */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Dormitorios
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map(num => {
                    const isSelected = localFilters.dormitorios?.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleArrayValue('dormitorios', num)}
                        className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {num}{num === 4 && '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Superficie */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Superficie (m²)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={localFilters.superficie_min || ''}
                      onChange={e => setLocalFilters({ ...localFilters, superficie_min: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Mínimo"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={localFilters.superficie_max || ''}
                      onChange={e => setLocalFilters({ ...localFilters, superficie_max: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Máximo"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Comodidades */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Comodidades
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'pileta', label: 'Pileta' },
                    { value: 'parrilla', label: 'Parrilla' },
                    { value: 'jardin', label: 'Jardín' },
                    { value: 'terraza', label: 'Terraza' },
                    { value: 'balcon', label: 'Balcón' },
                    { value: 'cochera', label: 'Cochera' }
                  ].map(comodidad => {
                    const isSelected = localFilters.comodidades?.includes(comodidad.value);
                    return (
                      <label
                        key={comodidad.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-2 border-indigo-500'
                            : 'bg-slate-50 border-2 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCheckbox(comodidad.value)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{comodidad.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Estado de Publicación */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Estado
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'publicada', label: 'Publicada' },
                    { value: 'captacion', label: 'Captación' },
                    { value: 'reservada', label: 'Reservada' },
                    { value: 'vendida', label: 'Vendida' },
                    { value: 'borrador', label: 'Borrador' }
                  ].map(estado => {
                    const isSelected = localFilters.estado?.includes(estado.value);
                    return (
                      <button
                        key={estado.value}
                        onClick={() => toggleArrayValue('estado', estado.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {estado.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Publicado en */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Publicado en
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'zonaprop', label: 'Zonaprop' },
                    { value: 'argenprop', label: 'Argenprop' },
                    { value: 'mercadolibre', label: 'MercadoLibre' }
                  ].map(portal => {
                    const isSelected = localFilters.publicado_en?.includes(portal.value);
                    return (
                      <label
                        key={portal.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-2 border-indigo-500'
                            : 'bg-slate-50 border-2 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleArrayValue('publicado_en', portal.value)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{portal.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Vendedor Asignado */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                  Vendedor Asignado
                </label>
                <select
                  value={localFilters.vendedor || ''}
                  onChange={e => setLocalFilters({ ...localFilters, vendedor: e.target.value || undefined })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold bg-white"
                >
                  <option value="">Todos los vendedores</option>
                  {VENDEDORES.map(vendedor => (
                    <option key={vendedor.value} value={vendedor.value}>
                      {vendedor.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer - Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white transition-colors shadow-lg hover:shadow-xl"
              >
                Aplicar ({resultCount})
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
