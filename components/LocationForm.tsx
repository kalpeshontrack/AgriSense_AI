import React, { useState } from 'react';
import { LocationData } from '../types';
import { MapPin, Loader2, Navigation, Check } from 'lucide-react';

interface LocationFormProps {
  data: LocationData;
  onChange: (key: keyof LocationData, value: string) => void;
  texts: any;
}

export const LocationForm: React.FC<LocationFormProps> = ({ data, onChange, texts }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [villageOptions, setVillageOptions] = useState<string[]>([]);

  const handleChange = (field: keyof LocationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.value);
  };

  const fetchLocationDetails = async (pincode: string) => {
    setIsLoading(true);
    setStatusMsg("Fetching location details...");
    try {
      // Using public API for Indian Postal Codes to auto-fill data
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const result = await response.json();

      if (result && result[0].Status === "Success") {
        const details = result[0].PostOffice[0];
        const places = result[0].PostOffice.map((po: any) => po.Name);

        // Auto-fill fields
        onChange('country', details.Country);
        onChange('state', details.State);
        onChange('district', details.District);
        onChange('taluka', details.Block);
        
        // Populate village suggestions
        setVillageOptions(places);
        
        setStatusMsg("Location found!");
        setTimeout(() => setStatusMsg(""), 3000);
      } else {
        setStatusMsg("Details not found.");
      }
    } catch (error) {
      console.error("Error fetching pincode:", error);
      setStatusMsg("Manual entry required.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers
    if (!/^\d*$/.test(val)) return;
    
    onChange('pincode', val);

    // Trigger fetch when 6 digits (standard pincode length)
    if (val.length === 6) {
      fetchLocationDetails(val);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-theme-green animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-theme-green">
          <MapPin className="text-theme-orange" size={24} />
          <h2 className="text-xl font-bold">{texts.location}</h2>
        </div>
        {statusMsg && (
          <div className={`text-sm flex items-center gap-1 ${statusMsg.includes("found") ? "text-theme-green font-bold" : "text-theme-orange"}`}>
             {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
             {statusMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pincode First - It drives the automation */}
        <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-bold text-theme-green mb-1">
            {texts.pincode} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.pincode}
              onChange={handlePincodeChange}
              maxLength={6}
              className="w-full pl-10 pr-4 py-2 border-2 border-theme-yellow/50 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-theme-orange focus:border-theme-orange outline-none transition font-bold text-theme-green placeholder-gray-400"
              placeholder={texts.pincodePlaceholder}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-orange">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1">
            <Loader2 size={12} className={isLoading ? "animate-spin" : "hidden"} />
            {texts.autoFill}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{texts.country}</label>
          <input
            type="text"
            value={data.country}
            onChange={handleChange('country')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-green outline-none transition bg-gray-50"
            placeholder="Auto-filled"
            readOnly={!!data.country}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{texts.state}</label>
          <input
            type="text"
            value={data.state}
            onChange={handleChange('state')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-green outline-none transition bg-gray-50"
            placeholder="Auto-filled"
            readOnly={!!data.state}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{texts.district}</label>
          <input
            type="text"
            value={data.district}
            onChange={handleChange('district')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-green outline-none transition bg-gray-50"
            placeholder="Auto-filled"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{texts.taluka}</label>
          <input
            type="text"
            value={data.taluka}
            onChange={handleChange('taluka')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-green outline-none transition bg-gray-50"
            placeholder="Auto-filled"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{texts.village}</label>
          <input
            type="text"
            list="village-options"
            value={data.town}
            onChange={handleChange('town')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-green outline-none transition"
            placeholder="Select or type..."
          />
          <datalist id="village-options">
            {villageOptions.map((village, index) => (
              <option key={index} value={village} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
};