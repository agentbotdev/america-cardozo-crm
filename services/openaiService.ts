/**
 * OpenAI Service for AI-powered features
 * Uses GPT-3.5 Turbo for cost-effective text generation
 */

import { Property } from '../types';
import { supabase } from './supabaseClient';

const MODEL = 'gpt-3.5-turbo';

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

async function callOpenAI(messages: OpenAIMessage[], temperature: number = 0.7): Promise<string> {
    console.log('🤖 Calling OpenAI API via Edge Function with model:', MODEL);

    try {
        const { data, error } = await supabase.functions.invoke('openai-chat', {
            body: { messages, temperature }
        });

        if (error) {
            console.error('❌ OpenAI Edge Function Error:', error);
            throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
        }

        console.log('✅ OpenAI Response received');

        const content = data.choices && data.choices[0]?.message?.content || '';

        if (!content) {
            throw new Error('OpenAI returned empty response');
        }

        return content;
    } catch (error: any) {
        console.error('❌ Error calling OpenAI:', error);
        
        if (error.message?.includes('Failed to fetch')) {
            throw new Error('No se pudo conectar con el servidor de IA. Verifica tu conexión a internet.');
        }

        throw error;
    }
}

/**
 * Search properties using natural language chatbot
 */
export async function searchPropertiesByChatbot(
    userQuery: string,
    allProperties: Property[]
): Promise<{ properties: Property[]; explanation: string }> {
    try {
        console.log('🔍 Starting property search for:', userQuery);

        // Step 1: Extract search criteria using AI with improved prompt
        const systemPrompt = `Eres un asistente de búsqueda de propiedades inmobiliarias en Argentina.
Analiza la consulta del usuario y extrae SOLO los criterios de búsqueda relevantes.
Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones, sin texto adicional.

IMPORTANTE: 
- Para tipo usa: "casa", "departamento", "ph", "terreno", "local", "oficina"
- Para operacion usa: "venta", "alquiler"  
- Los precios siempre son en USD
- Si no mencionan algo, usa null

Formato EXACTO de respuesta:
{
  "tipo": "casa" o "departamento" o "ph" o "terreno" o "local" o "oficina" o null,
  "operacion": "venta" o "alquiler" o null,
  "precioMin": numero o null,
  "precioMax": numero o null,
  "dormitorios": numero o null,
  "banos": numero o null,
  "ubicacion": "texto" o null,
  "amenidades": ["cochera", "pileta", "balcon"] o []
}

Ejemplos:
Usuario: "Busco casa con pileta hasta 500k"
Respuesta: {"tipo":"casa","operacion":null,"precioMin":null,"precioMax":500000,"dormitorios":null,"banos":null,"ubicacion":null,"amenidades":["pileta"]}

Usuario: "Departamento 2 ambientes en Palermo"
Respuesta: {"tipo":"departamento","operacion":null,"precioMin":null,"precioMax":null,"dormitorios":2,"banos":null,"ubicacion":"Palermo","amenidades":[]}`;

        const criteriaResponse = await callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
        ], 0.2);

        console.log('🤖 AI Response:', criteriaResponse);

        // Parse criteria with better error handling
        let criteria: any = {};
        try {
            // Remove any markdown code blocks if present
            let cleanResponse = criteriaResponse.trim();
            cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            cleanResponse = cleanResponse.trim();

            criteria = JSON.parse(cleanResponse);
            console.log('✅ Parsed criteria:', criteria);
        } catch (e) {
            console.error('❌ JSON Parse Error:', e);
            console.log('Trying to extract JSON from response...');

            // Try to extract JSON object from the response
            const jsonMatch = criteriaResponse.match(/\{[^{}]*\}/);
            if (jsonMatch) {
                try {
                    criteria = JSON.parse(jsonMatch[0]);
                    console.log('✅ Extracted criteria:', criteria);
                } catch (e2) {
                    console.error('❌ Could not extract valid JSON');
                    criteria = {};
                }
            }
        }

        // Step 2: Filter properties based on extracted criteria
        let filtered = [...allProperties];
        let appliedFilters: string[] = [];

        if (criteria.tipo) {
            filtered = filtered.filter(p => p.tipo?.toLowerCase() === criteria.tipo.toLowerCase());
            appliedFilters.push(`tipo: ${criteria.tipo}`);
        }

        if (criteria.operacion) {
            filtered = filtered.filter(p => p.tipo_operacion?.toLowerCase() === criteria.operacion.toLowerCase());
            appliedFilters.push(`operación: ${criteria.operacion}`);
        }

        if (criteria.precioMax) {
            filtered = filtered.filter(p => {
                const precio = p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler;
                return precio ? precio <= criteria.precioMax : false;
            });
            appliedFilters.push(`precio máximo: USD ${criteria.precioMax.toLocaleString()}`);
        }

        if (criteria.precioMin) {
            filtered = filtered.filter(p => {
                const precio = p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler;
                return precio ? precio >= criteria.precioMin : false;
            });
            appliedFilters.push(`precio mínimo: USD ${criteria.precioMin.toLocaleString()}`);
        }

        if (criteria.dormitorios) {
            filtered = filtered.filter(p => p.dormitorios && p.dormitorios >= criteria.dormitorios);
            appliedFilters.push(`${criteria.dormitorios}+ dormitorios`);
        }

        if (criteria.banos) {
            filtered = filtered.filter(p => (p.banos_completos || 0) >= criteria.banos);
            appliedFilters.push(`${criteria.banos}+ baños`);
        }

        if (criteria.ubicacion) {
            const ubicacionLower = criteria.ubicacion.toLowerCase();
            filtered = filtered.filter(p =>
                p.barrio?.toLowerCase().includes(ubicacionLower) ||
                p.ciudad?.toLowerCase().includes(ubicacionLower) ||
                p.direccion_completa?.toLowerCase().includes(ubicacionLower)
            );
            appliedFilters.push(`ubicación: ${criteria.ubicacion}`);
        }

        if (criteria.amenidades && Array.isArray(criteria.amenidades) && criteria.amenidades.length > 0) {
            filtered = filtered.filter(p => {
                return criteria.amenidades.some((amenidad: string) => {
                    const amenidadKey = amenidad.toLowerCase().replace(/ /g, '_');
                    return (p as any)[amenidadKey] === true;
                });
            });
            appliedFilters.push(`amenidades: ${criteria.amenidades.join(', ')}`);
        }

        console.log('📊 Filters applied:', appliedFilters);
        console.log('📋 Results:', filtered.length, 'properties found');

        // Step 3: Generate simple explanation
        let explanation = `Encontré ${filtered.length} ${filtered.length === 1 ? 'propiedad' : 'propiedades'}`;

        if (appliedFilters.length > 0) {
            explanation += ` con: ${appliedFilters.join(', ')}`;
        } else {
            explanation += '. Mostrando todas las propiedades disponibles.';
        }

        return {
            properties: filtered,
            explanation
        };

    } catch (error: any) {
        console.error('❌ Error in chatbot search:', error);
        return {
            properties: allProperties,
            explanation: `Hubo un error al procesar tu búsqueda: ${error.message}. Mostrando todas las propiedades.`
        };
    }
}

