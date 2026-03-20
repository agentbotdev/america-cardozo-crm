import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Home, UserPlus, Star, Calendar, BarChart3, 
  ChevronRight, MessageSquare, Briefcase, Settings
} from 'lucide-react';

export const HomeQuickActions: React.FC = () => {
  const navigate = useNavigate();
  
  const actions = [
    { icon: Home,     label: 'Nueva Captación', desc: 'Registrar propiedad',    action: () => navigate('/properties'), color: 'bg-emerald-50 text-emerald-600' },
    { icon: UserPlus, label: 'Oportunidad Rápida', desc: 'Ingreso manual',      action: () => navigate('/leads'),      color: 'bg-blue-50 text-blue-600' },
    { icon: Star,     label: 'Ver Destacados',   desc: 'Propiedades top',       action: () => navigate('/properties'), color: 'bg-amber-50 text-amber-600' },
    { icon: Calendar, label: 'Agendar Visita',   desc: 'Nueva visita',          action: () => navigate('/visits'),     color: 'bg-indigo-50 text-indigo-600' },
    { icon: MessageSquare, label: 'Chat WhatsApp', desc: 'Mensajes',            action: () => navigate('/control'),    color: 'bg-green-50 text-green-600' },
    { icon: Briefcase, label: 'Mis Clientes',    desc: 'Búsqueda de clientes',  action: () => navigate('/clients'),    color: 'bg-teal-50 text-teal-600' },
    { icon: BarChart3,label: 'Ver Reportes',     desc: 'Análisis completo',     action: () => navigate('/reports'),    color: 'bg-violet-50 text-violet-600' },
    { icon: Settings, label: 'Configurar',       desc: 'Ajustes del CRM',       action: () => navigate('/settings'),   color: 'bg-slate-50 text-slate-600' }
  ];

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
      <h3 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
        <Zap size={15} className="text-amber-500" /> Accesos Rápidos
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {actions.map(({ icon: Ic, label, desc, action, color }, i) => (
          <button
            key={i}
            onClick={action}
            className="w-full group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 hover:shadow-md active:scale-[0.98]"
          >
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <Ic size={17} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-black text-slate-700 group-hover:text-slate-900 truncate">{label}</p>
              <p className="text-[10px] text-slate-400 truncate">{desc}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
