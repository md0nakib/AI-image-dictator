
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export async function analyzeImageForAI(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const prompt = "এই ছবিটি বিশ্লেষণ করে বলুন এটি কৃত্রিম বুদ্ধিমত্তা (AI) দিয়ে তৈরি কিনা। আপনার উত্তরটি শুধুমাত্র একটি JSON অবজেক্ট হিসেবে দিন এবং অন্য কোনো টেক্সট যোগ করবেন না। JSON অবজেক্টে `isAiGenerated` (বুলিয়ান), `confidence` (০.০ থেকে ১.০ পর্যন্ত একটি সংখ্যা) এবং `reasoning` (আপনার সিদ্ধান্তের কারণ বাংলায়) এই তিনটি কী থাকবে।";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAiGenerated: {
              type: Type.BOOLEAN,
              description: 'True if the image is likely AI-generated, false otherwise.'
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score from 0.0 to 1.0.'
            },
            reasoning: {
              type: Type.STRING,
              description: 'A brief explanation in Bengali for the conclusion.'
            }
          },
          required: ['isAiGenerated', 'confidence', 'reasoning']
        },
      }
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("চিত্র বিশ্লেষণ করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
}
