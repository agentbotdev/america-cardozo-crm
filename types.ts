
// Usuario / perfiles
export type UserRole = 'admin' | 'vendedor' | 'readonly';

export interface Profile {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  telefono?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id?: string;
  url: string;
  es_portada: boolean;
  es_plano?: boolean;
  orden: number;
  descripcion?: string;
  propiedad_id?: string | number;
  emprendimiento_id?: string;
}

// Propiedades
export type OperationType = 'venta' | 'alquiler' | 'temporario' | 'inversion';
export type PropertyType = 'casa' | 'departamento' | 'ph' | 'duplex' | 'local' | 'lote' | 'oficina' | 'cochera' | 'campo' | 'otro';
export type PropertyStatus = 'publicada' | 'captacion' | 'reservada' | 'vendida' | 'alquilada' | 'suspendida' | 'baja' | 'borrador';

export interface Property {
  id: string;
  titulo: string;
  tipo: PropertyType;
  tipo_operacion: OperationType;
  estado: PropertyStatus;
  disponibilidad?: string;
  fecha_alta_sistema: string;
  fecha_publicacion?: string;
  dias_en_market?: number;
  descripcion?: string;

  // Ubicación
  direccion_completa: string;
  calle: string;
  altura: number;
  barrio: string;
  zona: string;
  ciudad: string;
  provincia: string;
  pais: string;
  codigo_postal: string;
  coordenadas_lat?: number;
  coordenadas_lng?: number;
  link_google_maps?: string;
  tipo_calle?: string;

  // Características Físicas
  ambientes: number;
  dormitorios: number;
  banos_completos: number;
  toilettes: number;
  cochera: boolean;
  cantidad_cocheras: number;
  balcon: boolean;
  terraza: boolean;
  patio: boolean;
  jardin: boolean;
  quincho: boolean;
  parrilla: boolean;
  pileta: boolean;
  lavadero: boolean;
  baulera: boolean;

  // Superficies
  sup_total_lote?: number;
  sup_cubierta: number;
  sup_semicubierta?: number;
  sup_descubierta?: number;

  // Adicionales
  antiguedad?: number;
  estado_general?: string;
  orientacion?: string;
  luminosidad?: string;
  cantidad_plantas?: number;
  piso_edificio?: number;
  ascensor: boolean;
  calefaccion: boolean;
  aire_acondicionado: boolean;
  seguridad: boolean;
  apto_profesional: boolean;
  acepta_mascotas: boolean;

  // Amenities
  edificio_barrio_nombre?: string;
  sum: boolean;
  gimnasio: boolean;
  pileta_comun: boolean;
  seguridad_24hs: boolean;
  expensas_mensuales?: number;

  // Servicios
  agua: boolean;
  gas: boolean;
  cloacas: boolean;
  luz: boolean;
  internet: boolean;

  // Legal
  escritura: boolean;
  plano_aprobado: boolean;
  apto_credito: boolean;

  // Precios
  precio_venta?: number;
  precio_alquiler?: number;
  moneda: 'USD' | 'ARS';
  acepta_permuta: boolean;
  comision_inmobiliaria?: number;
  historial_precios?: any[];

  // Marketing
  publicada_mercadolibre: boolean;
  link_mercadolibre?: string;
  publicada_zonaprop: boolean;
  link_zonaprop?: string;
  publicada_argenprop: boolean;
  link_argenprop?: string;
  publicada_web_america: boolean;
  link_web_america?: string;
  fotos: Photo[];
  foto_portada: string;
  video?: boolean;
  link_video?: string;
  tour_360?: boolean;
  link_tour_360?: string;

  // Gestión
  tareas_pendientes?: string[];
  prioridad_tareas?: string;
  captador_id?: string;
  fecha_captacion?: string;
  propietario_nombre?: string;
  propietario_telefono?: string;

  // Analítica
  cantidad_consultas: number;
  vistas_totales: number;
  leads_generados: number;
  created_at: string;
  updated_at: string;
}

// Leads
export type ClientStatus = 'Frio' | 'Tibio' | 'Caliente' | 'En seguimiento' | 'Visita agendada' | 'Cerrado' | 'Perdido' | 'Pausado' | 'Derivado';
export type SalesStage = 'Inicio' | 'Indagación' | 'Bajada producto' | 'Seguimiento' | 'Pre-cierre' | 'Visita agendada' | 'Visita realizada' | 'Propuesta enviada' | 'Negociación' | 'Seña/Reserva' | 'Cierre' | 'Derivación humano' | 'Perdido' | 'Rechazado' | 'Pausado';

export interface Lead {
  id: string;
  nombre: string;
  apellido?: string;
  telefono: string;
  email?: string;
  whatsapp?: string;
  rango_etario?: string;
  ciudad_actual?: string;

  fuente_consulta: string;
  utm_campaign?: string;
  primer_mensaje?: string;

  busca_venta: boolean;
  busca_alquiler: boolean;
  busca_inversion: boolean;
  busca_temporario: boolean;

  // Preferencias de búsqueda
  venta_tipo_propiedad?: string[];
  venta_zonas_interes?: string[];
  venta_presupuesto_max?: number;
  alq_presupuesto_max?: number;

  estado_temperatura: ClientStatus;
  etapa_proceso: SalesStage;
  score: number;
  probabilidad_cierre?: number;
  prioridad?: string;

  // IA Insight
  intenciones_detectadas?: string[];
  sentimiento_general?: string;
  nivel_engagement?: string;
  recomendacion_ia?: string;

  // Relaciones
  propiedad_consulta_inicial_id?: string;
  propiedades_enviadas_ids?: string[];
  cantidad_visitas_agendadas: number;
  responsable_asignado_id?: string;

  notas_internas?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Clientes
export type ClientType = 'comprador' | 'inquilino' | 'propietario' | 'inversor';

export interface Client extends Lead {
  tipo_cliente: ClientType;
  estado_comercial: 'activo' | 'inactivo' | 'vip';
  wallink?: string;
  ultimo_contacto?: string;
  total_operaciones?: number;
  valor_lifetime?: number;
}

// Visitas
export type VisitStatus = 'agendada' | 'confirmada' | 'en_curso' | 'realizada' | 'cancelada' | 'reprogramada';
export type VisitPipelineStage = 'pendiente' | 'preparacion' | 'seguimiento' | 'finalizada';

export interface VisitTimeline {
  id: string;
  status: VisitStatus;
  timestamp: string;
  comment?: string;
}

export interface Visit {
  id: string;
  lead_id: string;
  lead_nombre: string;
  property_id: string;
  property_titulo: string;
  vendedor_id: string;
  fecha: string;
  hora: string;
  estado: VisitStatus;
  pipeline_stage: VisitPipelineStage;
  tipo_reunion: 'propiedad' | 'empresa';
  notas?: string;
  invitados?: string[];
  google_event_id?: string;
  timeline?: VisitTimeline[];
  created_at: string;
  updated_at: string;
}

// Auxiliares
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  timestamp: string;
  type?: 'text' | 'image' | 'audio';
}

export interface LeadHistory {
  id: string;
  type: 'stage_change' | 'note' | 'communication' | 'visit' | 'derivation' | 'ticket';
  stage?: string;
  date: string;
  title: string;
  description?: string;
  user_id?: string;
  user_name?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Error Técnico' | 'Facturación' | 'Consulta General';
  description: string;
  status: 'Abierto' | 'Cerrado' | 'En Proceso';
  created_at: string;
}

// Stats for dashboard
export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  visitsScheduled: number;
  dealsClosed: number;
  negotiationAmount: number;
  trend?: string;
  delay?: number;
}