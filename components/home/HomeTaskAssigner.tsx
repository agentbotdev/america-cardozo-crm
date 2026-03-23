import React, { useState } from 'react';
import { CheckSquare, Plus, Calendar as CalendarIcon, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { VENDEDORES, PRIORIDADES_TAREA } from '../../config/taxonomy';

export const HomeTaskAssigner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    asignado_a: [] as string[],
    prioridad: 'media' as 'urgente' | 'alta' | 'media' | 'baja',
    fecha_vencimiento: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || formData.asignado_a.length === 0) {
      alert('Por favor completa el título y asigna al menos un vendedor');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from('tareas').insert({
        titulo: formData.titulo,
        asignado_a: formData.asignado_a,
        prioridad: formData.prioridad,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        estado: 'pendiente',
        creado_por: 'Sistema'
      });

      if (error) throw error;

      // Reset form
      setFormData({
        titulo: '',
        asignado_a: [],
        prioridad: 'media',
        fecha_vencimiento: ''
      });

      setIsOpen(false);
      alert('¡Tarea creada exitosamente!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear la tarea. Verifica que la tabla "tareas" exista en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVendedor = (vendedorValue: string) => {
    setFormData(prev => ({
      ...prev,
      asignado_a: prev.asignado_a.includes(vendedorValue)
        ? prev.asignado_a.filter(v => v !== vendedorValue)
        : [...prev.asignado_a, vendedorValue]
    }));
  };

  const priorityColors = {
    urgente: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    alta: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    media: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
    baja: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckSquare size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Asignación Rápida</h3>
              <p className="text-[10px] text-white/70 font-semibold mt-0.5">
                Crear y asignar tareas
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-white hover:bg-slate-50 rounded-xl text-sm font-bold text-indigo-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={18} />
          Nueva Tarea Rápida
        </button>

        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-[10px] text-white/60 text-center">
            Asigna tareas a tu equipo en segundos
          </p>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <CheckSquare size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">Nueva Tarea</h2>
                  <p className="text-xs text-slate-400 font-semibold">Asignación rápida de tareas</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Título de la tarea *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Contactar cliente para seguimiento..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Asignar a vendedores */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Asignar a *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VENDEDORES.map(vendedor => {
                    const isSelected = formData.asignado_a.includes(vendedor.value);
                    return (
                      <button
                        key={vendedor.value}
                        type="button"
                        onClick={() => toggleVendedor(vendedor.value)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {vendedor.iniciales}
                          </div>
                          <span className="truncate">{vendedor.label.split(' ')[0]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {formData.asignado_a.length === 0 && (
                  <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Selecciona al menos un vendedor
                  </p>
                )}
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Prioridad
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORIDADES_TAREA.map(prioridad => (
                    <button
                      key={prioridad.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, prioridad: prioridad.value as any }))}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        formData.prioridad === prioridad.value
                          ? priorityColors[prioridad.value as keyof typeof priorityColors]
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {prioridad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <CalendarIcon size={14} />
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={e => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.titulo.trim() || formData.asignado_a.length === 0}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Crear Tarea
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
