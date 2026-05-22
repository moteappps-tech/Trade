'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  isReady: boolean;
}

export function SplashScreen({ onComplete, isReady }: SplashScreenProps) {
  const [minTimePassed, setMinTimePassed] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000); // 2 seconds total minimum
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimePassed && isReady) {
      onComplete();
    }
  }, [minTimePassed, isReady, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#131722]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative w-24 h-24 mb-6">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "40%" }}
            transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            className="absolute bottom-0 left-2 w-4 bg-[#2a2e39] rounded-t-sm"
          />
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "60%" }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
            className="absolute bottom-0 left-10 w-4 bg-[#ef4444] rounded-t-sm"
          />
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
            className="absolute bottom-0 left-18 w-4 bg-[#22c55e] rounded-t-sm"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div
                initial={{ pathLength: 0, opacity: 0, scale: 0.5 }}
                animate={{ pathLength: 1, opacity: 1, scale: 1.2 }}
                transition={{ duration: 1, delay: 0.8, ease: "backOut" }}
             >
                <TrendingUp className="w-16 h-16 text-[#3b82f6] opacity-80" strokeWidth={2} />
             </motion.div>
          </div>
        </div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Mote<span className="text-[#3b82f6]">Trade</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-sm text-gray-500 mt-2 font-mono uppercase tracking-widest"
        >
          Initializing Market Data
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
