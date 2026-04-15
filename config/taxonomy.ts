
export const TEMPERATURAS_LEAD = [
  { value: 'frio', label: 'FRÍO', color: 'blue' },
  { value: 'tibio', label: 'TIBIO', color: 'orange' },
  { value: 'caliente', label: 'CALIENTE', color: 'red' },
] as const;

export const ETAPAS_PROCESO = [
  { value: 'Inicio', label: 'INICIO' },
  { value: 'Indagación', label: 'INDAGACIÓN' },
  { value: 'Seguimiento', label: 'SEGUIMIENTO' },
  { value: 'Visita agendada', label: 'VISITA AGENDADA' },
  { value: 'Negociación', label: 'NEGOCIACIÓN' },
  { value: 'Cierre', label: 'CIERRE' },
] as const;

export const VENDEDORES = [
  { value: 'sin_asignar',     label: 'Sin asignar',      iniciales: '--' },
  { value: 'america_cardozo',   label: 'América Cardozo',   iniciales: 'AC' },
  { value: 'alejandro_papotti', label: 'Alejandro Papotti',  iniciales: 'AP' },
  { value: 'cristian',          label: 'Cristian',           iniciales: 'CR' },
  { value: 'juan_cruz',         label: 'Juan Cruz',          iniciales: 'JC' },
  { value: 'franco_zeballos',   label: 'Franco Zeballos',    iniciales: 'FZ' },
  { value: 'barbara_lazarte',   label: 'Barbara Lazarte',    iniciales: 'BL' },
  { value: 'maximo_cardozo',    label: 'Máximo Cardozo',     iniciales: 'MC' },
  { value: 'moria_cardozo',     label: 'Moria Cardozo',      iniciales: 'MC2'},
] as const;

export const FUENTES_LEAD = [
  { value: 'WhatsApp', label: 'WHATSAPP' },
  { value: 'ZonaProp', label: 'ZONAPROP' },
  { value: 'ArgenProp', label: 'ARGENPROP' },
  { value: 'MercadoLibre', label: 'MERCADOLIBRE' },
  { value: 'Instagram', label: 'INSTAGRAM' },
  { value: 'Facebook', label: 'FACEBOOK' },
  { value: 'Web', label: 'WEB' },
] as const;

export const PRIORIDADES_TAREA = [
  { value: 'baja', label: 'BAJA', color: 'slate' },
  { value: 'media', label: 'MEDIA', color: 'blue' },
  { value: 'alta', label: 'ALTA', color: 'orange' },
  { value: 'urgente', label: 'URGENTE', color: 'red' },
] as const;

export const CATEGORIAS_SOPORTE = [
  { value: 'Error Técnico', label: 'ERROR TÉCNICO' },
  { value: 'Facturación', label: 'FACTURACIÓN' },
  { value: 'Consulta General', label: 'CONSULTA GENERAL' },
] as const;

export const getVendedorIniciales = (value: string) => {
  const v = VENDEDORES.find(v => v.value === value);
  return v ? v.iniciales : '??';
};

export const getLabel = (taxonomy: readonly { value: string; label: string }[], value: string) => {
  const item = taxonomy.find(i => i.value === value);
  return item ? item.label : value;
};

/**
 * Devuelve el label legible de un vendedor a partir de su value (slug).
 * Si el value no existe en el array, devuelve el value crudo (nunca undefined).
 * Acepta null/undefined — devuelve 'Sin asignar'.
 */
export const getVendedorLabel = (value: string | null | undefined): string => {
  if (!value || value === 'sin_asignar') return 'Sin asignar';
  return VENDEDORES.find(v => v.value === value)?.label ?? value;
};
