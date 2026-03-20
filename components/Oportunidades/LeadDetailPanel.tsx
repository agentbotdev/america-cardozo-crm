import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Clock, Send, X, Target, Edit, Home, Eye, Info, Bot, MessageSquare, Plus, Search, Zap } from 'lucide-react';
import { Lead, ChatMessage, LeadHistory } from '../../types';
import { leadsService } from '../../services/leadsService';

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

export const LeadDetailPanel: React.FC<{ lead: Lead; properties: any[]; onClose: () => void; onEdit: (l: Lead) => void }> = ({ lead, properties, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'propiedades' | 'chat'>('info');
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const consultedProperties = useMemo(() =>
    properties.filter(p => lead.propiedades_enviadas_ids?.includes(p.id)),
    [lead.propiedades_enviadas_ids, properties]
  );

  const [history, setHistory] = useState<LeadHistory[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [propSearch, setPropSearch] = useState('');

  useEffect(() => {
    if (lead) {
      loadDetails();
    }
  }, [lead]);

  const loadDetails = async () => {
    try {
      setLoadingDetails(true);
      const [hist, msgs] = await Promise.all([
        leadsService.fetchLeadHistory(lead.id),
        leadsService.fetchLeadMessages(lead.id)
      ]);
      setHistory(hist as any);
      setChatMessages(msgs as any);
    } catch (error) {
      console.error('Error loading lead details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    // In a full implementation, we'd save to DB here
    setMessage('');
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-5">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</h3>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {children}
      </div>
    </div>
  );

  const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string | number }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white transition-all">
      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm"><Icon size={18} /></div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <span className="text-sm font-black text-slate-700">{value}</span>
      </div>
    </div>
  );

  const Tag: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-${color}-100 text-${color}-600`}>
      {label}
    </span>
  );

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-full sm:w-[500px] lg:w-[600px] h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[200] flex flex-col border-l border-slate-100"
    >
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 text-xl font-black">{lead.nombre[0]}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{lead.nombre}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[lead.estado_temperatura] || 'bg-slate-100 text-slate-600'}`}>{lead.estado_temperatura}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Target size={12} className="text-indigo-400" /> {lead.score}% Score</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onEdit(lead)} className="p-4 bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600 rounded-2xl transition-all"><Edit size={20} /></button>
          <button onClick={onClose} className="p-4 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all"><X size={20} /></button>
        </div>
      </div>

      <div className="flex border-b border-slate-50 bg-white px-8 h-12 shrink-0">
        {[
          { id: 'info', icon: Info, label: 'Info' },
          { id: 'historial', icon: Clock, label: 'Timeline' },
          { id: 'propiedades', icon: Home, label: 'Interés' },
          { id: 'chat', icon: Bot, label: 'Chat IA' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 border-b-2 transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab.id === 'chat' ? (
              <div className="w-4 h-4 rounded-[4px] overflow-hidden flex items-center justify-center shadow-sm border border-slate-100">
                <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : <tab.icon size={14} />} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/30">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 md:p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Section title="Contacto">
                  <DetailItem icon={Phone} label="Teléfono" value={lead.telefono} />
                  <DetailItem icon={Mail} label="Email" value={lead.email || '-'} />
                </Section>
                <Section title="Origen">
                  <DetailItem icon={Zap} label="Estado" value={lead.estado_seguimiento || 'Nuevo'} />
                  <DetailItem icon={Clock} label="Ingreso" value={new Date(lead.created_at).toLocaleDateString()} />
                </Section>
              </div>
              <Section title="Preferencias de Búsqueda">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {lead.tipo_operacion_buscada === 'venta' && <Tag label="Venta" color="indigo" />}
                    {lead.tipo_operacion_buscada === 'alquiler' && <Tag label="Alquiler" color="emerald" />}
                    {lead.tipo_operacion_buscada === 'ambos' && <><Tag label="Venta" color="indigo" /><Tag label="Alquiler" color="emerald" /></>}
                    {lead.tipo_propiedad_buscada?.map((t: string) => <Tag key={t} label={t} color="slate" />)}
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presupuesto Máx.</p>
                      <p className="text-xl md:text-2xl font-black text-slate-900">USD {lead.presupuesto_max?.toLocaleString() || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Días Buscando</p>
                      <p className="text-xl md:text-2xl font-black text-slate-900">14 días</p>
                    </div>
                  </div>
                </div>
              </Section>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full bg-[#F1F5F9]/40">
              <div className="flex-1 overflow-y-auto py-10 px-8 no-scrollbar scroll-smooth space-y-6">
                <div className="text-center mb-10">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] bg-white px-6 py-2 rounded-full shadow-sm ring-1 ring-black/5">Historial de Conversación</span>
                </div>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'}`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      <p className={`text-[9px] mt-2 font-black uppercase opacity-50 ${msg.sender === 'user' ? 'text-white' : 'text-slate-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-8 bg-white border-t border-slate-100 flex gap-4 shrink-0">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-[1.8rem] px-8 py-5 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="bg-slate-900 text-white p-5 rounded-[1.5rem] shadow-xl hover:bg-indigo-600 transition-all"><Send size={22} /></button>
              </div>
            </motion.div>
          )}

          {activeTab === 'propiedades' && (
            <motion.div key="propiedades" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-10 space-y-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Propiedades de Interés</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAssigning(!isAssigning)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4"
                  >
                    {isAssigning ? <X size={14} /> : <Plus size={14} />} {isAssigning ? 'Cerrar' : 'Asignar Propiedad'}
                  </button>
                  <span className="bg-slate-100 text-slate-400 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{consultedProperties.length} Unidades</span>
                </div>
              </div>

              {isAssigning && (
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 animate-slide-down">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-slate-300" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar propiedad por título o dirección..."
                      value={propSearch}
                      onChange={(e) => setPropSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {properties
                      .filter(p => !lead.propiedades_enviadas_ids?.includes(p.id))
                      .filter(p => p.titulo.toLowerCase().includes(propSearch.toLowerCase()) || p.direccion_completa?.toLowerCase().includes(propSearch.toLowerCase()))
                      .slice(0, 10)
                      .map(p => (
                        <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"><img src={p.foto_portada} className="w-full h-full object-cover" alt="" /></div>
                            <div>
                              <p className="text-xs font-black text-slate-900 truncate max-w-[200px]">{p.titulo}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase">{p.id}</p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await leadsService.assignPropertyToLead(lead.id, p.id);
                                lead.propiedades_enviadas_ids = [...(lead.propiedades_enviadas_ids || []), p.id];
                                setIsAssigning(false);
                                setPropSearch('');
                              } catch (err) {
                                console.error('Error assigning property:', err);
                                alert('Error al asignar propiedad');
                              }
                            }}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-6">
                {consultedProperties.length > 0 ? consultedProperties.map(prop => (
                  <div key={prop.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="w-28 h-28 rounded-[1.8rem] overflow-hidden shrink-0"><img src={prop.foto_portada} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{prop.tipo}</p>
                      <h4 className="text-base font-black text-slate-900 leading-tight mb-2">{prop.titulo}</h4>
                      <p className="text-lg font-black text-slate-900">{prop.moneda} {prop.tipo_operacion === 'venta' ? prop.precio_venta?.toLocaleString() : prop.precio_alquiler?.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       {/* This could link to actual property view later */}
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Eye size={18} /></button>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Send size={18} /></button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-20 rounded-[3.5rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><Home size={40} /></div>
                    <p className="text-sm font-bold text-slate-400">No se han enviado propiedades aún.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'historial' && (
            <motion.div key="historial" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-10">
              <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {history.map((item) => (
                  <div key={item.id} className="relative pl-12">
                    <div className={`absolute left-[-2px] top-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white ${item.type === 'stage_change' ? 'bg-amber-100 text-amber-600' : item.type === 'communication' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {item.type === 'stage_change' ? <Target size={18} /> : item.type === 'communication' ? <MessageSquare size={18} /> : <Clock size={18} />}
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2"><h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</h4><span className="text-[9px] font-black text-slate-400">{new Date(item.date).toLocaleDateString()}</span></div>
                      <p className="text-xs text-slate-600 font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
