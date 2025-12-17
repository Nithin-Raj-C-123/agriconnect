
import React, { useState } from 'react';
import { Crop, User, Message, Order, OrderStatus, HarvestSchedule, BuyerRequest, Feedback, MarketRate } from '../types';
import { LayoutDashboard, Sprout, Upload, TestTube, CreditCard, Wallet, TrendingUp, Truck, UserCircle, LogOut, ShieldCheck, CheckCircle, MessageCircle, Calendar, ShoppingBag, Box, Navigation, Users, Ban, XCircle, BookOpen, ClipboardList, Package, MapPin, Star, Flag, Plus } from 'lucide-react';
import { MarketRates } from './MarketRates';
import { LogisticsFinder } from './LogisticsFinder';
import { UploadForm } from './UploadForm';
import { SoilTester } from './SoilTester';
import { InsuranceClaim } from './InsuranceClaim';
import { DiseaseScanner } from './DiseaseScanner';
import { LoanEligibility } from './LoanEligibility';
import { CropCard } from './CropCard';
import { CropCalendar } from './CropCalendar';
import { KnowledgeHub } from './KnowledgeHub';
import { WeatherWidget } from './WeatherWidget';
import { useLanguage } from '../contexts/LanguageContext';

interface FarmerDashboardProps {
  currentUser: User;
  crops: Crop[];
  messages: Message[];
  users: User[];
  orders: Order[];
  onNavigate: (view: string) => void;
  onOpenChat: (user: User | null) => void;
  onAddCrop: (crop: Crop) => void; 
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  harvestSchedules: HarvestSchedule[];
  onAddHarvestSchedule: (plan: HarvestSchedule) => void;
  onRemoveFollower: (userId: string) => void;
  onBlockUser: (userId: string) => void;
  onReportUser?: (userId: string) => void;
  buyerRequests: BuyerRequest[];
  feedbacks?: Feedback[];
  marketRates: MarketRate[];
  onUpdateMarketRate?: (rates: MarketRate[]) => void;
  unreadMessageCount?: number;
  onLogout?: () => void;
}

