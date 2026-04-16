import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  User, Shield, Users, Bell, Calendar, Palette,
  Save, Loader2, CheckCircle2, XCircle, Eye, EyeOff,
  Globe, ChevronRight, Download, Smartphone,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { googleCalendarService } from '../services/googleCalendarService';
import { Profile, UserRole } from '../types';

// ─── Secciones ─────────────────────────────────────────────────────────────────

const SETTINGS_SECTIONS = [
  { id: 'perfil',         label: 'Perfil',          icon: User },
  { id: 'seguridad',      label: 'Seguridad',        icon: Shield },
  { id: 'usuarios',       label: 'Usuarios',         icon: Users },
  { id: 'notificaciones', label: 'Notificaciones',   icon: Bell },
  { id: 'calendario',     label: 'Google Calendar',  icon: Calendar },
  { id: 'apariencia',     label: 'Apariencia',       icon: Palette },
] as const;

type SectionId = typeof SETTINGS_SECTIONS[number]['id'];

// ─── Helpers UI ────────────────────────────────────────────────────────────────

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
    {children}
  </label>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-300 ${props.className ?? ''}`}
  />
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-12 h-6 rounded-full relative p-1 transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <motion.div
      animate={{ x: checked ? 22 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </button>
);

const SaveFeedback = ({ status }: { status: 'idle' | 'saving' | 'ok' | 'error'; msg?: string }) => (
  <AnimatePresence>
    {status !== 'idle' && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black ${
          status === 'saving' ? 'bg-slate-100 text-slate-400' :
          status === 'ok'     ? 'bg-emerald-50 text-emerald-600' :
                                'bg-rose-50 text-rose-500'
        }`}
      >
        {status === 'saving' && <Loader2 size={14} className="animate-spin" />}
        {status === 'ok'     && <CheckCircle2 size={14} />}
        {status === 'error'  && <XCircle size={14} />}
        {status === 'saving' ? 'Guardando...' : status === 'ok' ? 'Guardado' : 'Error al guardar'}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Panel: Perfil ─────────────────────────────────────────────────────────────

