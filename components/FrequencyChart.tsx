
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FrequencyDataPoint, Theme } from '../types';

interface FrequencyChartProps {
  data: FrequencyDataPoint[];
  theme: Theme;
  domain: { min: number; max: number; };
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
        baselineOutput: styles.getPropertyValue('--color-chart-baseline').trim(),
        outputOptimized: styles.getPropertyValue('--color-chart-optimized').trim(),
        outputCustom: styles.getPropertyValue('--color-chart-custom').trim(),
    };
};

const FrequencyChart: React.FC<FrequencyChartProps> = ({ data, theme, domain }) => {
  const [chartColors, setChartColors] = useState(getChartColors());

  useEffect(() => {
    // A small delay ensures CSS variables have been applied after a theme switch
    const timeoutId = setTimeout(() => setChartColors(getChartColors()), 50);
    return () => clearTimeout(timeoutId);
  }, [theme]);

  const hasBaselineData = data.some(d => d.baselineDb !== undefined);
  const hasOptimizedData = data.some(d => d.optimizedDb !== undefined);
  const hasCustomData = data.some(d => d.customDb !== undefined);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis 
            dataKey="frequency" 
            type="number" 
            domain={[domain.min, domain.max]}
            allowDataOverflow
            stroke={chartColors.axis} 
            tick={{ fill: chartColors.axis }} 
            label={{ value: 'Normalized Frequency (x π rad/sample)', position: 'insideBottom', offset: -10, fill: chartColors.axis }} 
          />
          <YAxis 
            stroke={chartColors.axis} 
            tick={{ fill: chartColors.axis }} 
            domain={[-80, 5]}
            allowDataOverflow={true}
            label={{ value: 'Magnitude (dB)', angle: -90, position: 'insideLeft', offset: -10, fill: chartColors.axis }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, color: chartColors.legend }} 
            labelStyle={{ color: chartColors.legend }}
            formatter={(value: number) => `${value.toFixed(2)} dB`}
            labelFormatter={(label: number) => `Freq: ${label.toFixed(3)}`}
          />
          <Legend wrapperStyle={{ color: chartColors.legend, paddingTop: '20px' }} />
          {hasBaselineData && (
            <Line isAnimationActive={false} type="monotone" dataKey="baselineDb" stroke={chartColors.baselineOutput} strokeWidth={2} dot={false} name="Baseline Response" />
          )}
          {hasOptimizedData && (
            <Line isAnimationActive={false} type="monotone" dataKey="optimizedDb" stroke={chartColors.outputOptimized} strokeWidth={2} dot={false} name="AI Optimized Response" />
          )}
          {hasCustomData && (
            <Line isAnimationActive={false} type="monotone" dataKey="customDb" stroke={chartColors.outputCustom} strokeWidth={2} dot={false} name="Custom Response" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FrequencyChart;