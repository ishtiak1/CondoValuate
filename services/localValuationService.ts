import { PropertyDetails, ValuationResponse, ValuationData } from "../types";

// Constants for algorithmic valuation
const BASE_HISTORICAL_INTEREST_RATE = 2.8; // Average 5-year fixed rate for 2019-2022
const CURRENT_INTEREST_RATE = 4.9; // Current average 5-year fixed rate (e.g., as of mid-2024)

// Interface for city-specific PSF data
interface CityYearPsfData {
  minPsf: number;
  maxPsf: number;
  avgPsf: number;
  marketContext: string;
}

// City-specific PSF data (2021-2024)
const CITY_PSF_DATA_TABLE: {
  [year: number]: {
    [city: string]: CityYearPsfData;
  };
} = {
  2021: {
    'Toronto': { minPsf: 1350, maxPsf: 1450, avgPsf: 1400, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Downtown Toronto launches averaged ~\$1,350–\$1,450 PSF.' },
    'Markham': { minPsf: 1300, maxPsf: 1420, avgPsf: 1360, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Markham averaged ~\$1,300–\$1,420 PSF.' },
    'Richmond Hill': { minPsf: 1300, maxPsf: 1420, avgPsf: 1360, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Richmond Hill averaged ~\$1,300–\$1,420 PSF.' },
    'Vaughan': { minPsf: 1280, maxPsf: 1380, avgPsf: 1330, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Vaughan averaged ~\$1,280–\$1,380 PSF.' },
    'Scarborough': { minPsf: 1240, maxPsf: 1350, avgPsf: 1295, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Scarborough averaged ~\$1,240–\$1,350 PSF.' },
    'Mississauga': { minPsf: 1200, maxPsf: 1320, avgPsf: 1260, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Mississauga averaged ~\$1,200–\$1,320 PSF.' },
    'Brampton': { minPsf: 1150, maxPsf: 1280, avgPsf: 1215, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Brampton averaged ~\$1,150–\$1,280 PSF.' },
    'Pickering': { minPsf: 1150, maxPsf: 1280, avgPsf: 1215, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Pickering averaged ~\$1,150–\$1,280 PSF.' },
    'Ajax': { minPsf: 1120, maxPsf: 1250, avgPsf: 1185, marketContext: 'Rapid Acceleration. Low interest rates fueled demand. Ajax averaged ~\$1,120–\$1,250 PSF.' },
  },
  2022: {
    'Toronto': { minPsf: 1400, maxPsf: 1480, avgPsf: 1440, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Downtown Toronto averaged ~\$1,400–\$1,480 PSF.' },
    'Markham': { minPsf: 1350, maxPsf: 1450, avgPsf: 1400, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Markham averaged ~\$1,350–\$1,450 PSF.' },
    'Richmond Hill': { minPsf: 1350, maxPsf: 1450, avgPsf: 1400, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Richmond Hill averaged ~\$1,350–\$1,450 PSF.' },
    'Vaughan': { minPsf: 1320, maxPsf: 1450, avgPsf: 1385, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Vaughan averaged ~\$1,320–\$1,450 PSF.' },
    'Scarborough': { minPsf: 1280, maxPsf: 1420, avgPsf: 1350, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Scarborough averaged ~\$1,280–\$1,420 PSF.' },
    'Mississauga': { minPsf: 1240, maxPsf: 1380, avgPsf: 1310, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Mississauga averaged ~\$1,240–\$1,380 PSF.' },
    'Brampton': { minPsf: 1190, maxPsf: 1350, avgPsf: 1270, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Brampton averaged ~\$1,190–\$1,350 PSF.' },
    'Pickering': { minPsf: 1180, maxPsf: 1340, avgPsf: 1260, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Pickering averaged ~\$1,180–\$1,340 PSF.' },
    'Ajax': { minPsf: 1150, maxPsf: 1330, avgPsf: 1240, marketContext: 'The Peak. Prices hit record highs in Q3 2022. Ajax averaged ~\$1,150–\$1,330 PSF.' },
  },
  2023: {
    'Toronto': { minPsf: 1300, maxPsf: 1420, avgPsf: 1360, marketContext: 'Correction Begins. Sales slowed significantly. Downtown Toronto averaged ~\$1,300–\$1,420 PSF.' },
    'Markham': { minPsf: 1250, maxPsf: 1380, avgPsf: 1315, marketContext: 'Correction Begins. Sales slowed significantly. Markham averaged ~\$1,250–\$1,380 PSF.' },
    'Richmond Hill': { minPsf: 1250, maxPsf: 1380, avgPsf: 1315, marketContext: 'Correction Begins. Sales slowed significantly. Richmond Hill averaged ~\$1,250–\$1,380 PSF.' },
    'Vaughan': { minPsf: 1230, maxPsf: 1350, avgPsf: 1290, marketContext: 'Correction Begins. Sales slowed significantly. Vaughan averaged ~\$1,230–\$1,350 PSF.' },
    'Scarborough': { minPsf: 1180, maxPsf: 1320, avgPsf: 1250, marketContext: 'Correction Begins. Sales slowed significantly. Scarborough averaged ~\$1,180–\$1,320 PSF.' },
    'Mississauga': { minPsf: 1150, maxPsf: 1310, avgPsf: 1230, marketContext: 'Correction Begins. Sales slowed significantly. Mississauga averaged ~\$1,150–\$1,310 PSF.' },
    'Brampton': { minPsf: 1100, maxPsf: 1280, avgPsf: 1190, marketContext: 'Correction Begins. Sales slowed significantly. Brampton averaged ~\$1,100–\$1,280 PSF.' },
    'Pickering': { minPsf: 1100, maxPsf: 1260, avgPsf: 1180, marketContext: 'Correction Begins. Sales slowed significantly. Pickering averaged ~\$1,100–\$1,260 PSF.' },
    'Ajax': { minPsf: 1080, maxPsf: 1250, avgPsf: 1165, marketContext: 'Correction Begins. Sales slowed significantly. Ajax averaged ~\$1,080–\$1,250 PSF.' },
  },
  2024: {
    'Toronto': { minPsf: 1250, maxPsf: 1400, avgPsf: 1325, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Downtown Toronto averaged ~\$1,250–\$1,400 PSF.' },
    'Markham': { minPsf: 1220, maxPsf: 1350, avgPsf: 1285, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Markham averaged ~\$1,220–\$1,350 PSF.' },
    'Richmond Hill': { minPsf: 1220, maxPsf: 1350, avgPsf: 1285, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Richmond Hill averaged ~\$1,220–\$1,350 PSF.' },
    'Vaughan': { minPsf: 1200, maxPsf: 1330, avgPsf: 1265, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Vaughan averaged ~\$1,200–\$1,330 PSF.' },
    'Scarborough': { minPsf: 1150, maxPsf: 1300, avgPsf: 1225, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Scarborough averaged ~\$1,150–\$1,300 PSF.' },
    'Mississauga': { minPsf: 1120, maxPsf: 1280, avgPsf: 1200, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Mississauga averaged ~\$1,120–\$1,280 PSF.' },
    'Brampton': { minPsf: 1080, maxPsf: 1250, avgPsf: 1165, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Brampton averaged ~\$1,080–\$1,250 PSF.' },
    'Pickering': { minPsf: 1080, maxPsf: 1240, avgPsf: 1160, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Pickering averaged ~\$1,080–\$1,240 PSF.' },
    'Ajax': { minPsf: 1060, maxPsf: 1230, avgPsf: 1145, marketContext: 'Significant Correction. New project launches are priced aggressively lower. Ajax averaged ~\$1,060–\$1,230 PSF.' },
  },
};

// General GTA average PSF data (for years not covered by city-specific data, and as a fallback)
interface PsfDataGeneral {
  year: number;
  minPsf: number;
  maxPsf: number;
  avgPsf: number;
  marketContext: string;
}

const PSF_DATA_TABLE_GENERAL: PsfDataGeneral[] = [
  { year: 2019, minPsf: 1070, maxPsf: 1150, avgPsf: 1110, marketContext: 'Steady Growth. Prices rose steadily across Greater Toronto Area.' },
  { year: 2020, minPsf: 1150, maxPsf: 1377, avgPsf: 1264, marketContext: 'Pandemic Resilience. Despite COVID-19 pauses, unsold inventory prices in Greater Toronto Area held strong.' },
  // 2021-2024 are covered by CITY_PSF_DATA_TABLE
  { year: 2025, minPsf: 1030, maxPsf: 1325, avgPsf: 1178, marketContext: 'Buyers Market. Greater Toronto Area unsold inventory hovered ~$1,325, but new launches dropped further. Many projects were delayed or cancelled.' },
  { year: 2026, minPsf: 1000, maxPsf: 1100, avgPsf: 1050, marketContext: 'Forecast: Continued Downward Pressure. Prices are projected to face further declines or remain significantly suppressed across the Greater Toronto Area, favoring buyers.' },
];

/**
 * Helper to map certain cities to their primary data source city to handle cities
 * not explicitly listed in the detailed city data but covered by a similar market.
 */
const mapCityToDataSource = (city: string): string => {
  switch (city) {
    case 'Etobicoke':
    case 'North York':
      return 'Toronto'; // These are part of Toronto proper, use Toronto data
    case 'Oakville':
      return 'Markham'; // Oakville is a high-value 905 region, similar to Markham/Richmond Hill
    default:
      return city; // For cities like Ajax, Pickering, Brampton, Mississauga, Vaughan, Richmond Hill, Scarborough, Markham, Toronto
  }
};

/**
 * Helper to get PSF data for a given year and city.
 * It first tries to find city-specific data, then falls back to general GTA data,
 * and finally extrapolates if the year is outside all defined ranges.
 * @param year The year for which to get PSF data.
 * @param city The city for which to get PSF data.
 * @returns CityYearPsfData containing minPsf, maxPsf, avgPsf, and marketContext.
 */
const getPSFDataForYearAndCity = (year: number, city: string): CityYearPsfData => {
  const mappedCity = mapCityToDataSource(city);

  // 1. Try to get city-specific data (2021-2024)
  if (CITY_PSF_DATA_TABLE[year] && CITY_PSF_DATA_TABLE[year][mappedCity]) {
    return CITY_PSF_DATA_TABLE[year][mappedCity];
  }

  // 2. Fallback to general GTA data (2019, 2020, 2025, 2026)
  const generalData = PSF_DATA_TABLE_GENERAL.find(d => d.year === year);
  if (generalData) {
    return {
      minPsf: generalData.minPsf,
      maxPsf: generalData.maxPsf,
      avgPsf: generalData.avgPsf,
      marketContext: generalData.marketContext,
    };
  }

  // 3. Extrapolation for years completely outside the defined tables (e.g., before 2019 or after 2026)
  const minOverallYear = Math.min(
    ...Object.keys(CITY_PSF_DATA_TABLE).map(Number),
    ...PSF_DATA_TABLE_GENERAL.map(d => d.year)
  ); // Should be 2019
  const maxOverallYear = Math.max(
    ...Object.keys(CITY_PSF_DATA_TABLE).map(Number),
    ...PSF_DATA_TABLE_GENERAL.map(d => d.year)
  ); // Should be 2026

  let basePsfDataForExtrapolation: CityYearPsfData | undefined;
  let baseYearForExtrapolation: number;

  if (year < minOverallYear) { // Before 2019
    baseYearForExtrapolation = minOverallYear; // This will be 2019
    const baseGeneralData = PSF_DATA_TABLE_GENERAL.find(d => d.year === baseYearForExtrapolation);
    if (baseGeneralData) {
      basePsfDataForExtrapolation = { ...baseGeneralData };
    }
    
    if (basePsfDataForExtrapolation) {
      const estimatedPsf = basePsfDataForExtrapolation.avgPsf * Math.pow(0.98, baseYearForExtrapolation - year); // 2% annual decline
      return {
        minPsf: Math.round(estimatedPsf * 0.95),
        maxPsf: Math.round(estimatedPsf * 1.05),
        avgPsf: Math.round(estimatedPsf),
        marketContext: 'Extrapolated: Early market growth with steady appreciation across GTA.'
      };
    }
  } else if (year > maxOverallYear) { // After 2026
    baseYearForExtrapolation = maxOverallYear; // This will be 2026
    const baseGeneralData = PSF_DATA_TABLE_GENERAL.find(d => d.year === baseYearForExtrapolation);
    if (baseGeneralData) {
      basePsfDataForExtrapolation = { ...baseGeneralData };
    }

    if (basePsfDataForExtrapolation) {
      // Adjusted growth rate for future extrapolation given new 2026 base
      const estimatedPsf = basePsfDataForExtrapolation.avgPsf * Math.pow(1.005, year - baseYearForExtrapolation); // 0.5% annual growth after 2026 due to lower base
      return {
        minPsf: Math.round(estimatedPsf * 0.95),
        maxPsf: Math.round(estimatedPsf * 1.05),
        avgPsf: Math.round(estimatedPsf),
        marketContext: 'Extrapolated: Post-correction stabilization with very modest projected growth across GTA.'
      };
    }
  }

  // 4. Ultimate Fallback: If no specific, general, or extrapolated data is found (should be rare)
  console.warn(`No PSF data found for ${city} in ${year}. Using a universal fallback to Toronto 2024 data.`);
  const universalFallback = CITY_PSF_DATA_TABLE[2024]?.['Toronto']; // Use Toronto 2024 as a last resort
  if (universalFallback) {
    return {
      minPsf: universalFallback.minPsf,
      maxPsf: universalFallback.maxPsf,
      avgPsf: universalFallback.avgPsf,
      marketContext: 'Data for specified city/year unavailable. Using general Toronto (2024) data as a fallback.'
    };
  }
  
  // Truly no data. This indicates a significant issue or an unsupported configuration.
  return { minPsf: 0, maxPsf: 0, avgPsf: 0, marketContext: 'Data unavailable.' };
};


/**
 * Generates an algorithmic valuation based on provided historical PSF data.
 * @param details PropertyDetails for the valuation.
 * @returns A promise resolving to ValuationResponse.
 */
export const getValuation = async (details: PropertyDetails): Promise<ValuationResponse> => {
  // Simulate a network delay for better UX (optional)
  await new Promise(resolve => setTimeout(resolve, 800));

  const currentYear = new Date().getFullYear();

  // Get PSF data for the purchase year and current year, specific to the city
  const purchaseYearData = getPSFDataForYearAndCity(details.yearPurchased, details.city);
  const currentYearData = getPSFDataForYearAndCity(currentYear, details.city);

  // If critical PSF data is zero (e.g., error in data retrieval/interpolation)
  if (!purchaseYearData.avgPsf || !currentYearData.avgPsf) {
      throw new Error("Unable to retrieve sufficient historical PSF data for valuation for the specified city and year. Please try different details.");
  }

  // Calculate Original Price Per Square Foot (based on user input)
  const originalPPSF = details.originalPrice / details.squareFootage;

  // Calculate a "relative" original PPSF based on historical data for consistency
  // This helps normalize the user's input price against the historical average for that year in that city.
  // We use this ratio to project the current value, personalizing the market trend.
  const priceToPsfRatio = originalPPSF / purchaseYearData.avgPsf;
  
  // Estimate current PPSF based on the current year's market data for the city, scaled by the unit's relative original price
  const currentMarketPPSF = currentYearData.avgPsf;
  const estimatedCurrentPPSFForUnit = currentMarketPPSF * priceToPsfRatio;

  // Estimated current value based on the estimated current PPSF and square footage
  const estimatedValue = Math.round(details.squareFootage * estimatedCurrentPPSFForUnit);
  
  // Appreciation percentage relative to the original purchase, based on market PSF
  const appreciationPercentage = Math.round(((estimatedValue - details.originalPrice) / details.originalPrice) * 100);

  // Year-by-year trend for the chart
  const yearByYearTrend: Array<{ year: number; avgPrice: number }> = [];
  const startYear = Math.min(details.yearPurchased, currentYear);
  const endYear = Math.max(details.yearPurchased, currentYear);

  for (let year = startYear; year <= endYear; year++) {
    const yearPsfData = getPSFDataForYearAndCity(year, details.city);
    const projectedPrice = Math.round(details.squareFootage * yearPsfData.avgPsf * priceToPsfRatio);
    yearByYearTrend.push({ year, avgPrice: projectedPrice });
  }

  // Market analysis uses the context from the current year's PSF data for the specified city
  const marketAnalysis = currentYearData.marketContext + " This analysis is based on general market trends for " + details.city + ", not specific project data.";

  // Comparable stats (simplified for algorithmic approach, based on market context)
  let inventoryLevel: string;
  const context = currentYearData.marketContext.toLowerCase();
  if (context.includes('buyers market') || context.includes('significant correction') || context.includes('correction begins') || context.includes('slower sales') || context.includes('downward pressure')) {
    inventoryLevel = "High (Favors Buyers)";
  } else if (context.includes('steady growth') || context.includes('pandemic resilience') || context.includes('rapid acceleration') || context.includes('the peak')) {
    inventoryLevel = "Low (Favors Sellers)";
  } else {
    inventoryLevel = "Moderate"; // Default or stabilization
  }

  const comparableStats = {
    avgAssignmentPrice: estimatedValue, // Equate to estimated value for simplicity
    inventoryLevel: inventoryLevel
  };

  // Interest rates (static)
  const interestRates = {
    historicalRate: BASE_HISTORICAL_INTEREST_RATE,
    currentRate: CURRENT_INTEREST_RATE
  };

  const valuationData: ValuationData = {
    estimatedValue,
    originalPPSF: Math.round(originalPPSF),
    currentPPSF: Math.round(estimatedCurrentPPSFForUnit),
    appreciationPercentage,
    marketAnalysis,
    yearByYearTrend,
    comparableStats,
    interestRates
  };

  return {
    data: valuationData,
    sources: [] // No external sources when using local algorithm
  };
};