import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, Heart, ChevronLeft, ChevronRight, X, MapPin, BedDouble, Bath, Ruler, Layers, Info } from 'lucide-react';
import { Property } from '../../types';

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}

const InfoCard = ({ icon: Icon, label, value, color = 'indigo' }: InfoCardProps) => (
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

interface PropertyDetailViewProps {
  property: Property;
  onClose: () => void;
  onEdit: (property: Property) => void;
}

const PropertyDetailView = ({ property, onClose, onEdit }: PropertyDetailViewProps) => {
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
          <div className="relative h-[40vh] md:h-[55vh] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={images[currentImageIndex]} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
              <h1 className="text-2xl md:text-5xl font-black mb-2 md:mb-4 tracking-tighter">{property.titulo}</h1>
              <p className="flex items-center gap-2 font-bold opacity-80 uppercase tracking-widest text-[10px] md:text-xs"><MapPin size={14} /> {property.barrio}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                <InfoCard icon={BedDouble} label="Dormitorios" value={property.dormitorios || 0} />
                <InfoCard icon={Bath} label="Baños" value={property.banos_completos || 0} />
                <InfoCard icon={Ruler} label="Superficie" value={`${property.sup_cubierta}m²`} />
                <InfoCard icon={Layers} label="Ambientes" value={property.ambientes || '-'} />
              </div>
              <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-4">
                  <Info size={18} className="text-indigo-500" /> Descripción
                </h3>
                <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed">{property.descripcion || "Sin descripción disponible."}</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Inversión Recurrente</p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8 md:mb-10 flex items-baseline gap-2">
                  <span className="text-lg md:text-xl text-slate-400">{property.moneda}</span>
                  {precio?.toLocaleString()}
                </h2>
                <button
                  onClick={() => navigate(`/visitas?propertyId=${property.id}`)}
                  className="w-full py-5 md:py-6 bg-white text-slate-900 rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Programar Visita</button>
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

export default PropertyDetailView;
