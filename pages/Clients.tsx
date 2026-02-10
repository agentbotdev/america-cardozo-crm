import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leadsService } from '../services/leadsService';
import { Client, ClientStatus, SalesStage } from '../types';
import {
  User, Mail, Phone, ExternalLink, Plus, X, List as ListIcon,
  Search, BarChart3, ArrowRight, LayoutGrid, Clock, Filter,
  BrainCircuit, History, Home, Edit3, MessageCircle, Ticket, Check, MapPin, Edit
} from 'lucide-react';
import { LeadDetailPanel } from './Leads';

// --- Client Form Modal ---
const ClientFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (client: Client) => void; clientToEdit?: Client | null }> = ({ isOpen, onClose, onSave, clientToEdit }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    nombre: '',
    email: '',
    telefono: '',
    busca_venta: true,
    busca_alquiler: false,
    estado_temperatura: 'Tibio',
    etapa_proceso: 'Inicio'
  });

  React.useEffect(() => {
    if (clientToEdit) {
      setFormData(clientToEdit);
    } else {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        busca_venta: true,
        busca_alquiler: false,
        estado_temperatura: 'Tibio',
        etapa_proceso: 'Inicio'
      });
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: clientToEdit?.id || `CL-${Math.floor(Math.random() * 10000)}`,
      ...formData as Client
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative animate-fade-in p-10 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"><X size={20} /></button>
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
                value={formData.estado_temperatura}
                onChange={e => setFormData({ ...formData, estado_temperatura: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
              >
                <option>Frio</option>
                <option>Tibio</option>
                <option>Caliente</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-indigo-600 shadow-xl transition-all active:scale-95 mt-4">
            {clientToEdit ? 'Guardar Cambios' : 'Crear Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Client Metrics Dashboard ---
const ClientMetrics = ({ clients }: { clients: Client[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 animate-fade-in">
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Clientes</h3>
      <div className="flex justify-between items-end relative z-10">
        <span className="text-4xl font-black text-slate-900 tracking-tighter">{clients.length}</span>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">+12% Activo</span>
      </div>
    </div>
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ventas Activas</h3>
      <div className="flex justify-between items-end relative z-10">
        <span className="text-4xl font-black text-slate-900 tracking-tighter">{clients.filter(c => c.busca_venta).length}</span>
        <span className="text-[10px] font-black text-slate-400">En pipeline</span>
      </div>
    </div>
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alquileres</h3>
      <div className="flex justify-between items-end relative z-10">
        <span className="text-4xl font-black text-slate-900 tracking-tighter">{clients.filter(c => c.busca_alquiler).length}</span>
        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">Alta demanda</span>
      </div>
    </div>
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lifetime Value</h3>
      <div className="flex justify-between items-end relative z-10">
        <span className="text-4xl font-black text-slate-900 tracking-tighter">$4.5M</span>
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">Avg: $350k</span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const Clients: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'metrics'>('metrics');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  React.useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await leadsService.fetchLeads();
      // Filter for clients (leads with tipo_cliente defined or by some other logic)
      // For now, in your schema, Lead and Client share the same table.
      setClients(data as Client[]);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async (clientData: Client) => {
    try {
      await leadsService.saveLead(clientData);
      await loadClients();
      setIsModalOpen(false);
      setClientToEdit(null);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleEditClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  // MAIN TABS
  const [mainTab, setMainTab] = useState<'todos' | 'ventas' | 'alquileres' | 'por_estado' | 'por_etapa'>('todos');

  // SUB TABS
  const [statusSubTab, setStatusSubTab] = useState<ClientStatus>('Tibio');
  const [stageSubTab, setStageSubTab] = useState<SalesStage>('Indagación');

  // Helper to filter clients based on active tabs
  const getFilteredClients = () => {
    let list = [...clients];

    // Search filter
    if (searchTerm) {
      list = list.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    switch (mainTab) {
      case 'todos':
        return list;
      case 'ventas':
        return list.filter(c => c.busca_venta);
      case 'alquileres':
        return list.filter(c => c.busca_alquiler);
      case 'por_estado':
        return list.filter(c => c.estado_temperatura === statusSubTab);
      case 'por_etapa':
        return list.filter(c => c.etapa_proceso === stageSubTab);
      default:
        return list;
    }
  };

  const displayedClients = getFilteredClients();

  // STYLES FOR TABS
  const tabBaseClass = "px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3";
  const activeTabClass = "bg-white text-slate-900 shadow-xl transform scale-105 ring-1 ring-slate-100";
  const inactiveTabClass = "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50";

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in pb-16 transform-gpu">

      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-[4px] z-[110]"
              onClick={() => setSelectedClient(null)}
            />
            <LeadDetailPanel
              lead={selectedClient}
              onClose={() => setSelectedClient(null)}
              onEdit={(client) => {
                setClientToEdit(client as Client);
                setIsModalOpen(true);
              }}
            />
          </>
        )}
      </AnimatePresence>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-3">Cartera Clientes</h1>
          <p className="text-slate-400 font-bold text-xs md:text-base uppercase tracking-[0.2em]">Gestión avanzada de relaciones con Flor IA.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
          <div className="bg-slate-100/50 p-1.5 rounded-[1.8rem] flex shadow-inner border border-slate-100 w-full sm:w-auto justify-center">
            <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none p-4 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-300 hover:text-slate-400'}`}><ListIcon size={20} /></button>
            <button onClick={() => setViewMode('metrics')} className={`flex-1 sm:flex-none p-4 rounded-2xl transition-all ${viewMode === 'metrics' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-300 hover:text-slate-400'}`}><BarChart3 size={20} /></button>
          </div>
          <button
            onClick={() => {
              setClientToEdit(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-[2.5rem] font-black text-[10px] sm:text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> NUEVO CLIENTE
          </button>
        </div>
      </div>

      {viewMode === 'metrics' && <ClientMetrics clients={clients} />}

      {/* Main Content Card */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white/60 flex flex-col min-h-[700px]">

        {/* 1. TOP BAR: MAIN SECTIONS */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-3 bg-white/60 items-center sticky top-0 z-20">
          <button onClick={() => setMainTab('todos')} className={`${tabBaseClass} ${mainTab === 'todos' ? activeTabClass : inactiveTabClass}`}>Todos</button>
          <button onClick={() => setMainTab('ventas')} className={`${tabBaseClass} ${mainTab === 'ventas' ? activeTabClass : inactiveTabClass}`}>Ventas</button>
          <button onClick={() => setMainTab('alquileres')} className={`${tabBaseClass} ${mainTab === 'alquileres' ? activeTabClass : inactiveTabClass}`}>Alquileres</button>
          <div className="w-px h-10 bg-slate-100 mx-3 self-center"></div>
          <button onClick={() => setMainTab('por_estado')} className={`${tabBaseClass} ${mainTab === 'por_estado' ? activeTabClass : inactiveTabClass}`}>Estado</button>
          <button onClick={() => setMainTab('por_etapa')} className={`${tabBaseClass} ${mainTab === 'por_etapa' ? activeTabClass : inactiveTabClass}`}>Etapa</button>

          <div className="ml-auto relative w-full lg:w-[350px] mt-4 lg:mt-0">
            <Search size={18} className="absolute left-5 top-4 text-slate-300" strokeWidth={3} />
            <input
              type="text"
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-6 py-4 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none w-full transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 2. SUB-SECTIONS (Conditional) */}

        {/* Sub-tabs for "Por Estado" */}
        {mainTab === 'por_estado' && (
          <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex gap-2 overflow-x-auto no-scrollbar animate-slide-up">
            {(['Frio', 'Tibio', 'Caliente', 'En seguimiento', 'Visita agendada', 'Cerrado', 'Perdido', 'Pausado', 'Derivado'] as ClientStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusSubTab(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap 
                    ${statusSubTab === status
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-indigo-400 hover:bg-indigo-100'}`}
              >
                {status}
              </button>
            ))}
          </div>
        )}

        {/* Sub-tabs for "Por Etapa" */}
        {mainTab === 'por_etapa' && (
          <div className="p-3 bg-purple-50/50 border-b border-purple-100 flex gap-2 overflow-x-auto no-scrollbar animate-slide-up">
            {(['Inicio', 'Indagación', 'Bajada producto', 'Seguimiento', 'Pre-cierre', 'Cierre', 'Derivación humano', 'Visita agendada'] as SalesStage[]).map((stage) => (
              <button
                key={stage}
                onClick={() => setStageSubTab(stage)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap 
                    ${stageSubTab === stage
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-purple-400 hover:bg-purple-100'}`}
              >
                {stage}
              </button>
            ))}
          </div>
        )}

        {/* Mobile View (Cards) */}
        <div className="lg:hidden p-6 space-y-4 bg-white/40">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando...</p>
            </div>
          ) : displayedClients.length > 0 ? (
            displayedClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="bg-white/80 backdrop-blur-sm border border-slate-100 p-6 rounded-[2rem] space-y-4 active:scale-95 transition-transform"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      {client.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 leading-tight">{client.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{client.telefono}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleEditClick(e, client)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Edit size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${client.busca_venta ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {client.busca_venta ? 'VENTA' : 'ALQUILER'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                    {client.estado_temperatura}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                    {client.etapa_proceso}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No hay clientes</p>
            </div>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block flex-1 overflow-auto bg-white/40">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando Cartera...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 text-[10px] uppercase text-gray-500 font-bold tracking-wider border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="p-5">Cliente</th>
                  <th className="p-5">Preferencia</th>
                  <th className="p-5">Estado</th>
                  <th className="p-5">Etapa Venta</th>
                  <th className="p-5">Contacto</th>
                  <th className="p-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedClients.length > 0 ? displayedClients.map(client => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-50 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {client.nombre.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 text-sm block group-hover:text-indigo-600 transition-colors">{client.nombre}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{client.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border 
                                ${client.busca_venta ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {client.busca_venta ? 'VENTA' : 'ALQUILER'}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {client.estado_temperatura}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                        <span className="text-xs font-medium text-gray-700 capitalize">{client.etapa_proceso}</span>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1"><Phone size={12} /> {client.telefono}</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400"><Clock size={10} /> 2d ago</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={(e) => handleEditClick(e, client)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit size={16} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                      No se encontraron clientes en esta sección.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
