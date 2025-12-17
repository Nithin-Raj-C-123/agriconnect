
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, X, Loader2, StopCircle, Bell, HelpCircle, Navigation, ToggleLeft, ToggleRight, WifiOff, ChevronDown, Globe } from 'lucide-react';
import { generateAudioGuidance, getFarmerAssistantResponse } from '../services/geminiService';
import { Language, Notification, User, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioAssistantProps {
  notifications?: Notification[];
  currentUser?: User | null;
  onNavigate?: (view: string) => void;
  currentView?: string;
}

// Language Code Map for Web Speech API
const LANG_CODES: Record<string, string> = {
  'English': 'en-IN',
  'Hindi': 'hi-IN',
  'Kannada': 'kn-IN',
  'Tamil': 'ta-IN',
  'Telugu': 'te-IN',
  'Malayalam': 'ml-IN',
  'Bengali': 'bn-IN',
  'Marathi': 'mr-IN',
  'Gujarati': 'gu-IN',
  'Punjabi': 'pa-IN'
};

const OFFLINE_RESPONSES: Record<string, string> = {
  'English': "I am currently offline. Please check soil moisture by feeling the earth 2 inches deep. If dry, water immediately.",
  'Hindi': "मैं अभी ऑफ़लाइन हूं। कृपया 2 इंच गहराई तक मिट्टी को छूकर नमी की जांच करें। यदि सूखी है, तो तुरंत पानी दें।",
};

export const AudioAssistant: React.FC<AudioAssistantProps> = ({ notifications = [], currentUser, onNavigate, currentView = 'home' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [continuousMode, setContinuousMode] = useState(false);
  const [autoGuide, setAutoGuide] = useState(true); // Default enabled for context awareness
  const [lastAudioBuffer, setLastAudioBuffer] = useState<ArrayBuffer | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Support Bar State
  const [showSupportLanguages, setShowSupportLanguages] = useState(false);

  const { language: appLanguage, setLanguage, t } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Sync with App Language initially
  useEffect(() => {
    setSelectedLanguage(appLanguage);
  }, [appLanguage]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // We handle continuous loop manually
        recognitionRef.current.interimResults = true;
    }
  }, []);

  // Proactive Contextual Guidance
  useEffect(() => {
    if (autoGuide && currentUser?.role === Role.FARMER) {
       // Small delay to ensure view transition is complete and not overwhelm user
       const timer = setTimeout(() => handlePageGuidance(), 1000);
       return () => clearTimeout(timer);
    }
  }, [currentView, autoGuide]);

  const stopAudio = () => {
    if (currentSourceRef.current) {
        try {
            currentSourceRef.current.stop();
        } catch (e) {
            // Ignore if already stopped
        }
        currentSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const pcmToAudioBuffer = (buffer: ArrayBuffer, ctx: AudioContext, sampleRate: number = 24000) => {
    const pcm16 = new Int16Array(buffer);
    const float32 = new Float32Array(pcm16.length);
    
    for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32);
    return audioBuffer;
  };

  const playAudio = async (buffer: ArrayBuffer) => {
    stopAudio(); // Stop any previous audio
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      // Decode raw PCM instead of using decodeAudioData (which expects file headers)
      const audioData = pcmToAudioBuffer(buffer.slice(0), ctx); 
      
      const source = ctx.createBufferSource();
      source.buffer = audioData;
      source.connect(ctx.destination);
      currentSourceRef.current = source;
      source.start(0);
      setIsPlaying(true);
      
      source.onended = () => {
        setIsPlaying(false);
        if (continuousMode && isOpen) startListening(); // Resume listening if continuous mode is on
      };
    } catch (e) {
      console.error("Audio Playback Error", e);
      setIsPlaying(false);
    }
  };

  const handlePageGuidance = async (langOverride?: Language) => {
    if (!navigator.onLine) return;
    
    const targetLang = langOverride || selectedLanguage;

    // Generate guidance specifically for the current page
    const context = {
      location: currentUser?.location || 'India',
      weather: { temp: '28C', condition: 'Sunny' },
      page: currentView,
      userRole: currentUser?.role || 'Guest'
    };

    try {
      const aiText = await getFarmerAssistantResponse("", context, targetLang, 'guidance');
      setResponse(aiText);
      
      const audioBuffer = await generateAudioGuidance(aiText, targetLang);
      if (audioBuffer) {
         setLastAudioBuffer(audioBuffer);
         playAudio(audioBuffer);
         if (!isOpen) setIsOpen(true); // Open mini-player if not open
      }
    } catch (error) {
      console.error("Auto Guidance Error", error);
    }
  };

  const handleSupportLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setSelectedLanguage(lang);
    setShowSupportLanguages(false);
    // Open the assistant view to show we are helping
    setIsOpen(true);
    // Trigger guidance immediately in new language
    handlePageGuidance(lang);
  };

  const handleAIResponse = async (text: string) => {
    setIsListening(false);
    setIsProcessing(true);
    setTranscript(text);
    setErrorMsg(null);

    // Context for AI
    const context = {
      location: currentUser?.location || 'India',
      weather: { temp: '28C', condition: 'Sunny' },
      page: currentView,
      userRole: currentUser?.role || 'Guest'
    };

    try {
      // 1. Get Text Response
      let aiText = "";
      
      if (!navigator.onLine) {
         aiText = OFFLINE_RESPONSES[selectedLanguage] || OFFLINE_RESPONSES['English'];
      } else {
         aiText = await getFarmerAssistantResponse(text, context, selectedLanguage, 'interaction');
      }

      // --- Command Handling ---

      // Repeat Command
      if (aiText.includes("REPEAT_LAST")) {
         if (lastAudioBuffer) {
            setResponse("Repeating last message...");
            playAudio(lastAudioBuffer);
            setIsProcessing(false);
            return;
         } else {
            aiText = "I don't have a previous message to repeat.";
         }
      }

      // Navigation Command
      if (aiText.includes("NAVIGATE_TO_")) {
         const view = aiText.split("NAVIGATE_TO_")[1].trim().toLowerCase();
         if (onNavigate) {
            onNavigate(view);
            const viewNames: any = { 'sell': 'Upload', 'my-crops': 'My Crops', 'dashboard': 'Dashboard', 'marketplace': 'Marketplace' };
            aiText = `Opening ${viewNames[view] || view}.`;
         }
      } else if (aiText.includes("NAVIGATE_BACK")) {
         // Simple back logic: default to dashboard if no history tracking
         if (onNavigate) {
            onNavigate('dashboard'); 
            aiText = "Going back to Dashboard.";
         }
      }

      // Language Switch Command
      if (aiText.includes("SET_LANGUAGE_")) {
         const lang = aiText.split("SET_LANGUAGE_")[1].trim() as Language;
         if (lang) {
            setLanguage(lang); // Updates App Context
            setSelectedLanguage(lang); // Updates Local State
            aiText = `Language changed to ${lang}. How can I help?`;
         }
      }

      // Notification Read Command
      if (aiText.includes("READ_NOTIFICATIONS")) {
         const unread = notifications.filter(n => !n.isRead);
         if (unread.length === 0) {
            aiText = selectedLanguage === 'Hindi' ? "आपके पास कोई नई सूचना नहीं है।" : "You have no new notifications.";
         } else {
            aiText = selectedLanguage === 'Hindi' 
              ? `आपके पास ${unread.length} नई सूचनाएं हैं। ${unread[0].text}` 
              : `You have ${unread.length} new notifications. First one: ${unread[0].text}`;
         }
      }

      setResponse(aiText);

      // 2. Generate Audio
      const audioBuffer = await generateAudioGuidance(aiText, selectedLanguage);
      if (audioBuffer) {
         setLastAudioBuffer(audioBuffer);
         playAudio(audioBuffer);
      }
    } catch (error) {
      console.error(error);
      setResponse("Sorry, I encountered an error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
        alert("Voice recognition not supported in this browser.");
        return;
    }
    
    if (!navigator.onLine) {
        setErrorMsg("No Internet Connection");
        setTimeout(() => setErrorMsg(null), 3000);
        return;
    }

    // Initialize Audio Context on user gesture to prevent autoplay blocks later
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    stopAudio();
    const langCode = LANG_CODES[selectedLanguage] || 'en-IN';
    recognitionRef.current.lang = langCode;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setErrorMsg(null);
    };

    // Handle final result logic
    recognitionRef.current.onresult = (event: any) => {
        const trans = event.results[0][0].transcript;
        setTranscript(trans);
        if (event.results[0].isFinal) {
            handleAIResponse(trans);
        }
    };

    recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Error", event.error);
        setIsListening(false);
        
        if (event.error === 'network') {
            setErrorMsg("Network Error. Please check connection.");
        } else if (event.error === 'no-speech') {
            // If in continuous mode, silent retry after a bit, else just stop
            if (continuousMode) {
                try { recognitionRef.current.start(); } catch(e) {}
            } else {
                setErrorMsg("No speech detected.");
            }
        } else if (event.error === 'not-allowed') {
            setErrorMsg("Microphone permission denied.");
        }
    };

    try {
        recognitionRef.current.start();
    } catch(e) {
        // Already started or busy
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setContinuousMode(false);
  };

  const renderFarmerSupportBar = () => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-in slide-in-from-right-10">
      {/* Language Selector Popup */}
      {showSupportLanguages && (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 mb-2 overflow-hidden w-56 transform transition-all animate-in zoom-in-95">
           <div className="p-3 bg-agri-50 border-b border-agri-100 flex items-center justify-between">
             <span className="text-xs font-bold text-agri-800 uppercase tracking-wider flex items-center gap-1"><Globe size={12}/> Select Language</span>
             <button onClick={() => setShowSupportLanguages(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
           </div>
           <div className="max-h-60 overflow-y-auto custom-scrollbar">
             {Object.keys(LANG_CODES).map((lang) => (
               <button
                 key={lang}
                 onClick={() => handleSupportLanguageSelect(lang as Language)}
                 className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center ${selectedLanguage === lang ? 'font-bold text-agri-700 bg-agri-50/50' : 'text-slate-600'}`}
               >
                 {lang}
                 {selectedLanguage === lang && <div className="w-2 h-2 rounded-full bg-agri-600"></div>}
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Main Support Bar */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-white/50 ring-1 ring-slate-200/50">
         <button 
           onClick={() => setShowSupportLanguages(!showSupportLanguages)}
           className="flex items-center gap-2 bg-gradient-to-r from-agri-600 to-emerald-600 text-white px-5 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95 group"
         >
           <HelpCircle className="animate-pulse" size={20} />
           <span>AI Guide</span>
           <ChevronDown size={16} className={`transition-transform duration-300 ${showSupportLanguages ? 'rotate-180' : ''}`} />
         </button>

         {!isOpen && (
            <button 
              onClick={() => { setIsOpen(true); startListening(); }}
              className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-agri-100 hover:text-agri-700 transition-colors border border-transparent hover:border-agri-200"
              title="Speak to Assistant"
            >
              <Mic size={20} />
            </button>
         )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
        {/* Expanded Assistant UI */}
        {isOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-agri-100 w-80 overflow-hidden animate-in slide-in-from-bottom-10 mb-2">
             {/* Header */}
             <div className="bg-agri-600 p-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-white/20 rounded-full">
                   <Volume2 size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm">Farmer Ji</h3>
                   <p className="text-[10px] opacity-80">App Guide & Farm Expert</p>
                 </div>
               </div>
               <button onClick={() => { setIsOpen(false); stopAudio(); stopListening(); }} className="hover:bg-white/20 p-1 rounded-full"><X size={18}/></button>
             </div>

             {/* Content */}
             <div className="p-4 min-h-[150px] bg-slate-50 flex flex-col">
                {errorMsg ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-red-500">
                     <WifiOff size={24} />
                     <p className="text-sm font-bold text-center">{errorMsg}</p>
                  </div>
                ) : isListening ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-agri-600">
                     <Loader2 className="animate-spin" size={32} />
                     <p className="text-sm font-medium animate-pulse">Listening...</p>
                     {transcript && <p className="text-xs text-slate-500 text-center italic">"{transcript}"</p>}
                  </div>
                ) : isProcessing ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-indigo-600">
                     <div className="flex gap-1">
                       <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></span>
                       <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></span>
                     </div>
                     <p className="text-sm font-medium">Thinking...</p>
                  </div>
                ) : response ? (
                  <div className="text-sm text-slate-700 leading-relaxed">
                     {response}
                  </div>
                ) : (
                  <div className="text-center flex-1 flex flex-col items-center justify-center text-slate-400">
                     <HelpCircle size={32} className="mb-2 opacity-50" />
                     <p className="text-xs">Tap mic to ask about market prices, navigation, or app help.</p>
                  </div>
                )}
             </div>

             {/* Controls */}
             <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setAutoGuide(!autoGuide)} 
                     className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 ${autoGuide ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                     title="Automatically explain screen when visiting"
                   >
                     {autoGuide ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>} Auto-Tips
                   </button>
                   <button onClick={() => setContinuousMode(!continuousMode)} className={`text-[10px] px-2 py-1 rounded-full border ${continuousMode ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {continuousMode ? 'Always On' : 'Single Turn'}
                   </button>
                </div>
                <button 
                  onClick={isListening ? stopListening : startListening}
                  className={`p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${isListening ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-agri-500 to-agri-600 text-white'}`}
                >
                  {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
                </button>
             </div>
          </div>
        )}

        {/* Default Floating Trigger Button (Non-Farmers Only) */}
        {!isOpen && currentUser?.role !== Role.FARMER && (
          <button 
            onClick={() => { setIsOpen(true); startListening(); }}
            className="bg-gradient-to-r from-agri-600 to-emerald-600 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center gap-2 pr-5 group"
          >
            <div className="bg-white/20 p-1.5 rounded-full"><Mic size={20} /></div>
            <span className="font-bold text-sm hidden group-hover:block whitespace-nowrap animate-in slide-in-from-left-2">Ask Farmer Ji</span>
          </button>
        )}
      </div>

      {/* Dedicated Support Bar for Farmers */}
      {currentUser?.role === Role.FARMER && !isOpen && renderFarmerSupportBar()}
    </>
  );
};
