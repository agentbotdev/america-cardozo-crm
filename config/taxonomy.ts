/**
 * TAXONOMY - Taxonomía del Negocio para CRM America Cardozo
 *
 * Este archivo centraliza todas las enumeraciones y constantes del negocio inmobiliario.
 * Usar estos valores en todo el sistema para mantener consistencia.
 */

// ── TIPOS DE OPERACIÓN ────────────────────────────────────────────────────

export const TIPOS_OPERACION = [
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'venta', label: 'Venta' },
  { value: 'tasacion', label: 'Tasación' },
] as const;

export type TipoOperacion = typeof TIPOS_OPERACION[number]['value'];

// ── TIPOS DE INMUEBLE ──────────────────────────────────────────────────────

export const TIPOS_INMUEBLE = [
  // Residencial
  { value: 'casa', label: 'Casa', categoria: 'residencial' },
  { value: 'departamento', label: 'Departamento', categoria: 'residencial' },
  { value: 'duplex', label: 'Duplex', categoria: 'residencial' },
  { value: 'ph', label: 'PH', categoria: 'residencial' },
  { value: 'quinta', label: 'Quinta', categoria: 'residencial' },
  { value: 'barrio_privado', label: 'Barrio Privado / Country', categoria: 'residencial' },

  // Rural
  { value: 'terreno', label: 'Terreno', categoria: 'rural' },
  { value: 'loteo', label: 'Loteo', categoria: 'rural' },
  { value: 'hectarea', label: 'Hectárea', categoria: 'rural' },
  { value: 'chacra', label: 'Chacra', categoria: 'rural' },

  // Comercial
  { value: 'local_comercial', label: 'Local Comercial', categoria: 'comercial' },
  { value: 'fondo_comercio', label: 'Fondo de Comercio', categoria: 'comercial' },
  { value: 'galpon', label: 'Galpón', categoria: 'comercial' },
  { value: 'nave', label: 'Nave Industrial', categoria: 'comercial' },
  { value: 'edificio', label: 'Edificio', categoria: 'comercial' },
  { value: 'hotel', label: 'Hotel', categoria: 'comercial' },
  { value: 'complejo_turistico', label: 'Complejo Turístico', categoria: 'comercial' },
  { value: 'proyecto_comercial', label: 'Proyecto Comercial', categoria: 'comercial' },
] as const;

export type TipoInmueble = typeof TIPOS_INMUEBLE[number]['value'];
export type CategoriaInmueble = 'residencial' | 'rural' | 'comercial';

// Helper: agrupar por categoría
export const TIPOS_INMUEBLE_POR_CATEGORIA = {
  residencial: TIPOS_INMUEBLE.filter(t => t.categoria === 'residencial'),
  rural: TIPOS_INMUEBLE.filter(t => t.categoria === 'rural'),
  comercial: TIPOS_INMUEBLE.filter(t => t.categoria === 'comercial'),
};

// ── ESTADOS DE SEGUIMIENTO ────────────────────────────────────────────────

export const ESTADOS_SEGUIMIENTO = [
  { value: 'pendiente', label: 'Pendiente', color: 'slate' },
  { value: 'esperando_respuesta', label: 'Esperando Respuesta', color: 'amber' },
  { value: 'tiene_informacion', label: 'Tiene Información', color: 'blue' },
  { value: 'proceso_decision', label: 'Proceso de Decisión', color: 'indigo' },
  { value: 'vio_inmueble', label: 'Vio el Inmueble', color: 'purple' },
  { value: 'tomar_accion', label: 'Tomar Acción', color: 'orange' },
  { value: 'reservo', label: 'Reservó', color: 'emerald' },
  { value: 'nueva_busqueda', label: 'Nueva Búsqueda', color: 'cyan' },
  { value: 'congelado', label: 'Congelado', color: 'gray' },
] as const;

export type EstadoSeguimiento = typeof ESTADOS_SEGUIMIENTO[number]['value'];

// ── TEMPERATURAS DE LEAD ───────────────────────────────────────────────────

export const TEMPERATURAS_LEAD = [
  { value: 'frio', label: 'Frío', color: 'blue' },
  { value: 'tibio', label: 'Tibio', color: 'amber' },
  { value: 'caliente', label: 'Caliente', color: 'rose' },
  { value: 'ultra_caliente', label: 'Ultra Caliente', color: 'red' },
  { value: 'pausado', label: 'Pausado', color: 'gray' },
  { value: 'perdido', label: 'Perdido', color: 'red' },
  { value: 'derivado', label: 'Derivado a IA', color: 'orange' },
  { value: 'cerrado', label: 'Cerrado', color: 'emerald' },
] as const;

export type TemperaturaLead = typeof TEMPERATURAS_LEAD[number]['value'];

// ── ETAPAS DEL PROCESO ─────────────────────────────────────────────────────

export const ETAPAS_PROCESO = [
  { value: 'contacto_inicial', label: 'Contacto Inicial' },
  { value: 'indagacion', label: 'Indagación' },
  { value: 'props_enviadas', label: 'Propiedades Enviadas' },
  { value: 'visita_agendada', label: 'Visita Agendada' },
  { value: 'visita_realizada', label: 'Visita Realizada' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'cierre', label: 'Cierre' },
  { value: 'postventa', label: 'Postventa' },
] as const;

