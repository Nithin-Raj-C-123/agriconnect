
import React, { useState, useEffect } from 'react';
import { User, Role, Crop, Order, Notification, Message, CallSignal, MarketRate, BuyerRequest, Feedback, HarvestSchedule } from './types';
import { MOCK_USERS, INITIAL_CROPS, MOCK_ORDERS, MOCK_NOTIFICATIONS, INITIAL_MESSAGES, MARKET_RATES, MOCK_REQUESTS, MOCK_FEEDBACK } from './services/mockStore';
import { Navbar } from './components/Navbar';
import { FarmerDashboard } from './components/FarmerDashboard';
import { Marketplace } from './components/Marketplace';
import { OwnerDashboard } from './components/OwnerDashboard';
import { BuyerNetwork } from './components/BuyerNetwork';
import { BuyerRequests } from './components/BuyerRequests';
import { OrderHistory } from './components/OrderHistory';
import { AccountSettings } from './components/AccountSettings';
import { Forum } from './components/Forum';
import { ChatFullPage } from './components/ChatFullPage';
import { CartDrawer } from './components/CartDrawer';
import { AudioAssistant } from './components/AudioAssistant';
import { ChatOverlay } from './components/ChatOverlay';
import { IncomingCallModal } from './components/IncomingCallModal';
import { ARViewer } from './components/ARViewer';
import { FarmerStorefront } from './components/FarmerStorefront';
import { Leaf, LogIn, Phone, Mail, Key, ShieldCheck, User as UserIcon, Lock, Sparkles, Sprout, ShoppingBag, ArrowRight, UserPlus, FileText, Smartphone, AtSign, CreditCard } from 'lucide-react';

