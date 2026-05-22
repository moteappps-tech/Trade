'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, PieChart, Activity } from 'lucide-react';
import { Holding, basePrices } from '@/lib/mock-data';

interface PortfolioDashboardProps {
  balance: number;
  holdings: Holding[];
  latestPrices: Record<string, number>;
}

export function PortfolioDashboard({ balance, holdings, latestPrices }: PortfolioDashboardProps) {
  // Compute portfolio stats
  const investedAmount = holdings.reduce((sum, h) => sum + h.qty * h.avgPrice, 0);
  const currentHoldingsValue = holdings.reduce((sum, h) => sum + h.qty * (latestPrices[h.symbol] || basePrices[h.symbol] || h.avgPrice), 0);
  
  const totalValue = balance + currentHoldingsValue;
  const profitAndLoss = currentHoldingsValue - investedAmount;
  const pnlPercentage = investedAmount > 0 ? (profitAndLoss / investedAmount) * 100 : 0;
  const isUp = profitAndLoss >= 0;

  return (
    <div className="p-4 border-b border-[#2a2e39] bg-[#1e222d] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-1.5 text-gray-200">
          <PieChart className="w-4 h-4 text-gray-400" />
          Portfolio
        </h3>
        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#8b5cf6]/20 text-[#8b5cf6] flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Mock Data
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide">Total Value</span>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-xs font-mono flex items-center pb-1 ${isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            ₹{Math.abs(profitAndLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pnlPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="bg-[#131722] border border-[#2a2e39] p-2.5 rounded-lg flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Invested</span>
          <span className="text-sm font-mono font-medium text-gray-200">
            ₹{investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="bg-[#131722] border border-[#2a2e39] p-2.5 rounded-lg flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Available</span>
          <span className="text-sm font-mono font-medium text-[#3b82f6]">
            ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