export type EtapaProceso = typeof ETAPAS_PROCESO[number]['value'];

// ── VENDEDORES ─────────────────────────────────────────────────────────────

export const VENDEDORES = [
  { value: 'america_cardozo', label: 'America Cardozo', iniciales: 'AC' },
  { value: 'alejandro_papotti', label: 'Alejandro Papotti', iniciales: 'AP' },
  { value: 'cristian', label: 'Cristian', iniciales: 'CR' },
  { value: 'juan_cruz', label: 'Juan Cruz', iniciales: 'JC' },
  { value: 'franco_zeballos', label: 'Franco Zeballos', iniciales: 'FZ' },
  { value: 'barbara_lazarte', label: 'Bárbara Lazarte', iniciales: 'BL' },
  { value: 'maximo_cardozo', label: 'Máximo Cardozo', iniciales: 'MC' },
  { value: 'moria_cardozo', label: 'Moria Cardozo', iniciales: 'MO' },
] as const;

export type Vendedor = typeof VENDEDORES[number]['value'];

// ── FUENTES DE LEAD ────────────────────────────────────────────────────────

export const FUENTES_LEAD = [
  { value: 'zonaprop', label: 'Zonaprop' },
  { value: 'argenprop', label: 'Argenprop' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'mercadolibre', label: 'MercadoLibre' },
  { value: 'referido', label: 'Referido' },
  { value: 'web', label: 'Sitio Web' },
  { value: 'otro', label: 'Otro' },
] as const;

export type FuenteLead = typeof FUENTES_LEAD[number]['value'];

// ── ROLES DEL SISTEMA ──────────────────────────────────────────────────────

export const ROLES_SISTEMA = [
  { value: 'admin', label: 'Administrador' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'developer', label: 'Developer' },
] as const;

export type RolSistema = typeof ROLES_SISTEMA[number]['value'];

// ── ESTADOS DE PROPIEDAD ───────────────────────────────────────────────────

export const ESTADOS_PROPIEDAD = [
  { value: 'activo', label: 'Activo', color: 'emerald' },
  { value: 'borrador', label: 'Borrador', color: 'gray' },
  { value: 'reservado', label: 'Reservado', color: 'amber' },
  { value: 'vendido', label: 'Vendido', color: 'red' },
  { value: 'alquilado', label: 'Alquilado', color: 'blue' },
] as const;

export type EstadoPropiedad = typeof ESTADOS_PROPIEDAD[number]['value'];

// ── ESTADOS DE VISITA ──────────────────────────────────────────────────────

export const ESTADOS_VISITA = [
  { value: 'pendiente', label: 'Pendiente', color: 'blue' },
  { value: 'confirmada', label: 'Confirmada', color: 'indigo' },
  { value: 'realizada', label: 'Realizada', color: 'emerald' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' },
] as const;

export type EstadoVisita = typeof ESTADOS_VISITA[number]['value'];

// ── CALIFICACIÓN DE VISITA ─────────────────────────────────────────────────

export const CALIFICACIONES_VISITA = [
  { value: 'muy_interesado', label: 'Muy Interesado' },
  { value: 'interesado', label: 'Interesado' },
  { value: 'dudoso', label: 'Dudoso' },
  { value: 'no_interesado', label: 'No Interesado' },
] as const;

export type CalificacionVisita = typeof CALIFICACIONES_VISITA[number]['value'];

// ── PRIORIDADES DE TAREA ───────────────────────────────────────────────────

export const PRIORIDADES_TAREA = [
  { value: 'urgente', label: 'Urgente', color: 'red' },
  { value: 'alta', label: 'Alta', color: 'orange' },
  { value: 'media', label: 'Media', color: 'yellow' },
  { value: 'baja', label: 'Baja', color: 'green' },
] as const;

export type PrioridadTarea = typeof PRIORIDADES_TAREA[number]['value'];

// ── ESTADOS DE TAREA ───────────────────────────────────────────────────────

export const ESTADOS_TAREA = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
] as const;

export type EstadoTarea = typeof ESTADOS_TAREA[number]['value'];

// ── CATEGORÍAS DE SOPORTE ──────────────────────────────────────────────────

export const CATEGORIAS_SOPORTE = [
  { value: 'error_tecnico', label: 'Error Técnico' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'mejora', label: 'Mejora' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'urgente', label: 'Urgente' },
] as const;

export type CategoriaSoporte = typeof CATEGORIAS_SOPORTE[number]['value'];

// ── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Obtiene el label de un valor en cualquier enum de taxonomía
 */
export function getLabel<T extends readonly { value: string; label: string }[]>(
  array: T,
  value: string
): string {
  return array.find(item => item.value === value)?.label || value;
}

/**
 * Obtiene el color de un valor en enums que tienen color
 */
export function getColor<T extends readonly { value: string; color: string }[]>(
  array: T,
  value: string
): string {
  return array.find(item => item.value === value)?.color || 'gray';
}

/**
 * Obtiene las iniciales de un vendedor
 */
export function getVendedorIniciales(value: string): string {
  return VENDEDORES.find(v => v.value === value)?.iniciales || '??';
}
