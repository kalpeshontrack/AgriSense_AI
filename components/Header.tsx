import React from 'react';
import { Sprout, Globe } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  texts: any;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, texts }) => {
  return (
    <header className="bg-theme-green text-theme-yellow py-4 shadow-lg sticky top-0 z-50 border-b-4 border-theme-orange">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-orange rounded-full shadow-lg">
              <Sprout size={28} className="text-theme-green" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-theme-yellow">{texts.title}</h1>
              <p className="text-orange-200 text-xs md:text-sm font-medium">{texts.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 border border-theme-yellow/30">
          <Globe size={16} className="text-theme-yellow" />
          <select 
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-transparent text-theme-yellow text-sm font-medium focus:outline-none cursor-pointer [&>option]:text-black"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Gujarati">ગુજરાતી (Gujarati)</option>
            <option value="Bengali">বাংলা (Bengali)</option>
          </select>
        </div>
      </div>
    </header>
  );
};