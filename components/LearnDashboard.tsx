import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, CheckCircle, ChevronRight, X, PlayCircle } from 'lucide-react';
import { LESSONS } from '@/lib/lessons';
import { AdBanner } from '@/components/AdBanner';
import { GoogleAdBanner } from '@/components/GoogleAdBanner';

interface LearnDashboardProps {
  balance: number;
  onAddBalance: (amount: number) => void;
  onWatchAd: () => void;
}

export function LearnDashboard({ balance, onAddBalance, onWatchAd }: LearnDashboardProps) {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [activeLesson, setActiveLesson] = useState<typeof LESSONS[0] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem('completedLessons');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  if (!mounted) return null;

  const handleLessonComplete = () => {
    if (activeLesson && !completedLessons.includes(activeLesson.id)) {
      const newCompleted = [...completedLessons, activeLesson.id];
      setCompletedLessons(newCompleted);
      localStorage.setItem('completedLessons', JSON.stringify(newCompleted));
      onAddBalance(activeLesson.reward);
    }
    setActiveLesson(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#131722] p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <GraduationCap className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Trading School</h1>
            <p className="text-gray-400 max-w-lg mb-6">Master the basics and advanced strategies of trading. Complete lessons to earn virtual capital for your simulator account.</p>
            
            <div className="inline-flex items-center gap-2 bg-[#2a2e39] px-4 py-2 rounded-lg border border-[#3b82f6]/30">
               <span className="text-gray-400 text-sm">Progress</span>
               <span className="font-bold text-[#3b82f6]">{completedLessons.length} / {LESSONS.length}</span>
            </div>
          </div>
        </div>

        {/* Ad Banner for Earning */}
        <AdBanner onWatchAd={onWatchAd} />

        {/* Google AdSense Banner */}
        <GoogleAdBanner />

        {/* Lessons List */}
        <div className="space-y-4">
          {LESSONS.map((lesson, index) => {
             const isCompleted = completedLessons.includes(lesson.id);
             
             return (
               <button
                 key={lesson.id}
                 onClick={() => setActiveLesson(lesson)}
                 className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${isCompleted ? 'bg-[#1e222d]/50 border-[#2a2e39] opacity-80' : 'bg-[#1e222d] border-[#2a2e39] hover:border-[#3b82f6]/50 hover:bg-[#252936]'}`}
               >
                 <div className="flex items-center gap-4 text-left">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-inner ${isCompleted ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#3b82f6]/20 text-[#3b82f6]'}`}>
                     {isCompleted ? <CheckCircle className="w-6 h-6" /> : lesson.id}
                   </div>
                   <div>
                     <h3 className={`font-bold text-base sm:text-lg mb-1 leading-tight ${isCompleted ? 'text-gray-400 line-through decoration-gray-600' : 'text-white'}`}>{lesson.title}</h3>
                     <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#22c55e]">
                       <span>Collect ₹{lesson.reward.toLocaleString('en-IN')}</span>
                     </div>
                   </div>
                 </div>
                 <ChevronRight className={`w-5 h-5 shrink-0 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`} />
               </button>
             )
          })}
        </div>
      </div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm"
              onClick={() => setActiveLesson(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-2xl p-6 sm:p-8 flex flex-col z-10"
            >
               <button onClick={() => setActiveLesson(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#2a2e39] hover:bg-[#323644] rounded-full transition-colors">
                  <X className="w-5 h-5" />
               </button>

               <div className="w-16 h-16 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] shadow-inner mb-6 shrink-0 text-2xl font-bold">
                  {activeLesson.id}
               </div>

               <h2 className="text-2xl font-bold text-white mb-4 pr-8">{activeLesson.title}</h2>
               
               <div className="bg-[#131722] p-5 rounded-xl border border-[#2a2e39] mb-8">
                 <p className="text-gray-300 leading-relaxed">
                   {activeLesson.content}
                 </p>
               </div>

               <button
                 onClick={handleLessonComplete}
                 className="w-full py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-xl shadow-lg shadow-[#3b82f6]/20 transition-all flex items-center justify-center gap-2"
               >
                 {completedLessons.includes(activeLesson.id) ? (
                   <>
                     <CheckCircle className="w-5 h-5" />
                     Lesson Completed
                   </>
                 ) : (
                   <>
                     <PlayCircle className="w-5 h-5" />
                     Complete & Collect ₹{activeLesson.reward.toLocaleString('en-IN')}
                   </>
                 )}
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
