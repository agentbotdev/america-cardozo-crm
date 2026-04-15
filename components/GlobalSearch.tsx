import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Home, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';

export const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    leads: any[];
    properties: any[];
    clients: any[];
  }>({ leads: [], properties: [], clients: [] });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ leads: [], properties: [], clients: [] });
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        const query = searchQuery.trim();

        const [leadsData, propsData, clientsData] = await Promise.all([
          // Leads (Prospects)
          supabase
            .from('leads')
            .select('id, nombre, email, telefono, temperatura')
            .eq('es_cliente', false)
            .or(`nombre.ilike.%${query}%,email.ilike.%${query}%,telefono.ilike.%${query}%`)
            .limit(3),

          // Properties
          supabase
            .from('propiedades')
            .select('tokko_id, titulo, direccion_completa, barrio, precio_venta, precio_alquiler, foto_portada_url')
            .or(`titulo.ilike.%${query}%,direccion_completa.ilike.%${query}%,barrio.ilike.%${query}%`)
            .limit(3),

          // Clients
          supabase
            .from('leads')
            .select('id, nombre, email, telefono, temperatura')
            .eq('es_cliente', true)
            .or(`nombre.ilike.%${query}%,email.ilike.%${query}%,telefono.ilike.%${query}%`)
            .limit(3)
        ]);

        setSearchResults({
          leads: leadsData.data || [],
          properties: propsData.data || [],
          clients: clientsData.data || []
        });
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ leads: [], properties: [], clients: [] });
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <div className="relative flex-1 max-w-lg hidden sm:block" ref={searchRef}>
      <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:bg-white transition-all">
        <Search size={16} className="text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Busca propiedades, leads o clientes..."
          className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 font-bold placeholder:text-slate-300"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearching(true);
          }}
          onFocus={() => setIsSearching(true)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500 transition-colors">
            <X size={14} />
          </button>
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
            {/* Properties */}
            {searchResults.properties.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Home size={12} className="text-slate-400" />
                  <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Propiedades</h3>
                </div>
                {searchResults.properties.map(p => (
                  <button key={p.tokko_id} onClick={() => handleResultClick('/propiedades')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left group">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 ring-1 ring-slate-100 group-hover:ring-indigo-200 transition-all">
                      <img src={p.foto_portada_url || '/placeholder-prop.jpg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{p.titulo}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.barrio}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Clients */}
            {searchResults.clients.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Target size={12} className="text-slate-400" />
                  <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Clientes</h3>
                </div>
                {searchResults.clients.map(c => (
                  <button key={c.id} onClick={() => handleResultClick('/clientes')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left group">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs group-hover:bg-emerald-100 transition-colors">
                      {c.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{c.nombre}</p>
                      <p className="text-[10px] text-slate-400 truncate">{c.email || c.telefono}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Leads */}
            {searchResults.leads.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Users size={12} className="text-slate-400" />
                  <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Leads</h3>
                </div>
                {searchResults.leads.map(l => (
                  <button key={l.id} onClick={() => handleResultClick('/leads')} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all text-left group">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs group-hover:bg-indigo-100 transition-colors">
                      {l.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{l.nombre}</p>
                      <p className="text-[10px] text-slate-400 truncate">{l.email || l.telefono}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchResults.properties.length === 0 && searchResults.leads.length === 0 && searchResults.clients.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay resultados</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
