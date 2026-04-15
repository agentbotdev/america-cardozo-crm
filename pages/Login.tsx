import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, Sparkles, Building2, ShieldCheck, ArrowRight, Instagram, Linkedin, Globe } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirigir si ya está logueado
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/');
        });
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans">
            {/* Lado Izquierdo: Visual & Branding */}
            <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 items-center justify-center overflow-hidden">
                {/* Fondo Animado de Gradientes */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Grid Sutil de Fondo */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-10 p-20 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                            <Sparkles className="text-indigo-400" size={16} />
                            <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">SISTEMA MULTI-AGENTE 2.0</span>
                        </div>

                        <h1 className="text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            America <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-rose-400">Cardozo</span>
                        </h1>

                        <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                            Gestión inmobiliaria redefinida con inteligencia artificial y automatización de vanguardia.
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-10">
                            <div className="space-y-2">
                                <h3 className="text-white font-black text-3xl">98%</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Automatización Leads</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-black text-3xl">24/7</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Asistencia AI</p>
                            </div>
                        </div>

                        {/* Social Links / Footer links */}
                        <div className="flex gap-6 pt-12">
                            <a href="#" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-slate-400 hover:text-white"><Instagram size={20} /></a>
                            <a href="#" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-slate-400 hover:text-white"><Linkedin size={20} /></a>
                            <a href="#" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-slate-400 hover:text-white"><Globe size={20} /></a>
                        </div>
                    </motion.div>
                </div>

                {/* Elemento Decorativo: "Floating Card" */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute right-[-80px] top-[40%] p-10 bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-2xl z-20 hidden 2xl:block"
                >
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                            <Building2 className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight text-nowrap">Altos de Palermo</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Nueva Captación</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-20 h-2 bg-indigo-500/20 rounded-full overflow-hidden">
                            <div className="w-2/3 h-full bg-indigo-500"></div>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-bold tracking-tight">AI Audit OK</span>
                    </div>
                </motion.div>
            </div>

            {/* Lado Derecho: Formulario de Login */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-20 bg-white relative">
                <div className="w-full max-w-sm space-y-12">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-xl shadow-slate-200"
                        >
                            <ShieldCheck className="text-indigo-400" size={32} />
                        </motion.div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Bienvenido al <br />Portal Agente</h2>
                        <p className="text-slate-400 font-medium text-sm">Ingresa tus credenciales autorizadas.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Email del Agente</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"><Mail size={20} /></div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] pl-16 pr-8 py-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-200"
                                        placeholder="agente@americacardozo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Clave Maestra</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"><Lock size={20} /></div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] pl-16 pr-8 py-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-200"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-4 bg-rose-50 border border-rose-100 rounded-2xl"
                                >
                                    <p className="text-xs font-bold text-rose-500 flex items-center gap-2">
                                        <ShieldCheck size={14} /> {error}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className={`w-full py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                                ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:-translate-y-1'}`}
                        >
                            <span className="relative z-10">{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                            {!loading && (
                                <motion.div
                                    animate={isHovered ? { x: 5 } : { x: 0 }}
                                    className="relative z-10"
                                >
                                    <ArrowRight size={18} strokeWidth={3} />
                                </motion.div>
                            )}
                        </button>
                    </form>

                    <div className="pt-10 flex items-center justify-between border-t border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">© 2026 AMERICA CARDOZO</p>
                        <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">¿Olvidaste tu clave?</button>
                    </div>
                </div>

                {/* Sutil gradiente de esquina para el form */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 blur-[100px] pointer-events-none rounded-full"></div>
            </div>
        </div>
    );
};

export default Login;
