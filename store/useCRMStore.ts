import { create } from 'zustand';
import { Property, Lead, Client, Visit, CRMTask } from '../types';

interface CRMState {
  properties: Property[];
  leads: Lead[];
  clients: Client[];
  visits: Visit[];
  tasks: CRMTask[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setProperties: (properties: Property[]) => void;
  setLeads: (leads: Lead[]) => void;
  setClients: (clients: Client[]) => void;
  setVisits: (visits: Visit[]) => void;
  setTasks: (tasks: CRMTask[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Real-time updates
  updateProperty: (property: Property) => void;
  updateLead: (lead: Lead) => void;
  addLead: (lead: Lead) => void;
}

export const useCRMStore = create<CRMState>((set) => ({
  properties: [],
  leads: [],
  clients: [],
  visits: [],
  tasks: [],
  isLoading: false,
  error: null,

  setProperties: (properties) => set({ properties }),
  setLeads: (leads) => set({ leads }),
  setClients: (clients) => set({ clients }),
  setVisits: (visits) => set({ visits }),
  setTasks: (tasks) => set({ tasks }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateProperty: (property) => set((state) => ({
    properties: state.properties.map((p) => (p.id === property.id ? property : p)),
  })),

  updateLead: (lead) => set((state) => ({
    leads: state.leads.map((l) => (l.id === lead.id ? lead : l)),
  })),

  addLead: (lead) => set((state) => ({
    leads: [lead, ...state.leads],
  })),
}));
