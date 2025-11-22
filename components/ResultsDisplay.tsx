import React from 'react';
import { AgriResponse } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Droplets, Thermometer, CheckCircle, AlertTriangle, XCircle, TrendingUp, Calendar, BarChart3, Sprout, Shovel, FlaskConical } from 'lucide-react';

interface ResultsDisplayProps {
  result: AgriResponse;
  texts: any;
}

// Helper to generate stable image URL based on keyword
const getImageUrl = (keyword: string, englishName?: string) => {
  // Use English name if available for better image results, otherwise fallback to localized name
  const searchTerm = englishName || keyword;
  
  // Create a simple hash of the name to use as a seed
  // This ensures the image is "random" but stable (same crop always gets same image)
  const seed = searchTerm.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Using Pollinations.ai with specific prompt engineering
  return `https://image.pollinations.ai/prompt/realistic%20${encodeURIComponent(searchTerm)}%20plant%20crop%20agriculture%20farming%20harvest%20high%20quality%204k%20photography?width=600&height=400&nologo=true&seed=${seed}`;
};

// Helper to render verdict badge
const VerdictBadge = ({ verdict }: { verdict: string }) => {
  const v = verdict ? verdict.toLowerCase() : "";
  let colorClass = "bg-gray-100 text-gray-800";
  let Icon = CheckCircle;

  // Logic relies on English keywords returned by model as per instruction
  if (v.includes('highly') || (v.includes('grow') && !v.includes('care'))) {
    colorClass = "bg-theme-green text-theme-yellow border-theme-green";
    Icon = CheckCircle;
  } else if (v.includes('care') || v.includes('risky')) {
    colorClass = "bg-theme-orange text-white border-theme-orangeDark";
    Icon = AlertTriangle;
  } else if (v.includes('not')) {
    colorClass = "bg-red-100 text-red-800 border-red-200";
    Icon = XCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${colorClass} shadow-sm`}>
      <Icon size={14} />
      {verdict}
    </span>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, texts }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Location Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-8 border-theme-orange">
        <h3 className="text-lg font-bold text-theme-green mb-2">📍 {texts.location} Summary</h3>
        <p className="text-gray-700 leading-relaxed font-medium">{result.locationSummary}</p>
      </div>

      {/* Weather Charts - Render only if data exists */}
      {(result.weatherHistory || result.futureForecast) && (
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-theme-green">
          <div className="flex items-center gap-2 mb-6 text-theme-green">
            <BarChart3 className="text-theme-orange" />
            <h3 className="text-xl font-bold">
              {result.weatherHistory ? texts.tasks.history : texts.tasks.prediction}
            </h3>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.weatherHistory || result.futureForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="label" stroke="#166534" />
                <YAxis yAxisId="left" orientation="left" stroke="#ea580c" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '2px solid #fb923c', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ea580c" strokeWidth={3} activeDot={{ r: 8 }} name="Temp (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="rainfall" stroke="#0ea5e9" strokeWidth={3} name="Rainfall (mm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recommendations List with Images */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {result.recommendations.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-theme-yellow flex flex-col">
              {/* Image Section */}
              <div className="h-56 w-full overflow-hidden relative group">
                <img 
                  src={getImageUrl(item.name, item.englishName)} 
                  alt={item.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                <div className="absolute top-0 right-0 bg-theme-yellow text-theme-green px-3 py-1 rounded-bl-lg font-bold text-sm shadow-md">
                  {item.season}
                </div>
              </div>

              <div className="bg-theme-green p-4 flex justify-between items-start relative z-10 -mt-1">
                <h4 className="font-bold text-xl text-white leading-tight">{item.name}</h4>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs font-bold text-theme-green shadow-sm shrink-0">
                  <TrendingUp size={12} className="text-theme-orange" />
                  {item.suitabilityScore}%
                </div>
              </div>

              <div className="p-4 space-y-3 bg-theme-cream flex-grow">
                <div className="flex items-center justify-between text-sm border-b border-dashed border-gray-300 pb-2">
                  <span className="text-gray-600 flex items-center gap-1"><Droplets size={14} className="text-blue-500"/> Water</span>
                  <span className="font-medium text-gray-800">{item.waterRequirement}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-dashed border-gray-300 pb-2">
                  <span className="text-gray-600 flex items-center gap-1"><Thermometer size={14} className="text-red-500"/> Difficulty</span>
                  <span className="font-medium text-gray-800">{item.difficulty}</span>
                </div>
                <div className="pt-2 mt-2">
                  <VerdictBadge verdict={item.verdict} />
                </div>
                <p className="text-xs text-gray-600 mt-2 italic leading-relaxed bg-white p-2 rounded border border-gray-100">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suitability Check Single Result with Hero Image */}
      {result.suitabilityCheck && (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto border-t-8 border-theme-green">
           {/* Hero Image */}
           <div className="w-full h-72 relative">
             <img 
               src={getImageUrl(result.suitabilityCheck.name, result.suitabilityCheck.englishName)}
               alt={result.suitabilityCheck.name}
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-theme-green via-transparent to-transparent opacity-90"></div>
             <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-4xl font-extrabold text-theme-yellow mb-2 drop-shadow-lg">{result.suitabilityCheck.name}</h3>
                    <p className="text-white/90 font-medium text-lg">Suitability Analysis Report</p>
                  </div>
                  <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                    <div className="text-5xl font-black text-theme-orange">{result.suitabilityCheck.suitabilityScore}%</div>
                    <span className="text-xs text-white uppercase tracking-wider font-bold">Compatibility</span>
                  </div>
                </div>
             </div>
           </div>

          <div className="p-8">
            {/* Basic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="space-y-4 bg-yellow-50 p-6 rounded-xl border border-theme-yellow">
                  <div className="flex justify-between border-b border-dashed border-yellow-200 pb-2">
                     <span className="text-gray-600 font-medium">Season</span>
                     <span className="font-bold text-theme-green">{result.suitabilityCheck.season}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-yellow-200 pb-2">
                     <span className="text-gray-600 font-medium">Water Needs</span>
                     <span className="font-bold text-theme-green">{result.suitabilityCheck.waterRequirement}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-yellow-200 pb-2">
                     <span className="text-gray-600 font-medium">Yield Potential</span>
                     <span className="font-bold text-theme-green">{result.suitabilityCheck.yieldExpected}</span>
                  </div>
               </div>
               <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                 <h4 className="font-bold text-theme-green mb-4">AI Verdict</h4>
                 <VerdictBadge verdict={result.suitabilityCheck.verdict} />
                 <p className="mt-4 text-sm text-green-900 leading-relaxed font-medium">
                   {result.suitabilityCheck.description}
                 </p>
               </div>
            </div>

            {/* Cultivation Guide - Render only if present */}
            {result.suitabilityCheck.cultivationGuide && (
              <div className="mt-10 border-t-2 border-gray-100 pt-8">
                <div className="flex items-center gap-4 mb-6">
                  <h4 className="text-2xl font-bold text-theme-green flex items-center gap-2">
                    <Sprout className="text-theme-orange" size={28} /> {texts.guideTitle}
                  </h4>
                  {/* Small Context Image in Header */}
                  <img 
                    src={getImageUrl(result.suitabilityCheck.name, result.suitabilityCheck.englishName)}
                    alt="context" 
                    className="w-10 h-10 rounded-full border-2 border-theme-orange object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preparation Section */}
                  <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition">
                    <h5 className="font-bold text-orange-900 mb-4 flex items-center gap-2 text-lg">
                      <Shovel size={20} className="text-orange-600" /> {texts.groundPrep}
                    </h5>
                    <div className="space-y-3 text-sm text-gray-800">
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                         <span className="font-bold block mb-1 text-orange-700">{texts.distance}</span>
                         {result.suitabilityCheck.cultivationGuide.plantationDistance}
                       </div>
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                         <span className="font-bold block mb-1 text-orange-700">{texts.holePrep}</span>
                         {result.suitabilityCheck.cultivationGuide.holePreparation}
                       </div>
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                         <span className="font-bold block mb-1 text-orange-700">Soil Prep</span>
                         {result.suitabilityCheck.cultivationGuide.groundPreparation}
                       </div>
                    </div>
                  </div>

                  {/* Care & Fertilizers Section */}
                  <div className="bg-green-50 p-5 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition">
                    <h5 className="font-bold text-theme-green mb-4 flex items-center gap-2 text-lg">
                      <FlaskConical size={20} className="text-green-600" /> {texts.fertilizers} & {texts.care}
                    </h5>
                     <div className="space-y-3 text-sm text-gray-800">
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                         <span className="font-bold block mb-1 text-green-700">{texts.organic}</span>
                         {result.suitabilityCheck.cultivationGuide.fertilizerSchedule.organic}
                       </div>
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                         <span className="font-bold block mb-1 text-green-700">{texts.chemical}</span>
                         {result.suitabilityCheck.cultivationGuide.fertilizerSchedule.chemical}
                       </div>
                       <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                         <span className="font-bold block mb-1 text-green-700">{texts.care}</span>
                         {result.suitabilityCheck.cultivationGuide.careInstructions}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};