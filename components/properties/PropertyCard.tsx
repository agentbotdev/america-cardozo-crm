import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, BedDouble, Bath, Ruler, Edit, ChevronRight } from 'lucide-react';
import { Property } from '../../types';
import { OptimizedImage } from '../OptimizedImage';

interface PropertyCardProps {
  property: Property;
  onView: (property: Property, edit?: boolean) => void;
}

const PropertyCard = React.memo(({ property, onView }: PropertyCardProps) => {
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
        <OptimizedImage src={property.foto_portada || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'} alt={property.titulo} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
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

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
