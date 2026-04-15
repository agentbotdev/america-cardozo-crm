import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CRMTask, TaskStatus, TaskPriority } from '../types';
import { tasksService, TaskComment, InternalMessage } from '../services/tasksService';
import { VENDEDORES, PRIORIDADES_TAREA, getVendedorIniciales, getLabel } from '../config/taxonomy';
import {
  Plus, Search, X, Calendar, Users, ChevronRight, ChevronLeft,
  CheckCircle2, CircleDashed, Clock, XCircle, Eye,
  LayoutGrid, List, BarChart3, MessageCircle, Send, Trash2,
  Tag, Filter, ArrowRight, Loader2, RefreshCw,
  GripVertical, MessageSquare, ChevronDown, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// ════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════

const STATUS_COLUMNS: { id: TaskStatus; title: string; headerBg: string; icon: React.ElementType }[] = [
  { id: 'pendiente', title: 'Pendiente', headerBg: 'bg-amber-500', icon: CircleDashed },
  { id: 'en_proceso', title: 'En Progreso', headerBg: 'bg-blue-500', icon: Clock },
  { id: 'en_revision', title: 'En Revisión', headerBg: 'bg-orange-500', icon: Eye },
  { id: 'completada', title: 'Completada', headerBg: 'bg-emerald-500', icon: CheckCircle2 },
  { id: 'cancelada', title: 'Cancelada', headerBg: 'bg-slate-400', icon: XCircle },
];

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  urgente: { bg: 'bg-red-50 border-red-100', text: 'text-red-600' },
  alta: { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600' },
  media: { bg: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700' },
  baja: { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-500' },
};

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#f97316', '#22c55e', '#94a3b8'];
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

const TABS = [
  { id: 'kanban' as const, label: 'Tablero', icon: LayoutGrid },
  { id: 'list' as const, label: 'Lista', icon: List },
  { id: 'charts' as const, label: 'Gráficos', icon: BarChart3 },
  { id: 'messages' as const, label: 'Mensajes', icon: MessageCircle },
];
type TabId = typeof TABS[number]['id'];

const isOverdue = (t: CRMTask) =>
  t.fecha_vencimiento && t.estado !== 'completada' && t.estado !== 'cancelada' && new Date(t.fecha_vencimiento) < new Date();

const fmtDate = (d?: string) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

const fmtDateTime = (d?: string) => {
  if (!d) return '';
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  pendiente: 'en_proceso',
  en_proceso: 'en_revision',
  en_revision: 'completada',
  completada: null,
  cancelada: null,
};

// ════════════════════════════════════════
// TASK MODAL
// ════════════════════════════════════════

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<CRMTask>) => void;
  taskToEdit?: CRMTask | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [form, setForm] = useState<Partial<CRMTask>>({
    titulo: '', descripcion: '', prioridad: 'media', estado: 'pendiente',
    fecha_vencimiento: '', asignados: [], lead_id: undefined, propiedad_id: undefined, tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const [leadResults, setLeadResults] = useState<any[]>([]);
  const [propResults, setPropResults] = useState<any[]>([]);
  const [selectedLeadName, setSelectedLeadName] = useState('');
  const [selectedPropName, setSelectedPropName] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setForm({ ...taskToEdit });
      setSelectedLeadName('');
      setSelectedPropName('');
    } else {
      setForm({ titulo: '', descripcion: '', prioridad: 'media', estado: 'pendiente', fecha_vencimiento: '', asignados: [], tags: [] });
      setSelectedLeadName('');
      setSelectedPropName('');
    }
    setTagInput('');
    setLeadSearch('');
    setPropSearch('');
  }, [taskToEdit, isOpen]);

  useEffect(() => {
    if (!leadSearch.trim()) { setLeadResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('leads').select('id, nombre').ilike('nombre', `%${leadSearch}%`).limit(5);
      setLeadResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [leadSearch]);

  useEffect(() => {
    if (!propSearch.trim()) { setPropResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('propiedades').select('tokko_id, titulo').ilike('titulo', `%${propSearch}%`).limit(5);
      setPropResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [propSearch]);

  if (!isOpen) return null;

  const addTag = () => {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const toggleVendedor = (v: string) => {
    const curr = form.asignados || [];
    setForm({ ...form, asignados: curr.includes(v) ? curr.filter(x => x !== v) : [...curr, v] });
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
          <h2 className="text-2xl font-black text-slate-900">{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (form.titulo?.trim()) onSave(form); }} className="flex-1 overflow-y-auto px-8 pb-4 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título <span className="text-red-400">*</span></label>
            <input type="text" value={form.titulo || ''} onChange={e => setForm({ ...form, titulo: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" required placeholder="Nombre de la tarea" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
            <textarea value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 min-h-[80px] resize-none" placeholder="Detalles..." />
          </div>

          {/* Prioridad + Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prioridad</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORIDADES_TAREA.map(p => {
                  const st = PRIORITY_STYLES[p.value] || PRIORITY_STYLES.media;
                  return (
                    <button key={p.value} type="button" onClick={() => setForm({ ...form, prioridad: p.value as TaskPriority })}
                      className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${form.prioridad === p.value ? `${st.bg} ${st.text} ring-2 ring-offset-1 ring-current` : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
              <select value={form.estado || 'pendiente'} onChange={e => setForm({ ...form, estado: e.target.value as TaskStatus })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none">
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Progreso</option>
              </select>
            </div>
          </div>

          {/* Fecha vencimiento */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha de vencimiento</label>
            <input type="datetime-local" value={form.fecha_vencimiento || ''} onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" />
          </div>

          {/* Asignar a */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asignar a</label>
            <div className="flex flex-wrap gap-2">
              {VENDEDORES.map(v => (
                <button key={v.value} type="button" onClick={() => toggleVendedor(v.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${(form.asignados || []).includes(v.value)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'}`}>
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black">
                    {v.iniciales}
                  </span>
                  <span className="hidden sm:inline">{v.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vincular Lead */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vincular Lead</label>
            {form.lead_id && selectedLeadName ? (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                <Users size={14} className="text-indigo-500" />
                <span className="text-sm font-bold text-indigo-700 flex-1">{selectedLeadName}</span>
                <button type="button" onClick={() => { setForm({ ...form, lead_id: undefined }); setSelectedLeadName(''); }}><X size={14} className="text-indigo-400" /></button>
              </div>
            ) : (
              <div className="relative">
                <input type="text" value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="Buscar lead por nombre..." />
                {leadResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 overflow-hidden">
                    {leadResults.map((l: any) => (
                      <button key={l.id} type="button" onClick={() => { setForm({ ...form, lead_id: l.id }); setSelectedLeadName(l.nombre); setLeadSearch(''); setLeadResults([]); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors">{l.nombre}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vincular Propiedad */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vincular Propiedad</label>
            {form.propiedad_id && selectedPropName ? (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                <BarChart3 size={14} className="text-indigo-500" />
                <span className="text-sm font-bold text-indigo-700 flex-1 truncate">{selectedPropName}</span>
                <button type="button" onClick={() => { setForm({ ...form, propiedad_id: undefined }); setSelectedPropName(''); }}><X size={14} className="text-indigo-400" /></button>
              </div>
            ) : (
              <div className="relative">
                <input type="text" value={propSearch} onChange={e => setPropSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="Buscar propiedad..." />
                {propResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 overflow-hidden">
                    {propResults.map((p: any) => (
                      <button key={String(p.tokko_id)} type="button" onClick={() => { setForm({ ...form, propiedad_id: String(p.tokko_id) }); setSelectedPropName(p.titulo); setPropSearch(''); setPropResults([]); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors truncate">{p.titulo}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Etiquetas</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(form.tags || []).map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => setForm({ ...form, tags: form.tags?.filter(t => t !== tag) })}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" placeholder="Agregar etiqueta..." />
              <button type="button" onClick={addTag} className="px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors">+</button>
            </div>
          </div>
        </form>

        <div className="p-8 pt-4 shrink-0">
          <button type="submit" onClick={() => { if (form.titulo?.trim()) onSave(form); }}
            className="w-full py-4 text-white bg-slate-900 hover:bg-indigo-600 rounded-2xl font-black text-sm transition-colors shadow-xl active:scale-[0.98]">
            {taskToEdit ? 'Guardar Cambios' : 'Crear Tarea'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════
// TASK DETAIL PANEL
// ════════════════════════════════════════

interface TaskDetailPanelProps {
  task: CRMTask;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, onClose, onStatusChange, onDelete }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentUser, setCommentUser] = useState(VENDEDORES[0].value);
  const [loadingComments, setLoadingComments] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await tasksService.fetchComments(task.id);
      setComments(data);
    } catch (e) { console.error(e); }
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await tasksService.addComment(task.id, commentUser, newComment.trim());
      setNewComment('');
      loadComments();
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const col = STATUS_COLUMNS.find(c => c.id === task.estado);
  const pStyle = PRIORITY_STYLES[task.prioridad || 'media'];
  const overdue = isOverdue(task);

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[150] flex flex-col border-l border-slate-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
          <div className="flex gap-2">
            <button onClick={() => onDelete(task.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"><Trash2 size={16} /></button>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900 leading-tight">{task.titulo}</h2>
        {task.descripcion && <p className="text-sm text-slate-500 mt-2">{task.descripcion}</p>}
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estado</label>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black text-white ${col?.headerBg || 'bg-slate-400'}`}>
              {col?.title || task.estado}
            </span>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prioridad</label>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black border ${pStyle.bg} ${pStyle.text}`}>
              {getLabel(PRIORIDADES_TAREA, task.prioridad || 'media')}
            </span>
          </div>
        </div>

        {/* Due date */}
        {task.fecha_vencimiento && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vencimiento</label>
            <div className={`flex items-center gap-2 text-sm font-bold ${overdue ? 'text-red-500' : 'text-slate-700'}`}>
              <Calendar size={14} />
              {fmtDateTime(task.fecha_vencimiento)}
              {overdue && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-lg font-black">VENCIDA</span>}
            </div>
          </div>
        )}

        {/* Assigned */}
        {task.asignados && task.asignados.length > 0 && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asignados</label>
            <div className="flex flex-wrap gap-2">
              {task.asignados.map(a => (
                <span key={a} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <span className="w-5 h-5 rounded-md bg-indigo-200 flex items-center justify-center text-[9px] font-black">{getVendedorIniciales(a)}</span>
                  {getLabel(VENDEDORES, a)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((t, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Status change buttons */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Cambiar Estado</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_COLUMNS.map(s => (
              <button key={s.id} onClick={() => onStatusChange(task.id, s.id)}
                disabled={task.estado === s.id}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${task.estado === s.id
                  ? `${s.headerBg} text-white`
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Comentarios</label>
          {loadingComments ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Sin comentarios aún</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">{getVendedorIniciales(c.usuario)}</span>
                    <span className="text-xs font-black text-slate-700">{getLabel(VENDEDORES, c.usuario)}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{fmtDateTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 pl-8">{c.texto}</p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <select value={commentUser} onChange={e => setCommentUser(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none shrink-0 w-28">
              {VENDEDORES.map(v => <option key={v.value} value={v.value}>{v.iniciales}</option>)}
            </select>
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none" placeholder="Agregar comentario..." />
            <button onClick={handleAddComment} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors"><Send size={16} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════
// KANBAN VIEW
// ════════════════════════════════════════

interface ViewProps {
  tasks: CRMTask[];
  searchQuery: string;
  onOpenTask: (t: CRMTask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const KanbanView: React.FC<ViewProps> = ({ tasks, searchQuery, onOpenTask, onStatusChange }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mobileCol, setMobileCol] = useState<TaskStatus>('pendiente');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const filtered = useMemo(() =>
    searchQuery ? tasks.filter(t => t.titulo.toLowerCase().includes(searchQuery.toLowerCase())) : tasks
  , [tasks, searchQuery]);

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedId) {
      const task = tasks.find(t => t.id === draggedId);
      if (task && task.estado !== status) onStatusChange(draggedId, status);
      setDraggedId(null);
    }
  };

  const renderCard = (task: CRMTask) => {
    const pStyle = PRIORITY_STYLES[task.prioridad || 'media'];
    const overdueBool = isOverdue(task);
    const next = NEXT_STATUS[task.estado];

    return (
      <motion.div layoutId={task.id} key={task.id}
        draggable onDragStart={(e: any) => { setDraggedId(task.id); e.dataTransfer?.setData('text/plain', task.id); }}
        onClick={() => onOpenTask(task)}
        className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all group ${draggedId === task.id ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start gap-2">
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 cursor-grab"><GripVertical size={14} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${pStyle.bg} ${pStyle.text}`}>
                {getLabel(PRIORIDADES_TAREA, task.prioridad || 'media')}
              </span>
            </div>
            <h4 className="font-black text-slate-800 text-sm leading-tight mb-1">{task.titulo}</h4>
            {task.descripcion && <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.descripcion}</p>}

            <div className="flex items-center gap-3 mt-3">
              {task.fecha_vencimiento && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${overdueBool ? 'text-red-500' : 'text-slate-400'}`}>
                  <Calendar size={11} /> {fmtDate(task.fecha_vencimiento)}
                </div>
              )}
              {task.asignados && task.asignados.length > 0 && (
                <div className="flex -space-x-1.5">
                  {task.asignados.slice(0, 3).map(a => (
                    <span key={a} className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black border-2 border-white" title={getLabel(VENDEDORES, a)}>
                      {getVendedorIniciales(a)}
                    </span>
                  ))}
                  {task.asignados.length > 3 && <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-black border-2 border-white">+{task.asignados.length - 3}</span>}
                </div>
              )}
            </div>

            {next && (
              <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, next); }}
                className="mt-3 flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors">
                <ArrowRight size={12} /> Mover a {STATUS_COLUMNS.find(c => c.id === next)?.title}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isMobile) {
    const colTasks = filtered.filter(t => t.estado === mobileCol);
    const col = STATUS_COLUMNS.find(c => c.id === mobileCol)!;
    return (
      <div>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {STATUS_COLUMNS.map(c => {
            const count = filtered.filter(t => t.estado === c.id).length;
            return (
              <button key={c.id} onClick={() => setMobileCol(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0 ${mobileCol === c.id ? `${c.headerBg} text-white` : 'bg-slate-100 text-slate-500'}`}>
                {c.title} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {colTasks.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">Sin tareas en esta columna</p>
          ) : colTasks.map(renderCard)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto flex-1 items-start pb-4">
      {STATUS_COLUMNS.map(col => {
        const colTasks = filtered.filter(t => t.estado === col.id);
        return (
          <div key={col.id} className="flex-1 min-w-[260px] max-w-[340px] flex flex-col"
            onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, col.id)}>
            <div className={`${col.headerBg} text-white px-4 py-3 rounded-t-2xl flex items-center gap-2`}>
              <col.icon size={16} />
              <span className="text-xs font-black uppercase tracking-wider">{col.title}</span>
              <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black">{colTasks.length}</span>
            </div>
            <div className="bg-slate-50/50 border border-t-0 border-slate-100 rounded-b-2xl p-3 space-y-3 min-h-[200px] flex-1">
              {colTasks.length === 0 ? (
                <p className="text-center text-xs text-slate-300 py-8">Sin tareas</p>
              ) : colTasks.map(renderCard)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ════════════════════════════════════════
// LIST VIEW
// ════════════════════════════════════════

const ListView: React.FC<ViewProps & { onEdit: (t: CRMTask) => void }> = ({ tasks, searchQuery, onOpenTask, onStatusChange, onEdit }) => {
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterPrioridad, setFilterPrioridad] = useState<string>('todos');
  const [filterAsignado, setFilterAsignado] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (searchQuery) result = result.filter(t => t.titulo.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterEstado !== 'todos') result = result.filter(t => t.estado === filterEstado);
    if (filterPrioridad !== 'todos') result = result.filter(t => t.prioridad === filterPrioridad);
    if (filterAsignado !== 'todos') result = result.filter(t => t.asignados?.includes(filterAsignado));
    return result;
  }, [tasks, searchQuery, filterEstado, filterPrioridad, filterAsignado]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [filterEstado, filterPrioridad, filterAsignado, searchQuery]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none">
            <option value="todos">Todos los estados</option>
            {STATUS_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <select value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none">
          <option value="todos">Todas las prioridades</option>
          {PRIORIDADES_TAREA.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={filterAsignado} onChange={e => setFilterAsignado(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none">
          <option value="todos">Todos los asignados</option>
          {VENDEDORES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
        <span className="text-xs text-slate-400 font-bold self-center ml-auto">{filtered.length} tareas</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarea</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Prioridad</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Asignados</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(task => {
                const pStyle = PRIORITY_STYLES[task.prioridad || 'media'];
                const col = STATUS_COLUMNS.find(c => c.id === task.estado);
                const overdueBool = isOverdue(task);
                return (
                  <tr key={task.id} onClick={() => onOpenTask(task)}
                    className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-black text-sm text-slate-800 leading-tight">{task.titulo}</p>
                      {task.descripcion && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.descripcion}</p>}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${pStyle.bg} ${pStyle.text}`}>
                        {getLabel(PRIORIDADES_TAREA, task.prioridad || 'media')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black text-white ${col?.headerBg || 'bg-slate-400'}`}>
                        {col?.title}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex -space-x-1">
                        {(task.asignados || []).slice(0, 3).map(a => (
                          <span key={a} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black border-2 border-white">
                            {getVendedorIniciales(a)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {task.fecha_vencimiento ? (
                        <span className={`text-xs font-bold ${overdueBool ? 'text-red-500' : 'text-slate-500'}`}>
                          {fmtDate(task.fecha_vencimiento)} {overdueBool && '(!)'}
                        </span>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-slate-400">Sin tareas para los filtros seleccionados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="text-xs font-bold text-slate-400">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// CHARTS VIEW
// ════════════════════════════════════════

const ChartsView: React.FC<{ tasks: CRMTask[] }> = ({ tasks }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const total = tasks.length;
    const completadasMes = tasks.filter(t => t.estado === 'completada' && t.updated_at && new Date(t.updated_at) >= thisMonth).length;
    const vencidas = tasks.filter(t => isOverdue(t)).length;
    const enProgreso = tasks.filter(t => t.estado === 'en_proceso').length;
    return { total, completadasMes, vencidas, enProgreso };
  }, [tasks]);

  const byStatus = useMemo(() =>
    STATUS_COLUMNS.map((c, i) => ({ name: c.title, value: tasks.filter(t => t.estado === c.id).length, fill: CHART_COLORS[i] }))
  , [tasks]);

  const byPriority = useMemo(() =>
    PRIORIDADES_TAREA.map((p, i) => ({ name: p.label, value: tasks.filter(t => t.prioridad === p.value).length, fill: PIE_COLORS[i] }))
  , [tasks]);

  const weeklyCompletions = useMemo(() => {
    const weeks: { name: string; completadas: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const count = tasks.filter(t =>
        t.estado === 'completada' && t.updated_at &&
        new Date(t.updated_at) >= start && new Date(t.updated_at) < end
      ).length;
      weeks.push({ name: `S${8 - i}`, completadas: count });
    }
    return weeks;
  }, [tasks]);

  const kpis = [
    { label: 'Total Tareas', value: stats.total, icon: CheckCircle2, color: 'bg-slate-900 text-white' },
    { label: 'Completadas (mes)', value: stats.completadasMes, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Vencidas', value: stats.vencidas, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'En Progreso', value: stats.enProgreso, icon: Clock, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className={`p-6 rounded-2xl ${k.color} border border-slate-100`}>
            <k.icon size={20} className="mb-3 opacity-60" />
            <p className="text-3xl font-black">{k.value}</p>
            <p className="text-xs font-bold mt-1 opacity-60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar: by status */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-black text-slate-900 mb-4">Tareas por Estado</h3>
          {byStatus.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byStatus} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {byStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-12">Sin datos</p>}
        </div>

        {/* Line: weekly completions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-black text-slate-900 mb-4">Completadas por Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyCompletions}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completadas" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: by priority */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:col-span-2">
          <h3 className="text-sm font-black text-slate-900 mb-4">Distribución por Prioridad</h3>
          {byPriority.some(d => d.value > 0) ? (
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={byPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {byPriority.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {byPriority.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="w-3 h-3 rounded" style={{ background: PIE_COLORS[i] }} />
                    {p.name}: {p.value}
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-slate-400 text-center py-12">Sin datos</p>}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// MESSAGES VIEW
// ════════════════════════════════════════

const MessagesView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(VENDEDORES[0].value);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [conversations, setConversations] = useState<Record<string, { last: InternalMessage; unread: number }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const allMsgs = await tasksService.fetchMessages(currentUser);
      const convos: Record<string, { last: InternalMessage; unread: number }> = {};
      const sentMsgs = await tasksService.fetchMessages(undefined, currentUser);
      const all = [...allMsgs, ...sentMsgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      all.forEach(m => {
        const otherUser = m.de === currentUser ? m.para : m.de;
        if (!convos[otherUser]) {
          convos[otherUser] = { last: m, unread: 0 };
        }
        if (m.para === currentUser && !m.leido) {
          convos[otherUser].unread++;
        }
      });
      setConversations(convos);
    } catch (e) { console.error(e); }
  }, [currentUser]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!selectedContact) return;
    const load = async () => {
      setLoadingMsgs(true);
      try {
        const data = await tasksService.fetchMessages(currentUser, selectedContact);
        setMessages(data);
        // Mark unread as read
        data.filter(m => m.para === currentUser && !m.leido).forEach(m => {
          tasksService.markMessageRead(m.id).catch(console.error);
        });
      } catch (e) { console.error(e); }
      setLoadingMsgs(false);
    };
    load();
  }, [selectedContact, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedContact) return;
    try {
      await tasksService.sendMessage(currentUser, selectedContact, newMsg.trim());
      setNewMsg('');
      const data = await tasksService.fetchMessages(currentUser, selectedContact);
      setMessages(data);
      loadConversations();
    } catch (e) {
      addToast('Error', 'No se pudo enviar el mensaje', 'error');
    }
  };

  const contacts = VENDEDORES.filter(v => v.value !== currentUser);

  const renderContactList = () => (
    <div className="flex flex-col h-full">
      {/* Current user selector */}
      <div className="p-4 border-b border-slate-100">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tu identidad</label>
        <select value={currentUser} onChange={e => { setCurrentUser(e.target.value); setSelectedContact(null); }}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold outline-none">
          {VENDEDORES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {contacts.map(v => {
          const convo = conversations[v.value];
          return (
            <button key={v.value} onClick={() => setSelectedContact(v.value)}
              className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedContact === v.value ? 'bg-indigo-50' : ''}`}>
              <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-black shrink-0">{v.iniciales}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-800 truncate">{v.label}</p>
                  {convo?.unread ? (
                    <span className="bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{convo.unread}</span>
                  ) : null}
                </div>
                {convo?.last && <p className="text-xs text-slate-400 truncate mt-0.5">{convo.last.texto}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderChat = () => {
    if (!selectedContact) {
      return (
        <div className="flex items-center justify-center h-full text-center p-8">
          <div>
            <MessageSquare size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">Seleccioná un contacto para chatear</p>
          </div>
        </div>
      );
    }

    const contactInfo = VENDEDORES.find(v => v.value === selectedContact);

    return (
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          {isMobile && (
            <button onClick={() => setSelectedContact(null)} className="p-1.5 bg-slate-50 rounded-lg"><ChevronLeft size={18} /></button>
          )}
          <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">{contactInfo?.iniciales}</span>
          <p className="font-black text-slate-900 text-sm">{contactInfo?.label}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingMsgs ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-12">Sin mensajes aún. Escribí el primero.</p>
          ) : messages.map(m => {
            const isMine = m.de === currentUser;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${isMine ? 'bg-slate-900 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>
                  <p>{m.texto}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-slate-400' : 'text-slate-400'}`}>{fmtDateTime(m.created_at)}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 flex gap-2 shrink-0">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Escribí un mensaje..." />
          <button onClick={handleSend}
            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors shrink-0"><Send size={18} /></button>
        </div>
      </div>
    );
  };

  // Mobile: show list or chat
  if (isMobile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-[600px]">
        {selectedContact ? renderChat() : renderContactList()}
      </div>
    );
  }

  // Desktop: side by side
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex h-[600px]">
      <div className="w-80 border-r border-slate-100 shrink-0">{renderContactList()}</div>
      <div className="flex-1">{renderChat()}</div>
    </div>
  );
};

// ════════════════════════════════════════
// MAIN TASKS COMPONENT
// ════════════════════════════════════════

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<CRMTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<CRMTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.fetchTasks();
      setTasks(data);
    } catch (e: any) {
      console.error('Error loading tasks:', e);
      setError('No se pudieron cargar las tareas');
    }
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const handleSaveTask = async (formData: Partial<CRMTask>) => {
    try {
      if (taskToEdit) {
        await tasksService.saveTask({ ...taskToEdit, ...formData } as CRMTask);
        addToast('Tarea actualizada', `"${formData.titulo}" se actualizó correctamente.`, 'success');
      } else {
        await tasksService.createTask(formData as Omit<CRMTask, 'id' | 'created_at' | 'updated_at'>);
        addToast('Tarea creada', `"${formData.titulo}" fue creada.`, 'success');
      }
      setIsModalOpen(false);
      setTaskToEdit(null);
      loadTasks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar la tarea.';
      addToast('Error', msg, 'error');
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await tasksService.updateTaskStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, estado: status } : t));
      if (selectedTask?.id === id) setSelectedTask(prev => prev ? { ...prev, estado: status } : null);
      const statusTitle = STATUS_COLUMNS.find(c => c.id === status)?.title || status;
      addToast('Estado actualizado', `Tarea movida a "${statusTitle}"`, 'success');
    } catch (e) {
      addToast('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar esta tarea?')) return;
    try {
      await tasksService.deleteTask(id);
      addToast('Tarea eliminada', 'La tarea se eliminó permanentemente.', 'info');
      setSelectedTask(null);
      loadTasks();
    } catch (e) {
      addToast('Error', 'No se pudo eliminar la tarea', 'error');
    }
  };

  const openEditModal = (task: CRMTask) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tareas</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestión del equipo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold outline-none w-48 focus:w-64 transition-all focus:ring-4 focus:ring-indigo-50"
              placeholder="Buscar tarea..." />
          </div>
          <button onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            className="px-5 py-3 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 text-sm">
            <Plus size={18} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-100'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-bold">Cargando tareas...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle size={32} className="text-red-300 mx-auto mb-3" />
            <p className="text-sm text-red-500 font-bold mb-4">{error}</p>
            <button onClick={loadTasks} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 mx-auto hover:bg-indigo-600 transition-colors">
              <RefreshCw size={14} /> Reintentar
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'kanban' && <KanbanView tasks={tasks} searchQuery={searchQuery} onOpenTask={setSelectedTask} onStatusChange={handleStatusChange} />}
          {activeTab === 'list' && <ListView tasks={tasks} searchQuery={searchQuery} onOpenTask={setSelectedTask} onStatusChange={handleStatusChange} onEdit={openEditModal} />}
          {activeTab === 'charts' && <ChartsView tasks={tasks} />}
          {activeTab === 'messages' && <MessagesView />}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setTaskToEdit(null); }} onSave={handleSaveTask} taskToEdit={taskToEdit} />
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <div className="fixed inset-0 bg-slate-900/20 z-[140]" onClick={() => setSelectedTask(null)} />
            <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
