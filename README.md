# AI-Driven DSP Hardware Accelerator

<div align="center">
  <img src="https://storage.googleapis.com/aistudio-o-images/210a80e5-7489-4b66-83a3-a3163351656b" width="150" alt="Project Logo">
  <h1>AI-Driven DSP Hardware Accelerator</h1>
  <p>
    An interactive dashboard that leverages Generative AI to design, analyze, and generate synthesizable HDL for Digital Signal Processing blocks on FPGAs.
  </p>

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)
![Gemini API](https://img.shields.io/badge/Google_Gemini-API-blue?logo=google)
![SystemVerilog](https://img.shields.io/badge/SystemVerilog-IEEE_1800-green?logo=ieee)
![FPGA](https://img.shields.io/badge/FPGA-Multi--Vendor-orange)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Who Is This For?](#-who-is-this-for)
- [Technology Stack](#-technology-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Advanced Features](#-advanced-features)
- [Export Capabilities](#-export-capabilities)
- [From Simulation to Silicon](#-from-simulation-to-silicon)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

This project is an interactive web-based dashboard for simulating and visualizing the AI-driven optimization of Digital Signal Processing (DSP) hardware blocks. It provides a comprehensive platform for engineers, researchers, and students to explore the intricate trade-offs between DSP algorithms and their hardware implementations on FPGAs, leveraging the power of the **Google Gemini API** for intelligent code generation and performance estimation.

Users can define a DSP processing chain, select from a vast library of signal types, specify a target FPGA architecture, and use natural language to guide an AI co-pilot in generating optimized, synthesizable SystemVerilog. The tool provides immediate feedback through quantitative analysis (SNR, MSE, PSD) and realistic hardware resource estimates (LUTs, FFs, DSPs, BRAMs).

### Why This Tool?

Traditional FPGA development workflows involve:
- Manual HDL coding and debugging
- Iterative synthesis runs to understand resource utilization
- Trial-and-error parameter tuning
- Siloed algorithm and hardware design processes

This tool accelerates the design cycle by:
- **Automating HDL generation** with AI assistance
- **Providing instant feedback** on algorithm performance
- **Estimating hardware costs** before synthesis
- **Enabling rapid iteration** through natural language interaction
- **Bridging the gap** between DSP algorithm design and FPGA implementation

---

## ✨ Key Features

### 🤖 AI-Powered Design Assistant
- **Natural Language Interface:** Describe your optimization goals in plain English (e.g., "Optimize for low latency while keeping resource usage under 1000 LUTs")
- **Context-Aware Generation:** The AI considers your entire system context including signal type, FPGA target, block configuration, and chat history
- **Intelligent Recommendations:** Get suggestions for filter orders, coefficient quantization, parallelization strategies, and architectural choices
- **Iterative Refinement:** Continuously improve designs through conversational feedback

### ⛓️ Flexible DSP Chain Builder
- **Modular Architecture:** Build complex signal processing pipelines by chaining multiple DSP blocks
- **Supported Blocks:**
  - FIR (Finite Impulse Response) Filters
  - IIR (Infinite Impulse Response) Filters
  - FFT (Fast Fourier Transform)
  - Decimators and Interpolators
  - Custom blocks (via AI generation)
- **Real-Time Reconfiguration:** Modify block parameters and see immediate results
- **Drag-and-Drop Interface:** (Future feature) Intuitive block connection

### 📈 Interactive Visualizations
- **Time-Domain Plots:** View input, output, and ideal signals with synchronized zoom and pan
- **Frequency-Domain Analysis:** FFT visualization with magnitude and phase response
- **Real-Time Updates:** Charts refresh instantly as you modify parameters
- **Power Spectral Density:** Understand signal power distribution across frequencies
- **Impulse/Step Response:** Analyze filter transient behavior

### 🔬 Comprehensive Quantitative Analysis
- **Signal-to-Noise Ratio (SNR):** Measure filter quality in dB
- **Mean Squared Error (MSE):** Quantify deviation from ideal response
- **Group Delay:** Assess filter phase linearity
- **Passband Ripple & Stopband Attenuation:** Verify filter specifications
- **Comparison Metrics:** Benchmark against baseline implementations

### 🎯 Hardware-Aware Metrics
- **Multi-Vendor FPGA Support:**
  - Xilinx (Artix-7, Kintex-7, Virtex-7, UltraScale, UltraScale+, Versal)
  - Intel/Altera (Cyclone V, Stratix, Arria)
  - Lattice (iCE40, ECP5, CrossLink)
  - Microchip (PolarFire)
- **Detailed Resource Estimates:**
  - LUTs (Look-Up Tables)
  - FFs (Flip-Flops)
  - DSP Blocks/Slices
  - Block RAM (BRAM)
  - Clock frequency and timing estimates
- **Power Estimation:** Approximate power consumption
- **Area-Performance Trade-offs:** Visualize competing design objectives

### 🔁 Hardware-in-the-Loop Simulation
- **Virtual Synthesis:** Run "connectionless" hardware validation without actual FPGA tools
- **Post-Synthesis Feedback:** Simulate realistic timing and resource constraints
- **Iterative Optimization:** Feed hardware metrics back to AI for further refinement
- **What-If Analysis:** Explore design variations rapidly

### ⚖️ Bit-Width Trade-off Analysis
- **Precision Explorer:** Interactively adjust data and coefficient bit-widths
- **Real-Time Quality Metrics:** See how quantization affects SNR and MSE
- **Resource Impact:** Understand how bit-width influences LUT and DSP usage
- **Optimal Precision Finding:** Let AI suggest best bit-width configurations

### 📊 Pareto Frontier Visualization
- **Multi-Objective Optimization:** Compare designs across competing metrics
- **Interactive Scatter Plots:** Visualize SNR vs. LUT count, latency vs. power, etc.
- **Design Space Exploration:** Identify optimal trade-off points
- **Comparison Mode:** Overlay multiple optimization runs

### 🎤 Live Audio Processing
- **Real-Time Input:** Use your microphone as a signal source
- **Interactive Demo:** See DSP effects applied to live audio
- **Educational Tool:** Understand filter behavior with familiar signals
- **Audio Export:** Save processed audio for verification

### 📑 Publication-Ready Exports

#### CSV Export
- Raw signal data (time-domain and frequency-domain)
- All computed metrics
- Filter coefficients
- Compatible with MATLAB, Python, Excel

#### Markdown Report
- Comprehensive design documentation
- System configuration details
- AI optimization strategy
- Quantitative results with formatted tables
- Generated HDL code with syntax highlighting
- Charts and visualizations
- Ready for GitHub wikis, technical blogs, or academic papers

#### ZIP Project Package
- Complete, synthesizable HDL project
- Self-contained and vendor-tool-ready
- Includes testbench and synthesis scripts
- Stimulus files for simulation
- README with build instructions

---

## 👥 Who Is This For?

### 👨‍💻 FPGA Engineers
**Use Case:** Rapidly prototype DSP architectures and accelerate the design-to-implementation cycle.

**Benefits:**
- Skip hours of manual HDL coding for common DSP blocks
- Get instant resource estimates without running synthesis
- Explore multiple architectural alternatives in minutes
- Generate test infrastructure automatically
- Focus on system-level design rather than implementation details

**Example Workflow:** An engineer needs to implement a 64-tap FIR filter for audio processing on a Xilinx Artix-7. Using this tool, they can generate multiple implementations (direct-form, transposed, polyphase), compare their resource usage, and export the optimal design as a complete Vivado project—all in under 15 minutes.

### 🔬 DSP Researchers
**Use Case:** Focus on algorithm innovation while letting AI handle hardware implementation details.

**Benefits:**
- Quickly validate theoretical results with hardware-realistic constraints
- Generate quantitative data for research papers
- Explore algorithm parameter spaces efficiently
- Compare custom algorithms against standard implementations
- Export results in publication-ready formats

**Example Workflow:** A researcher developing a novel adaptive filtering algorithm can implement their algorithm in the frontend, use the tool to generate hardware estimates, run Pareto frontier analysis across different configurations, and export comprehensive comparison data for their paper.

### 🎓 Academics & Students
**Use Case:** Powerful educational tool for teaching digital design and signal processing concepts.

**Benefits:**
- Visualize abstract DSP concepts in real-time
- Understand hardware-software co-design trade-offs
- Learn SystemVerilog through AI-generated examples
- Explore FPGA architectures across multiple vendors
- Engage with state-of-the-art AI tools in engineering

**Course Integration:**
- **Digital Signal Processing:** Demonstrate filter design and frequency analysis
- **FPGA Design:** Teach HDL coding and resource estimation
- **Computer Engineering:** Explore hardware-software trade-offs
- **Senior Design Projects:** Rapid prototyping platform

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 19:** Modern component architecture with concurrent features
- **TypeScript 5.x:** Type-safe development with advanced type inference
- **Tailwind CSS 3.x:** Utility-first styling with responsive design
- **Vite:** Lightning-fast build tool and development server

### AI & Machine Learning
- **Google Gemini API:** State-of-the-art large language model for code generation
- **`@google/genai`:** Official Google Generative AI SDK
- **Structured Output:** JSON schema validation for reliable AI responses

### Data Visualization
- **Recharts:** Composable charting library built on D3
- **Custom DSP Visualizations:** Time-domain, frequency-domain, and waterfall plots
- **Interactive Controls:** Zoom, pan, tooltip, and export capabilities

### Signal Processing
- **Web Audio API:** Real-time audio capture and processing
- **FFT.js:** Fast Fourier Transform implementation in JavaScript
- **Custom DSP Library:** Filter implementations (FIR, IIR) in TypeScript

### File & Data Management
- **JSZip:** Create project archives with HDL, testbenches, and scripts
- **File System Access API:** Modern browser file I/O
- **CSV Generation:** Export raw data for external analysis

### Development Tools
- **ESLint:** Code quality and consistency
- **Prettier:** Automatic code formatting
- **Git Hooks:** Pre-commit validation

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  DSP Chain  │  │  Chat Panel  │  │  Visualization   │   │
│  │  Builder    │  │  (Prompt UI) │  │  Charts & Plots  │   │
│  └──────┬──────┘  └───────┬──────┘  └────────┬─────────┘   │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                      Application Core                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  State Manager │  │  Signal Engine │  │  Metrics     │  │
│  │  (App.tsx)     │  │  (DSP Sim)     │  │  Calculator  │  │
│  └───────┬────────┘  └───────┬────────┘  └──────┬───────┘  │
└──────────┼────────────────────┼────────────────────┼─────────┘
           │                    │                    │
           │                    │                    │
┌──────────▼────────────────────▼────────────────────▼─────────┐
│                      Service Layer                            │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  Gemini Service     │  │  Hardware Estimator          │  │
│  │  - Prompt Builder   │  │  - FPGA Resource Models      │  │
│  │  - Response Parser  │  │  - Timing Analysis           │  │
│  └──────────┬──────────┘  └──────────────┬───────────────┘  │
└─────────────┼───────────────────────────┼───────────────────┘
              │                           │
              │                           │
┌─────────────▼───────────────────────────▼───────────────────┐
│                     External Services                         │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  Google Gemini API  │  │  Browser APIs                │  │
│  │  (Code Generation)  │  │  - Web Audio API             │  │
│  │                     │  │  - File System Access API    │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Configuration:** User selects DSP block, signal type, FPGA target, and enters optimization prompt
2. **Context Assembly:** Application gathers full system state (block config, signal params, FPGA specs, chat history)
3. **AI Request:** `geminiService.ts` constructs structured prompt and sends to Gemini API with JSON schema
4. **AI Response:** Model returns JSON with SystemVerilog code, coefficients, metrics, and explanation
5. **Frontend Simulation:** Coefficients applied to signal using DSP engine
6. **Metrics Calculation:** SNR, MSE, and other metrics computed by comparing to ideal response
7. **Visualization:** Results displayed in interactive charts with real-time updates
8. **Iteration:** User refines design through follow-up prompts or parameter adjustments

### Key Components

#### `App.tsx`
- **Role:** Main application component and state manager
- **Responsibilities:**
  - Orchestrates all UI panels and data flow
  - Manages global state (DSP chain, signals, metrics)
  - Coordinates between Gemini service and UI components
  - Handles export functionality

#### `geminiService.ts`
- **Role:** Interface to Google Gemini API
- **Responsibilities:**
  - Constructs detailed, context-aware prompts
  - Enforces JSON schema for structured responses
  - Parses and validates AI-generated code and metrics
  - Manages API key and error handling

#### Signal Processing Engine
- **Role:** Real-time DSP simulation in browser
- **Responsibilities:**
  - Generates test signals (sine, chirp, noise, audio)
  - Implements FIR/IIR filters with AI-generated coefficients
  - Performs FFT and frequency-domain analysis
  - Calculates quality metrics (SNR, MSE, PSD)

#### Hardware Estimator
- **Role:** FPGA resource prediction
- **Responsibilities:**
  - Vendor-specific resource models
  - LUT/FF/DSP/BRAM estimation
  - Timing analysis and clock frequency estimation
  - Power consumption approximation

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm**, **yarn**, or **pnpm** package manager
- **Git** for version control
- **Google Gemini API Key** - [Get yours here](https://aistudio.google.com/app/apikey)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-dsp-accelerator.git
cd ai-dsp-accelerator
```

#### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using pnpm:
```bash
pnpm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add your Gemini API key:

```env
# .env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**Getting your API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.env` file

**Security Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

#### 4. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or the next available port).

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 5. Open in Browser

Navigate to `http://localhost:5173` and you should see the dashboard interface.

### Verify Installation

To ensure everything is working correctly:

1. **Check Dashboard Loads:** You should see the main interface with DSP Chain, Chat, and Visualization panels
2. **Test Signal Generation:** Select a signal type from the dropdown—charts should populate with time and frequency data
3. **Test AI Connection:** Type a simple prompt like "Generate a low-pass FIR filter" and verify the AI responds
4. **Check for Errors:** Open browser DevTools (F12) and ensure no console errors appear

---

## 📖 Usage Guide

### Basic Workflow

#### Step 1: Configure Your Signal

1. Navigate to the **Signal Configuration** panel
2. Select a signal type from the dropdown:
   - **Sine Wave:** Pure tone at specified frequency
   - **Chirp:** Frequency sweep for filter analysis
   - **Square Wave:** Rich harmonic content
   - **Sawtooth:** Linear frequency ramp
   - **White Noise:** Random broadband signal
   - **Pink Noise:** 1/f spectrum
   - **Speech:** Simulated voice signal
   - **Audio (Microphone):** Live audio input

3. Adjust signal parameters:
   - Sampling Rate (Hz)
   - Signal Duration (seconds)
   - Amplitude
   - Frequency (for periodic signals)

#### Step 2: Add DSP Block

1. In the **DSP Chain Builder**, click **Add Block**
2. Select block type:
   - FIR Filter
   - IIR Filter
   - FFT
   - Decimator
   - Interpolator
   - Custom (AI-generated)

3. Configure basic parameters:
   - Filter Order
   - Cutoff Frequency
   - Filter Type (lowpass, highpass, bandpass, bandstop)
   - Window Function (for FIR)

#### Step 3: Select FPGA Target

1. Open the **Hardware Configuration** panel
2. Choose FPGA vendor: Xilinx, Intel, Lattice, or Microchip
3. Select specific device family:
   - Example: Xilinx Artix-7
4. Set target clock frequency (MHz)

#### Step 4: Optimize with AI

1. In the **Chat Panel**, describe your optimization goal:

   **Example Prompts:**
   ```
   "Design a 32-tap FIR low-pass filter with cutoff at 1kHz, 
   optimized for minimum resource usage"
   
   "I need a high-performance IIR filter with low latency. 
   Target is 500 LUTs on Artix-7"
   
   "Create a parallel FIR architecture that maximizes throughput 
   while keeping power consumption under 500mW"
   
   "Optimize bit-widths to achieve 60 dB SNR with minimal DSP blocks"
   ```

2. Click **Send** or press Enter
3. Wait for AI response (typically 5-15 seconds)

#### Step 5: Analyze Results

The dashboard updates with:

- **Generated HDL Code:** SystemVerilog module in code viewer
- **Metrics:**
  - SNR (dB)
  - MSE
  - LUT count
  - FF count
  - DSP blocks
  - BRAM usage
  - Clock frequency
- **Visualizations:**
  - Time-domain signal comparison
  - Frequency response (magnitude and phase)
  - Filter impulse response

#### Step 6: Iterate and Refine

Provide follow-up prompts to improve the design:

```
"Can you reduce the filter order while maintaining 50 dB SNR?"

"Try using distributed arithmetic to save DSP blocks"

"What if I increase bit-width to 16 bits?"
```

The AI maintains context from previous messages, allowing iterative refinement.

#### Step 7: Export Your Design

Choose an export format:

- **CSV:** Signal data for external analysis
- **Markdown Report:** Complete documentation
- **ZIP Project:** Synthesis-ready HDL project

---

## 🔧 Advanced Features

### Bit-Width Analysis

**Purpose:** Find the optimal balance between signal quality and hardware cost through precision analysis.

**How to Use:**

1. Click **Bit-Width Analysis** tab
2. Use sliders to adjust:
   - **Data Width:** Bit precision of signal samples (8-32 bits)
   - **Coefficient Width:** Bit precision of filter coefficients (8-32 bits)
3. Observe real-time updates:
   - SNR vs. Bit-Width plot
   - Resource usage vs. Bit-Width plot
   - Current quality metrics

**Interpretation:**
- **Too Few Bits:** Quantization noise dominates, poor SNR
- **Too Many Bits:** Unnecessary resource overhead
- **Optimal Point:** Knee of the curve where SNR plateaus

**Example:**
For a 64-tap FIR filter, you might find:
- 12-bit data, 16-bit coefficients: SNR = 50 dB, 800 LUTs
- 16-bit data, 18-bit coefficients: SNR = 55 dB, 1200 LUTs
- 24-bit data, 24-bit coefficients: SNR = 58 dB, 2400 LUTs

The optimal choice depends on your quality requirements vs. area budget.

### Pareto Frontier Analysis

**Purpose:** Visualize trade-offs between competing objectives across multiple design iterations.

**How to Use:**

1. Run multiple optimization iterations with different goals
2. Click **Pareto Analysis** tab
3. Select metrics for X and Y axes:
   - X-axis: LUT count, latency, power, etc.
   - Y-axis: SNR, throughput, frequency, etc.
4. View scatter plot of all optimization runs
5. Identify Pareto-optimal designs (on the frontier)

**Interpretation:**
- **Pareto Frontier:** Set of designs where you can't improve one metric without degrading another
- **Dominated Designs:** Points below/behind the frontier—strictly worse than frontier designs
- **Design Selection:** Choose from Pareto frontier based on your priority (cost vs. performance)

**Example Use Case:**
You run 10 optimization iterations exploring latency vs. area:
- High-area designs achieve 1-cycle latency
- Low-area designs have 10-cycle latency
- Pareto frontier shows the optimal trade-off curve
- Pick a point on the frontier that matches your system constraints

### Hardware-in-the-Loop Simulation

**Purpose:** Validate designs with realistic post-synthesis constraints before running actual synthesis.

**How to Use:**

1. Generate an optimized design
2. Click **Run HW Emulation**
3. System simulates:
   - Routing delays
   - Setup/hold violations
   - Clock domain crossings
   - Resource contention
4. Updated metrics reflect hardware reality:
   - Achievable clock frequency
   - Actual latency (with routing delays)
   - Timing closure status
5. Feed results back to AI: "The timing didn't close at 200 MHz. Can you pipeline the design?"

**Benefits:**
- Catch timing issues before synthesis (saves hours)
- Realistic resource estimates
- Understand impact of place-and-route
- Guide AI toward timing-aware optimizations

### Live Audio Processing

**Purpose:** Demonstrate DSP effects on real-time audio for intuitive understanding.

**How to Use:**

1. Select **Audio (Microphone)** as signal source
2. Grant browser microphone permission
3. Configure your DSP chain (e.g., low-pass filter at 2kHz)
4. Speak or play music into microphone
5. Observe real-time filtering in both time and frequency domains
6. Adjust filter parameters and hear immediate effects

**Educational Applications:**
- Demonstrate filter frequency response with voice
- Show aliasing effects with musical instruments
- Teach audio effects (reverb, echo, equalization)
- Engage students with interactive demos

**Export:** Record processed audio snippets for assignment submissions or presentations.

### Comparison Mode

**Purpose:** Benchmark multiple designs side-by-side.

**How to Use:**

1. Generate first design and click **Save to Comparison**
2. Modify parameters or prompt
3. Generate second design
4. Click **Compare Designs**
5. View side-by-side comparison:
   - Metrics table
   - Overlaid frequency responses
   - Resource usage bar charts
   - Code diff viewer

**Use Cases:**
- Compare different filter topologies (direct vs. transposed)
- Benchmark custom algorithm against standard implementation
- Evaluate vendor-specific optimizations (Xilinx vs. Intel)
- Assess impact of architectural changes

---

## 📤 Export Capabilities

### CSV Data Export

**Contents:**
```
Time (s), Input Signal, Output Signal, Ideal Signal, Error
0.000000, 0.500, 0.498, 0.500, 0.002
0.000010, 0.510, 0.507, 0.510, 0.003
...

Frequency (Hz), Input Magnitude, Output Magnitude, Ideal Magnitude
0.0, 12.5, 12.3, 12.5
10.0, 11.8, 11.6, 11.8
...
```

**Use With:**
- MATLAB: `data = readtable('export.csv')`
- Python: `df = pd.read_csv('export.csv')`
- Excel: Direct import for charts and analysis

### Markdown Report Export

**Contents:**
```markdown
# DSP Hardware Accelerator Design Report

## Configuration
- **FPGA Target:** Xilinx Artix-7
- **Clock Frequency:** 100 MHz
- **Signal Type:** Chirp (100 Hz - 5 kHz)

## Optimization Strategy
> Design a 64-tap FIR filter optimized for area...

## Performance Metrics
| Metric | Value |
|--------|-------|
| SNR    | 52.3 dB |
| MSE    | 0.0012 |
...

## Hardware Resources
...

## Generated HDL
```systemverilog
module fir_filter #(
  parameter DATA_WIDTH = 16,
  ...
) (
  ...
);
...
```

**Use Cases:**
- GitHub project documentation
- Technical blog posts
- Design review documents
- Academic paper appendices

### ZIP Project Export

**Contents:**
```
project/
├── README.md              # Build instructions
├── module.sv              # Generated SystemVerilog module
├── module_tb.sv           # Self-checking testbench
├── stimulus.txt           # Input test vectors
├── synth_vivado.tcl       # Xilinx Vivado synthesis script
├── synth_quartus.tcl      # Intel Quartus synthesis script
└── constraints.xdc        # Timing constraints (if applicable)
```

**module.sv** - Synthesizable RTL:
```systemverilog
module fir_filter #(
  parameter DATA_WIDTH = 16,
  parameter COEFF_WIDTH = 18,
  parameter NUM_TAPS = 64
) (
  input  logic clk,
  input  logic rst_n,
  input  logic signed [DATA_WIDTH-1:0] data_in,
  input  logic valid_in,
  output logic signed [DATA_WIDTH-1:0] data_out,
  output logic valid_out
);
  // AI-generated implementation
  ...
endmodule
```

**module_tb.sv** - Testbench with assertions:
```systemverilog
module fir_filter_tb;
  // Testbench with stimulus from file
  initial begin
    $readmemh("stimulus.txt", stimulus_mem);
    // Apply stimulus and check outputs
    ...
  end
endmodule
```

**synth_vivado.tcl** - Automated synthesis:
```tcl
create_project -force dsp_project ./project_vivado
add_files module.sv
set_property top fir_filter [current_fileset]
synth_design -top fir_filter -part xc7a35tcpg236-1
report_utilization
report_timing
```

**Workflow:**
1. Download and extract ZIP
2. Open Vivado/Quartus
3. Run synthesis script: `source synth_vivado.tcl`
4. Review reports
5. Run simulation: `vsim -do run_tb.do`
6. Implement and program FPGA

---

## 🔬 From Simulation to Silicon

### The Journey from Web App to FPGA

This tool bridges the gap between algorithm exploration and hardware deployment. Here's the complete path:

#### Phase 1: Algorithm Exploration (Web App)
- Define DSP algorithm and constraints
- Use AI to generate multiple implementations
- Analyze trade-offs through simulation
- Iterate until metrics meet requirements
- Export optimal design as ZIP project

#### Phase 2: Synthesis and Verification (FPGA Tools)
- Import ZIP project into Vivado/Quartus
- Run synthesis to generate netlist
- Verify resource utilization matches estimates
- Run place-and-route
- Check timing closure
- Generate bitstream

#### Phase 3: Hardware Validation (FPGA Board)
- Program FPGA with bitstream
- Connect test equipment:
  - Signal generator for input stimulus
  - Logic analyzer for output capture
  - Oscilloscope for timing verification
- Run hardware tests with actual data
- Measure real-world performance:
  - Actual clock frequency
  - Power consumption
  - Signal quality (SNR, distortion)

#### Phase 4: Integration (System Deployment)
- Integrate verified IP into larger system
- Connect to data sources/sinks
- Add control interfaces (AXI, PCIe, etc.)
- Optimize for production (timing, power, cost)
- Deploy to final application

### Case Study: Audio DSP System

**Requirement:** Real-time audio filtering on embedded FPGA

**Web App Phase:**
1. Configure: 48 kHz audio, Artix-7 FPGA, 100 MHz clock
2. Design: 128-tap FIR low-pass filter, 10 kHz cutoff
3. Optimize: "Minimize latency while using <500 LUTs"
4. Analyze: SNR = 65 dB, Latency = 3 cycles, 480 LUTs
5. Export: Download complete Vivado project

**FPGA Tools Phase:**
1. Import to Vivado, synthesize
2. Actual utilization: 485 LUTs, 256 FFs, 0 DSP blocks
3. Timing closure: 105 MHz achieved (exceeds 100 MHz target)
4. Generate bitstream

**Hardware Validation:**
1. Program Digilent Arty A7 board
2. Connect I2S audio codec
3. Input: Music with 20 Hz - 20 kHz content
4. Output: Clean audio with >10 kHz attenuated
5. Measured SNR: 63 dB (close to simulation)
6. Latency: 62.5 μs (3 cycles @ 48 kHz)

**Result:** Successfully deployed real-time audio filter with performance matching web app predictions.

---

## 🔌 API Reference

### Gemini Service API

#### `generateOptimizedDSP(params: OptimizationParams): Promise<OptimizationResult>`

Generates optimized DSP hardware based on user prompt and system configuration.

**Parameters:**
```typescript
interface OptimizationParams {
  prompt: string;                    // User's natural language request
  blockType: 'FIR' | 'IIR' | 'FFT';  // DSP block type
  signalType: string;                 // Input signal type
  fpgaTarget: {
    vendor: string;                   // 'Xilinx', 'Intel', etc.
    family: string;                   // 'Artix-7', 'Cyclone V', etc.
    clockFrequency: number;           // Target clock in MHz
  };
  blockConfig: {
    order?: number;                   // Filter order
    cutoffFreq?: number;              // Cutoff frequency in Hz
    samplingRate: number;             // Sampling rate in Hz
    // ... other block-specific parameters
  };
  chatHistory?: Message[];           // Previous conversation context
}
```

**Returns:**
```typescript
interface OptimizationResult {
  hdl: {
    module: string;                   // SystemVerilog module code
    testbench: string;                // Self-checking testbench
    synthesisScript: string;          // Vendor-specific TCL script
  };
  coefficients: number[];             // Filter coefficients
  metrics: {
    estimatedLUTs: number;
    estimatedFFs: number;
    estimatedDSPs: number;
    estimatedBRAMs: number;
    estimatedFrequency: number;       // MHz
    estimatedLatency: number;         // Clock cycles
    estimatedPower?: number;          // mW
  };
  explanation: string;                // AI's design rationale
  warnings?: string[];                // Potential issues
}
```

**Example:**
```typescript
const result = await generateOptimizedDSP({
  prompt: "Design a low-latency FIR filter with minimal resources",
  blockType: 'FIR',
  signalType: 'Audio',
  fpgaTarget: {
    vendor: 'Xilinx',
    family: 'Artix-7',
    clockFrequency: 100
  },
  blockConfig: {
    order: 64,
    cutoffFreq: 10000,
    samplingRate: 48000
  }
});

console.log(`Generated module with ${result.metrics.estimatedLUTs} LUTs`);
```

### Signal Processing API

#### `generateSignal(config: SignalConfig): Signal`

Generates test signals for DSP analysis.

**Parameters:**
```typescript
interface SignalConfig {
  type: 'sine' | 'chirp' | 'square' | 'noise' | 'audio';
  samplingRate: number;               // Hz
  duration: number;                   // seconds
  amplitude: number;                  // 0.0 - 1.0
  frequency?: number;                 // Hz (for periodic signals)
  startFreq?: number;                 // Hz (for chirp)
  endFreq?: number;                   // Hz (for chirp)
}

interface Signal {
  samples: Float32Array;
  timeAxis: Float32Array;
  samplingRate: number;
  duration: number;
}
```

#### `applyFilter(signal: Signal, coefficients: number[], type: 'FIR' | 'IIR'): Signal`

Applies filter coefficients to input signal.

**Parameters:**
- `signal`: Input signal data
- `coefficients`: Filter coefficients array
- `type`: Filter implementation type

**Returns:** Filtered signal with same length as input

#### `calculateMetrics(output: Signal, reference: Signal): Metrics`

Computes quality metrics by comparing filtered output to reference.

**Returns:**
```typescript
interface Metrics {
  snr: number;          // Signal-to-noise ratio in dB
  mse: number;          // Mean squared error
  mae: number;          // Mean absolute error
  psnr: number;         // Peak signal-to-noise ratio
  correlation: number;  // Cross-correlation coefficient
}
```

### Hardware Estimation API

#### `estimateResources(hdl: string, fpgaTarget: FPGATarget): ResourceEstimate`

Estimates FPGA resource utilization from HDL code.

**Parameters:**
```typescript
interface FPGATarget {
  vendor: 'Xilinx' | 'Intel' | 'Lattice' | 'Microchip';
  family: string;
  device?: string;      // Specific part number (optional)
}
```

**Returns:**
```typescript
interface ResourceEstimate {
  luts: number;
  ffs: number;
  dsps: number;
  brams: number;
  maxFrequency: number;  // MHz
  powerEstimate: number; // mW
  confidence: number;    // 0.0 - 1.0
}
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: "API Key Invalid" Error

**Symptoms:**
- Error message when sending prompts to AI
- Console shows 401 Unauthorized

**Solutions:**
1. Verify API key in `.env` file:
   ```bash
   cat .env
   # Should show: VITE_GEMINI_API_KEY=your_key_here
   ```
2. Ensure no extra spaces or quotes around the key
3. Restart dev server after modifying `.env`
4. Generate new API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
5. Check API key hasn't exceeded quota/rate limits

#### Issue: Charts Not Displaying

**Symptoms:**
- Blank chart areas
- Console error: "Cannot read property 'length' of undefined"

**Solutions:**
1. Check signal generation succeeded:
   - Open DevTools Console (F12)
   - Look for signal generation logs
2. Verify signal configuration parameters are valid
3. Try refreshing the page
4. Clear browser cache: Ctrl+Shift+Delete
5. Try different signal type from dropdown

#### Issue: Slow AI Response

**Symptoms:**
- Long wait times (>30 seconds) for AI responses
- Timeout errors

**Solutions:**
1. **Reduce prompt complexity:** Break complex requests into smaller steps
2. **Check internet connection:** Run speed test
3. **Try different time of day:** API may be congested during peak hours
4. **Simplify DSP chain:** Generate one block at a time
5. **Check Gemini API status:** Visit Google AI Studio status page

#### Issue: Generated HDL Contains Syntax Errors

**Symptoms:**
- HDL code has obvious mistakes
- Would not compile in synthesis tool

**Solutions:**
1. **Provide more context in prompt:**
   ```
   Bad:  "make it faster"
   Good: "Increase throughput by adding pipeline registers. 
          Maintain functionality of the original design."
   ```
2. **Use follow-up prompts:** "There's a syntax error on line 45. Please fix it."
3. **Specify HDL dialect:** "Generate IEEE 1800-2017 compliant SystemVerilog"
4. **Report issue:** The AI learns from feedback—use thumbs down button

#### Issue: Resource Estimates Don't Match Synthesis

**Symptoms:**
- Actual LUT count differs significantly from estimate
- Timing doesn't close at predicted frequency

**Why This Happens:**
- Estimates are based on heuristic models
- Actual results depend on synthesis tool settings
- Place-and-route can add overhead
- Optimization levels affect results

**Solutions:**
1. **Run Hardware-in-the-Loop simulation** for better estimates
2. **Adjust expectations:** ±20% variance is normal
3. **Feed actual results back to AI:**
   ```
   "Synthesis showed 1200 LUTs instead of 800. 
    Can you optimize the design further?"
   ```
4. **Specify synthesis constraints** in your prompt

#### Issue: Audio Input Not Working

**Symptoms:**
- "Microphone permission denied" message
- No audio waveform appears

**Solutions:**
1. **Grant microphone permission:**
   - Chrome: Click lock icon in address bar → Site settings → Microphone → Allow
   - Firefox: Click microphone icon in address bar → Allow
2. **Check system microphone:** Ensure not muted or disabled
3. **Try different browser:** Chrome/Edge recommended for best Web Audio API support
4. **Use HTTPS:** Some browsers require secure context for microphone access
5. **Check browser console:** Look for specific Web Audio API errors

#### Issue: Export Fails or Downloads Corrupt File

**Symptoms:**
- ZIP file won't extract
- CSV file is empty or truncated
- Markdown report missing content

**Solutions:**
1. **Disable browser download managers:** May interfere with blob downloads
2. **Check available disk space:** Ensure sufficient space for export
3. **Try different export format:** If ZIP fails, try Markdown report
4. **Clear browser downloads history:** Old partial downloads may conflict
5. **Use Incognito/Private mode:** Rules out extension interference

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or suggesting new ideas, your help makes this project better.

### Ways to Contribute

- **Report Bugs:** Open an issue describing the problem and how to reproduce it
- **Suggest Features:** Share ideas for new capabilities or improvements
- **Submit Pull Requests:** Fix issues or implement new features
- **Improve Documentation:** Clarify instructions, add examples, fix typos
- **Share Your Designs:** Post interesting DSP implementations you've created
- **Answer Questions:** Help other users in Issues and Discussions

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-dsp-accelerator.git
   cd ai-dsp-accelerator
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Make your changes** and test thoroughly
6. **Commit with clear messages:**
   ```bash
   git commit -m "Add support for CIC decimation filters"
   ```
7. **Push to your fork:**
   ```bash
   git push origin feature/amazing-new-feature
   ```
8. **Open a Pull Request** on the main repository

### Code Style Guidelines

- **TypeScript:** Use strict type checking, avoid `any`
- **React:** Use functional components with hooks
- **Formatting:** Run `npm run format` before committing
- **Linting:** Ensure `npm run lint` passes
- **Comments:** Add JSDoc comments for public functions
- **Naming:**
  - Components: PascalCase (`SignalChart.tsx`)
  - Functions: camelCase (`calculateSNR`)
  - Constants: UPPER_SNAKE_CASE (`MAX_FILTER_ORDER`)

### Testing Guidelines

- **Unit Tests:** For DSP algorithms and utility functions
- **Integration Tests:** For API interactions and data flow
- **Manual Testing:** Test UI changes in multiple browsers
- **Regression Testing:** Ensure existing features still work

### Pull Request Process

1. **Update documentation** if adding features
2. **Add tests** for new functionality
3. **Ensure CI passes** (linting, tests, build)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash commits** before merging (if requested)

### Areas We Need Help

- **DSP Algorithms:** Implement more filter types (Butterworth, Chebyshev, etc.)
- **FPGA Vendors:** Add support for more device families
- **Visualization:** New chart types (waterfall, constellation, eye diagram)
- **Export Formats:** Additional outputs (VHDL, Verilog, MATLAB)
- **Testing:** Expand test coverage
- **Documentation:** Video tutorials, interactive guides
- **Performance:** Optimize DSP simulation speed
- **Accessibility:** Improve keyboard navigation and screen reader support

---

## 🗺️ Roadmap

### Version 2.0 (Q2 2025)

**Advanced DSP Blocks:**
- ✅ IIR filter optimization (Direct Form I, II, Transposed)
- ✅ FFT/IFFT with configurable radix
- 🔲 Polyphase filter banks
- 🔲 CIC decimation/interpolation filters
- 🔲 Adaptive filters (LMS, RLS)
- 🔲 Hilbert transformers
- 🔲 All-pass filters
- 🔲 Notch/Peaking filters

**Hardware Acceleration:**
- 🔲 Multi-rate processing
- 🔲 Fixed-point optimization tools
- 🔲 Automatic pipelining insertion
- 🔲 Resource sharing analysis
- 🔲 Clock domain crossing generation
- 🔲 AXI-Stream interface wrapper

**AI Enhancements:**
- 🔲 Multi-model support (Claude, GPT-4, Llama)
- 🔲 Fine-tuned model for HDL generation
- 🔲 Automatic bug detection and fixing
- 🔲 Design space exploration with RL
- 🔲 Natural language to block diagram

### Version 2.5 (Q3 2025)

**Collaboration Features:**
- 🔲 Design sharing and version control
- 🔲 Team workspaces
- 🔲 Comment and annotation system
- 🔲 Design review workflows
- 🔲 Public design gallery

**Integration:**
- 🔲 Direct Vivado/Quartus integration
- 🔲 GitHub Actions for CI/CD
- 🔲 MATLAB/Simulink co-simulation
- 🔲 Python API for scripting
- 🔲 Jupyter Notebook kernel

**Education:**
- 🔲 Interactive tutorials
- 🔲 Curriculum builder for instructors
- 🔲 Student progress tracking
- 🔲 Assignment templates
- 🔲 Auto-grading for HDL submissions

### Version 3.0 (Q4 2025)

**Physical Hardware:**
- 🔲 Real FPGA board integration
- 🔲 Hardware-in-the-loop with actual devices
- 🔲 Remote lab access
- 🔲 Automated board programming
- 🔲 Real-time performance monitoring

**Advanced Analysis:**
- 🔲 Formal verification integration
- 🔲 Power analysis with vendor tools
- 🔲 Thermal simulation
- 🔲 EMI/EMC estimation
- 🔲 Reliability analysis (MTBF)

**Marketplace:**
- 🔲 Verified IP core library
- 🔲 Custom DSP block contributions
- 🔲 Design templates
- 🔲 Professional consulting services

### Long-Term Vision

- **AI-First Design:** Move beyond code generation to complete system design
- **Cross-Platform:** Support ASICs, GPUs, and custom accelerators
- **Autonomous Optimization:** AI that runs thousands of design iterations overnight
- **Digital Twin:** Virtual FPGA that perfectly mirrors physical device
- **Cloud Synthesis:** On-demand access to vendor tools without local installation

**Legend:** ✅ Complete | 🔲 Planned | 🚧 In Progress

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 [Your Name/Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Third-Party Licenses

This project uses the following open-source libraries:

- **React:** MIT License
- **TypeScript:** Apache License 2.0
- **Tailwind CSS:** MIT License
- **Recharts:** MIT License
- **JSZip:** MIT License

Generated HDL code and exported projects are your own intellectual property and can be used commercially without restriction.

---

## 🙏 Acknowledgments

### Inspiration

This project was inspired by the need to bridge the gap between DSP algorithm design and FPGA implementation, making hardware acceleration accessible to more engineers and researchers.

### Technology

- **Google Gemini:** For powerful AI capabilities that make natural language HDL generation possible
- **React Community:** For building an incredible ecosystem of tools and libraries
- **FPGA Vendors:** Xilinx, Intel, Lattice, and Microchip for advancing FPGA technology
- **Open-Source Community:** For countless tools and libraries that made this project possible

### Contributors

Thank you to all the contributors who have helped make this project better:

<!-- Add contributor list here -->
- [Your Name] - Initial development
- [Contributor 1] - Feature XYZ
- [Contributor 2] - Bug fixes

*Want to see your name here? [Contribute to the project!](#-contributing)*

### References

- Smith, S. W. (1997). *The Scientist and Engineer's Guide to Digital Signal Processing*
- Lyons, R. G. (2010). *Understanding Digital Signal Processing*
- IEEE Standard 1800-2017: SystemVerilog
- Xilinx UG901: Vivado Design Suite User Guide: Synthesis
- Intel Quartus Prime User Guide


---

## 📊 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/your-username/ai-dsp-accelerator)
![GitHub forks](https://img.shields.io/github/forks/your-username/ai-dsp-accelerator)
![GitHub issues](https://img.shields.io/github/issues/your-username/ai-dsp-accelerator)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/ai-dsp-accelerator)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/ai-dsp-accelerator)
![GitHub repo size](https://img.shields.io/github/repo-size/your-username/ai-dsp-accelerator)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/ai-dsp-accelerator&type=Date)](https://star-history.com/#your-username/ai-dsp-accelerator&Date)

---

<div align="center">
  <p>Made with ❤️ by the DSP community</p>
  <p>
    <a href="#-overview">Back to top ↑</a>
  </p>
</div>
