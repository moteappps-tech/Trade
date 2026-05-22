export interface Candle {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
}

export const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'TSLA', 'NVDA'];
export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

export const basePrices: Record<string, number> = {
    'BTCUSDT': 64000,
    'ETHUSDT': 3400,
    'AAPL': 175,
    'TSLA': 200,
    'NVDA': 900
};

export function timeframeToMinutes(tf: string): number {
    switch (tf) {
        case '1m': return 1;
        case '5m': return 5;
        case '15m': return 15;
        case '1h': return 60;
        case '4h': return 240;
        case '1D': return 1440;
        default: return 60;
    }
}

// Ensure the timestamp aligns to the timeframe grid, and uses specific timezone zero out for simplicity.
function alignToInterval(timestampMs: number, intervalMinutes: number) {
    const msInInterval = intervalMinutes * 60 * 1000;
    // Aligning based on daily start 00:00 for 1D, etc.
    return Math.floor(timestampMs / msInInterval) * msInInterval;
}

export function generateMockCandles(symbol: string, timeframe: string, count = 300, targetEndPrice?: number): Candle[] {
  const candles: Candle[] = [];
  const intervalMinutes = timeframeToMinutes(timeframe);
  const now = Date.now();
  let currentPrice = basePrices[symbol] || 100;
  
  // Aligned end time
  let lastTimeMs = alignToInterval(now, intervalMinutes);
  let startTimeMs = lastTimeMs - (count - 1) * intervalMinutes * 60 * 1000;

  const volatility = currentPrice * 0.002;

  let currentTimeMs = startTimeMs;

  for (let i = 0; i < count; i++) {
    const open = currentPrice;
    
    // Slight drift
    const drift = (Math.random() - 0.49) * volatility; 
    const close = Math.max(0.1, currentPrice + drift); 
    const maxVal = Math.max(open, close);
    const minVal = Math.min(open, close);
    
    const high = maxVal + Math.random() * volatility * 0.8;
    const low = Math.max(0.01, minVal - Math.random() * volatility * 0.8);
    const volume = Math.floor(Math.random() * 1000000 / currentPrice) + 100;

    candles.push({
      // We must pass timestamp as seconds to lightweight-charts
      time: Math.floor(currentTimeMs / 1000), 
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
    currentTimeMs += intervalMinutes * 60 * 1000;
  }

  if (targetEndPrice !== undefined && candles.length > 0) {
     const lastClose = candles[candles.length - 1].close;
     const ratio = targetEndPrice / lastClose;
     for (const c of candles) {
        c.open *= ratio;
        c.high *= ratio;
        c.low *= ratio;
        c.close *= ratio;
     }
  }

  return candles;
}

export function generateNewCandle(lastCandle: Candle, intervalMinutes: number, priceUpdate: number): Candle {
    const now = Date.now();
    const msInSec = 1000;
    
    // Check if we need to close the last candle and start a new one
    // We assume lastCandle.time is in seconds
    const intervalSeconds = intervalMinutes * 60;
    const nextCandleTime = alignToInterval(lastCandle.time * 1000 + intervalSeconds * 1000, intervalMinutes) / 1000;

    const currentUnix = Math.floor(now / msInSec);
    
    if (currentUnix >= nextCandleTime) {
      // New candle
      return {
        time: nextCandleTime,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, priceUpdate),
        low: Math.min(lastCandle.close, priceUpdate),
        close: priceUpdate,
        volume: Math.floor(Math.random() * 100)
      }
    } else {
      // Update existing candle
      return {
        ...lastCandle,
        high: Math.max(lastCandle.high, priceUpdate),
        low: Math.min(lastCandle.low, priceUpdate),
        close: priceUpdate,
        volume: lastCandle.volume + Math.floor(Math.random() * 10)
      }
    }
}
