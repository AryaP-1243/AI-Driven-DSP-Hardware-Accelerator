
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BlockType, SignalType, OptimizationResult, FpgaTarget, ChatMessage, OptimizationConstraints, HardwareMetrics, DspBlockConfig, AnalysisResults } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const schema = {
  type: Type.OBJECT,
  properties: {
    explanation: {
      type: Type.STRING,
      description: "A concise, expert-level paragraph explaining the optimization strategy, focusing on choices like coefficient bit-widths, pipeline stages, and resource allocation trade-offs specific to the target FPGA architecture. If responding to a follow-up, explain what was changed from the previous design."
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        lutCount: { type: Type.STRING, description: "Estimated number of Look-Up Tables (LUTs) or ALMs. Format as a string, e.g., '~1200'." },
        ffCount: { type: Type.STRING, description: "Estimated number of Flip-Flops (FFs). Format as a string, e.g., '~1500'." },
        dspSlices: { type: Type.STRING, description: "Estimated number of dedicated DSP slices. Format as a string, e.g., '16'." },
        bramBlocks: { type: Type.STRING, description: "Estimated number of Block RAM (BRAM) or M20K blocks. Format as a string, e.g., '2'." },
        cyclesPerSample: { type: Type.STRING, description: "Estimated number of clock cycles to process one sample. Can be '1' or 'N/A' for source blocks." },
        throughput: { type: Type.STRING, description: "Estimated throughput in MSPS, calculated based on the target clock frequency." },
      },
      required: ['lutCount', 'ffCount', 'dspSlices', 'bramBlocks', 'cyclesPerSample', 'throughput']
    },
    coefficients: {
      type: Type.ARRAY,
      description: "An array of optimized numerical filter coefficients. Can be an empty array for non-filter blocks.",
      items: { type: Type.NUMBER }
    },
    dataBitWidth: { type: Type.INTEGER, description: "The optimal bit-width for the data path (e.g., 16)." },
    coefficientBitWidth: { type: Type.INTEGER, description: "The optimal bit-width for the coefficients (e.g., 16)." },
    hdlModule: {
      type: Type.STRING,
      description: "The complete, synthesizable SystemVerilog code for the module. It must include a header comment, commented parameters, and follow standard HDL coding styles."
    },
    hdlTestbench: {
      type: Type.STRING,
      description: "A complete, self-checking SystemVerilog testbench for the generated module. It should instantiate the module, drive its inputs from a file ('stimulus.txt') using a file reader task or initial block, and include assertions or checks to verify the output."
    },
    synthesisScript: {
      type: Type.STRING,
      description: "A Tcl script to synthesize the project. It should be for Vivado if the target is Xilinx/AMD, or Quartus if the target is Intel/Altera. It should create a project, add the generated files, set the target device family, and run synthesis."
    },
    stimulusFileContent: {
        type: Type.STRING,
        description: "The content for 'stimulus.txt'. This file should contain the first 50-100 integer-quantized input samples, one per line, based on the provided signal data snippet. This is CRITICAL for a valid, self-contained testbench."
    }
  },
  required: ['explanation', 'metrics', 'coefficients', 'dataBitWidth', 'coefficientBitWidth', 'hdlModule', 'hdlTestbench', 'synthesisScript', 'stimulusFileContent']
};

