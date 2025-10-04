AI-Driven DSP Hardware Accelerator
This project is an interactive web-based dashboard for simulating and visualizing the AI-driven optimization of Digital Signal Processing (DSP) hardware blocks. It provides a platform for engineers, researchers, and students to explore the trade-offs between DSP algorithms and their hardware implementations on FPGAs, leveraging the power of the Google Gemini API for code generation and performance estimation.

Users can define a DSP processing chain, select from a vast library of signal types, specify a target FPGA architecture, and use natural language to guide an AI co-pilot in generating optimized, synthesizable SystemVerilog, along with testbenches and synthesis scripts. The tool provides immediate feedback through quantitative analysis (SNR, MSE) and realistic hardware resource estimates (LUTs, FFs, DSPs, etc.).

✨ Key Features
🤖 AI-Powered Optimization: Use natural language prompts to generate and refine DSP hardware designs. Ask for optimizations based on goals like minimizing latency, reducing resource usage, or maximizing throughput.

⛓️ Configurable DSP Chain: Build signal processing pipelines by chaining multiple DSP blocks (FIR, IIR, FFT, etc.).

📈 Interactive Visualizations: Instantly see the effects of your DSP chain on signals in both the time and frequency domains with interactive charts.

🔬 Quantitative Analysis: Objectively measure filter performance with key metrics like Signal-to-Noise Ratio (SNR), Mean Squared Error (MSE), and Power Spectral Density (PSD).

🎯 Hardware-Aware Metrics: Get realistic hardware cost estimations (LUTs, FFs, DSPs, BRAMs) tailored to specific FPGA families from vendors like Xilinx, Intel, Lattice, and more.

🔁 Hardware-in-the-Loop Simulation: Run "connectionless" hardware validation to get simulated post-synthesis metrics, then feed those results back to the AI for further optimization.

⚖️ Trade-off Analysis: Use the Bit-Width Analysis panel to instantly see how changing data and coefficient precision affects signal quality and hardware cost.

📊 Pareto Frontier Plots: Compare multiple optimization runs visually to understand the trade-offs between performance (e.g., SNR) and cost (e.g., LUTs).

🎤 Live Audio Input: For audio applications, use your microphone as a real-time signal source to see your DSP chain in action.

📑 Publication-Ready Exports:
CSV: Export raw signal data for external analysis.
Markdown Report: Generate a comprehensive report including your configuration, AI strategy, metrics, and generated HDL.
ZIP Project: Download a complete, self-contained project with the HDL module, testbench, synthesis script, and stimulus file.

🛠️ Technology Stack
Frontend: React, TypeScript, Tailwind CSS
AI Engine: Google Gemini API (@google/genai) for code generation, explanation, and metric estimation.
Charting: Recharts for interactive and responsive data visualization.
File Packaging: JSZip for creating downloadable project archives.

📁 Project Structure
The project is organized into a modular structure to separate concerns and enhance maintainability.

/
├── public/
├── src/
│   ├── components/       # Reusable React components (Charts, Panels, Icons, etc.)
│   │   ├── icons/        # SVG icon components
│   │   └── ...
│   ├── services/         # API communication layer
│   │   └── geminiService.ts # Logic for prompting and parsing Gemini API responses
│   ├── types/            # TypeScript type definitions
│   │   └── types.ts
│   ├── utils/            # Helper functions
│   │   ├── analysis.ts   # SNR, MSE, PSD, and other signal analysis functions
│   │   ├── dsp.ts        # Frontend DSP simulation functions (filtering, transforms)
│   │   ├── export.ts     # Logic for exporting data, reports, and projects
│   │   └── fixedPoint.ts # Fixed-point arithmetic simulation
│   ├── App.tsx           # Main application component, state management
│   └── index.tsx         # React application entry point
├── index.html            # Main HTML file with import maps
└── metadata.json         # Application metadata


🚀 Getting Started
To run this project locally, you will need Node.js and a package manager like npm or yarn.

Clone the repository:
git clone <repository-url>
cd <repository-directory>

Install dependencies:
npm install

Set up Environment Variables:
The application requires a Google Gemini API key. Create a .env file in the root of the project and add your key:
API_KEY=YOUR_GEMINI_API_KEY
The application is hardcoded to read this variable via process.env.API_KEY.

Run the development server:
npm run dev
This will start the application, typically on http://localhost:5173.


⚙️ How It Works
The application follows a streamlined workflow from concept to HDL insight.

Configure: The user selects a DSP block to optimize from the DSP Chain panel in the sidebar. They choose a representative input signal, a target FPGA family, and a clock frequency.
Optimize: The user describes their optimization goals in the chat panel. This prompt, along with the full system context (signal type, FPGA target, block settings, chat history), is sent to the Gemini API.
Generate & Parse: The geminiService.ts constructs a detailed prompt, instructing the model to return a JSON object that adheres to a strict schema. This ensures the response includes synthesizable SystemVerilog, a testbench, hardware metrics, coefficients, and an explanation.
Simulate & Analyze: The App.tsx component receives the AI-generated coefficients and runs a frontend simulation using the functions in utils/dsp.ts. The results are compared against the clean signal and a baseline filter using utils/analysis.ts to calculate SNR and MSE.
Visualize & Iterate: The results are displayed in the interactive charts and metrics panels. The user can then refine their design with follow-up prompts, run hardware emulation, analyze bit-width trade-offs, or compare different optimization runs.
Export: Once satisfied, the user can export the signal data, a full markdown report, or a complete, ready-to-synthesize ZIP file of the project.


📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
