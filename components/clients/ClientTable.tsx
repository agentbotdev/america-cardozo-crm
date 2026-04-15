import React from 'react';
import { motion } from 'framer-motion';
import { Lead } from '../../types';
import { Phone, Mail, Clock, Users, ArrowUpDown, ChevronUp, ChevronDown, Target } from 'lucide-react';
import { VENDEDORES } from '../../config/taxonomy';
// NOTA: getVendedorLabel no se usa aquí porque vendedor_asignado_nombre ya es text legible.

export type SortField = 'nombre' | 'created_at' | 'ultima_interaccion' | 'score' | 'temperatura';
export type SortOrder = 'asc' | 'desc';

interface ClientTableProps {
  loading: boolean;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onClearFilters: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  loading,
  leads,
  onSelectLead,
  onClearFilters,
  sortField,
  sortOrder,
  onSort
}) => {
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

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead className="bg-slate-50/30 text-[10px] uppercase text-slate-400 font-black tracking-[0.3em] border-b border-slate-50">
              <tr>
                <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('nombre')}>
                  <div className="flex items-center gap-2">
                    Nombre <SortIcon field="nombre" />
                  </div>
                </th>
                <th className="px-6 py-5">Contacto</th>
                <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('temperatura')}>
                  <div className="flex items-center gap-2">
                    Temperatura <SortIcon field="temperatura" />
                  </div>
                </th>
                <th className="px-6 py-5">Etapa</th>
                <th className="px-6 py-5">Tipo Buscado</th>
                <th className="px-6 py-5">Vendedor</th>
                <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('ultima_interaccion')}>
                  <div className="flex items-center gap-2">
                    Última Int. <SortIcon field="ultima_interaccion" />
                  </div>
                </th>
                <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('score')}>
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
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => onSelectLead(lead)}
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
                      {lead.vendedor_asignado_nombre ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                            {VENDEDORES.find(v => v.label === lead.vendedor_asignado_nombre)?.iniciales
                              || lead.vendedor_asignado_nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {lead.vendedor_asignado_nombre}
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
                          onSelectLead(lead);
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
                      onClick={onClearFilters}
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
        ) : leads.length > 0 ? (
          leads.map((lead) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectLead(lead)}
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
                {lead.vendedor_asignado_nombre && (
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                      {VENDEDORES.find(v => v.label === lead.vendedor_asignado_nombre)?.iniciales
                        || lead.vendedor_asignado_nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold">
                      {lead.vendedor_asignado_nombre}
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
              onClick={onClearFilters}
              className="mt-4 text-indigo-600 font-bold uppercase text-xs tracking-widest hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </>
  );
};
