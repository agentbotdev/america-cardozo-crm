import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Development } from '../../services/developmentsService';
import ImageUpload from './ImageUpload';

interface DevelopmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dev: Partial<Development>) => void;
  devToEdit: Development | null;
}

const DevelopmentFormModal = ({ isOpen, onClose, onSave, devToEdit }: DevelopmentFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Development>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'multimedia'>('general');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (devToEdit) setFormData(devToEdit);
    else setFormData({ tipo: 'edificio', estado_obra: 'lanzamiento', fotos: [] });
    setActiveTab('general');
  }, [devToEdit, isOpen]);

  const updateField = (field: keyof Development, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose}></div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-[210] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{devToEdit ? 'Editar Emprendimiento' : 'Nuevo Proyecto'}</h2>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Gral</button>
              <button onClick={() => setActiveTab('multimedia')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'multimedia' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Media</button>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <div className="p-10 overflow-y-auto no-scrollbar flex-1 space-y-8">
          {activeTab === 'general' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label> <input type="text" value={formData.nombre || ''} onChange={e => updateField('nombre', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Nombre del emprendimiento..." /></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label><select value={formData.tipo} onChange={e => updateField('tipo', e.target.value as any)} className="border border-slate-100 bg-slate-50 w-full rounded-2xl p-4 text-sm font-bold outline-none"><option value="edificio">Edificio</option><option value="loteo">Loteo</option><option value="barrio_cerrado">Barrio Cerrado</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label><select value={formData.estado_obra} onChange={e => updateField('estado_obra', e.target.value as any)} className="border border-slate-100 bg-slate-50 w-full rounded-2xl p-4 text-sm font-bold outline-none"><option value="pozo">Pozo</option><option value="en_construccion">En Construcción</option><option value="lanzamiento">Lanzamiento</option><option value="entregado">Entregado</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección</label> <input type="text" value={formData.direccion || ''} onChange={e => updateField('direccion', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ciudad</label> <input type="text" value={formData.ciudad || ''} onChange={e => updateField('ciudad', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Totales</label> <input type="number" value={formData.unidades_totales || ''} onChange={e => updateField('unidades_totales', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Entrega</label> <input type="date" value={formData.fecha_entrega || ''} onChange={e => updateField('fecha_entrega', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <ImageUpload images={formData.fotos || []} setImages={(imgs) => updateField('fotos', imgs)} folder="developments" uploading={uploading} setUploading={setUploading} />
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">Cancelar</button>
          <button
            disabled={uploading}
            onClick={() => onSave(formData)}
            className={`flex-[2] py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600'}`}
          >
            {uploading ? 'Subiendo...' : 'Guardar Emprendimiento'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DevelopmentFormModal;
