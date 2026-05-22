import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Wallet, History, ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2 } from 'lucide-react';
import { Holding } from '@/lib/mock-data';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  total: number;
  date: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  holdings: Holding[];
  tradeHistory: Trade[];
  latestPrices: Record<string, number>;
  onSellHolding: (symbol: string, qty: number, currentPrice: number) => void;
}

export function UserProfileModal({ isOpen, onClose, balance, holdings, tradeHistory, latestPrices, onSellHolding }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Calculate total portfolio value
  const holdingsValue = holdings.reduce((acc, curr) => {
    const currentPrice = latestPrices[curr.symbol] || curr.avgPrice;
    return acc + curr.qty * currentPrice;
  }, 0);
  
  const totalValue = balance + holdingsValue;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#1e222d] rounded-xl border border-[#2a2e39] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#131722]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center border border-[#3b82f6]/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">Trader Profile</h2>
                  <p className="text-xs text-gray-400">Demo Account</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#2a2e39] text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2a2e39] px-4 font-sans text-sm">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              >
                <BarChart2 className="w-4 h-4" />
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              >
                <History className="w-4 h-4" />
                Trade History
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans">
              
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39]">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium">Available Balance</span>
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#22c55e]">
                        ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39]">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Invested Value</span>
                      </div>
                      <div className="text-2xl font-bold font-mono text-white">
                        ₹{holdingsValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39] sm:col-span-1 border-l-[3px] border-l-[#3b82f6]">
                      <div className="flex items-center gap-2 mb-2 text-[#3b82f6]">
                        <span className="text-sm font-medium tracking-wide uppercase text-xs">Total Net Worth</span>
                      </div>
                      <div className="text-2xl font-bold font-mono text-white">
                        ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Holdings Preview */}
                  {holdings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Current Holdings</h3>
                      <div className="grid gap-3">
                        {holdings.slice(0, 3).map((holding) => {
                           const currentPrice = latestPrices[holding.symbol] || holding.avgPrice;
                           const isProfit = currentPrice >= holding.avgPrice;
                           return (
                             <div key={holding.symbol} className="flex justify-between items-center bg-[#131722] p-3 rounded-lg border border-[#2a2e39] group transition-all hover:border-[#3b82f6]/50">
                               <div>
                                 <div className="font-bold text-white">{holding.symbol}</div>
                                 <div className="text-xs text-gray-400">{holding.qty} shares</div>
                               </div>
                               <div className="flex items-center gap-4 text-right">
                                 <div>
                                   <div className="font-mono font-medium">₹{(holding.qty * currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                   <div className={`text-xs font-mono flex items-center justify-end ${isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                      {isProfit ? '+' : ''}{((currentPrice - holding.avgPrice) / holding.avgPrice * 100).toFixed(2)}%
                                   </div>
                                 </div>
                                 <button
                                   onClick={() => onSellHolding(holding.symbol, holding.qty, currentPrice)}
                                   className="px-2 py-1 bg-[#ef4444]/10 text-[#ef4444] text-xs font-medium rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-[#ef4444]/20 hover:bg-[#ef4444]/20"
                                 >
                                   Sell
                                 </button>
                               </div>
                             </div>
                           )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-white">All Trades</h3>
                  </div>

                  {tradeHistory.length === 0 ? (
                    <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#2a2e39] flex items-center justify-center mx-auto mb-3">
                        <History className="w-6 h-6 text-gray-500" />
                      </div>
                      <h4 className="text-gray-300 font-medium mb-1">No Activity Yet</h4>
                      <p className="text-sm text-gray-500">Your recent trades will appear here.</p>
                    </div>
                  ) : (
                    <div className="bg-[#131722] border border-[#2a2e39] rounded-xl overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto">
                        {tradeHistory.map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between p-3 sm:p-4 border-b border-[#2a2e39] last:border-0 hover:bg-[#1a1e29] transition-colors">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${trade.type === 'BUY' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                                {trade.type === 'BUY' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{trade.symbol}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${trade.type === 'BUY' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                                    {trade.type}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(trade.date).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-mono text-sm text-white">
                                {trade.type === 'BUY' ? '-' : '+'}₹{trade.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-gray-500 font-mono mt-1">
                                {trade.qty} @ ₹{trade.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
