'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingScreenProps {
  onComplete: (mode: string) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [mode, setMode] = useState('beginner');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#131722]/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"></div>

        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Welcome Explorer</h1>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          This is a <strong className="text-gray-200">paper trading simulator</strong>. Experience real market dynamics with virtual money. Your capital is never at risk here.
        </p>
        
        <div className="mb-6">
           <h2 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Select Learning Mode</h2>
           <div className="flex flex-col gap-2">
              {[
                  { id: 'beginner', label: 'Beginner', desc: 'Slower paced, basic indicators' },
                  { id: 'intermediate', label: 'Intermediate', desc: 'Standard trading interface' },
                  { id: 'advanced', label: 'Advanced', desc: 'Fast execution, complex tools' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-start p-3 rounded-lg border transition-all ${mode === m.id ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-[#2a2e39] text-gray-400 hover:bg-[#2a2e39]/50 hover:text-gray-200'}`}
                >
                  <span className="font-semibold text-sm">{m.label}</span>
                  <span className="text-xs opacity-70 mt-1">{m.desc}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="mb-6 p-4 bg-[#131722] rounded-lg border border-[#2a2e39]">
           <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Virtual Starting Balance</p>
           <p className="text-2xl font-mono text-[#22c55e] font-bold">₹10,00,000</p>
        </div>

        <button 
          onClick={() => onComplete(mode)}
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3.5 rounded-lg transition-colors active:scale-95 shadow-lg shadow-[#3b82f6]/20"
        >
          Start Learning
        </button>
      </motion.div>
    </motion.div>
  );
}
