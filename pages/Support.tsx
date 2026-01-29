import React, { useState } from 'react';
import { Mail, MessageCircle, AlertTriangle, FileText, Search, ChevronRight, LifeBuoy, Plus, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { SupportTicket } from '../types';

interface ContactOptionProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  actionLabel: string;
  onClick: () => void;
  colorClass: string;
  bgClass: string;
}

const ContactOption: React.FC<ContactOptionProps> = ({ icon: Icon, title, desc, actionLabel, onClick, colorClass, bgClass }) => (
  <div className="glass-card p-6 rounded-3xl flex items-start gap-5 hover:-translate-y-1 transition-transform duration-300">
    <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-sm`}>
      <Icon size={28} />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      <button
        onClick={onClick}
        className="text-sm font-bold bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl border border-gray-200 transition-colors shadow-sm w-full"
      >
        {actionLabel}
      </button>
    </div>
  </div>
);

const TicketModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (ticket: Partial<SupportTicket>) => void }> = ({ isOpen, onClose, onSave }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Error Técnico');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!subject || !description) return;
    onSave({
      asunto: subject,
      categoria: category as any,
      descripcion: description,
      estado: 'abierto',
      prioridad: 'media'
    });
    setSubject('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative animate-fade-in p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Ticket</h2>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
              placeholder="Ej: Error al cargar propiedades"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
            >
              <option>Error Técnico</option>
              <option>Facturación</option>
              <option>Consulta General</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all min-h-[120px]"
              placeholder="Describe tu problema en detalle..."
            />
          </div>
        </div>
        <button onClick={handleSubmit} className="mt-8 w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-indigo-600 shadow-xl transition-all active:scale-95">
          Enviar Ticket de Soporte
        </button>
      </div>
    </div>
  )
}

const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'tickets' | 'resources'>('contact');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const handleEmail = () => window.open('mailto:agentbot.ai@gmail.com');
  const handleWhatsApp = () => window.open('https://wa.me/5493517636957', '_blank');
  const handleReport = () => alert('Abriendo chatbot de reporte de errores...');

  const handleSaveTicket = (ticketData: Partial<SupportTicket>) => {
    const newTicket: SupportTicket = {
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...ticketData as any
    };
    setTickets([newTicket, ...tickets]);
    setActiveTab('tickets');
  };

  const statusIcons: Record<string, any> = {
    abierto: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    progreso: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    resuelto: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    cerrado: { icon: X, color: 'text-slate-400', bg: 'bg-slate-50' }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Centro de Soporte</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">¿En qué podemos ayudarte hoy?</p>
      </div>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
      />

      {/* Tabs */}
      <div className="bg-slate-100/50 p-1.5 rounded-2xl mb-12 flex w-fit border border-slate-100">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'contact' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LifeBuoy size={18} /> Contacto
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'tickets' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MessageCircle size={18} /> Mis Tickets
          {tickets.length > 0 && <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{tickets.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'resources' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileText size={18} /> Recursos
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            <ContactOption
              icon={Mail}
              title="Enviar Email"
              desc="agentbot.ai@gmail.com"
              actionLabel="Enviar Correo"
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
              onClick={handleEmail}
            />
            <ContactOption
              icon={AlertTriangle}
              title="Reportar Errores"
              desc="Reporta bugs vía chatbot"
              actionLabel="Reportar Bug"
              colorClass="text-rose-600"
              bgClass="bg-rose-50"
              onClick={handleReport}
            />
            <ContactOption
              icon={MessageCircle}
              title="WhatsApp Soporte"
              desc="+54 9 351 763-6957"
              actionLabel="Enviar WhatsApp"
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
              onClick={handleWhatsApp}
            />
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Historial de Tickets</h3>
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Nuevo Ticket
              </button>
            </div>

            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {tickets.map((ticket) => {
                  const style = statusIcons[ticket.estado];
                  return (
                    <div key={ticket.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.color} flex items-center justify-center`}><style.icon size={22} /></div>
                        <div>
                          <h4 className="font-black text-slate-900 leading-tight mb-1">{ticket.asunto}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ticket.categoria}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
                        {ticket.estado}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FileText size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Sin tickets abiertos</h3>
                <p className="text-slate-400 font-medium mb-10 max-w-sm mx-auto">No tienes tickets de soporte pendientes. Estamos aquí para ayudarte si lo necesitas.</p>
                <button onClick={() => setIsTicketModalOpen(true)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-105 transition-transform inline-flex items-center gap-3">
                  <Plus size={20} /> Iniciar Nuevo Ticket
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative glass-card rounded-2xl p-1">
              <Search className="absolute left-5 top-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar artículos de ayuda..."
                className="w-full pl-12 pr-4 py-3 bg-white/50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Guía de inicio rápido', 'Integración WhatsApp API', 'Configuración Tokko Broker', 'Gestión de Leads Avanzada', 'Pipeline de Ventas'].map((item) => (
                <div key={item} className="glass-card p-5 rounded-2xl hover:border-indigo-300 cursor-pointer flex justify-between items-center group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><FileText size={18} /></div>
                    <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{item}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;