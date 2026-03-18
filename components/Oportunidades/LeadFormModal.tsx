import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Lead } from '../../types';
import { LEAD_STATUS } from '../../config/taxonomy';

export const LeadFormModal = ({ isOpen, onClose, onSave, leadToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; leadToEdit: Lead | null }) => {
  const [formData, setFormData] = useState<any>({
    nombre: '',
    telefono: '',
    email: '',
    workflow_type: 'ventas',
    tipo_operacion_buscada: 'venta',
    temperatura: 'tibio',
    etapa: 'contacto_inicial',
    estado_seguimiento: 'Nuevo',
    presupuesto_max: 0
  });

  useEffect(() => {
    if (leadToEdit) {
        setFormData({
            ...leadToEdit,
            estado_seguimiento: leadToEdit.estado_seguimiento || 'Nuevo'
        });
    } else {
        setFormData({
            nombre: '',
            telefono: '',
            email: '',
            workflow_type: 'ventas',
            tipo_operacion_buscada: 'venta',
            temperatura: 'tibio',
            etapa: 'contacto_inicial',
            estado_seguimiento: 'Nuevo',
            presupuesto_max: 0
        });
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-[210] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{leadToEdit ? 'Editar Lead' : 'Nuevo Lead'}</h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50 hover:border-indigo-100 transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50 hover:border-indigo-100 transition-all"
                placeholder="Ej: 1123456789"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50 hover:border-indigo-100 transition-all"
                placeholder="juan@email.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Seguimiento</label>
              <select
                value={formData.estado_seguimiento}
                onChange={(e) => setFormData({ ...formData, estado_seguimiento: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none appearance-none cursor-pointer hover:border-indigo-100 transition-all"
              >
                {LEAD_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temperatura</label>
              <select
                value={formData.temperatura}
                onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none appearance-none cursor-pointer hover:border-indigo-100 transition-all"
              >
                <option value="frio">Frío</option>
                <option value="tibio">Tibio</option>
                <option value="caliente">Caliente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operación Buscada</label>
                <select
                  value={formData.tipo_operacion_buscada}
                  onChange={(e) => setFormData({ ...formData, tipo_operacion_buscada: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none appearance-none cursor-pointer hover:border-indigo-100 transition-all"
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="inversion">Inversión</option>
                </select>
              </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Presupuesto USD</label>
              <input
                type="number"
                value={formData.presupuesto_max}
                onChange={(e) => setFormData({ ...formData, presupuesto_max: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-indigo-50 hover:border-indigo-100 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 sticky bottom-0 z-20">
          <button onClick={onClose} className="w-full md:flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Cancelar</button>
          <button
            onClick={() => onSave(formData)}
            className="w-full md:flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 active:scale-95 transition-all"
          >
            {leadToEdit ? 'Actualizar Lead' : 'Guardar Nuevo Lead'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
