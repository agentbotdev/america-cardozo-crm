import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, RotateCcw, Check, SlidersHorizontal, Plus } from 'lucide-react';
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

  // ── LEADS / CLIENTES ──────────────────────────────────
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

  // ── PROPIEDADES ───────────────────────────────────────
  tiposPropiedad: string[];      // 'departamento' | 'casa' | 'ph' | 'duplex' | 'local' | 'lote' | 'oficina' | 'cochera'
  tipoOperacionProp: string[];   // 'venta' | 'alquiler' | 'temporario'
  barrios: string[];             // ilike filters on barrio column
  portales: string[];            // 'zonaprop' | 'argenprop' | 'mercadolibre' | 'web_america'
  precioVentaMin?: number;
  precioVentaMax?: number;
  precioAlqMin?: number;
  precioAlqMax?: number;
  ambientesMin?: number;
  dormitoriosMin?: number;
  superficieMin?: number;
  superficieMax?: number;
  fechaPubDesde?: string;
  fechaPubHasta?: string;
}

export const INITIAL_ADVANCED_FILTERS: AdvancedFilters = {
  searchText: '',
  // Leads / Clientes
  temperaturas: [],
  etapas: [],
  operaciones: [],
  vendedores: [],
  fuentes: [],
  conVisitaProxima: false,
  etiquetas: [],
  // Propiedades
  tiposPropiedad: [],
  tipoOperacionProp: [],
  barrios: [],
  portales: [],
};

