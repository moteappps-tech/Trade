/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CandlestickChart } from '@/components/CandlestickChart';
import { LowerIndicatorChart } from '@/components/LowerIndicatorChart';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { PortfolioPanel } from '@/components/PortfolioPanel';
import { AdModal } from '@/components/AdModal';
import { EventsPanel } from '@/components/EventsPanel';
import { SplashScreen } from '@/components/SplashScreen';
import { UserProfileModal } from '@/components/UserProfileModal';
import { MainDashboard } from '@/components/MainDashboard';
import { LearnDashboard } from '@/components/LearnDashboard';
import { generateMockCandles, generateNewCandle, Candle, SYMBOLS, TIMEFRAMES, Holding } from '@/lib/mock-data';
import { Settings, Play, Pause, ChevronDown, Check, Maximize2, Search, ArrowUpRight, ArrowDownRight, Wallet, Plus, User, LayoutDashboard, GraduationCap, BookOpen, LineChart } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  total: number;
  date: string;
}

export default function TradingScreen() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[3]); // 1h
  const [data, setData] = useState<Candle[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Onboarding & Account State
  const [mounted, setMounted] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [learningMode, setLearningMode] = useState<string>('beginner');
  const [balance, setBalance] = useState<number>(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [tradeQty, setTradeQty] = useState(1);
  const [showAdModal, setShowAdModal] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'markets' | 'events'>('markets');
  const [showSplash, setShowSplash] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'chart' | 'learn'>('dashboard');

  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const toastTimer = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
      setToast({message, type});
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const handleEventTrade = (cost: number, type: string, eventTitle: string, shares: number) => {
    if (balance >= cost) {
       setBalance(b => b - cost);
       setHoldings(prev => [
         ...prev,
         { symbol: `EVT: ${eventTitle.substring(0, 8)} (${type})`, qty: shares, avgPrice: cost / shares }
       ]);
       showToast(`Successfully bought ${shares} ${type} shares!`, 'success');
    } else {
       showToast("Insufficient virtual balance", 'error');
    }
  };

  // Indicators standard toggle
  const [indicators, setIndicators] = useState({
    ma9: false,
    ma20: false,
    ema50: false,
    rsi: false,
    macd: false
  });

  // Watchlist
  const [watchlistQuery, setWatchlistQuery] = useState('');
  
  // Ticker state (latest price & changes)
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem('hasSeenOnboarding') === 'true';
    if (seen) {
       setHasSeenOnboarding(true);
       setLearningMode(localStorage.getItem('learningMode') || 'beginner');
       const storedBalance = localStorage.getItem('virtualBalance');
       setBalance(storedBalance !== null ? Number(storedBalance) : 1000000);
       const storedHoldings = localStorage.getItem('virtualHoldings');
       if (storedHoldings) setHoldings(JSON.parse(storedHoldings));
       const storedTradeHistory = localStorage.getItem('virtualTradeHistory');
       if (storedTradeHistory) setTradeHistory(JSON.parse(storedTradeHistory));
    } else {
       setBalance(1000000);
       setHoldings([]);
       setHasSeenOnboarding(true);
       localStorage.setItem('hasSeenOnboarding', 'true');
       localStorage.setItem('virtualBalance', '1000000');
    }
  }, []);

  useEffect(() => {
    if (mounted && hasSeenOnboarding) {
       localStorage.setItem('virtualBalance', balance.toString());
       localStorage.setItem('virtualHoldings', JSON.stringify(holdings));
       localStorage.setItem('virtualTradeHistory', JSON.stringify(tradeHistory));
    }
  }, [balance, holdings, tradeHistory, mounted, hasSeenOnboarding]);

  const completeOnboarding = (mode: string) => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('learningMode', mode);
    localStorage.setItem('virtualBalance', '1000000');
    setLearningMode(mode);
    setBalance(1000000);
    setHasSeenOnboarding(true);
  };

  const handleAdComplete = () => {
    setBalance(b => b + 500000); // add 5 lakh
  };

  const latestPriceMap = React.useRef<Record<string, number>>({});
  const [latestPrices, setLatestPrices] = useState<Record<string, number>>({});

  // Load initial data
  useEffect(() => {
    const historicalData = generateMockCandles(symbol, timeframe, 300, latestPriceMap.current[symbol]);
    setData(historicalData);
    
    if (historicalData.length > 0) {
      const last = historicalData[historicalData.length - 1];
      const prev = historicalData[0]; // simplistic 24h ref for demo
      latestPriceMap.current[symbol] = last.close;
      setLatestPrices(prevMap => ({ ...prevMap, [symbol]: last.close }));
      setCurrentPrice(last.close);
      const change = last.close - prev.close;
      setPriceChange(change);
      setPriceChangePercent((change / prev.close) * 100);
    }
  }, [symbol, timeframe]);

  // Live simulation ticker
  useEffect(() => {
    if (!isPlaying || data.length === 0) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        if (prevData.length === 0) return prevData;
        const lastCandle = prevData[prevData.length - 1];
        
        // Random walk
        const volatility = lastCandle.close * 0.001;
        const jump = (Math.random() - 0.48) * volatility;
        const newPrice = Math.max(0.01, lastCandle.close + jump);
        
        // Use generator logic to update or create
        const tfMinutes = timeframe === '1m' ? 1 
                        : timeframe === '5m' ? 5 
                        : timeframe === '15m' ? 15 
                        : timeframe === '1h' ? 60 
                        : timeframe === '4h' ? 240 
                        : 1440;
        
        const updatedCandle = generateNewCandle(lastCandle, tfMinutes, newPrice);
        
        const newData = [...prevData];
        if (updatedCandle.time === lastCandle.time) {
          newData[newData.length - 1] = updatedCandle;
        } else {
          newData.push(updatedCandle);
        }
        
        // Ticker update
        latestPriceMap.current[symbol] = newPrice;
        setLatestPrices(prevMap => ({ ...prevMap, [symbol]: newPrice }));
        setCurrentPrice(newPrice);
        const prevClose = newData[0].close; // simplistic ref
        const change = newPrice - prevClose;
        setPriceChange(change);
        setPriceChangePercent((change / prevClose) * 100);
        
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, data.length, timeframe, symbol]);


  const toggleIndicator = (key: keyof typeof indicators) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBuy = () => {
     const qty = Number(tradeQty);
     if (qty <= 0 || isNaN(qty)) {
         showToast("Please enter a valid quantity", "error");
         return;
     }
     const cost = currentPrice * qty;
     
     if (balance >= cost) {
       setBalance(b => b - cost);
       setHoldings(prev => {
          const existing = prev.find(h => h.symbol === symbol);
          if (existing) {
             const newQty = existing.qty + qty;
             const newAvg = ((existing.qty * existing.avgPrice) + cost) / newQty;
             return prev.map(h => h.symbol === symbol ? { ...h, qty: newQty, avgPrice: newAvg } : h);
          } else {
             return [...prev, { symbol, qty: qty, avgPrice: currentPrice }];
          }
       });
       
       const newTrade: Trade = {
         id: Math.random().toString(36).substr(2, 9),
         symbol,
         type: 'BUY',
         qty,
         price: currentPrice,
         total: cost,
         date: new Date().toISOString()
       };
       setTradeHistory(prev => [newTrade, ...prev]);

       showToast(`Bought ${qty} ${symbol} for ₹${cost.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'success');
     } else {
       showToast("Insufficient virtual balance", "error");
     }
  };

  const handleSell = () => {
     const qty = Number(tradeQty);
     if (qty <= 0 || isNaN(qty)) {
         showToast("Please enter a valid quantity", "error");
         return;
     }
     
     const existing = holdings.find(h => h.symbol === symbol);
     if (existing && existing.qty >= qty) {
        setBalance(b => b + (currentPrice * qty));
        setHoldings(prev => {
           if (existing.qty - qty <= 0.000001) {
              return prev.filter(h => h.symbol !== symbol);
           }
           return prev.map(h => h.symbol === symbol ? { ...h, qty: existing.qty - qty } : h);
        });
        
        const newTrade: Trade = {
          id: Math.random().toString(36).substr(2, 9),
          symbol,
          type: 'SELL',
          qty,
          price: currentPrice,
          total: currentPrice * qty,
          date: new Date().toISOString()
        };
        setTradeHistory(prev => [newTrade, ...prev]);

        showToast(`Sold ${qty} ${symbol} for ₹${(currentPrice * qty).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'success');
     } else {
        showToast("Insufficient holding quantity to sell", "error");
     }
  };

  const isUp = priceChange >= 0;

  return (
    <div className="flex flex-col h-screen w-full bg-[#131722] text-gray-200 overflow-hidden font-sans">
      <AnimatePresence>
        {showSplash && (
           <SplashScreen onComplete={() => setShowSplash(false)} isReady={data.length > 0 && mounted} />
        )}
      </AnimatePresence>
      
      <UserProfileModal 
         isOpen={showUserProfile} 
         onClose={() => setShowUserProfile(false)} 
         balance={balance} 
         holdings={holdings} 
         tradeHistory={tradeHistory}
         latestPrices={latestPrices}
         onSellHolding={(sym, qty, cp) => {
             setBalance(b => b + (cp * qty));
             setHoldings(prev => prev.filter(h => h.symbol !== sym));
             const newTrade: Trade = {
               id: Math.random().toString(36).substr(2, 9),
               symbol: sym,
               type: 'SELL',
               qty: qty,
               price: cp,
               total: cp * qty,
               date: new Date().toISOString()
             };
             setTradeHistory(prev => [newTrade, ...prev]);
             showToast(`Closed position: ${qty} ${sym} for ₹${(cp * qty).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'success');
          }}
      />

      <AnimatePresence>
        {mounted && !hasSeenOnboarding && !showSplash && (
          <OnboardingScreen onComplete={completeOnboarding} />
        )}
      </AnimatePresence>

      <AdModal 
        isOpen={showAdModal} 
        onComplete={handleAdComplete} 
        onClose={() => setShowAdModal(false)} 
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-lg shadow-xl font-medium text-sm flex items-center gap-2 border ${
              toast.type === 'success' ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]' : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full bg-[#ef4444]/20 flex items-center justify-center text-[10px]">!</div>}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:px-4 bg-[#1e222d] border-b border-[#2a2e39] gap-2 shrink-0 z-10">
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Symbol Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 hover:bg-[#2a2e39] px-3 py-1.5 rounded transition-colors text-lg font-bold">
              {symbol} <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#1e222d] border border-[#2a2e39] shadow-xl rounded-md hidden group-hover:block z-50">
              {SYMBOLS.map(sym => (
                <button 
                  key={sym} 
                  onClick={() => setSymbol(sym)}
                  className={`w-full text-left px-4 py-2 hover:bg-[#2a2e39] flex items-center justify-between ${sym === symbol ? 'text-blue-400' : 'text-gray-200'}`}
                >
                  {sym}
                  {sym === symbol && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-[#2a2e39] hidden sm:block"></div>

          {/* Timeframes */}
          <div className="flex bg-[#2a2e39] rounded overflow-hidden p-0.5">
            {TIMEFRAMES.map(tf => (
              <button 
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${tf === timeframe ? 'bg-[#1e222d] text-blue-400 shadow-sm rounded-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Live Ticker */}
        <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto justify-between sm:justify-end">
           <div className="flex flex-col items-end sm:items-start leading-tight">
             <span className={`text-xl font-bold font-mono tracking-tight transition-colors duration-300 ${isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                ₹{currentPrice.toFixed(2)}
             </span>
             <span className={`text-xs font-mono flex items-center ${isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(priceChange).toFixed(2)} ({Math.abs(priceChangePercent).toFixed(2)}%)
             </span>
           </div>

           <div className="h-6 w-px bg-[#2a2e39] hidden sm:block"></div>
           
           <div className="flex gap-4 items-center">
             <div className="hidden sm:flex gap-2 bg-[#2a2e39] rounded-full p-1 border border-[#3b82f6]/20">
               <button onClick={() => setViewMode('dashboard')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'dashboard' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                 Dashboard
               </button>
               <button onClick={() => setViewMode('chart')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                 Trade
               </button>
               <button onClick={() => setViewMode('learn')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'learn' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                 Learn
               </button>
             </div>

             <button onClick={() => setShowUserProfile(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2a2e39] hover:bg-[#323644] transition-colors text-white text-sm font-medium border border-[#3b82f6]/30 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline">Profile</span>
             </button>
             
             <div className="flex gap-2">
               <button onClick={() => setIsPlaying(!isPlaying)} className={`p-1.5 rounded hover:bg-[#2a2e39] transition-colors ${isPlaying ? 'text-[#22c55e]' : 'text-gray-400'}`} title="Live Data Toggle">
                 {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
               </button>
               <button className="p-1.5 rounded hover:bg-[#2a2e39] transition-colors text-gray-400" title="Fullscreen" onClick={() => document.documentElement.requestFullscreen().catch(()=>{})}>
                  <Maximize2 className="w-5 h-5" />
               </button>
             </div>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'dashboard' && (
        <MainDashboard 
          balance={balance} 
          holdings={holdings} 
          tradeHistory={tradeHistory} 
          latestPrices={latestPrices} 
          onGoToChart={(sym) => {
             if(sym) setSymbol(sym);
             setViewMode('chart');
          }}
          onSellHolding={(sym, qty, cp) => {
             setBalance(b => b + (cp * qty));
             setHoldings(prev => prev.filter(h => h.symbol !== sym));
             const newTrade: Trade = {
               id: Math.random().toString(36).substr(2, 9),
               symbol: sym,
               type: 'SELL',
               qty: qty,
               price: cp,
               total: cp * qty,
               date: new Date().toISOString()
             };
             setTradeHistory(prev => [newTrade, ...prev]);
             showToast(`Closed position: ${qty} ${sym} for ₹${(cp * qty).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'success');
          }}
          onWatchAd={() => setShowAdModal(true)}
        />
      )}
      
      {viewMode === 'learn' && (
         <LearnDashboard 
            balance={balance}
            onAddBalance={(amount) => {
               setBalance(b => b + amount);
               showToast(`Earned ₹${amount.toLocaleString('en-IN')} for completing a lesson!`, 'success');
            }}
            onWatchAd={() => setShowAdModal(true)}
         />
      )}

      {viewMode === 'chart' && (
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Chart Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#131722]">
             
             {/* Top Indicator Toolbar */}
           <div className="flex flex-wrap items-center gap-2 p-2 px-4 border-b border-[#2a2e39] text-xs">
              <span className="text-gray-500 font-medium">Indicators:</span>
              <button onClick={() => toggleIndicator('ma9')} className={`px-2 py-0.5 rounded border transition-colors ${indicators.ma9 ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-gray-400 hover:bg-[#2a2e39]'}`}>MA 9</button>
              <button onClick={() => toggleIndicator('ma20')} className={`px-2 py-0.5 rounded border transition-colors ${indicators.ma20 ? 'bg-[#eab308]/20 border-[#eab308] text-[#eab308]' : 'border-transparent text-gray-400 hover:bg-[#2a2e39]'}`}>MA 20</button>
              <button onClick={() => toggleIndicator('ema50')} className={`px-2 py-0.5 rounded border transition-colors ${indicators.ema50 ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7]' : 'border-transparent text-gray-400 hover:bg-[#2a2e39]'}`}>EMA 50</button>
              <span className="w-px h-3 bg-[#2a2e39] mx-1"></span>
              <button onClick={() => toggleIndicator('rsi')} className={`px-2 py-0.5 rounded border transition-colors ${indicators.rsi ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-gray-400 hover:bg-[#2a2e39]'}`}>RSI</button>
              <button onClick={() => toggleIndicator('macd')} className={`px-2 py-0.5 rounded border transition-colors ${indicators.macd ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]' : 'border-transparent text-gray-400 hover:bg-[#2a2e39]'}`}>MACD</button>
           </div>
           
           {/* Main Chart Wrapper */}
           <div className="flex flex-col flex-1 relative min-h-[300px]">
              
              {/* Overlay Crosshair details could go here, but lightweight-charts handles standard labels. */}

              {/* Main Candlestick */}
              <div className="flex-1 relative">
                {data.length > 0 ? (
                    <CandlestickChart data={data} timeframe={timeframe} indicators={indicators} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading chart data...</div>
                )}
              </div>

              {/* Lower Panes */}
              {indicators.rsi && (
                 <div className="h-[120px] border-t border-[#2a2e39] relative">
                    <div className="absolute top-1 left-2 z-10 text-xs font-mono text-[#8b5cf6] pointer-events-none">RSI(14)</div>
                    <LowerIndicatorChart data={data} type="RSI" />
                 </div>
              )}
              {indicators.macd && (
                 <div className="h-[120px] border-t border-[#2a2e39] relative">
                    <div className="absolute top-1 left-2 z-10 text-xs font-mono text-[#3b82f6] pointer-events-none">MACD(12,26,9)</div>
                    <LowerIndicatorChart data={data} type="MACD" />
                 </div>
              )}
           </div>

           {/* Portfolio Panel */}
           <PortfolioPanel holdings={holdings} latestPrices={latestPrices} onSellHolding={(sym, qty, cp) => {
             setBalance(b => b + (cp * qty));
             setHoldings(prev => prev.filter(h => h.symbol !== sym));
             const newTrade: Trade = {
               id: Math.random().toString(36).substr(2, 9),
               symbol: sym,
               type: 'SELL',
               qty: qty,
               price: cp,
               total: cp * qty,
               date: new Date().toISOString()
             };
             setTradeHistory(prev => [newTrade, ...prev]);
             showToast(`Closed position: ${qty} ${sym} for ₹${(cp * qty).toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'success');
          }} />

        </div>

        {/* Right Sidebar - Watchlist & Trade Actions */}
        <div className="w-[300px] border-l border-[#2a2e39] bg-[#1e222d] flex flex-col shrink-0 hidden lg:flex">
           
           {/* Trade Actions Card */}
           <div className="p-4 border-b border-[#2a2e39]">
             <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">{symbol} Spot</span>
                <div className="flex gap-2 items-center">
                   {mounted && (
                     <div className="flex items-center text-xs font-mono bg-[#131722] px-2 py-0.5 rounded border border-[#2a2e39]" title="Virtual Balance">
                       <Wallet className="w-3 h-3 text-gray-400 mr-1.5" />
                       <span className="text-[#22c55e]">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                       <button onClick={() => setShowAdModal(true)} className="ml-2 hover:bg-[#3b82f6]/20 transition-colors rounded p-0.5 text-[#3b82f6]" title="Watch Ad to Refill Balance">
                         <Plus className="w-3 h-3" />
                       </button>
                     </div>
                   )}
                   <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#3b82f6]/20 text-[#3b82f6]">Live</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-2 mb-3">
               <div className="flex bg-[#131722] rounded items-center px-3 border border-[#2a2e39]">
                 <span className="text-gray-500 text-xs mr-2">Qty</span>
                 <input type="number" 
                        value={tradeQty === 0 ? '' : tradeQty} 
                        onChange={e => setTradeQty(Number(e.target.value))}
                        min={0}
                        step="any"
                        className="bg-transparent w-full focus:outline-none text-white text-sm py-1.5" />
               </div>
               
               <div className="flex gap-1 mt-1">
                 <button onClick={() => setTradeQty(Number(((balance * 0.25) / currentPrice).toFixed(4)))} className="flex-1 bg-[#2a2e39] text-xs py-1 rounded text-gray-400 hover:text-white">25%</button>
                 <button onClick={() => setTradeQty(Number(((balance * 0.50) / currentPrice).toFixed(4)))} className="flex-1 bg-[#2a2e39] text-xs py-1 rounded text-gray-400 hover:text-white">50%</button>
                 <button onClick={() => setTradeQty(Number(((balance * 0.75) / currentPrice).toFixed(4)))} className="flex-1 bg-[#2a2e39] text-xs py-1 rounded text-gray-400 hover:text-white">75%</button>
                 <button onClick={() => setTradeQty(Number((balance / currentPrice).toFixed(4)))} className="flex-1 bg-[#2a2e39] text-xs py-1 rounded text-gray-400 hover:text-white">Max</button>
               </div>

               <div className="flex justify-between items-center px-1">
                 <span className="text-xs text-gray-500">Order Value</span>
                 <span className="text-xs font-mono text-gray-300">₹{(tradeQty * currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
               </div>
             </div>

             <div className="flex gap-2">
                <button onClick={handleSell} className="flex-1 py-3 px-4 rounded font-bold transition-all bg-[#ef4444] hover:bg-[#ef4444]/90 text-white shadow-lg shadow-[#ef4444]/20 active:scale-95 flex flex-col items-center leading-tight">
                   <span>Sell</span>
                   <span className="text-xs font-mono opacity-80">₹{(currentPrice * 0.999).toFixed(2)}</span>
                </button>
                <button onClick={handleBuy} className="flex-1 py-3 px-4 rounded font-bold transition-all bg-[#22c55e] hover:bg-[#22c55e]/90 text-white shadow-lg shadow-[#22c55e]/20 active:scale-95 flex flex-col items-center leading-tight">
                   <span>Buy</span>
                   <span className="text-xs font-mono opacity-80">₹{(currentPrice * 1.001).toFixed(2)}</span>
                </button>
             </div>
             <p className="text-[10px] text-gray-500 mt-3 text-center">Demo trading. Real money not at risk.</p>
           </div>

           {/* Portfolio Dashboard */}
           <PortfolioDashboard balance={balance} holdings={holdings} latestPrices={latestPrices} />

           {/* Right Sidebar Tabs */}
           <div className="flex bg-[#131722] p-1 border-b border-[#2a2e39]">
             <button 
               onClick={() => setRightSidebarTab('markets')}
               className={`flex-1 py-1.5 text-xs font-semibold rounded ${rightSidebarTab === 'markets' ? 'bg-[#2a2e39] text-white' : 'text-gray-400 hover:text-gray-200'}`}
             >
               Markets
             </button>
             <button 
               onClick={() => setRightSidebarTab('events')}
               className={`flex-1 py-1.5 text-xs font-semibold rounded ${rightSidebarTab === 'events' ? 'bg-[#2a2e39] text-white' : 'text-gray-400 hover:text-gray-200'}`}
             >
               Events (Pop Culture)
             </button>
           </div>

           {rightSidebarTab === 'markets' ? (
             <div className="flex-1 flex flex-col min-h-0">
               <div className="p-3 border-b border-[#2a2e39] flex items-center justify-between">
                  <span className="font-semibold text-sm">Watchlist</span>
                  <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
               </div>
               
               <div className="p-2 border-b border-[#2a2e39]">
                  <div className="relative">
                     <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="Search symbol" 
                       className="w-full bg-[#131722] border border-[#2a2e39] rounded py-1.5 pl-7 pr-2 text-xs focus:outline-none focus:border-[#3b82f6] text-gray-200 placeholder-gray-500 transition-colors"
                       value={watchlistQuery}
                       onChange={(e) => setWatchlistQuery(e.target.value)}
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto">
                  <div className="flex px-3 py-2 text-[10px] text-gray-500 font-medium uppercase sticky top-0 bg-[#1e222d] border-b border-[#2a2e39]">
                     <span className="w-[50%]">Symbol</span>
                     <span className="w-[25%] text-right">Last</span>
                     <span className="w-[25%] text-right">Chg%</span>
                  </div>
                  
                  {SYMBOLS.filter(s => s.toLowerCase().includes(watchlistQuery.toLowerCase())).map(sym => {
                     // Mock static stats for the watchlist that aren't the active symbol
                     const isActive = sym === symbol;
                     const mockWalk = Math.sin(sym.charCodeAt(0) * 10) * 2;
                     const symRowUp = isActive ? isUp : mockWalk >= 0;
                     const symValStr = isActive ? currentPrice.toFixed(2) : (100 * Math.abs(mockWalk) + 50).toFixed(2);
                     const symPctStr = isActive ? Math.abs(priceChangePercent).toFixed(2) : (Math.abs(mockWalk)).toFixed(2);

                     return (
                       <div 
                           key={sym} 
                           onClick={() => setSymbol(sym)}
                           className={`flex px-3 py-2.5 text-sm cursor-pointer border-l-2 transition-colors hover:bg-[#2a2e39] ${isActive ? 'bg-[#2a2e39] border-[#3b82f6]' : 'border-transparent'}`}
                       >
                           <span className={`w-[50%] font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{sym}</span>
                           <span className="w-[25%] text-right font-mono text-xs">{symValStr}</span>
                           <span className={`w-[25%] text-right font-mono text-xs font-medium ${symRowUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                               {symRowUp ? '+' : '-'}{symPctStr}%
                           </span>
                       </div>
                     );
                  })}
               </div>
             </div>
           ) : (
             <EventsPanel balance={balance} onTrade={handleEventTrade} />
           )}
        </div>
      </div>
      )}

      {/* Mobile Trade Action Bar (Sticky Bottom) - Only show in Chart mode */}
      {viewMode === 'chart' && (
      <div className="lg:hidden p-2 border-t border-[#2a2e39] bg-[#1e222d] flex flex-col gap-2 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 bg-[#131722] rounded items-center px-3 border border-[#2a2e39]">
               <span className="text-gray-500 text-xs mr-2">Qty</span>
               <input type="number" 
                      value={tradeQty === 0 ? '' : tradeQty} 
                      onChange={e => setTradeQty(Number(e.target.value))}
                      min={0}
                      step="any"
                      className="bg-transparent w-full focus:outline-none text-white text-sm py-1.5" />
            </div>
            <div className="flex flex-col items-end px-2">
               <span className="text-[10px] text-gray-500">Value</span>
               <span className="text-xs font-mono text-gray-300">₹{(tradeQty * currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSell} className="flex-1 py-3 px-4 rounded font-bold transition-all bg-[#ef4444] text-white flex flex-col items-center leading-tight">
               <span>Sell</span>
            </button>
            <button onClick={handleBuy} className="flex-1 py-3 px-4 rounded font-bold transition-all bg-[#22c55e] text-white flex flex-col items-center leading-tight">
               <span>Buy</span>
            </button>
          </div>
      </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around bg-[#1e222d] border-t border-[#2a2e39] pb-safe shrink-0 z-50 relative pb-2 pt-1">
        <button 
          onClick={() => setViewMode('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${viewMode === 'dashboard' ? 'text-[#3b82f6]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button 
          onClick={() => setViewMode('chart')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${viewMode === 'chart' ? 'text-[#3b82f6]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <LineChart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Trade</span>
        </button>
        <button 
          onClick={() => setViewMode('learn')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${viewMode === 'learn' ? 'text-[#3b82f6]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px] font-medium">Learn</span>
        </button>
      </div>

    </div>
  );
}
