import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LocationData, AnalysisTask, AgriResponse, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for strict JSON output to ensure UI can render charts/cards
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    locationSummary: {
      type: Type.STRING,
      description: "A clear climate profile based on the user’s PINCODE and region. Translated to the requested language.",
    },
    weatherHistory: {
      type: Type.ARRAY,
      description: "Historical weather data for charts (if requested).",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Year (e.g., 2015)" },
          temperature: { type: Type.NUMBER, description: "Average temperature in Celsius" },
          rainfall: { type: Type.NUMBER, description: "Total rainfall in mm" },
        },
      },
    },
    futureForecast: {
      type: Type.ARRAY,
      description: "Future weather prediction for charts (if requested).",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Month Name (e.g., Jan)" },
          temperature: { type: Type.NUMBER, description: "Predicted avg temperature in Celsius" },
          rainfall: { type: Type.NUMBER, description: "Predicted rainfall in mm" },
        },
      },
    },
    recommendations: {
      type: Type.ARRAY,
      description: "List of recommended crops or fruits (if requested).",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of crop/fruit in requested language" },
          englishName: { type: Type.STRING, description: "English name of the crop/fruit (for image search)" },
          suitabilityScore: { type: Type.NUMBER, description: "0-100 score" },
          season: { type: Type.STRING, description: "Translated season" },
          yieldExpected: { type: Type.STRING, description: "Translated yield info" },
          waterRequirement: { type: Type.STRING, description: "Translated water info" },
          difficulty: { type: Type.STRING, description: "Translated difficulty" },
          verdict: { type: Type.STRING, description: "STRICTLY ONE OF: 'Highly Recommended', 'Recommended', 'Grow with Care', 'Not Recommended'. Keep this in English for code logic." },
          description: { type: Type.STRING, description: "Short actionable advice in requested language" },
        },
      },
    },
    suitabilityCheck: {
      type: Type.OBJECT,
      description: "Result of a specific crop/fruit check (if requested).",
      properties: {
        name: { type: Type.STRING, description: "Name in requested language" },
        englishName: { type: Type.STRING, description: "English name of the crop/fruit (for image search)" },
        suitabilityScore: { type: Type.NUMBER },
        season: { type: Type.STRING, description: "Translated season" },
        yieldExpected: { type: Type.STRING, description: "Translated yield info" },
        waterRequirement: { type: Type.STRING, description: "Translated water info" },
        difficulty: { type: Type.STRING, description: "Translated difficulty" },
        verdict: { type: Type.STRING, description: "STRICTLY ONE OF: 'Grow', 'Grow with Care', 'Not Recommended'. Keep this in English for code logic." },
        description: { type: Type.STRING, description: "Detailed analysis in requested language." },
        cultivationGuide: {
          type: Type.OBJECT,
          description: "Detailed plantation guide. MANDATORY for Task E and F.",
          properties: {
            plantationDistance: { type: Type.STRING, description: "Distance between plants and rows (e.g., 10x10 ft)" },
            groundPreparation: { type: Type.STRING, description: "Steps for ploughing and soil treatment" },
            holePreparation: { type: Type.STRING, description: "Pit size (LxWxD) and Basal Dose (Cow dung, Vermicompost, etc)" },
            careInstructions: { type: Type.STRING, description: "Care for first 6-8 months (Watering, Weeding, Support)" },
            fertilizerSchedule: {
              type: Type.OBJECT,
              properties: {
                organic: { type: Type.STRING, description: "Organic fertilizer suggestions" },
                chemical: { type: Type.STRING, description: "Chemical fertilizer suggestions" },
              }
            }
          }
        }
      },
    },
  },
  required: ["locationSummary"],
};

