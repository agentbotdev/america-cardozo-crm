import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Loader2, Home, BedDouble, DollarSign, MapPin } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { Property } from '../../types';

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface FiltrosNLP {
  tipo_operacion?: 'venta' | 'alquiler';
  tipo_propiedad?: string;
  ambientes_min?: number;
  precio_max_usd?: number;
  barrio?: string;
}

interface ResultadoBuscador extends Pick<Property,
  'id' | 'titulo' | 'barrio' | 'tipo_operacion' | 'tipo' | 'ambientes' | 'dormitorios'
> {
  precio_venta?: number;
  precio_alquiler?: number;
  moneda_venta?: string;
  moneda_alquiler?: string;
  foto_portada_url?: string;
  relevancia: number;
}

interface BuscadorIAProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Sugerencias rápidas ───────────────────────────────────────────────────────

const SUGERENCIAS = [
  'Departamento 2 ambientes en Palermo hasta USD 150.000',
  'Casa 3 dormitorios en Nueva Córdoba para alquilar',
  'PH en Güemes hasta USD 200.000',
  'Local comercial en Centro',
  'Departamento a estrenar en Cofico',
];

// ─── Parser NLP local ──────────────────────────────────────────────────────────

function parsearQuery(query: string): FiltrosNLP {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtros: FiltrosNLP = {};

  // Tipo operación
  if (/\b(alqui|renta|arrend)/i.test(q)) filtros.tipo_operacion = 'alquiler';
  else if (/\b(venta|vend|compra|compr)/i.test(q)) filtros.tipo_operacion = 'venta';

  // Tipo propiedad
  const tipos: [RegExp, string][] = [
    [/departamento|depto|dpto/, 'departamento'],
    [/\bcasa\b/, 'casa'],
    [/\bph\b|planta baja/, 'ph'],
    [/duplex/, 'duplex'],
    [/local|comercial/, 'local'],
    [/lote|terreno/, 'lote'],
    [/oficina/, 'oficina'],
    [/cochera|garage/, 'cochera'],
    [/campo|chacra|finca/, 'campo'],
  ];
  for (const [regex, tipo] of tipos) {
    if (regex.test(q)) { filtros.tipo_propiedad = tipo; break; }
  }

  // Ambientes mínimos
  const mAmbientes = q.match(/(\d+)\s*(amb|ambiente|ambientes)/);
  if (mAmbientes) filtros.ambientes_min = parseInt(mAmbientes[1], 10);

  // Dormitorios → ambientes_min (si no encontró ambientes)
  if (!filtros.ambientes_min) {
    const mDorm = q.match(/(\d+)\s*(dorm|dormitorio|dormitorios|habitacion|cuarto)/);
    if (mDorm) filtros.ambientes_min = parseInt(mDorm[1], 10);
  }

  // Precio máximo USD
  const mPrecio = q.match(/(?:hasta|max|maximo|menos de)\s*(?:usd\s*)?(\d[\d.,]*)\s*(?:mil|k|m)?/);
  if (mPrecio) {
    let num = parseFloat(mPrecio[1].replace(/[.,]/g, ''));
    const rawMatch = mPrecio[0].toLowerCase();
    if (rawMatch.includes('mil') || rawMatch.includes('k')) num *= 1000;
    if (rawMatch.includes(' m') && num < 10000) num *= 1000000;
    filtros.precio_max_usd = num;
  }

  // Barrio (palabras después de "en" que no sean verbos comunes)
  const mBarrio = q.match(/\ben\s+([a-záéíóúüñ\s]+?)(?:\s+(?:hasta|para|con|de|sin|$))/);
  if (mBarrio) {
    const candidato = mBarrio[1].trim();
    // Excluir falsos positivos
    const excluir = ['venta', 'alquiler', 'vender', 'alquilar', 'comprar'];
    if (!excluir.includes(candidato)) filtros.barrio = candidato;
  }

  return filtros;
}

// ─── Función de relevancia ─────────────────────────────────────────────────────