export function countActiveAdvancedFilters(f: AdvancedFilters): number {
  let n = 0;
  if (f.searchText.trim()) n++;
  // Leads / Clientes
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
  // Propiedades
  if (f.tiposPropiedad?.length) n++;
  if (f.tipoOperacionProp?.length) n++;
  if (f.barrios?.length) n++;
  if (f.portales?.length) n++;
  if (f.precioVentaMin !== undefined || f.precioVentaMax !== undefined) n++;
  if (f.precioAlqMin !== undefined || f.precioAlqMax !== undefined) n++;
  if (f.ambientesMin !== undefined) n++;
  if (f.dormitoriosMin !== undefined) n++;
  if (f.superficieMin !== undefined || f.superficieMax !== undefined) n++;
  if (f.fechaPubDesde || f.fechaPubHasta) n++;
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

// Rango de números reutilizable
const RangeInputs: React.FC<{
  labelMin: string;
  labelMax: string;
  valMin?: number;
  valMax?: number;
  placeholderMin?: string;
  placeholderMax?: string;
  onChangeMin: (v: number | undefined) => void;
  onChangeMax: (v: number | undefined) => void;
}> = ({ labelMin, labelMax, valMin, valMax, placeholderMin = '0', placeholderMax = '∞', onChangeMin, onChangeMax }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1">
      <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
        {labelMin}
      </label>
      <input
        type="number"
        placeholder={placeholderMin}
        className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
        value={valMin ?? ''}
        onChange={e => onChangeMin(e.target.value ? Number(e.target.value) : undefined)}
      />
    </div>
    <div className="text-slate-300 font-black text-xs mt-4">—</div>
    <div className="flex-1">
      <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
        {labelMax}
      </label>
      <input
        type="number"
        placeholder={placeholderMax}
        className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
        value={valMax ?? ''}
        onChange={e => onChangeMax(e.target.value ? Number(e.target.value) : undefined)}
      />
    </div>
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

const TIPOS_PROPIEDAD = [
  { value: 'departamento', label: 'Depto' },
  { value: 'casa',         label: 'Casa' },
  { value: 'ph',           label: 'PH' },
  { value: 'duplex',       label: 'Dúplex' },
  { value: 'local',        label: 'Local' },
  { value: 'lote',         label: 'Lote' },
  { value: 'oficina',      label: 'Oficina' },
  { value: 'cochera',      label: 'Cochera' },
  { value: 'campo',        label: 'Campo' },
];

const PORTALES_PROP = [
  { value: 'zonaprop',      label: 'ZonaProp',      activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md' },
  { value: 'argenprop',     label: 'ArgenProp',     activeClass: 'bg-indigo-600 text-white border-indigo-600 shadow-md' },
  { value: 'mercadolibre',  label: 'MercadoLibre',  activeClass: 'bg-yellow-500 text-white border-yellow-500 shadow-md' },
  { value: 'web_america',   label: 'Web América',   activeClass: 'bg-rose-600 text-white border-rose-600 shadow-md' },
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
  const [barrioInput, setBarrioInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
      setBarrioInput('');
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

  // Barrio tag helpers
  const addBarrio = () => {
    const v = barrioInput.trim();
    if (!v) return;
    if (!(localFilters.barrios || []).includes(v)) {
      setLocalFilters(prev => ({ ...prev, barrios: [...(prev.barrios || []), v] }));
    }
    setBarrioInput('');
  };
  const removeBarrio = (b: string) => {
    setLocalFilters(prev => ({ ...prev, barrios: (prev.barrios || []).filter(x => x !== b) }));
  };

  // ──────────────────────────────────────────────────
  // Real-time count con 300ms debounce
  // ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoadingCount(true);
      try {
        if (module === 'propiedades') {
          // ── PROPIEDADES COUNT ──
          let query = supabase
            .from('propiedades')
            .select('*', { count: 'exact', head: true });

          if (localFilters.searchText.trim()) {
            const q = `%${localFilters.searchText.trim()}%`;
            query = query.or(`titulo.ilike.${q},barrio.ilike.${q},direccion_completa.ilike.${q}`);
          }

          if (localFilters.tipoOperacionProp?.length) {
            query = query.in('tipo_operacion', localFilters.tipoOperacionProp);
          }

          if (localFilters.tiposPropiedad?.length) {
            query = query.in('tipo', localFilters.tiposPropiedad);
          }

          if (localFilters.barrios?.length) {
            const barrioParts = localFilters.barrios
              .map(b => `barrio.ilike.%${b}%`)
              .join(',');
            query = query.or(barrioParts);
          }

          if (localFilters.precioVentaMin !== undefined) {
            query = query.gte('precio_venta', localFilters.precioVentaMin);
          }
          if (localFilters.precioVentaMax !== undefined) {
            query = query.lte('precio_venta', localFilters.precioVentaMax);
          }
          if (localFilters.precioAlqMin !== undefined) {
            query = query.gte('precio_alquiler', localFilters.precioAlqMin);
          }
          if (localFilters.precioAlqMax !== undefined) {
            query = query.lte('precio_alquiler', localFilters.precioAlqMax);
          }

          if (localFilters.ambientesMin !== undefined) {
            query = query.gte('ambientes', localFilters.ambientesMin);
          }

          if (localFilters.dormitoriosMin !== undefined) {
            query = query.gte('dormitorios', localFilters.dormitoriosMin);
          }

          if (localFilters.superficieMin !== undefined) {
            query = query.gte('sup_cubierta', localFilters.superficieMin);
          }
          if (localFilters.superficieMax !== undefined) {
            query = query.lte('sup_cubierta', localFilters.superficieMax);
          }

          if (localFilters.portales?.length) {
            const portalParts = localFilters.portales
              .map(p => {
                if (p === 'zonaprop')     return 'publicada_zonaprop.eq.true';
                if (p === 'argenprop')    return 'publicada_argenprop.eq.true';
                if (p === 'mercadolibre') return 'publicada_mercadolibre.eq.true';
                if (p === 'web_america')  return 'publicada_web_america.eq.true';
                return null;
              })
              .filter(Boolean)
              .join(',');
            if (portalParts) query = query.or(portalParts);
          }

          if (localFilters.fechaPubDesde) {
            query = query.gte('fecha_publicacion', localFilters.fechaPubDesde);
          }
          if (localFilters.fechaPubHasta) {
            query = query.lte('fecha_publicacion', localFilters.fechaPubHasta + 'T23:59:59');
          }

          const { count, error: countError } = await query;
          if (countError) {
            console.warn('Count query error (propiedades):', countError);
            setResultCount(null);
          } else {
            setResultCount(count ?? 0);
          }

        } else {
          // ── LEADS / CLIENTES COUNT ──
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
                if (op === 'venta')     return 'busca_venta.eq.true';
                if (op === 'alquiler')  return 'busca_alquiler.eq.true';
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

          const { count, error: countError } = await query;
          if (countError) {
            console.warn('Count query error:', countError);
            setResultCount(null);
          } else {
            setResultCount(count ?? 0);
          }
        }
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
    setBarrioInput('');
    onReset();
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const activeCount = countActiveAdvancedFilters(localFilters);

  // ──────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────
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

              {/* ═══════════════════════════════════════════════
                  BÚSQUEDA DE TEXTO (compartida todos los módulos)
              ════════════════════════════════════════════════ */}
              <FilterSection title="Búsqueda">
                <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all">
                  <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      module === 'propiedades'
                        ? 'Título, dirección, barrio...'
                        : 'Nombre, email, teléfono...'
                    }
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

              {/* ═══════════════════════════════════════════════
                  PROPIEDADES — filtros específicos
              ════════════════════════════════════════════════ */}
              {module === 'propiedades' ? (
                <>
                  {/* TIPO DE OPERACIÓN */}
                  <FilterSection title="Tipo de operación">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'venta',      label: 'Venta' },
                        { value: 'alquiler',   label: 'Alquiler' },
                        { value: 'temporario', label: 'Temporario' },
                      ].map(op => (
                        <FilterPill
                          key={op.value}
                          label={op.label}
                          active={(localFilters.tipoOperacionProp || []).includes(op.value)}
                          onClick={() => toggleArr('tipoOperacionProp', op.value)}
                        />
                      ))}
                    </div>
                  </FilterSection>

                  {/* TIPO DE PROPIEDAD */}
                  <FilterSection title="Tipo de propiedad">
                    <div className="flex flex-wrap gap-2">
                      {TIPOS_PROPIEDAD.map(tp => (
                        <FilterPill
                          key={tp.value}
                          label={tp.label}
                          active={(localFilters.tiposPropiedad || []).includes(tp.value)}
                          onClick={() => toggleArr('tiposPropiedad', tp.value)}
                        />
                      ))}
                    </div>
                  </FilterSection>

                  {/* PRECIO VENTA */}
                  <FilterSection title="Precio venta (USD)">
                    <RangeInputs
                      labelMin="Mínimo"
                      labelMax="Máximo"
                      valMin={localFilters.precioVentaMin}
                      valMax={localFilters.precioVentaMax}
                      onChangeMin={v => setLocalFilters(prev => ({ ...prev, precioVentaMin: v }))}
                      onChangeMax={v => setLocalFilters(prev => ({ ...prev, precioVentaMax: v }))}
                    />
                  </FilterSection>

                  {/* PRECIO ALQUILER */}
                  <FilterSection title="Precio alquiler (ARS/mes)">
                    <RangeInputs
                      labelMin="Mínimo"
                      labelMax="Máximo"
                      valMin={localFilters.precioAlqMin}
                      valMax={localFilters.precioAlqMax}
                      onChangeMin={v => setLocalFilters(prev => ({ ...prev, precioAlqMin: v }))}
                      onChangeMax={v => setLocalFilters(prev => ({ ...prev, precioAlqMax: v }))}
                    />
                  </FilterSection>

                  {/* AMBIENTES */}
                  <FilterSection title="Ambientes mínimos">
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(a => (
                        <FilterPill
                          key={a}
                          label={a === 5 ? '5+' : String(a)}
                          active={localFilters.ambientesMin === a}
                          onClick={() =>
                            setLocalFilters(prev => ({
                              ...prev,
                              ambientesMin: prev.ambientesMin === a ? undefined : a,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </FilterSection>

                  {/* DORMITORIOS */}
                  <FilterSection title="Dormitorios mínimos">
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4].map(d => (
                        <FilterPill
                          key={d}
                          label={d === 4 ? '4+' : String(d)}
                          active={localFilters.dormitoriosMin === d}
                          onClick={() =>
                            setLocalFilters(prev => ({
                              ...prev,
                              dormitoriosMin: prev.dormitoriosMin === d ? undefined : d,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </FilterSection>

                  {/* SUPERFICIE CUBIERTA */}
                  <FilterSection title="Superficie cubierta (m²)">
                    <RangeInputs
                      labelMin="Mínimo"
                      labelMax="Máximo"
                      valMin={localFilters.superficieMin}
                      valMax={localFilters.superficieMax}
                      placeholderMin="0 m²"
                      placeholderMax="∞ m²"
                      onChangeMin={v => setLocalFilters(prev => ({ ...prev, superficieMin: v }))}
                      onChangeMax={v => setLocalFilters(prev => ({ ...prev, superficieMax: v }))}
                    />
                  </FilterSection>

                  {/* BARRIO / ZONA */}
                  <FilterSection title="Barrio / Zona">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all">
                        <input
                          type="text"
                          placeholder="Ej: Güemes, Nueva Córdoba..."
                          className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-bold placeholder:text-slate-300"
                          value={barrioInput}
                          onChange={e => setBarrioInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); addBarrio(); }
                          }}
                        />
                      </div>
                      <button
                        onClick={addBarrio}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shrink-0"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {(localFilters.barrios || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(localFilters.barrios || []).map(b => (
                          <span
                            key={b}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-[11px] font-black uppercase tracking-widest"
                          >
                            {b}
                            <button
                              onClick={() => removeBarrio(b)}
                              className="text-indigo-300 hover:text-indigo-600 transition-colors"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </FilterSection>

                  {/* PORTALES */}
                  <FilterSection title="Publicado en portales">
                    <div className="flex flex-wrap gap-2">
                      {PORTALES_PROP.map(p => (
                        <FilterPill
                          key={p.value}
                          label={p.label}
                          active={(localFilters.portales || []).includes(p.value)}
                          onClick={() => toggleArr('portales', p.value)}
                          activeClass={p.activeClass}
                        />
                      ))}
                    </div>
                  </FilterSection>

                  {/* FECHA DE PUBLICACIÓN */}
                  <FilterSection title="Fecha de publicación">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">
                          Desde
                        </label>
                        <input
                          type="date"
                          className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                          value={localFilters.fechaPubDesde ?? ''}
                          onChange={e =>
                            setLocalFilters(prev => ({
                              ...prev,
                              fechaPubDesde: e.target.value || undefined,
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
                          value={localFilters.fechaPubHasta ?? ''}
                          onChange={e =>
                            setLocalFilters(prev => ({
                              ...prev,
                              fechaPubHasta: e.target.value || undefined,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </FilterSection>
                </>
              ) : (
                /* ═══════════════════════════════════════════════
                   LEADS / CLIENTES — filtros específicos
                ════════════════════════════════════════════════ */
                <>
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
                        { value: 'venta',      label: 'Venta' },
                        { value: 'alquiler',   label: 'Alquiler' },
                        { value: 'inversion',  label: 'Inversión' },
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
                    <RangeInputs
                      labelMin="Mínimo"
                      labelMax="Máximo"
                      valMin={localFilters.presupuestoVentaMin}
                      valMax={localFilters.presupuestoVentaMax}
                      onChangeMin={v => setLocalFilters(prev => ({ ...prev, presupuestoVentaMin: v }))}
                      onChangeMax={v => setLocalFilters(prev => ({ ...prev, presupuestoVentaMax: v }))}
                    />
                  </FilterSection>

                  {/* PRESUPUESTO ALQUILER */}
                  <FilterSection title="Presupuesto alquiler (ARS/mes)">
                    <RangeInputs
                      labelMin="Mínimo"
                      labelMax="Máximo"
                      valMin={localFilters.presupuestoAlqMin}
                      valMax={localFilters.presupuestoAlqMax}
                      onChangeMin={v => setLocalFilters(prev => ({ ...prev, presupuestoAlqMin: v }))}
                      onChangeMax={v => setLocalFilters(prev => ({ ...prev, presupuestoAlqMax: v }))}
                    />
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
                </>
              )}

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
                    {module === 'clientes'
                      ? 'cliente'
                      : module === 'propiedades'
                      ? 'propiedad'
                      : 'oportunidad'}
                    {resultCount !== 1 ? 'es' : ''} encontrada{resultCount !== 1 ? 's' : ''}
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
