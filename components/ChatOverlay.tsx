
import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import { Send, X, User as UserIcon, Bot, Loader2, Video, Phone, Image as ImageIcon, MapPin, Smile, Paperclip, ChevronDown, Trash2 } from 'lucide-react';
import { getNegotiationSuggestion } from '../services/geminiService';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  chatPartner: User | null;
  messages: Message[];
  onSendMessage: (text: string, isSystem?: boolean) => void;
  onMarkRead?: (partnerId: string) => void;
  onDeleteMessage?: (messageId: string, type: 'me' | 'everyone') => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ 
  isOpen, onClose, currentUser, chatPartner, messages, onSendMessage, onMarkRead, onDeleteMessage 
}) => {
  const [inputText, setInputText] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Auto clear notifications when overlay is open
    if (isOpen && chatPartner && onMarkRead) {
      onMarkRead(chatPartner.id);
    }
  }, [messages, isOpen, chatPartner, onMarkRead]);

  const handleAIMediator = async () => {
    setIsNegotiating(true);
    // Construct chat history string
    const history = messages.slice(-10).map(m => 
      `${m.senderId === currentUser.id ? 'Me' : 'Partner'}: ${m.text}`
    ).join('\n');

    try {
      const suggestion = await getNegotiationSuggestion(history);
      onSendMessage(`🤖 AI Mediator: ${suggestion}`, true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleVideoCall = () => {
    alert("Starting Video Call... (Feature simulated)");
  };

  const handleVoiceCall = () => {
    alert("Starting Voice Call... (Feature simulated)");
  };

  const handleSendLocation = () => {
    onSendMessage("📍 Shared Live Location: Lat 12.9716, Long 77.5946");
    setShowAttachMenu(false);
  };

  const handleSendPhoto = () => {
    onSendMessage("📷 [Photo Sent] (simulated)");
    setShowAttachMenu(false);
  };
  
  const handleSendVideo = () => {
    onSendMessage("🎥 [Video Sent] (simulated)");
    setShowAttachMenu(false);
  };

  const handleClickDelete = (messageId: string, type: 'me' | 'everyone') => {
    if (onDeleteMessage) {
        onDeleteMessage(messageId, type);
    }
    setActiveMessageMenu(null);
  };

  if (!isOpen || !chatPartner) return null;

  // Filter out deleted for me messages
  const visibleMessages = messages.filter(m => !m.deletedFor?.includes(currentUser.id));

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-agri-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
             {chatPartner.avatar ? <img src={chatPartner.avatar} className="w-full h-full object-cover"/> : <UserIcon />}
          </div>
          <div>
            <h3 className="font-bold text-sm">{chatPartner.name}</h3>
            <p className="text-xs text-agri-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleVideoCall} className="p-2 hover:bg-white/10 rounded-full" title="Video Call">
             <Video size={18} />
           </button>
           <button onClick={handleVoiceCall} className="p-2 hover:bg-white/10 rounded-full" title="Voice Call">
             <Phone size={18} />
           </button>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full" title="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3 relative">
        {visibleMessages.length === 0 && (
           <div className="text-center text-slate-400 my-auto text-sm">
             Start the conversation with {chatPartner.name}
           </div>
        )}
        {visibleMessages.map(msg => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.isSystem;
          const isDeleted = msg.isDeletedForEveryone;
          const canDeleteForEveryone = isMe && (Date.now() - msg.timestamp < 2 * 60 * 1000) && !isDeleted;
          const isMenuOpen = activeMessageMenu === msg.id;
          
          if (isSystem) {
             return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-xs max-w-[90%] text-center shadow-sm">
                  {msg.text}
                </div>
              </div>
             )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm relative ${
                  isMe 
                    ? 'bg-agri-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                } ${isDeleted ? 'italic bg-slate-100 text-slate-400 border-none' : ''}`}
              >
                {msg.text}
                
                {/* Delete Menu Trigger */}
                {!isDeleted && (
                  <button 
                    onClick={() => setActiveMessageMenu(isMenuOpen ? null : msg.id)}
                    className="absolute -right-5 top-0 opacity-0 group-hover:opacity-100 text-slate-400 p-1 hover:text-slate-600"
                  >
                    <ChevronDown size={14}/>
                  </button>
                )}

                {isMenuOpen && (
                  <div className="absolute top-full right-0 z-20 w-32 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden text-slate-700 mt-1">
                      <div className="py-1">
                        <button 
                          onClick={() => handleClickDelete(msg.id, 'me')}
                          className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Trash2 size={12}/> For me
                        </button>
                        {canDeleteForEveryone && (
                          <button 
                            onClick={() => handleClickDelete(msg.id, 'everyone')}
                            className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 size={12}/> Everyone
                          </button>
                        )}
                      </div>
                  </div>
                )}
              </div>
              {isMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setActiveMessageMenu(null)}></div>}
            </div>
          );
        })}
        <div ref={messagesEndRef} />

        {/* Attachment Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-2 left-4 bg-white shadow-xl border border-slate-200 rounded-lg p-2 flex gap-4 animate-in fade-in slide-in-from-bottom-2">
             <button onClick={handleSendPhoto} className="flex flex-col items-center gap-1 text-slate-600 hover:text-agri-600">
               <div className="p-2 bg-slate-100 rounded-full"><ImageIcon size={18} /></div>
               <span className="text-[10px]">Photo</span>
             </button>
             <button onClick={handleSendVideo} className="flex flex-col items-center gap-1 text-slate-600 hover:text-agri-600">
               <div className="p-2 bg-slate-100 rounded-full"><Video size={18} /></div>
               <span className="text-[10px]">Video</span>
             </button>
             <button onClick={handleSendLocation} className="flex flex-col items-center gap-1 text-slate-600 hover:text-agri-600">
               <div className="p-2 bg-slate-100 rounded-full"><MapPin size={18} /></div>
               <span className="text-[10px]">Location</span>
             </button>
          </div>
        )}
      </div>

      {/* Helper Tools */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-center">
         <button 
           onClick={handleAIMediator}
           disabled={isNegotiating || messages.length < 2}
           className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors"
         >
           {isNegotiating ? <Loader2 size={12} className="animate-spin"/> : <Bot size={12} />}
           {isNegotiating ? 'Mediating...' : 'Ask AI Mediator for Help'}
         </button>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if(inputText.trim()) {
              onSendMessage(inputText);
              setInputText('');
              setShowAttachMenu(false);
            }
          }}
          className="flex gap-2 items-center"
        >
          <button 
            type="button" 
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"
          >
            <Paperclip size={20} />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-agri-500"
          />
          
          <button type="button" className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Emojis">
            <Smile size={20} />
          </button>

          <button 
            type="submit"
            className="p-2 bg-agri-600 text-white rounded-full hover:bg-agri-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
