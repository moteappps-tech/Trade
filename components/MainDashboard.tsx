import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, History, ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { Holding } from '@/lib/mock-data';
import { AdBanner } from '@/components/AdBanner';
import { GoogleAdBanner } from '@/components/GoogleAdBanner';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  total: number;
  date: string;
}

interface MainDashboardProps {
  balance: number;
  holdings: Holding[];
  tradeHistory: Trade[];
  latestPrices: Record<string, number>;
  onGoToChart: (symbol?: string) => void;
  onSellHolding: (symbol: string, qty: number, currentPrice: number) => void;
  onWatchAd: () => void;
}

export function MainDashboard({ balance, holdings, tradeHistory, latestPrices, onGoToChart, onSellHolding, onWatchAd }: MainDashboardProps) {
  // Calculate total portfolio value
  const holdingsValue = holdings.reduce((acc, curr) => {
    const currentPrice = latestPrices[curr.symbol] || curr.avgPrice;
    return acc + curr.qty * currentPrice;
  }, 0);
  
  const totalValue = balance + holdingsValue;

  return (
    <div className="flex-1 overflow-y-auto bg-[#131722] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section with Chart button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e222d] border border-[#2a2e39] rounded-2xl p-6">
           <div>
             <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
             <p className="text-gray-400 text-sm">Here is a quick summary of your trading performance.</p>
           </div>
           <button 
             onClick={() => onGoToChart()}
             className="px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-xl shadow-lg shadow-[#3b82f6]/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
           >
             <Activity className="w-5 h-5" />
             Open Trading Chart
           </button>
        </div>

        {/* Ad Banner for Earning */}
        <AdBanner onWatchAd={onWatchAd} />

        {/* Google AdSense Banner */}
        <GoogleAdBanner />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-gray-400">
              <div className="p-2 bg-[#2a2e39] rounded-lg text-[#22c55e]">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-medium text-white">Available Balance</span>
            </div>
            <div className="text-3xl font-bold font-mono text-[#22c55e]">
              ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-gray-400">
              <div className="p-2 bg-[#2a2e39] rounded-lg text-[#a855f7]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-medium text-white">Invested Value</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              ₹{holdingsValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-lg border-t-4 border-t-[#3b82f6]">
            <div className="flex items-center gap-3 mb-4 text-[#3b82f6]">
              <div className="p-2 bg-[#3b82f6]/20 rounded-lg text-[#3b82f6]">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide text-white">Total Net Worth</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Holdings */}
          <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-white">Current Holdings</h3>
              </div>
            </div>

            {holdings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#2a2e39] flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-gray-300 font-medium mb-2">No Active Holdings</h4>
                <p className="text-sm text-gray-500 mb-6">Start trading to build your portfolio.</p>
                <button onClick={() => onGoToChart()} className="px-5 py-2.5 bg-[#3b82f6]/10 text-[#3b82f6] font-semibold rounded-lg hover:bg-[#3b82f6]/20 transition-colors">
                  Go to Markets
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {holdings.map((holding) => {
                   const currentPrice = latestPrices[holding.symbol] || holding.avgPrice;
                   const isProfit = currentPrice >= holding.avgPrice;
                   const pnlValue = (currentPrice - holding.avgPrice) * holding.qty;
                   const pnlPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                   return (
                     <div key={holding.symbol} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#131722] p-4 rounded-xl border border-[#2a2e39] group hover:border-[#3b82f6]/50 transition-colors gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#2a2e39] flex items-center justify-center font-bold text-white cursor-pointer hover:bg-[#3b82f6]/20 hover:text-[#3b82f6] transition-colors" onClick={() => onGoToChart(holding.symbol)}>
                           {holding.symbol.substring(0, 2)}
                         </div>
                         <div>
                           <div className="font-bold text-white text-base cursor-pointer hover:text-[#3b82f6]" onClick={() => onGoToChart(holding.symbol)}>{holding.symbol}</div>
                           <div className="text-xs text-gray-400 font-mono mt-0.5">{holding.qty} shares @ ₹{holding.avgPrice.toFixed(2)}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                         <div className="text-left sm:text-right">
                           <div className="font-mono font-bold text-white">₹{(holding.qty * currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                           <div className={`text-xs font-mono font-medium flex items-center justify-start sm:justify-end mt-1 ${isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% (₹{Math.abs(pnlValue).toFixed(2)})
                              {isProfit ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                           </div>
                         </div>
                         <button 
                           onClick={() => onSellHolding(holding.symbol, holding.qty, currentPrice)}
                           className="px-3 py-1.5 bg-[#ef4444]/10 text-[#ef4444] text-xs font-bold rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:bg-[#ef4444]/20 transition-all border border-[#ef4444]/20"
                         >
                           Close Position
                         </button>
                       </div>
                     </div>
                   )
                })}
              </div>
            )}
          </div>

          {/* Trade History Preview */}
          <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-white">Recent Trades</h3>
              </div>
            </div>

            {tradeHistory.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#2a2e39] flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-gray-300 font-medium mb-1">No Trade History</h4>
                <p className="text-sm text-gray-500">Your recent transactions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tradeHistory.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-[#131722] rounded-xl border border-[#2a2e39] hover:bg-[#1a1e29] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${trade.type === 'BUY' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                        {trade.type === 'BUY' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white">{trade.symbol}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${trade.type === 'BUY' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                            {trade.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {new Date(trade.date).toLocaleDateString()} {new Date(trade.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">
                        {trade.type === 'BUY' ? '-' : '+'}₹{trade.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        {trade.qty} @ ₹{trade.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
