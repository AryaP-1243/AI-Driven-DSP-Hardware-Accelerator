
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PowerSpectrumDataPoint, Theme, SignalType } from '../types';

interface SpectrumChartProps {
  data: PowerSpectrumDataPoint[];
  theme: Theme;
  signalType: SignalType;
}

const getChartColors = () => {
    if (typeof window === 'undefined') return {};
    const styles = getComputedStyle(document.documentElement);
    return {
        grid: styles.getPropertyValue('--color-chart-grid').trim(),
        axis: styles.getPropertyValue('--color-text-secondary').trim(),
        tooltipBg: styles.getPropertyValue('--color-bg-panel').trim(),
        tooltipBorder: styles.getPropertyValue('--color-border-main').trim(),
        legend: styles.getPropertyValue('--color-text-main').trim(),
        input: styles.getPropertyValue('--color-chart-input').trim(),
        baselineOutput: styles.getPropertyValue('--color-chart-baseline').trim(),
        outputOptimized: styles.getPropertyValue('--color-chart-optimized').trim(),
        outputCustom: styles.getPropertyValue('--color-chart-custom').trim(),
    };
};

const SpectrumChart: React.FC<SpectrumChartProps> = ({ data, theme }) => {
  const [chartColors, setChartColors] = useState(getChartColors());

  useEffect(() => {
    const timeoutId = setTimeout(() => setChartColors(getChartColors()), 50);
    return () => clearTimeout(timeoutId);
  }, [theme]);

  const hasOptimizedData = data.some(d => d.optimizedPower !== undefined);
  const hasCustomData = data.some(d => d.customPower !== undefined);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis 
            dataKey="frequency" 
            type="number" 
            stroke={chartColors.axis} 
            tick={{ fill: chartColors.axis }} 
            label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10, fill: chartColors.axis }} 
            domain={[0, 'dataMax']}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis 
            stroke={chartColors.axis} 
            tick={{ fill: chartColors.axis }} 
            domain={[-100, 0]}
            allowDataOverflow={true}
            label={{ value: 'Power (dB)', angle: -90, position: 'insideLeft', offset: -10, fill: chartColors.axis }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, color: chartColors.legend }} 
            labelStyle={{ color: chartColors.legend }}
            formatter={(value: number) => `${value.toFixed(2)} dB`}
            labelFormatter={(label: number) => `Freq: ${label.toFixed(2)} Hz`}
          />
          <Legend wrapperStyle={{ color: chartColors.legend, paddingTop: '20px' }} />
          <Line isAnimationActive={false} type="monotone" dataKey="inputPower" stroke={chartColors.input} strokeWidth={1} dot={false} name="Noisy Input" opacity={0.6}/>
          <Line isAnimationActive={false} type="monotone" dataKey="baselinePower" stroke={chartColors.baselineOutput} strokeWidth={2} dot={false} name="Baseline Output" />
          {hasOptimizedData && (
            <Line isAnimationActive={false} type="monotone" dataKey="optimizedPower" stroke={chartColors.outputOptimized} strokeWidth={2} dot={false} name="AI Optimized" />
          )}
          {hasCustomData && (
            <Line isAnimationActive={false} type="monotone" dataKey="customPower" stroke={chartColors.outputCustom} strokeWidth={2} dot={false} name="Custom Filter" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpectrumChart;