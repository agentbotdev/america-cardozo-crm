import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Layers, BedDouble, Bath, Ruler, Save } from 'lucide-react';
import { Property } from '../../types';
import AIEnhanceButton from './AIEnhanceButton';
import ImageUpload from './ImageUpload';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Partial<Property>) => void;
  propertyToEdit: Property | null;
}

const PropertyFormModal = ({ isOpen, onClose, onSave, propertyToEdit }: PropertyFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Property>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'ubicacion' | 'specs' | 'media'>('info');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (propertyToEdit) {
      setFormData(propertyToEdit);
    } else {
      setFormData({
        tipo: 'casa',
        tipo_operacion: 'venta',
        estado: 'borrador',
        moneda: 'USD',
        fotos: []
      });
    }
    setActiveTab('info');
  }, [propertyToEdit, isOpen]);

  const updateField = (field: keyof Property, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-[210] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{propertyToEdit ? 'Editar Propiedad' : 'Nueva Unidad'}</h2>
            <div className="flex gap-1 ml-6 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
              {['info', 'ubicacion', 'specs', 'media'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <div className="p-10 overflow-y-auto no-scrollbar flex-1">
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Propiedad</label>
                  <AIEnhanceButton
                    type="title"
                    currentValue={formData.titulo || ''}
                    context={formData}
                    onEnhance={(val) => updateField('titulo', val)}
                  />
                </div>
                <input
                  type="text"
                  value={formData.titulo || ''}
                  onChange={e => updateField('titulo', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none"
                  placeholder="Ej: Espectacular Departamento frente al Mar"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidad</label>
                  <select value={formData.tipo_operacion} onChange={e => updateField('tipo_operacion', e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                    <option value="temporario">Temporario</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio y Moneda</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.precio_venta || formData.precio_alquiler || ''}
                      onChange={e => updateField(formData.tipo_operacion === 'venta' ? 'precio_venta' : 'precio_alquiler', Number(e.target.value))}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                    <select value={formData.moneda} onChange={e => updateField('moneda', e.target.value as any)} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none">
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                  <select value={formData.estado} onChange={e => updateField('estado', e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
                    <option value="publicada">Publicada</option>
                    <option value="reservada">Reservada</option>
                    <option value="borrador">Captación / Borrador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
                  <select value={formData.tipo} onChange={e => updateField('tipo', e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="ph">PH</option>
                    <option value="lote">Terreno / Lote</option>
                    <option value="oficina">Oficina</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Detallada</label>
                  <AIEnhanceButton
                    type="description"
                    currentValue={formData.descripcion || ''}
                    context={formData}
                    onEnhance={(val) => updateField('descripcion', val)}
                  />
                </div>
                <textarea
                  rows={6}
                  value={formData.descripcion || ''}
                  onChange={e => updateField('descripcion', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50"
                  placeholder="Describe los puntos fuertes de la propiedad..."
                />
              </div>
            </div>
          )}

          {activeTab === 'ubicacion' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Exacta</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.direccion_completa || ''}
                    onChange={e => updateField('direccion_completa', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none"
                    placeholder="Calle y número..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barrio / Zona</label>
                  <input type="text" value={formData.barrio || ''} onChange={e => updateField('barrio', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad</label>
                  <input type="text" value={formData.ciudad || ''} onChange={e => updateField('ciudad', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Layers size={14} /> Ambientes</label>
                  <input type="number" value={formData.ambientes || ''} onChange={e => updateField('ambientes', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><BedDouble size={14} /> Dorms</label>
                  <input type="number" value={formData.dormitorios || ''} onChange={e => updateField('dormitorios', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Bath size={14} /> Baños</label>
                  <input type="number" value={formData.banos_completos || ''} onChange={e => updateField('banos_completos', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Ruler size={14} /> Sup. Cub.</label>
                  <input type="number" value={formData.sup_cubierta || ''} onChange={e => updateField('sup_cubierta', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['cochera', 'balcon', 'terraza', 'patio', 'pileta', 'parrilla', 'seguridad_24hs', 'apto_profesional', 'apto_mascotas'].map((feature) => (
                  <label key={feature} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 cursor-pointer hover:bg-white transition-all">
                    <input type="checkbox" checked={(formData as any)[feature] || false} onChange={e => updateField(feature as any, e.target.checked)} className="w-6 h-6 rounded-lg accent-indigo-500 shadow-sm" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{feature.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <ImageUpload
                images={formData.fotos || []}
                setImages={(imgs) => updateField('fotos', imgs)}
                folder="properties"
                uploading={uploading}
                setUploading={setUploading}
              />
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">Descartar</button>
          <button
            disabled={uploading}
            onClick={() => onSave(formData)}
            className={`flex-[2] py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600'}`}
          >
            {uploading ? (
              <>Subiendo archivos...</>
            ) : (
              <>
                <Save size={18} /> {propertyToEdit ? 'Actualizar Propiedad' : 'Publicar Unidad'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyFormModal;
