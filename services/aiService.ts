import { Property } from '../types';
import { supabase } from './supabaseClient';

/**
 * AI Service for the entire CRM
 * Secure version: All calls are proxied through Supabase Edge Functions 
 * to protect API keys (BUG-001 fixed).
 */

export const aiService = {
  /**
   * Search properties using natural language
   */
  async searchProperties(query: string, properties: Property[]): Promise<{ properties: Property[]; explanation: string }> {
    try {
      const prompt = `Eres un asistente experto inmobiliario. Analiza: "${query}". 
      Extrae los criterios de búsqueda (Tipo de propiedad, Operación, Precio Máx, Ambientes, Zona) 
      y responde solo con un JSON con los campos: { tipo: Array, operacion: string, precioMax: number, ambientesMin: number, zona: Array, explanation: string }.`;

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('ai-handler', {
        body: { prompt }
      });

      if (error || !data) throw new Error('Error al llamar al servicio de IA');

      const text = data.candidates[0].content.parts[0].text;
      const criteria = JSON.parse(text.match(/\{.*\}/s)[0]);

      let filtered = properties;
      if (criteria.tipo?.length) filtered = filtered.filter(p => criteria.tipo.some((t: string) => p.tipo.toLowerCase().includes(t.toLowerCase())));
      if (criteria.operacion) filtered = filtered.filter(p => p.tipo_operacion.toLowerCase() === criteria.operacion.toLowerCase());
      if (criteria.precioMax) filtered = filtered.filter(p => (p.precio_venta || p.precio_alquiler) <= criteria.precioMax);
      if (criteria.ambientesMin) filtered = filtered.filter(p => p.ambientes >= criteria.ambientesMin);
      if (criteria.zona?.length) filtered = filtered.filter(p => criteria.zona.some((z: string) => p.barrio.toLowerCase().includes(z.toLowerCase()) || p.ciudad.toLowerCase().includes(z.toLowerCase())));

      return { properties: filtered, explanation: criteria.explanation };
    } catch (e) {
      console.error('Error in AI Search:', e);
      return { properties: [], explanation: 'Lo siento, no pude procesar tu búsqueda ahora.' };
    }
  },

  /**
   * Improve text content (Titles, Descriptions)
   */
  async enhanceText(original: string, context: Partial<Property>, type: 'title' | 'description'): Promise<string> {
    const isTitle = type === 'title';
    const prompt = `Como experto inmobiliario, mejora el siguiente ${isTitle ? 'título' : 'párrafo descriptivo'}:
    "${original}"
    Información de la propiedad: ${JSON.stringify(context)}
    Meta: Que sea ${isTitle ? 'corto y impactante (80 chars)' : 'persuasivo y profesional'}. 
    Responde solo con el texto mejorado.`;

    try {
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('ai-handler', {
        body: { prompt }
      });

      if (error || !data) throw new Error('Error en IA');

      return data.candidates[0].content.parts[0].text.trim();
    } catch (e) {
      console.error(`Error in AI Enhance ${type}:`, e);
      return original;
    }
  }
};
