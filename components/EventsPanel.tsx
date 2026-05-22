'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, CheckSquare, XSquare } from 'lucide-react';

export interface EventMarket {
  id: string;
  title: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
}

const MOCK_EVENTS: EventMarket[] = [
  { id: '1', title: 'Will GTA VI release before October 2026?', category: 'Pop Culture', yesPrice: 0.65, noPrice: 0.35, volume: '₹1.2Cr' },
  { id: '2', title: 'Will Bitcoin touch $100k in 2026?', category: 'Crypto', yesPrice: 0.82, noPrice: 0.18, volume: '₹4.5Cr' },
  { id: '3', title: 'SpaceX to land humans on Mars by 2029?', category: 'Science', yesPrice: 0.45, noPrice: 0.55, volume: '₹85L' },
  { id: '4', title: 'Will AI pass the physical Turing test?', category: 'Tech', yesPrice: 0.15, noPrice: 0.85, volume: '₹3.2Cr' },
];

interface EventsPanelProps {
  balance: number;
  onTrade: (cost: number, type: string, eventTitle: string, shares: number) => void;
}

export function EventsPanel({ balance, onTrade }: EventsPanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventMarket | null>(null);
  const [tradeShares, setTradeShares] = useState<number>(100);

  const handleBuy = (isYes: boolean) => {
    if (!selectedEvent) return;
    const price = isYes ? selectedEvent.yesPrice : selectedEvent.noPrice;
    const cost = price * tradeShares;
    onTrade(cost, isYes ? 'YES' : 'NO', selectedEvent.title, tradeShares);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e222d] overflow-hidden">
      {selectedEvent ? (
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          <button 
            onClick={() => setSelectedEvent(null)}
            className="text-xs text-[#3b82f6] hover:underline mb-4 uppercase tracking-wider font-semibold"
          >
            &larr; Back to Events
          </button>
          
          <span className="text-[10px] uppercase font-bold text-gray-500 mb-1">{selectedEvent.category}</span>
          <h3 className="text-sm font-semibold text-white mb-4 leading-snug">{selectedEvent.title}</h3>
          
          <div className="flex justify-between items-center bg-[#131722] p-3 rounded-lg border border-[#2a2e39] mb-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">Yes Price</span>
              <span className="text-lg font-mono text-[#22c55e]">₹{selectedEvent.yesPrice.toFixed(2)}</span>
            </div>
            <div className="h-8 w-px bg-[#2a2e39]"></div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">No Price</span>
              <span className="text-lg font-mono text-[#ef4444]">₹{selectedEvent.noPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-2 mb-4">
             <div className="flex justify-between text-xs text-gray-400 mb-1">
               <span>Shares to buy</span>
               <span>{tradeShares}</span>
             </div>
             <input 
               type="range" 
               min="10" max="1000" step="10"
               value={tradeShares}
               onChange={(e) => setTradeShares(Number(e.target.value))}
               className="w-full accent-[#3b82f6]"
             />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 text-center mb-1">Cost</span>
               <button 
                 onClick={() => handleBuy(true)}
                 className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 hover:bg-[#22c55e]/20 transition-colors"
               >
                 <span className="font-bold text-[#22c55e]">Buy YES</span>
                 <span className="text-xs font-mono text-[#22c55e] mt-1">₹{(selectedEvent.yesPrice * tradeShares).toFixed(2)}</span>
               </button>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 text-center mb-1">Cost</span>
               <button 
                 onClick={() => handleBuy(false)}
                 className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 hover:bg-[#ef4444]/20 transition-colors"
               >
                 <span className="font-bold text-[#ef4444]">Buy NO</span>
                 <span className="text-xs font-mono text-[#ef4444] mt-1">₹{(selectedEvent.noPrice * tradeShares).toFixed(2)}</span>
               </button>
             </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-[#2a2e39] text-center">
             <p className="text-[10px] text-gray-500">Event resolves based on official announcements or consensus.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-[#2a2e39] flex items-center justify-between sticky top-0 bg-[#1e222d] z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Trending Markets</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_EVENTS.map(event => (
              <button 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full text-left p-4 border-b border-[#2a2e39] hover:bg-[#2a2e39]/50 transition-colors flex flex-col gap-2 group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-[#3b82f6] tracking-wider">{event.category}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Vol: {event.volume}</span>
                </div>
                <h4 className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">{event.title}</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-mono text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20">Yes ₹{event.yesPrice.toFixed(2)}</span>
                  <span className="text-xs font-mono text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded border border-[#ef4444]/20">No ₹{event.noPrice.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
