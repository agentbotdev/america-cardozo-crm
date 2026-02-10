/**
 * OpenAI Service for AI-powered features
 * Uses GPT-3.5 Turbo for cost-effective text generation
 */

import { Property } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo'; // Using GPT-3.5 Turbo - reliable and cost-effective

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

async function callOpenAI(messages: OpenAIMessage[], temperature: number = 0.7): Promise<string> {
    // Validate API key
    if (!OPENAI_API_KEY) {
        console.error('❌ VITE_OPENAI_API_KEY not configured');
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    console.log('🤖 Calling OpenAI API with model:', MODEL);

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ OpenAI API Error Response:', error);

            // Handle specific error cases
            if (error.error?.code === 'model_not_found') {
                throw new Error(`El modelo ${MODEL} no está disponible. Por favor contacta al administrador.`);
            }

            throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('✅ OpenAI Response received');

        const content = data.choices[0]?.message?.content || '';

        if (!content) {
            throw new Error('OpenAI returned empty response');
        }

        return content;
    } catch (error: any) {
        console.error('❌ Error calling OpenAI:', error);

        // Provide user-friendly error messages
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
        // Step 1: Extract search criteria using AI
        const systemPrompt = `Eres un asistente de búsqueda de propiedades inmobiliarias. 
Analiza la consulta del usuario y extrae los criterios de búsqueda en formato JSON.
Responde SOLO con un objeto JSON válido, sin texto adicional.

Formato esperado:
{
  "tipo": "casa|departamento|ph|lote|oficina|null",
  "operacion": "venta|alquiler|null",
  "precioMin": number|null,
  "precioMax": number|null,
  "dormitorios": number|null,
  "banos": number|null,
  "ubicacion": "string|null",
  "amenidades": ["cochera", "pileta", "balcon", etc]
}`;

        const criteriaResponse = await callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
        ], 0.3);

        // Parse criteria
        let criteria: any;
        try {
            criteria = JSON.parse(criteriaResponse);
        } catch (e) {
            criteria = {};
        }

        // Step 2: Filter properties based on extracted criteria
        let filtered = [...allProperties];

        if (criteria.tipo) {
            filtered = filtered.filter(p => p.tipo?.toLowerCase() === criteria.tipo.toLowerCase());
        }

        if (criteria.operacion) {
            filtered = filtered.filter(p => p.tipo_operacion?.toLowerCase() === criteria.operacion.toLowerCase());
        }

        if (criteria.precioMax) {
            filtered = filtered.filter(p => {
                const precio = p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler;
                return precio ? precio <= criteria.precioMax : false;
            });
        }

        if (criteria.precioMin) {
            filtered = filtered.filter(p => {
                const precio = p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler;
                return precio ? precio >= criteria.precioMin : false;
            });
        }

        if (criteria.dormitorios) {
            filtered = filtered.filter(p => p.dormitorios >= criteria.dormitorios);
        }

        if (criteria.banos) {
            filtered = filtered.filter(p => (p.banos_completos || 0) >= criteria.banos);
        }

        if (criteria.ubicacion) {
            const ubicacionLower = criteria.ubicacion.toLowerCase();
            filtered = filtered.filter(p =>
                p.barrio?.toLowerCase().includes(ubicacionLower) ||
                p.ciudad?.toLowerCase().includes(ubicacionLower) ||
                p.direccion_completa?.toLowerCase().includes(ubicacionLower)
            );
        }

        if (criteria.amenidades && Array.isArray(criteria.amenidades)) {
            filtered = filtered.filter(p => {
                return criteria.amenidades.some((amenidad: string) => {
                    const amenidadKey = amenidad.toLowerCase().replace(/ /g, '_');
                    return (p as any)[amenidadKey] === true;
                });
            });
        }

        // Step 3: Generate explanation
        const explanationPrompt = `El usuario buscó: "${userQuery}"
Se encontraron ${filtered.length} propiedades.
Escribe una breve explicación natural de los resultados (máximo 2 líneas).`;

        const explanation = await callOpenAI([
            { role: 'system', content: 'Eres un asistente inmobiliario amigable. Responde de forma concisa y natural.' },
            { role: 'user', content: explanationPrompt }
        ], 0.7);

        return {
            properties: filtered,
            explanation: explanation.trim()
        };

    } catch (error) {
        console.error('Error in chatbot search:', error);
        return {
            properties: allProperties,
            explanation: 'Hubo un error al procesar tu búsqueda. Mostrando todas las propiedades disponibles.'
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

        const userPrompt = `Título actual: "${currentTitle}"

Detalles de la propiedad:
- Tipo: ${property.tipo || 'N/A'}
- Operación: ${property.tipo_operacion || 'N/A'}
- Dormitorios: ${property.dormitorios || 'N/A'}
- Baños: ${property.banos_completos || 'N/A'}
- Ubicación: ${property.barrio || property.ciudad || 'N/A'}
- Superficie: ${property.sup_cubierta || 'N/A'}m²`;

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
- Superficie total: ${property.sup_total || 'N/A'}m²
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
