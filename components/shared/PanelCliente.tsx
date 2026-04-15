import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Phone, Mail, MessageCircle, Edit3, LayoutDashboard, Clock,
  Building2, Calendar, MessageSquare, Zap, User, MapPin, Tag,
  Star, AlertTriangle, Send, CheckCircle2, XCircle, Copy, ExternalLink,
  ChevronRight, TrendingUp, Heart, Home, DollarSign, Hash,
  ListTodo, Search, Plus, Trash2, Snowflake, Sun, Flame
} from 'lucide-react';
import { Client } from '../../types';
import { ETAPAS_PROCESO, VENDEDORES, getVendedorLabel } from '../../config/taxonomy';
import { supabase } from '../../services/supabaseClient';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'resumen' | 'historial' | 'propiedades' | 'visitas' | 'tareas' | 'chat' | 'acciones';

interface PanelClienteProps {
  lead: Client;
  onClose: () => void;
  onUpdate: (updated: Client) => void;
}

interface Nota {
  id: string;
  texto: string;
  usuario: string;
  created_at: string;
  tipo: 'nota' | 'llamada' | 'whatsapp' | 'email' | 'visita';
}

interface VisitaResumen {
  id: string;
  fecha: string;
  hora?: string;
  estado: string;
  propiedad_titulo?: string;
  notas?: string;
}

interface PropEnviada {
  tokko_id: string;
  titulo: string;
  barrio?: string;
  precio?: number;
  foto_portada_url?: string;
  operacion?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'resumen',      label: 'Resumen',      icon: LayoutDashboard },
  { id: 'historial',   label: 'Historial',    icon: Clock },
  { id: 'propiedades', label: 'Propiedades',  icon: Building2 },
  { id: 'visitas',     label: 'Visitas',      icon: Calendar },
  { id: 'tareas',      label: 'Tareas',       icon: ListTodo },
  { id: 'chat',        label: 'Chat',         icon: MessageSquare },
  { id: 'acciones',    label: 'Acciones',     icon: Zap },
];

const TEMP_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  frio:      { label: 'FRÍO',      bg: 'bg-blue-50',   text: 'text-blue-600',   icon: Snowflake },
  tibio:     { label: 'TIBIO',     bg: 'bg-amber-50',  text: 'text-amber-600',  icon: Sun      },
  caliente:  { label: 'CALIENTE',  bg: 'bg-red-50',    text: 'text-red-600',    icon: Flame    },
  ultra:     { label: 'ULTRA',     bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Zap      },
};

const ETAPA_COLOR: Record<string, string> = {
  'Inicio':          'bg-slate-100 text-slate-600',
  'Indagación':      'bg-blue-100 text-blue-700',
  'Seguimiento':     'bg-indigo-100 text-indigo-700',
  'Visita agendada': 'bg-yellow-100 text-yellow-700',
  'Negociación':     'bg-orange-100 text-orange-700',
  'Cierre':          'bg-emerald-100 text-emerald-700',
};

const TIPO_NOTA_ICON: Record<string, React.ElementType> = {
  nota:     Edit3,
  llamada:  Phone,
  whatsapp: MessageCircle,
  email:    Mail,
  visita:   Calendar,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? 'Hace 1 min' : `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Hace ${d}d`;
  if (d < 30) return `Hace ${Math.floor(d / 7)} sem`;
  return `Hace ${Math.floor(d / 30)} mes`;
}

function iniciales(nombre: string, apellido?: string): string {
  const a = nombre.charAt(0).toUpperCase();
  if (apellido) return a + apellido.charAt(0).toUpperCase();
  const words = nombre.trim().split(' ');
  return words.length > 1 ? a + words[1].charAt(0).toUpperCase() : a;
}

