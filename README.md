High-Level Purpose
This is a sophisticated web-based dashboard designed to radically accelerate the design and optimization of Digital Signal Processing (DSP) systems for Field-Programmable Gate Arrays (FPGAs). Its core purpose is to bridge the gap between high-level algorithmic goals (e.g., "remove noise from an ECG signal") and low-level hardware implementation details.

It allows a user, such as an FPGA engineer or a DSP researcher, to use natural language to guide a powerful AI (Google's Gemini model) in generating, simulating, and analyzing complete, synthesizable hardware blocks.

Core Workflow
The user experience is designed as an iterative, conversational loop:

Configure: The user starts by building a DSP Chain in the sidebar, adding blocks like FIR filters, IIR filters, or FFTs. They also select a Signal Source from a vast library of over 100 realistic signals across biomedical, audio, communications, and other domains.
Optimize: The user interacts with the AI through a Chat Panel. They describe their optimization goal, such as "minimize power consumption," "maximize throughput," or "preserve the shape of this specific waveform." They can also set hard constraints (e.g., maximum LUTs) and target specific FPGA hardware from vendors like Xilinx, Intel, or Lattice.
Generate & Simulate: The AI processes this request and generates a complete, optimized hardware design. This isn't just a concept; it's a full package including:
Synthesizable SystemVerilog HDL for the DSP block.
A self-checking Testbench.
A Tcl Synthesis Script for standard tools like Vivado or Quartus.
A Stimulus File with relevant signal data.
Hardware Metric Estimates (LUTs, Flip-Flops, DSP Slices, BRAMs, Throughput).
An Explanation of its design choices.
Analyze: The application immediately uses the AI's generated design (specifically, the filter coefficients and bit-widths) to run a client-side simulation. The user can visually and quantitatively compare the performance of the AI-optimized chain against both the raw input signal and a generic baseline chain. Key analysis views include:
Time-Domain Chart: Shows the input, clean, baseline, and optimized signals.
Frequency Response & Power Spectrum Charts: Visualize the filter's behavior in the frequency domain.
Quantitative Metrics: Calculates Signal-to-Noise Ratio (SNR) and Mean Squared Error (MSE) for an objective measure of quality.
Iterate & Refine: Based on the results, the user can send a follow-up prompt to the AI, such as "That used too many DSP slices, try again using only LUTs," and the AI will generate a new, refined design.
Key Features & Capabilities
Conversational AI Interaction: Leverages the Google Gemini API with a strict JSON schema to ensure structured, reliable responses that can be directly used by the application.
Complex DSP Chain Simulation: Models a multi-block signal processing pipeline where the output of one block feeds into the next.
Hardware-Aware Optimization: The AI prompt is enriched with context about the target FPGA, clock frequency, and user-defined constraints, leading to highly relevant hardware designs.
Per-Block Configuration: Users have fine-grained control over individual blocks in the chain, such as setting the filter order, type (low-pass, etc.), and windowing function for an active FIR filter.
Live Audio Input: For audio-related signals, the app can request microphone access and process live audio data in real-time, providing immediate visual feedback and analysis.
"Hardware-in-the-Loop" Simulation: It features a simulated hardware validation flow. A user can "run synthesis" on an AI design, which returns slightly randomized "actual" hardware metrics. The user can then feed these results back to the AI to re-optimize the design based on real-world feedback.
Trade-off Analysis: A dedicated panel allows users to adjust the data and coefficient bit-widths of an AI-generated design and get an immediate AI-powered estimate of how those changes will affect hardware costs and signal quality (SNR/MSE).
Comprehensive Export: Users can download:
Raw signal data as a CSV file.
A full Markdown Report containing the configuration, AI explanation, metrics, and analysis.
A complete ZIP Project with all the generated HDL and script files.
Advanced Visualization: Includes interactive charts with pan and zoom, a comparison modal for different optimization runs, and a Pareto Frontier plot to visualize the trade-offs between different metrics (e.g., SNR vs. LUTs).
Technology Stack
Frontend: React with TypeScript, using functional components and hooks.
Styling: Tailwind CSS, with a sophisticated custom theming system using CSS variables.
AI Backend: The @google/genai SDK to communicate with the Gemini API.
Charting: Recharts for interactive and responsive data visualization.
Architecture: A modern, browser-based single-page application (SPA) with no server-side component (beyond the Gemini API itself). It uses an importmap for dependency management, avoiding a complex build step.
In essence, this project is a powerful proof-of-concept demonstrating how generative AI can be integrated into highly technical engineering workflows to serve as an expert co-pilot, dramatically accelerating prototyping, analysis, and the exploration of complex design spaces.
User
Modify the geminiService.ts file to include the selected Filter Order, Filter Type, and Window Function in the prompt sent to the AI when optimizing FIR filters. Ensure these parameters are passed as part of the DspBlockConfig.
Gemini 2.5 Pro
Ran for 168s
Thought for 75 seconds
chevron_right
Of course. I've updated the AI prompting to be more explicit. Now, when you specify a filter type (like low-pass) or a window function (like Hamming), the AI will be directly instructed to incorporate those specific design parameters when generating the FIR filter coefficients and hardware. This ensures the resulting optimization is even more closely aligned with your detailed requirements.
