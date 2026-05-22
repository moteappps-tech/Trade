'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, Time, CrosshairMode, LineSeries, HistogramSeries } from 'lightweight-charts';
import { calculateRSI, calculateMACD } from '@/lib/indicators';
import { Candle } from '@/lib/mock-data';

interface LowerIndicatorChartProps {
  data: Candle[];
  type: 'RSI' | 'MACD';
  mainChartApi?: IChartApi | null; // Used to sync timescales
}

export function LowerIndicatorChart({ data, type, mainChartApi }: LowerIndicatorChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(42, 46, 57, 1)' },
      timeScale: {
        borderColor: 'rgba(42, 46, 57, 1)',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });
    chartRef.current = chart;

    const closeData = data.map(d => ({ time: d.time, value: d.close }));

    if (type === 'RSI') {
      const rsiSeries = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2 }); // violet-500
      const rsiData = calculateRSI(closeData).map(d => ({ time: d.time as Time, value: d.value }));
      rsiSeries.setData(rsiData);

      // Add RSI bands (70/30) - we use basic line overlays
      const topBand = chart.addSeries(LineSeries, { color: 'rgba(239, 68, 68, 0.5)', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false });
      const bottomBand = chart.addSeries(LineSeries, { color: 'rgba(34, 197, 94, 0.5)', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false });
      
      topBand.setData(closeData.map(d => ({ time: d.time as Time, value: 70 })));
      bottomBand.setData(closeData.map(d => ({ time: d.time as Time, value: 30 })));
      
    } else if (type === 'MACD') {
      const { macdLine, signalLine, histogram } = calculateMACD(closeData);
      
      const histSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
      });
      histSeries.setData(histogram.map(d => ({ 
          time: d.time as Time, 
          value: d.value, 
          color: d.value >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)' 
      })));

      const macdSeries = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1 }); // blue
      macdSeries.setData(macdLine.map(d => ({ time: d.time as Time, value: d.value })));
      
      const sigSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1 }); // amber
      sigSeries.setData(signalLine.map(d => ({ time: d.time as Time, value: d.value })));
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [data, type]);

  return (
    <div className="w-full h-full relative" ref={chartContainerRef} />
  );
}
