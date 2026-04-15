import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/aiService';
import { Property } from '../../types';

interface AIEnhanceButtonProps {
  type: 'title' | 'description';
  currentValue: string;
  context: Partial<Property>;
  onEnhance: (val: string) => void;
  className?: string;
}

const AIEnhanceButton = ({ type, currentValue, context, onEnhance, className = "" }: AIEnhanceButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEnhance = async () => {
    if (!currentValue?.trim()) return;
    setLoading(true);
    setSuccess(false);
    try {
      const result = await aiService.enhanceText(currentValue, context, type);
      onEnhance(result);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading || !currentValue}
      onClick={handleEnhance}
      className={`group flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-indigo-600 to-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${!currentValue ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl hover:shadow-indigo-200/50 active:scale-95'} ${className}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} key="loading">
            <Loader2 size={14} strokeWidth={3} />
          </motion.div>
        ) : success ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key="success">
            <Check size={14} strokeWidth={4} />
          </motion.div>
        ) : (
          <motion.div key="icon">
            <Sparkles size={14} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-nowrap">{loading ? 'Procesando...' : success ? 'Listo' : 'Mejorar con IA'}</span>
    </button>
  );
};

export default AIEnhanceButton;
