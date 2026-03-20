import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface LeadsFiltersProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  activeFilter: string;
  setActiveFilter: (f: any) => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  viewMode: 'kanban' | 'table';
  setViewMode: (v: 'kanban' | 'table') => void;
}

export const LeadsFilters: React.FC<LeadsFiltersProps> = ({
  searchTerm, setSearchTerm,
  activeFilter, setActiveFilter,
  sortBy, setSortBy,
  viewMode, setViewMode
}) => {
  return (
    <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 md:gap-8 bg-white sticky top-0 z-20 rounded-t-[3rem]">
      <div className="flex flex-wrap gap-3 md:gap-5 items-center">
        {/* View Toggle */}
        <div className="bg-slate-50 p-1.5 rounded-[1.2rem] flex gap-1 shadow-inner border border-slate-100">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
          >Kanban</button>
           <button 
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
          >Tabla</button>
        </div>

        <div className="bg-slate-50 p-1.5 md:p-2 rounded-[2rem] md:rounded-[2.5rem] flex gap-2 shadow-inner overflow-x-auto no-scrollbar max-w-full border border-slate-100">
          {(['todos', 'caliente', 'tibio', 'frio'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === filter ? 'bg-white text-slate-900 shadow-lg ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-2xl px-6 py-4 outline-none hover:border-indigo-200 transition-all shadow-sm cursor-pointer appearance-none min-w-[180px]"
          >
            <option value="date">Recientes</option>
            <option value="price_asc">Presupuesto ↑</option>
            <option value="price_desc">Presupuesto ↓</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
            <ArrowRight size={14} className="rotate-90" />
          </div>
        </div>
      </div>

      <div className="relative group w-full lg:w-[450px]">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          className="w-full pl-16 pr-8 py-5 rounded-[2.2rem] bg-slate-50/50 border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-[10px] focus:ring-indigo-50/50 focus:border-indigo-100 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
