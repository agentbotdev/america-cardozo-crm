import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types';
import {
  Plus, MapPin, Search, X, Heart,
  BedDouble, Bath, Ruler, ChevronLeft, ChevronRight, Home, Info, Layers,
  Building2, Image as ImageIcon, Edit, Upload, Trash2, CheckCircle2,
  Trash, Save, Map as MapIcon, ArrowLeft, Clock
} from 'lucide-react';
import { propertiesService } from '../services/propertiesService';
import { developmentsService, Development } from '../services/developmentsService';
import { storageService } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';

// --- SHARED UI SUB-COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex-shrink-0
      ${active
        ? 'bg-slate-900 text-white shadow-2xl scale-105 ring-8 ring-white'
        : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-slate-100 hover:shadow-md'
      }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const InfoCard = ({ icon: Icon, label, value, color = 'indigo' }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
    <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-inner`}>
      <Icon size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-black text-slate-900 leading-none truncate tracking-tight">{value}</p>
      <p className="text-[10px] text-slate-400 uppercase font-black mt-1.5 tracking-widest truncate">{label}</p>
    </div>
  </div>
);

// --- IMAGE UPLOAD COMPONENT ---
const ImageUpload = ({ images, setImages, folder, uploading, setUploading }: {
  images: any[],
  setImages: (imgs: any[]) => void,
  folder: 'properties' | 'developments',
  uploading: boolean,
  setUploading: (v: boolean) => void
}) => {

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      try {
        const publicUrl = await storageService.uploadFile(files[i], folder);
        newImages.push({
          url: publicUrl,
          es_portada: newImages.length === 0,
          orden: newImages.length,
          descripcion: ''
        });
      } catch (error: any) {
        console.error('Error uploading file:', error);
        alert(`Error al subir imagen: ${error.message || 'Error desconocido'}`);
      }
    }

    setImages(newImages);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const setPortada = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      es_portada: i === index
    }));
    setImages(newImages);
  };

  return (
    <div className="space-y-6">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Multimedia</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div key={index} className={`relative aspect-square rounded-[1.5rem] overflow-hidden border-2 ${img.es_portada ? 'border-indigo-500' : 'border-slate-100'}`}>
            <img src={img.url} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => setPortada(index)} className={`p-2 rounded-lg transition-all ${img.es_portada ? 'bg-indigo-500 text-white' : 'bg-black/50 text-white hover:bg-white hover:text-indigo-500'}`}>
                <CheckCircle2 size={12} />
              </button>
              <button onClick={() => removeImage(index)} className="p-2 bg-black/50 text-white rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={12} />
              </button>
            </div>
            {img.es_portada && (
              <div className="absolute bottom-0 inset-x-0 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center">Portada</div>
            )}
          </div>
        ))}
        <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Upload size={24} className="text-slate-300 group-hover:text-indigo-500 mb-2" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subir</span>
            </>
          )}
          <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
};

// --- 1. REFINED PROPERTY CARD ---
const PropertyCard = React.memo(({ property, onView }: any) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const statusColors: Record<string, string> = {
    publicada: 'bg-emerald-500',
    pausada: 'bg-amber-500',
    reservada: 'bg-orange-500',
    vendida: 'bg-slate-500',
    alquilada: 'bg-purple-600',
    borrador: 'bg-slate-300'
  };
  const precio = property.tipo_operacion === 'venta' ? property.precio_venta : property.precio_alquiler;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3rem] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 border border-slate-100 flex flex-col h-full relative"
    >
      <div className="h-64 sm:h-72 w-full bg-slate-100 relative overflow-hidden cursor-pointer" onClick={() => onView(property)}>
        <img src={property.foto_portada || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'} alt={property.titulo} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-70"></div>
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl backdrop-blur-md ring-1 ring-white/30 ${statusColors[property.estado] || 'bg-slate-500'}`}>{property.estado}</span>
          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/95 text-slate-900 shadow-xl backdrop-blur-md w-fit ring-1 ring-black/5">{property.tipo_operacion}</span>
        </div>
        <button className={`absolute top-5 right-5 p-3 rounded-full backdrop-blur-md transition-all duration-500 z-10 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-rose-500'}`} onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}>
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} strokeWidth={3} />
        </button>
        <div className="absolute bottom-6 left-8 right-8 text-white z-10">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[10px] font-black text-slate-300">{property.moneda}</span>
            <p className="text-3xl font-black tracking-tighter">{precio?.toLocaleString()}</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 flex items-center gap-2 truncate"><MapPin size={12} className="text-indigo-400" /> {property.barrio}</p>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-lg font-black text-slate-900 mb-6 line-clamp-1">{property.titulo}</h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <BedDouble size={20} className="text-indigo-600 mb-1.5" />
            <span className="text-sm font-black text-slate-900">{property.dormitorios || 0}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Bath size={20} className="text-indigo-600 mb-1.5" />
            <span className="text-sm font-black text-slate-900">{property.banos_completos || 0}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Ruler size={20} className="text-indigo-600 mb-1.5" />
            <span className="text-sm font-black text-slate-900">{property.sup_cubierta}</span>
          </div>
        </div>
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100/50">
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onView(property, true); }} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><Edit size={16} strokeWidth={2.5} /></button>
            <button onClick={(e) => { e.stopPropagation(); onView(property); }} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-xl"><ChevronRight size={16} strokeWidth={3.5} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// --- 1.2 DEVELOPMENT CARD ---
