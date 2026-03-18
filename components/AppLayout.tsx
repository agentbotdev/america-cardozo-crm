
import React, { useState, useContext, createContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Home, Building2, Users, UserCircle, CalendarDays,
  BarChart3, LifeBuoy, Settings, Menu, Bell, Search, LogOut, ChevronLeft, ChevronRight, X,
  Zap, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => { },
  isMobile: false,
  isCollapsed: false,
  setIsCollapsed: () => { },
});

export const useLayout = () => useContext(LayoutContext);

const SidebarItem = React.memo(({ to, icon: Icon, label, onClick, isCollapsed }: { to: string, icon: React.ElementType, label: string, onClick?: () => void, isCollapsed?: boolean }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : ""}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ease-out mb-1 relative overflow-hidden group active:scale-95
        ${isActive
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 ring-1 ring-slate-800'
          : 'text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm'
        } ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : ''}`
      }
    >
      <Icon size={18} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="truncate whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
});

// Search result types
interface SearchResultGroup {
  leads: Array<{ id: string; nombre: string }>;
  properties: Array<{ id: string; titulo: string; foto_portada?: string | null }>;
  clients: Array<{ id: string; nombre: string }>;
}

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultGroup>({ leads: [], properties: [], clients: [] });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(`/settings?code=${code}`);
      return;
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Real search with debounce (BUG-004 fix)
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ leads: [], properties: [], clients: [] });
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    try {
      const searchTerm = `%${query}%`;

      const [leadsRes, propsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('id, nombre, email, telefono')
          .or(`nombre.ilike.${searchTerm},email.ilike.${searchTerm},telefono.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from('propiedades')
          .select('id, titulo, direccion_completa, barrio, foto_portada')
          .or(`titulo.ilike.${searchTerm},direccion_completa.ilike.${searchTerm},barrio.ilike.${searchTerm}`)
          .limit(5),
      ]);

      setSearchResults({
        leads: (leadsRes.data || []).map(l => ({ id: l.id, nombre: l.nombre || '' })),
        properties: (propsRes.data || []).map(p => ({
          id: p.id,
          titulo: p.titulo || '',
          foto_portada: p.foto_portada || null,
        })),
        clients: [], // clients come from leads table for now
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearchLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsSearching(true);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => performSearch(value), 300);
  }, [performSearch]);

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/properties', icon: Building2, label: 'Propiedades' },
    { to: '/leads', icon: Users, label: 'Oportunidades' },
    { to: '/clients', icon: UserCircle, label: 'Clientes' },
    { to: '/visits', icon: CalendarDays, label: 'Visitas' },
    { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
    { to: '/reports', icon: BarChart3, label: 'Reportes' },
    { to: '/control', icon: Zap, label: 'Centro Control' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
    { to: '/support', icon: LifeBuoy, label: 'Soporte' },
  ];

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsSearching(false);
    setSearchQuery('');
  };

  const hasResults = searchResults.leads.length > 0 || searchResults.properties.length > 0;

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, isMobile, isCollapsed, setIsCollapsed }}>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans transform-gpu">

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-slate-900/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={isMobile ? { x: -280 } : false}
          animate={{
            width: isMobile ? (sidebarOpen ? 280 : 0) : (isCollapsed ? 80 : 280),
            x: isMobile ? (sidebarOpen ? 0 : -280) : 0,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 220, mass: 0.8 }}
          className={`flex-shrink-0 h-full z-[100] border-r border-slate-100 bg-white/80 backdrop-blur-xl ${isMobile ? 'fixed' : 'relative'}`}
        >
          <div className="h-full flex flex-col p-5 overflow-hidden">
            <div className="h-16 flex items-center gap-3 mb-8 px-2 shrink-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg ring-1 ring-slate-100">
                <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 uppercase">AgentBot</h1>
                    <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">CRM v2.0</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isCollapsed={isCollapsed}
                  onClick={() => isMobile && setSidebarOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 shrink-0">
              {!isMobile && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-full flex items-center justify-center py-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all group"
                  title={isCollapsed ? "Expandir" : "Contraer"}
                  aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
                >
                  {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2 px-2"><ChevronLeft size={18} /><span className="text-xs font-bold">Contraer Menú</span></div>}
                </button>
              )}
              <SidebarItem to="/logout" icon={LogOut} label="Cerrar Sesión" isCollapsed={isCollapsed} />
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-20 flex items-center justify-between px-6 lg:px-10 shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 relative z-[90]">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 text-slate-600 bg-white shadow-sm border border-slate-100 rounded-xl lg:hidden active:scale-90 transition-transform mr-4"
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>

              {/* Global Search Bar — BUG-004 FIX: real Supabase queries */}
              <div className="relative flex-1 max-w-lg hidden sm:block" ref={searchRef}>
                <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:bg-white transition-all">
                  <Search size={16} className="text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Busca en el CRM..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-bold placeholder:text-slate-300"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearching(true)}
                    aria-label="Búsqueda global"
                  />
                  {isSearchLoading && (
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin ml-2" />
                  )}
                </div>

                <AnimatePresence>
                  {isSearching && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] p-4 max-h-[70vh] overflow-y-auto no-scrollbar"
                    >
                      {isSearchLoading ? (
                        <p className="text-xs text-slate-400 text-center py-4">Buscando...</p>
                      ) : !hasResults ? (
                        <p className="text-xs text-slate-400 text-center py-4">No se encontraron resultados</p>
                      ) : (
                        <>
                          {searchResults.properties.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 px-2">Propiedades</h3>
                              {searchResults.properties.map(p => (
                                <button key={p.id} onClick={() => handleResultClick('/properties')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left">
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                    {p.foto_portada ? (
                                      <img src={p.foto_portada} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Building2 size={14} className="text-slate-300" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 truncate">{p.titulo}</p>
                                </button>
                              ))}
                            </div>
                          )}
                          {searchResults.leads.length > 0 && (
                            <div>
                              <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 px-2">Oportunidades</h3>
                              {searchResults.leads.map(l => (
                                <button key={l.id} onClick={() => handleResultClick('/leads')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left">
                                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">{l.nombre.charAt(0)}</div>
                                  <p className="text-xs font-bold text-slate-700 truncate">{l.nombre}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl text-slate-400 transition-all hover:shadow-sm group"
                  aria-label="Notificaciones"
                >
                  <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-[350px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] p-4"
                    >
                      <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-black text-slate-900">Alertas</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-xs text-indigo-600 font-bold">Marcar todas leídas</button>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                          <p className="text-xs font-black text-rose-700">Lead sin responder hace 48hs</p>
                          <p className="text-[10px] text-rose-600 mt-1 font-bold">Martín González - Propiedad ID: 154</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <p className="text-xs font-black text-emerald-700">Visita confirmada 15hs</p>
                          <p className="text-[10px] text-emerald-600 mt-1 font-bold">Av. Libertador 4500 - Juan Pérez</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-black text-slate-700">Reporte semanal generado</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-bold">12 nuevos leads esta semana</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 transition-all cursor-pointer group shrink-0">
                <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-md border border-white">
                  <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block">
                  <p className="text-[11px] font-black text-slate-900 leading-none">Admin Bot</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase mt-1 leading-none tracking-widest">Soporte</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 no-scrollbar scroll-smooth bg-[#F8FAFC]">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default AppLayout;
