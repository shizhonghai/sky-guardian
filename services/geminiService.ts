import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSnapshot = async (base64Image: string, promptText: string = "Analyze this surveillance snapshot. Describe the scene, potential hazards, and any notable objects or persons.") => {
  try {
    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: promptText
          }
        ]
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Analysis failed due to a network or API error.";
  }
};

export const searchIntelligence = async (query: string, contextData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context data: ${contextData}. \n\n User Query: ${query}. \n\n Answer the user's question based on the context provided in a concise manner suitable for a mobile alert.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Search unavailable.";
  }
}