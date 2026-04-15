import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import {
  TEMPERATURAS_LEAD,
  ETAPAS_PROCESO,
  VENDEDORES,
  FUENTES_LEAD,
} from '../../config/taxonomy';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AdvancedFilters {
  searchText: string;
  temperaturas: string[];
  etapas: string[];
  operaciones: string[]; // 'venta' | 'alquiler' | 'inversion' | 'temporario'
  vendedores: string[];
  fuentes: string[];
  presupuestoVentaMin?: number;
  presupuestoVentaMax?: number;
  presupuestoAlqMin?: number;
  presupuestoAlqMax?: number;
  scoreMin?: number;
  conVisitaProxima: boolean;
  inactividadDias?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  etiquetas: string[];
}

export const INITIAL_ADVANCED_FILTERS: AdvancedFilters = {
  searchText: '',
  temperaturas: [],
  etapas: [],
  operaciones: [],
  vendedores: [],
  fuentes: [],
  conVisitaProxima: false,
  etiquetas: [],
};

export function countActiveAdvancedFilters(f: AdvancedFilters): number {
  let n = 0;
  if (f.searchText.trim()) n++;
  if (f.temperaturas.length) n++;
  if (f.etapas.length) n++;
  if (f.operaciones.length) n++;
  if (f.vendedores.length) n++;
  if (f.fuentes.length) n++;
  if (f.presupuestoVentaMin !== undefined || f.presupuestoVentaMax !== undefined) n++;
  if (f.presupuestoAlqMin !== undefined || f.presupuestoAlqMax !== undefined) n++;
  if (f.scoreMin !== undefined) n++;
  if (f.conVisitaProxima) n++;
  if (f.inactividadDias !== undefined) n++;
  if (f.fechaDesde || f.fechaHasta) n++;
  return n;
}

export interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  module: 'oportunidades' | 'clientes' | 'propiedades';
  currentFilters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  onReset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  activeClass?: string;
}

