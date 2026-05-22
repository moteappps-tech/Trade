import React from 'react';
import { PlayCircle, Gift } from 'lucide-react';

interface AdBannerProps {
  onWatchAd: () => void;
}

export function AdBanner({ onWatchAd }: AdBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity"></div>
      
      <div className="relative z-10 flex items-center gap-4 text-left w-full sm:w-auto">
        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0 shadow-inner">
          <Gift className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Out of Virtual Cash?</h3>
          <p className="text-blue-100 text-sm max-w-sm">Watch a short advertisement to instantly refill your simulator balance with ₹500,000.</p>
        </div>
      </div>
      
      <button 
        onClick={onWatchAd}
        className="relative z-10 w-full sm:w-auto whitespace-nowrap bg-white text-[#1e3a8a] hover:bg-blue-50 hover:text-[#1e40af] font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
      >
        <PlayCircle className="w-5 h-5" />
        Watch Ad
      </button>
    </div>
  );
}
