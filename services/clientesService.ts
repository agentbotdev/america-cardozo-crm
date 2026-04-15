import { supabase } from './supabaseClient';
import { Lead } from '../types';

// ─────────────────────────────────────────────
// NOTA DE ARQUITECTURA:
// La tabla 'clientes' no existe en la DB.
// El módulo de Clientes es una vista semántica
// de 'leads'. Este servicio encapsula esa lógica.
// ─────────────────────────────────────────────

/** Normaliza una fila raw de la tabla leads al tipo Lead del frontend */
const normalizeLead = (l: any): Lead => ({
    ...l,
    id: String(l.id),
    estado_temperatura: l.estado_temperatura ?? l.temperatura,
    etapa_proceso: l.etapa_proceso ?? l.etapa,
    busca_venta: l.busca_venta ?? (l.tipo_operacion_buscada === 'venta'),
    busca_alquiler: l.busca_alquiler ?? (l.tipo_operacion_buscada === 'alquiler'),
    propiedades_enviadas_ids: l.propiedades_enviadas_ids ?? l.propiedades_recomendadas ?? [],
});

/** Campos UI que no existen en DB — se excluyen antes de cualquier INSERT/UPDATE */
const FRONTEND_ONLY_FIELDS: (keyof Lead)[] = [
    'estado_temperatura',
    'etapa_proceso',
    'busca_venta',
    'busca_alquiler',
    'propiedades_enviadas_ids',
];

/** Convierte un objeto Lead (frontend) al shape que espera la DB */
const toDbShape = (data: Partial<Lead>): Record<string, any> => {
    const {
        estado_temperatura,
        etapa_proceso,
        busca_venta,
        busca_alquiler,
        propiedades_enviadas_ids,
        ...rest
    } = data as any;

    return {
        ...rest,
        temperatura: estado_temperatura,
        etapa: etapa_proceso,
        tipo_operacion_buscada: busca_venta
            ? 'venta'
            : busca_alquiler
            ? 'alquiler'
            : undefined,
        propiedades_enviadas_ids: propiedades_enviadas_ids,
        updated_at: new Date().toISOString(),
    };
};

export const clientesService = {
    /**
     * Obtiene todos los clientes (leads) ordenados por fecha de creación.
     */
    async getClientes(): Promise<Lead[]> {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);

            if (error) {
                console.error('❌ clientesService.getClientes:', error);
                throw error;
            }

            return (data || []).map(normalizeLead);
        } catch (error) {
            console.error('❌ clientesService.getClientes error:', error);
            throw error;
        }
    },

    /**
     * Obtiene un cliente por ID único.
     */
    async getClienteById(id: string): Promise<Lead | null> {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                console.error('❌ clientesService.getClienteById:', error);
                throw error;
            }

            return data ? normalizeLead(data) : null;
        } catch (error) {
            console.error('❌ clientesService.getClienteById error:', error);
            throw error;
        }
    },

    /**
     * Busca clientes por texto en nombre, apellido, teléfono, email o whatsapp.
     */
    async searchClientes(query: string): Promise<Lead[]> {
        if (!query.trim()) return clientesService.getClientes();

        try {
            const term = query.trim();
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .or(
                    `nombre.ilike.%${term}%,` +
                    `apellido.ilike.%${term}%,` +
                    `email.ilike.%${term}%,` +
                    `telefono.ilike.%${term}%,` +
                    `whatsapp.ilike.%${term}%`
                )
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('❌ clientesService.searchClientes:', error);
                throw error;
            }

            return (data || []).map(normalizeLead);
        } catch (error) {
            console.error('❌ clientesService.searchClientes error:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo cliente (inserta en leads).
     * Retorna el registro creado con su ID asignado por la DB.
     */
    async createCliente(data: Partial<Lead>): Promise<Lead | null> {
        try {
            const dbData = {
                ...toDbShape(data),
                created_at: new Date().toISOString(),
            };

            const { data: created, error } = await supabase
                .from('leads')
                .insert([dbData])
                .select()
                .single();

            if (error) {
                console.error('❌ clientesService.createCliente:', error);
                throw error;
            }

            return created ? normalizeLead(created) : null;
        } catch (error) {
            console.error('❌ clientesService.createCliente error:', error);
            throw error;
        }
    },

    /**
     * Actualiza un cliente existente.
     * Retorna el registro actualizado.
     */
    async updateCliente(id: string, data: Partial<Lead>): Promise<Lead | null> {
        try {
            const { data: updated, error } = await supabase
                .from('leads')
                .update(toDbShape(data))
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('❌ clientesService.updateCliente:', error);
                throw error;
            }

            return updated ? normalizeLead(updated) : null;
        } catch (error) {
            console.error('❌ clientesService.updateCliente error:', error);
            throw error;
        }
    },

    /**
     * Elimina un cliente por ID.
     * Retorna true si se eliminó correctamente.
     */
    async deleteCliente(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('❌ clientesService.deleteCliente:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('❌ clientesService.deleteCliente error:', error);
            return false;
        }
    },

    /**
     * Estadísticas de clientes para el Dashboard.
     * - total: todos los leads
     * - nuevosEsteMes: leads creados desde el inicio del mes actual
     */
    async getClientesStats(): Promise<{ total: number; nuevosEsteMes: number }> {
        try {
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            const [totalResult, mesResult] = await Promise.all([
                supabase
                    .from('leads')
                    .select('id', { count: 'exact', head: true }),
                supabase
                    .from('leads')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', inicioMes.toISOString()),
            ]);

            if (totalResult.error) {
                console.error('❌ clientesService.getClientesStats (total):', totalResult.error);
            }
            if (mesResult.error) {
                console.error('❌ clientesService.getClientesStats (mes):', mesResult.error);
            }

            return {
                total: totalResult.count ?? 0,
                nuevosEsteMes: mesResult.count ?? 0,
            };
        } catch (error) {
            console.error('❌ clientesService.getClientesStats error:', error);
            return { total: 0, nuevosEsteMes: 0 };
        }
    },
};
