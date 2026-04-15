import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientesService } from '../services/clientesService';
import { supabase } from '../services/supabaseClient';
import { Client } from '../types';
import PanelCliente from '../components/shared/PanelCliente';
import AdvancedFilterPanel, {
  AdvancedFilters,
  INITIAL_ADVANCED_FILTERS,
  countActiveAdvancedFilters,
} from '../components/shared/AdvancedFilterPanel';
import { ETAPAS_PROCESO, VENDEDORES } from '../config/taxonomy';
import {
  Phone, Plus, X, Search, Edit, AlertTriangle, RefreshCw,
  ChevronDown, Check, SlidersHorizontal, SearchX, ChevronLeft, ChevronRight, ArrowRight, Mail,
  Snowflake, Sun, Flame, Zap,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const POR_PAGINA = 25;

function iniciales(nombre: string, apellido?: string): string {
  const n = nombre.trim().charAt(0).toUpperCase();
  const words = nombre.trim().split(' ');
  const a = apellido?.trim().charAt(0).toUpperCase() ?? words[1]?.charAt(0).toUpperCase() ?? '';
  return `${n}${a}`;
}

function tiempoRelativo(fecha?: string): string {
  if (!fecha) return 'Sin contacto';
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min}m`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `Hace ${hs}h`;
  const dias = Math.floor(hs / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias}d`;
  if (dias < 30) return `Hace ${Math.floor(dias / 7)}sem`;
  return `Hace ${Math.floor(dias / 30)}mes`;
}

const etapaColor: Record<string, string> = {
  'Inicio': 'bg-slate-100 text-slate-500',
  'Indagación': 'bg-blue-50 text-blue-600',
  'Seguimiento': 'bg-indigo-50 text-indigo-600',
  'Visita agendada': 'bg-indigo-50 text-indigo-600',
  'Negociación': 'bg-amber-50 text-amber-700',
  'Cierre': 'bg-emerald-50 text-emerald-600',
};

const tempConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  frio:     { label: 'Frío',     bg: 'bg-blue-50',   text: 'text-blue-600',   icon: Snowflake },
  tibio:    { label: 'Tibio',    bg: 'bg-amber-50',  text: 'text-amber-600',  icon: Sun       },
  caliente: { label: 'Caliente', bg: 'bg-red-50',    text: 'text-red-600',    icon: Flame     },
  ultra:    { label: 'Ultra',    bg: 'bg-rose-50',   text: 'text-rose-700',   icon: Zap       },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const MicroBadge: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${className}`}>
    {label}
  </span>
);

const TempBadge: React.FC<{ temp?: string }> = ({ temp }) => {
  if (!temp) return null;
  const cfg = tempConfig[temp] ?? { label: temp, bg: 'bg-slate-50', text: 'text-slate-500', icon: Snowflake };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      <Icon size={10} className="shrink-0" />
      {cfg.label}
    </span>
  );
};

const EtapaBadge: React.FC<{ etapa?: string }> = ({ etapa }) => {
  if (!etapa) return null;
  const cls = etapaColor[etapa] ?? 'bg-slate-100 text-slate-500';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${cls}`}>
      {etapa}
    </span>
  );
};

const VendedorAvatar: React.FC<{ nombre?: string }> = ({ nombre }) => {
  if (!nombre) {
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 text-[9px] font-black flex items-center justify-center">
        --
      </span>
    );
  }
  const v = VENDEDORES.find(vnd => vnd.label === nombre);
  const ini = v?.iniciales ?? nombre.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black flex items-center justify-center shrink-0">
        {ini}
      </span>
      <span className="text-xs font-bold text-slate-700 hidden xl:block truncate max-w-[100px]">{nombre}</span>
    </div>
  );
};

