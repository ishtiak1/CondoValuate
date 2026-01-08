import { GoogleGenAI } from "@google/genai";
import { PropertyDetails, ValuationResponse, ValuationData, GroundingSource } from "../types";

// Retrieve API key from various environment variable patterns.
// This supports Vite (import.meta.env), CRA (REACT_APP_), Next.js (NEXT_PUBLIC_), and standard process.env.
const getApiKey = (): string | undefined => {
  // 1. Try Vite's import.meta.env
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
      // @ts-ignore
      if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore
  }

  // 2. Try standard process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.API_KEY) return process.env.API_KEY;
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
      if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
    }
  } catch (e) {
    // Ignore
  }

  return undefined;
};

const apiKey = getApiKey();

// Fallback data in case parsing fails or API is weird, to ensure UI doesn't crash
const getFallbackData = (details: PropertyDetails): ValuationData => {
  const originalPPSF = details.originalPrice / details.squareFootage;
  // Conservative 2% growth per year fallback logic
  const yearsHeld = new Date().getFullYear() - details.yearPurchased;
  const growthFactor = Math.pow(1.02, yearsHeld); 
  const currentPPSF = originalPPSF * growthFactor;
  
  return {
    estimatedValue: Math.round(details.squareFootage * currentPPSF),
    originalPPSF: Math.round(originalPPSF),
    currentPPSF: Math.round(currentPPSF),
    appreciationPercentage: Math.round((growthFactor - 1) * 100),
    marketAnalysis: "Due to technical difficulties retrieving live data, this is a conservative algorithmic estimate based on historical GTA averages (approx 2% yearly). Please consult a real estate agent for accuracy.",
    yearByYearTrend: Array.from({ length: yearsHeld + 1 }, (_, i) => ({
      year: details.yearPurchased + i,
      avgPrice: Math.round(details.originalPrice * Math.pow(1.02, i))
    })),
    comparableStats: {
      avgAssignmentPrice: Math.round(details.squareFootage * currentPPSF),
      inventoryLevel: "Unknown"
    },
    interestRates: {
      historicalRate: 2.5,
      currentRate: 4.9
    }
  };
};

export const getValuation = async (details: PropertyDetails): Promise<ValuationResponse> => {
  if (!apiKey) {
    console.error("API Key is missing.");
    throw new Error("API Key is missing. Please check your Vercel/Netlify settings. If using Vite, name your variable 'VITE_API_KEY'. If using Create-React-App, 'REACT_APP_API_KEY'. If using Next.js, 'NEXT_PUBLIC_API_KEY'. Or use 'API_KEY' if your bundler exposes it.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Act as a professional Real Estate Analyst for the Greater Toronto Area (GTA).
    
    I need a valuation for a pre-construction condo purchased on assignment.
    
    Property Details:
    - Purchase Year: ${details.yearPurchased}
    - Original Purchase Price: $${details.originalPrice}
    - Size: ${details.squareFootage} sqft
    - City/Location: ${details.city}
    ${details.projectName ? `- Project Name: ${details.projectName}` : ''}
    ${details.bedrooms ? `- Bedrooms: ${details.bedrooms}` : ''}

    Task:
    1. Use Google Search to find historical and current "Price Per Square Foot" (PPSF) data for pre-construction and assignment condos in ${details.city} and the specific project if known.
    2. Determine the "Original PPSF" based on user input.
    3. Estimate the "Current Market PPSF" for a similar assignment sale today.
    4. Calculate the "Estimated Value" today.
    5. Generate a year-by-year estimated value trend from ${details.yearPurchased} to ${new Date().getFullYear()}.
    6. Provide a brief analysis of the market conditions for assignment sales in this area (cooling, heating, stagnating).
    7. Estimate the typical 5-year fixed mortgage interest rate for the purchase year (${details.yearPurchased}) and the current year.

    IMPORTANT: You must return the response in a strictly valid JSON block wrapped in \`\`\`json\`\`\`.
    
    JSON Schema:
    {
      "estimatedValue": number,
      "originalPPSF": number,
      "currentPPSF": number,
      "appreciationPercentage": number,
      "marketAnalysis": "string (max 150 words)",
      "yearByYearTrend": [
        { "year": number, "avgPrice": number }
      ],
      "comparableStats": {
        "avgAssignmentPrice": number,
        "inventoryLevel": "string (e.g., High, Moderate, Low)"
      },
      "interestRates": {
        "historicalRate": number,
        "currentRate": number
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better reasoning and search capabilities
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Adjust thinking budget or remove if latency is too high, 
        // but keeping it for better reasoning per requirements.
        thinkingConfig: { thinkingBudget: 1024 } 
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Received empty response from Gemini API");
    }
    
    // Extract Grounding Metadata
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      }))
      .filter((s: GroundingSource) => s.uri !== '#') || [];

    // Extract JSON from the text response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.warn("Could not parse JSON from Gemini response, falling back to algorithm.", text);
      return {
        data: getFallbackData(details),
        sources
      };
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const data: ValuationData = JSON.parse(jsonStr);

    return {
      data,
      sources
    };

  } catch (error: any) {
    console.error("Error fetching valuation:", error);
    
    // Only rethrow specific configuration errors so the user knows to fix them
    if (error.message && (error.message.includes("API Key"))) {
       throw error;
    }

    // For other runtime errors (network, AI hallucination), return fallback to keep app usable
    return {
      data: getFallbackData(details),
      sources: []
    };
  }
};