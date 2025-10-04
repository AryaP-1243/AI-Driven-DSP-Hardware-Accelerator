# AI-Driven DSP Hardware Accelerator

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)
![Gemini API](https://img.shields.io/badge/Google_Gemini-API-blue?logo=google)
![SystemVerilog](https://img.shields.io/badge/SystemVerilog-IEEE_1800-green?logo=ieee)
![FPGA](https://img.shields.io/badge/FPGA-Multi--Vendor-orange)

---

This project is an interactive web-based dashboard for simulating and visualizing the AI-driven optimization of Digital Signal Processing (DSP) hardware blocks. It provides a platform for engineers, researchers, and students to explore the trade-offs between DSP algorithms and their hardware implementations on FPGAs, leveraging the power of the Google Gemini API for code generation and performance estimation.

Users can define a DSP processing chain, select from a vast library of signal types, specify a target FPGA architecture, and use natural language to guide an AI co-pilot in generating optimized, synthesizable SystemVerilog, along with testbenches and synthesis scripts. The tool provides immediate feedback through quantitative analysis (SNR, MSE) and realistic hardware resource estimates (LUTs, FFs, DSPs, etc.).

---

## ✨ Key Features

*   **🤖 AI-Powered Optimization:** Use natural language prompts to generate and refine DSP hardware designs. Ask for optimizations based on goals like minimizing latency, reducing resource usage, or maximizing throughput.
*   **⛓️ Configurable DSP Chain:** Build signal processing pipelines by chaining multiple DSP blocks (FIR, IIR, FFT, etc.).
*   **📈 Interactive Visualizations:** Instantly see the effects of your DSP chain on signals in both the time and frequency domains with interactive charts.
*   **🔬 Quantitative Analysis:** Objectively measure filter performance with key metrics like Signal-to-Noise Ratio (SNR), Mean Squared Error (MSE), and Power Spectral Density (PSD).
*   **🎯 Hardware-Aware Metrics:** Get realistic hardware cost estimations (LUTs, FFs, DSPs, BRAMs) tailored to specific FPGA families from vendors like Xilinx, Intel, Lattice, and more.
*   **🔁 Hardware-in-the-Loop Simulation:** Run "connectionless" hardware validation to get simulated post-synthesis metrics, then feed those results back to the AI for further optimization.
*   **⚖️ Trade-off Analysis:** Use the Bit-Width Analysis panel to instantly see how changing data and coefficient precision affects signal quality and hardware cost.
*   **📊 Pareto Frontier Plots:** Compare multiple optimization runs visually to understand the trade-offs between performance (e.g., SNR) and cost (e.g., LUTs).
*   **🎤 Live Audio Input:** For audio applications, use your microphone as a real-time signal source to see your DSP chain in action.
*   **📑 Publication-Ready Exports:**
    *   **CSV:** Export raw signal data for external analysis.
    *   **Markdown Report:** Generate a comprehensive report including your configuration, AI strategy, metrics, and generated HDL.
    *   **ZIP Project:** Download a complete, self-contained project with the HDL module, testbench, synthesis script, and stimulus file.

---

## ⚙️ How It Works

The application follows a streamlined workflow from concept to HDL insight.

1.  **Configure:** The user selects a DSP block to optimize from the DSP Chain panel in the sidebar. They choose a representative input signal, a target FPGA family, and a clock frequency.
2.  **Optimize:** The user describes their optimization goals in the chat panel. This prompt, along with the full system context (signal type, FPGA target, block settings, chat history), is sent to the Gemini API.
3.  **Generate & Parse:** The `geminiService.ts` constructs a detailed prompt, instructing the model to return a JSON object that adheres to a strict schema. This ensures the response includes synthesizable SystemVerilog, a testbench, hardware metrics, coefficients, and an explanation.
4.  **Simulate & Analyze:** The `App.tsx` component receives the AI-generated coefficients and runs a frontend simulation using the functions in `utils/dsp.ts`. The results are compared against the clean signal and a baseline filter using `utils/analysis.ts` to calculate SNR and MSE.
5.  **Visualize & Iterate:** The results are displayed in the interactive charts and metrics panels. The user can then refine their design with follow-up prompts, run hardware emulation, analyze bit-width trade-offs, or compare different optimization runs.
6.  **Export:** Once satisfied, the user can export the signal data, a full markdown report, or a complete, ready-to-synthesize ZIP file of the project.

---

## 🛠️ Technology Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI Engine:** Google Gemini API (`@google/genai`) for code generation, explanation, and metric estimation.
*   **Charting:** Recharts for interactive and responsive data visualization.
*   **File Packaging:** JSZip for creating downloadable project archives.

---

## 🔧 Getting Started & Local Development

To run this project on your local machine, follow these steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/ai-dsp-accelerator.git
    cd ai-dsp-accelerator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up your Gemini API Key:**
    *   Create a file named `.env` in the root of the project.
    *   Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Add your API key to the `.env` file:
        ```
        API_KEY=YOUR_GEMINI_API_KEY
        ```
    *The application is configured to load this environment variable automatically.*

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should now be running at `http://localhost:5173`.

---

## 🔬 From Simulation to Silicon

While the web app provides a powerful simulation environment, its ultimate goal is to generate real-world hardware. The **Download Project (.zip)** feature is the bridge between simulation and silicon.

The generated ZIP archive contains a complete, self-contained, and synthesizable project, including:
*   **`module.sv`**: The AI-optimized SystemVerilog module.
*   **`module_tb.sv`**: A self-checking testbench.
*   **`stimulus.txt`**: The input data used by the testbench.
*   **`synth.tcl`**: A synthesis script for Vivado or Quartus.

This project can be directly opened in the appropriate FPGA vendor tool (e.g., Vivado for Xilinx targets) to be synthesized, implemented, and deployed on a physical FPGA board.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