function formatPrecio(n?: number): string {
  if (!n) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TempPill: React.FC<{ temp?: string }> = ({ temp }) => {
  if (!temp) return null;
  const cfg = TEMP_CONFIG[temp.toLowerCase()] ?? TEMP_CONFIG['frio'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.bg} ${cfg.text}`}>
      <Icon size={10} className="shrink-0" />
      {cfg.label}
    </span>
  );
};

const EtapaPill: React.FC<{ etapa: string }> = ({ etapa }) => {
  const cls = ETAPA_COLOR[etapa] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${cls}`}>
      {etapa.toUpperCase()}
    </span>
  );
};

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: string | null; copy?: boolean }> = ({
  icon: Icon, label, value, copy
}) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 group">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
      </div>
      {copy && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-100"
          title="Copiar"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
        </button>
      )}
    </div>
  );
};

// ─── Tab: Resumen ─────────────────────────────────────────────────────────────

const TabResumen: React.FC<{ lead: Client }> = ({ lead }) => (
  <div className="space-y-5">
    {/* Score + probabilidad */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-indigo-50 rounded-2xl p-4 text-center">
        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Score IA</p>
        <p className="text-3xl font-black text-indigo-700">{lead.score ?? 0}</p>
        <p className="text-[9px] text-indigo-400 font-bold">/100</p>
      </div>
      <div className="bg-emerald-50 rounded-2xl p-4 text-center">
        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1">Cierre</p>
        <p className="text-3xl font-black text-emerald-700">{lead.probabilidad_cierre ?? 0}%</p>
        <p className="text-[9px] text-emerald-400 font-bold">prob.</p>
      </div>
    </div>

    {/* Datos de contacto */}
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-1">
      <InfoRow icon={Phone}    label="Teléfono"  value={lead.telefono}  copy />
      <InfoRow icon={Mail}     label="Email"     value={lead.email}     copy />
      <InfoRow icon={MessageCircle} label="WhatsApp" value={lead.whatsapp ?? lead.telefono} copy />
      <InfoRow icon={MapPin}   label="Ciudad"    value={lead.ciudad_actual} />
      <InfoRow icon={User}     label="Rango etario" value={lead.rango_etario} />
    </div>

    {/* Búsqueda */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Qué busca</p>
      <div className="flex flex-wrap gap-2">
        {lead.busca_venta      && <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full"><Home size={10} /> COMPRA</span>}
        {lead.busca_alquiler   && <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full"><Home size={10} /> ALQUILER</span>}
        {lead.busca_inversion  && <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full"><TrendingUp size={10} /> INVERSIÓN</span>}
        {lead.busca_temporario && <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full"><Calendar size={10} /> TEMPORARIO</span>}
      </div>
      {lead.venta_presupuesto_max && (
        <div className="mt-3 flex items-center gap-2">
          <DollarSign size={12} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500">Presupuesto máx: </span>
          <span className="text-[10px] font-black text-slate-800">{formatPrecio(lead.venta_presupuesto_max)}</span>
        </div>
      )}
      {lead.venta_zonas_interes && lead.venta_zonas_interes.length > 0 && (
        <div className="mt-2 flex items-start gap-2">
          <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-[10px] font-bold text-slate-600">{lead.venta_zonas_interes.join(', ')}</span>
        </div>
      )}
    </div>

    {/* IA Insights */}
    {(lead.recomendacion_ia || lead.sentimiento_general) && (
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1">
          <Zap size={10} /> IA Insight
        </p>
        {lead.sentimiento_general && (
          <p className="text-[10px] font-bold text-slate-500 mb-1">
            Sentimiento: <span className="text-indigo-700">{lead.sentimiento_general}</span>
          </p>
        )}
        {lead.recomendacion_ia && (
          <p className="text-xs text-slate-600 leading-relaxed">{lead.recomendacion_ia}</p>
        )}
      </div>
    )}

    {/* Notas internas */}
    {lead.notas_internas && (
      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Notas internas</p>
        <p className="text-xs text-amber-800 leading-relaxed">{lead.notas_internas}</p>
      </div>
    )}

    {/* Tags */}
    {lead.tags && lead.tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {lead.tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
            <Hash size={9} />{tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ─── Tab: Historial ──────────────────────────────────────────────────────────

const TabHistorial: React.FC<{ lead: Client }> = ({ lead }) => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<Nota['tipo']>('nota');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchNotas = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('lead_notas')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      setNotas(data ?? []);
      setLoading(false);
    };
    fetchNotas();
  }, [lead.id]);

  const addNota = async () => {
    if (!texto.trim()) return;
    setSending(true);
    const { data, error } = await supabase
      .from('lead_notas')
      .insert([{ lead_id: lead.id, texto: texto.trim(), usuario: 'Admin', tipo }])
      .select()
      .single();
    if (!error && data) {
      setNotas(prev => [data, ...prev]);
      setTexto('');
    }
    setSending(false);
  };

  const tiposNota: Nota['tipo'][] = ['nota', 'llamada', 'whatsapp', 'email', 'visita'];

  return (
    <div className="space-y-4">
      {/* Agregar nota */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {tiposNota.map(t => {
            const Icon = TIPO_NOTA_ICON[t];
            return (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                  tipo === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={10} />
                {t.toUpperCase()}
              </button>
            );
          })}
        </div>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Escribí una nota, llamada, interacción..."
          className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
          rows={3}
        />
        <button
          onClick={addNota}
          disabled={sending || !texto.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={12} />
          {sending ? 'Guardando...' : 'Agregar nota'}
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : notas.length === 0 ? (
        <div className="text-center py-10">
          <Clock size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-bold">Sin historial aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notas.map(nota => {
            const Icon = TIPO_NOTA_ICON[nota.tipo] ?? Edit3;
            return (
              <div key={nota.id} className="flex gap-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{nota.tipo}</span>
                    <span className="text-[9px] text-slate-300 font-bold shrink-0">{tiempoRelativo(nota.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{nota.texto}</p>
                  <p className="text-[9px] text-slate-300 font-bold mt-1">{nota.usuario}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Propiedades ────────────────────────────────────────────────────────

const TabPropiedades: React.FC<{ lead: Client; onUpdate: (updated: Client) => void }> = ({ lead, onUpdate }) => {
  const [props, setProps] = useState<PropEnviada[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PropEnviada[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load current assigned properties
  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      const ids = lead.propiedades_enviadas_ids;
      if (!ids || ids.length === 0) { setLoading(false); return; }
      const { data } = await supabase
        .from('propiedades')
        .select('tokko_id, titulo, barrio, precio_venta, precio_alquiler, foto_portada_url, operacion')
        .in('tokko_id', ids.map(String))
        .limit(20);
      setProps((data ?? []).map(p => ({
        tokko_id: p.tokko_id,
        titulo: p.titulo,
        barrio: p.barrio,
        precio: p.precio_venta ?? p.precio_alquiler,
        foto_portada_url: p.foto_portada_url,
        operacion: p.operacion,
      })));
      setLoading(false);
    };
    fetchProps();
  }, [lead.id]);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const { data } = await supabase
        .from('propiedades')
        .select('tokko_id, titulo, barrio, precio_venta, precio_alquiler, foto_portada_url, operacion')
        .ilike('titulo', `%${searchQuery}%`)
        .limit(6);
      setSearchResults((data ?? []).map(p => ({
        tokko_id: p.tokko_id,
        titulo: p.titulo,
        barrio: p.barrio,
        precio: p.precio_venta ?? p.precio_alquiler,
        foto_portada_url: p.foto_portada_url,
        operacion: p.operacion,
      })));
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const persistIds = async (newIds: string[]) => {
    setSaving(true);
    const { data, error } = await supabase
      .from('leads')
      .update({ propiedades_enviadas_ids: newIds, updated_at: new Date().toISOString() })
      .eq('id', lead.id)
      .select()
      .single();
    if (!error && data) onUpdate({ ...lead, propiedades_enviadas_ids: newIds });
    setSaving(false);
  };

  const addProp = async (p: PropEnviada) => {
    const alreadyIn = props.some(x => x.tokko_id === p.tokko_id);
    if (alreadyIn) return;
    const newProps = [...props, p];
    setProps(newProps);
    setSearchQuery('');
    setSearchResults([]);
    await persistIds(newProps.map(x => x.tokko_id));
  };

  const removeProp = async (tokko_id: string) => {
    const newProps = props.filter(p => p.tokko_id !== tokko_id);
    setProps(newProps);
    await persistIds(newProps.map(x => x.tokko_id));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <div className="flex items-center bg-slate-50 rounded-2xl px-3 py-2.5 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:bg-white transition-all gap-2">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar propiedad para agregar..."
            className="bg-transparent border-none focus:outline-none text-xs w-full text-slate-700 font-bold placeholder:text-slate-300"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchLoading && <div className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin shrink-0" />}
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10">
            {searchResults.map(p => (
              <button
                key={p.tokko_id}
                onClick={() => addProp(p)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {p.foto_portada_url
                    ? <img src={p.foto_portada_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={14} className="text-slate-300 m-auto mt-1.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.titulo}</p>
                  {p.barrio && <p className="text-[10px] text-slate-400">{p.barrio}</p>}
                </div>
                <Plus size={14} className="text-indigo-500 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {props.length === 0 ? (
        <div className="text-center py-10">
          <Building2 size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-bold">Sin propiedades enviadas</p>
          <p className="text-[10px] text-slate-300 mt-1">Usá el buscador para agregar</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
            {props.length} propiedad{props.length !== 1 ? 'es' : ''}
            {saving && <span className="text-indigo-400">guardando...</span>}
          </p>
          {props.map(p => (
            <div key={p.tokko_id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {p.foto_portada_url
                  ? <img src={p.foto_portada_url} alt="" className="w-full h-full object-cover" />
                  : <Building2 size={18} className="text-slate-300 m-auto mt-2" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{p.titulo}</p>
                {p.barrio && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{p.barrio}</p>}
                {p.precio && <p className="text-[11px] font-black text-indigo-600 mt-1">{formatPrecio(p.precio)}</p>}
              </div>
              <button
                onClick={() => removeProp(p.tokko_id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all shrink-0"
                title="Quitar propiedad"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Visitas ────────────────────────────────────────────────────────────

const VISITA_ESTADO_STYLE: Record<string, string> = {
  agendada:     'bg-blue-50 text-blue-700',
  confirmada:   'bg-indigo-50 text-indigo-700',
  realizada:    'bg-emerald-50 text-emerald-700',
  cancelada:    'bg-red-50 text-red-600',
  reprogramada: 'bg-amber-50 text-amber-700',
};

const TabVisitas: React.FC<{ lead: Client }> = ({ lead }) => {
  const [visitas, setVisitas] = useState<VisitaResumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitas = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('visitas')
        .select('id, fecha, hora, estado, notas, property_titulo')
        .eq('lead_id', lead.id)
        .order('fecha', { ascending: false, nullsFirst: false })
        .limit(20);
      setVisitas((data ?? []).map((v: any) => ({
        id: v.id,
        fecha: v.fecha,
        hora: v.hora,
        estado: v.estado,
        notas: v.notas,
        propiedad_titulo: v.property_titulo,
      })));
      setLoading(false);
    };
    fetchVisitas();
  }, [lead.id]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (visitas.length === 0) return (
    <div className="text-center py-12">
      <Calendar size={28} className="text-slate-200 mx-auto mb-2" />
      <p className="text-xs text-slate-400 font-bold">Sin visitas registradas</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {visitas.map(v => {
        const cls = VISITA_ESTADO_STYLE[v.estado] ?? 'bg-slate-50 text-slate-600';
        return (
          <div key={v.id} className="p-4 bg-white rounded-2xl border border-slate-100">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-xs font-black text-slate-800">{v.fecha ?? '—'}</p>
                {v.hora && <p className="text-[10px] text-slate-400 font-bold">{v.hora}</p>}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${cls}`}>
                {v.estado.toUpperCase()}
              </span>
            </div>
            {v.propiedad_titulo && (
              <p className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 mb-1">
                <Building2 size={10} /> {v.propiedad_titulo}
              </p>
            )}
            {v.notas && <p className="text-[10px] text-slate-500 leading-relaxed">{v.notas}</p>}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tab: Tareas ─────────────────────────────────────────────────────────────

const TAREA_PRIORIDAD_STYLE: Record<string, string> = {
  baja:  'bg-slate-50 text-slate-500',
  media: 'bg-amber-50 text-amber-700',
  alta:  'bg-orange-50 text-orange-700',
  urgente: 'bg-red-50 text-red-600',
};

const TAREA_ESTADO_ICON: Record<string, React.ReactNode> = {
  pendiente:   <div className="w-4 h-4 rounded-full border-2 border-slate-300" />,
  en_progreso: <div className="w-4 h-4 rounded-full border-2 border-indigo-400 bg-indigo-100" />,
  completada:  <CheckCircle2 size={16} className="text-emerald-500" />,
  cancelada:   <XCircle size={16} className="text-slate-300" />,
};

interface TareaLocal {
  id: string;
  titulo: string;
  descripcion?: string;
  prioridad: string;
  estado: string;
  fecha_vencimiento?: string;
}

const TabTareas: React.FC<{ lead: Client }> = ({ lead }) => {
  const [tareas, setTareas] = useState<TareaLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', prioridad: 'media', fecha_vencimiento: '' });

  useEffect(() => {
    const fetchTareas = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('tareas')
        .select('id, titulo, descripcion, prioridad, estado, fecha_vencimiento')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setTareas(data ?? []);
      setLoading(false);
    };
    fetchTareas();
  }, [lead.id]);

  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    setCreateError(null);
    const { data, error } = await supabase
      .from('tareas')
      .insert([{
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        prioridad: form.prioridad,
        estado: 'pendiente',
        lead_id: lead.id,
        asignados: [],
        etiquetas: [],
        fecha_vencimiento: form.fecha_vencimiento || null,
      }])
      .select('id, titulo, descripcion, prioridad, estado, fecha_vencimiento')
      .single();
    if (!error && data) {
      setTareas(prev => [data, ...prev]);
      setForm({ titulo: '', descripcion: '', prioridad: 'media', fecha_vencimiento: '' });
      setShowForm(false);
    } else if (error) {
      setCreateError('No se pudo crear la tarea. Intentá de nuevo.');
    }
    setSaving(false);
  };

  const toggleEstado = async (tarea: TareaLocal) => {
    const nuevoEstado = tarea.estado === 'completada' ? 'pendiente' : 'completada';
    setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, estado: nuevoEstado } : t));
    await supabase.from('tareas').update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq('id', tarea.id);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
          {tareas.length} tarea{tareas.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black transition-colors"
        >
          <Plus size={12} /> Nueva tarea
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
          <input
            type="text"
            placeholder="Título de la tarea *"
            className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          />
          <textarea
            placeholder="Descripción (opcional)"
            rows={2}
            className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          />
          <div className="flex gap-2">
            <select
              className="flex-1 bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.prioridad}
              onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
            <input
              type="date"
              className="flex-1 bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.fecha_vencimiento}
              onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !form.titulo.trim()}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-colors"
            >
              {saving ? 'Guardando...' : 'Crear tarea'}
            </button>
            <button
              onClick={() => { setShowForm(false); setCreateError(null); }}
              className="px-4 py-2 bg-white border border-indigo-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
          {createError && (
            <p className="text-[10px] font-bold text-rose-500 text-center">{createError}</p>
          )}
        </div>
      )}

      {/* List */}
      {tareas.length === 0 && !showForm ? (
        <div className="text-center py-10">
          <ListTodo size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-bold">Sin tareas para este cliente</p>
          <p className="text-[10px] text-slate-300 mt-1">Creá una con el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tareas.map(t => (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all ${t.estado === 'completada' ? 'opacity-50' : ''}`}
            >
              <button onClick={() => toggleEstado(t)} className="mt-0.5 shrink-0">
                {TAREA_ESTADO_ICON[t.estado] ?? TAREA_ESTADO_ICON.pendiente}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black text-slate-800 leading-snug ${t.estado === 'completada' ? 'line-through text-slate-400' : ''}`}>
                  {t.titulo}
                </p>
                {t.descripcion && (
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{t.descripcion}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${TAREA_PRIORIDAD_STYLE[t.prioridad] ?? 'bg-slate-50 text-slate-500'}`}>
                    {t.prioridad.toUpperCase()}
                  </span>
                  {t.fecha_vencimiento && (
                    <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                      <Calendar size={9} /> {t.fecha_vencimiento}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Chat ───────────────────────────────────────────────────────────────

const TabChat: React.FC<{ lead: Client }> = ({ lead }) => {
  const whatsapp = lead.whatsapp ?? lead.telefono;
  const numero = whatsapp?.replace(/\D/g, '');

  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
        <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">WhatsApp</p>
        <p className="text-xs text-green-700 font-bold mb-3">{whatsapp || 'Sin número'}</p>
        {numero && (
          <a
            href={`https://wa.me/${numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black transition-colors"
          >
            <MessageCircle size={14} />
            Abrir WhatsApp
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      {lead.email && (
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Email</p>
          <p className="text-xs text-blue-700 font-bold mb-3">{lead.email}</p>
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-colors"
          >
            <Mail size={14} />
            Enviar email
          </a>
        </div>
      )}

      {lead.primer_mensaje && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primer mensaje</p>
          <p className="text-xs text-slate-600 leading-relaxed italic">"{lead.primer_mensaje}"</p>
        </div>
      )}
    </div>
  );
};

// ─── Tab: Acciones ───────────────────────────────────────────────────────────

const TabAcciones: React.FC<{ lead: Client; onUpdate: (updated: Client) => void }> = ({ lead, onUpdate }) => {
  const [etapa, setEtapa] = useState(lead.etapa_proceso);
  const [temperatura, setTemperatura] = useState(lead.temperatura ?? '');
  const [vendedor, setVendedor] = useState(lead.vendedor_asignado_nombre ?? '');
  const [notas, setNotas] = useState(lead.notas_internas ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const { data, error } = await supabase
      .from('leads')
      .update({
        etapa_proceso: etapa,
        temperatura: temperatura || null,
        vendedor_asignado_nombre: vendedor || null,
        notas_internas: notas || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)
      .select()
      .single();

    if (!error && data) {
      onUpdate({ ...lead, ...data });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else if (error) {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
        {/* Etapa */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Etapa del proceso</label>
          <div className="grid grid-cols-2 gap-2">
            {ETAPAS_PROCESO.map(e => (
              <button
                key={e.value}
                onClick={() => setEtapa(e.value as any)}
                className={`py-2 px-3 rounded-xl text-[10px] font-black transition-all ${
                  etapa === e.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Temperatura */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Temperatura</label>
          <div className="flex gap-2">
            {(['frio', 'tibio', 'caliente', 'ultra'] as const).map(t => {
              const cfg = TEMP_CONFIG[t];
              const Icon = cfg.icon;
              return (
                <button
                  key={t}
                  onClick={() => setTemperatura(t)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-0.5 ${
                    temperatura === t
                      ? `${cfg.bg} ${cfg.text} ring-2 ring-current ring-offset-1`
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={12} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vendedor */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendedor asignado</label>
          <select
            value={vendedor}
            onChange={e => setVendedor(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Sin asignar</option>
            {VENDEDORES.filter(v => v.value !== 'sin_asignar').map(v => (
              <option key={v.value} value={v.label}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Notas internas */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas internas</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            placeholder="Notas visibles solo para el equipo..."
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900 text-white hover:bg-indigo-700'
          } disabled:opacity-50`}
        >
          {saved ? <><CheckCircle2 size={14} /> Guardado</> : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saveError && (
          <p className="text-[10px] font-bold text-rose-500 text-center mt-2">{saveError}</p>
        )}
      </div>

      {/* Acciones peligrosas */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1">
          <AlertTriangle size={10} /> Zona peligrosa
        </p>
        <button
          onClick={async () => {
            if (!window.confirm('¿Marcar como Perdido?')) return;
            const { data } = await supabase
              .from('leads')
              .update({ etapa_proceso: 'Perdido', updated_at: new Date().toISOString() })
              .eq('id', lead.id)
              .select()
              .single();
            if (data) onUpdate({ ...lead, ...data });
          }}
          className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle size={12} /> Marcar como Perdido
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PanelCliente: React.FC<PanelClienteProps> = ({ lead, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const temp = lead.temperatura?.toLowerCase();
  const tempCfg = temp ? TEMP_CONFIG[temp] : null;
  const initials = iniciales(lead.nombre, lead.apellido);
  const vendedorLabel = getVendedorLabel(lead.vendedor_asignado_nombre);
  const whatsapp = lead.whatsapp ?? lead.telefono;
  const numero = whatsapp?.replace(/\D/g, '');

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-slate-900/30 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          key="panel"
          ref={panelRef}
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.9 }}
          className="fixed right-0 top-0 bottom-0 z-[210] w-full md:w-[520px] lg:w-[580px] bg-[#F8FAFC] flex flex-col shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-6 pt-6 pb-0 shrink-0">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                    {initials}
                  </div>
                  {lead.estado_comercial === 'vip' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                      <Star size={10} className="text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-none">
                    {lead.nombre} {lead.apellido ?? ''}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    {lead.fuente_consulta}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {tempCfg && <TempPill temp={lead.temperatura} />}
                    <EtapaPill etapa={lead.etapa_proceso} />
                    {lead.estado_comercial === 'vip' && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full">VIP</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-500 hover:text-slate-800 shrink-0"
                title="Cerrar (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-5">
              {numero && (
                <a
                  href={`https://wa.me/${numero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-[11px] font-black transition-colors"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
              )}
              <a
                href={`tel:${lead.telefono}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black transition-colors"
              >
                <Phone size={13} /> Llamar
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black transition-colors"
                >
                  <Mail size={13} /> Email
                </a>
              )}
              <button
                onClick={() => setActiveTab('acciones')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-[11px] font-black transition-colors"
              >
                <Edit3 size={13} /> Editar
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 -mb-px overflow-x-auto no-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-black whitespace-nowrap border-b-2 transition-all shrink-0 ${
                      isActive
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'resumen'      && <TabResumen      lead={lead} />}
                {activeTab === 'historial'    && <TabHistorial    lead={lead} />}
                {activeTab === 'propiedades'  && <TabPropiedades  lead={lead} onUpdate={onUpdate} />}
                {activeTab === 'visitas'      && <TabVisitas      lead={lead} />}
                {activeTab === 'tareas'       && <TabTareas       lead={lead} />}
                {activeTab === 'chat'         && <TabChat         lead={lead} />}
                {activeTab === 'acciones'     && <TabAcciones     lead={lead} onUpdate={onUpdate} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer — vendedor */}
          <div className="shrink-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                {vendedorLabel.charAt(0)}
              </div>
              <span className="text-[10px] font-black text-slate-500">{vendedorLabel}</span>
            </div>
            <span className="text-[9px] text-slate-300 font-bold">
              {lead.ultimo_contacto ? tiempoRelativo(lead.ultimo_contacto) : tiempoRelativo(lead.updated_at)}
            </span>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default PanelCliente;
