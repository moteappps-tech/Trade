/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  Time,
  CandlestickData,
  HistogramData,
  LineData,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries
} from 'lightweight-charts';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD } from '@/lib/indicators';
import { Candle } from '@/lib/mock-data';

interface CandlestickChartProps {
  data: Candle[];
  timeframe: string;
  indicators: {
    ma9: boolean;
    ma20: boolean;
    ema50: boolean;
    rsi: boolean;
    macd: boolean;
  };
  onCrosshairMove?: (param: any) => void;
}

export function CandlestickChart({ data, timeframe, indicators, onCrosshairMove }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  // Series refs
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ma9SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [legend, setLegend] = useState<{ open: number, high: number, low: number, close: number, volume: number } | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Build chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af', // gray-400
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(42, 46, 57, 1)',
      },
      timeScale: {
        borderColor: 'rgba(42, 46, 57, 1)',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true, // Requires container to have width/height
    });
    
    chartRef.current = chart;

    // Main Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', // green-500
      downColor: '#ef4444', // red-500
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candleSeries;

    const formattedData: CandlestickData<Time>[] = data.map(d => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    candleSeries.setData(formattedData);

    // Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay
    });
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80%
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    const volumeData: HistogramData<Time>[] = data.map(d => ({
      time: d.time as Time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
    }));
    volumeSeries.setData(volumeData);

    // Indicators logic
    const closeData = data.map(d => ({ time: d.time, value: d.close }));

    if (indicators.ma9) {
      const ma9 = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, title: 'MA 9' }); // blue-500
      ma9.setData(calculateSMA(closeData, 9).map(d => ({ time: d.time as Time, value: d.value })));
      ma9SeriesRef.current = ma9;
    }
    
    if (indicators.ma20) {
      const ma20 = chart.addSeries(LineSeries, { color: '#eab308', lineWidth: 1, title: 'MA 20' }); // yellow-500
      ma20.setData(calculateSMA(closeData, 20).map(d => ({ time: d.time as Time, value: d.value })));
      ma20SeriesRef.current = ma20;
    }

    if (indicators.ema50) {
      const ema50 = chart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 1, title: 'EMA 50' }); // purple-500
      ema50.setData(calculateEMA(closeData, 50).map(d => ({ time: d.time as Time, value: d.value })));
      ema50SeriesRef.current = ema50;
    }

    // Set initial legend to last candle
    if (data.length > 0) {
       const last = data[data.length - 1];
       setLegend({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });
    }

    // Crosshair handler for legend
    chart.subscribeCrosshairMove((param) => {
      if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > chartContainerRef.current!.clientWidth ||
          param.point.y < 0 ||
          param.point.y > chartContainerRef.current!.clientHeight
      ) {
          // off chart, show last
          const last = data[data.length - 1];
          setLegend({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });
      } else {
          try {
             const val = param.seriesData.get(candleSeries) as any;
             const volVal = param.seriesData.get(volumeSeries) as any;
             if (val) {
                 setLegend({
                     open: val.open,
                     high: val.high,
                     low: val.low,
                     close: val.close,
                     volume: volVal ? volVal.value : 0
                 });
             }
          } catch(e) {}
      }
      
      if (onCrosshairMove) onCrosshairMove(param);
    });

    // Force fit content initially
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [data, indicators.ma9, indicators.ma20, indicators.ema50]); // We recreate chart on major metric mount for simplicity. Overlays are easy.

  // When data updates (latest candle ticks), we don't recreate the whole chart
  useEffect(() => {
    if (chartRef.current && data.length > 0) {
        const lastCandle = data[data.length - 1];
        candlestickSeriesRef.current?.update({
             time: lastCandle.time as Time,
             open: lastCandle.open,
             high: lastCandle.high,
             low: lastCandle.low,
             close: lastCandle.close,
        });
        volumeSeriesRef.current?.update({
            time: lastCandle.time as Time,
            value: lastCandle.volume,
             color: lastCandle.close >= lastCandle.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
        });
        
        // update legend if we are not hovering
        setLegend(prev => {
            return { open: lastCandle.open, high: lastCandle.high, low: lastCandle.low, close: lastCandle.close, volume: lastCandle.volume };
        });
    }
  }, [data]); // Note: If array changes length, the first effect currently rebuilds.

  return (
    <div className="w-full h-full relative">
       {legend && (
          <div className="absolute top-2 left-4 z-10 font-mono text-[11px] flex gap-3 text-gray-300 pointer-events-none select-none">
             <div className="flex gap-1">
                <span className="text-gray-500">O</span>
                <span className={legend.open <= legend.close ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{legend.open.toFixed(2)}</span>
             </div>
             <div className="flex gap-1">
                <span className="text-gray-500">H</span>
                <span className={legend.open <= legend.close ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{legend.high.toFixed(2)}</span>
             </div>
             <div className="flex gap-1">
                <span className="text-gray-500">L</span>
                <span className={legend.open <= legend.close ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{legend.low.toFixed(2)}</span>
             </div>
             <div className="flex gap-1">
                <span className="text-gray-500">C</span>
                <span className={legend.open <= legend.close ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{legend.close.toFixed(2)}</span>
             </div>
             <div className="flex gap-1">
                <span className="text-gray-500">Vol</span>
                <span>{legend.volume.toFixed(0)}</span>
             </div>
          </div>
       )}
       <div className="w-full h-full" ref={chartContainerRef} />
    </div>
  );
}
