import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Activity, MessageSquare, Plus, CheckCircle, Calendar } from 'lucide-react';

interface FeedEvent {
  id: string;
  type: 'lead_created' | 'visit_agendada' | 'visit_completed' | 'lead_updated';
  title: string;
  description: string;
  date: Date;
  icon: any;
  color: string;
}

export const HomeFeed: React.FC = () => {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        // Fetch recent leads
        const { data: recentLeads } = await supabase
          .from('leads')
          .select('id, nombre, created_at, updated_at, estado')
          .order('created_at', { ascending: false })
          .limit(10);
          
        // Fetch recent visits
        const { data: recentVisits } = await supabase
          .from('visitas')
          .select('id, fecha, hora, estado, leads(nombre)')
          .order('created_at', { ascending: false })
          .limit(10);

        const feed: FeedEvent[] = [];

        recentLeads?.forEach(lead => {
          feed.push({
            id: `l-new-${lead.id}`,
            type: 'lead_created',
            title: 'Nuevo Lead Ingresado',
            description: `${lead.nombre} se sumó al CRM.`,
            date: new Date(lead.created_at),
            icon: Plus,
            color: 'bg-blue-50 text-blue-600 border-blue-100'
          });
          
          if (lead.updated_at && lead.updated_at !== lead.created_at) {
            feed.push({
              id: `l-up-${lead.id}`,
              type: 'lead_updated',
              title: 'Lead Actualizado',
              description: `${lead.nombre} (Estado: ${lead.estado || 'sin definir'})`,
              date: new Date(lead.updated_at),
              icon: Activity,
              color: 'bg-amber-50 text-amber-600 border-amber-100'
            });
          }
        });

        recentVisits?.forEach(visit => {
          feed.push({
            id: `v-sch-${visit.id}`,
            type: 'visit_agendada',
            title: 'Visita Agendada',
            description: `A las ${visit.hora} (${visit.leads ? (visit.leads as any).nombre : 'Sin contacto'})`,
            date: new Date(visit.fecha + 'T' + (visit.hora || '00:00:00')), // Approximated
            icon: Calendar,
            color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
          });
        });

        // Sort by date descending
        feed.sort((a, b) => b.date.getTime() - a.date.getTime());
        // Keep 15 events
        setEvents(feed.slice(0, 15));

      } catch (err) {
        console.error('Error fetching feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
      <h3 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2">
        <Activity size={16} className="text-violet-500" /> Actividad Reciente
      </h3>
      
      {loading ? (
        <div className="flex-1 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2 bg-slate-50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="py-10 text-center flex-1 flex flex-col items-center justify-center">
          <MessageSquare size={24} className="text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 font-semibold">No hay actividad reciente</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-slate-100">
          {events.map((event, i) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative pl-10">
                <div className={`absolute left-0 w-8 h-8 rounded-full border ${event.color} flex items-center justify-center z-10 shadow-sm bg-white`}>
                  <Icon size={14} />
                </div>
                <div className="bg-slate-50 hover:bg-slate-100 rounded-xl p-3 transition-colors border border-slate-50 hover:border-slate-200">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-xs font-black text-slate-800">{event.title}</p>
                    <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                      {event.date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
