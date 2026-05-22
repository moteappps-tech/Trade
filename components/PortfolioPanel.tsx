'use client';

import React, { useState } from 'react';
import { Holding, SYMBOLS, basePrices } from '@/lib/mock-data';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

interface PortfolioPanelProps {
  holdings: Holding[];
  latestPrices: Record<string, number>;
  onSellHolding: (symbol: string, qty: number, currentPrice: number) => void;
}

export function PortfolioPanel({ holdings, latestPrices, onSellHolding }: PortfolioPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const mappedHoldings = holdings.map(h => {
    const ltp = latestPrices[h.symbol] || basePrices[h.symbol] || h.avgPrice;
    const invested = h.qty * h.avgPrice;
    const currentVal = h.qty * ltp;
    const pnl = currentVal - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    return { ...h, ltp, invested, currentVal, pnl, pnlPercent };
  });

  const totalInvested = mappedHoldings.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrent = mappedHoldings.reduce((sum, h) => sum + h.currentVal, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  if (!isOpen) {
    return (
      <div className="border-t border-[#2a2e39] bg-[#1e222d] shrink-0">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#2a2e39] transition-colors text-sm font-semibold text-gray-400"
        >
          <Briefcase className="w-4 h-4" />
          Positions & Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-[#2a2e39] bg-[#1e222d] shrink-0 h-64 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2e39] bg-[#1a1e27]">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-white">
            <Briefcase className="w-4 h-4 text-[#3b82f6]" />
            Portfolio
          </button>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm min-w-[800px]">
          <thead className="bg-[#131722] text-gray-500 sticky top-0 text-xs uppercase font-medium">
            <tr>
              <th className="p-3 border-b border-[#2a2e39]">Holding</th>
              <th className="p-3 border-b border-[#2a2e39] text-right">Qty</th>
              <th className="p-3 border-b border-[#2a2e39] text-right">Avg Price</th>
              <th className="p-3 border-b border-[#2a2e39] text-right">LTP</th>
              <th className="p-3 border-b border-[#2a2e39] text-right">Current Value</th>
              <th className="p-3 border-b border-[#2a2e39] text-right">P&L</th>
              <th className="p-3 border-b border-[#2a2e39] text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {mappedHoldings.map((h, i) => {
              const isUp = h.pnl >= 0;
              return (
                <tr key={h.symbol} className="border-b border-[#2a2e39] hover:bg-[#2a2e39]/50 transition-colors group">
                  <td className="p-3 font-semibold text-white">{h.symbol}</td>
                  <td className="p-3 font-mono text-right text-gray-300">{h.qty}</td>
                  <td className="p-3 font-mono text-right text-gray-300">₹{h.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono text-right text-gray-300">₹{h.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono text-right font-medium">₹{h.currentVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className={`p-3 font-mono text-right font-semibold ${isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      ₹{Math.abs(h.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })} 
                      ({h.pnlPercent.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => onSellHolding(h.symbol, h.qty, h.ltp)}
                      className="px-2 py-1 bg-[#ef4444]/10 text-[#ef4444] text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity border border-[#ef4444]/20 hover:bg-[#ef4444]/20"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#131722] sticky bottom-0">
            <tr className="font-bold text-white">
              <td className="p-3" colSpan={3}>Total Portfolio Summary</td>
              <td className="p-3 text-right text-gray-400 font-mono">Invested: ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="p-3 text-right font-mono">₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className={`p-3 text-right font-mono ${totalPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                ₹{totalPnl >= 0 ? '+' : '-'}{Math.abs(totalPnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalPnlPercent.toFixed(2)}%)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