const buildPrompt = (
    dspChain: DspBlockConfig[],
    activeBlockIndex: number,
    signalType: SignalType,
    chatHistory: ChatMessage[],
    fpgaTarget: FpgaTarget,
    clockFrequency: number,
    constraints: OptimizationConstraints,
    imageIsPresent: boolean,
    signalData: number[]
) => {
    let historyText = chatHistory.map(msg => {
        if (msg.role === 'user') {
            const imageNotice = msg.image ? ' [Image Attached]' : '';
            return `User: "${msg.text}"${imageNotice}`;
        } else if (msg.role === 'ai' && msg.result) {
            return `AI (Previous Design): Explanation: ${msg.result.explanation}. Metrics: ${JSON.stringify(msg.result.metrics)}`;
        }
        return '';
    }).join('\n');

    let constraintsText = Object.entries(constraints)
        .filter(([_, value]) => value && value.trim() !== '')
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
    
    const activeBlock = dspChain[activeBlockIndex];
    const blockType = activeBlock.type;
    const isFirBlock = activeBlock.type === 'FIR';
    const isFilterBlock = ['FIR', 'IIR'].includes(blockType);

    const filterSettingsText = isFilterBlock ? `
      - Filter Order / Taps: ${activeBlock.settings?.filterOrder || 'default'}
      ${isFirBlock ? `
      - Filter Type: ${activeBlock.settings?.filterType || 'Low-pass'}
      - Window Function: ${activeBlock.settings?.windowType || 'None'}
      ` : ''}
    ` : '';
    
    const chainDescription = dspChain.map((block, index) => `${index + 1}. ${block.type}${index === activeBlockIndex ? ' (CURRENTLY OPTIMIZING)' : ''}`).join(' -> ');

    const signalDataSnippet = signalData.slice(0, 100).map(v => v.toFixed(5)).join(', ');

    return `
      You are an expert FPGA design engineer acting as an AI Co-Pilot for optimizing DSP hardware blocks.
      Your task is to have a conversation with a user to iteratively refine a DSP design.
      You must generate a complete, synthesizable project (HDL, testbench, script, stimulus) based on the specifications.
      
      System Context:
      - Full DSP Chain: ${chainDescription}
      - You are optimizing Block #${activeBlockIndex + 1}.

      ${imageIsPresent ? "The user has provided an image. Use this image as a key part of the design specification. If it is a plot (e.g., frequency response), create a design that matches its characteristics. If it is a block diagram, implement the described architecture." : ""}

      Specifications for the Target Block (${blockType}):
      - DSP Block: ${blockType}
      ${filterSettingsText}
      - Signal Application: ${signalType} Signal Processing
      - Target FPGA Architecture: ${fpgaTarget}
      - Target Clock Frequency: ${clockFrequency} MHz

      ${constraintsText.length > 0 ? `Hard Constraints (MUST be respected if possible):\n${constraintsText}` : ''}

      Conversation History:
      ${historyText}

      Your Task:
      Based on the entire conversation, especially the latest user message, generate a new, complete design configuration for the target block.
      If this is not the first turn, treat the latest user message as a request to MODIFY the previous design. Explain the changes you made.
      If a constraint cannot be met, explain why in the explanation field.
      ${isFilterBlock ? `For the ${blockType} design, you MUST adhere to the specified order/taps of ${activeBlock.settings?.filterOrder || 'default'}. The number of coefficients you generate should match this exactly.` : ''}
      ${isFirBlock ? `The FIR filter must be a '${activeBlock.settings?.filterType || 'Low-pass'}' type. If a window function other than 'None' is specified ('${activeBlock.settings?.windowType || 'None'}'), you should incorporate its principles into the coefficient design for optimal performance.` : ''}

      For the generated project files:
      - hdlModule: Must be high-quality, readable, and maintainable SystemVerilog.
      - hdlTestbench: Must be a complete, self-checking testbench that reads stimulus data from a file named 'stimulus.txt'.
      - synthesisScript: Must be a Tcl script for either Vivado (Xilinx/AMD) or Quartus (Intel/Altera).
      - stimulusFileContent: CRITICAL. Based on the data snippet below, create the content for 'stimulus.txt'. You must determine an appropriate bit-width (e.g., 16-bit) and provide the integer-quantized values, one per line.
      
      Input Signal Data Snippet (first 100 points):
      [${signalDataSnippet}]

      Provide realistic, integer-based estimates for hardware resources.
      Determine and specify appropriate fixed-point bit-widths for data and coefficients.
      The JSON output must strictly adhere to the provided schema.
    `;
}

const parseGeminiResponse = (response: GenerateContentResponse): OptimizationResult => {
    const jsonString = response.text;
    
    if (!jsonString || jsonString.trim() === '') {
        throw new Error("AI returned an empty response. The model may be unable to fulfill the request with the current parameters.");
    }

    let result;
    try {
        result = JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", jsonString);
        throw new Error("AI returned a response that was not in the expected format. Please try rephrasing your request.");
    }
    
    if (!result.explanation || !result.metrics || !result.hdlModule || !result.hdlTestbench || !result.synthesisScript || !result.stimulusFileContent) {
        throw new Error("AI response is missing one or more required project fields. The generated design may be incomplete.");
    }
    
    return result as OptimizationResult;
}

const handleApiError = (error: unknown): Error => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return new Error("Authentication Failed: The provided API Key is not valid. Please check your configuration.");
        }
        if (error.message.toLowerCase().includes('fetch failed') || error.message.toLowerCase().includes('networkerror')) {
            return new Error("Network Error: Could not connect to the AI service. Please check your internet connection and try again.");
        }
        if (error.message.includes("429")) { // Too many requests
             return new Error("Rate Limit Exceeded: Too many requests sent in a short period. Please wait a moment before trying again.");
        }
        // This will catch JSON parsing errors from my custom parse function too
        return new Error(`AI Model Error: ${error.message}`);
    }
    return new Error("An unknown error occurred while communicating with the AI model.");
}

export const optimizeDspBlock = async (
  dspChain: DspBlockConfig[],
  activeBlockIndex: number,
  signalType: SignalType,
  chatHistory: ChatMessage[],
  fpgaTarget: FpgaTarget,
  clockFrequency: number,
  constraints: OptimizationConstraints,
  signalData: number[],
  image?: { base64Data: string; mimeType: string; }
): Promise<OptimizationResult> => {

  const prompt = buildPrompt(dspChain, activeBlockIndex, signalType, chatHistory, fpgaTarget, clockFrequency, constraints, !!image, signalData);
  
  let contents: any;
  if (image) {
      const imagePart = {
        inlineData: {
          data: image.base64Data,
          mimeType: image.mimeType,
        },
      };
      const textPart = { text: prompt };
      contents = { parts: [textPart, imagePart] };
  } else {
      contents = prompt;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return parseGeminiResponse(response);

  } catch (error) {
    throw handleApiError(error);
  }
};