const PanelPerfil = () => {
  const [nombre,   setNombre]   = useState('');
  const [telefono, setTelefono] = useState('');
  const [email,    setEmail]    = useState('');
  const [status,   setStatus]   = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');
      const { data } = await supabase.from('profiles').select('nombre, telefono').eq('id', user.id).single();
      if (data) { setNombre(data.nombre ?? ''); setTelefono(data.telefono ?? ''); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay sesión activa');
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nombre,
        telefono,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus('ok');
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Perfil" subtitle="Tu información personal" />
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <div>
          <FieldLabel>Nombre completo</FieldLabel>
          <TextInput value={nombre} onChange={e => setNombre(e.target.value)} placeholder="América Cardozo" />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput value={email} disabled className="opacity-50 cursor-not-allowed" />
          <p className="text-[9px] text-slate-400 font-bold mt-1 px-1">El email no puede cambiarse desde aquí</p>
        </div>
        <div>
          <FieldLabel>Teléfono</FieldLabel>
          <TextInput value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+54 9 351 000 0000" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <SaveFeedback status={status} />
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="ml-auto flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
          >
            <Save size={15} strokeWidth={2.5} />
            Guardar perfil
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Panel: Seguridad ──────────────────────────────────────────────────────────

const calcStrength = (pwd: string): number => {
  let s = 0;
  if (pwd.length >= 8)              s++;
  if (/[A-Z]/.test(pwd))           s++;
  if (/[0-9]/.test(pwd))           s++;
  if (/[^A-Za-z0-9]/.test(pwd))    s++;
  if (pwd.length >= 12)             s++;
  return s; // 0–5
};

const STRENGTH_LABELS = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const STRENGTH_COLORS = ['', 'bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'];

const PanelSeguridad = () => {
  const [current,  setCurrent]  = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showNew,  setShowNew]  = useState(false);
  const [status,   setStatus]   = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [errMsg,   setErrMsg]   = useState('');

  const strength = calcStrength(newPwd);
  const mismatch = confirm.length > 0 && newPwd !== confirm;

  const handleSave = async () => {
    if (newPwd !== confirm)       { setErrMsg('Las contraseñas no coinciden'); return; }
    if (newPwd.length < 8)        { setErrMsg('Mínimo 8 caracteres'); return; }
    setErrMsg('');
    setStatus('saving');
    try {
      // Verificar contraseña actual re-autenticando
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Sin sesión');
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (signInErr) throw new Error('Contraseña actual incorrecta');
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      setStatus('ok');
      setCurrent(''); setNewPwd(''); setConfirm('');
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Error al cambiar la contraseña');
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Seguridad" subtitle="Cambio de contraseña" />
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <div>
          <FieldLabel>Contraseña actual</FieldLabel>
          <TextInput type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <FieldLabel>Nueva contraseña</FieldLabel>
          <div className="relative">
            <TextInput
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Barra de fuerza */}
          {newPwd.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-slate-100'}`}
                  />
                ))}
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest px-0.5 ${STRENGTH_COLORS[strength].replace('bg-', 'text-')}`}>
                {STRENGTH_LABELS[strength]}
              </p>
            </div>
          )}
        </div>
        <div>
          <FieldLabel>Confirmar contraseña</FieldLabel>
          <TextInput
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repetí la nueva contraseña"
            className={mismatch ? 'border-rose-300 ring-4 ring-rose-50' : ''}
          />
          {mismatch && <p className="text-[9px] text-rose-400 font-bold mt-1 px-1">Las contraseñas no coinciden</p>}
        </div>

        {errMsg && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
            <p className="text-xs font-bold text-rose-500">{errMsg}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <SaveFeedback status={status} />
          <button
            onClick={handleSave}
            disabled={status === 'saving' || !current || !newPwd || !confirm}
            className="ml-auto flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
          >
            <Shield size={15} strokeWidth={2.5} />
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Panel: Usuarios ───────────────────────────────────────────────────────────

const ROL_COLORS: Record<UserRole, string> = {
  admin:    'bg-indigo-100 text-indigo-700',
  vendedor: 'bg-emerald-100 text-emerald-700',
  readonly: 'bg-slate-100 text-slate-500',
};

const PanelUsuarios = () => {
  const [perfiles, setPerfiles] = useState<Profile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
      setPerfiles((data as Profile[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const toggleRol = async (perfil: Profile) => {
    if (perfil.id === currentUserId) return; // no auto-cambiar
    const nuevoRol: UserRole = perfil.rol === 'admin' ? 'vendedor' : 'admin';
    setToggling(perfil.id);
    const { error } = await supabase.from('profiles').update({ rol: nuevoRol }).eq('id', perfil.id);
    if (!error) {
      setPerfiles(prev => prev.map(p => p.id === perfil.id ? { ...p, rol: nuevoRol } : p));
    }
    setToggling(null);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Usuarios" subtitle="Agentes del sistema" />
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {perfiles.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-8 py-5 hover:bg-slate-50/50 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 overflow-hidden">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt={p.nombre} className="w-full h-full object-cover" />
                    : (p.nombre?.[0] ?? p.email?.[0] ?? '?').toUpperCase()
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {p.nombre || '—'}
                    {p.id === currentUserId && <span className="ml-2 text-[9px] text-indigo-400 font-black uppercase">(tú)</span>}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold truncate">{p.email}</p>
                </div>
                {/* Rol badge */}
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${ROL_COLORS[p.rol] ?? ROL_COLORS.readonly}`}>
                  {p.rol}
                </span>
                {/* Toggle rol */}
                <button
                  onClick={() => toggleRol(p)}
                  disabled={p.id === currentUserId || toggling === p.id}
                  className="text-slate-300 hover:text-indigo-500 transition-colors disabled:opacity-30 flex-shrink-0"
                  title={p.id === currentUserId ? 'No podés cambiar tu propio rol' : 'Cambiar rol'}
                >
                  {toggling === p.id
                    ? <Loader2 size={18} className="animate-spin" />
                    : <ChevronRight size={18} />
                  }
                </button>
              </div>
            ))}
            {perfiles.length === 0 && (
              <div className="py-16 text-center">
                <Users size={36} className="mx-auto text-slate-200 mb-3" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin usuarios registrados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Panel: Notificaciones ─────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { id: 'new_lead',     label: 'Nuevo lead entrante',        desc: 'Cuando llega un lead nuevo al CRM' },
  { id: 'lead_hot',     label: 'Lead caliente detectado',    desc: 'Cuando un lead sube a temperatura 🔥' },
  { id: 'visit_remind', label: 'Recordatorio de visita',     desc: '1 hora antes de una visita agendada' },
  { id: 'prop_update',  label: 'Actualización de propiedad', desc: 'Cambios en propiedades sincronizadas' },
  { id: 'weekly_report',label: 'Reporte semanal',            desc: 'Resumen de métricas cada lunes' },
] as const;

type NotifId = typeof NOTIF_ITEMS[number]['id'];

const PanelNotificaciones = () => {
  const [toggles, setToggles] = useState<Record<NotifId, boolean>>({
    new_lead: true, lead_hot: true, visit_remind: true, prop_update: false, weekly_report: false,
  });

  const flip = (id: NotifId) => setToggles(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <SectionTitle title="Notificaciones" subtitle="Controlá qué alertas recibís" />
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
        {NOTIF_ITEMS.map(item => (
          <div key={item.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-sm font-black text-slate-900">{item.label}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={toggles[item.id]} onChange={() => flip(item.id)} />
          </div>
        ))}
      </div>
      <p className="text-[9px] text-slate-300 font-bold text-center uppercase tracking-widest">
        TODO: persistir preferencias en tabla user_settings
      </p>
    </div>
  );
};

// ─── Panel: Google Calendar ────────────────────────────────────────────────────

const PanelCalendario = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnected, setIsConnected]   = useState(false);
  const [isLoading,   setIsLoading]     = useState(true);
  const [feedback,    setFeedback]      = useState<{ type: 'ok' | 'error'; msg: string } | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const tokens = await googleCalendarService.getTokens();
      setIsConnected(!!tokens);
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;
    const exchange = async () => {
      setIsLoading(true);
      try {
        await googleCalendarService.exchangeCodeForToken(code);
        setIsConnected(true);
        setSearchParams({});
        setFeedback({ type: 'ok', msg: 'Google Calendar conectado exitosamente' });
      } catch (e: unknown) {
        setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Error al conectar' });
      } finally {
        setIsLoading(false);
      }
    };
    exchange();
  }, [searchParams, setSearchParams]);

  const handleConnect = () => {
    window.location.href = googleCalendarService.getAuthUrl();
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Google Calendar" subtitle="Sincronización de visitas y eventos" />

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-4 rounded-2xl border text-sm font-bold ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {feedback.msg}
        </motion.div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        {/* Estado */}
        <div className="flex items-center justify-between p-6 bg-slate-50/60 rounded-3xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-900">Estado de la cuenta</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isLoading ? 'Verificando...' : isConnected ? 'Sincronización activa' : 'No vinculado'}
            </p>
          </div>
          {isLoading
            ? <Loader2 size={18} className="animate-spin text-slate-400" />
            : <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse' : 'bg-slate-300'}`} />
          }
        </div>

        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
            {isLoading ? 'Conectando...' : 'Vincular Google Calendar'}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] text-center font-bold text-slate-400 italic">
              Tus visitas se sincronizarán automáticamente con tu calendario principal.
            </p>
            <button
              onClick={checkConnection}
              className="w-full py-3 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              Verificar conexión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Panel: Apariencia ─────────────────────────────────────────────────────────

