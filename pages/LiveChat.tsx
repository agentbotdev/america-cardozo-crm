import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MessageSquare, Phone, Video, MoreVertical,
    Send, Paperclip, Smile, Search as SearchIcon, Bot,
    Check, CheckCheck, User, Sparkles
} from 'lucide-react';

const MOCK_CHATS = [
    { id: 1, name: 'Juan Garcia', lastMsg: 'Hola, me interesa la casa en Nordelta', time: '10:30', unread: 2, status: 'online' },
    { id: 2, name: 'Maria Lopez', lastMsg: '¿Cuándo podemos coordinar la visita?', time: '09:15', unread: 0, status: 'away' },
    { id: 3, name: 'Carlos Perez', lastMsg: 'Muchas gracias por la info', time: 'Ayer', unread: 0, status: 'offline' },
    { id: 4, name: 'Sofia Rodriguez', lastMsg: 'Me gusta el duplex en Palermo', time: 'Ayer', unread: 0, status: 'online' },
];

const MOCK_MESSAGES = [
    { id: 1, text: 'Hola! Vi la propiedad en Nordelta y me encantó.', sent: false, time: '10:25' },
    { id: 2, text: '¡Excelente elección! Es una de nuestras mejores unidades. ¿Te gustaría agendar una visita?', sent: true, time: '10:26' },
    { id: 3, text: 'Sí, por favor. ¿Mañana por la tarde?', sent: false, time: '10:28' },
    { id: 4, text: 'Dejame consultar con el propietario y te confirmo.', sent: true, time: '10:30' },
];

const LiveChat: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
    const [message, setMessage] = useState('');

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 shadow-2xl overflow-hidden animate-fade-in transform-gpu">
            {/* Sidebar - Contacts */}
            <div className="w-full md:w-[400px] border-r border-slate-100 flex flex-col bg-white/60 backdrop-blur-md">
                <div className="p-10 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Mensajes</h2>
                        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <MessageSquare size={20} />
                        </div>
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-6">
                    {MOCK_CHATS.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`px-8 py-6 flex items-center gap-4 cursor-pointer transition-all hover:bg-white group ${selectedChat.id === chat.id ? 'bg-white shadow-lg shadow-indigo-50 ring-1 ring-slate-50' : ''}`}
                        >
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                                    {chat.name.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${chat.status === 'online' ? 'bg-emerald-500' : chat.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight truncate">{chat.name}</h4>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{chat.time}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-400 truncate leading-relaxed">{chat.lastMsg}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-lg shadow-indigo-200">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="hidden md:flex flex-1 flex-col relative bg-slate-50/20">
                {/* Chat Header */}
                <div className="h-28 flex items-center justify-between px-10 border-b border-slate-100 bg-white/60 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner">
                            {selectedChat.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{selectedChat.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activo ahora</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"><Phone size={20} /></button>
                        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"><Video size={20} /></button>
                        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"><MoreVertical size={20} /></button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-10 py-10 no-scrollbar space-y-8 scroll-smooth">
                    {MOCK_MESSAGES.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] group ${msg.sent ? 'items-end' : 'items-start'}`}>
                                <div className={`p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-xl transform-gpu transition-all hover:scale-[1.02]
                                    ${msg.sent
                                        ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200'
                                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-50 shadow-slate-200/50'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                <div className={`flex items-center gap-2 mt-3 px-2 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{msg.time}</span>
                                    {msg.sent && <CheckCheck size={14} className="text-indigo-500" />}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* AI Assistance Marker */}
                    <div className="flex justify-center my-10 relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100/50"></div></div>
                        <div className="relative px-6 bg-slate-50/50 backdrop-blur-sm rounded-full py-2 border border-slate-100 flex items-center gap-3">
                            <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shadow-sm">
                                <img src="/LOGOCORTOAGENT.jpg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Flor IA está analizando la conversación</span>
                        </div>
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-10 bg-white/60 backdrop-blur-md border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-3 pl-6 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <button className="text-slate-300 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe un mensaje aquí..."
                            className="bg-transparent border-none focus:outline-none flex-1 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                        />
                        <button className="text-slate-300 hover:text-indigo-600 transition-colors"><Smile size={20} /></button>
                        <button className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-90">
                            <Send size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Right Panel - Suggestions */}
                <div className="absolute top-32 right-10 w-80 space-y-4 pointer-events-none">
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/10 pointer-events-auto"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                                    <Sparkles size={16} />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Sugerencia de Flor</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-300 leading-relaxed mb-6 italic">"El cliente menciona Nordelta. Recomiendo sugerir el brochure actualizado de 'The Reserve'."</p>
                            <button className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-indigo-500/30 transition-all">
                                ENVIAR BROCHURE
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Empty State / Mobile detail view would go here */}
        </div>
    );
};

export default LiveChat;
