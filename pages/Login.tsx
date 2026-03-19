import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, ArrowRight, Home } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.signIn(email, password);
            addToast('¡Bienvenido!', 'Has iniciado sesión correctamente.', 'success');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            addToast('Error de acceso', 'Credenciales incorrectas o problema de conexión.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900 font-sans">
            {/* Ambient background with the generated image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 blur-[2px]"
                style={{ backgroundImage: "url('/images/login-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/50 to-indigo-900/30" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md px-6 py-12"
            >
                <div className="backdrop-blur-2xl bg-white/10 p-10 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-black/50 overflow-hidden relative group">
                    {/* Animated background flare */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />

                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform duration-300">
                            <Home className="text-white" size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">America Cardozo</h1>
                        <p className="text-indigo-200/60 font-medium tracking-wide text-xs uppercase">Inmobiliaria CRM 2.0</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/50 ml-1">Email Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@americacardozo.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/50">Contraseña</label>
                                <button type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors">¿Olvidó la clave?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-2xl py-4.5 flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group h-14"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>ACCEDER AL PANEL</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 flex flex-col items-center gap-6">
                        <div className="w-full h-px bg-white/5" />
                        <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Propulsado por Antigravity Systems</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
