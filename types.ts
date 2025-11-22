export type Language = 'English' | 'Marathi' | 'Hindi' | 'Bengali' | 'Gujarati';

export interface LocationData {
  country: string;
  state: string;
  district: string;
  taluka: string;
  town: string;
  pincode: string;
}

export enum AnalysisTask {
  HISTORY = 'History',
  PREDICTION = 'Prediction',
  CROP_REC = 'Crop Recommendation',
  FRUIT_REC = 'Fruit Recommendation',
  CROP_CHECK = 'Crop Check',
  FRUIT_CHECK = 'Fruit Check',
}

// Structure expected from Gemini JSON response
export interface WeatherDataPoint {
  label: string; // Year or Month
  temperature: number;
  rainfall: number;
}

export interface CultivationGuide {
  plantationDistance: string;
  groundPreparation: string;
  holePreparation: string; // dimensions & fertilizers before planting
  careInstructions: string; // 6-8 month care
  fertilizerSchedule: {
    organic: string;
    chemical: string;
  };
}

export interface RecommendationItem {
  name: string;
  englishName?: string; // Used for image generation
  suitabilityScore: number;
  season: string;
  yieldExpected: string;
  waterRequirement: string;
  difficulty: string;
  verdict: string; // "Grow", "Grow with Care", "Not Recommended"
  description: string;
  cultivationGuide?: CultivationGuide;
}

export interface AgriResponse {
  locationSummary: string;
  weatherHistory?: WeatherDataPoint[];
  futureForecast?: WeatherDataPoint[];
  recommendations?: RecommendationItem[];
  suitabilityCheck?: RecommendationItem;
}