const PanelApariencia = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('crm_dark_mode') === 'true');
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('crm_timezone') || 'America/Argentina/Buenos_Aires');
  const [saved, setSaved] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada (modo standalone)
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener('change', onMqChange);

    // Capturar el prompt nativo antes de que el browser lo descarte
    const onBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    return () => {
      mq.removeEventListener('change', onMqChange);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const handleSave = () => {
    localStorage.setItem('crm_dark_mode', String(darkMode));
    localStorage.setItem('crm_timezone', timeZone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Apariencia" subtitle="Preferencias visuales del sistema" />

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        {/* Dark mode */}
        <div className="flex items-center justify-between p-5 bg-slate-50/60 rounded-2xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-900 flex items-center gap-2">
              Modo oscuro
              <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Beta</span>
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Cambia la paleta de colores del sistema</p>
          </div>
          <Toggle checked={darkMode} onChange={() => setDarkMode(v => !v)} />
        </div>

        {/* Instalar app */}
        {!isInstalled && installPrompt && (
          <div className="flex items-center justify-between p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div>
              <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Smartphone size={15} className="text-indigo-500" />
                Instalar app
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Agregá el CRM a tu pantalla de inicio</p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-200"
            >
              <Download size={13} strokeWidth={2.5} />
              Instalar
            </button>
          </div>
        )}
        {isInstalled && (
          <div className="flex items-center gap-3 p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-slate-900">App instalada</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Ya está en tu pantalla de inicio</p>
            </div>
          </div>
        )}

        {/* Zona horaria */}
        <div>
          <FieldLabel>Zona horaria</FieldLabel>
          <div className="relative">
            <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={timeZone}
              onChange={e => setTimeZone(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all appearance-none"
            >
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/Santiago">Santiago de Chile (GMT-3)</option>
              <option value="America/Montevideo">Montevideo (GMT-3)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-emerald-600 text-xs font-black"
              >
                <CheckCircle2 size={14} /> Guardado
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            className="ml-auto flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
          >
            <Save size={15} strokeWidth={2.5} />
            Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Componente raíz ───────────────────────────────────────────────────────────

const PANEL_MAP: Record<SectionId, React.ReactNode> = {
  perfil:         <PanelPerfil />,
  seguridad:      <PanelSeguridad />,
  usuarios:       <PanelUsuarios />,
  notificaciones: <PanelNotificaciones />,
  calendario:     <PanelCalendario />,
  apariencia:     <PanelApariencia />,
};

const Settings: React.FC = () => {
  const [active, setActive] = useState<SectionId>('perfil');

  return (
    <div className="max-w-5xl mx-auto pb-32 px-4 animate-fade-in">
      {/* Título */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-1.5 bg-slate-900 rounded-full" />
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
          Configuración
        </h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* ── Sidebar nav ──────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0 sticky top-6">
          {SETTINGS_SECTIONS.map(sec => {
            const Icon = sec.icon;
            const isActive = active === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActive(sec.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all font-black text-[11px] uppercase tracking-widest ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {sec.label}
              </button>
            );
          })}
        </aside>

        {/* ── Mobile nav ───────────────────────────────────────────────── */}
        <div className="flex md:hidden gap-2 flex-wrap mb-4 w-full">
          {SETTINGS_SECTIONS.map(sec => {
            const Icon = sec.icon;
            const isActive = active === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActive(sec.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon size={13} />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* ── Panel content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {PANEL_MAP[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
