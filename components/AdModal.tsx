/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, PlayCircle } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export function AdModal({ isOpen, onComplete, onClose }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      setIsPlaying(true);
      setRewarded(false);
    } else {
      setIsPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      setRewarded(true);
      onComplete();
    }
  }, [timeLeft, isPlaying, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1e222d] rounded-xl overflow-hidden max-w-sm w-full border border-[#2a2e39] shadow-2xl relative"
          >
            {rewarded && (
               <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 z-10 transition-colors">
                 <X className="w-5 h-5" />
               </button>
            )}

            <div className="p-6 text-center flex flex-col items-center gap-4 relative overflow-hidden">
               {isPlaying ? (
                 <>
                   {/* Mock ad video element */}
                   <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                     <PlayCircle className="w-32 h-32 text-white animate-pulse" />
                   </div>
                   
                   <div className="w-16 h-16 rounded-full border-4 border-[#3b82f6] border-t-transparent animate-spin mt-4 z-10"></div>
                   <div className="z-10">
                     <h3 className="text-lg font-bold text-white mb-1">Sponsored Advertisement</h3>
                     <p className="text-sm text-gray-400">Discovering real-time trading insights...</p>
                   </div>
                   <div className="text-2xl font-mono font-bold text-[#3b82f6] z-10 mb-2">
                     00:0{timeLeft}
                   </div>
                 </>
               ) : (
                 <>
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] mt-2"
                   >
                     <Check className="w-8 h-8" />
                   </motion.div>
                   <div>
                     <h3 className="text-lg font-bold text-white mb-1">Reward Claimed!</h3>
                     <p className="text-sm text-gray-400">₹5,00,000 has been added to your virtual balance.</p>
                   </div>
                   <button 
                     onClick={onClose}
                     className="w-full mt-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2.5 rounded-lg transition-colors active:scale-95"
                   >
                     Continue Trading
                   </button>
                 </>
               )}
            </div>
            
            {isPlaying && (
              <div className="h-1 bg-[#131722] w-full">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-[#3b82f6]"
                />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
