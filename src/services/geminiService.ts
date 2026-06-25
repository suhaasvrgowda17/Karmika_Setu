import { GoogleGenAI, Type } from "@google/genai";
import { WorkCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExtractedWorkData {
  date: string;
  category: WorkCategory;
  workType: string;
  location: string;
  contractorName: string;
  hoursWorked: number;
  paymentReceived: number;
  paymentStatus: 'Pending' | 'Paid';
  contractorId?: string;
}

export async function extractWorkFromText(text: string): Promise<ExtractedWorkData | null> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a highly capable AI assistant for "Karmik Setu", a platform for daily wage workers in India.
  Your task is to extract work details from spoken text which might be in Hindi, Kannada, Tamil, English, or a mix.
  
  IMPORTANT: 
  - Even if the worker speaks in a regional language, the extracted 'workType' and 'location' should be in English for the database.
  - Interpret amounts accurately (e.g., "haazaar" = 1000, "sau" = 100).
  
  Extract these fields in JSON format:
  - date: format YYYY-MM-DD. If they say "today", use: ${new Date().toISOString().split('T')[0]}.
  - category: One of: ${Object.values(WorkCategory).join(', ')}.
  - workType: A CONCISE description in English of the job done.
  - location: The place name in English.
  - contractorName: The name of the person/company who hired them.
  - hoursWorked: Total hours (number only).
  - paymentReceived: Total amount in Rupees (number only).
  - paymentStatus: 'Paid' if they mention getting paid, 'Pending' if they are owed.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Input text: "${text}"` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(WorkCategory) },
            workType: { type: Type.STRING },
            location: { type: Type.STRING },
            contractorName: { type: Type.STRING },
            hoursWorked: { type: Type.NUMBER },
            paymentReceived: { type: Type.NUMBER },
            paymentStatus: { type: Type.STRING, enum: ['Paid', 'Pending'] }
          },
          required: ["date", "category", "workType", "location", "hoursWorked", "paymentReceived", "paymentStatus"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text.trim()) as ExtractedWorkData;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return null;
  }
}
