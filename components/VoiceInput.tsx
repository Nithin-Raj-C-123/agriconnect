
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  className?: string;
  isCurrency?: boolean;
  isQuantity?: boolean;
  onNext?: () => void;
  onSubmit?: () => void;
  inputRef?: React.RefObject<any>;
}

// Map App Languages to Speech API Codes
const LANG_CODES: Record<string, string> = {
  'English': 'en-IN',
  'Hindi': 'hi-IN',
  'Kannada': 'kn-IN',
  'Tamil': 'ta-IN',
  'Telugu': 'te-IN',
  'Malayalam': 'ml-IN',
  'Bengali': 'bn-IN',
  'Marathi': 'mr-IN'
};

// Voice Commands Dictionary
const COMMANDS: Record<string, { next: string[], clear: string[], submit: string[] }> = {
  'en-IN': { next: ['next', 'next field', 'go to'], clear: ['clear', 'reset', 'delete'], submit: ['submit', 'post', 'save'] },
  'hi-IN': { next: ['agla', 'next'], clear: ['saaf', 'hatao', 'clear'], submit: ['jama', 'submit', 'post'] },
  // Add others as needed, defaulting to English logic for basic commands if not specific
};

export const VoiceInput: React.FC<VoiceInputProps> = ({
  label, value, onChange, type = 'text', placeholder, className,
  isCurrency, isQuantity, onNext, onSubmit, inputRef
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { language } = useLanguage();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        setIsSupported(true);
    }
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[language] || 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const parseInput = (transcript: string): string => {
    let cleanText = transcript.toLowerCase().trim();
    const langCode = LANG_CODES[language] || 'en-IN';
    const cmds = COMMANDS[langCode] || COMMANDS['en-IN'];

    // Check Commands
    if (cmds.next.some(cmd => cleanText.includes(cmd))) {
      onNext?.();
      return value; // Don't update value
    }
    if (cmds.submit.some(cmd => cleanText.includes(cmd))) {
      onSubmit?.();
      return value;
    }
    if (cmds.clear.some(cmd => cleanText.includes(cmd))) {
      return '';
    }

    // --- LOGIC: Unit Conversion & Formatting ---
    
    // 1. Quantity (Quintal/Ton -> Kg)
    if (isQuantity) {
      cleanText = cleanText.replace(/,/g, '');
      const numberMatch = cleanText.match(/(\d+(\.\d+)?)/);
      if (numberMatch) {
        let num = parseFloat(numberMatch[0]);
        if (cleanText.includes('quintal') || cleanText.includes('kvintal')) num *= 100;
        else if (cleanText.includes('ton') || cleanText.includes('tonne')) num *= 1000;
        return num.toString();
      }
    }

    // 2. Currency
    if (isCurrency) {
      cleanText = cleanText.replace(/,/g, '');
      const numberMatch = cleanText.match(/(\d+(\.\d+)?)/);
      if (numberMatch) return numberMatch[0];
    }

    // 3. Date (Yesterday/Today/Tomorrow)
    if (type === 'date') {
      const today = new Date();
      if (cleanText.includes('today') || cleanText.includes('aaj')) {
        return today.toISOString().split('T')[0];
      }
      if (cleanText.includes('yesterday') || cleanText.includes('kal')) { // Simple 'kal' check, context matters in hindi but simplified here
        const y = new Date(today);
        y.setDate(today.getDate() - 1);
        return y.toISOString().split('T')[0];
      }
    }

    // Default: capitalize first letter for text
    if (type === 'text' || type === 'textarea') {
      return transcript.charAt(0).toUpperCase() + transcript.slice(1);
    }

    return transcript;
  };

  const startListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    const langCode = LANG_CODES[language] || 'en-IN';
    recognitionRef.current.lang = langCode;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      speak(`Please say ${label}`);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech Error", event.error);
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
         speak("Sorry, I didn't catch that.");
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      setIsProcessing(true);
      const transcript = event.results[0][0].transcript;
      
      const processed = parseInput(transcript);
      
      if (processed !== value) {
         onChange(processed);
         speak(`Recorded ${processed}`);
      }
      setIsProcessing(false);
    };

    recognitionRef.current.start();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-slate-700 mb-1 flex justify-between">
        {label}
        {isListening && <span className="text-xs text-agri-600 animate-pulse font-medium">Listening...</span>}
      </label>
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none transition-all"
            placeholder={placeholder || `Type or speak ${label.toLowerCase()}...`}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none transition-all"
            placeholder={placeholder || `Type or speak ${label.toLowerCase()}...`}
          />
        )}
        
        {isSupported && (
          <button
            type="button"
            onClick={startListening}
            className={`absolute right-2 top-2 p-2 rounded-full transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : isProcessing 
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-slate-100 text-slate-500 hover:bg-agri-100 hover:text-agri-600'
            }`}
            title="Tap to Speak"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>
      {isListening && (
        <p className="text-[10px] text-slate-400 mt-1 pl-1">
          Try saying: "Next", "Clear", or "5 Quintal"
        </p>
      )}
    </div>
  );
};
