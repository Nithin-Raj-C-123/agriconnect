
import React, { useState, useRef, useEffect } from 'react';
import { User, Message, CallSignal, Role } from '../types';
import { Send, Image as ImageIcon, Video, Smile, MapPin, Search, Phone, Video as VideoIcon, MoreVertical, Mic, MicOff, PhoneOff, VideoOff, Ban, Lock, UserPlus, Bot, Loader2, Wand2, Check, CheckCheck, Download, Trash2, StopCircle, Flag, Shield, HandCoins, X, ChevronDown, Wifi, WifiOff, Users, Maximize2, Minimize2, Clock, CameraOff, Camera } from 'lucide-react';
import { getMediatorResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatFullPageProps {
  currentUser: User;
  users: User[]; 
  initialChatPartner: User | null;
  messages: Message[];
  onSendMessage: (text: string, attachment?: { type: 'image' | 'video' | 'location' | 'audio', url: string }, receiverId?: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onStartCall: (receiverId: string, type: 'video' | 'audio') => void;
  activeCall: CallSignal | null;
  onEndCall: (duration: number) => void;
  onMarkMessagesRead?: (partnerId: string) => void;
  onDeleteMessage?: (messageId: string, type: 'me' | 'everyone') => void;
}

const BANNED_WORDS = ['scam', 'fake', 'fraud', 'money laundering', 'cheat', 'abuse'];

export const ChatFullPage: React.FC<ChatFullPageProps> = ({ 
  currentUser, users, initialChatPartner, messages, onSendMessage, onBlock, onReport, onStartCall, activeCall, onEndCall, onMarkMessagesRead, onDeleteMessage 
}) => {
  const [activePartner, setActivePartner] = useState<User | null>(initialChatPartner);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMediating, setIsMediating] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerDetails, setOfferDetails] = useState({ price: '', quantity: '' });
  
  // Message Menu State
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Call State Local Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'weak' | 'offline'>('good');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Media Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { t } = useLanguage();

  // Sync active partner when prop changes
  useEffect(() => {
    if (initialChatPartner) {
      setActivePartner(initialChatPartner);
    }
  }, [initialChatPartner]);

  // Mark messages as read when viewing a chat
  useEffect(() => {
    if (activePartner && onMarkMessagesRead) {
      onMarkMessagesRead(activePartner.id);
    }
  }, [activePartner, messages, onMarkMessagesRead]);

  // Filter out the current user AND the OWNER from contacts list
  const contacts = users.filter(u => 
    u.id !== currentUser.id && 
    u.role !== Role.OWNER && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check follow status to lock chat
  const isLocked = activePartner && currentUser.role === Role.BUYER && !currentUser.following?.includes(activePartner.id);

  // Filter messages for current chat and not deleted for current user
  const currentMessages = messages.filter(m => 
    ((m.senderId === currentUser.id && m.receiverId === activePartner?.id) ||
    (m.senderId === activePartner?.id && m.receiverId === currentUser.id)) &&
    !m.deletedFor?.includes(currentUser.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activePartner]);

  // --- Call Handling Logic ---
  useEffect(() => {
    if (activeCall && activeCall.status === 'accepted') {
      // Start Timer
      if (!callTimerRef.current) {
        setCallDuration(0);
        callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      }

      // Simulate Network Fluctuation
      const netInterval = setInterval(() => {
         const statuses: ('good' | 'weak' | 'offline')[] = ['good', 'good', 'good', 'weak', 'good'];
         setNetworkQuality(statuses[Math.floor(Math.random() * statuses.length)]);
      }, 8000);

      // Initialize Media Stream
      const startMedia = async () => {
        try {
          const constraints = {
            audio: true,
            video: activeCall.type === 'video'
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          localStreamRef.current = stream;
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          // Initial State Sync
          setIsMuted(false);
          setIsVideoOff(false);

        } catch (err) {
          console.error("Error accessing media devices:", err);
          alert("Could not access camera/microphone. Please check permissions.");
        }
      };

      startMedia();

      return () => {
        clearInterval(netInterval);
        // Stop all tracks
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          localStreamRef.current = null;
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      };
    } else {
        // Reset call state on end
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
        setCallDuration(0);
        setIsMuted(false);
        setIsVideoOff(false);
    }
  }, [activeCall?.status, activeCall?.type]);

  // Toggle Mute Logic
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsMuted(!audioTracks[0].enabled);
      }
    }
  };

  // Toggle Video Logic
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setIsVideoOff(!videoTracks[0].enabled);
      }
    }
  };

  const handleEndCallWrapper = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    onEndCall(callDuration);
  };

  const emojis = [
    '👍', '👋', '🌾', '🚜', '💰', '✅', '❌', '😊', '🙏', '🍅', 
    '🥔', '🚚', '🌧️', '☀️', '🌽', '🥕', '🧅', '🥦', '🌶️', '🍊', 
    '🍎', '🤝', '🚛', '📦', '🤔', '💬', '👀', '✨', '🥬', '🍆',
    '🥒', '🍓', '🍇', '🍉', '🍌', '🥭', '🍍', '🥥', '🥑', '🍒',
    '🥚', '🥛', '🍯', '🥜', '🌰', '🍚', '🌱', '🌿', '🌻', '🌹',
    '❤️', '😂', '😢', '😡', '🎉', '🔥', '⭐', '💧', '🌍', '🏠',
    '📍', '📞', '📷', '🎥', '🖐️', '👌', '🙌', '👏', '💪', '🤝'
  ];

  const handleSend = () => {
    if (inputText.trim() && activePartner) {
      if (BANNED_WORDS.some(word => inputText.toLowerCase().includes(word))) {
        alert(t('chat.moderation'));
        return;
      }
      onSendMessage(inputText, undefined, activePartner.id);
      setInputText('');
      setShowEmojiPicker(false);
    }
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerDetails.price || !offerDetails.quantity || !activePartner) return;
    const offerText = `OFFER: I propose ₹${offerDetails.price}/kg for ${offerDetails.quantity} kg.`;
    onSendMessage(offerText, undefined, activePartner.id);
    setOfferDetails({ price: '', quantity: '' });
    setShowOfferModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files[0] && activePartner) {
      const reader = new FileReader();
      reader.onload = () => {
        onSendMessage(type === 'image' ? '📷 Photo' : '🎥 Video', { type, url: reader.result as string }, activePartner.id);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleLiveLocation = () => {
    if (!activePartner) return;
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          onSendMessage("📍 Shared Live Location", { type: 'location', url: mapsUrl }, activePartner.id);
          setIsLoadingLocation(false);
        },
        (error) => {
          alert("Could not fetch location.");
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  };

  const handleAIMediation = async () => {
    if (!activePartner || isMediating) return;
    setIsMediating(true);
    const history = currentMessages.slice(-10).map(m => 
      `${m.senderId === currentUser.id ? 'Me' : activePartner.name}: ${m.text}`
    ).join('\n');
    try {
      const suggestion = await getMediatorResponse(history);
      onSendMessage(`🤖 AI Mediator: ${suggestion}`, undefined, activePartner.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMediating(false);
    }
  };

  const startRecording = async () => {
    if (!activePartner) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendMessage("🎤 Voice Note", { type: 'audio', url: audioUrl }, activePartner.id);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access required for voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleExportChat = () => {
    if (!activePartner) return;
    const chatText = currentMessages.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.senderId === currentUser.id ? 'Me' : activePartner.name}: ${m.text}`).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${activePartner.name}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleClickDelete = (messageId: string, type: 'me' | 'everyone') => {
    if (onDeleteMessage) {
        onDeleteMessage(messageId, type);
    }
    setActiveMessageMenu(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden relative">
      {/* Sidebar - Contacts */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{t('dash.messages')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-agri-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setActivePartner(contact)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${activePartner?.id === contact.id ? 'bg-agri-50 border-r-4 border-agri-600' : ''}`}
            >
              <div className="relative">
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                {currentUser.following?.includes(contact.id) && <span className="absolute bottom-0 right-0 text-[10px] bg-green-500 text-white rounded-full px-1 border border-white">★</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{contact.name}</h3>
                <p className="text-xs text-slate-500 truncate">{contact.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 relative">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 -ml-2 text-slate-500" onClick={() => setActivePartner(null)}>Back</button>
                <img src={activePartner.avatar} alt={activePartner.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-slate-800">{activePartner.name}</h3>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">● Online</p>
                </div>
              </div>
              {!isLocked && (
                <div className="flex items-center gap-2 md:gap-4 text-agri-600">
                  <button onClick={() => setShowOfferModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold hover:bg-amber-100 transition-colors" title={t('chat.offer')}>
                    <HandCoins size={16} /> {t('chat.offer')}
                  </button>
                  <button onClick={handleAIMediation} disabled={isMediating || currentMessages.length < 2} className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50" title="AI Negotiator">
                    {isMediating ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14} />} {isMediating ? 'Analyzing...' : 'Negotiate'}
                  </button>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 border border-slate-200">
                    <button className="p-2 hover:bg-white rounded-full transition-all text-slate-600 hover:text-green-600 hover:shadow-sm" title={t('chat.voice_call')} onClick={() => onStartCall(activePartner.id, 'audio')}>
                      <Phone size={18} />
                    </button>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <button className="p-2 hover:bg-white rounded-full transition-all text-slate-600 hover:text-blue-600 hover:shadow-sm" title={t('chat.video_call')} onClick={() => onStartCall(activePartner.id, 'video')}>
                      <VideoIcon size={18} />
                    </button>
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-agri-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-lg border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95">
                        <button onClick={handleAIMediation} className="w-full text-left px-4 py-3 text-indigo-600 hover:bg-indigo-50 text-sm font-bold flex items-center gap-2 sm:hidden"><Wand2 size={16} /> AI Negotiator</button>
                        <button onClick={handleExportChat} className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 text-sm font-bold flex items-center gap-2"><Download size={16} /> {t('chat.export')}</button>
                        <button onClick={() => { if(onBlock && window.confirm(`Block ${activePartner.name}?`)) { onBlock(activePartner.id); setActivePartner(null); } setShowMenu(false); }} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-bold flex items-center gap-2"><Ban size={16} /> {t('chat.block')}</button>
                        <button onClick={() => { if(onReport) { onReport(activePartner.id); } setShowMenu(false); }} className="w-full text-left px-4 py-3 text-amber-600 hover:bg-amber-50 text-sm font-bold flex items-center gap-2"><Flag size={16} /> {t('chat.report')}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative bg-slate-100">
              <div className="flex justify-center mb-4">
                 <div className="bg-yellow-50 text-yellow-800 text-[10px] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-yellow-100">
                   <Shield size={10} /> {t('chat.encrypted')}
                 </div>
              </div>
              {isLocked && (
                <div className="absolute inset-0 z-10 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                   <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-sm">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Lock size={32} /></div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Follow to Chat</h3>
                      <p className="text-slate-500 mb-6">You must follow {activePartner.name} to send messages.</p>
                      <button className="w-full bg-agri-600 text-white py-3 rounded-xl font-bold hover:bg-agri-700 flex items-center justify-center gap-2" onClick={() => alert("Please go to their profile to follow.")}>
                        <UserPlus size={20} /> Follow Farmer
                      </button>
                   </div>
                </div>
              )}
              {currentMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                const isSystem = msg.isSystem;
                const isMediator = msg.text.startsWith('🤖 AI Mediator:');
                const isOffer = msg.text.startsWith('OFFER:');
                const isDeleted = msg.isDeletedForEveryone;
                const isMenuOpen = activeMessageMenu === msg.id;

                if (isSystem) return <div key={msg.id} className="flex justify-center my-4 animate-fade-in"><div className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-medium shadow-sm">{msg.text}</div></div>;
                if (isMediator) return <div key={msg.id} className="flex justify-center my-4 animate-fade-in"><div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-900 px-4 py-3 rounded-xl shadow-sm text-sm max-w-[85%] flex gap-3 items-start"><div className="p-2 bg-white rounded-full shadow-sm shrink-0"><Bot size={18} className="text-indigo-600"/></div><div><p className="font-bold text-xs text-indigo-500 uppercase mb-1">AI Suggestion</p>{msg.text.replace('🤖 AI Mediator: ', '')}</div></div></div>;
                if (isOffer) return <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className="bg-white border-l-4 border-amber-500 rounded-lg p-4 shadow-sm max-w-[80%]"><div className="flex items-center gap-2 mb-2"><HandCoins size={18} className="text-amber-600"/><span className="font-bold text-slate-800">Offer</span></div><p className="text-sm text-slate-600">{msg.text.replace('OFFER: ', '')}</p><div className="mt-3 flex gap-2"><button onClick={() => onSendMessage(`Accepted: ${msg.text}`, undefined, activePartner.id)} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md font-bold">Accept</button></div><p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p></div></div>;

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col relative`}>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm relative ${isMe ? 'bg-agri-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'} ${isDeleted ? 'italic text-slate-400 bg-slate-100 border-none' : ''}`}>
                        {isDeleted ? <span className="flex items-center gap-2"><Ban size={14}/> {msg.text}</span> : (
                          <>{msg.text}{msg.attachment && <div className="mt-2 rounded-lg overflow-hidden">{msg.attachment.type === 'image' && <img src={msg.attachment.url} className="max-w-full max-h-60 object-cover" />}{msg.attachment.type === 'location' && <a href={msg.attachment.url} target="_blank" className="text-blue-600 underline">View Location</a>}</div>}</>
                        )}
                        {!isDeleted && <button onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(isMenuOpen ? null : msg.id); }} className={`absolute -right-6 top-0 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-opacity ${isMenuOpen ? 'opacity-100 block' : ''}`}><ChevronDown size={14} /></button>}
                        {isMenuOpen && <div className="absolute top-6 right-0 z-20 w-40 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 text-slate-700"><div className="py-1"><button onClick={() => handleClickDelete(msg.id, 'me')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"><Trash2 size={12}/> Delete for me</button>{isMe && <button onClick={() => handleClickDelete(msg.id, 'everyone')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 size={12}/> Delete for everyone</button>}</div></div>}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1"><span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>{isMe && <span className="text-slate-400">{msg.isRead ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />}</span>}</div>
                    </div>
                    {isMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setActiveMessageMenu(null)}></div>}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!isLocked && (
              <div className="p-3 md:p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 md:gap-3 bg-slate-100 px-3 md:px-4 py-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-agri-200 transition-all">
                    <div className="flex items-center gap-1 md:gap-2 text-slate-400">
                      <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile size={20} /></button>
                      <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors hidden sm:block" onClick={() => imageInputRef.current?.click()}><ImageIcon size={20} /></button>
                      <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors hidden sm:block" onClick={() => videoInputRef.current?.click()}><Video size={20} /></button>
                      <button className={`p-1.5 rounded-full transition-colors ${isLoadingLocation ? 'text-agri-600 animate-pulse' : 'hover:bg-slate-200'}`} onClick={handleLiveLocation}><MapPin size={20} /></button>
                    </div>
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t('chat.placeholder')} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 min-w-0" />
                    {isRecording ? <button onClick={stopRecording} className="p-2 rounded-full bg-red-600 text-white shadow-md animate-pulse"><StopCircle size={18} /></button> : <><button onClick={startRecording} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Mic size={20} /></button><button onClick={handleSend} className="p-2 rounded-full bg-agri-600 text-white shadow-md hover:bg-agri-700"><Send size={18} /></button></>}
                </div>
                {isRecording && <p className="text-xs text-red-500 font-bold text-center mt-1 animate-pulse">{t('chat.recording')}</p>}
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                {showEmojiPicker && <div className="absolute bottom-20 left-4 md:left-8 bg-white shadow-xl border border-slate-200 rounded-xl p-3 grid grid-cols-8 gap-2 animate-in zoom-in-95 h-48 overflow-y-auto custom-scrollbar z-30">{emojis.map(emoji => <button key={emoji} onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }} className="text-xl hover:bg-slate-100 rounded p-1">{emoji}</button>)}</div>}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
             <div className="bg-slate-100 p-6 rounded-full mb-4"><Smile size={48} /></div>
             <h3 className="text-xl font-bold text-slate-600">Select a Conversation</h3>
             <p className="text-sm mt-2">Choose a contact from the left to start chatting.</p>
             <div className="mt-8 w-full max-w-sm md:hidden text-left bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">Recent Contacts</div>{contacts.slice(0, 5).map(c => <div key={c.id} onClick={() => setActivePartner(c)} className="p-3 flex items-center gap-3 border-b last:border-0 hover:bg-slate-50 active:bg-slate-100"><img src={c.avatar} className="w-8 h-8 rounded-full" /><span className="text-sm font-medium text-slate-800">{c.name}</span></div>)}</div>
          </div>
        )}
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2"><h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><HandCoins className="text-amber-500" /> {t('chat.offer_title')}</h3><button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
              <form onSubmit={handleSendOffer} className="space-y-4">
                 <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t('chat.price_label')}</label><input type="number" value={offerDetails.price} onChange={e => setOfferDetails({...offerDetails, price: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-lg font-bold" placeholder="0.00" autoFocus /></div>
                 <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t('chat.qty_label')}</label><input type="number" value={offerDetails.quantity} onChange={e => setOfferDetails({...offerDetails, quantity: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="0" /></div>
                 <button type="submit" className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 shadow-lg transition-transform active:scale-95">{t('chat.send_offer')}</button>
              </form>
           </div>
        </div>
      )}

      {/* Enhanced Active Call Overlay */}
      {activeCall && activeCall.status !== 'ended' && (
        <div className={`fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in transition-all duration-300 ${isFullScreen ? '' : 'p-4 md:p-8'}`}>
           <div className={`relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center ${isFullScreen ? 'rounded-none' : ''}`}>
              
              <div className="absolute inset-0 z-0">
                 {activeCall.status === 'accepted' ? (
                    activeCall.type === 'video' ? (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center relative overflow-hidden">
                           {/* Remote Video Simulation */}
                           <video 
                             autoPlay 
                             muted 
                             loop 
                             playsInline 
                             src="https://cdn.coverr.co/videos/coverr-talking-on-the-phone-in-a-field-5379/1080p.mp4" 
                             className="w-full h-full object-cover opacity-90" 
                           />
                           
                           <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-md flex items-center gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {activePartner?.name || activeCall.callerName}
                           </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                           <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600 animate-pulse relative">
                              <img src={activePartner?.avatar || activeCall.callerAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover opacity-80" />
                              <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-2 border-slate-800">
                                <Mic size={16} className="text-white"/>
                              </div>
                           </div>
                        </div>
                    )
                 ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-24 h-24 rounded-full border-4 border-slate-700 animate-pulse overflow-hidden">
                             <img src={activePartner?.avatar || activeCall.callerAvatar} className="w-full h-full object-cover"/>
                          </div>
                          <div className="text-white opacity-50 animate-pulse font-medium">Connecting...</div>
                       </div>
                    </div>
                 )}
              </div>

              {/* Local Camera (PiP) */}
              {activeCall.type === 'video' && activeCall.status === 'accepted' && (
                 <div className="absolute top-4 right-4 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20 transition-all hover:scale-105 group">
                    {!isVideoOff ? (
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-700 text-slate-400">
                            <CameraOff size={24} />
                            <span className="text-[10px] mt-1 font-bold">Camera Off</span>
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">You</div>
                 </div>
              )}

              {/* Call Status Overlay */}
              <div className="z-10 text-center relative max-w-md w-full px-4 mt-10 pointer-events-none">
                 {(activeCall.status === 'offering' || activeCall.type === 'audio') && (
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 mx-auto mb-4 shadow-2xl relative hidden md:block">
                     <img src={activePartner?.avatar || activeCall.callerAvatar} alt="Partner" className="w-full h-full object-cover" />
                     {(activeCall.status === 'offering' || networkQuality === 'weak') && <div className="absolute inset-0 border-4 border-white/40 rounded-full animate-ping"></div>}
                   </div>
                 )}
                 <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{activePartner?.name || activeCall.callerName}</h2>
                 <div className={`text-xl font-mono font-bold mb-6 flex items-center justify-center gap-2 ${activeCall.status === 'rejected' ? 'text-red-400' : 'text-white'}`}>
                   {activeCall.status === 'offering' ? <span className="animate-pulse">Calling...</span> : activeCall.status === 'accepted' ? <span className="bg-black/30 px-4 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2"><Clock size={16} className="text-green-400"/> {formatDuration(callDuration)}</span> : 'Call Declined'}
                 </div>
                 {activeCall.status === 'accepted' && (
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-8 transition-colors backdrop-blur-md ${networkQuality === 'good' ? 'bg-green-500/20 text-green-400' : networkQuality === 'weak' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                       {networkQuality === 'good' ? <Wifi size={14}/> : <WifiOff size={14}/>} {networkQuality === 'good' ? 'Good Connection' : networkQuality === 'weak' ? 'Weak Signal' : 'Reconnecting...'}
                    </div>
                 )}
              </div>

              {/* Controls Bar */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 z-20 pb-4 md:pb-0">
                 {activeCall.status === 'accepted' ? (
                    <>
                       <button onClick={toggleMute} className={`p-4 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 ${isMuted ? 'bg-white text-slate-900' : 'bg-black/40 text-white hover:bg-black/60'}`} title={isMuted ? "Unmute Microphone" : "Mute Microphone"}>
                         {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                       </button>
                       <button onClick={handleEndCallWrapper} className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition-transform hover:scale-110 mx-4 ring-4 ring-red-900/30" title="End Call">
                         <PhoneOff size={32} />
                       </button>
                       {activeCall.type === 'video' && (
                         <button onClick={toggleVideo} className={`p-4 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 ${isVideoOff ? 'bg-white text-slate-900' : 'bg-black/40 text-white hover:bg-black/60'}`} title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}>
                           {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
                         </button>
                       )}
                    </>
                 ) : (
                    <button onClick={handleEndCallWrapper} className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition-transform hover:scale-110" title="Cancel Call">
                       <PhoneOff size={28} />
                    </button>
                 )}
              </div>

              {/* Top Controls */}
              <div className="absolute top-6 left-6 z-20"><div className="bg-green-500/20 backdrop-blur-md text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-500/30 shadow-lg"><Shield size={12}/> Secure E2E Encryption</div></div>
              <div className="absolute top-6 right-6 z-20"><button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md">{isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button></div>
           </div>
        </div>
      )}
    </div>
  );
};
