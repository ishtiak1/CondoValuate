export interface PropertyDetails {
  yearPurchased: number;
  originalPrice: number;
  squareFootage: number;
  city: string;
  projectName?: string;
  bedrooms?: string;
}

export interface ValuationData {
  estimatedValue: number;
  originalPPSF: number;
  currentPPSF: number;
  appreciationPercentage: number;
  marketAnalysis: string;
  yearByYearTrend: Array<{ year: number; avgPrice: number }>;
  comparableStats?: {
    avgAssignmentPrice: number;
    inventoryLevel: string;
  };
  interestRates?: {
    historicalRate: number;
    currentRate: number;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ValuationResponse {
  data: ValuationData;
  sources: GroundingSource[];
}

export const CITIES = [
  'Toronto',
  'Mississauga',
  'Vaughan',
  'Markham',
  'Richmond Hill',
  'Oakville',
  'Brampton',
  'Etobicoke',
  'North York',
  'Scarborough',
  'Ajax', // Added
  'Pickering' // Added
];

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];