
import React, { useState } from 'react';
import { User, Crop, EcoScore } from '../types';
import { CropCard } from './CropCard';
import { ArrowLeft, MapPin, Star, ShieldCheck, Leaf, ShoppingBag, Bell, Compass, Box, UserPlus, UserCheck, Ban, Lock, MessageSquare, Send, Flag, Users } from 'lucide-react';
import { FarmTourViewer } from './FarmTourViewer';

interface FarmerStorefrontProps {
  farmer: User;
  currentUser?: User | null; // Pass current user to check following status
  initialCrop: Crop;
  allCrops: Crop[];
  onBack: () => void;
  onAddToCart: (crop: Crop) => void;
  onContact: (farmerId: string) => void;
  onFollow?: (farmerId: string) => void;
  onUnfollow?: (farmerId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onSubmitFeedback?: (rating: number, comment: string, farmerId: string, cropId?: string, cropName?: string) => void;
}

export const FarmerStorefront: React.FC<FarmerStorefrontProps> = ({ 
  farmer, currentUser, initialCrop, allCrops, onBack, onAddToCart, onContact, onFollow, onUnfollow, onBlock, onReport, onSubmitFeedback 
}) => {
  const [notified, setNotified] = useState(false);
  const [activeTour, setActiveTour] = useState<{ isOpen: boolean, image?: string }>({ isOpen: false });
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  
  const farmerCrops = allCrops.filter(c => c.farmerId === farmer.id && c.id !== initialCrop.id);
  const isFutureHarvest = new Date(initialCrop.harvestDate) > new Date();
  const isOutOfStock = initialCrop.quantityKg === 0;

  const isFollowing = currentUser?.following?.includes(farmer.id);

  const handleNotify = () => {
    setNotified(true);
    alert(`We will notify you when ${initialCrop.name} is available!`);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(onSubmitFeedback && feedbackComment.trim()) {
      onSubmitFeedback(feedbackRating, feedbackComment, farmer.id, initialCrop.id, initialCrop.name);
      setFeedbackComment('');
      setFeedbackRating(5);
      alert("Feedback submitted!");
    }
  };

  return (
    <div className="space-y-6 animate-slide-in-from-right">
      {/* Navigation */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-agri-600 transition-colors font-medium">
        <ArrowLeft size={20} /> Back to Marketplace
      </button>

      {/* Selected Crop Detail & Farmer Profile Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Main Image Area */}
          <div className="h-96 bg-slate-100 relative group">
            <img src={initialCrop.images[0]} alt={initialCrop.name} className="w-full h-full object-cover" />
            
            {/* 360 Crop View Button */}
            <button 
              onClick={() => setActiveTour({ isOpen: true, image: initialCrop.field360Image })}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Compass size={18} className="text-agri-600"/> View Land in 360°
            </button>

            <div className="absolute top-4 left-4 flex gap-2">
               {initialCrop.isOrganic && (
                 <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                   <Leaf size={12} /> Certified Organic
                 </span>
               )}
               {initialCrop.ecoScore === EcoScore.A && (
                 <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                   Eco Score: A+
                 </span>
               )}
            </div>
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col">
            <div className="flex items-start justify-between mb-4">
               <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{initialCrop.name}</h1>
                  <p className="text-lg font-medium text-slate-500 flex items-center gap-2">
                    <MapPin size={18} /> {initialCrop.location}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-4xl font-extrabold text-agri-600">₹{initialCrop.pricePerKg}</p>
                  <p className="text-sm text-slate-400">per kg</p>
               </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="text-sm font-bold text-slate-500 uppercase">Farmer Profile</h3>
                 <div className="flex gap-2">
                   {currentUser && onFollow && onUnfollow && (
                      <button 
                        onClick={() => isFollowing ? onUnfollow(farmer.id) : onFollow(farmer.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${isFollowing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-agri-100 text-agri-700 hover:bg-agri-200'}`}
                      >
                        {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                      </button>
                   )}
                   {currentUser && onBlock && (
                     <button
                       onClick={() => {
                         if(window.confirm(`Are you sure you want to block ${farmer.name}? You won't see their crops anymore.`)) {
                           onBlock(farmer.id);
                           onBack(); // Go back to marketplace
                         }
                       }}
                       className="text-xs font-bold px-2 py-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                       title="Block User"
                     >
                       <Ban size={14} />
                     </button>
                   )}
                   {currentUser && onReport && (
                     <button
                       onClick={() => onReport(farmer.id)}
                       className="text-xs font-bold px-2 py-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                       title="Report User"
                     >
                       <Flag size={14} />
                     </button>
                   )}
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <img src={farmer.avatar} alt={farmer.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                 <div>
                   <p className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     {farmer.name} {farmer.blockchainVerified && (
                       <span title="Verified Identity" className="flex items-center">
                         <ShieldCheck size={16} className="text-blue-500" />
                       </span>
                     )}
                   </p>
                   <div className="flex items-center gap-3 text-sm mt-1">
                     <div className="flex items-center gap-1 text-amber-500 font-bold">
                       <Star size={14} fill="currentColor" /> {farmer.trustScore} / 5.0
                     </div>
                     <span className="text-slate-300">|</span>
                     <div className="flex items-center gap-1 text-slate-600 font-medium">
                       <Users size={14} /> {farmer.followers?.length || 0} Followers
                     </div>
                   </div>
                   <p className="text-xs text-slate-400 mt-1">Member since 2023 • 98% Delivery Rate</p>
                 </div>
               </div>
               
               {/* Farmer Location Map */}
               {initialCrop.location && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                      <MapPin size={12}/> Farm Location
                    </h4>
                    <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(initialCrop.location)}&z=13&output=embed`}
                        title="Farmer Location"
                      ></iframe>
                    </div>
                  </div>
               )}
            </div>

            <div className="mb-6 flex-grow">
               <h3 className="font-bold text-slate-800 mb-2">Description</h3>
               <p className="text-slate-600 leading-relaxed">{initialCrop.description}</p>
               {isFutureHarvest && (
                 <p className="mt-4 text-amber-600 font-bold text-sm bg-amber-50 p-3 rounded-lg border border-amber-100">
                    Expected Harvest: {new Date(initialCrop.harvestDate).toLocaleDateString()}
                 </p>
               )}
            </div>

            <div className="flex gap-4 mt-auto">
               <button 
                 onClick={() => {
                   onAddToCart(initialCrop);
                   alert("Added to cart!");
                 }}
                 disabled={isOutOfStock}
                 className="flex-1 bg-white border-2 border-agri-600 text-agri-600 py-3 rounded-xl font-bold hover:bg-agri-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 <ShoppingBag size={20} /> {isOutOfStock ? 'Out of Stock' : isFutureHarvest ? 'Pre-order Now' : 'Add to Cart'}
               </button>
               
               {(isOutOfStock || isFutureHarvest) && (
                 <button 
                    onClick={handleNotify}
                    className={`px-6 rounded-xl font-bold transition-colors flex items-center gap-2 ${notified ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                    disabled={notified}
                 >
                    <Bell size={20} /> {notified ? 'Notified' : 'Notify Me'}
                 </button>
               )}

               {isFollowing ? (
                 <button 
                   onClick={() => onContact(farmer.id)}
                   className="px-6 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                 >
                   Chat
                 </button>
               ) : (
                 <button 
                   disabled
                   className="px-6 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed"
                   title="Follow farmer to unlock chat"
                 >
                   <Lock size={16} /> Chat
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Farm Profile Section */}
      {farmer.farm3dProfile && (
        <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Box size={200} />
           </div>
           
           <div className="relative z-10">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
               <Compass className="text-purple-400" /> Virtual Farm Visit
             </h2>
             <p className="text-slate-300 mb-6 max-w-xl">
               Explore {farmer.name}'s farm infrastructure in 3D. Inspect storage quality, irrigation systems, and field conditions before you buy.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {farmer.farm3dProfile.map((view) => (
                   <div 
                     key={view.id} 
                     onClick={() => setActiveTour({ isOpen: true, image: undefined })} // Open general tour
                     className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
                   >
                      <div className="h-32 bg-slate-700 relative">
                        <img src={view.imageUrl} alt={view.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="bg-black/50 p-2 rounded-full border border-white/50">
                             <Compass size={24} />
                           </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm">{view.name}</h3>
                        <p className="text-xs text-slate-400">{view.type}</p>
                      </div>
                   </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {/* Cross Selling - Other Crops by Farmer */}
      <div className="pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingBag className="text-agri-600" /> More from {farmer.name}'s Farm
        </h2>
        
        {farmerCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {farmerCrops.map(crop => (
              <CropCard 
                key={crop.id}
                crop={crop}
                isBuyer={true}
                onContact={onContact}
                onBuy={() => {}} 
                onAddToCart={(c) => {
                    onAddToCart(c);
                    alert("Added to cart!");
                }}
                onViewFarmTour={() => setActiveTour({ isOpen: true, image: crop.field360Image })}
                trustScore={farmer.trustScore}
                hasFarmTour={farmer.hasFarmTour}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">This farmer currently has no other active listings.</p>
        )}
      </div>

      {/* Leave Feedback Section */}
      {currentUser && currentUser.role === 'BUYER' && (
        <div className="pt-8 border-t border-slate-200">
           <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <MessageSquare className="text-agri-600" /> Leave Feedback
           </h2>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
              <form onSubmit={handleFeedbackSubmit}>
                 <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button" 
                            onClick={() => setFeedbackRating(star)}
                            className="focus:outline-none"
                          >
                             <Star size={24} fill={star <= feedbackRating ? "gold" : "none"} className={star <= feedbackRating ? "text-amber-400" : "text-slate-300"} />
                          </button>
                       ))}
                    </div>
                 </div>
                 <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Comment</label>
                    <textarea 
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                      rows={3}
                      placeholder="Share your experience with this farmer..."
                    />
                 </div>
                 <button 
                   type="submit" 
                   disabled={!feedbackComment}
                   className="bg-agri-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-agri-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                 >
                   <Send size={16} /> Submit Feedback
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Render Tour Modal */}
      {activeTour.isOpen && (
        <FarmTourViewer 
          onClose={() => setActiveTour({ isOpen: false })} 
          farmerName={farmer.name} 
          farmerId={farmer.id}
          initialImage={activeTour.image}
        />
      )}
    </div>
  );
};
