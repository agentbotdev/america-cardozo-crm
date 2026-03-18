import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export const HomeTasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Mock tasks since the module doesn't exist yet
    setTasks([
      { id: '1', title: 'Llamar a Juan Pérez por alquiler', dueDate: 'Hoy, 15:00', priority: 'high', completed: false },
      { id: '2', title: 'Preparar contrato Av. Santa Fe', dueDate: 'Hoy, 18:00', priority: 'high', completed: false },
      { id: '3', title: 'Visitar depto en Palermo', dueDate: 'Mañana, 10:00', priority: 'medium', completed: false },
      { id: '4', title: 'Enviar tasación a cliente VIP', dueDate: 'Mañana, 12:00', priority: 'medium', completed: false },
      { id: '5', title: 'Revisar portal Tokko Broker', dueDate: 'Viernes', priority: 'low', completed: false },
    ]);
  }, []);

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" /> Tareas Pendientes
        </h3>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
          {tasks.filter(t => !t.completed).length} restantes
        </span>
      </div>
      
      <div className="space-y-3 flex-1">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
              task.completed 
                ? 'bg-slate-50 border-transparent opacity-60' 
                : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md'
            }`}
            onClick={() => handleToggle(task.id)}
          >
            <div className="mt-0.5 text-slate-400">
              {task.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock size={10} /> {task.dueDate}
                </span>
                {!task.completed && task.priority === 'high' && (
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertCircle size={10} /> Urgente
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors">
        Ver todas las tareas
      </button>
    </div>
  );
};
