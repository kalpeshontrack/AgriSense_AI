import React, { useState } from 'react';
import { Header } from './components/Header';
import { LocationForm } from './components/LocationForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LocationData, AnalysisTask, AgriResponse, Language } from './types';
import { generateAgriAnalysis } from './services/geminiService';
import { CloudSun, Sprout, Trees, Search, History, LineChart, Loader2 } from 'lucide-react';

// UI Translations
const UI_TEXT = {
  English: {
    title: "AgriSense AI",
    subtitle: "Smart Climate & Crop Intelligence",
    location: "Location Details",
    pincode: "PINCODE",
    pincodePlaceholder: "e.g. 412207",
    autoFill: "Enter PIN to auto-fill details",
    country: "Country",
    state: "State",
    district: "District",
    taluka: "Taluka",
    village: "Town/Village",
    selectTask: "Select Intelligence Task",
    analyzeBtn: "Generate Analysis",
    analyzing: "Analyzing Data...",
    enterName: "Enter Name",
    guideTitle: "Cultivation Master Guide",
    distance: "Plantation Distance",
    groundPrep: "Ground Preparation",
    holePrep: "Hole Prep & Basal Dose",
    care: "Care (First 6-8 Months)",
    fertilizers: "Fertilizer Schedule",
    organic: "Organic",
    chemical: "Chemical",
    tasks: {
      history: "Weather History (10y)",
      prediction: "Future Forecast",
      cropRec: "Best Crops",
      fruitRec: "Best Fruits",
      cropCheck: "Check Crop Suitability",
      fruitCheck: "Check Fruit Suitability",
      descHistory: "Past trends & rainfall analysis",
      descPrediction: "12-month predictive climate model",
      descCropRec: "Recommended crops for your soil & PINCODE",
      descFruitRec: "Orchard planning & fruit suitability",
      descCropCheck: "Can I grow this crop here?",
      descFruitCheck: "Can I plant this fruit tree?"
    }
  },
  Marathi: {
    title: "ॲग्रीसेन्स एआय",
    subtitle: "स्मार्ट हवामान आणि पीक सल्लागार",
    location: "स्थान तपशील",
    pincode: "पिनकोड",
    pincodePlaceholder: "उदा. 412207",
    autoFill: "माहिती भरण्यासाठी पिन टाका",
    country: "देश",
    state: "राज्य",
    district: "जिल्हा",
    taluka: "तालुका",
    village: "गाव/शहर",
    selectTask: "माहिती कार्य निवडा",
    analyzeBtn: "विश्लेषण करा",
    analyzing: "विश्लेषण करत आहे...",
    enterName: "नाव टाका",
    guideTitle: "लागवड मार्गदर्शक",
    distance: "लागवड अंतर",
    groundPrep: "जमीन तयारी",
    holePrep: "खड्डा तयारी आणि खते",
    care: "निगा (पहिले ६-८ महिने)",
    fertilizers: "खत व्यवस्थापन",
    organic: "सेंद्रिय",
    chemical: "रासायनिक",
    tasks: {
      history: "हवामान इतिहास (१० वर्ष)",
      prediction: "भविष्यातील अंदाज",
      cropRec: "उत्तम पिके",
      fruitRec: "उत्तम फळझाडे",
      cropCheck: "पीक योग्यता तपासा",
      fruitCheck: "फळझाड योग्यता तपासा",
      descHistory: "मागील ट्रेंड आणि पावसाचे विश्लेषण",
      descPrediction: "१२ महिन्यांचे अंदाजित हवामान प्रारूप",
      descCropRec: "तुमच्या जमिनीसाठी आणि पिनकोडसाठी शिफारस",
      descFruitRec: "फळबागांचे नियोजन आणि योग्यता",
      descCropCheck: "मी हे पीक येथे घेऊ शकतो का?",
      descFruitCheck: "मी हे फळझाड लावू शकतो का?"
    }
  },
  Hindi: {
    title: "एग्रीसेंस एआई",
    subtitle: "स्मार्ट मौसम और फसल सलाहकार",
    location: "स्थान विवरण",
    pincode: "पिनकोड",
    pincodePlaceholder: "उदा. 412207",
    autoFill: "विवरण भरने के लिए पिन दर्ज करें",
    country: "देश",
    state: "राज्य",
    district: "जिला",
    taluka: "तालुका",
    village: "गाँव/शहर",
    selectTask: "कार्य चुनें",
    analyzeBtn: "विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    enterName: "नाम दर्ज करें",
    guideTitle: "खेती मार्गदर्शिका",
    distance: "रोपण दूरी",
    groundPrep: "भूमि की तैयारी",
    holePrep: "गड्ढा तैयारी और खाद",
    care: "देखभाल (पहले 6-8 महीने)",
    fertilizers: "खाद अनुसूची",
    organic: "जैविक",
    chemical: "रासायनिक",
    tasks: {
      history: "मौसम इतिहास (10 वर्ष)",
      prediction: "भविष्य का पूर्वानुमान",
      cropRec: "सर्वोत्तम फसलें",
      fruitRec: "सर्वोत्तम फल",
      cropCheck: "फसल उपयुक्तता की जाँच करें",
      fruitCheck: "फल उपयुक्तता की जाँच करें",
      descHistory: "पिछले रुझान और वर्षा विश्लेषण",
      descPrediction: "12 महीने का पूर्वानुमानित जलवायु मॉडल",
      descCropRec: "आपकी मिट्टी और पिनकोड के लिए अनुशंसित",
      descFruitRec: "बागवानी योजना और फल उपयुक्तता",
      descCropCheck: "क्या मैं यहाँ यह फसल उगा सकता हूँ?",
      descFruitCheck: "क्या मैं यह फलदार वृक्ष लगा सकता हूँ?"
    }
  },
  Gujarati: {
    title: "એગ્રીસેન્સ એઆઈ",
    subtitle: "સ્માર્ટ હવામાન અને પાક સલાહકાર",
    location: "સ્થાન વિગતો",
    pincode: "પિનકોડ",
    pincodePlaceholder: "દા.ત. 412207",
    autoFill: "વિગતો ભરવા માટે પિન દાખલ કરો",
    country: "દેશ",
    state: "રાજ્ય",
    district: "જિલ્લો",
    taluka: "તાલુકા",
    village: "ગામ/શહેર",
    selectTask: "કાર્ય પસંદ કરો",
    analyzeBtn: "વિશ્લેષણ કરો",
    analyzing: "વિશ્લેષણ થઈ રહ્યું છે...",
    enterName: "નામ દાખલ કરો",
    guideTitle: "ખેતી માર્ગદર્શિકા",
    distance: "વાવેતર અંતર",
    groundPrep: "જમીન તૈયારી",
    holePrep: "ખાડા તૈયારી અને ખાતર",
    care: "સંભાળ (પ્રથમ 6-8 મહિના)",
    fertilizers: "ખાતર સમયપત્રક",
    organic: "જૈવિક",
    chemical: "રાસાયણિક",
    tasks: {
      history: "હવામાન ઇતિહાસ (10 વર્ષ)",
      prediction: "ભવિષ્યની આગાહી",
      cropRec: "શ્રેષ્ઠ પાક",
      fruitRec: "શ્રેષ્ઠ ફળો",
      cropCheck: "પાક યોગ્યતા તપાસો",
      fruitCheck: "ફળ યોગ્યતા તપાસો",
      descHistory: "ભૂતકાળના વલણો અને વરસાદનું વિશ્લેષણ",
      descPrediction: "12 મહિનાની આગાહી",
      descCropRec: "તમારી જમીન અને પિનકોડ માટે ભલામણ કરેલ",
      descFruitRec: "બાગાયત આયોજન અને ફળ યોગ્યતા",
      descCropCheck: "શું હું અહીં આ પાક ઉગાડી શકું?",
      descFruitCheck: "શું હું આ ફળનું વૃક્ષ વાવી શકું?"
    }
  },
  Bengali: {
    title: "এগ্রিসেন্স এআই",
    subtitle: "স্মার্ট আবহাওয়া এবং শস্য উপদেষ্টা",
    location: "অবস্থানের বিবরণ",
    pincode: "পিনকোড",
    pincodePlaceholder: "যেমন 412207",
    autoFill: "বিস্তারিত পূরণ করতে পিন লিখুন",
    country: "দেশ",
    state: "রাজ্য",
    district: "জেলা",
    taluka: "তালুক",
    village: "গ্রাম/শহর",
    selectTask: "কাজ নির্বাচন করুন",
    analyzeBtn: "বিশ্লেষণ করুন",
    analyzing: "বিশ্লেষণ করা হচ্ছে...",
    enterName: "নাম লিখুন",
    guideTitle: "চাষাবাদ নির্দেশিকা",
    distance: "রোপণ দূরত্ব",
    groundPrep: "জমি তৈরি",
    holePrep: "গর্ত তৈরি ও সার প্রয়োগ",
    care: "যত্ন (প্রথম ৬-৮ মাস)",
    fertilizers: "সারের সময়সূচী",
    organic: "জৈব",
    chemical: "রাসায়নিক",
    tasks: {
      history: "আবহাওয়ার ইতিহাস (১০ বছর)",
      prediction: "ভবিষ্যতের পূর্বাভাস",
      cropRec: "সেরা ফসল",
      fruitRec: "সেরা ফল",
      cropCheck: "ফসলের উপযুক্ততা পরীক্ষা করুন",
      fruitCheck: "ফলের উপযুক্ততা পরীক্ষা করুন",
      descHistory: "অতীতের প্রবণতা এবং বৃষ্টিপাত বিশ্লেষণ",
      descPrediction: "১২ মাসের পূর্বাভাস",
      descCropRec: "আপনার মাটি এবং পিনকোডের জন্য সুপারিশকৃত",
      descFruitRec: "বাগান পরিকল্পনা এবং ফলের উপযুক্ততা",
      descCropCheck: "আমি কি এখানে এই ফসল ফলাতে পারি?",
      descFruitCheck: "আমি কি এই ফলের গাছ লাগাতে পারি?"
    }
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('English');
  const [location, setLocation] = useState<LocationData>({
    country: '',
    state: '',
    district: '',
    taluka: '',
    town: '',
    pincode: ''
  });
  const [selectedTask, setSelectedTask] = useState<AnalysisTask | null>(null);
  const [customItemName, setCustomItemName] = useState('');
  const [result, setResult] = useState<AgriResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current language texts
  const t = UI_TEXT[language] || UI_TEXT['English'];

  const handleLocationChange = (key: keyof LocationData, value: string) => {
    setLocation(prev => ({ ...prev, [key]: value }));
  };

  const handleTaskSelect = (task: AnalysisTask) => {
    setSelectedTask(task);
    // If it's a check task, clear previous name to force entry, or keep if user wants to re-check
    if (task !== AnalysisTask.CROP_CHECK && task !== AnalysisTask.FRUIT_CHECK) {
      setCustomItemName('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    
    // Basic validation
    if (!location.country || !location.pincode) {
      setError(language === 'English' ? "Please enter at least Country and PINCODE." : "Please enter Country and PINCODE.");
      return;
    }

    if ((selectedTask === AnalysisTask.CROP_CHECK || selectedTask === AnalysisTask.FRUIT_CHECK) && !customItemName) {
       setError(t.enterName);
       return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateAgriAnalysis(location, selectedTask, language, customItemName);
      setResult(data);
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const taskList = [
    { id: AnalysisTask.HISTORY, label: t.tasks.history, icon: History, desc: t.tasks.descHistory },
    { id: AnalysisTask.PREDICTION, label: t.tasks.prediction, icon: LineChart, desc: t.tasks.descPrediction },
    { id: AnalysisTask.CROP_REC, label: t.tasks.cropRec, icon: Sprout, desc: t.tasks.descCropRec },
    { id: AnalysisTask.FRUIT_REC, label: t.tasks.fruitRec, icon: Trees, desc: t.tasks.descFruitRec },
    { id: AnalysisTask.CROP_CHECK, label: t.tasks.cropCheck, icon: Search, desc: t.tasks.descCropCheck },
    { id: AnalysisTask.FRUIT_CHECK, label: t.tasks.fruitCheck, icon: CloudSun, desc: t.tasks.descFruitCheck },
  ];

  return (
    <div className="min-h-screen bg-theme-cream pb-20">
      <Header language={language} onLanguageChange={setLanguage} texts={t} />
      
      <main className="container mx-auto px-4 pt-8 max-w-6xl">
        {/* Location Section */}
        <LocationForm data={location} onChange={handleLocationChange} texts={t} />

        {/* Task Selection Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-theme-green mb-4 flex items-center gap-2">
            <span className="bg-theme-orange text-white w-8 h-8 rounded-full inline-flex items-center justify-center text-lg shadow-md">2</span>
            {t.selectTask}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskList.map((task) => {
              const Icon = task.icon;
              const isSelected = selectedTask === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskSelect(task.id as AnalysisTask)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    flex flex-col gap-2 group
                    ${isSelected 
                      ? 'border-theme-orange bg-orange-50 shadow-md ring-1 ring-theme-orange' 
                      : 'border-white bg-white shadow-sm hover:border-theme-yellow hover:shadow-md hover:bg-yellow-50'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg w-fit transition-colors ${isSelected ? 'bg-theme-orange text-white' : 'bg-green-100 text-theme-green group-hover:bg-theme-yellow'}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isSelected ? 'text-orange-900' : 'text-theme-green'}`}>{task.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{task.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input Section (Only if Check selected) */}
        {(selectedTask === AnalysisTask.CROP_CHECK || selectedTask === AnalysisTask.FRUIT_CHECK) && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-theme-orange animate-fade-in">
             <label className="block text-sm font-bold text-theme-green mb-2">
               {t.enterName}
             </label>
             <div className="flex gap-2">
               <input
                 type="text"
                 value={customItemName}
                 onChange={(e) => setCustomItemName(e.target.value)}
                 className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-orange focus:border-theme-orange outline-none transition text-lg text-theme-green font-medium"
                 placeholder={selectedTask === AnalysisTask.CROP_CHECK ? "e.g. Turmeric" : "e.g. Dragon Fruit"}
               />
             </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col items-center mb-12">
           {error && (
             <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded-md border border-red-200 text-sm font-bold">
               {error}
             </div>
           )}
           
           <button
             onClick={handleSubmit}
             disabled={loading || !selectedTask}
             className={`
               px-10 py-4 rounded-full font-extrabold text-xl shadow-xl flex items-center gap-2 transition-all transform hover:scale-105
               ${loading || !selectedTask 
                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                 : 'bg-gradient-to-r from-theme-orange to-orange-600 text-white hover:shadow-orange-500/40 border-2 border-white'
               }
             `}
           >
             {loading ? (
               <>
                 <Loader2 className="animate-spin" /> {t.analyzing}
               </>
             ) : (
               t.analyzeBtn
             )}
           </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="animate-slide-up scroll-mt-24" id="results">
            <ResultsDisplay result={result} texts={t} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;