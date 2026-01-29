
import React, { useState, useContext, createContext, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, UserCircle, CalendarDays,
  BarChart3, LifeBuoy, MessageSquare, Settings, Menu, Bell, Search, LogOut, ChevronLeft, ChevronRight, X,
  Bot, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_LEADS, MOCK_PROPERTIES, MOCK_CLIENTS } from '../constants';

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
      title={isCollapsed ? label : ""} // Simple native tooltip for collapsed state
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

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for Google OAuth code in the root URL (due to Google redirecting away from HashRouter paths)
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      // Clear the query params and navigate to the configuracion page with the code in the hash path
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(`/configuracion?code=${code}`);
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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { leads: [], properties: [], clients: [] };
    const query = searchQuery.toLowerCase();
    return {
      leads: MOCK_LEADS.filter(l => l.nombre.toLowerCase().includes(query)).slice(0, 3),
      properties: MOCK_PROPERTIES.filter(p => p.titulo.toLowerCase().includes(query) || p.barrio.toLowerCase().includes(query)).slice(0, 3),
      clients: MOCK_CLIENTS.filter(c => c.nombre.toLowerCase().includes(query)).slice(0, 3)
    };
  }, [searchQuery]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/propiedades', icon: Building2, label: 'Propiedades' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/clientes', icon: UserCircle, label: 'Clientes' },
    { to: '/visitas', icon: CalendarDays, label: 'Visitas' },
    { to: '/reportes', icon: BarChart3, label: 'Reportes' },
    { to: '/metrics', icon: Zap, label: 'Métricas' }, // Added item
    { to: '/live-chat', icon: MessageSquare, label: 'Live Chat' },
    { to: '/performance-ia', icon: Bot, label: 'Performance IA' },
    { to: '/soporte', icon: LifeBuoy, label: 'Soporte' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ];

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsSearching(false);
    setSearchQuery('');
  };

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
                    // Fixed duplicate opacity keys in initial, animate, and exit props
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 uppercase">AgentBot</h1>
                    <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">CRM v1.5 PRO</p>
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
              >
                <Menu size={20} />
              </button>

              {/* Global Search Bar */}
              <div className="relative flex-1 max-w-lg hidden sm:block" ref={searchRef}>
                <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:bg-white transition-all">
                  <Search size={16} className="text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Busca en el CRM..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-bold placeholder:text-slate-300"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                  />
                </div>

                <AnimatePresence>
                  {isSearching && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] p-4 max-h-[70vh] overflow-y-auto no-scrollbar"
                    >
                      {searchResults.properties.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 px-2">Propiedades</h3>
                          {searchResults.properties.map(p => (
                            <button key={p.id} onClick={() => handleResultClick('/propiedades')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left">
                              <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0"><img src={p.imagen_principal} alt="" className="w-full h-full object-cover" /></div>
                              <p className="text-xs font-bold text-slate-700 truncate">{p.titulo}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.leads.length > 0 && (
                        <div>
                          <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 px-2">Leads</h3>
                          {searchResults.leads.map(l => (
                            <button key={l.id} onClick={() => handleResultClick('/leads')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">{l.nombre.charAt(0)}</div>
                              <p className="text-xs font-bold text-slate-700 truncate">{l.nombre}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2.5 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl text-slate-400 transition-all hover:shadow-sm group">
                <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              </button>
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