function calcularRelevancia(prop: Record<string, unknown>, filtros: FiltrosNLP): number {
  let score = 50;

  if (filtros.tipo_operacion && prop['tipo_operacion'] === filtros.tipo_operacion) score += 15;
  if (filtros.tipo_propiedad && prop['tipo_propiedad'] === filtros.tipo_propiedad) score += 15;

  if (filtros.ambientes_min != null) {
    const amb = (prop['ambientes'] as number) || 0;
    if (amb >= filtros.ambientes_min) score += 12;
    else score -= 20;
  }

  if (filtros.precio_max_usd != null) {
    const precio = (prop['precio_venta'] as number) || (prop['precio_alquiler'] as number) || 0;
    if (precio > 0 && precio <= filtros.precio_max_usd) score += 12;
    else if (precio > filtros.precio_max_usd) score -= 15;
  }

  if (filtros.barrio) {
    const barrioProp = ((prop['barrio'] as string) || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const barrioFiltro = filtros.barrio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (barrioProp.includes(barrioFiltro) || barrioFiltro.includes(barrioProp)) score += 15;
  }

  return Math.min(99, Math.max(50, score));
}

// ─── Componente ResultCard ─────────────────────────────────────────────────────

const ResultCard: React.FC<{ prop: ResultadoBuscador }> = ({ prop }) => {
  const precio = prop.tipo_operacion === 'venta' ? prop.precio_venta : prop.precio_alquiler;
  const moneda = prop.tipo_operacion === 'venta' ? (prop.moneda_venta || 'USD') : (prop.moneda_alquiler || 'ARS');
  const precioFmt = precio
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 }).format(precio)
    : 'Consultar';

  const relevanciaColor =
    prop.relevancia >= 85 ? 'bg-emerald-500' :
    prop.relevancia >= 70 ? 'bg-amber-400' : 'bg-slate-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 bg-slate-50/60 hover:bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Foto */}
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
        {prop.foto_portada_url ? (
          <img src={prop.foto_portada_url} alt={prop.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={24} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
          {prop.titulo}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={11} className="text-slate-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-400 font-bold truncate">{prop.barrio || '—'}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {prop.ambientes > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
              <BedDouble size={11} /> {prop.ambientes} amb.
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-black">
            <DollarSign size={11} /> {precioFmt}
          </span>
        </div>
      </div>

      {/* Relevancia */}
      <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${relevanciaColor}`} />
        <span className="text-[9px] font-black text-slate-400">{prop.relevancia}%</span>
      </div>
    </motion.div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────

export const BuscadorIA: React.FC<BuscadorIAProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<ResultadoBuscador[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBuscado, setHasBuscado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResultados([]);
      setHasBuscado(false);
      setError(null);
    }
  }, [isOpen]);

  const handleBuscar = async (overrideQuery?: string) => {
    const activeQuery = overrideQuery ?? query;
    if (!activeQuery.trim()) return;

    setBuscando(true);
    setError(null);
    setHasBuscado(true);

    try {
      const filtros = parsearQuery(activeQuery);

      // Construir query Supabase
      let q = supabase
        .from('propiedades')
        .select(
          'tokko_id, titulo, barrio, tipo_operacion, tipo_propiedad, ambientes, dormitorios, precio_venta, precio_alquiler, moneda_venta, moneda_alquiler, foto_portada_url'
        )
        .neq('estado', 'borrador')
        .limit(60);

      if (filtros.tipo_operacion) q = q.eq('tipo_operacion', filtros.tipo_operacion);
      if (filtros.tipo_propiedad) q = q.eq('tipo_propiedad', filtros.tipo_propiedad);
      if (filtros.ambientes_min != null) q = q.gte('ambientes', filtros.ambientes_min);
      if (filtros.barrio) q = q.ilike('barrio', `%${filtros.barrio}%`);

      const { data, error: sbError } = await q;
      if (sbError) throw sbError;

      const rows = (data || []) as Record<string, unknown>[];

      // Filtro precio y scoring
      const filtradas = rows
        .filter(p => {
          if (filtros.precio_max_usd == null) return true;
          const precio = (p['precio_venta'] as number) || (p['precio_alquiler'] as number) || 0;
          return precio === 0 || precio <= filtros.precio_max_usd;
        })
        .map(p => ({
          id: String(p['tokko_id'] ?? ''),
          titulo: (p['titulo'] as string) || 'Sin título',
          barrio: (p['barrio'] as string) || '',
          tipo_operacion: (p['tipo_operacion'] as 'venta' | 'alquiler') || 'venta',
          tipo: (p['tipo_propiedad'] as Property['tipo']) || 'otro',
          ambientes: (p['ambientes'] as number) || 0,
          dormitorios: (p['dormitorios'] as number) || 0,
          precio_venta: p['precio_venta'] as number | undefined,
          precio_alquiler: p['precio_alquiler'] as number | undefined,
          moneda_venta: p['moneda_venta'] as string | undefined,
          moneda_alquiler: p['moneda_alquiler'] as string | undefined,
          foto_portada_url: p['foto_portada_url'] as string | undefined,
          relevancia: calcularRelevancia(p, filtros),
        } as ResultadoBuscador))
        .sort((a, b) => b.relevancia - a.relevancia)
        .slice(0, 20);

      setResultados(filtradas);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar propiedades');
    } finally {
      setBuscando(false);
    }
  };

  const handleSugerencia = (s: string) => {
    setQuery(s);
    handleBuscar(s);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
          />

          {/* Centering shell — flexbox, sin depender de transforms del padre */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh] px-4 pointer-events-none">
          {/* Modal con glass effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col pointer-events-auto"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header / Input */}
            <div className="p-6 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-xl flex-shrink-0">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                    placeholder="Ej: Departamento 2 amb en Palermo hasta USD 150.000..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-5 pr-28 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-300"
                  />
                  <button
                    onClick={() => handleBuscar()}
                    disabled={buscando || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {buscando ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                    Buscar
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold ml-14 mt-1">
                Describí en lenguaje natural lo que estás buscando
              </p>
            </div>

            {/* Body scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Sugerencias */}
              {!hasBuscado && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">
                    Búsquedas frecuentes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGERENCIAS.map(s => (
                      <button
                        key={s}
                        onClick={() => handleSugerencia(s)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 rounded-2xl text-[10px] font-bold transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <p className="text-xs font-bold text-rose-500">{error}</p>
                </div>
              )}

              {/* Spinner */}
              {buscando && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin text-indigo-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Analizando propiedades...
                  </p>
                </div>
              )}

              {/* Resultados */}
              {!buscando && hasBuscado && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                      {resultados.length > 0
                        ? `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`
                        : 'Sin resultados'
                      }
                    </p>
                    {resultados.length > 0 && (
                      <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Alta relevancia</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Media</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Baja</span>
                      </div>
                    )}
                  </div>

                  {resultados.length === 0 ? (
                    <div className="py-12 text-center">
                      <Home size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-sm font-black text-slate-400">No encontramos propiedades con esos criterios</p>
                      <p className="text-[10px] text-slate-300 font-bold mt-2">Intentá con menos filtros o términos diferentes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resultados.map(prop => (
                        <ResultCard key={prop.id} prop={prop} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BuscadorIA;