export const generateAgriAnalysis = async (
  location: LocationData,
  task: AnalysisTask,
  language: Language,
  specificItemName?: string
): Promise<AgriResponse> => {
  
  // Map Internal Enum to Prompt Task Descriptions
  let taskDescription = "";
  switch(task) {
      case AnalysisTask.HISTORY: taskDescription = "A. Weather History Analysis (10–15 years)"; break;
      case AnalysisTask.PREDICTION: taskDescription = "B. Future Weather Prediction"; break;
      case AnalysisTask.CROP_REC: taskDescription = "C. Best Crop Recommendation"; break;
      case AnalysisTask.FRUIT_REC: taskDescription = "D. Best Fruit Plant Recommendation (Provide exactly 10 types)"; break;
      case AnalysisTask.CROP_CHECK: taskDescription = "E. Crop Suitability Check"; break;
      case AnalysisTask.FRUIT_CHECK: taskDescription = "F. Fruit Plant Suitability Check"; break;
  }

  const prompt = `
    You are **AgriSense AI**, an advanced Weather, Climate & Agricultural Intelligence Assistant.

    Your responsibilities:
    1. Analyze **10–15 years of historical weather data** and generate insights.
    2. Predict **future weather trends** (temperature, rainfall, humidity, wind, drought risk, flood risk).
    3. Provide climate-based recommendations for the user’s exact **Country → State → District → Taluka → Town/Village → PINCODE**.
    4. Suggest **best crops** and **best fruit plants** based on:
       * Weather patterns
       * Temperature & rainfall suitability
       * Soil data (assumed based on location)
       * Pest/disease risk
       * Seasonal timing
    5. Provide a **Crop/Fruit Suitability Checker** when the user enters a specific name.
    6. Output must always be clear, structured, and farmer-friendly.
    7. If any data is insufficient, make reasonable assumptions and clearly mention them.
    8. Always return practical, actionable agricultural advice.

    ---

    ### **IMPORTANT: Internal Knowledge Usage**
    Use your internal agricultural knowledge for all major crops & fruit plants, including:
    * Required temperature range & Ideal rainfall + irrigation need
    * Suitable climate zone (tropical, dry, humid, cold, subtropical, etc.)
    * Soil type preference (sandy, loamy, black soil, clay, red soil, alluvial)
    * Sun/Sowing/Harvest details
    * Pest/Disease risks
    * Growth difficulty level

    **Use this internal knowledge to evaluate crop/fruit suitability without requiring the user to provide details.**

    ---

    ### **SPECIFIC INSTRUCTION FOR CROP/FRUIT CHECK (Task E & F)**
    If the user selects Task E or F, you **MUST** provide a **Detailed Cultivation Guide** in the 'suitabilityCheck.cultivationGuide' field containing:
    1. **Plantation Distance**: Row-to-row and plant-to-plant spacing.
    2. **Ground Preparation**: Ploughing depth and soil treatment.
    3. **Hole/Pit Preparation**: 
       - Dimensions based on plant height.
       - **Basal Dose**: Explicitly mention adding **Cow dung (FYM), Vermicompost, Organic Compost** and other basal fertilizers in the hole/pit before planting.
    4. **Post-Plantation Care (6-8 Months)**: Watering schedule, staking/support, weeding.
    5. **Fertilizer Schedule**: Provide specific **Organic** and **Chemical** fertilizer suggestions for the growth phase.

    ---

    ### **USER PROMPT**

    **1️⃣ Location Input**
    Country: ${location.country}
    State: ${location.state}
    District: ${location.district}
    Taluka: ${location.taluka}
    Town/Village: ${location.town}
    PINCODE: ${location.pincode}

    **2️⃣ Selected Task**
    ${taskDescription}

    **3️⃣ If Task = E or F → Provide Name:**
    Crop/Fruit Name: ${specificItemName || "N/A"}

    ---

    ## 🧠 **MODEL OUTPUT INSTRUCTION**
    Generate the response strictly as a JSON object matching the provided schema.
    
    **LANGUAGE INSTRUCTION**: 
    The user has selected **${language}**. 
    - Provide all text descriptions, summaries, and names in **${language}**.
    - **EXCEPTION**: Keep the JSON property keys (like 'locationSummary', 'weatherHistory', 'cultivationGuide') in English.
    - **EXCEPTION**: Keep the 'verdict' values strictly in English (e.g., 'Recommended', 'Grow', 'Grow with Care', 'Not Recommended') so the app can render the correct icons.
    - **IMPORTANT**: Always populate the 'englishName' field with the English translation of the crop/fruit name.
    
    ${task === AnalysisTask.FRUIT_REC ? "**IMPORTANT**: You MUST return exactly **10** different fruit plant recommendations." : ""}

    **Structure Requirements**:
    - **Location Summary**: Clear climate profile for ${location.pincode}.
    - **Weather History**: Avg max/min temperature & seasonal rainfall.
    - **Future Prediction**: 12-month forecast.
    - **Recommendations**: Suitability Score, Season, Yield, Soil, Water.
    - **Suitability Check**: detailed cultivation guide is MANDATORY.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AgriResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate analysis. Please check your connection or try again.");
  }
};