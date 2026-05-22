export function calculateSMA(data: { value: number, time: number }[], period: number) {
  const result: { value: number, time: number }[] = [];
  if (data.length < period) return result;
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].value;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

export function calculateEMA(data: { value: number, time: number }[], period: number) {
  const result: { value: number, time: number }[] = [];
  if (data.length < period) return result;
  
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((acc, val) => acc + val.value, 0) / period;
  
  result.push({ time: data[period - 1].time, value: ema });
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i].value - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

export function calculateRSI(data: { value: number, time: number }[], period: number = 14) {
  const result: { value: number, time: number }[] = [];
  if (data.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].value - data[i - 1].value;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  result.push({ time: data[period].time, value: firstRSI });

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].value - data[i - 1].value;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    let rs = avgGain / avgLoss;
    let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    result.push({ time: data[i].time, value: rsi });
  }
  
  return result;
}

export function calculateMACD(data: { value: number, time: number }[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (data.length < slowPeriod) return { macdLine: [], signalLine: [], histogram: [] };
  
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: { value: number, time: number }[] = [];
  
  let fastIndex = fastEMA.findIndex(f => f.time === slowEMA[0].time);
  if (fastIndex === -1) return { macdLine: [], signalLine: [], histogram: [] };

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push({
      time: slowEMA[i].time,
      value: fastEMA[fastIndex + i].value - slowEMA[i].value
    });
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  const histogram: { value: number, time: number }[] = [];
  if (signalLine.length > 0) {
      let macdIndex = macdLine.findIndex(m => m.time === signalLine[0].time);
      for (let i = 0; i < signalLine.length; i++) {
        histogram.push({
          time: signalLine[i].time,
          value: macdLine[macdIndex + i].value - signalLine[i].value
        });
      }
  }

  return { macdLine, signalLine, histogram };
}
