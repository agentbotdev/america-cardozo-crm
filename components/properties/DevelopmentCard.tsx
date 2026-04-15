import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Development } from '../../services/developmentsService';
import { OptimizedImage } from '../OptimizedImage';

interface DevelopmentCardProps {
  development: Development;
  onView: (development: Development) => void;
}

const DevelopmentCard = React.memo(({ development, onView }: DevelopmentCardProps) => {
  const statusColors: Record<string, string> = {
    pozo: 'bg-indigo-500',
    en_construccion: 'bg-amber-500',
    preventa: 'bg-emerald-500',
    entregado: 'bg-slate-500',
    lanzamiento: 'bg-indigo-600'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] overflow-hidden group shadow-sm hover:shadow-2xl border border-slate-100 flex flex-col h-full relative"
    >
      <div className="h-64 w-full bg-slate-100 relative cursor-pointer" onClick={() => onView(development)}>
        <OptimizedImage src={development.foto_portada || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'} alt={development.nombre} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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

DevelopmentCard.displayName = 'DevelopmentCard';

export default DevelopmentCard;
