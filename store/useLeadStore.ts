import { create } from 'zustand';
import { Lead } from '../types';

export interface LeadFilters {
  searchText: string;
  temperaturas: string[];
  etapas: string[];
  operaciones: string[];
  tiposInmueble: string[];
  zonas: string[];
  estadosSeguimiento: string[];
  vendedores: string[];
  fuentes: string[];
  conVisitaProxima: boolean;
  etiquetas: string[];
}

interface LeadState {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  properties: any[];
  setProperties: (props: any[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  hasLoadedInitialData: boolean;
  setHasLoadedInitialData: (loaded: boolean) => void;
  scrollPosition: number;
  setScrollPosition: (pos: number) => void;
  
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: 'todos' | 'caliente' | 'tibio' | 'frio';
  setActiveFilter: (filter: 'todos' | 'caliente' | 'tibio' | 'frio') => void;
  sortBy: 'date' | 'price_asc' | 'price_desc';
  setSortBy: (sort: 'date' | 'price_asc' | 'price_desc') => void;
  advancedFilters: LeadFilters;
  setAdvancedFilters: (filters: LeadFilters) => void;
}

const initialFilters: LeadFilters = {
  searchText: '',
  temperaturas: [],
  etapas: [],
  operaciones: [],
  tiposInmueble: [],
  zonas: [],
  estadosSeguimiento: [],
  vendedores: [],
  fuentes: [],
  conVisitaProxima: false,
  etiquetas: []
};

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  setLeads: (leads) => set({ leads }),
  properties: [],
  setProperties: (props) => set({ properties: props }),
  loading: true,
  setLoading: (loading) => set({ loading }),
  hasLoadedInitialData: false,
  setHasLoadedInitialData: (loaded) => set({ hasLoadedInitialData: loaded }),
  scrollPosition: 0,
  setScrollPosition: (pos) => set({ scrollPosition: pos }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  activeFilter: 'todos',
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  sortBy: 'date',
  setSortBy: (sort) => set({ sortBy: sort }),
  advancedFilters: initialFilters,
  setAdvancedFilters: (filters) => set({ advancedFilters: filters }),
}));
