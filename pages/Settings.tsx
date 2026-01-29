import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Smartphone, Globe, Database, Settings as SettingsIcon, Shield, Bell, Zap, Calendar } from 'lucide-react';
import { googleCalendarService } from '../services/googleCalendarService';
import { useSearchParams } from 'react-router-dom';

const IntegrationCard = ({ title, description, children, onTest, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/40 mb-8 group hover:shadow-indigo-100/50 transition-all duration-500"
  >
    <div className="flex justify-between items-start mb-8">
      <div className="flex gap-5">
        <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{description}</p>
        </div>
      </div>
      {onTest && (
        <button
          onClick={onTest}
          className="bg-slate-50 hover:bg-white text-indigo-600 px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
        >
          <RefreshCw size={14} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-700" />
          Probar conexión
        </button>
      )}
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.div>
);

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeZone, setTimeZone] = useState('America/Argentina/Buenos_Aires');

  useEffect(() => {
    checkConnection();
    handleOAuthCallback();
    const savedTZ = localStorage.getItem('crm_timezone');
    if (savedTZ) setTimeZone(savedTZ);
  }, []);

  const checkConnection = async () => {
    try {
      const tokens = await googleCalendarService.getTokens();
      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    console.log('Detected OAuth code in Settings:', code);
    if (code) {
      try {
        setIsLoading(true);
        await googleCalendarService.exchangeCodeForToken(code);
        setIsConnected(true);
        // Clear code from URL
        setSearchParams({});
        alert('Google Calendar conectado exitosamente!');
      } catch (error) {
        console.error('Error exchanging code:', error);
        alert('Error al conectar con Google Calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConnect = () => {
    window.location.href = googleCalendarService.getAuthUrl();
  };

  const handleSaveSettings = () => {
    localStorage.setItem('crm_timezone', timeZone);
    alert('Configuración guardada correctamente');
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-fade-in px-4">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-1.5 bg-slate-900 rounded-full"></div>
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Configuración</h1>
      </div>

      <div className="space-y-4 mb-12">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Integraciones de Datos</p>

        {/* Tokko Integration */}
        <IntegrationCard
          title="Tokko Broker"
          description="Sincronización de propiedades y estados"
          icon={Database}
          delay={1}
          onTest={() => alert('Testing Tokko connection...')}
        >
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">API Key Principal</label>
            <input
              type="password"
              defaultValue="tk_xxxxxxxxxxxxxxxx"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-mono"
            />
          </div>
        </IntegrationCard>

        {/* WhatsApp Integration */}
        <IntegrationCard
          title="WhatsApp Cloud API"
          description="Gestión de mensajería y chatbots IA"
          icon={Smartphone}
          delay={2}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number ID</label>
              <input type="text" className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="102938..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">WABA ID</label>
              <input type="text" className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="1029..." />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Permanent Access Token</label>
            <input type="password" className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-mono" />
          </div>
        </IntegrationCard>

        {/* Google Calendar Integration */}
        <IntegrationCard
          title="Google Calendar"
          description="Sincronización de visitas y eventos"
          icon={Calendar}
          delay={3}
          onTest={isConnected ? () => alert('Conexión activa') : undefined}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
              <div>
                <p className="text-sm font-black text-slate-900">Estado de la cuenta</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isConnected ? 'Sincronización Activada' : 'No vinculado'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'}`}></div>
            </div>

            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {isLoading ? 'Conectando...' : 'Vincular Google Calendar'}
              </button>
            ) : (
              <p className="text-[10px] text-center font-bold text-slate-400 italic">
                Tus visitas se sincronizarán automáticamente con tu calendario principal.
              </p>
            )}
          </div>
        </IntegrationCard>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Preferencias del Sistema</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/40"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe size={18} className="text-slate-400" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Localización</h4>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Moneda por defecto</label>
                <select className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none">
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="ARS">Peso Argentino (ARS)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Zona Horaria</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
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

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap size={18} className="text-slate-400" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Rendimiento IA</h4>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Respuesta Automática</span>
                <div className="w-12 h-6 bg-slate-900 rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Notificaciones Push</span>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 md:pl-72 flex justify-center lg:justify-end z-[100]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveSettings}
          className="w-full max-w-xs bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
        >
          <Save size={20} strokeWidth={2.5} />
          Guardar Configuración
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;