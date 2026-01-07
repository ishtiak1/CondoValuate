import { GoogleGenAI } from "@google/genai";
import { PropertyDetails, ValuationResponse, ValuationData, GroundingSource } from "../types";

const apiKey = process.env.API_KEY;

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
    marketAnalysis: "Due to high API traffic or parsing limitations, this is a conservative algorithmic estimate based on historical GTA averages (approx 2% yearly). For a precise market value, please consult a real estate agent.",
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
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
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
        thinkingConfig: { thinkingBudget: 1024 } // Allow some thinking for math/search synthesis
      },
    });

    const text = response.text;
    
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

  } catch (error) {
    console.error("Error fetching valuation:", error);
    // Fallback if API fails completely
    return {
      data: getFallbackData(details),
      sources: []
    };
  }
};