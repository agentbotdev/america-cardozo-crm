/**
 * Servicio para integración con Gemini AI
 * - Búsqueda de propiedades por lenguaje natural
 * - Mejora de textos (títulos, descripciones)
 */

import { Property } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDiSZ_h8h7hCtOqM_mLHLEKhLyxySE5Xrk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

interface PropertySearchCriteria {
    tipo?: string[];
    tipo_operacion?: 'venta' | 'alquiler';
    precio_min?: number;
    precio_max?: number;
    ambientes_min?: number;
    dormitorios_min?: number;
    zona?: string[];
    ciudad?: string[];
    amenities?: string[];
}

/**
 * Búsqueda de propiedades usando lenguaje natural
 */
export async function searchPropertiesByChatbot(
    userQuery: string,
    allProperties: Property[]
): Promise<{ properties: Property[]; explanation: string }> {
    try {
        // 1. Convertir el query del usuario a criterios de búsqueda usando Gemini
        const criteriaPrompt = `
Eres un asistente que extrae criterios de búsqueda de propiedades inmobiliarias desde consultas en lenguaje natural.

Consulta del usuario: "${userQuery}"

Lista de propiedades disponibles (solo para contexto):
${allProperties.slice(0, 5).map(p => `- ${p.titulo}: ${p.tipo}, ${p.tipo_operacion}, ${p.barrio}, ${p.ciudad}, ${p.moneda} ${p.tipo_operacion === 'venta' ? p.precio_venta : p.precio_alquiler}`).join('\n')}

Extrae los criterios de búsqueda y devuelve SOLO un objeto JSON válido con esta estructura:
{
  "tipo": ["casa", "departamento", "ph", etc],
  "tipo_operacion": "venta" o "alquiler",
  "precio_min": número o null,
  "precio_max": número o null,
  "ambientes_min": número o null,
  "dormitorios_min": número o null,
  "zona": ["Recoleta", "Palermo", etc],
  "ciudad": ["CABA", "Tigre", etc],
  "amenities": ["pileta", "cochera", "balcon", etc],
  "explanation": "breve explicación de lo que buscaste"
}

Responde ÚNICAMENTE con el JSON, sin texto adicional.`;

        const criteriaResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: criteriaPrompt }]
                }]
            })
        });

        if (!criteriaResponse.ok) {
            throw new Error('Error al consultar Gemini API');
        }

        const criteriaData: GeminiResponse = await criteriaResponse.json();
        const criteriaText = criteriaData.candidates[0]?.content?.parts[0]?.text || '{}';

        // Limpiar el texto para extraer solo el JSON
        const jsonMatch = criteriaText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo extraer criterios válidos');
        }

        const criteria: PropertySearchCriteria & { explanation: string } = JSON.parse(jsonMatch[0]);

        // 2. Filtrar propiedades basado en los criterios extraídos
        const filteredProperties = allProperties.filter(property => {
            // Filtro por tipo
            if (criteria.tipo && criteria.tipo.length > 0) {
                if (!criteria.tipo.includes(property.tipo)) return false;
            }

            // Filtro por tipo de operación
            if (criteria.tipo_operacion) {
                if (property.tipo_operacion !== criteria.tipo_operacion) return false;
            }

            // Filtro por precio
            const precio = property.tipo_operacion === 'venta' ? property.precio_venta : property.precio_alquiler;
            if (criteria.precio_min && precio && precio < criteria.precio_min) return false;
            if (criteria.precio_max && precio && precio > criteria.precio_max) return false;

            // Filtro por ambientes
            if (criteria.ambientes_min && property.ambientes && property.ambientes < criteria.ambientes_min) return false;

            // Filtro por dormitorios
            if (criteria.dormitorios_min && property.dormitorios && property.dormitorios < criteria.dormitorios_min) return false;

            // Filtro por zona/ciudad
            if (criteria.zona && criteria.zona.length > 0) {
                const zonaMatch = criteria.zona.some(z =>
                    property.barrio?.toLowerCase().includes(z.toLowerCase()) ||
                    property.zona?.toLowerCase().includes(z.toLowerCase())
                );
                if (!zonaMatch) return false;
            }

            if (criteria.ciudad && criteria.ciudad.length > 0) {
                const ciudadMatch = criteria.ciudad.some(c =>
                    property.ciudad?.toLowerCase().includes(c.toLowerCase())
                );
                if (!ciudadMatch) return false;
            }

            // Filtro por amenities
            if (criteria.amenities && criteria.amenities.length > 0) {
                const hasAmenities = criteria.amenities.every(amenity => {
                    const normalizedAmenity = amenity.toLowerCase();

                    if (normalizedAmenity.includes('pileta')) return property.pileta || property.pileta_comun;
                    if (normalizedAmenity.includes('cochera')) return property.cochera;
                    if (normalizedAmenity.includes('balcon')) return property.balcon;
                    if (normalizedAmenity.includes('terraza')) return property.terraza;
                    if (normalizedAmenity.includes('jardin')) return property.jardin;
                    if (normalizedAmenity.includes('quincho')) return property.quincho;
                    if (normalizedAmenity.includes('sum')) return property.sum;
                    if (normalizedAmenity.includes('gimnasio')) return property.gimnasio;
                    if (normalizedAmenity.includes('seguridad')) return property.seguridad_24hs;
                    if (normalizedAmenity.includes('aire')) return property.aire_acondicionado;
                    if (normalizedAmenity.includes('calefaccion')) return property.calefaccion;

                    return true;
                });
                if (!hasAmenities) return false;
            }

            return true;
        });

        return {
            properties: filteredProperties,
            explanation: criteria.explanation || 'Propiedades encontradas según tu búsqueda'
        };
    } catch (error) {
        console.error('Error en búsqueda por chatbot:', error);
        return {
            properties: [],
            explanation: 'No se pudieron procesar los criterios de búsqueda. Intenta ser más específico.'
        };
    }
}

