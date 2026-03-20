import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leadsService } from '../services/leadsService';
import { Client } from '../types';
import {
  User, Mail, Phone, ExternalLink, Plus, X, Search, Filter, Home, History
} from 'lucide-react';

const ClientFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (client: Client) => void; clientToEdit?: Client | null }> = ({ isOpen, onClose, onSave, clientToEdit }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    nombre: '', email: '', telefono: '', busca_venta: true, busca_alquiler: false, estado_temperatura: 'Tibio', etapa_proceso: 'Inicio'
  });

  useEffect(() => {
    if (clientToEdit) setFormData(clientToEdit);
    else setFormData({ nombre: '', email: '', telefono: '', busca_venta: true, busca_alquiler: false, estado_temperatura: 'Tibio', etapa_proceso: 'Inicio' });
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative animate-fade-in p-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black">{clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ id: clientToEdit?.id || `CL-${Math.random()}`, ...formData as Client }); onClose(); }} className="space-y-6">
          <input type="text" placeholder="Nombre" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
          <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
          <input type="tel" placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold" />
          <button type="submit" className="w-full py-4 rounded-2xl font-black text-white bg-slate-900 mt-4">Guardar</button>
        </form>
      </div>
    </div>
  );
};

const ClientMetrics = ({ clients }: { clients: Client[] }) => {
  const ventas = clients.filter(c => c.busca_venta).length;
  const alquileres = clients.filter(c => c.busca_alquiler).length;
  // LTV Calculado en base a Leads
  const ltvMock = clients.length * 15000; 

  return (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-xs font-bold text-slate-400">Total Clientes</p><p className="text-3xl font-black">{clients.length}</p></div>
    <div className="bg-emerald-50 text-emerald-900 p-6 rounded-3xl"><p className="text-xs font-bold opacity-70">En Ventas</p><p className="text-3xl font-black">{ventas}</p></div>
    <div className="bg-indigo-50 text-indigo-900 p-6 rounded-3xl"><p className="text-xs font-bold opacity-70">En Alquileres</p><p className="text-3xl font-black">{alquileres}</p></div>
    <div className="bg-slate-900 text-white p-6 rounded-3xl"><p className="text-xs font-bold opacity-70">LTV Est. (USD)</p><p className="text-3xl font-black">${ltvMock.toLocaleString()}</p></div>
  </div>
  );
};

export const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await leadsService.fetchLeads();
    // Use leads as clients for now
    setClients(data as unknown as Client[]);
    setLoading(false);
  };

  const handleEditClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchSearch = c.nombre?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
    const matchType = filterType === 'Todos' || (filterType === 'Venta' && c.busca_venta) || (filterType === 'Alquiler' && c.busca_alquiler);
    const matchStatus = filterStatus === 'Todos' || c.estado_temperatura === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Directorio de Clientes</h1>
          <p className="text-slate-500 font-medium">Gestiona tu cartera y métricas estimadas (LTV).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsDrawerOpen(true)} className="px-5 py-3 rounded-2xl text-sm font-bold bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100 flex items-center gap-2">
            <Filter size={18}/> Filtros
          </button>
          <button onClick={() => { setClientToEdit(null); setIsModalOpen(true); }} className="px-5 py-3 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl flex items-center gap-2">
            <User size={18} /> Nuevo Cliente
          </button>
        </div>
      </div>

      <ClientMetrics clients={clients} />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 mb-6 flex">
        <div className="flex-1 flex items-center px-4">
           <Search size={18} className="text-slate-400 mr-3"/>
           <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold outline-none" />
        </div>
      </div>

      {/* Drawer Filtros */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-sm bg-white h-full relative z-[210] p-6 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center pb-6 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-black">Filtros Cruzados</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20}/></button>
              </div>
              <div className="space-y-6 flex-1">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Operación</label>
                    <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="w-full mt-2 p-3 bg-slate-50 rounded-xl border-none font-bold">
                       <option value="Todos">Todos</option>
                       <option value="Venta">Solo Ventas</option>
                       <option value="Alquiler">Solo Alquileres</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Estado</label>
                    <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-full mt-2 p-3 bg-slate-50 rounded-xl border-none font-bold">
                       <option value="Todos">Todos</option>
                       <option value="Frio">Frío</option>
                       <option value="Tibio">Tibio</option>
                       <option value="Caliente">Caliente</option>
                    </select>
                 </div>
              </div>
              <button onClick={() => { setFilterType('Todos'); setFilterStatus('Todos'); setIsDrawerOpen(false); }} className="w-full py-4 text-sm font-bold bg-slate-900 text-white rounded-2xl">Aplicar y Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">Cliente</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">Contacto</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">Operación</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">Estado</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">Asignado a</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-50">
                     <td className="p-4"><div className="w-32 h-4 bg-slate-200 rounded"></div></td>
                     <td className="p-4"><div className="w-24 h-4 bg-slate-200 rounded"></div></td>
                     <td className="p-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></td>
                     <td className="p-4"><div className="w-16 h-4 bg-slate-200 rounded"></div></td>
                     <td className="p-4"><div className="w-24 h-4 bg-slate-200 rounded"></div></td>
                  </tr>
                ))
              ) : filteredClients.map(c => (
                <tr key={c.id} onClick={(e) => { handleEditClick(e, c as any); }} className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900">{c.nombre}</div>
                    <div className="text-xs text-slate-400">ID: {c.id?.substring(0,6)}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={14}/> {c.email || 'N/A'}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1"><Phone size={14}/> {c.telefono || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                     <div className="flex gap-1">
                        {c.busca_venta && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold">Venta</span>}
                        {c.busca_alquiler && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold">Alquiler</span>}
                     </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${c.estado_temperatura === 'Caliente' ? 'bg-rose-50 text-rose-700' : c.estado_temperatura === 'Tibio' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{c.estado_temperatura}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                     {(c as any).vendedor_asignado || 'Sin Asignar'}
                  </td>
                </tr>
              ))}
              {!loading && filteredClients.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No se encontraron clientes coincidiendo con los filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(c) => { console.log(c); setIsModalOpen(false); }} clientToEdit={clientToEdit} />
    </div>
  );
};
export default Clients;
