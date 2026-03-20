import React, { useState, useEffect } from 'react';
import { CRMTask, TaskStatus, Lead, Property } from '../types';
import { tasksService } from '../services/tasksService';
import { Plus, GripVertical, Calendar, User, X, CheckCircle2, CircleDashed, Circle, Users, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';

const COLUMNS: { id: TaskStatus; title: string; icon: any; color: string; bg: string }[] = [
  { id: 'pendiente', title: 'Pendiente', icon: CircleDashed, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'en_proceso', title: 'En Proceso', icon: Circle, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'completada', title: 'Completada', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' }
];

const TaskModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (t: CRMTask) => void; taskToEdit?: CRMTask | null }> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [formData, setFormData] = useState<Partial<CRMTask>>({
    titulo: '', descripcion: '', estado: 'pendiente', fecha_vencimiento: '', asignados: []
  });
  const [asignadoInput, setAsignadoInput] = useState('');

  useEffect(() => {
    if (taskToEdit) setFormData(taskToEdit);
    else setFormData({ titulo: '', descripcion: '', estado: 'pendiente', fecha_vencimiento: '', asignados: [] });
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (formData.titulo) { onSave({ id: formData.id || Date.now().toString(), ...formData } as CRMTask); onClose(); } }} className="space-y-4">
          <input type="text" placeholder="Título de la tarea" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" required />
          <textarea placeholder="Descripción..." value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none min-h-[100px]" />
          
          <div className="flex gap-4">
             <input type="date" value={formData.fecha_vencimiento} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
             <select value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value as TaskStatus })} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none">
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
             </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Asignados</label>
            <div className="flex flex-wrap gap-2 mb-2">
               {formData.asignados?.map((a, i) => (
                 <div key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                   {a} <button type="button" onClick={() => setFormData({ ...formData, asignados: formData.asignados?.filter(x => x !== a)})}><X size={12}/></button>
                 </div>
               ))}
            </div>
            <div className="flex gap-2">
               <input type="text" placeholder="Añadir asignado" value={asignadoInput} onChange={e => setAsignadoInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (asignadoInput.trim()) { setFormData({ ...formData, asignados: [...(formData.asignados||[]), asignadoInput.trim()] }); setAsignadoInput(''); } } }} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
               <button type="button" onClick={() => { if(asignadoInput.trim()){ setFormData({ ...formData, asignados: [...(formData.asignados||[]), asignadoInput.trim()] }); setAsignadoInput(''); } }} className="px-4 bg-slate-200 rounded-xl font-bold">Add</button>
            </div>
          </div>

          <button type="submit" className="w-full py-4 text-white bg-slate-900 rounded-2xl font-black mt-4">Guardar Tarea</button>
        </form>
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<CRMTask | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const data = await tasksService.fetchTasks();
      setTasks(data);
    } catch (error) { console.error('Error cargando tareas', error); }
  };

  const handleSaveTask = async (task: CRMTask) => {
    try {
      if (taskToEdit) {
        await tasksService.saveTask(task);
        addToast('Tarea actualizada', `La tarea "${task.titulo}" se actualizó correctamente.`, 'success');
      } else {
        await tasksService.saveTask(task);
        addToast('Tarea creada', `La tarea "${task.titulo}" ha sido creada.`, 'success');
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (error) { 
      console.error('Error guardando tarea', error); 
      addToast('Error', 'Hubo un problema al guardar la tarea.', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      if(confirm('¿Seguro que quieres eliminar esta tarea?')) {
        await tasksService.deleteTask(id);
        addToast('Tarea eliminada', 'La tarea se eliminó permanentemente.', 'info');
        loadTasks();
      }
    } catch (error) { console.error('Error eliminando tarea', error); }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    
    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task || task.estado === status) {
      setDraggedTaskId(null);
      return;
    }

    try {
      await tasksService.saveTask({ ...task, estado: status });
      setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, estado: status } : t));
      
      const statusTitle = COLUMNS.find(c => c.id === status)?.title || status;
      addToast('Estado actualizado', `La tarea ahora está en "${statusTitle}"`, 'success');
    } catch (error) { 
      console.error('Error al mover tarea', error); 
      addToast('Error', 'No se pudo actualizar el estado de la tarea', 'error');
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-16 h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tareas</h1>
                  <button onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }} className="px-5 py-3 bg-slate-900 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95">
                    <Plus size={18} /><span>Nueva Tarea</span>
                  </button>
                </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto flex-1 items-start min-h-[600px]">
        {COLUMNS.map(col => {
          const columnTasks = tasks.filter(t => t.estado === col.id);
          const Icon = col.icon;
          return (
            <div 
              key={col.id} 
              className="flex-1 min-w-[320px] max-w-[400px] bg-slate-50/50 border border-slate-100 p-6 rounded-[2rem] flex flex-col"
              onDragOver={e => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center gap-2 mb-6">
                 <div className={`p-2 rounded-xl ${col.bg} ${col.color}`}><Icon size={18} strokeWidth={3}/></div>
                 <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">{col.title} ({columnTasks.length})</h3>
              </div>

              <div className="space-y-4 flex-1">
                {columnTasks.map(task => (
                  <motion.div 
                    layoutId={task.id}
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => { setTaskToEdit(task); setIsModalOpen(true); }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-200 active:cursor-grabbing hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 cursor-grab"><GripVertical size={16}/></div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 leading-tight">{task.titulo}</h4>
                        {task.descripcion && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{task.descripcion}</p>}
                        
                        <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-slate-400">
                          {task.fecha_vencimiento && (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                               <Calendar size={12}/> {task.fecha_vencimiento}
                            </div>
                          )}
                          {task.asignados && task.asignados.length > 0 && (
                            <div className="flex items-center gap-1.5">
                               <Users size={12}/> {task.asignados.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default Tasks;