const FilterPill: React.FC<FilterPillProps> = ({
  label,
  active,
  onClick,
  activeClass = 'bg-indigo-600 text-white shadow-md border-indigo-600',
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
      active ? activeClass : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-slate-100'
    }`}
  >
    {label}
  </button>
);

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">{title}</h3>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const INACTIVIDAD_PRESETS = [
  { label: '+7 días', value: 7 },
  { label: '+15 días', value: 15 },
  { label: '+30 días', value: 30 },
  { label: '+60 días', value: 60 },
];

const FECHA_PRESETS = [
  { label: 'Hoy', days: 0 },
  { label: 'Últimos 7d', days: 7 },
  { label: 'Últimos 30d', days: 30 },
  { label: 'Últimos 90d', days: 90 },
];

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  isOpen,
  onClose,
  module,
  currentFilters,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(currentFilters);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
    }
  }, [isOpen]); // intentionally only on isOpen change

  // Toggle helper for array fields
  const toggleArr = useCallback(
    (field: keyof AdvancedFilters, val: string) => {
      setLocalFilters(prev => {
        const arr = (prev[field] as string[]) || [];
        return {
          ...prev,
          [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
        };
      });
    },
    []
  );

  // Real-time count with 300ms debounce
  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoadingCount(true);
      try {
        let query = supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        if (module === 'clientes') {
          query = query.eq('es_cliente', true);
        }

        if (localFilters.searchText.trim()) {
          const q = `%${localFilters.searchText.trim()}%`;
          query = query.or(`nombre.ilike.${q},email.ilike.${q},telefono.ilike.${q}`);
        }

        if (localFilters.temperaturas.length > 0) {
          query = query.in('temperatura', localFilters.temperaturas);
        }

        if (localFilters.etapas.length > 0) {
          query = query.in('etapa_proceso', localFilters.etapas);
        }

        if (localFilters.vendedores.length > 0) {
          query = query.in('vendedor_asignado_nombre', localFilters.vendedores);
        }

        if (localFilters.fuentes.length > 0) {
          query = query.in('fuente_consulta', localFilters.fuentes);
        }

        if (localFilters.operaciones.length > 0) {
          const orParts = localFilters.operaciones
            .map(op => {
              if (op === 'venta') return 'busca_venta.eq.true';
              if (op === 'alquiler') return 'busca_alquiler.eq.true';
              if (op === 'inversion') return 'busca_inversion.eq.true';
              if (op === 'temporario') return 'busca_temporario.eq.true';
              return null;
            })
            .filter(Boolean)
            .join(',');
          if (orParts) query = query.or(orParts);
        }

        if (localFilters.presupuestoVentaMin !== undefined) {
          query = query.gte('venta_presupuesto_max', localFilters.presupuestoVentaMin);
        }
        if (localFilters.presupuestoVentaMax !== undefined) {
          query = query.lte('venta_presupuesto_max', localFilters.presupuestoVentaMax);
        }
        if (localFilters.presupuestoAlqMin !== undefined) {
          query = query.gte('alq_presupuesto_max', localFilters.presupuestoAlqMin);
        }
        if (localFilters.presupuestoAlqMax !== undefined) {
          query = query.lte('alq_presupuesto_max', localFilters.presupuestoAlqMax);
        }

        if (localFilters.scoreMin !== undefined) {
          query = query.gte('score', localFilters.scoreMin);
        }

        if (localFilters.inactividadDias !== undefined) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - localFilters.inactividadDias);
          query = query.lte('updated_at', cutoff.toISOString());
        }

        if (localFilters.fechaDesde) {
          query = query.gte('created_at', localFilters.fechaDesde);
        }
        if (localFilters.fechaHasta) {
          query = query.lte('created_at', localFilters.fechaHasta + 'T23:59:59');
        }

        if (localFilters.conVisitaProxima) {
          query = query.gte('proxima_visita', new Date().toISOString());
        }

        const { count } = await query;
        setResultCount(count ?? 0);
      } catch {
        setResultCount(null);
      } finally {
        setLoadingCount(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localFilters, isOpen, module]);

  const handleApplyFechaPreset = (days: number) => {
    const today = new Date();
    const fechaHasta = today.toISOString().split('T')[0];
    if (days === 0) {
      setLocalFilters(prev => ({ ...prev, fechaDesde: fechaHasta, fechaHasta }));
    } else {
      const from = new Date();
      from.setDate(from.getDate() - days);
      setLocalFilters(prev => ({
        ...prev,
        fechaDesde: from.toISOString().split('T')[0],
        fechaHasta,
      }));
    }
  };

  const handleReset = () => {
    setLocalFilters(INITIAL_ADVANCED_FILTERS);
    onReset();
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const activeCount = countActiveAdvancedFilters(localFilters);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="afp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="afp-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full z-50 w-full md:w-[420px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-indigo-600" />
                <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                  Filtros avanzados
                </h2>
                {activeCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-7">

              {/* BÚSQUEDA DE TEXTO */}
              <FilterSection title="Búsqueda">
                <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all">
                  <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nombre, email, teléfono..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-bold placeholder:text-slate-300"
                    value={localFilters.searchText}
                    onChange={e =>
                      setLocalFilters(prev => ({ ...prev, searchText: e.target.value }))
                    }
                  />
                  {localFilters.searchText && (
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, searchText: '' }))}
                      className="ml-1 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </FilterSection>

              {/* TEMPERATURA */}
              <FilterSection title="Temperatura">
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    label="🧊 Frío"
                    active={localFilters.temperaturas.includes('frio')}
                    onClick={() => toggleArr('temperaturas', 'frio')}
                    activeClass="bg-blue-500 text-white border-blue-500 shadow-md"
                  />
                  <FilterPill
                    label="🌡 Tibio"
                    active={localFilters.temperaturas.includes('tibio')}
                    onClick={() => toggleArr('temperaturas', 'tibio')}
                    activeClass="bg-orange-500 text-white border-orange-500 shadow-md"
                  />
                  <FilterPill
                    label="🔥 Caliente"
                    active={localFilters.temperaturas.includes('caliente')}
                    onClick={() => toggleArr('temperaturas', 'caliente')}
                    activeClass="bg-red-500 text-white border-red-500 shadow-md"
                  />
                  <FilterPill
                    label="⚡ Ultra caliente"
                    active={localFilters.temperaturas.includes('ultra')}
                    onClick={() => toggleArr('temperaturas', 'ultra')}
                    activeClass="bg-rose-600 text-white border-rose-600 shadow-md"
                  />
                </div>
              </FilterSection>

              {/* ETAPA */}
              <FilterSection title="Etapa del proceso">
                <div className="flex flex-wrap gap-2">
                  {ETAPAS_PROCESO.map(e => (
                    <FilterPill
                      key={e.value}
                      label={e.label}
                      active={localFilters.etapas.includes(e.value)}
                      onClick={() => toggleArr('etapas', e.value)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* OPERACIÓN */}
              <FilterSection title="Tipo de operación">
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'venta', label: 'Venta' },
                    { value: 'alquiler', label: 'Alquiler' },
                    { value: 'inversion', label: 'Inversión' },
                    { value: 'temporario', label: 'Temporario' },
                  ].map(op => (
                    <FilterPill
                      key={op.value}
                      label={op.label}
                      active={localFilters.operaciones.includes(op.value)}
                      onClick={() => toggleArr('operaciones', op.value)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* VENDEDOR */}
              <FilterSection title="Vendedor asignado">
                <div className="flex flex-wrap gap-2">
                  {VENDEDORES.map(v => {
                    const isActive = localFilters.vendedores.includes(v.value);
                    return (
                      <button
                        key={v.value}
                        onClick={() => toggleArr('vendedores', v.value)}
                        title={v.label}
                        className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border relative ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {v.iniciales}
                        {isActive && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check size={8} className="text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* FUENTE */}
              <FilterSection title="Fuente de consulta">
                <div className="flex flex-wrap gap-2">
                  {FUENTES_LEAD.map(f => (
                    <FilterPill
                      key={f.value}
                      label={f.label}
                      active={localFilters.fuentes.includes(f.value)}
                      onClick={() => toggleArr('fuentes', f.value)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* PRESUPUESTO VENTA */}
              <FilterSection title="Presupuesto venta (USD)">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      value={localFilters.presupuestoVentaMin ?? ''}
                      onChange={e =>
                        setLocalFilters(prev => ({
                          ...prev,
                          presupuestoVentaMin: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                  <div className="text-slate-300 font-black text-xs mt-4">—</div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                      Máximo
                    </label>
                    <input
                      type="number"
                      placeholder="∞"
                      className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      value={localFilters.presupuestoVentaMax ?? ''}
                      onChange={e =>
                        setLocalFilters(prev => ({
                          ...prev,
                          presupuestoVentaMax: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                </div>
              </FilterSection>

              {/* PRESUPUESTO ALQUILER */}
              <FilterSection title="Presupuesto alquiler (ARS/mes)">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      value={localFilters.presupuestoAlqMin ?? ''}
                      onChange={e =>
                        setLocalFilters(prev => ({
                          ...prev,
                          presupuestoAlqMin: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                  <div className="text-slate-300 font-black text-xs mt-4">—</div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                      Máximo
                    </label>
                    <input
                      type="number"
                      placeholder="∞"
                      className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      value={localFilters.presupuestoAlqMax ?? ''}
                      onChange={e =>
                        setLocalFilters(prev => ({
                          ...prev,
                          presupuestoAlqMax: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                </div>
              </FilterSection>

              {/* FECHA DE ENTRADA */}
              <FilterSection title="Fecha de entrada">
                <div className="flex flex-wrap gap-2 mb-3">
                  {FECHA_PRESETS.map(p => {
                    const today = new Date().toISOString().split('T')[0];
                    const from =
                      p.days === 0
                        ? today
                        : (() => {
                            const d = new Date();
                            d.setDate(d.getDate() - p.days);
                            return d.toISOString().split('T')[0];
                          })();
                    const isActive =
                      localFilters.fechaDesde === from && localFilters.fechaHasta === today;
                    return (
                      <FilterPill
                        key={p.label}
                        label={p.label}
                        active={isActive}
                        onClick={() => handleApplyFechaPreset(p.days)}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                      Desde
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      value={localFilters.fechaDesde ?? ''}
                      onChange={e =>
                        setLocalFilters(prev => ({
                          ...prev,
                          fechaDesde: e.target.value || undefined,
                        }))
                      }
                    />
                  </div>
                  <div className="text-slate-300 font-black text-xs mt-4">—</div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                      Hasta
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      value={localFilters.fechaHasta ?? ''}
                      onChange={e =>
                        setLocalFilters(prev => ({
                          ...prev,
                          fechaHasta: e.target.value || undefined,
                        }))
                      }
                    />
                  </div>
                </div>
              </FilterSection>

              {/* INACTIVIDAD */}
              <FilterSection title="Inactividad (sin actualizar)">
                <div className="flex flex-wrap gap-2">
                  {INACTIVIDAD_PRESETS.map(p => (
                    <FilterPill
                      key={p.value}
                      label={p.label}
                      active={localFilters.inactividadDias === p.value}
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          inactividadDias:
                            prev.inactividadDias === p.value ? undefined : p.value,
                        }))
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* SCORE MÍNIMO */}
              <FilterSection title="Score mínimo">
                <div className="flex flex-wrap gap-2">
                  {[20, 40, 60, 80].map(s => (
                    <FilterPill
                      key={s}
                      label={`≥ ${s}`}
                      active={localFilters.scoreMin === s}
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          scoreMin: prev.scoreMin === s ? undefined : s,
                        }))
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* VISITA PRÓXIMA */}
              <FilterSection title="Visita próxima agendada">
                <button
                  onClick={() =>
                    setLocalFilters(prev => ({
                      ...prev,
                      conVisitaProxima: !prev.conVisitaProxima,
                    }))
                  }
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all w-full text-left ${
                    localFilters.conVisitaProxima
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${
                      localFilters.conVisitaProxima
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {localFilters.conVisitaProxima && (
                      <Check size={11} className="text-white" />
                    )}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Solo con visita próxima agendada
                  </span>
                </button>
              </FilterSection>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-5 border-t border-slate-100 bg-white">
              {/* Result count */}
              <div className="text-center mb-4 h-5">
                {loadingCount ? (
                  <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest animate-pulse">
                    Calculando...
                  </p>
                ) : resultCount !== null ? (
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                    <span className="text-indigo-600 text-sm">{resultCount}</span>{' '}
                    {module === 'clientes' ? 'cliente' : 'oportunidad'}
                    {resultCount !== 1 ? 's' : ''} encontrad
                    {resultCount !== 1 ? 'as' : 'a'}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                  <Check size={13} />
                  Aplicar filtros
                  {activeCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdvancedFilterPanel;
