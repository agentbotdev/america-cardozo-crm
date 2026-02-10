/**
 * Componente de Búsqueda Inteligente de Propiedades
 * - Modo Chatbot: Búsqueda por lenguaje natural
 * - Modo Filtros: Búsqueda avanzada por características
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Bot, Sliders, Send, Sparkles, X,
    Home, DollarSign, MapPin, Bed, Bath, Car,
    Loader2
} from 'lucide-react';
import { Property } from '../types';
import { geminiService } from '../services/geminiService';

interface PropertySearchProps {
    isOpen: boolean;
    onClose: () => void;
    properties: Property[];
    onResults: (results: Property[], explanation?: string) => void;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
    isOpen,
    onClose,
    properties,
    onResults
}) => {
    const [searchMode, setSearchMode] = useState<'chatbot' | 'filters'>('chatbot');
    const [chatQuery, setChatQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant'; text: string }>>([]);

    // Estado para filtros avanzados
    const [filters, setFilters] = useState({
        tipo: [] as string[],
        tipo_operacion: '' as 'venta' | 'alquiler' | '',
        precio_min: '',
        precio_max: '',
        ambientes_min: '',
        dormitorios_min: '',
        banos_min: '',
        zona: '',
        ciudad: '',
        cochera: false,
        pileta: false,
        balcon: false,
        seguridad: false
    });

    // Búsqueda por Chatbot
    const handleChatbotSearch = async () => {
        if (!chatQuery.trim() || isSearching) return;

        setIsSearching(true);
        setChatHistory(prev => [...prev, { type: 'user', text: chatQuery }]);

        try {
            const { properties: results, explanation } = await geminiService.searchPropertiesByChatbot(
                chatQuery,
                properties
            );

            setChatHistory(prev => [...prev, {
                type: 'assistant',
                text: `${explanation}\n\nEncontré ${results.length} propiedades que coinciden con tu búsqueda.`
            }]);

            onResults(results, explanation);
            setChatQuery('');
        } catch (error) {
            setChatHistory(prev => [...prev, {
                type: 'assistant',
                text: 'Lo siento, hubo un error al procesar tu búsqueda. Intenta de nuevo.'
            }]);
        } finally {
            setIsSearching(false);
        }
    };

    // Búsqueda por Filtros
    const handleFilterSearch = () => {
        const filteredProperties = properties.filter(property => {
            // Filtro por tipo
            if (filters.tipo.length > 0 && !filters.tipo.includes(property.tipo)) {
                return false;
            }

            // Filtro por tipo de operación
            if (filters.tipo_operacion && property.tipo_operacion !== filters.tipo_operacion) {
                return false;
            }

            // Filtro por precio
            const precio = property.tipo_operacion === 'venta' ? property.precio_venta : property.precio_alquiler;
            if (filters.precio_min && precio && precio < Number(filters.precio_min)) return false;
            if (filters.precio_max && precio && precio > Number(filters.precio_max)) return false;

            // Filtro por ambientes
            if (filters.ambientes_min && property.ambientes && property.ambientes < Number(filters.ambientes_min)) {
                return false;
            }

            // Filtro por dormitorios
            if (filters.dormitorios_min && property.dormitorios && property.dormitorios < Number(filters.dormitorios_min)) {
                return false;
            }

            // Filtro por baños
            if (filters.banos_min && property.banos_completos && property.banos_completos < Number(filters.banos_min)) {
                return false;
            }

            // Filtro por zona
            if (filters.zona && property.barrio && !property.barrio.toLowerCase().includes(filters.zona.toLowerCase())) {
                return false;
            }

            // Filtro por ciudad
            if (filters.ciudad && property.ciudad && !property.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())) {
                return false;
            }

            // Filtros booleanos
            if (filters.cochera && !property.cochera) return false;
            if (filters.pileta && !property.pileta && !property.pileta_comun) return false;
            if (filters.balcon && !property.balcon) return false;
            if (filters.seguridad && !property.seguridad_24hs) return false;

            return true;
        });

        onResults(filteredProperties, `Encontré ${filteredProperties.length} propiedades que coinciden con tus filtros`);
    };

    const toggleTipo = (tipo: string) => {
        setFilters(prev => ({
            ...prev,
            tipo: prev.tipo.includes(tipo)
                ? prev.tipo.filter(t => t !== tipo)
                : [...prev.tipo, tipo]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Buscador Inteligente
                        </h2>
                        <p className="text-sm text-slate-500 font-bold">Encuentra la propiedad perfecta para tu cliente</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white rounded-2xl transition-all"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex gap-4">
                    <button
                        onClick={() => setSearchMode('chatbot')}
                        className={`flex-1 p-4 md:p-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${searchMode === 'chatbot'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl'
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                    >
                        <Bot size={20} />
                        <span className="hidden sm:inline">Chatbot IA</span>
                        <span className="sm:hidden">IA</span>
                    </button>
                    <button
                        onClick={() => setSearchMode('filters')}
                        className={`flex-1 p-4 md:p-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${searchMode === 'filters'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl'
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                    >
                        <Sliders size={20} />
                        <span className="hidden sm:inline">Filtros</span>
                        <span className="sm:hidden">Filtros</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {searchMode === 'chatbot' ? (
                            <motion.div
                                key="chatbot"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {/* Chat History */}
                                {chatHistory.length > 0 && (
                                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                                        {chatHistory.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] p-4 rounded-2xl ${msg.type === 'user'
                                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                                            : 'bg-slate-100 text-slate-900 rounded-tl-none'
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium whitespace-pre-line">{msg.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Chat Input */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl border-2 border-indigo-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                            <Sparkles size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Asistente IA</p>
                                            <p className="text-xs text-slate-500 font-bold">Búsqueda por lenguaje natural</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <textarea
                                            value={chatQuery}
                                            onChange={(e) => setChatQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleChatbotSearch();
                                                }
                                            }}
                                            placeholder="Ej: Busco una casa en Nordelta con pileta y 4 dormitorios, hasta USD 500.000..."
                                            className="w-full bg-white border-2 border-indigo-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-100 resize-none"
                                            rows={4}
                                            disabled={isSearching}
                                        />

                                        <button
                                            onClick={handleChatbotSearch}
                                            disabled={!chatQuery.trim() || isSearching}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {isSearching ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Buscando...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    Buscar Propiedades
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Examples */}
                                    <div className="mt-6 pt-6 border-t border-indigo-100">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ejemplos:</p>
                                        <div className="space-y-2">
                                            {[
                                                'Departamento en Recoleta, 3 ambientes, hasta USD 300k',
                                                'Casa con jardín y pileta en zona norte',
                                                'Alquiler temporario en Palermo con balcón'
                                            ].map((example, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setChatQuery(example)}
                                                    className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 font-medium p-3 hover:bg-white rounded-xl transition-all"
                                                >
                                                    "{example}"
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="filters"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Tipo de Propiedad */}
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                        Tipo de Propiedad
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['casa', 'departamento', 'ph', 'local', 'terreno', 'oficina'].map(tipo => (
                                            <button
                                                key={tipo}
                                                onClick={() => toggleTipo(tipo)}
                                                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filters.tipo.includes(tipo)
                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tipo de Operación */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                            Operación
                                        </label>
                                        <select
                                            value={filters.tipo_operacion}
                                            onChange={(e) => setFilters(prev => ({ ...prev, tipo_operacion: e.target.value as any }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        >
                                            <option value="">Todas</option>
                                            <option value="venta">Venta</option>
                                            <option value="alquiler">Alquiler</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Precio */}
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                        <DollarSign size={14} className="inline mr-1" />
                                        Rango de Precio (USD)
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            placeholder="Mínimo"
                                            value={filters.precio_min}
                                            onChange={(e) => setFilters(prev => ({ ...prev, precio_min: e.target.value }))}
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={filters.precio_max}
                                            onChange={(e) => setFilters(prev => ({ ...prev, precio_max: e.target.value }))}
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                </div>

                                {/* Características */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                            <Home size={14} className="inline mr-1" />
                                            Ambientes mín.
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 3"
                                            value={filters.ambientes_min}
                                            onChange={(e) => setFilters(prev => ({ ...prev, ambientes_min: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                            <Bed size={14} className="inline mr-1" />
                                            Dormitorios mín.
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 2"
                                            value={filters.dormitorios_min}
                                            onChange={(e) => setFilters(prev => ({ ...prev, dormitorios_min: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                            <Bath size={14} className="inline mr-1" />
                                            Baños mín.
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 1"
                                            value={filters.banos_min}
                                            onChange={(e) => setFilters(prev => ({ ...prev, banos_min: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                            <MapPin size={14} className="inline mr-1" />
                                            Zona/Barrio
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Palermo, Recoleta..."
                                            value={filters.zona}
                                            onChange={(e) => setFilters(prev => ({ ...prev, zona: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                            Ciudad
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: CABA, Tigre..."
                                            value={filters.ciudad}
                                            onChange={(e) => setFilters(prev => ({ ...prev, ciudad: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                        Amenities
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { key: 'cochera', label: 'Cochera', icon: Car },
                                            { key: 'pileta', label: 'Pileta' },
                                            { key: 'balcon', label: 'Balcón' },
                                            { key: 'seguridad', label: 'Seguridad' }
                                        ].map(({ key, label, icon: Icon }) => (
                                            <button
                                                key={key}
                                                onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                                                className={`p-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${filters[key as keyof typeof filters]
                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {Icon && <Icon size={16} />}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={handleFilterSearch}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                                >
                                    <Search size={20} />
                                    Buscar Propiedades
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default PropertySearch;
