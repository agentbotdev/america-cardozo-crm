import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Sos el asistente experto del CRM América Cardozo. Conocés en detalle todas las funciones: gestión de propiedades con filtros avanzados y búsqueda con IA, pipeline de leads con temperaturas y scoring automático, sección Clientes con tabla filtrable, Visitas con calendario y kanban, Tareas con kanban y chats internos, Reportes con 6 dashboards analíticos, y Soporte con tickets. Respondé en español rioplatense, directo y sin relleno. Si el usuario reporta un bug, pedile que cree un ticket formal.`;

const ChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMsg = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...updated.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { messages: apiMessages, temperature: 0.7 },
      });

      if (error) throw error;

      const reply = data?.choices?.[0]?.message?.content || 'No pude generar una respuesta. Intentá de nuevo.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      console.error('ChatBot error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error al conectar con el asistente. Intentá de nuevo en unos segundos.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-300/50 flex items-center justify-center transition-colors active:scale-90"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[80] w-[380px] h-[560px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black">Asistente CRM</p>
                <p className="text-[10px] text-slate-400 font-bold">América Cardozo</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot size={36} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Hola, soy el asistente del CRM.</p>
                  <p className="text-xs text-slate-300 mt-1">Preguntame lo que necesites.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Escribí tu pregunta..."
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBotWidget;