/**
 * Enhance property title using AI
 */
export async function enhancePropertyTitle(
    currentTitle: string,
    property: Partial<Property>
): Promise<string> {
    try {
        const systemPrompt = `Eres un experto en marketing inmobiliario. 
Mejora el título de la propiedad para hacerlo más atractivo y persuasivo.
Requisitos:
- Máximo 80 caracteres
- Incluye características clave
- Usa lenguaje vendedor pero profesional
- NO uses emojis
- Responde SOLO con el título mejorado, sin comillas ni texto adicional`;

        // Generate prompt with context
        const userPrompt = `Título actual: "${currentTitle}"
Características:
- Tipo: ${property.tipo}
- Operación: ${property.tipo_operacion}
- Ambientes: ${property.ambientes}
- Superficie: ${property.sup_cubierta || property.sup_total_lote} m2
- Barrio: ${property.barrio}
- Precio: ${property.moneda} ${property.tipo_operacion === 'venta' ? property.precio_venta : property.precio_alquiler}

Mejora el título ahora:`;

        const enhanced = await callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 0.8);

        return enhanced.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('Error enhancing title:', error);
        throw new Error('No se pudo mejorar el título. Intenta de nuevo.');
    }
}

/**
 * Enhance property description using AI
 */
export async function enhancePropertyDescription(
    currentDescription: string,
    property: Partial<Property>
): Promise<string> {
    try {
        const systemPrompt = `Eres un experto en copywriting inmobiliario.
Mejora la descripción de la propiedad:
- Hazla más atractiva y detallada
- Destaca características únicas
- Usa lenguaje persuasivo pero profesional
- Máximo 300 palabras
- NO uses emojis
- Estructura clara con párrafos cortos
- Responde SOLO con la descripción mejorada`;

        const amenidades = [];
        if (property.cochera) amenidades.push('cochera');
        if (property.balcon) amenidades.push('balcón');
        if (property.terraza) amenidades.push('terraza');
        if (property.patio) amenidades.push('patio');
        if (property.pileta) amenidades.push('pileta');
        if (property.parrilla) amenidades.push('parrilla');
        if (property.seguridad_24hs) amenidades.push('seguridad 24hs');

        const userPrompt = `Descripción actual: "${currentDescription}"

Detalles de la propiedad:
- Tipo: ${property.tipo || 'N/A'}
- Operación: ${property.tipo_operacion || 'N/A'}
- Dormitorios: ${property.dormitorios || 'N/A'}
- Baños: ${property.banos_completos || 'N/A'}
- Ubicación: ${property.barrio || property.ciudad || 'N/A'}
- Superficie cubierta: ${property.sup_cubierta || 'N/A'}m²
- Superficie total lote/terreno: ${property.sup_total_lote || 'N/A'}m²
- Amenidades: ${amenidades.length > 0 ? amenidades.join(', ') : 'N/A'}`;

        const enhanced = await callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 0.8);

        return enhanced.trim();
    } catch (error) {
        console.error('Error enhancing description:', error);
        throw new Error('No se pudo mejorar la descripción. Intenta de nuevo.');
    }
}

export const openaiService = {
    searchPropertiesByChatbot,
    enhancePropertyTitle,
    enhancePropertyDescription
};