const DevelopmentCard = React.memo(({ development, onView }: { development: Development; onView: (d: Development) => void }) => {
  const statusColors: Record<string, string> = {
    pozo: 'bg-indigo-500',
    en_construccion: 'bg-amber-500',
    preventa: 'bg-emerald-500',
    entregado: 'bg-slate-500',
    lanzamiento: 'bg-purple-600'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] overflow-hidden group shadow-sm hover:shadow-2xl border border-slate-100 flex flex-col h-full relative"
    >
      <div className="h-64 w-full bg-slate-100 relative cursor-pointer" onClick={() => onView(development)}>
        <img src={development.foto_portada || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'} alt={development.nombre} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md shadow-xl ${statusColors[development.estado_obra] || 'bg-slate-500'}`}>
            {development.estado_obra.replace('_', ' ')}
          </span>
          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/95 text-slate-900 backdrop-blur-md shadow-xl w-fit">
            {development.tipo}
          </span>
        </div>
        <div className="absolute bottom-6 left-8 right-8 text-white z-10">
          <p className="text-3xl font-black tracking-tighter mb-1 drop-shadow-2xl">{development.nombre}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-200 flex items-center gap-2"><MapPin size={12} className="text-indigo-400" /> {development.ciudad}</p>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidades</p>
            <p className="text-lg font-black text-slate-900">{development.unidades_totales}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Entrega</p>
            <p className="text-lg font-black text-slate-900">{development.fecha_entrega ? new Date(development.fecha_entrega).getFullYear() : 'TBD'}</p>
          </div>
        </div>
        <button onClick={() => onView(development)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Gestionar Emprendimiento</button>
      </div>
    </motion.div>
  );
});

// --- 2. PROPERTY DETAIL VIEW ---
const PropertyDetailView = ({ property, onClose, onEdit }: any) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const images = useMemo(() => {
    if (property.fotos && property.fotos.length > 0) return property.fotos.map((f: any) => f.url || f);
    return [property.foto_portada || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'];
  }, [property]);

  const precio = property.tipo_operacion === 'venta' ? property.precio_venta : property.precio_alquiler;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#F8FAFC] animate-fade-in overflow-hidden">
      <div className="p-6 md:p-12 flex justify-between items-center absolute top-0 left-0 right-0 z-[110] pointer-events-none">
        <button onClick={onClose} className="pointer-events-auto bg-white/90 text-slate-900 p-4 rounded-[1.8rem] shadow-2xl hover:bg-slate-900 hover:text-white transition-all backdrop-blur-md ring-1 ring-black/5 flex items-center gap-3 font-black text-xs uppercase tracking-widest">
          <ArrowLeft size={20} strokeWidth={3} /> Volver
        </button>
        <div className="flex gap-4 pointer-events-auto">
          <button className="bg-white/90 text-slate-900 p-4 rounded-[1.8rem] shadow-2xl hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md ring-1 ring-black/5" onClick={() => onEdit(property)}><Edit size={24} /></button>
          <button className="bg-white/90 text-slate-900 p-4 rounded-[1.8rem] shadow-2xl hover:bg-rose-500 hover:text-white transition-all backdrop-blur-md ring-1 ring-black/5"><Heart size={24} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-32 px-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="relative h-[55vh] rounded-[4rem] overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={images[currentImageIndex]} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 text-white">
              <h1 className="text-5xl font-black mb-4 tracking-tighter">{property.titulo}</h1>
              <p className="flex items-center gap-2 font-bold opacity-80 uppercase tracking-widest text-xs"><MapPin size={18} /> {property.barrio}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <InfoCard icon={BedDouble} label="Dormitorios" value={property.dormitorios || 0} />
                <InfoCard icon={Bath} label="Baños" value={property.banos_completos || 0} />
                <InfoCard icon={Ruler} label="Superficie" value={`${property.sup_cubierta}m²`} />
                <InfoCard icon={Layers} label="Ambientes" value={property.ambientes || '-'} />
              </div>
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-4">
                  <Info size={18} className="text-indigo-500" /> Descripción
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">{property.descripcion || "Sin descripción disponible."}</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Inversión Recurrente</p>
                <h2 className="text-5xl font-black tracking-tighter mb-10 flex items-baseline gap-2">
                  <span className="text-xl text-slate-400">{property.moneda}</span>
                  {precio?.toLocaleString()}
                </h2>
                <button
                  onClick={() => navigate(`/visitas?propertyId=${property.id}`)}
                  className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Programar Visita</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGallery && (
          <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
            <button onClick={() => setShowGallery(false)} className="absolute top-10 right-10 text-white p-4 hover:bg-white/10 rounded-full transition-all"><X size={32} /></button>
            <div className="relative w-full max-w-6xl h-[70vh]">
              <img src={images[currentImageIndex]} className="w-full h-full object-contain" alt="" />
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length); }} className="absolute left-0 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20"><ChevronLeft size={32} /></button>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % images.length); }} className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20"><ChevronRight size={32} /></button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 3. FORMS MODALS ---
const PropertyFormModal = ({ isOpen, onClose, onSave, propertyToEdit }: any) => {
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
            <div className="flex gap-1 ml-6 bg-slate-50 p-1.5 rounded-2xl">
              {['info', 'ubicacion', 'specs', 'media'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <div className="p-10 overflow-y-auto no-scrollbar flex-1">
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Propiedad</label> <input type="text" value={formData.titulo || ''} onChange={e => updateField('titulo', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none" placeholder="Ej: Espectacular Departamento frente al Mar" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidad</label> <select value={formData.tipo_operacion} onChange={e => updateField('tipo_operacion', e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"><option value="venta">Venta</option><option value="alquiler">Alquiler</option><option value="temporario">Temporario</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio y Moneda</label> <div className="flex gap-2"><input type="number" value={formData.precio_venta || formData.precio_alquiler || ''} onChange={e => updateField(formData.tipo_operacion === 'venta' ? 'precio_venta' : 'precio_alquiler', Number(e.target.value))} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /><select value={formData.moneda} onChange={e => updateField('moneda', e.target.value as any)} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none"><option value="USD">USD</option><option value="ARS">ARS</option></select></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label> <select value={formData.estado} onChange={e => updateField('estado', e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"><option value="publicada">Publicada</option><option value="reservada">Reservada</option><option value="borrador">Captación / Borrador</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Propiedad</label> <select value={formData.tipo} onChange={e => updateField('tipo', e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"><option value="casa">Casa</option><option value="departamento">Departamento</option><option value="ph">PH</option><option value="lote">Terreno / Lote</option><option value="oficina">Oficina</option></select></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Detallada</label> <textarea rows={4} value={formData.descripcion || ''} onChange={e => updateField('descripcion', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Describe los puntos fuertes de la propiedad..." /></div>
            </div>
          )}

          {activeTab === 'ubicacion' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Exacta</label> <div className="relative"><MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={formData.direccion_completa || ''} onChange={e => updateField('direccion_completa', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none" placeholder="Calle y número..." /></div></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barrio / Zona</label> <input type="text" value={formData.barrio || ''} onChange={e => updateField('barrio', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad</label> <input type="text" value={formData.ciudad || ''} onChange={e => updateField('ciudad', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="space-y-2"><label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Layers size={14} /> Ambientes</label> <input type="number" value={formData.ambientes || ''} onChange={e => updateField('ambientes', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
                <div className="space-y-2"><label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><BedDouble size={14} /> Dorms</label> <input type="number" value={formData.dormitorios || ''} onChange={e => updateField('dormitorios', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
                <div className="space-y-2"><label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Bath size={14} /> Baños</label> <input type="number" value={formData.banos_completos || ''} onChange={e => updateField('banos_completos', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
                <div className="space-y-2"><label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Ruler size={14} /> Sup. Cub.</label> <input type="number" value={formData.sup_cubierta || ''} onChange={e => updateField('sup_cubierta', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {['cochera', 'balcon', 'terraza', 'patio', 'pileta', 'parrilla', 'seguridad_24hs', 'apto_profesional', 'apto_mascotas'].map((feature) => (
                  <label key={feature} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 cursor-pointer hover:bg-white transition-all">
                    <input type="checkbox" checked={(formData as any)[feature] || false} onChange={e => updateField(feature as any, e.target.checked)} className="w-6 h-6 rounded-lg accent-indigo-500" />
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

const DevelopmentFormModal = ({ isOpen, onClose, onSave, devToEdit }: any) => {
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
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
            <>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label> <input type="text" value={formData.nombre || ''} onChange={e => updateField('nombre', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="Nombre del emprendimiento..." /></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label><select value={formData.tipo} onChange={e => updateField('tipo', e.target.value as any)} className="border border-slate-100 bg-slate-50 w-full rounded-2xl p-4 text-sm font-bold"><option value="edificio">Edificio</option><option value="loteo">Loteo</option><option value="barrio_cerrado">Barrio Cerrado</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label><select value={formData.estado_obra} onChange={e => updateField('estado_obra', e.target.value as any)} className="border border-slate-100 bg-slate-50 w-full rounded-2xl p-4 text-sm font-bold"><option value="pozo">Pozo</option><option value="en_construccion">En Construcción</option><option value="lanzamiento">Lanzamiento</option><option value="entregado">Entregado</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección</label> <input type="text" value={formData.direccion || ''} onChange={e => updateField('direccion', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ciudad</label> <input type="text" value={formData.ciudad || ''} onChange={e => updateField('ciudad', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Totales</label> <input type="number" value={formData.unidades_totales || ''} onChange={e => updateField('unidades_totales', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Entrega</label> <input type="date" value={formData.fecha_entrega || ''} onChange={e => updateField('fecha_entrega', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
              </div>
            </>
          ) : (
            <ImageUpload images={formData.fotos || []} setImages={(imgs) => updateField('fotos', imgs)} folder="developments" uploading={uploading} setUploading={setUploading} />
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

// --- MAIN PAGE COMPONENT ---
const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'propiedades' | 'emprendimientos' | 'acquisition'>('propiedades');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProp, setViewingProp] = useState<Property | null>(null);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [editingDev, setEditingDev] = useState<Development | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, dData] = await Promise.all([
        propertiesService.fetchProperties(),
        developmentsService.fetchDevelopments()
      ]);
      setProperties(pData as any);
      setDevelopments(dData as any);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const displayedProps = useMemo(() => {
    if (activeTab === 'emprendimientos') return [];
    let props = properties.filter(p => activeTab === 'propiedades' ? p.estado !== 'borrador' : p.estado === 'borrador');
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      props = props.filter(p =>
        p.titulo?.toLowerCase().includes(term) ||
        p.barrio?.toLowerCase().includes(term)
      );
    }
    return props;
  }, [properties, activeTab, searchTerm]);

  const displayedDevs = useMemo(() => {
    if (activeTab !== 'emprendimientos') return [];
    let devs = developments;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      devs = devs.filter(d =>
        d.nombre?.toLowerCase().includes(term) ||
        d.ciudad?.toLowerCase().includes(term)
      );
    }
    return devs;
  }, [developments, activeTab, searchTerm]);

  const handleSaveDev = async (dev: Partial<Development>) => {
    try {
      const saved = await developmentsService.saveDevelopment(dev);
      // After save, handle photo sync if needed (simplified here as fetch)
      await loadData();
      setIsDevModalOpen(false);
      setEditingDev(null);
    } catch (e) { alert("Error al guardar"); }
  };

  const handleSaveProp = async (p: any) => {
    try {
      await propertiesService.saveProperty(p);
      await loadData();
      setIsModalOpen(false);
      setEditingProp(null);
    } catch (e) { alert("Error al guardar"); }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in pb-24 px-4 md:px-0 scroll-smooth">
      <AnimatePresence>
        {viewingProp && (
          <PropertyDetailView
            property={viewingProp}
            onClose={() => setViewingProp(null)}
            onEdit={(p: Property) => { setViewingProp(null); setEditingProp(p); setIsModalOpen(true); }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
          <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4 relative">Portafolio Inmobiliario</h1>
          <p className="text-slate-400 font-bold text-base uppercase tracking-widest flex items-center gap-3 relative">
            <Layers size={20} className="text-indigo-400" /> {activeTab === 'emprendimientos' ? `${developments.length} Emprendimientos` : `${properties.length} Propiedades`}
          </p>
        </div>
        <button
          onClick={() => { if (activeTab === 'emprendimientos') { setEditingDev(null); setIsDevModalOpen(true); } else { setEditingProp(null); setIsModalOpen(true); } }}
          className="bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-4 group"
        >
          <Plus size={22} className="bg-white/10 p-1.5 rounded-xl group-hover:rotate-90 transition-transform" />
          {activeTab === 'emprendimientos' ? 'CREAR EMPRENDIMIENTO' : 'AGREGAR PROPIEDAD'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-16">
        <div className="bg-white/50 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white shadow-xl flex gap-1 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'propiedades'} onClick={() => setActiveTab('propiedades')} icon={Home} label="Propiedades" />
          <TabButton active={activeTab === 'emprendimientos'} onClick={() => setActiveTab('emprendimientos')} icon={Building2} label="Emprendimientos" />
          <TabButton active={activeTab === 'acquisition'} onClick={() => setActiveTab('acquisition')} icon={Clock} label="Captaciones" />
        </div>
        <div className="flex-1 relative group">
          <Search size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input type="text" placeholder="Buscar por zona, nombre o código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/50 backdrop-blur-xl border border-white rounded-[2.5rem] pl-20 pr-8 py-6 text-sm font-bold shadow-xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Sincronizando Inventario Real Estate...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {activeTab === 'emprendimientos' ? (
            developments.length > 0 ? (
              displayedDevs.map(dev => <DevelopmentCard key={dev.id} development={dev} onView={(d) => { setEditingDev(d); setIsDevModalOpen(true); }} />)
            ) : (
              <div className="col-span-full py-40 text-center bg-white/20 rounded-[4rem] border-2 border-dashed border-slate-200">
                <Building2 size={60} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay emprendimientos registrados</p>
              </div>
            )
          ) : (
            properties.length > 0 ? (
              displayedProps.map(prop => <PropertyCard key={prop.id} property={prop} onView={(p: any, edit = false) => { if (edit) { setEditingProp(p); setIsModalOpen(true); } else setViewingProp(p); }} />)
            ) : (
              <div className="col-span-full py-40 text-center bg-white/20 rounded-[4rem] border-2 border-dashed border-slate-200">
                <Home size={60} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No se encontraron unidades</p>
              </div>
            )
          )}
        </div>
      )}

      <PropertyFormModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingProp(null); }} onSave={handleSaveProp} propertyToEdit={editingProp} />
      <DevelopmentFormModal isOpen={isDevModalOpen} onClose={() => { setIsDevModalOpen(false); setEditingDev(null); }} onSave={handleSaveDev} devToEdit={editingDev} />
    </div>
  );
};

export default Properties;
