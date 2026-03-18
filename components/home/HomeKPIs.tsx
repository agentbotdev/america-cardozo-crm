import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, Building2, Calendar, Flame, 
  Target, Activity, Home, Clock, TrendingUp 
} from 'lucide-react';

// ── Hook: contador animado ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const start = () => {
      startTimeRef.current = performance.now();
      const tick = (now: number) => {
        const elapsed = now - (startTimeRef.current ?? now);
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    start();
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

// ── Mini Sparkline ─────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ');
  return (
    <svg viewBox="0 0 100 60" className="w-full h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    spark: '#3b82f6', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', spark: '#10b981', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  spark: '#6366f1', badge: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    spark: '#f43f5e', badge: 'bg-rose-50 text-rose-600 border-rose-100' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   spark: '#f59e0b', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  spark: '#8b5cf6', badge: 'bg-violet-50 text-violet-600 border-violet-100' },
  cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-600',    spark: '#06b6d4', badge: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  slate:   { bg: 'bg-slate-50',   icon: 'text-slate-600',   spark: '#64748b', badge: 'bg-slate-50 text-slate-600 border-slate-200' },
  teal:    { bg: 'bg-teal-50',    icon: 'text-teal-600',    spark: '#14b8a6', badge: 'bg-teal-50 text-teal-600 border-teal-100' },
  orange:  { bg: 'bg-orange-50',  icon: 'text-orange-600',  spark: '#f97316', badge: 'bg-orange-50 text-orange-600 border-orange-100' }
};
type ColorKey = keyof typeof colorMap;

interface KpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  subtext?: string;
  positive?: boolean;
  icon: React.ElementType;
  delay: number;
  color: ColorKey;
  sparkData?: number[];
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, suffix = '', subtext, positive = true, icon: Icon, delay, color, sparkData }) => {
  const theme = colorMap[color];
  const animated = useCountUp(value);

  return (
    <div
      className="bg-white border border-slate-100 p-5 rounded-3xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/60"
      style={{ opacity: 0, transform: 'translateY(16px)', animation: `slideUp 0.5s ease forwards ${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`w-11 h-11 rounded-2xl ${theme.bg} ${theme.icon} flex items-center justify-center shadow-sm`}>
          <Icon size={22} />
        </div>
        {subtext && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${positive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
            <TrendingUp size={10} className={positive ? '' : 'rotate-180'} />
            {subtext}
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 tracking-tight">{animated}{suffix}</h3>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline data={sparkData} color={theme.spark} />
        </div>
      )}
    </div>
  );
};

export const HomeKPIs: React.FC<{
  stats: any,
  sparkLeads: number[],
  sparkProps: number[],
  sparkVisitas: number[],
  sparkConv: number[]
}> = ({ stats, sparkLeads, sparkProps, sparkVisitas, sparkConv }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard title="Total Oportun." value={stats.totalLeads} subtext="+12% vs mes" positive icon={Users} delay={0} color="blue" sparkData={sparkLeads} />
      <KpiCard title="Nuevos (7d)" value={stats.leadsNuevos} subtext="+5 vs sem" positive icon={Activity} delay={60} color="indigo" sparkData={[2, 4, 3, 5, 8, 5, 6]} />
      <KpiCard title="Sin Contactar" value={stats.leadsSinContactar} subtext="-2 hoy" positive icon={Target} delay={120} color="rose" sparkData={[5, 4, 3, 2, 2, 1, 0]} />
      <KpiCard title="Hot Oportun. 🔥" value={stats.hotLeadsCount} subtext="+3 hoy" positive icon={Flame} delay={180} color="orange" sparkData={[1, 2, 2, 3, 2, 4, 3]} />
      <KpiCard title="Tasa Conversión" value={stats.tasaConversion} suffix="%" subtext="+4% semana" positive icon={TrendingUp} delay={240} color="amber" sparkData={sparkConv} />

      <KpiCard title="Stock Propiedades" value={stats.propertiesCount} icon={Building2} delay={300} color="emerald" sparkData={sparkProps} />
      <KpiCard title="Propiedades Reservadas" value={stats.propertiesReserved} subtext="+1 hoy" positive icon={CheckCircle2} delay={360} color="teal" sparkData={[0, 1, 1, 2, 2, 3, 4]} />
      <KpiCard title="Visitas Agendadas" value={stats.visitsScheduled} icon={Calendar} delay={420} color="indigo" sparkData={sparkVisitas} />
      <KpiCard title="Visitas Esta Semana" value={stats.visitasSemana} subtext="+2 vs sem" positive icon={Activity} delay={480} color="violet" sparkData={[2, 3, 1, 4, 3, 2, 5]} />
      <KpiCard title="Días Prom. Cierre" value={stats.diasCierre} subtext="-2 vs mes" positive icon={Clock} delay={540} color="slate" sparkData={[22, 20, 21, 19, 20, 18, 18]} />
    </div>
  );
};