export const optimizeWithHardwareFeedback = async (
    previousMessage: ChatMessage,
    dspChain: DspBlockConfig[],
    activeBlockIndex: number,
    signalType: SignalType,
    fpgaTarget: FpgaTarget,
    clockFrequency: number,
    signalData: number[],
    userPrompt: string
): Promise<OptimizationResult> => {
    if (!previousMessage.result || !previousMessage.analysis?.validatedMetrics) {
        throw new Error("Cannot run HIL optimization without a previous result and validated metrics.");
    }

    const previousResult = previousMessage.result;
    const validatedMetrics = previousMessage.analysis.validatedMetrics;
    const blockType = dspChain[activeBlockIndex].type;

    const prompt = `
        You are an expert FPGA design engineer performing a closed-loop, hardware-in-the-loop optimization.
        You previously generated a design for a '${blockType}' block for a '${signalType}' application.
        
        Your Previous Design's Estimated Metrics:
        ${JSON.stringify(previousResult.metrics, null, 2)}

        That design was synthesized, and here are the ACTUAL post-place-and-route metrics from the hardware build:
        ${JSON.stringify(validatedMetrics, null, 2)}
        
        The user now has a new request: "${userPrompt}"

        Your Task:
        Analyze the difference between your estimate and the actual hardware results.
        Then, generate a NEW, MODIFIED design that incorporates the user's feedback and aims to better match the real-world hardware constraints.
        Explain what you changed and why, referencing the hardware feedback. For example, if LUTs were higher than expected, you might use a more serial architecture. If throughput was lower, you might add more pipeline stages.
        
        You must generate a complete project, including HDL, a signal-aware testbench that reads from 'stimulus.txt', and the 'stimulus.txt' content itself based on the provided data snippet.
        The JSON output must strictly adhere to the provided schema.

        Input Signal Data Snippet (first 100 points):
        [${signalData.slice(0, 100).map(v => v.toFixed(5)).join(', ')}]
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return parseGeminiResponse(response);
    } catch (error) {
        throw handleApiError(error);
    }
};


const metricsSchema = {
    type: Type.OBJECT,
    properties: {
        lutCount: { type: Type.STRING, description: "Estimated number of Look-Up Tables (LUTs). Format as a string, e.g., '~1200'." },
        ffCount: { type: Type.STRING, description: "Estimated number of Flip-Flops (FFs). Format as a string, e.g., '~1500'." },
        dspSlices: { type: Type.STRING, description: "Estimated number of dedicated DSP slices. Format as a string, e.g., '16'." },
        bramBlocks: { type: Type.STRING, description: "Estimated number of Block RAM (BRAM). Format as a string, e.g., '2'." },
        cyclesPerSample: { type: Type.STRING, description: "Clock cycles per sample. Should likely remain the same as the original." },
        throughput: { type: Type.STRING, description: "Estimated throughput in MSPS. Should likely remain the same as the original." },
    },
    required: ['lutCount', 'ffCount', 'dspSlices', 'bramBlocks', 'cyclesPerSample', 'throughput']
};


export const estimateHardwareForBitWidths = async (
    blockType: BlockType,
    originalResult: OptimizationResult,
    newDataBitWidth: number,
    newCoeffBitWidth: number
): Promise<HardwareMetrics> => {

    const prompt = `
      You are an expert FPGA design engineer.
      Your task is to provide a quick, reasonable estimate of hardware resource changes based on bit-width adjustments.
      The user has an existing design for a '${blockType}' block.
      The original design used:
      - Data Bit-Width: ${originalResult.dataBitWidth}
      - Coefficient Bit-Width: ${originalResult.coefficientBitWidth}
      And resulted in the following hardware metrics:
      - LUTs: ${originalResult.metrics.lutCount}
      - Flip-Flops: ${originalResult.metrics.ffCount}
      - DSP Slices: ${originalResult.metrics.dspSlices}
      - BRAM Blocks: ${originalResult.metrics.bramBlocks}
      - Throughput: ${originalResult.metrics.throughput}

      Now, the user wants to change the bit-widths to:
      - New Data Bit-Width: ${newDataBitWidth}
      - New Coefficient Bit-Width: ${newCoeffBitWidth}

      Based on this change, provide a new estimate for the hardware metrics.
      Key considerations:
      - For a filter, multiplier complexity (affecting LUTs or DSP slices) scales with the product of the bit-widths (N x M).
      - Adder and register (FFs) complexity scales linearly with data path width.
      - BRAM usage might change if coefficients or data tables need more storage, but often stays the same for filters.
      - Throughput and cycles/sample are likely unaffected unless the design becomes timing-critical due to much wider paths. Assume they stay the same.

      Return ONLY a JSON object matching the schema. Do not include any other text, markdown, or explanations.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: metricsSchema,
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        return result as HardwareMetrics;

    } catch (error) {
        throw handleApiError(error);
    }
};