/**
 * Mejorar título de propiedad con IA
 */
export async function enhancePropertyTitle(currentTitle: string, property: Partial<Property>): Promise<string> {
    try {
        const prompt = `
Eres un experto en marketing inmobiliario. Mejora el siguiente título de propiedad para que sea más atractivo, profesional y efectivo.

Título actual: "${currentTitle}"

Información de la propiedad:
- Tipo: ${property.tipo}
- Operación: ${property.tipo_operacion}
- Ubicación: ${property.barrio}, ${property.ciudad}
- Ambientes: ${property.ambientes}
- Dormitorios: ${property.dormitorios}
- Superficie: ${property.sup_cubierta} m²
- Características destacadas: ${[
                property.pileta && 'Pileta',
                property.cochera && 'Cochera',
                property.balcon && 'Balcón',
                property.terraza && 'Terraza',
                property.jardin && 'Jardín'
            ].filter(Boolean).join(', ')}

Crea un título que:
1. Sea conciso (máximo 70 caracteres)
2. Incluya la característica más destacable
3. Use palabras clave que generen interés
4. Sea profesional pero atractivo
5. No use mayúsculas innecesarias

Responde SOLO con el título mejorado, sin explicaciones adicionales.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) throw new Error('Error al mejorar título');

        const data: GeminiResponse = await response.json();
        const enhancedTitle = data.candidates[0]?.content?.parts[0]?.text.trim() || currentTitle;

        // Limpiar comillas si las hay
        return enhancedTitle.replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('Error mejorando título:', error);
        return currentTitle;
    }
}

/**
 * Mejorar descripción de propiedad con IA
 */
export async function enhancePropertyDescription(currentDescription: string, property: Partial<Property>): Promise<string> {
    try {
        const prompt = `
Eres un experto en copywriting inmobiliario. Mejora la siguiente descripción de propiedad.

Descripción actual: "${currentDescription || 'Sin descripción'}"

Información de la propiedad:
- Tipo: ${property.tipo}
- Operación: ${property.tipo_operacion}
- Ubicación: ${property.direccion_completa}
- Barrio: ${property.barrio}
- Ciudad: ${property.ciudad}
- Ambientes: ${property.ambientes}
- Dormitorios: ${property.dormitorios}
- Baños: ${property.banos_completos}
- Superficie cubierta: ${property.sup_cubierta} m²
- Superficie total: ${property.sup_total_lote} m²
- Cocheras: ${property.cantidad_cocheras}

Amenities y características:
${[
                property.pileta && '✓ Pileta',
                property.cochera && '✓ Cochera',
                property.balcon && '✓ Balcón',
                property.terraza && '✓ Terraza',
                property.jardin && '✓ Jardín',
                property.quincho && '✓ Quincho',
                property.sum && '✓ SUM',
                property.gimnasio && '✓ Gimnasio',
                property.seguridad_24hs && '✓ Seguridad 24hs',
                property.apto_credito && '✓ Apto crédito',
                property.acepta_mascotas && '✓ Acepta mascotas'
            ].filter(Boolean).join('\n')}

Crea una descripción que:
1. Sea entre 150-300 palabras
2. Destaque las características más importantes al principio
3. Use lenguaje profesional pero cálido
4. Incluya la ubicación estratégica si es relevante
5. Genere emoción y deseo de conocer la propiedad
6. Termine con un call-to-action sutil

Responde SOLO con la descripción mejorada, sin títulos ni explicaciones adicionales.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) throw new Error('Error al mejorar descripción');

        const data: GeminiResponse = await response.json();
        const enhancedDescription = data.candidates[0]?.content?.parts[0]?.text.trim() || currentDescription;

        return enhancedDescription;
    } catch (error) {
        console.error('Error mejorando descripción:', error);
        return currentDescription || '';
    }
}

export const geminiService = {
    searchPropertiesByChatbot,
    enhancePropertyTitle,
    enhancePropertyDescription
};
