import React, { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket, SupportMessage } from '../services/supportService';
import {
  Plus, X, Clock, CheckCircle2, AlertCircle, XCircle,
  Send, ChevronLeft, Mail, MessageCircle, AlertTriangle,
  FileText, LifeBuoy, Loader2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';

// ════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════

const TICKET_STATES = [
  { id: 'todos', label: 'Todos' },
  { id: 'abierto', label: 'Abierto' },
  { id: 'en_proceso', label: 'En Proceso' },
  { id: 'resuelto', label: 'Resuelto' },
  { id: 'cerrado', label: 'Cerrado' },
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  abierto: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
  en_proceso: { bg: 'bg-blue-50', text: 'text-blue-600', icon: AlertCircle },
  resuelto: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
  cerrado: { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  urgente: { bg: 'bg-red-50', text: 'text-red-600' },
  alta: { bg: 'bg-orange-50', text: 'text-orange-600' },
  media: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  baja: { bg: 'bg-slate-50', text: 'text-slate-500' },
};

const CATEGORIAS_DISPLAY = [
  { value: 'bug', label: 'Bug' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'mejora', label: 'Mejora' },
  { value: 'acceso', label: 'Acceso' },
  { value: 'otro', label: 'Otro' },
];

const fmtDate = (d?: string) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtDateTime = (d?: string) => {
  if (!d) return '';
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// ════════════════════════════════════════
// TICKET MODAL
// ════════════════════════════════════════

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { asunto: string; categoria: string; prioridad: string; descripcion: string }) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, onSave }) => {
  const [asunto, setAsunto] = useState('');
  const [categoria, setCategoria] = useState('bug');
  const [prioridad, setPrioridad] = useState('media');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAsunto('');
      setCategoria('bug');
      setPrioridad('media');
      setDescripcion('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;
    onSave({ asunto: asunto.trim(), categoria, prioridad, descripcion: descripcion.trim() });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-8 pb-4 shrink-0">
          <h2 className="text-2xl font-black text-slate-900">Nuevo Ticket</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-4 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asunto <span className="text-red-400">*</span></label>
            <input type="text" value={asunto} onChange={e => setAsunto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50"
              placeholder="Ej: Error al cargar propiedades" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none">
                {CATEGORIAS_DISPLAY.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prioridad</label>
              <select value={prioridad} onChange={e => setPrioridad(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción <span className="text-red-400">*</span></label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 min-h-[120px] resize-none"
              placeholder="Describí el problema en detalle..." required />
          </div>
        </form>

        <div className="p-8 pt-4 shrink-0">
          <button type="submit" onClick={handleSubmit as any}
            className="w-full py-4 text-white bg-slate-900 hover:bg-indigo-600 rounded-2xl font-black text-sm transition-colors shadow-xl active:scale-[0.98]">
            Enviar Ticket de Soporte
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════
// TICKET DETAIL
// ════════════════════════════════════════

interface TicketDetailProps {
  ticket: SupportTicket;
  onClose: () => void;
  onStatusChange: (id: string, estado: string) => void;
  isMobile: boolean;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onClose, onStatusChange, isMobile }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await supportService.getTicketMessages(ticket.id);
      setMessages(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadMessages(); }, [ticket.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      await supportService.sendMessage(ticket.id, 'Usuario', newMsg.trim(), 'cliente');
      setNewMsg('');
      loadMessages();
    } catch (e) {
      addToast('Error', 'No se pudo enviar el mensaje', 'error');
    }
    setSending(false);
  };

  const stStyle = STATUS_STYLES[ticket.estado] || STATUS_STYLES.abierto;
  const pStyle = PRIORITY_STYLES[ticket.prioridad] || PRIORITY_STYLES.media;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {isMobile && (
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><ChevronLeft size={18} /></button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-slate-400">#{ticket.numero_ticket}</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${pStyle.bg} ${pStyle.text}`}>
                {ticket.prioridad?.toUpperCase()}
              </span>
            </div>
            <h2 className="font-black text-slate-900 text-lg leading-tight truncate">{ticket.asunto}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${stStyle.bg} ${stStyle.text}`}>
            <stStyle.icon size={12} /> {ticket.estado?.replace('_', ' ')}
          </span>

          {ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && (
            <button onClick={() => onStatusChange(ticket.id, 'resuelto')}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors flex items-center gap-1">
              <CheckCircle2 size={12} /> Marcar resuelto
            </button>
          )}

          <select value={ticket.estado} onChange={e => onStatusChange(ticket.id, e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold outline-none ml-auto">
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En Proceso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">Sin mensajes en este ticket</p>
        ) : messages.map(m => {
          const isClient = m.rol === 'cliente';
          return (
            <div key={m.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isClient
                ? 'bg-slate-900 text-white rounded-br-md'
                : 'bg-indigo-50 text-slate-800 rounded-bl-md'}`}>
                {!isClient && (
                  <p className="text-[10px] font-black text-indigo-500 mb-1">Soporte</p>
                )}
                <p className="leading-relaxed">{m.texto}</p>
                <p className={`text-[10px] mt-1.5 ${isClient ? 'text-slate-400' : 'text-indigo-400'}`}>
                  {fmtDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 flex gap-2 shrink-0">
        <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSend(); }}
          className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50"
          placeholder="Escribí tu mensaje..." disabled={sending} />
        <button onClick={handleSend} disabled={sending || !newMsg.trim()}
          className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors shrink-0 disabled:opacity-50">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// MAIN SUPPORT COMPONENT
// ════════════════════════════════════════

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { addToast } = useToast();

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (e: any) {
      console.error('Error loading tickets:', e);
      setError('No se pudieron cargar los tickets');
    }
    setLoading(false);
  };

  useEffect(() => { loadTickets(); }, []);

  const filteredTickets = filterEstado === 'todos'
    ? tickets
    : tickets.filter(t => t.estado === filterEstado);

  const handleCreateTicket = async (data: { asunto: string; categoria: string; prioridad: string; descripcion: string }) => {
    try {
      const ticket = await supportService.createTicket({
        asunto: data.asunto,
        categoria: data.categoria,
        prioridad: data.prioridad as any,
        estado: 'abierto',
        creado_por: 'Usuario',
      });
      await supportService.sendMessage(ticket.id, 'Usuario', data.descripcion, 'cliente');
      addToast('Ticket creado', `Ticket #${ticket.numero_ticket} creado exitosamente`, 'success');
      setIsModalOpen(false);
      loadTickets();
      setSelectedTicket(ticket);
    } catch (e) {
      addToast('Error', 'No se pudo crear el ticket', 'error');
    }
  };

  const handleStatusChange = async (id: string, estado: string) => {
    try {
      await supportService.updateTicketStatus(id, estado as any);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: estado as any } : t));
      if (selectedTicket?.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, estado: estado as any } : null);
      }
      addToast('Estado actualizado', `Ticket actualizado a "${estado.replace('_', ' ')}"`, 'success');
    } catch (e) {
      addToast('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:agentbot.ai@gmail.com?subject=${encodeURIComponent('Bug Report - CRM America Cardozo')}&body=${encodeURIComponent(`Describe el problema:\n\nURL: ${window.location.href}\nFecha: ${new Date().toLocaleString('es-AR')}`)}`;
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5493517636957', '_blank');
  };

  // ── TICKET LIST ──
  const renderTicketList = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Soporte</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Centro de ayuda</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg text-xs active:scale-95">
            <Plus size={16} /> Nuevo Ticket
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={handleEmail}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
            <Mail size={14} /> Email
          </button>
          <button onClick={handleWhatsApp}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button onClick={handleEmail}
            className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
            <AlertTriangle size={14} /> Reportar Bug
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {TICKET_STATES.map(st => {
            const count = st.id === 'todos' ? tickets.length : tickets.filter(t => t.estado === st.id).length;
            return (
              <button key={st.id} onClick={() => setFilterEstado(st.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterEstado === st.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                {st.label}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-5">
            <AlertTriangle size={32} className="text-red-300 mb-3" />
            <p className="text-sm text-red-500 font-bold mb-4">{error}</p>
            <button onClick={loadTickets} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <RefreshCw size={14} /> Reintentar
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-5">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FileText size={32} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Sin tickets</h3>
            <p className="text-sm text-slate-400 text-center mb-6 max-w-xs">
              No tenés tickets {filterEstado !== 'todos' ? `con estado "${filterEstado.replace('_', ' ')}"` : 'abiertos'}. Si tenés un problema, creá uno.
            </p>
            <button onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl hover:bg-indigo-600 transition-colors">
              <Plus size={16} /> Crear Ticket
            </button>
          </div>
        ) : (
          <div>
            {filteredTickets.map(ticket => {
              const stStyle = STATUS_STYLES[ticket.estado] || STATUS_STYLES.abierto;
              const StIcon = stStyle.icon;
              return (
                <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex items-center gap-4 ${selectedTicket?.id === ticket.id ? 'bg-indigo-50/50' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl ${stStyle.bg} ${stStyle.text} flex items-center justify-center shrink-0`}>
                    <StIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-slate-400">#{ticket.numero_ticket}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${stStyle.bg} ${stStyle.text}`}>
                        {ticket.estado?.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-slate-800 leading-tight truncate">{ticket.asunto}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{ticket.categoria}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{fmtDate(ticket.created_at)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderEmptyDetail = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center px-8">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <LifeBuoy size={32} className="text-slate-200" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Seleccioná un ticket</h3>
        <p className="text-sm text-slate-400 max-w-xs">Elegí un ticket de la lista para ver el detalle y la conversación.</p>
      </div>
    </div>
  );

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <div className="max-w-[1600px] mx-auto pb-16">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden min-h-[600px]">
          {selectedTicket ? (
            <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onStatusChange={handleStatusChange} isMobile={true} />
          ) : renderTicketList()}
        </div>
        <AnimatePresence>
          {isModalOpen && <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreateTicket} />}
        </AnimatePresence>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ──
  return (
    <div className="max-w-[1600px] mx-auto pb-16">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex h-[calc(100vh-180px)] min-h-[500px]">
        <div className="w-[420px] border-r border-slate-100 shrink-0 flex flex-col">
          {renderTicketList()}
        </div>
        <div className="flex-1">
          {selectedTicket ? (
            <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onStatusChange={handleStatusChange} isMobile={false} />
          ) : renderEmptyDetail()}
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreateTicket} />}
      </AnimatePresence>
    </div>
  );
};

export default Support;