type FarmerView = 'dashboard' | 'my-crops' | 'sell' | 'testing' | 'loans' | 'financials' | 'mandi' | 'logistics' | 'profile' | 'chat' | 'calendar' | 'orders' | 'followers' | 'learn' | 'requests' | 'feedback';

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ 
  currentUser, crops, users, orders, onNavigate, onOpenChat, onAddCrop, onUpdateOrderStatus, harvestSchedules, onAddHarvestSchedule, onRemoveFollower, onBlockUser, onReportUser, buyerRequests, feedbacks = [], marketRates, onUpdateMarketRate, unreadMessageCount = 0, onLogout
}) => {
  const [currentView, setCurrentView] = useState<FarmerView>('dashboard');
  const [testTab, setTestTab] = useState<'soil' | 'disease'>('soil');
  
  const { t } = useLanguage();

  const myCrops = crops.filter(c => c.farmerId === currentUser.id);
  const myOrders = orders.filter(o => o.farmerId === currentUser.id).sort((a,b) => b.date - a.date);
  const myFollowers = users.filter(u => currentUser.followers?.includes(u.id));
  const myFeedbacks = feedbacks.filter(f => f.farmerId === currentUser.id).sort((a,b) => b.timestamp - a.timestamp);
  const latestFeedback = myFeedbacks.length > 0 ? myFeedbacks[0] : null;

  const SidebarItem = ({ id, icon: Icon, label }: { id: FarmerView, icon: any, label: string }) => (
    <button 
      onClick={() => {
        if (id === 'chat') {
          onOpenChat(null);
        } else if (id === 'profile') {
          onNavigate('account');
        } else {
          setCurrentView(id);
        }
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${currentView === id && id !== 'chat' ? 'bg-gradient-to-r from-agri-600 to-agri-500 text-white shadow-lg translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}
    >
      <div className="relative">
        <Icon size={20} className={`transition-transform duration-300 ${currentView === id ? 'scale-110' : 'group-hover:scale-110'}`} />
        {id === 'chat' && unreadMessageCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadMessageCount}
          </span>
        )}
      </div>
      <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (currentView) {
      // ... (keep other cases like dashboard, followers, etc. same as original) ...
      case 'dashboard':
        return (
          <div className="space-y-8 animate-slide-up">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t('dash.overview')}</h2>
               <p className="text-slate-500 text-xs md:text-sm hidden sm:block">{new Date().toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
            </div>
            
            <WeatherWidget />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-zoom-in delay-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <Sprout className="text-agri-600" size={24} />
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">+2 new</span>
                </div>
                <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">Active Listings</div>
                <div className="text-4xl font-extrabold text-slate-800">{myCrops.length}</div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-zoom-in delay-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Wallet className="text-emerald-600" size={24} />
                  </div>
                </div>
                <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">Wallet Balance</div>
                <div className="text-4xl font-extrabold text-emerald-600">₹{currentUser.walletBalance?.toLocaleString()}</div>
              </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-zoom-in delay-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <ShoppingBag className="text-amber-500" size={24} />
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">Action Needed</span>
                </div>
                <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">Pending Orders</div>
                <div className="text-4xl font-extrabold text-amber-500">{myOrders.filter(o => o.status !== 'Delivered').length}</div>
              </div>

              {/* Feedback Widget */}
              <div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-zoom-in delay-400 cursor-pointer group"
                onClick={() => setCurrentView('feedback')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                    <Star className="text-purple-600" size={24} />
                  </div>
                  {latestFeedback && (new Date().getTime() - latestFeedback.timestamp < 86400000) && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold animate-pulse">New</span>
                  )}
                </div>
                <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">{t('dash.feedback')}</div>
                <div className="text-4xl font-extrabold text-purple-600 mb-2">{myFeedbacks.length}</div>
                
                {latestFeedback ? (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:border-purple-100 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                       <p className="font-bold text-slate-700 truncate">{latestFeedback.buyerName}</p>
                       <div className="flex text-amber-400"><Star size={10} fill="currentColor"/> <span className="text-slate-400 ml-0.5">{latestFeedback.rating}</span></div>
                    </div>
                    {latestFeedback.cropName && (
                       <p className="text-purple-600 mb-1 flex items-center gap-1 font-medium">
                         <Sprout size={10}/> For: {latestFeedback.cropName}
                       </p>
                    )}
                    <p className="truncate opacity-80 italic">"{latestFeedback.comment}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No reviews yet</p>
                )}
              </div>
            </div>
            <div className="animate-slide-up delay-500 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-x-auto">
               <MarketRates rates={marketRates} />
            </div>
          </div>
        );
      case 'followers':
        return (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-agri-600" /> {t('dash.community')}</h2>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
               <p className="text-slate-500 mb-6">These buyers follow your profile to get instant updates on new harvests.</p>
               
               {myFollowers.length === 0 ? (
                 <div className="text-center py-10 text-slate-400">
                   <Users size={48} className="mx-auto mb-2 opacity-50" />
                   <p>No followers yet. Promote your profile to buyers!</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {myFollowers.map((follower) => (
                     <div key={follower.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <img src={follower.avatar} alt={follower.name} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-slate-800">{follower.name}</h4>
                            <p className="text-xs text-slate-500 capitalize">{follower.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                           <button 
                             onClick={() => onOpenChat(follower)}
                             className="p-2 text-agri-600 hover:bg-agri-50 rounded-full" 
                             title="Chat"
                           >
                             <MessageCircle size={18} />
                           </button>
                           <button 
                             onClick={() => {
                               if(window.confirm(`Remove ${follower.name} from followers?`)) onRemoveFollower(follower.id);
                             }}
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full" 
                             title="Remove Follower"
                           >
                             <XCircle size={18} />
                           </button>
                           <button 
                             onClick={() => {
                               if(window.confirm(`Block ${follower.name}? They won't be able to contact you.`)) onBlockUser(follower.id);
                             }}
                             className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full" 
                             title="Block User"
                           >
                             <Ban size={18} />
                           </button>
                           <button 
                             onClick={() => onReportUser && onReportUser(follower.id)}
                             className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full" 
                             title="Report User"
                           >
                             <Flag size={18} />
                           </button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6 animate-slide-up">
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><ShoppingBag className="text-agri-600" /> {t('dash.orders')}</h2>
             {myOrders.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                 <p className="text-slate-400">No orders yet.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {myOrders.map((order, idx) => (
                   <div 
                      key={order.id} 
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-slide-in-from-bottom"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 border-b border-slate-100 pb-4 gap-2">
                         <div>
                           <p className="text-xs text-slate-500 font-bold uppercase">Order ID</p>
                           <p className="font-bold text-slate-800">#{order.id.slice(-6)}</p>
                           <p className="text-xs text-slate-400 mt-1">{new Date(order.date).toLocaleString()}</p>
                         </div>
                         <div className="sm:text-right">
                           <p className="text-xs text-slate-500 font-bold uppercase">Buyer</p>
                           <p className="font-bold text-slate-800">{order.buyerName}</p>
                           <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{order.paymentMethod}</p>
                         </div>
                      </div>

                      <div className="mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                             <span>{item.name} x {item.quantity} units</span>
                             <span className="font-bold">₹{item.price}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between font-bold text-lg">
                           <span>Total</span>
                           <span className="text-agri-600">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 pt-4 border-t border-slate-50 bg-slate-50/50 p-3 rounded-xl">
                        <span className="text-sm font-bold text-slate-600">Status: <span className="text-agri-700 uppercase">{order.status}</span></span>
                        
                        <div className="flex-1 flex flex-wrap justify-end gap-2 w-full sm:w-auto">
                          {order.status === 'Pending' && (
                            <button onClick={() => onUpdateOrderStatus(order.id, 'Confirmed')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md">Confirm</button>
                          )}
                          {order.status === 'Confirmed' && (
                            <button onClick={() => onUpdateOrderStatus(order.id, 'Packed')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 flex items-center gap-1 shadow-md"><Box size={14} /> Packed</button>
                          )}
                          {order.status === 'Packed' && (
                             <button onClick={() => onUpdateOrderStatus(order.id, 'On Route')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 shadow-md"><Navigation size={14} /> Ship</button>
                          )}
                          {order.status === 'On Route' && (
                             <button onClick={() => onUpdateOrderStatus(order.id, 'Delivered')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-md"><CheckCircle size={14} /> Delivered</button>
                          )}
                          {order.status === 'Delivered' && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full"><CheckCircle size={14} /> Complete</span>
                          )}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        );
      case 'my-crops':
        return (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800">{t('dash.mycrops')}</h2>
            {myCrops.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                 <Sprout className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                 <h3 className="text-lg font-medium text-slate-900">No crops listed yet</h3>
                 <button onClick={() => setCurrentView('sell')} className="text-agri-600 font-bold hover:underline mt-2">Upload your first harvest</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCrops.map((crop, idx) => (
                  <CropCard 
                    key={crop.id} 
                    crop={crop} 
                    isBuyer={false} 
                    onContact={() => {}} 
                    onBuy={() => {}}
                    animationDelay={`${idx * 100}ms`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'sell':
        return <div className="animate-zoom-in"><UploadForm onUpload={(newCrop) => { 
          onAddCrop(newCrop);
          setCurrentView('my-crops'); 
        }} currentUser={currentUser} existingCrops={crops} /></div>;
      case 'calendar':
        return (
          <div className="space-y-6 animate-slide-up">
            <CropCalendar crops={myCrops} isFarmer={true} harvestPlans={harvestSchedules} onAddPlan={onAddHarvestSchedule} />
          </div>
        );
      case 'testing':
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
              <button onClick={() => setTestTab('soil')} className={`pb-2 font-bold text-sm transition-colors whitespace-nowrap ${testTab === 'soil' ? 'text-agri-600 border-b-2 border-agri-600' : 'text-slate-500 hover:text-slate-800'}`}>Soil Test</button>
              <button onClick={() => setTestTab('disease')} className={`pb-2 font-bold text-sm transition-colors whitespace-nowrap ${testTab === 'disease' ? 'text-agri-600 border-b-2 border-agri-600' : 'text-slate-500 hover:text-slate-800'}`}>Disease Scanner</button>
            </div>
            <div className="animate-fade-in">
              {testTab === 'soil' ? <SoilTester /> : <DiseaseScanner />}
            </div>
          </div>
        );
      case 'loans':
        return <div className="animate-slide-up"><LoanEligibility user={currentUser} /></div>;
      case 'financials':
        return (
          <div className="space-y-8 animate-slide-up">
             <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('dash.financials')}</h2>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Wallet */}
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4"><Wallet className="text-green-600 group-hover:scale-110 transition-transform" /> Wallet Balance</h3>
                  <p className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">₹{currentUser.walletBalance?.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mb-6">Funds from sales available for withdrawal.</p>
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all transform active:scale-95">Withdraw Funds</button>
               </div>

               {/* Credit Score */}
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2"><ShieldCheck className="text-blue-600 group-hover:scale-110 transition-transform" /> Farmer Credit Score</h3>
                  <div className="flex items-end gap-3 mb-6">
                     <span className="text-5xl font-extrabold text-blue-600 tracking-tight">{currentUser.creditScore}</span>
                     <span className="text-sm text-green-600 font-bold mb-2 bg-green-50 px-2 py-1 rounded-lg">Excellent</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Score Factors:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                       <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500"/> Quality</span>
                       <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500"/> Delivery</span>
                       <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500"/> Consistent</span>
                       <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500"/> Assets</span>
                    </div>
                  </div>
               </div>
             </div>

             <div className="bg-gradient-to-r from-emerald-50 to-green-100 p-8 rounded-3xl border border-green-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div>
                   <h3 className="text-2xl font-extrabold text-green-900 mb-2">Instant Kissan Micro-Loan</h3>
                   <p className="text-green-800 max-w-lg">Get instant approval based on your platform credit score.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => window.open('https://www.sbi.co.in/web/agri-rural/agriculture-banking/kisan-credit-card', '_blank')}
                     className="px-6 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 shadow-lg hover:shadow-xl transition-all active:scale-95 text-center"
                   >
                     Apply Now
                   </button>
                   <button 
                     onClick={() => setCurrentView('loans')}
                     className="px-6 py-3 bg-white text-green-700 border border-green-300 rounded-xl font-bold hover:bg-green-50 transition-colors text-center shadow-sm hover:shadow"
                   >
                     View Eligibility
                   </button>
                </div>
             </div>

             <div className="animate-slide-up delay-200"><InsuranceClaim /></div>
          </div>
        );
      case 'mandi':
        return (
            <div className="animate-slide-up space-y-6">
                <MarketRates rates={marketRates} />
            </div>
        );
      case 'logistics':
        return <div className="animate-slide-up"><LogisticsFinder /></div>;
      case 'learn':
        return <KnowledgeHub />;
      case 'requests':
        return (
          <div className="space-y-6 animate-slide-up">
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-agri-600" /> {t('dash.requests')}
             </h2>
             <p className="text-slate-500">See what buyers are looking for.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buyerRequests.filter(r => r.status === 'Open').map(req => (
                   <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
                        Target: ₹{req.targetPrice}/kg
                      </div>
                      
                      <h3 className="font-bold text-xl text-slate-800 mb-1">{req.cropName}</h3>
                      <p className="text-xs text-slate-500 mb-4">Requested by {req.buyerName}</p>
                      
                      <div className="space-y-2 text-sm text-slate-600 mb-6">
                         <div className="flex justify-between">
                            <span className="flex items-center gap-2"><Package size={14} className="text-slate-400"/> Quantity</span>
                            <span className="font-bold">{req.quantity} kg</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> Needed By</span>
                            <span className="font-bold">{new Date(req.requiredDate).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> Location</span>
                            <span className="font-bold truncate max-w-[150px]">{req.location}</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => onOpenChat(users.find(u => u.id === req.buyerId) || null)}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                      >
                        <MessageCircle size={18} /> Contact Buyer
                      </button>
                   </div>
                ))}
                {buyerRequests.filter(r => r.status === 'Open').length === 0 && (
                   <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                     <ClipboardList size={48} className="mx-auto mb-2 opacity-50"/>
                     <p>No active buyer requests.</p>
                   </div>
                )}
             </div>
          </div>
        );
      case 'feedback':
        return (
          <div className="space-y-6 animate-slide-up">
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
               <Star className="text-amber-500" /> {t('dash.feedback')}
             </h2>
             <p className="text-slate-500">Reviews and ratings from your buyers.</p>

             {myFeedbacks.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                 <Star size={48} className="mx-auto mb-2 opacity-30 text-amber-500"/>
                 <p className="text-slate-400">No feedback received yet.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {myFeedbacks.map(f => (
                   <div key={f.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{f.buyerName}</span>
                                <span className="text-xs text-slate-400">• {new Date(f.timestamp).toLocaleDateString()}</span>
                            </div>
                            {f.cropName && (
                                <div className="text-xs font-medium text-agri-600 bg-agri-50 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                                    <Sprout size={10} /> For: {f.cropName}
                                </div>
                            )}
                         </div>
                         <div className="flex gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={16} fill={i < f.rating ? "currentColor" : "none"} className={i < f.rating ? "" : "text-slate-200"}/>
                            ))}
                         </div>
                      </div>
                      <p className="text-slate-600 italic mt-2">"{f.comment}"</p>
                   </div>
                 ))}
               </div>
             )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50/50">
      
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col h-[calc(100vh-64px)] sticky top-16">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-10 bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10 shrink-0">
              {currentUser.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{t('role.farmer')}</p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1 px-6 overflow-y-auto flex-1 custom-scrollbar">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label={t('dash.overview')} />
          <SidebarItem id="orders" icon={ShoppingBag} label={t('dash.orders')} />
          <SidebarItem id="requests" icon={ClipboardList} label={t('dash.requests')} />
          <SidebarItem id="my-crops" icon={Sprout} label={t('dash.mycrops')} />
          <SidebarItem id="calendar" icon={Calendar} label={t('dash.calendar')} />
          <SidebarItem id="sell" icon={Upload} label={t('dash.sell')} />
          <SidebarItem id="followers" icon={Users} label={t('dash.community')} />
          <SidebarItem id="chat" icon={MessageCircle} label={t('dash.messages')} />
          <SidebarItem id="feedback" icon={Star} label={t('dash.feedback')} />
          <SidebarItem id="learn" icon={BookOpen} label={t('dash.learn')} />
          <SidebarItem id="testing" icon={TestTube} label={t('dash.testing')} />
          <SidebarItem id="loans" icon={CreditCard} label={t('dash.loans')} />
          <SidebarItem id="financials" icon={Wallet} label={t('dash.financials')} />
          <SidebarItem id="mandi" icon={TrendingUp} label={t('dash.mandi')} />
          <SidebarItem id="logistics" icon={Truck} label={t('dash.logistics')} />
          <SidebarItem id="profile" icon={UserCircle} label={t('dash.profile')} />
        </nav>
        <div className="p-6 border-t border-slate-800">
           <button 
             onClick={() => {
                if (onLogout) onLogout();
                else onNavigate('home');
             }} 
             className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 py-3 rounded-xl transition-all duration-300 font-medium active:scale-95"
           >
             <LogOut size={18} /> {t('nav.logout')}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};
