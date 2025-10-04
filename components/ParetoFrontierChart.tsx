
import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChatMessage, Theme, HardwareMetrics, QuantitativeMetrics } from '../types';

interface ParetoFrontierChartProps {
  runs: ChatMessage[];
  theme: Theme;
}

type MetricKey = keyof HardwareMetrics | keyof QuantitativeMetrics;

interface MetricOption {
    label: string;
    key: MetricKey;
    dataKey: string;
    unit: string;
}

const metricOptions: MetricOption[] = [
    { label: 'SNR', key: 'snr', dataKey: 'analysis.aiOptimized.snr', unit: 'dB' },
    { label: 'LUTs', key: 'lutCount', dataKey: 'result.metrics.lutCount', unit: '' },
    { label: 'Flip-Flops', key: 'ffCount', dataKey: 'result.metrics.ffCount', unit: '' },
    { label: 'DSPs', key: 'dspSlices', dataKey: 'result.metrics.dspSlices', unit: '' },
    { label: 'Throughput', key: 'throughput', dataKey: 'result.metrics.throughput', unit: 'MSPS' },
    { label: 'MSE', key: 'mse', dataKey: 'analysis.aiOptimized.mse', unit: '' },
];

const getNestedValue = (obj: any, path: string): number => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    }
    return typeof value === 'number' ? value : 0;
};


const getChartColors = () => {
    if (typeof window === 'undefined') return {};
    const styles = getComputedStyle(document.documentElement);
    return {
        grid: styles.getPropertyValue('--color-chart-grid').trim(),
        axis: styles.getPropertyValue('--color-text-secondary').trim(),
        tooltipBg: styles.getPropertyValue('--color-bg-panel').trim(),
        tooltipBorder: styles.getPropertyValue('--color-border-main').trim(),
        legend: styles.getPropertyValue('--color-text-main').trim(),
        primary: styles.getPropertyValue('--color-primary').trim(),
        secondaryAccent: styles.getPropertyValue('--color-secondary-accent').trim(),
    };
};

const CustomTooltip = ({ active, payload, xAxis, yAxis }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const colors = getChartColors();
    return (
      <div className="bg-bg-panel border border-border-main rounded-lg p-3 shadow-lg text-sm">
        <p className="font-bold text-text-main mb-1">Run #{data.runIndex}</p>
        <p className="text-text-secondary"><span className="font-semibold">{yAxis.label}:</span> {data.y.toFixed(2)} {yAxis.unit}</p>
        <p className="text-text-secondary"><span className="font-semibold">{xAxis.label}:</span> {data.x.toFixed(2)} {xAxis.unit}</p>
        <hr className="my-2 border-border-main" />
        <p className="text-xs text-text-secondary">Throughput: {data.throughput} MSPS</p>
      </div>
    );
  }
  return null;
};


const ParetoFrontierChart: React.FC<ParetoFrontierChartProps> = ({ runs, theme }) => {
  const [chartColors, setChartColors] = useState(getChartColors());
  const [xAxis, setXAxis] = useState<MetricOption>(metricOptions[1]); // LUTs
  const [yAxis, setYAxis] = useState<MetricOption>(metricOptions[0]); // SNR

  useEffect(() => {
    const timeoutId = setTimeout(() => setChartColors(getChartColors()), 50);
    return () => clearTimeout(timeoutId);
  }, [theme]);

  const data = runs.map((run, index) => {
    if (!run.result || !run.analysis?.aiOptimized) return null;
    return {
        runIndex: index + 1,
        x: getNestedValue(run, xAxis.dataKey),
        y: getNestedValue(run, yAxis.dataKey),
        throughput: getNestedValue(run, 'result.metrics.throughput'),
        isHwFeedback: run.isHwFeedbackRun || false,
    };
  }).filter(Boolean);

  const renderSelect = (value: MetricOption, setValue: (option: MetricOption) => void) => (
      <select 
        value={value.key}
        onChange={(e) => setValue(metricOptions.find(opt => opt.key === e.target.value)!)}
        className="p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main text-sm"
      >
        {metricOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
      </select>
  );

  return (
    <div className="w-full h-[60vh] flex flex-col">
       <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-sm font-semibold text-text-secondary">Y-Axis:</span>
            {renderSelect(yAxis, setYAxis)}
            <span className="text-sm font-semibold text-text-secondary">vs. X-Axis:</span>
            {renderSelect(xAxis, setXAxis)}
       </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xAxis.label} 
            unit={xAxis.unit} 
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }} 
            label={{ value: `${xAxis.label} (${xAxis.unit})`, position: 'insideBottom', offset: -20, fill: chartColors.axis }}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yAxis.label} 
            unit={yAxis.unit} 
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }} 
            label={{ value: `${yAxis.label} (${yAxis.unit})`, angle: -90, position: 'insideLeft', offset: -20, fill: chartColors.axis }}
            domain={['auto', 'auto']}
          />
          <ZAxis dataKey="throughput" range={[60, 400]} name="Throughput" unit="MSPS" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip xAxis={xAxis} yAxis={yAxis} />} />
          <Legend wrapperStyle={{ color: chartColors.legend, paddingTop: '30px' }} />
          <Scatter name="Standard Run" data={data.filter(d => !d.isHwFeedback)}>
            {data.filter(d => !d.isHwFeedback).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors.primary} />
            ))}
          </Scatter>
          <Scatter name="HIL Run" data={data.filter(d => d.isHwFeedback)}>
             {data.filter(d => d.isHwFeedback).map((entry, index) => (
              <Cell key={`cell-hil-${index}`} fill={chartColors.secondaryAccent} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ParetoFrontierChart;
