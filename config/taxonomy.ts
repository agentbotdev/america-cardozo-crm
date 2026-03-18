export const PROPERTY_TYPES = [
  'Casa',
  'Departamento',
  'Lote',
  'Local',
  'Oficina'
] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];

export const PROPERTY_STATUS = [
  'Disponible',
  'Reservado',
  'Vendido',
  'Alquilado',
  'Pausado'
] as const;

export type PropertyStatus = typeof PROPERTY_STATUS[number];

export const LEAD_STATUS = [
  'Nuevo',
  'Contactado',
  'En seguimiento',
  'Visita agendada',
  'Negociación',
  'Ganado',
  'Perdido'
] as const;

export type LeadStatus = typeof LEAD_STATUS[number];
