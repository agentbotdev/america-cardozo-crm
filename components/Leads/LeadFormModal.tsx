import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Lead } from '../../types';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Lead>) => Promise<void>;
  leadToEdit: Lead | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSave, leadToEdit }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    nombre: '',
    telefono: '',
    email: '',
    workflow_type: 'ventas',
    tipo_operacion_buscada: 'venta',
    temperatura: 'tibio',
    etapa: 'contacto_inicial',
    presupuesto_max: 0
  });

  useEffect(() => {
    if (leadToEdit) {
      setFormData(leadToEdit);
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        workflow_type: 'ventas',
        tipo_operacion_buscada: 'venta',
        temperatura: 'tibio',
        etapa: 'contacto_inicial',
        presupuesto_max: 0
      });
    }
  }, [leadToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-[210] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {leadToEdit ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                <input
                  type="text"
                  required
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50"
                  placeholder="+54 9 11..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50"
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operación</label>
                <select
                  value={formData.tipo_operacion_buscada || 'venta'}
                  onChange={(e) => setFormData({ ...formData, tipo_operacion_buscada: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none appearance-none cursor-pointer"
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inmueble</label>
                <select
                  value={(formData.tipo_propiedad_buscada && formData.tipo_propiedad_buscada[0]) || 'departamento'}
                  onChange={(e) => setFormData({ ...formData, tipo_propiedad_buscada: [e.target.value] })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none appearance-none cursor-pointer"
                >
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="ph">PH</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temperatura</label>
                <select
                  value={formData.temperatura || 'tibio'}
                  onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none appearance-none cursor-pointer"
                >
                  <option value="frio">Frío</option>
                  <option value="tibio">Tibio</option>
                  <option value="caliente">Caliente</option>
                  <option value="ultra_caliente">Ultra Caliente</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Presupuesto (USD)</label>
                <input
                  type="number"
                  value={formData.presupuesto_max || ''}
                  onChange={(e) => setFormData({ ...formData, presupuesto_max: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50"
                  placeholder="Ej: 150000"
                />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {leadToEdit ? 'Guardar Cambios' : 'Crear Oportunidad'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