// ── Custom hook ──────────────────────────────────────────────────────────────

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void,
): void {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ── KPI Cards ─────────────────────────────────────────────────────────────────

interface KPIData {
  total: number | null;
  calientes: number | null;
  negociacion: number | null;
  visitaAgendada: number | null;
  sinAsignar: number | null;
}

const KPICards: React.FC = () => {
  const [data, setData] = useState<KPIData>({
    total: null,
    calientes: null,
    negociacion: null,
    visitaAgendada: null,
    sinAsignar: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).in('temperatura', ['caliente', 'ultra']),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('etapa_proceso', 'Negociación'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('etapa_proceso', 'Visita agendada'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).is('vendedor_asignado_nombre', null),
      ]);

      if (!cancelled) {
        setData({
          total: r1.count ?? 0,
          calientes: r2.count ?? 0,
          negociacion: r3.count ?? 0,
          visitaAgendada: r4.count ?? 0,
          sinAsignar: r5.count ?? 0,
        });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const skeleton = 'h-10 w-16 bg-slate-100 rounded-xl animate-pulse';

  const cards: Array<{
    label: string;
    value: number | null;
    accent: string;
    badge?: string;
    alert?: boolean;
  }> = [
    { label: 'Total Oportunidades', value: data.total, accent: 'bg-indigo-50/50', badge: undefined },
    { label: 'Leads Calientes', value: data.calientes, accent: 'bg-red-50/50', badge: '🔥' },
    { label: 'En Negociación', value: data.negociacion, accent: 'bg-amber-50/50', badge: undefined },
    { label: 'Visita Agendada', value: data.visitaAgendada, accent: 'bg-emerald-50/50', badge: undefined },
    { label: 'Sin Asignar', value: data.sinAsignar, accent: 'bg-slate-50/50', badge: undefined, alert: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 animate-fade-in">
      {cards.map((card) => {
        const isAlert = card.alert && card.value !== null && card.value > 0;
        return (
          <div
            key={card.label}
            className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-all group overflow-hidden relative
              ${isAlert ? 'border-red-200 ring-1 ring-red-200' : 'border-slate-100'}`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${card.accent} rounded-bl-[3rem] group-hover:scale-110 transition-transform`} />
            <h3 className={`text-[9px] font-black uppercase tracking-widest mb-3 relative z-10
              ${isAlert ? 'text-red-400' : 'text-slate-400'}`}>
              {card.label}
            </h3>
            <div className="relative z-10">
              {card.value === null ? (
                <div className={skeleton} />
              ) : (
                <span className={`text-3xl font-black tracking-tighter ${isAlert ? 'text-red-600' : 'text-slate-900'}`}>
                  {card.badge && <span className="mr-1">{card.badge}</span>}
                  {card.value}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Client Form Modal ─────────────────────────────────────────────────────────

const ClientFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  clientToEdit?: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    nombre: '',
    email: '',
    telefono: '',
    busca_venta: true,
    busca_alquiler: false,
    temperatura: 'tibio',
    etapa_proceso: 'Inicio',
  });

  useEffect(() => {
    if (clientToEdit) {
      setFormData(clientToEdit);
    } else {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        busca_venta: true,
        busca_alquiler: false,
        temperatura: 'tibio',
        etapa_proceso: 'Inicio',
      });
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...clientToEdit, ...formData } as Client);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative animate-fade-in p-10 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {clientToEdit ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </h2>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                placeholder="Ej: Marcelo Perez"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                placeholder="marcelo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                placeholder="+54 9..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Operación</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, busca_venta: true, busca_alquiler: false })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.busca_venta ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                  Venta
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, busca_venta: false, busca_alquiler: true })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.busca_alquiler ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                  Alquiler
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
              <select
                value={formData.temperatura}
                onChange={e => setFormData({ ...formData, temperatura: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
              >
                <option value="frio">Frío</option>
                <option value="tibio">Tibio</option>
                <option value="caliente">Caliente</option>
                <option value="ultra_caliente">Ultra Caliente</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] text-white bg-slate-900 hover:bg-indigo-600 shadow-xl transition-all active:scale-95 mt-4"
          >
            {clientToEdit ? 'Guardar Cambios' : 'Crear Oportunidad'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Filter types & constants ──────────────────────────────────────────────────

type FiltroOperacion = 'venta' | 'alquiler' | 'inversion' | 'temporario';
type DropdownKey = 'etapa' | 'temperatura' | 'vendedor';

const TEMP_OPTS = [
  { value: 'frio', label: '❄️ Frío' },
  { value: 'tibio', label: '🌡️ Tibio' },
  { value: 'caliente', label: '🔥 Caliente' },
  { value: 'ultra_caliente', label: '⚡ Ultra' },
] as const;

const OPERACION_PILLS: Array<{ value: FiltroOperacion; label: string }> = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'inversion', label: 'Inversión' },
  { value: 'temporario', label: 'Temporario' },
];

// ── Pagination helper ─────────────────────────────────────────────────────────

function buildPageList(pagina: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (pagina > 3) pages.push('...');
  const from = Math.max(2, pagina - 1);
  const to = Math.min(total - 1, pagina + 1);
  for (let i = from; i <= to; i++) pages.push(i);
  if (pagina < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ── Main Component ────────────────────────────────────────────────────────────

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [pagina, setPagina] = useState(1);

  // Quick filters
  const [filtroOperacion, setFiltroOperacion] = useState<FiltroOperacion[]>([]);
  const [filtroTemperatura, setFiltroTemperatura] = useState<string[]>([]);
  const [filtroEtapa, setFiltroEtapa] = useState<string | null>(null);
  const [filtroVendedor, setFiltroVendedor] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  // Advanced filters
  const [advFiltersOpen, setAdvFiltersOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState<AdvancedFilters>(INITIAL_ADVANCED_FILTERS);

  const filterBarRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterBarRef, () => setOpenDropdown(null));

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const clientsData = await clientesService.getClientes();
      setClients(clientsData as Client[]);
    } catch {
      setError('Error al cargar las oportunidades. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleLeadUpdate = useCallback((updated: Client) => {
    setClients(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedClient(updated);
  }, []);

  const handleSaveClient = async (clientData: Client) => {
    try {
      if (clientData.id && !String(clientData.id).startsWith('CL-')) {
        await clientesService.updateCliente(String(clientData.id), clientData);
      } else {
        const { id: _drop, ...dataWithoutId } = clientData as Client & { id?: string };
        await clientesService.createCliente(dataWithoutId as Omit<Client, 'id'>);
      }
      await loadClients();
      setIsModalOpen(false);
      setClientToEdit(null);
    } catch {
      alert('Error al guardar la oportunidad. Revisá los campos e intentá de nuevo.');
    }
  };

  const handleEditClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  // In-memory filtering via useMemo
  const clientesFiltrados = useMemo(() => {
    let list = [...clients];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        c =>
          c.nombre.toLowerCase().includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false),
      );
    }

    if (filtroOperacion.length > 0) {
      list = list.filter(
        c =>
          (filtroOperacion.includes('venta') && c.busca_venta) ||
          (filtroOperacion.includes('alquiler') && c.busca_alquiler) ||
          (filtroOperacion.includes('inversion') && c.busca_inversion) ||
          (filtroOperacion.includes('temporario') && c.busca_temporario),
      );
    }

    if (filtroTemperatura.length > 0) {
      list = list.filter(c => filtroTemperatura.includes(c.temperatura ?? ''));
    }

    if (filtroEtapa) {
      list = list.filter(c => c.etapa_proceso === filtroEtapa);
    }

    if (filtroVendedor.length > 0) {
      list = list.filter(c =>
        filtroVendedor.includes(c.vendedor_asignado_nombre ?? ''),
      );
    }

    // Advanced filters
    if (advFilters.searchText.trim()) {
      const q = advFilters.searchText.toLowerCase();
      list = list.filter(
        c =>
          c.nombre.toLowerCase().includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          (c.telefono?.toLowerCase().includes(q) ?? false),
      );
    }
    if (advFilters.temperaturas.length > 0) {
      list = list.filter(c => advFilters.temperaturas.includes(c.temperatura ?? ''));
    }
    if (advFilters.etapas.length > 0) {
      list = list.filter(c => advFilters.etapas.includes(c.etapa_proceso ?? ''));
    }
    if (advFilters.operaciones.length > 0) {
      list = list.filter(
        c =>
          (advFilters.operaciones.includes('venta') && c.busca_venta) ||
          (advFilters.operaciones.includes('alquiler') && c.busca_alquiler) ||
          (advFilters.operaciones.includes('inversion') && c.busca_inversion) ||
          (advFilters.operaciones.includes('temporario') && c.busca_temporario),
      );
    }
    if (advFilters.vendedores.length > 0) {
      list = list.filter(c => advFilters.vendedores.includes(c.vendedor_asignado_nombre ?? ''));
    }
    if (advFilters.fuentes.length > 0) {
      list = list.filter(c => advFilters.fuentes.includes(c.fuente ?? ''));
    }
    if (advFilters.presupuestoVentaMin !== undefined) {
      list = list.filter(c => (c.presupuesto_venta_usd ?? 0) >= advFilters.presupuestoVentaMin!);
    }
    if (advFilters.presupuestoVentaMax !== undefined) {
      list = list.filter(c => (c.presupuesto_venta_usd ?? Infinity) <= advFilters.presupuestoVentaMax!);
    }
    if (advFilters.presupuestoAlqMin !== undefined) {
      list = list.filter(c => (c.presupuesto_alquiler_ars ?? 0) >= advFilters.presupuestoAlqMin!);
    }
    if (advFilters.presupuestoAlqMax !== undefined) {
      list = list.filter(c => (c.presupuesto_alquiler_ars ?? Infinity) <= advFilters.presupuestoAlqMax!);
    }
    if (advFilters.scoreMin !== undefined) {
      list = list.filter(c => (c.score ?? 0) >= advFilters.scoreMin!);
    }
    if (advFilters.inactividadDias !== undefined) {
      const cutoff = new Date(Date.now() - advFilters.inactividadDias * 86400000).toISOString();
      list = list.filter(c => !c.updated_at || c.updated_at <= cutoff);
    }
    if (advFilters.fechaDesde) {
      list = list.filter(c => c.created_at && c.created_at >= advFilters.fechaDesde!);
    }
    if (advFilters.fechaHasta) {
      list = list.filter(c => c.created_at && c.created_at <= advFilters.fechaHasta! + 'T23:59:59');
    }
    if (advFilters.conVisitaProxima) {
      list = list.filter(c => c.proxima_visita != null);
    }

    return list;
  }, [clients, searchTerm, filtroOperacion, filtroTemperatura, filtroEtapa, filtroVendedor, advFilters]);

  // Reset page when filters change
  useEffect(() => {
    setPagina(1);
  }, [clientesFiltrados]);

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / POR_PAGINA));
  const leadsPagina = clientesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const activeFilterCount =
    filtroOperacion.length +
    filtroTemperatura.length +
    (filtroEtapa ? 1 : 0) +
    filtroVendedor.length +
    countActiveAdvancedFilters(advFilters);

  const clearFilters = () => {
    setFiltroOperacion([]);
    setFiltroTemperatura([]);
    setFiltroEtapa(null);
    setFiltroVendedor([]);
    setOpenDropdown(null);
    setAdvFilters(INITIAL_ADVANCED_FILTERS);
  };

  const toggleOperacion = (v: FiltroOperacion) =>
    setFiltroOperacion(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v],
    );

  const toggleMulti = (
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) =>
    setter(current.includes(value) ? current.filter(x => x !== value) : [...current, value]);

  // ── Empty state ──────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <div className="py-24 flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center">
        <SearchX size={28} className="text-slate-200" />
      </div>
      <div className="text-center">
        <p className="font-black text-slate-700 text-base">Sin resultados</p>
        <p className="text-xs text-slate-400 font-bold mt-1 max-w-xs">
          No hay oportunidades para los filtros aplicados.
        </p>
      </div>
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
        >
          <X size={13} /> Limpiar filtros
        </button>
      )}
    </div>
  );

  // ── Pagination bar ───────────────────────────────────────────────────────────
  const PaginationBar = () => {
    if (totalPaginas <= 1) return null;
    const pageList = buildPageList(pagina, totalPaginas);
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white/60">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, clientesFiltrados.length)} de {clientesFiltrados.length}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={15} />
          </button>
          {pageList.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="w-8 text-center text-slate-300 text-xs font-black">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPagina(p as number)}
                className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all ${
                  pagina === p ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {selectedClient && (
          <PanelCliente
            lead={selectedClient}
            onClose={() => setSelectedClient(null)}
            onUpdate={handleLeadUpdate}
          />
        )}
      </AnimatePresence>

      <AdvancedFilterPanel
        isOpen={advFiltersOpen}
        onClose={() => setAdvFiltersOpen(false)}
        module="clientes"
        currentFilters={advFilters}
        onApply={(f) => { setAdvFilters(f); setAdvFiltersOpen(false); }}
        onReset={() => setAdvFilters(INITIAL_ADVANCED_FILTERS)}
      />

      <div className="max-w-[1600px] mx-auto animate-fade-in pb-16">

        <ClientFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setClientToEdit(null); }}
          onSave={handleSaveClient}
          clientToEdit={clientToEdit}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-3">
              Cartera Clientes
            </h1>
            <p className="text-slate-400 font-bold text-xs md:text-base uppercase tracking-[0.2em]">
              Gestión avanzada de relaciones con Flor IA.
            </p>
          </div>
          <button
            onClick={() => { setClientToEdit(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-[2.5rem] font-black text-[10px] sm:text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> NUEVA OPORTUNIDAD
          </button>
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-4 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
            <AlertTriangle size={18} className="shrink-0" />
            <span className="text-xs font-bold flex-1">{error}</span>
            <button
              onClick={loadClients}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl transition-all"
            >
              <RefreshCw size={14} /> Reintentar
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col min-h-[700px]">

          {/* Filter bar */}
          <div
            ref={filterBarRef}
            className="p-4 border-b border-slate-100 bg-white/60 sticky top-0 z-20 flex flex-wrap gap-3 items-center"
          >
            {/* Search */}
            <div className="relative w-full sm:w-[260px]">
              <Search size={16} className="absolute left-4 top-3.5 text-slate-300" strokeWidth={3} />
              <input
                type="text"
                placeholder="Buscar oportunidad..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none w-full transition-all"
              />
            </div>

            <div className="w-px h-8 bg-slate-100 hidden sm:block" />

            {/* Operación pills */}
            {OPERACION_PILLS.map(pill => (
              <button
                key={pill.value}
                onClick={() => toggleOperacion(pill.value)}
                className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                  ${filtroOperacion.includes(pill.value)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
              >
                {pill.label}
              </button>
            ))}

            <div className="w-px h-8 bg-slate-100 hidden sm:block" />

            {/* Etapa dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(prev => prev === 'etapa' ? null : 'etapa')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border
                  ${openDropdown === 'etapa' || filtroEtapa
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
              >
                Etapa
                {filtroEtapa && <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">1</span>}
                <ChevronDown size={13} className={`transition-transform ${openDropdown === 'etapa' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'etapa' && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 py-2 min-w-[200px]">
                  {ETAPAS_PROCESO.map(etapa => (
                    <button
                      key={etapa.value}
                      onClick={() => { setFiltroEtapa(filtroEtapa === etapa.value ? null : etapa.value); setOpenDropdown(null); }}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {etapa.label}
                      {filtroEtapa === etapa.value && <Check size={13} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Temperatura dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(prev => prev === 'temperatura' ? null : 'temperatura')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border
                  ${openDropdown === 'temperatura' || filtroTemperatura.length > 0
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
              >
                Temperatura
                {filtroTemperatura.length > 0 && (
                  <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                    {filtroTemperatura.length}
                  </span>
                )}
                <ChevronDown size={13} className={`transition-transform ${openDropdown === 'temperatura' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'temperatura' && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 py-2 min-w-[180px]">
                  {TEMP_OPTS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleMulti(opt.value, filtroTemperatura, setFiltroTemperatura)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {opt.label}
                      {filtroTemperatura.includes(opt.value) && <Check size={13} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vendedor dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(prev => prev === 'vendedor' ? null : 'vendedor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border
                  ${openDropdown === 'vendedor' || filtroVendedor.length > 0
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
              >
                Vendedor
                {filtroVendedor.length > 0 && (
                  <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                    {filtroVendedor.length}
                  </span>
                )}
                <ChevronDown size={13} className={`transition-transform ${openDropdown === 'vendedor' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'vendedor' && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 py-2 min-w-[220px]">
                  {VENDEDORES.filter(v => v.value !== 'sin_asignar').map(v => (
                    <button
                      key={v.value}
                      onClick={() => toggleMulti(v.label, filtroVendedor, setFiltroVendedor)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black flex items-center justify-center shrink-0">
                          {v.iniciales}
                        </span>
                        {v.label}
                      </span>
                      {filtroVendedor.includes(v.label) && <Check size={13} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active count + clear + advanced */}
            <div className="flex items-center gap-2 ml-auto">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  <X size={12} />
                  {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''}
                </button>
              )}
              <button
                onClick={() => setAdvFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 text-[11px] font-black uppercase tracking-widest transition-all"
              >
                <SlidersHorizontal size={13} />
                Filtros avanzados
              </button>
            </div>
          </div>

          {/* ── Mobile View ────────────────────────────────────────────────── */}
          <div className="lg:hidden p-5 space-y-3 bg-white/40">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando...</p>
              </div>
            ) : leadsPagina.length > 0 ? (
              <>
                {leadsPagina.map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedClient(client)}
                    className="bg-white border border-slate-100 p-5 rounded-[2rem] cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-black text-sm text-indigo-600 shrink-0">
                          {iniciales(client.nombre, client.apellido)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm leading-tight">{client.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{client.fuente_consulta}</p>
                        </div>
                      </div>
                      <button
                        onClick={e => handleEditClick(e, client)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                      >
                        <Edit size={13} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {client.busca_venta && <MicroBadge label="Venta" className="bg-emerald-50 text-emerald-600 border-emerald-100" />}
                      {client.busca_alquiler && <MicroBadge label="Alquiler" className="bg-blue-50 text-blue-600 border-blue-100" />}
                      {client.busca_inversion && <MicroBadge label="Inversión" className="bg-indigo-50 text-indigo-600 border-indigo-100" />}
                      {client.busca_temporario && <MicroBadge label="Temp." className="bg-blue-50 text-blue-600 border-blue-100" />}
                      <TempBadge temp={client.temperatura} />
                      <EtapaBadge etapa={client.etapa_proceso} />
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Phone size={9} /> {client.telefono}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {tiempoRelativo(client.ultimo_contacto)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <PaginationBar />
              </>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* ── Desktop View (Table) ────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col flex-1 overflow-auto bg-white/40">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando Cartera...</p>
              </div>
            ) : leadsPagina.length > 0 ? (
              <>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                      <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-5 py-4 text-left">Cliente</th>
                        <th className="px-5 py-4 text-left">Contacto</th>
                        <th className="px-5 py-4 text-left">Busca</th>
                        <th className="px-5 py-4 text-left">Etapa</th>
                        <th className="px-5 py-4 text-left">Temp</th>
                        <th className="px-5 py-4 text-left">Vendedor</th>
                        <th className="px-5 py-4 text-left">Último contacto</th>
                        <th className="px-5 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leadsPagina.map(client => (
                        <tr
                          key={client.id}
                          onClick={() => setSelectedClient(client)}
                          className="hover:bg-indigo-50/30 cursor-pointer group transition-colors"
                        >
                          {/* Cliente */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center shrink-0">
                                {iniciales(client.nombre, client.apellido)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                  {client.nombre}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                  {client.fuente_consulta}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Contacto */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Phone size={10} className="text-slate-300 shrink-0" /> {client.telefono}
                              </p>
                              {client.email && (
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                  <Mail size={10} className="text-slate-300 shrink-0" /> {client.email}
                                </p>
                              )}
                            </div>
                          </td>
                          {/* Busca */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {client.busca_venta && <MicroBadge label="Venta" className="bg-emerald-50 text-emerald-600 border-emerald-100" />}
                              {client.busca_alquiler && <MicroBadge label="Alquiler" className="bg-blue-50 text-blue-600 border-blue-100" />}
                              {client.busca_inversion && <MicroBadge label="Inversión" className="bg-indigo-50 text-indigo-600 border-indigo-100" />}
                              {client.busca_temporario && <MicroBadge label="Temp." className="bg-blue-50 text-blue-600 border-blue-100" />}
                            </div>
                          </td>
                          {/* Etapa */}
                          <td className="px-5 py-4">
                            <EtapaBadge etapa={client.etapa_proceso} />
                          </td>
                          {/* Temp */}
                          <td className="px-5 py-4">
                            <TempBadge temp={client.temperatura} />
                          </td>
                          {/* Vendedor */}
                          <td className="px-5 py-4">
                            <VendedorAvatar nombre={client.vendedor_asignado_nombre} />
                          </td>
                          {/* Último contacto */}
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-slate-500">
                              {tiempoRelativo(client.ultimo_contacto)}
                            </span>
                          </td>
                          {/* Arrow */}
                          <td className="px-5 py-4">
                            <button className="p-2 rounded-2xl text-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <ArrowRight size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Clients;
