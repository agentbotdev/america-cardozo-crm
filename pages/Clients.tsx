import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leadsService } from '../services/leadsService';
import { propertiesService } from '../services/propertiesService';
import { Lead } from '../types';
import {
  User, Phone, Mail, Search, Filter, Download, ChevronDown, ChevronUp,
  ArrowUpDown, TrendingUp, Users, Home, Building, DollarSign, Calendar,
  X, Target, Clock, Zap, Tag, CheckCircle2, MessageCircle
} from 'lucide-react';
import { LeadDetailPanel } from './Leads';
import {
  TEMPERATURAS_LEAD,
  ETAPAS_PROCESO,
  VENDEDORES,
  FUENTES_LEAD
} from '../config/taxonomy';

// ============================================================================
// INTERFACES
// ============================================================================

interface ClientFilters {
  searchText: string;
  temperaturas: string[];
  etapas: string[];
  operaciones: string[]; // 'venta', 'alquiler', 'inversion'
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

type SortField = 'nombre' | 'created_at' | 'ultima_interaccion' | 'score' | 'temperatura';
type SortOrder = 'asc' | 'desc';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; count: number }> = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active
        ? 'bg-slate-900 text-white shadow-lg'
        : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'
    }`}
  >
    {label} ({count})
  </button>
);

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const Clients: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'todos' | 'venta' | 'alquiler' | 'inversion' | 'cerrados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filters
  const [filters, setFilters] = useState<ClientFilters>({
    searchText: '',
    temperaturas: [],
    etapas: [],
    operaciones: [],
    vendedores: [],
    fuentes: [],
    conVisitaProxima: false
  });

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, propsData] = await Promise.all([
        leadsService.fetchLeads(),
        propertiesService.fetchProperties()
      ]);
      setLeads(leadsData as Lead[]);
      setProperties(propsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = <K extends keyof ClientFilters>(key: K, value: ClientFilters[K]) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleArrayValue = (key: keyof ClientFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as any);
  };

  const clearAllFilters = () => {
    setFilters({
      searchText: '',
      temperaturas: [],
      etapas: [],
      operaciones: [],
      vendedores: [],
      fuentes: [],
      conVisitaProxima: false
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Calculate relative time
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => {
      // Tab filter
      let matchesTab = true;
      if (activeTab === 'venta') matchesTab = lead.busca_venta;
      else if (activeTab === 'alquiler') matchesTab = lead.busca_alquiler;
      else if (activeTab === 'inversion') matchesTab = lead.busca_inversion;
      else if (activeTab === 'cerrados') matchesTab = lead.temperatura === 'cerrado';

      // Search term
      const matchesSearch = !searchTerm ||
        (lead.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (lead.telefono?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // Advanced filters
      const matchesAdvancedSearch = !filters.searchText ||
        (lead.nombre?.toLowerCase() || '').includes(filters.searchText.toLowerCase()) ||
        (lead.email?.toLowerCase() || '').includes(filters.searchText.toLowerCase()) ||
        (lead.telefono?.toLowerCase() || '').includes(filters.searchText.toLowerCase());

      const matchesTemperatura = filters.temperaturas.length === 0 ||
        filters.temperaturas.includes(lead.temperatura);

      const matchesEtapa = filters.etapas.length === 0 ||
        filters.etapas.includes(lead.etapa_proceso || '');

      const matchesOperacion = filters.operaciones.length === 0 ||
        (filters.operaciones.includes('venta') && lead.busca_venta) ||
        (filters.operaciones.includes('alquiler') && lead.busca_alquiler) ||
        (filters.operaciones.includes('inversion') && lead.busca_inversion);

      const matchesVendedor = filters.vendedores.length === 0 ||
        filters.vendedores.includes(lead.vendedor_asignado || '');

      const matchesFuente = filters.fuentes.length === 0 ||
        filters.fuentes.includes(lead.fuente_consulta);

      const matchesPresupuesto =
        (!filters.presupuestoMin || (lead.presupuesto_max || 0) >= filters.presupuestoMin) &&
        (!filters.presupuestoMax || (lead.presupuesto_max || 0) <= filters.presupuestoMax);

      const matchesScore = !filters.scoreMin || (lead.score || 0) >= filters.scoreMin;

      return matchesTab && matchesSearch && matchesAdvancedSearch && matchesTemperatura &&
        matchesEtapa && matchesOperacion && matchesVendedor && matchesFuente &&
        matchesPresupuesto && matchesScore;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'nombre') {
        comparison = (a.nombre || '').localeCompare(b.nombre || '');
      } else if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'ultima_interaccion') {
        comparison = new Date(a.ultima_interaccion || a.created_at).getTime() -
                     new Date(b.ultima_interaccion || b.created_at).getTime();
      } else if (sortField === 'score') {
        comparison = (a.score || 0) - (b.score || 0);
      } else if (sortField === 'temperatura') {
        const tempOrder: Record<string, number> = {
          'ultra_caliente': 6, 'caliente': 5, 'tibio': 4,
          'frio': 3, 'pausado': 2, 'perdido': 1, 'cerrado': 7
        };
        comparison = (tempOrder[a.temperatura] || 0) - (tempOrder[b.temperatura] || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [leads, activeTab, searchTerm, filters, sortField, sortOrder]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // Tab counts
  const tabCounts = useMemo(() => ({
    todos: leads.length,
    venta: leads.filter(l => l.busca_venta).length,
    alquiler: leads.filter(l => l.busca_alquiler).length,
    inversion: leads.filter(l => l.busca_inversion).length,
    cerrados: leads.filter(l => l.temperatura === 'cerrado').length
  }), [leads]);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Nombre', 'Teléfono', 'Email', 'Temperatura', 'Etapa', 'Score', 'Vendedor', 'Fecha Creación'];
    const rows = filteredLeads.map(lead => [
      lead.nombre,
      lead.telefono,
      lead.email || '',
      lead.temperatura,
      lead.etapa_proceso || '',
      lead.score || 0,
      lead.vendedor_asignado || '',
      new Date(lead.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const statusColors: Record<string, string> = {
    frio: 'bg-blue-100 text-blue-600',
    tibio: 'bg-amber-100 text-amber-600',
    caliente: 'bg-rose-100 text-rose-600',
    ultra_caliente: 'bg-red-100 text-red-600',
    pausado: 'bg-slate-100 text-slate-600',
    perdido: 'bg-red-100 text-red-600',
    derivado: 'bg-orange-100 text-orange-600',
    cerrado: 'bg-green-100 text-green-600'
  };

  const stageColors: Record<string, string> = {
    contacto_inicial: 'bg-slate-100 text-slate-600',
    indagacion: 'bg-indigo-100 text-indigo-600',
    props_enviadas: 'bg-purple-100 text-purple-600',
    visita_agendada: 'bg-blue-100 text-blue-600',
    visita_realizada: 'bg-cyan-100 text-cyan-600',
    negociacion: 'bg-amber-100 text-amber-600',
    cierre: 'bg-emerald-100 text-emerald-600',
    postventa: 'bg-green-100 text-green-600'
  };

  return (
    <>
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedLead(null)}
            />
            <LeadDetailPanel
              lead={selectedLead}
              properties={properties}
              onClose={() => setSelectedLead(null)}
              onEdit={(l) => {
                setSelectedLead(null);
                // Could open edit modal here
              }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1800px] mx-auto animate-fade-in pb-16 px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3">
              Clientes / Leads
            </h1>
            <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest">
              <Users size={14} className="inline mr-2" />
              {filteredLeads.length} de {leads.length} registros
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="bg-white border border-slate-200 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2 text-slate-700 hover:text-indigo-600"
            >
              <Filter size={18} />
              Filtros
            </button>
            <button
              onClick={exportCSV}
              className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <TabButton active={activeTab === 'todos'} onClick={() => setActiveTab('todos')} label="Todos" count={tabCounts.todos} />
            <TabButton active={activeTab === 'venta'} onClick={() => setActiveTab('venta')} label="Venta" count={tabCounts.venta} />
            <TabButton active={activeTab === 'alquiler'} onClick={() => setActiveTab('alquiler')} label="Alquiler" count={tabCounts.alquiler} />
            <TabButton active={activeTab === 'inversion'} onClick={() => setActiveTab('inversion')} label="Inversión" count={tabCounts.inversion} />
            <TabButton active={activeTab === 'cerrados'} onClick={() => setActiveTab('cerrados')} label="Cerrados" count={tabCounts.cerrados} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2 mb-8 flex items-center">
          <Search size={20} className="text-slate-400 ml-4 mr-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold outline-none py-3"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead className="bg-slate-50/30 text-[10px] uppercase text-slate-400 font-black tracking-[0.3em] border-b border-slate-50">
                <tr>
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('nombre')}>
                    <div className="flex items-center gap-2">
                      Nombre <SortIcon field="nombre" />
                    </div>
                  </th>
                  <th className="px-6 py-5">Contacto</th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('temperatura')}>
                    <div className="flex items-center gap-2">
                      Temperatura <SortIcon field="temperatura" />
                    </div>
                  </th>
                  <th className="px-6 py-5">Etapa</th>
                  <th className="px-6 py-5">Tipo Buscado</th>
                  <th className="px-6 py-5">Vendedor</th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('ultima_interaccion')}>
                    <div className="flex items-center gap-2">
                      Última Int. <SortIcon field="ultima_interaccion" />
                    </div>
                  </th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('score')}>
                    <div className="flex items-center gap-2">
                      Score <SortIcon field="score" />
                    </div>
                  </th>
                  <th className="px-6 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="w-32 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="w-28 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="w-20 h-6 bg-slate-200 rounded-full"></div></td>
                      <td className="px-6 py-5"><div className="w-24 h-6 bg-slate-200 rounded-full"></div></td>
                      <td className="px-6 py-5"><div className="w-16 h-6 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="w-20 h-6 bg-slate-200 rounded-full"></div></td>
                      <td className="px-6 py-5"><div className="w-24 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="w-16 h-2 bg-slate-200 rounded-full"></div></td>
                      <td className="px-6 py-5"><div className="w-10 h-10 bg-slate-200 rounded-full"></div></td>
                    </tr>
                  ))
                ) : paginatedLeads.length > 0 ? (
                  paginatedLeads.map((lead) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {lead.nombre}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">ID: {lead.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                          <Phone size={12} /> {lead.telefono}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail size={12} /> {lead.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${statusColors[lead.temperatura] || 'bg-slate-100 text-slate-600'}`}>
                          {lead.temperatura}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${stageColors[lead.etapa_proceso || 'contacto_inicial'] || 'bg-slate-100 text-slate-600'}`}>
                          {lead.etapa_proceso || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {lead.busca_venta && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[9px] font-bold">Venta</span>}
                          {lead.busca_alquiler && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[9px] font-bold">Alquiler</span>}
                          {lead.busca_inversion && <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold">Inversión</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {lead.vendedor_asignado ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                              {VENDEDORES.find(v => v.value === lead.vendedor_asignado)?.iniciales || lead.vendedor_asignado.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {VENDEDORES.find(v => v.value === lead.vendedor_asignado)?.label || lead.vendedor_asignado}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock size={12} />
                          {getRelativeTime(lead.ultima_interaccion || lead.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                (lead.score || 0) > 70 ? 'bg-emerald-500' :
                                (lead.score || 0) > 40 ? 'bg-indigo-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${lead.score || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-slate-900 w-10">{lead.score || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="p-2 text-slate-300 group-hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-slate-100"
                        >
                          <Target size={18} strokeWidth={3} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <Users size={48} className="mx-auto mb-4 text-slate-200" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                        No se encontraron leads
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 text-indigo-600 font-bold uppercase text-xs tracking-widest hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse">
                <div className="w-32 h-4 bg-slate-200 rounded mb-3"></div>
                <div className="w-24 h-3 bg-slate-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-3">
                  <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
                  <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full"></div>
              </div>
            ))
          ) : paginatedLeads.length > 0 ? (
            paginatedLeads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedLead(lead)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg mb-1">{lead.nombre}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Phone size={12} /> {lead.telefono}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 mb-1">{lead.score || 0}%</div>
                    <div className="text-[9px] text-slate-400">Score</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${statusColors[lead.temperatura] || 'bg-slate-100 text-slate-600'}`}>
                    {lead.temperatura}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${stageColors[lead.etapa_proceso || 'contacto_inicial'] || 'bg-slate-100 text-slate-600'}`}>
                    {lead.etapa_proceso || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    {getRelativeTime(lead.ultima_interaccion || lead.created_at)}
                  </div>
                  {lead.vendedor_asignado && (
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                        {VENDEDORES.find(v => v.value === lead.vendedor_asignado)?.iniciales || 'NA'}
                      </div>
                      <span className="text-[10px] font-bold">
                        {VENDEDORES.find(v => v.value === lead.vendedor_asignado)?.label || lead.vendedor_asignado}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                No se encontraron leads
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 text-indigo-600 font-bold uppercase text-xs tracking-widest hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-sm font-bold text-slate-600">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Filters Drawer */}
        <AnimatePresence>
          {isFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsFiltersOpen(false)}
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
                        {filteredLeads.length} {filteredLeads.length === 1 ? 'lead encontrado' : 'leads encontrados'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
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
                            onChange={() => toggleArrayValue('operaciones', op.value)}
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

                  {/* 5. Vendedor Asignado */}
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

                  {/* 6. Fuente del Lead */}
                  <FilterSection title="Fuente del Lead">
                    <MultiSelectChips
                      options={FUENTES_LEAD}
                      selected={filters.fuentes}
                      onToggle={(value) => toggleArrayValue('fuentes', value)}
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

                  {/* 8. Rango de Fechas */}
                  <FilterSection title="Fecha de Creación">
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

                  {/* 9. Score Mínimo */}
                  <FilterSection title="Score Mínimo">
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.scoreMin || 0}
                        onChange={(e) => updateFilter('scoreMin', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">0</span>
                        <span className="text-2xl font-black text-slate-900">{filters.scoreMin || 0}</span>
                        <span className="text-xs font-bold text-slate-400">100</span>
                      </div>
                    </div>
                  </FilterSection>

                  {/* 10. Filtros Especiales */}
                  <FilterSection title="Filtros Especiales">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                        <input
                          type="checkbox"
                          id="visita-proxima-clients"
                          checked={filters.conVisitaProxima}
                          onChange={(e) => updateFilter('conVisitaProxima', e.target.checked)}
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
                          onChange={(e) => updateFilter('sinRespuestaDias', e.target.value ? Number(e.target.value) : undefined)}
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
                    onClick={clearAllFilters}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Limpiar Todo
                  </button>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
                  >
                    Aplicar Filtros ({filteredLeads.length})
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Clients;
