import { GoogleGenAI } from "@google/genai";
import { SolutionStep } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const explainSolution = async (
  capA: number,
  capB: number,
  goal: number,
  steps: SolutionStep[]
): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) return "API Key not configured.";

  const stepsText = steps.map((s, i) => `${i + 1}. ${s.action} (A=${s.a}, B=${s.b})`).join('\n');

  const prompt = `
    You are an expert algorithm tutor.
    The user is solving the Water Jug Problem with BFS.
    
    Parameters:
    Jug A Capacity: ${capA}L
    Jug B Capacity: ${capB}L
    Target Goal in Jug A: ${goal}L
    
    The BFS algorithm found the following solution path:
    ${stepsText}
    
    Please provide a concise, natural language explanation of the strategy used in this specific solution. 
    Explain *why* these steps lead to the solution. Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to retrieve explanation from AI.";
  }
};
