
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../services/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 1. Check Local Storage
    const saved = localStorage.getItem('agri_language');
    if (saved && TRANSLATIONS[saved as Language]) {
      return saved as Language;
    }

    // 2. Check Browser Language
    const browserLang = navigator.language.toLowerCase(); // e.g. 'en-US', 'hi', 'kn'
    if (browserLang.startsWith('hi')) return 'Hindi';
    if (browserLang.startsWith('kn')) return 'Kannada';
    if (browserLang.startsWith('ta')) return 'Tamil';
    if (browserLang.startsWith('te')) return 'Telugu';
    if (browserLang.startsWith('ml')) return 'Malayalam';
    if (browserLang.startsWith('bn')) return 'Bengali';
    if (browserLang.startsWith('mr')) return 'Marathi';
    if (browserLang.startsWith('gu')) return 'Gujarati';
    if (browserLang.startsWith('or')) return 'Odia';

    // Default
    return 'English';
  });

  useEffect(() => {
    localStorage.setItem('agri_language', language);
  }, [language]);

  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['English'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