export const App: React.FC = () => {
  // --- State Initialization with LocalStorage Persistence ---
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('agri_users') || JSON.stringify(MOCK_USERS)));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [crops, setCrops] = useState<Crop[]>(() => JSON.parse(localStorage.getItem('agri_crops') || JSON.stringify(INITIAL_CROPS)));
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem('agri_orders') || JSON.stringify(MOCK_ORDERS)));
  const [marketRates, setMarketRates] = useState<MarketRate[]>(() => JSON.parse(localStorage.getItem('agri_rates') || JSON.stringify(MARKET_RATES)));
  const [cart, setCart] = useState<Crop[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(localStorage.getItem('agri_notifs') || JSON.stringify(MOCK_NOTIFICATIONS)));
  
  // Persist messages for 2-way chat simulation across tabs
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('agri_messages') || JSON.stringify(INITIAL_MESSAGES)));
  
  const [activeCall, setActiveCall] = useState<CallSignal | null>(null);
  const [harvestSchedules, setHarvestSchedules] = useState<HarvestSchedule[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(MOCK_REQUESTS);
  
  // Feedback State
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => JSON.parse(localStorage.getItem('agri_feedbacks') || JSON.stringify(MOCK_FEEDBACK)));

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('agri_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('agri_crops', JSON.stringify(crops)), [crops]);
  useEffect(() => localStorage.setItem('agri_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('agri_rates', JSON.stringify(marketRates)), [marketRates]);
  useEffect(() => localStorage.setItem('agri_notifs', JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem('agri_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('agri_feedbacks', JSON.stringify(feedbacks)), [feedbacks]);

  // --- Cross-Tab Sync Listener ---
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'agri_users') setUsers(JSON.parse(e.newValue || '[]'));
      if (e.key === 'agri_crops') setCrops(JSON.parse(e.newValue || '[]'));
      if (e.key === 'agri_orders') setOrders(JSON.parse(e.newValue || '[]'));
      if (e.key === 'agri_rates') setMarketRates(JSON.parse(e.newValue || '[]'));
      if (e.key === 'agri_messages') setMessages(JSON.parse(e.newValue || '[]')); // Sync messages
      if (e.key === 'agri_feedbacks') setFeedbacks(JSON.parse(e.newValue || '[]'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedStorefrontData, setSelectedStorefrontData] = useState<{farmer: User, crop: Crop} | null>(null);
  
  // Login State
  const [loginRole, setLoginRole] = useState<Role>(Role.FARMER);
  const [loginIdentifier, setLoginIdentifier] = useState('farmer');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginVisualState, setLoginVisualState] = useState<'idle' | 'success' | 'error'>('idle');
  const [roleLocked, setRoleLocked] = useState(false); // New state to lock role based on URL
  
  // Registration State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAadhar, setRegAadhar] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [arCrop, setArCrop] = useState<Crop | null>(null);

  // --- Route Logic ---
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/farmer')) {
      setLoginRole(Role.FARMER);
      setLoginIdentifier('farmer'); // Default for convenience, password still required
      setRoleLocked(true);
    } else if (path.includes('/buyer')) {
      setLoginRole(Role.BUYER);
      setLoginIdentifier('Ram');
      setRoleLocked(true);
    } else if (path.includes('/owner')) {
      setLoginRole(Role.OWNER);
      setLoginIdentifier('nithin');
      setRoleLocked(true);
    } else {
      setRoleLocked(false);
    }
    // Clear password on mount
    setLoginPassword('');
  }, []);

  // Clear password specifically on logout
  useEffect(() => {
    if (!currentUser) {
      setLoginPassword('');
    }
  }, [currentUser]);

  // Find user for avatar display on login
  const recognizedUser = users.find(u => 
    (u.email === loginIdentifier || u.phone === loginIdentifier || u.name === loginIdentifier) && 
    u.role === loginRole
  );

  const handleLogin = (role: Role) => {
    // Helper for navbar login shortcut
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setCurrentView(role === Role.FARMER ? 'dashboard' : 'marketplace');
    }
  };

  const handleUpdateMarketRate = (newRates: MarketRate[]) => {
    setMarketRates(newRates);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regEmail || !regAadhar || !regPassword || !regConfirmPassword) {
        alert("Please fill in all fields.");
        return;
    }
    if (regPassword !== regConfirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Mock Registration
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: regName,
        email: regEmail,
        phone: regPhone,
        aadharNumber: regAadhar,
        password: regPassword,
        role: loginRole === Role.OWNER ? Role.FARMER : loginRole, // Default new registrations to current selected role (except owner)
        location: 'New User Location',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(regName)}&background=random`,
        createdAt: Date.now()
    } as any; // Cast for mock

    setUsers([...users, newUser]);
    alert("Registration Successful! Please login.");
    setIsRegistering(false);
    // Reset form
    setRegName(''); setRegPhone(''); setRegEmail(''); setRegAadhar(''); setRegPassword(''); setRegConfirmPassword('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginVisualState('idle');
    
    // Simulate API delay with animation
    setTimeout(() => {
        let user: User | undefined;

        if (loginRole === Role.OWNER) {
            // Strict check for owner
            if (loginIdentifier === 'nithin' && loginPassword === '0987') {
                user = users.find(u => u.role === Role.OWNER);
            }
        } else {
            // Normal check for others
            user = users.find(u => 
                (u.email === loginIdentifier || u.phone === loginIdentifier || u.name === loginIdentifier) && 
                u.password === loginPassword &&
                u.role === loginRole
            );
        }

        if (user) {
            setLoginVisualState('success');
            // Log the login for Owner dashboard tracking
            const updatedUsers = users.map(u => {
              if (u.id === user!.id) {
                return {
                  ...u,
                  securityLogs: [
                    { id: `log-${Date.now()}`, device: 'Web Browser', location: 'India', timestamp: Date.now(), ip: '127.0.0.1' },
                    ...(u.securityLogs || [])
                  ]
                };
              }
              return u;
            });
            setUsers(updatedUsers);
            
            setTimeout(() => {
                setCurrentUser(user!);
                setCurrentView(user!.role === Role.OWNER ? 'owner' : user!.role === Role.FARMER ? 'dashboard' : 'marketplace');
                setLoginVisualState('idle');
            }, 1200);
        } else {
            setLoginVisualState('error');
            setTimeout(() => setLoginVisualState('idle'), 2000);
        }
    }, 1000);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleViewDetails = (crop: Crop) => {
    const farmer = users.find(u => u.id === crop.farmerId);
    if (farmer) {
        setSelectedStorefrontData({ farmer, crop });
        setCurrentView('storefront');
        window.scrollTo(0, 0);
    }
  };

  const handleStartCall = (rid: string, type: 'video' | 'audio') => {
    if (!currentUser) return;
    const receiver = users.find(u => u.id === rid);
    
    const newCall: CallSignal = {
        id: `call-${Date.now()}`,
        callerId: currentUser.id,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatar,
        receiverId: rid,
        type,
        status: 'offering',
        timestamp: Date.now()
    };
    
    setActiveCall(newCall);
    
    // Switch to chat view immediately so caller sees the "Calling..." UI
    if (receiver) {
      setChatPartner(receiver);
      setCurrentView('chat');
    }
    
    // Add Start Call System Message to Chat
    const startMsg: Message = {
        id: `m-call-start-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: rid,
        text: `📞 Started ${type} call`,
        timestamp: Date.now(),
        isRead: false,
        isSystem: true
    };
    setMessages(prev => [...prev, startMsg]);
    
    // Also push a notification to the receiver (simulated)
    const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: rid,
        text: `Missed call from ${currentUser.name}`, // Fallback text, real-time is handled by modal
        type: 'CALL_MISSED',
        isRead: false,
        timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotif]);
  };

  const handleAcceptCall = () => {
    if (activeCall) {
        setActiveCall({ ...activeCall, status: 'accepted' });
        // Automatically switch view to chat with the caller so they can see the full page interface
        const partnerId = activeCall.callerId;
        const partner = users.find(u => u.id === partnerId);
        if (partner) {
            setChatPartner(partner);
            setCurrentView('chat');
        }
    }
  };

  const handleEndCall = (duration: number) => {
    if (!activeCall) return;
    
    // Format duration
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Add system message
    const endMsg: Message = {
        id: `m-call-end-${Date.now()}`,
        senderId: currentUser?.id || 'system', 
        receiverId: activeCall.receiverId === currentUser?.id ? activeCall.callerId : activeCall.receiverId,
        text: `📞 Call ended • Duration: ${timeString}`,
        timestamp: Date.now(),
        isRead: true,
        isSystem: true 
    };
    
    setMessages(prev => [...prev, endMsg]);
    setActiveCall(null);
  };

  const handleDeleteMessage = (messageId: string, type: 'me' | 'everyone') => {
    if (!currentUser) return;
    setMessages(prevMessages => prevMessages.map(msg => {
      if (msg.id === messageId) {
        if (type === 'everyone') {
          return { ...msg, isDeletedForEveryone: true, text: 'This message was deleted' };
        } else if (type === 'me') {
          const deletedFor = msg.deletedFor || [];
          if (!deletedFor.includes(currentUser.id)) {
            return { ...msg, deletedFor: [...deletedFor, currentUser.id] };
          }
        }
      }
      return msg;
    }));
  };

  const handleFeedback = (rating: number, comment: string, farmerId: string, cropId?: string, cropName?: string) => {
    if (!currentUser) return;
    const newFeedback: Feedback = {
        id: `fb-${Date.now()}`,
        farmerId,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        rating,
        comment,
        cropId,
        cropName,
        timestamp: Date.now()
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    
    // Notification for Farmer
    const newNotif: Notification = {
        id: `n-${Date.now()}`,
        userId: farmerId,
        text: `New ${rating}★ review from ${currentUser.name}: "${comment.substring(0, 20)}..."`,
        type: 'FEEDBACK_RECEIVED',
        isRead: false,
        timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const getCallerRole = (id: string): string => {
    const caller = users.find(u => u.id === id);
    if (!caller) return 'User';
    // Return Title Case role
    return caller.role.charAt(0).toUpperCase() + caller.role.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {!currentUser && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 relative overflow-hidden">
            
            {/* Background Animated Particles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-white/20 animate-float"><Leaf size={64} /></div>
                <div className="absolute bottom-20 right-20 text-white/20 animate-float-delayed"><Sparkles size={80} /></div>
                <div className="absolute top-1/2 left-5 text-white/10 animate-spin-slow"><Sprout size={48} /></div>
                <div className="absolute bottom-10 left-1/4 text-white/10 animate-float"><Leaf size={32} /></div>
                <div className="absolute top-20 right-1/4 text-white/10 animate-float-delayed"><Sparkles size={40} /></div>
            </div>

            {/* Top Right Creator Info */}
            <div className="absolute top-4 right-4 z-50 animate-slide-in-from-right duration-1000">
               <div className="group bg-white/40 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/60 shadow-2xl hover:shadow-emerald-400/30 transition-all duration-500 hover:scale-105 hover:bg-white/60 cursor-default">
                  <div className="text-right space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 group-hover:text-emerald-800 transition-colors">Created by</p>
                      
                      <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-700 drop-shadow-sm pb-1 animate-pulse-slow">
                        Nithin Raj C
                      </h1>
                      
                      <div className="flex flex-col items-end gap-2 pt-2">
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-xl shadow-sm border border-white hover:border-emerald-200 transition-colors group/item hover:-translate-x-1 duration-300">
                            <span className="text-xs font-bold text-slate-800 tracking-wide font-mono">+91 8660591572</span>
                            <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 group-hover/item:rotate-12 transition-transform">
                               <Phone size={12} strokeWidth={3} />
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-xl shadow-sm border border-white hover:border-blue-200 transition-colors group/item hover:-translate-x-1 duration-300 delay-75">
                            <span className="text-xs font-bold text-slate-800 tracking-wide font-mono">rajcnithin963@gmail.com</span>
                            <div className="p-1 bg-blue-100 rounded-full text-blue-600 group-hover/item:rotate-12 transition-transform">
                               <Mail size={12} strokeWidth={3} />
                            </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Bottom Right Signature */}
            <div className="absolute bottom-6 right-6 z-20 animate-bounce-slow">
               <div className="relative group cursor-default">
                 <div className="absolute -inset-1 bg-white/50 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                 <p className="relative text-xs font-black text-white tracking-[0.2em] font-mono transform rotate-[-2deg] group-hover:rotate-0 transition-transform drop-shadow-md">
                    Maynooo
                 </p>
               </div>
            </div>

            {!isRegistering ? (
              // Login Form
              <form onSubmit={handlePasswordSubmit} className={`space-y-6 w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/60 transition-all duration-500 hover:shadow-cyan-200/50 hover:bg-white ${loginVisualState === 'error' ? 'animate-shake' : ''}`}>
                
                {/* 3D Pigeon Assistant or User Avatar Animation */}
                <div className="relative w-full h-44 flex justify-center items-end mb-2 group">
                  <div className="absolute bottom-6 w-40 h-40 bg-cyan-200/30 blur-[50px] rounded-full pointer-events-none animate-pulse-slow"></div>
                  
                  {recognizedUser ? (
                    <div className="relative z-20 flex flex-col items-center animate-zoom-in">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-agri-400 to-blue-500 shadow-2xl">
                            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white">
                                <img 
                                    src={recognizedUser.avatar} 
                                    alt={recognizedUser.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                                />
                            </div>
                        </div>
                        <div className="mt-4 bg-white/80 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-white/50 animate-slide-in-from-bottom">
                            <p className="text-sm font-bold text-slate-700">Hello, {recognizedUser.name}!</p>
                        </div>
                    </div>
                  ) : (
                    /* Pigeon */
                    <img 
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/pigeon-5481636-4569833.png?f=webp" 
                        alt="Pigeon Assistant" 
                        className={`w-44 h-44 object-contain z-20 transition-all duration-700 origin-bottom filter drop-shadow-xl
                        ${loginVisualState === 'idle' ? 'animate-float' : ''} 
                        ${loginVisualState === 'success' ? 'animate-bounce brightness-110 rotate-[-5deg] scale-110' : ''}
                        ${loginVisualState === 'error' ? 'grayscale sepia hue-rotate-15 saturate-200' : ''}
                        `} 
                    />
                  )}
                  
                  {/* Interaction Emojis */}
                  {loginVisualState === 'success' && (
                    <>
                        {/* Hearts dancing UP from bottom near welcome text to top */}
                        <div className="absolute bottom-0 right-1/4 text-4xl animate-dance-up z-30">💚</div>
                        <div className="absolute bottom-0 left-1/4 text-4xl animate-dance-up z-30 delay-100">❤️</div>
                    </>
                  )}
                  {loginVisualState === 'error' && <div className="absolute top-0 right-1/4 text-4xl animate-bounce z-30 delay-100">💢</div>}
                </div>

                <div className="flex flex-col items-center mb-6 animate-in slide-in-from-bottom-4">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-1">
                      {loginRole === Role.OWNER ? 'Owner Portal' : loginRole === Role.FARMER ? 'Farmer Portal' : 'Buyer Portal'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {loginRole === Role.OWNER ? 'Restricted Access' : 'Secure Login'}
                    </p>
                </div>

                {/* Role Switcher - Separate Chambers - Only Show if Role Not Locked */}
                {!roleLocked && loginRole !== Role.OWNER && (
                  <div className="flex gap-4 mb-8">
                    <div 
                        onClick={() => setLoginRole(Role.FARMER)}
                        className={`flex-1 p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col items-center gap-2 ${loginRole === Role.FARMER ? 'bg-green-50 border-green-500 shadow-lg scale-105 z-10' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 opacity-70 grayscale'}`}
                    >
                        <div className={`p-3 rounded-full ${loginRole === Role.FARMER ? 'bg-green-100 text-green-600' : 'bg-slate-100'}`}>
                            <Leaf size={24} />
                        </div>
                        <span className="font-bold text-sm">Farmer</span>
                    </div>

                    <div 
                        onClick={() => setLoginRole(Role.BUYER)}
                        className={`flex-1 p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col items-center gap-2 ${loginRole === Role.BUYER ? 'bg-blue-50 border-blue-500 shadow-lg scale-105 z-10' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 opacity-70 grayscale'}`}
                    >
                        <div className={`p-3 rounded-full ${loginRole === Role.BUYER ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
                            <ShoppingBag size={24} />
                        </div>
                        <span className="font-bold text-sm">Buyer</span>
                    </div>
                  </div>
                )}

                {/* Owner Header Override */}
                {loginRole === Role.OWNER && (
                   <div className="bg-slate-800 text-white p-4 rounded-xl mb-6 flex items-center justify-center gap-2 shadow-lg animate-in fade-in border border-slate-700">
                      <Key size={18} className="text-amber-400 animate-pulse" /> 
                      <span className="font-bold text-sm tracking-wide uppercase">Administrator</span>
                      {!roleLocked && (
                        <button type="button" onClick={() => setLoginRole(Role.FARMER)} className="ml-auto text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full transition-colors"><ShieldCheck size={16}/></button>
                      )}
                   </div>
                )}

                <div className="space-y-4">
                    {/* Built-in Username Field */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1 tracking-wider">
                          {loginRole === Role.FARMER ? 'Username' : loginRole === Role.OWNER ? 'Admin Username' : 'Username'}
                        </label>
                        <div className="relative">
                          <input 
                              type="text" 
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              className={`w-full pl-12 pr-10 py-3.5 border-2 rounded-xl outline-none font-bold transition-all focus:ring-4 ${loginRole === Role.FARMER ? 'bg-green-50 border-green-100 text-green-800 focus:border-green-500 focus:ring-green-100' : loginRole === Role.BUYER ? 'bg-blue-50 border-blue-100 text-blue-800 focus:border-blue-500 focus:ring-blue-100' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                          />
                          <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 bg-white/50 p-1 rounded">
                             <Lock size={14} />
                          </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1 tracking-wider">Password</label>
                        <div className="relative transition-transform duration-300 focus-within:scale-[1.02]">
                          <input 
                              type="password" 
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className={`w-full pl-12 pr-10 py-3.5 bg-white border-2 rounded-xl outline-none transition-all font-bold shadow-sm ${loginRole === Role.BUYER ? 'focus:border-blue-500 focus:ring-4 focus:ring-blue-100 border-slate-200' : loginRole === Role.OWNER ? 'focus:border-slate-600 focus:ring-4 focus:ring-slate-200 border-slate-200' : 'focus:border-agri-500 focus:ring-4 focus:ring-agri-100 border-slate-200'} text-slate-800 tracking-widest`}
                              placeholder="••••••••"
                          />
                          <Key size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${loginRole === Role.BUYER ? 'text-blue-400' : loginRole === Role.OWNER ? 'text-slate-400' : 'text-agri-400'}`}/>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 mt-6 flex items-center justify-center gap-2 text-white group relative overflow-hidden
                      ${loginRole === Role.BUYER ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-200' : loginRole === Role.OWNER ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-300' : 'bg-gradient-to-r from-agri-600 to-emerald-500 hover:from-agri-700 hover:to-emerald-600 shadow-agri-200'}`}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {loginRole === Role.OWNER ? <LogIn size={20}/> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>} 
                        {loginRole === Role.OWNER ? 'Access Dashboard' : 'Enter Portal'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        Don't have an account? <button type="button" onClick={() => setIsRegistering(true)} className={`${loginRole === Role.BUYER ? 'text-blue-600' : 'text-agri-600'} font-bold hover:underline`}>Register Now</button>
                    </p>
                </div>

                {/* Owner Login Key (Small & Discreet) - Only show if not locked to another role */}
                {!roleLocked && loginRole !== Role.OWNER && (
                  <div className="absolute -bottom-16 left-0 right-0 flex justify-center group/key">
                     <button 
                       type="button"
                       onClick={() => setLoginRole(Role.OWNER)} 
                       className="p-3 text-slate-400 hover:text-slate-700 bg-white/40 hover:bg-white rounded-full transition-all shadow-sm hover:shadow-lg backdrop-blur-sm border border-white/50 group-hover/key:-translate-y-2 duration-300"
                       title="Owner Login"
                     >
                       <Key size={16} className="group-hover/key:rotate-45 transition-transform" />
                     </button>
                  </div>
                )}
              </form>
            ) : (
                // Registration Form
                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl w-full max-w-lg relative z-10 border border-white/50 animate-in zoom-in-95">
                    <div className="flex flex-col items-center mb-6">
                        <div className={`p-3 rounded-full mb-3 ${loginRole === Role.BUYER ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            <UserPlus size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Create {loginRole === Role.BUYER ? 'Buyer' : 'Farmer'} Account</h2>
                        <p className="text-slate-500 text-sm">Join AgriLink today</p>
                    </div>
                    
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User Name</label>
                                <div className="relative">
                                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="Full Name" required />
                                    <UserIcon size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone No.</label>
                                <div className="relative">
                                    <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="10-digit Mobile" required />
                                    <Smartphone size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email ID</label>
                            <div className="relative">
                                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="you@example.com" required />
                                <AtSign size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhar No.</label>
                            <div className="relative">
                                <input type="text" value={regAadhar} onChange={e => setRegAadhar(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="12-digit UIDAI Number" required />
                                <CreditCard size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                <div className="relative">
                                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="••••••" required />
                                    <Key size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="••••••" required />
                                    <Lock size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                                Back to Login
                            </button>
                            <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${loginRole === Role.BUYER ? 'bg-blue-600 hover:bg-blue-700' : 'bg-agri-600 hover:bg-agri-700'}`}>
                                Done
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      )}

      {currentUser && (
        <>
          <Navbar 
            currentUser={currentUser} 
            onLogout={() => setCurrentUser(null)} 
            onNavigate={handleNavigate}
            currentView={currentView}
            cartCount={cart.length}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenChat={() => setCurrentView('chat')}
            notifications={notifications.filter(n => n.userId === currentUser.id)}
            onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n))}
            onMarkAllRead={() => setNotifications(prev => prev.map(n => n.userId === currentUser.id ? {...n, isRead: true} : n))}
            unreadMessageCount={messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length}
            onLogin={handleLogin}
          />

          <div className="pt-4 pb-20">
            {currentView === 'dashboard' && currentUser.role === Role.FARMER && (
                <FarmerDashboard 
                    currentUser={currentUser}
                    crops={crops}
                    users={users}
                    orders={orders}
                    messages={messages}
                    onNavigate={handleNavigate}
                    onOpenChat={(u) => { setChatPartner(u); setCurrentView('chat'); }}
                    onAddCrop={(c) => setCrops([...crops, c])}
                    onUpdateOrderStatus={(id, status) => setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o))}
                    harvestSchedules={harvestSchedules}
                    onAddHarvestSchedule={(h) => setHarvestSchedules([...harvestSchedules, h])}
                    onRemoveFollower={() => {}}
                    onBlockUser={() => {}}
                    buyerRequests={buyerRequests}
                    marketRates={marketRates}
                    onUpdateMarketRate={handleUpdateMarketRate}
                    onLogout={() => setCurrentUser(null)}
                    feedbacks={feedbacks}
                />
            )}

            {currentView === 'marketplace' && (
                <Marketplace 
                    crops={crops} 
                    users={users}
                    onContact={(fid) => { 
                        const farmer = users.find(u => u.id === fid);
                        if(farmer) { setChatPartner(farmer); setCurrentView('chat'); }
                    }}
                    onBuy={(c) => setCart([...cart, c])}
                    onAddToCart={(c) => setCart([...cart, c])}
                    onViewAR={(c) => setArCrop(c)}
                    onViewDetails={(crop) => {
                        const farmer = users.find(u => u.id === crop.farmerId);
                        if(farmer) {
                            setSelectedStorefrontData({ farmer, crop });
                            setCurrentView('storefront');
                            window.scrollTo(0, 0);
                        }
                    }}
                    isBuyer={currentUser.role === Role.BUYER}
                    harvestSchedules={harvestSchedules}
                />
            )}

            {currentView === 'storefront' && selectedStorefrontData && (
                <FarmerStorefront 
                    farmer={selectedStorefrontData.farmer}
                    initialCrop={selectedStorefrontData.crop}
                    allCrops={crops}
                    currentUser={currentUser}
                    onBack={() => setCurrentView('marketplace')}
                    onAddToCart={(c) => {
                        setCart([...cart, c]);
                        alert("Added to cart!");
                    }}
                    onContact={(fid) => {
                        const farmer = users.find(u => u.id === fid);
                        if(farmer) { setChatPartner(farmer); setCurrentView('chat'); }
                    }}
                    onFollow={(fid) => {
                       const updatedUser = { ...currentUser, following: [...(currentUser.following || []), fid] };
                       setCurrentUser(updatedUser);
                       setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
                    }}
                    onUnfollow={(fid) => {
                       const updatedUser = { ...currentUser, following: (currentUser.following || []).filter(id => id !== fid) };
                       setCurrentUser(updatedUser);
                       setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
                    }}
                    onSubmitFeedback={(rating, comment, farmerId, cropId, cropName) => {
                        if (!currentUser) return;
                        const newFeedback: Feedback = {
                            id: `fb-${Date.now()}`,
                            farmerId,
                            buyerId: currentUser.id,
                            buyerName: currentUser.name,
                            rating,
                            comment,
                            cropId,
                            cropName,
                            timestamp: Date.now()
                        };
                        setFeedbacks(prev => [newFeedback, ...prev]);
                        
                        // Notification for Farmer
                        const newNotif: Notification = {
                            id: `n-${Date.now()}`,
                            userId: farmerId,
                            text: `New ${rating}★ review from ${currentUser.name}: "${comment.substring(0, 20)}..."`,
                            type: 'FEEDBACK_RECEIVED',
                            isRead: false,
                            timestamp: Date.now()
                        };
                        setNotifications(prev => [newNotif, ...prev]);
                    }}
                />
            )}

            {currentView === 'owner' && currentUser.role === Role.OWNER && (
                <OwnerDashboard 
                    users={users} 
                    crops={crops} 
                    orders={orders} 
                    marketRates={marketRates}
                    onLogout={() => setCurrentUser(null)}
                    onLoginAs={(u) => { setCurrentUser(u); setCurrentView(u.role === Role.FARMER ? 'dashboard' : 'marketplace'); }}
                    onUpdateRates={setMarketRates}
                />
            )}

            {currentView === 'orders' && currentUser.role === Role.BUYER && (
                <OrderHistory orders={orders} buyerId={currentUser.id} />
            )}

            {currentView === 'network' && currentUser.role === Role.BUYER && (
                <BuyerNetwork 
                    currentUser={currentUser} 
                    allUsers={users}
                    onOpenChat={(u) => { setChatPartner(u); setCurrentView('chat'); }}
                    onUnfollow={() => {}}
                    onViewProfile={() => {}}
                />
            )}

            {currentView === 'requests' && currentUser.role === Role.BUYER && (
                <BuyerRequests 
                    currentUser={currentUser}
                    requests={buyerRequests}
                    onRequestAdd={(r) => setBuyerRequests([...buyerRequests, r])}
                />
            )}

            {currentView === 'chat' && (
                <ChatFullPage 
                    currentUser={currentUser}
                    users={users}
                    initialChatPartner={chatPartner}
                    messages={messages}
                    onSendMessage={(text, att, rid) => {
                        const recId = rid || chatPartner?.id;
                        if(recId) {
                            const newMsg: Message = {
                                id: `m-${Date.now()}`,
                                senderId: currentUser.id,
                                receiverId: recId,
                                text,
                                timestamp: Date.now(),
                                isRead: false,
                                attachment: att
                            };
                            setMessages([...messages, newMsg]);
                        }
                    }}
                    onStartCall={handleStartCall}
                    activeCall={activeCall}
                    onEndCall={handleEndCall}
                    onDeleteMessage={handleDeleteMessage}
                />
            )}

            {currentView === 'forum' && <Forum currentUser={currentUser} />}
            {currentView === 'account' && (
                <AccountSettings 
                    user={currentUser} 
                    onLogout={() => setCurrentUser(null)} 
                    onUpdateUser={(u) => { setCurrentUser(u); setUsers(users.map(us => us.id === u.id ? u : us)); }}
                />
            )}
          </div>

          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            items={cart} 
            onRemove={(id) => setCart(cart.filter(c => c.id !== id))}
            onCheckout={(method, total) => {
                // Create mock orders
                const newOrders = cart.map(item => ({
                    id: `ord-${Date.now()}-${Math.random()}`,
                    buyerId: currentUser.id,
                    buyerName: currentUser.name,
                    farmerId: item.farmerId,
                    items: [{ cropId: item.id, name: item.name, quantity: 10, price: item.pricePerKg, image: item.images[0] }],
                    totalAmount: item.pricePerKg * 10,
                    paymentMethod: method,
                    status: 'Pending' as any,
                    date: Date.now(),
                    trackingUpdates: [{ status: 'Pending' as any, timestamp: Date.now() }]
                }));
                setOrders([...orders, ...newOrders]);
                setCart([]);
                setIsCartOpen(false);
                alert("Order Placed Successfully!");
            }}
          />

          <AudioAssistant currentUser={currentUser} currentView={currentView} onNavigate={handleNavigate} notifications={notifications} />
          
          <ChatOverlay 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)}
            currentUser={currentUser} 
            chatPartner={chatPartner} 
            messages={messages} 
            onSendMessage={(text) => {
                if (chatPartner) {
                    const newMsg: Message = {
                        id: `m-${Date.now()}`,
                        senderId: currentUser.id,
                        receiverId: chatPartner.id,
                        text,
                        timestamp: Date.now(),
                        isRead: false
                    };
                    setMessages([...messages, newMsg]);
                }
            }}
            onDeleteMessage={handleDeleteMessage}
          />

          {activeCall && activeCall.receiverId === currentUser.id && activeCall.status === 'offering' && (
             <IncomingCallModal 
                call={activeCall} 
                onAccept={handleAcceptCall} 
                onReject={() => setActiveCall(null)} 
                callerRole={getCallerRole(activeCall.callerId)}
             />
          )}

          {arCrop && <ARViewer imageUrl={arCrop.images[0]} onClose={() => setArCrop(null)} />}
        </>
      )}
    </div>
  );
};
