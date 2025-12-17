
import React, { useState } from 'react';
import { Role, User, Language, Notification } from '../types';
import { Leaf, User as UserIcon, LayoutDashboard, ShoppingBag, PlusCircle, ShoppingCart, MessageSquare, MessageCircle, Globe, Bell, Check, ShoppingBasket, Users, CheckCheck, ClipboardList, LogIn, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  cartCount: number;
  onOpenCart: () => void;
  onOpenChat?: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  unreadMessageCount?: number;
  onLogin?: (role: Role) => void;
}

const LANGUAGES: Language[] = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Punjabi'];

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onNavigate, currentView, cartCount, onOpenCart, onOpenChat, notifications, onMarkRead, onMarkAllRead, unreadMessageCount = 0, onLogin }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NavButton = ({ icon: Icon, label, view, onClick }: { icon: any, label: string, view?: string, onClick?: () => void }) => (
    <button 
      onClick={() => {
        if(onClick) onClick();
        else if(view) onNavigate(view);
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${view && currentView === view ? 'bg-agri-50 text-agri-700 shadow-sm' : 'text-slate-600 hover:text-agri-600 hover:bg-slate-50'}`}
    >
      <Icon size={18} /> <span>{label}</span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
              <div className="bg-gradient-to-tr from-agri-400 to-agri-600 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-agri-700 transition-colors hidden sm:block">
                {t('app.name')}
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Language */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-white/50 text-slate-600 transition-all"
                title="Select Language"
              >
                <Globe size={20} className="text-agri-600" />
                <span className="hidden md:inline text-sm font-medium">{language}</span>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50 max-h-80 overflow-y-auto custom-scrollbar">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-agri-50 transition-colors ${language === lang ? 'text-agri-600 font-bold bg-agri-50' : 'text-slate-600'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!currentUser && onLogin && (
              <div className="relative">
                <button 
                  onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <LogIn size={16} /> <span>{t('login.title')}</span> <ChevronDown size={14} />
                </button>

                {isLoginMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                    <button 
                      onClick={() => { onLogin(Role.FARMER); setIsLoginMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-agri-50 hover:text-agri-700 transition-colors"
                    >
                      {t('role.farmer')} Login
                    </button>
                    <button 
                      onClick={() => { onLogin(Role.BUYER); setIsLoginMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {t('role.buyer')} Login
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button 
                      onClick={() => { onLogin(Role.OWNER); setIsLoginMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wide"
                    >
                      Admin Access
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentUser && (
              <>
                {/* Desktop Menu */}
                <div className="flex items-center gap-2">
                  {currentUser.role === Role.FARMER ? (
                    <>
                      <NavButton icon={LayoutDashboard} label={t('nav.dashboard')} view="dashboard" />
                      <button onClick={() => onNavigate('forum')} className="p-2 text-slate-600 hover:text-agri-600 hover:bg-slate-100 rounded-full" title="Forum"><MessageSquare size={20}/></button>
                    </>
                  ) : (
                    <>
                      <NavButton icon={ShoppingBag} label={t('nav.marketplace')} view="marketplace" />
                      <button onClick={() => onNavigate('requests')} className="p-2 text-slate-600 hover:text-agri-600 rounded-full" title="Requests"><ClipboardList size={20}/></button>
                      <button onClick={() => onNavigate('network')} className="p-2 text-slate-600 hover:text-agri-600 rounded-full" title="Network"><Users size={20}/></button>
                      <button onClick={() => onNavigate('orders')} className="p-2 text-slate-600 hover:text-agri-600 rounded-full" title="Orders"><ShoppingBasket size={20}/></button>
                      
                      <button 
                        onClick={onOpenCart}
                        className="relative p-2 rounded-full text-slate-600 hover:text-agri-600 hover:bg-slate-100 transition-all duration-300 hover:scale-110"
                      >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-sm animate-pulse-slow">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Common Icons (Chat, Notifs, Profile) */}
                <button 
                  onClick={() => onOpenChat && onOpenChat()}
                  className="relative p-2 rounded-full hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <MessageCircle size={20} />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                      {unreadMessageCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`p-2 rounded-full transition-all hover:scale-110 ${isNotifOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse-slow shadow-sm ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">Notifications</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{unreadCount} new</span>
                          {unreadCount > 0 && (
                            <button onClick={onMarkAllRead} className="text-xs text-agri-600 hover:underline flex items-center gap-1 font-bold">
                              <CheckCheck size={12} /> Read All
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                onMarkRead(notif.id);
                                // Navigate logic based on notification type
                                if (currentUser.role === Role.FARMER) {
                                  onNavigate('dashboard');
                                } else if (currentUser.role === Role.BUYER) {
                                  if (notif.type === 'NEW_CROP') onNavigate('marketplace');
                                  if (notif.type === 'ORDER_UPDATE') onNavigate('orders');
                                }
                              }}
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-amber-50/50' : ''}`}
                            >
                               <div className="flex justify-between items-start mb-1">
                                 <p className="text-sm text-slate-800 font-medium">{notif.text}</p>
                                 {!notif.isRead && (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }} 
                                     className="text-agri-600 hover:text-agri-800 transition-colors"
                                   >
                                     <Check size={14} />
                                   </button>
                                 )}
                               </div>
                               <p className="text-xs text-slate-400">{new Date(notif.timestamp).toLocaleString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onNavigate('account')}
                    className={`p-1 rounded-full border-2 transition-all hover:scale-105 ${currentView === 'account' ? 'border-agri-500 shadow-md ring-2 ring-agri-100' : 'border-slate-200 hover:border-agri-400'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                       {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover"/> : <UserIcon size={18} className="text-slate-400" />}
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
