import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook genérico de Supabase Realtime.
 * Se suscribe a INSERT, UPDATE y DELETE de una tabla.
 * Cuando detecta un cambio, ejecuta `onChange()` para que la página recargue.
 *
 * Uso:
 *   useRealtimeTable('leads', loadLeads);
 *   useRealtimeTable('tareas', loadTasks);
 */
export function useRealtimeTable(
  table: string,
  onChange: () => void,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          onChangeRef.current();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, enabled]);
}
