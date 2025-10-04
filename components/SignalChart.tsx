
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint, Theme } from '../types';

interface SignalChartProps {
  data: ChartDataPoint[];
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
        input: styles.getPropertyValue('--color-chart-input').trim(),
        clean: styles.getPropertyValue('--color-chart-clean').trim(),
        baselineOutput: styles.getPropertyValue('--color-chart-baseline').trim(),
        outputOptimized: styles.getPropertyValue('--color-chart-optimized').trim(),
        outputCustom: styles.getPropertyValue('--color-chart-custom').trim(),
    };
};

const SignalChart: React.FC<SignalChartProps> = ({ data, theme, domain }) => {
  const [chartColors, setChartColors] = useState(getChartColors());

  useEffect(() => {
    // A small delay ensures CSS variables have been applied after a theme switch
    const timeoutId = setTimeout(() => setChartColors(getChartColors()), 50);
    return () => clearTimeout(timeoutId);
  }, [theme]);

  const hasOptimizedData = data.some(d => d.outputOptimized !== undefined);
  const hasCustomData = data.some(d => d.outputCustom !== undefined);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis 
            dataKey="time" 
            type="number" 
            domain={[domain.min, domain.max]} 
            allowDataOverflow
            stroke={chartColors.axis} 
            tick={{ fill: chartColors.axis }} 
            label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: chartColors.axis }}/>
          <YAxis stroke={chartColors.axis} tick={{ fill: chartColors.axis }} domain={[-2, 2]} />
          <Tooltip 
            contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, color: chartColors.legend }} 
            labelStyle={{ color: chartColors.legend }}
          />
          <Legend wrapperStyle={{ color: chartColors.legend, paddingTop: '10px' }} />
          <Line isAnimationActive={false} type="monotone" dataKey="input" stroke={chartColors.input} strokeWidth={1} dot={false} name="Noisy Input" opacity={0.6}/>
          <Line isAnimationActive={false} type="monotone" dataKey="clean" stroke={chartColors.clean} strokeWidth={1} dot={false} name="Clean Signal" strokeDasharray="2 6" />
          <Line isAnimationActive={false} type="monotone" dataKey="baselineOutput" stroke={chartColors.baselineOutput} strokeWidth={2} dot={false} name="Baseline Chain" />
          {hasOptimizedData && (
            <Line isAnimationActive={false} type="monotone" dataKey="outputOptimized" stroke={chartColors.outputOptimized} strokeWidth={2} dot={false} name="AI Optimized Chain" />
          )}
          {hasCustomData && (
            <Line isAnimationActive={false} type="monotone" dataKey="outputCustom" stroke={chartColors.outputCustom} strokeWidth={2} dot={false} name="Custom Chain" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SignalChart;
