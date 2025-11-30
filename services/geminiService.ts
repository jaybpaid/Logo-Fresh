

import { GoogleGenAI } from "@google/genai";
import { MODEL_IMAGE_GEN, MODEL_IMAGE_EDIT, MODEL_ANALYSIS, MODEL_THINKING, MODEL_JSON, LOGO_FRESH_SYSTEM_PROMPT } from '../constants';
import { AspectRatio, ImageSize, LogoFreshResponse, LogoVariation } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let currentDelay = initialDelay;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check for rate limit (429) or server overload (503)
      const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429');
      const isServerOverload = error?.status === 503 || error?.code === 503;
      
      if ((isRateLimit || isServerOverload) && i < retries - 1) {
        console.warn(`API Rate limit hit. Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${retries})`);
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff: 2s, 4s, 8s
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Generate an image using Nano Banana Pro (gemini-3-pro-image-preview)
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio, imageSize: ImageSize): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_IMAGE_GEN,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated.");
    } catch (error) {
      console.error("Image generation failed:", error);
      throw error;
    }
  });
};

/**
 * Edit an image using Nano Banana (gemini-2.5-flash-image)
 */
export const editImage = async (base64Image: string, prompt: string, mimeType: string = 'image/png'): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await ai.models.generateContent({
        model: MODEL_IMAGE_EDIT,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No edited image returned.");
    } catch (error) {
      console.error("Image editing failed:", error);
      throw error;
    }
  });
};

/**
 * Removes the background from an image using Nano Banana (gemini-2.5-flash-image)
 */
export const removeBackground = async (base64Image: string, mimeType: string = 'image/png'): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      const prompt = `
        Your task is to perform an expert background removal and create a monochrome silhouette. Follow these steps precisely:
        1.  **Identify the Subject:** Analyze the image to distinguish the primary logo artwork from its solid color background (e.g., white, black, or any other color).
        2.  **Remove the Background:** Make the identified solid color background completely transparent.
        3.  **Create Silhouette:** Convert ONLY the isolated logo artwork (the subject) into a solid black color. Do NOT color the background.
        4.  **Output:** The final output must be a PNG file with a perfect cutout of the logo artwork in solid black on a fully transparent background.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_IMAGE_EDIT,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Background removal failed: no image returned.");
    } catch (error) {
      console.error("Background removal failed:", error);
      throw error;
    }
  });
};

/**
 * Analyze an image using gemini-3-pro-preview
 */
export const analyzeImage = async (base64Image: string, prompt: string, mimeType: string = 'image/png'): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: MODEL_ANALYSIS,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt || "Analyze this image in detail.",
            },
          ],
        },
      });

      return response.text || "No analysis provided.";
    } catch (error) {
      console.error("Image analysis failed:", error);
      throw error;
    }
  });
};

/**
 * Thinking Chat using gemini-3-pro-preview with high thinking budget
 */
export const generateThinkingResponse = async (prompt: string): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: prompt,
        config: {
          thinkingConfig: {
              thinkingBudget: 32768, // Max for gemini 3 pro
          }
        },
      });

      return response.text || "No response generated.";
    } catch (error) {
      console.error("Thinking generation failed:", error);
      throw error;
    }
  });
};

/**
 * Generate Logo Specs using gemini-2.5-flash with structured JSON output
 */
export const generateLogoSpecs = async (
  base64Image: string, 
  userParams: any, 
  mimeType: string = 'image/png'
): Promise<LogoFreshResponse> => {
  return retryWithBackoff(async () => {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await ai.models.generateContent({
        model: MODEL_JSON,
        contents: {
          parts: [
            {
              text: JSON.stringify(userParams)
            },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              }
            }
          ]
        },
        config: {
          systemInstruction: LOGO_FRESH_SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("Empty response from model");
      return JSON.parse(text) as LogoFreshResponse;
    } catch (error) {
      console.error("Logo specs generation failed:", error);
      throw error;
    }
  });
};

/**
 * Generate SVG Preview using gemini-3-pro-preview
 * This has been updated with a hyper-precise prompt to ensure 1:1 visual fidelity with the source PNG.
 */
export const generateSvgPreview = async (
  base64Image: string,
  variation: LogoVariation
): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `
        You are a hyper-precise SVG Vectorization Engine. Your only job is to create a perfect vector path-based replica of the provided raster image. You will be penalized for any creative deviation.

        STRICT RULES:
        1. TRACE the input image geometry perfectly. The output SVG, when rendered, must be visually indistinguishable from the input PNG. Match the visual output 1:1. This is the most important rule.
        2. OPTIMIZE the SVG code for web. Use minimal path data and group elements logically.
        3. Capture all details, including fine lines, textures, and color gradients if present.
        4. Use the EXACT colors found in the image. Sample the colors accurately.
        5. Output PURE SVG code only. Do not wrap it in markdown fences (\`\`\`svg ... \`\`\`).
        6. Ensure the SVG is responsive (uses a viewBox attribute).
        7. DO NOT simplify, stylize, or reinterpret the image. This is a technical conversion, not a creative task. Your output must be a faithful vector reproduction.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_THINKING, // Using gemini-3-pro-preview for its superior code and instruction following capabilities
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: 'image/png',
              },
            },
          ],
        },
      });
      let text = response.text || "";
      // Clean up markdown code blocks just in case the model ignores the instruction
      text = text.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '');
      return text.trim();

    } catch (error) {
      console.error("SVG preview generation failed:", error);
      return ""; // Return empty string on failure to prevent breaking the UI
    }
  }, 3, 3000); // More aggressive backoff for this complex task
};
