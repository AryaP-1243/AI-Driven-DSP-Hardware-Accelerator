

import { ChartDataPoint, OptimizationResult, AnalysisResults, FpgaTarget, BlockType, SignalType } from '../types';
import JSZip from 'jszip';

const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

export const exportDataAsCsv = (data: ChartDataPoint[]) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(val => val === undefined ? '' : val).join(',')
    );
    const content = [headers, ...rows].join('\n');
    downloadFile('signal_data.csv', content, 'text/csv;charset=utf-8;');
};

export const exportReportAsMarkdown = (
    result: OptimizationResult | null,
    analysis: AnalysisResults | null,
    config: {
        blockType: BlockType;
        signalType: SignalType;
        fpgaTarget: FpgaTarget;
        clockFrequency: number;
        userPrompt: string;
    }
) => {
    let content = `# AI-Driven DSP Hardware Optimization Report\n\n`;

    content += `## 1. Simulation Configuration\n`;
    content += `- **DSP Block:** ${config.blockType}\n`;
    content += `- **Signal Type:** ${config.signalType}\n`;
    content += `- **FPGA Target:** ${config.fpgaTarget}\n`;
    content += `- **Target Clock:** ${config.clockFrequency} MHz\n`;
    content += `- **User Prompt:** "${config.userPrompt}"\n\n`;

    if (result) {
        content += `## 2. AI Optimization Strategy\n`;
        content += `${result.explanation}\n\n`;

        content += `## 3. Estimated Hardware Metrics\n`;
        content += `| Metric          | Estimated Value |\n`;
        content += `|-----------------|-----------------|\n`;
        content += `| LUTs            | ${result.metrics.lutCount}      |\n`;
        content += `| Flip-Flops (FF) | ${result.metrics.ffCount}      |\n`;
        content += `| DSP Slices      | ${result.metrics.dspSlices}    |\n`;
        content += `| BRAM Blocks     | ${result.metrics.bramBlocks}    |\n`;
        content += `| Cycles/Sample   | ${result.metrics.cyclesPerSample} |\n`;
        content += `| Throughput      | ${result.metrics.throughput}    |\n\n`;

        if (result.coefficients.length > 0) {
            content += `### AI-Optimized Coefficients\n`;
            content += `(Quantized to ${result.coefficientBitWidth}-bit fixed-point)\n`;
            content += `\`\`\`\n${result.coefficients.join(', ')}\n\`\`\`\n\n`;
        }
    }
    
    if (analysis) {
        content += `## 4. Quantitative Performance Analysis\n`;
        content += `| Filter Type     | Signal-to-Noise Ratio (SNR) | Mean Squared Error (MSE) |\n`;
        content += `|-----------------|-----------------------------|--------------------------|\n`;
        content += `| Baseline        | ${analysis.baseline.snr.toFixed(4)} dB     | ${analysis.baseline.mse.toExponential(4)}      |\n`;
        if (analysis.aiOptimized) {
            content += `| AI Optimized    | ${analysis.aiOptimized.snr.toFixed(4)} dB     | ${analysis.aiOptimized.mse.toExponential(4)}      |\n`;
        }
        if (analysis.custom) {
            content += `| Custom          | ${analysis.custom.snr.toFixed(4)} dB          | ${analysis.custom.mse.toExponential(4)}      |\n`;
        }
        content += `\n`;
    }

    if (result) {
        content += `## 5. Generated HDL Module\n`;
        content += `\`\`\`systemverilog\n${result.hdlModule}\n\`\`\`\n`;
    }

    downloadFile('dsp_optimization_report.md', content, 'text/markdown;charset=utf-8;');
};

export const exportProjectAsZip = async (result: OptimizationResult, blockType: BlockType) => {
    const zip = new JSZip();
    const moduleName = blockType.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+$/, '');

    zip.file(`${moduleName}.sv`, result.hdlModule);
    zip.file(`${moduleName}_tb.sv`, result.hdlTestbench);
    zip.file('synth.tcl', result.synthesisScript);
    if (result.stimulusFileContent) {
        zip.file('stimulus.txt', result.stimulusFileContent);
    }


    const content = await zip.generateAsync({ type: 'blob' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(content);
    element.download = `${moduleName}_project.zip`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
