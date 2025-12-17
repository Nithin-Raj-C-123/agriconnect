
import React, { useState } from 'react';
import { Crop } from '../types';
import { MapPin, Calendar, Star, MessageCircle, ShoppingCart, Timer, Box, Bell, BellRing, Leaf, ShieldCheck, Compass, Info } from 'lucide-react';

interface CropCardProps {
  crop: Crop;
  onContact: (farmerId: string) => void;
  onBuy: (crop: Crop) => void;
  onAddToCart?: (crop: Crop) => void;
  onViewAR?: (crop: Crop) => void;
  onViewFarmTour?: (farmerId: string, cropImage?: string) => void; 
  onViewDetails?: (crop: Crop) => void;
  isBuyer: boolean;
  trustScore?: number;
  sustainabilityScore?: number;
  blockchainVerified?: boolean;
  hasFarmTour?: boolean;
  animationDelay?: string; // New prop for staggered entry
}

export const CropCard: React.FC<CropCardProps> = ({ 
  crop, onContact, onBuy, onAddToCart, onViewAR, onViewFarmTour, onViewDetails,
  isBuyer, trustScore, sustainabilityScore, blockchainVerified, hasFarmTour, animationDelay 
}) => {
  const isFutureHarvest = new Date(crop.harvestDate) > new Date();
  const [alertEnabled, setAlertEnabled] = useState(false);

  const getExpiryDisplay = () => {
    if (crop.bestBeforeDate) {
      const daysLeft = Math.ceil((new Date(crop.bestBeforeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) {
        return (
          <div className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100 shadow-sm">
            <Timer size={10} /> Fresh for {daysLeft} days
          </div>
        );
      } else {
        return (
           <div className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-100 shadow-sm">
            <Timer size={10} /> Expiring Soon
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-agri-100 transition-all duration-500 flex flex-col h-full group transform hover:-translate-y-1 animate-slide-up cursor-pointer"
      style={{ animationDelay }}
      onClick={() => onViewDetails && onViewDetails(crop)}
    >
      <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
        <img 
          src={crop.images[0]} 
          alt={crop.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
           <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-agri-700 shadow-sm flex items-center gap-1">
            <Leaf size={10} /> {crop.category}
           </div>
           {blockchainVerified && (
             <div className="bg-slate-900/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-sm border border-slate-700">
               <ShieldCheck size={10} className="text-emerald-400" /> Verified
             </div>
           )}
        </div>
        
        {/* Action Buttons Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end translate-y-full group-hover:translate-y-0 transition-transform duration-300">
           {/* 3D Farm Tour Button */}
           {hasFarmTour && isBuyer && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onViewFarmTour && onViewFarmTour(crop.farmerId, crop.field360Image); 
                }}
                className="bg-sky-500/90 hover:bg-sky-600 text-white p-2 rounded-lg shadow-lg backdrop-blur-md transition-all transform hover:scale-110"
                title="Take a 3D Tour"
              >
                <Compass size={16} />
              </button>
            )}

            {/* AR View Button */}
            {crop.arModelUrl && isBuyer && (
              <button 
                onClick={(e) => { e.stopPropagation(); onViewAR && onViewAR(crop); }}
                className="bg-indigo-600/90 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-lg backdrop-blur-md transition-all transform hover:scale-110 ml-auto"
                title="Visualize in AR"
              >
                <Box size={16} />
              </button>
            )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-xl text-slate-800 leading-tight group-hover:text-agri-700 transition-colors">{crop.name}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <MapPin size={14} className="text-slate-400" /> {crop.location}
            </p>
            {trustScore !== undefined && (
              <div className="flex items-center gap-1 mt-2 bg-amber-50 px-2 py-0.5 rounded-md w-fit" title={`Farmer Reputation: ${trustScore}/5`}>
                 <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} fill={i < Math.round(trustScore) ? "currentColor" : "none"} />
                    ))}
                 </div>
              </div>
            )}
            {sustainabilityScore && sustainabilityScore > 80 && (
               <div className="flex items-center gap-1 text-[10px] text-green-700 font-bold mt-1">
                 <Leaf size={10} /> Eco-Friendly Farm
               </div>
            )}
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end">
               <p className="text-2xl font-extrabold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">₹{crop.pricePerKg.toFixed(0)}</p>
               {isBuyer && (
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setAlertEnabled(!alertEnabled);
                     if(!alertEnabled) alert(`You will be notified when ${crop.name} price drops!`);
                   }}
                   className={`mt-1 p-1.5 rounded-full transition-all duration-300 ${alertEnabled ? 'text-agri-600 bg-agri-50 rotate-12 scale-110' : 'text-slate-300 hover:text-agri-500 hover:bg-slate-50'}`}
                   title="Price Drop Alert"
                 >
                   {alertEnabled ? <BellRing size={16} /> : <Bell size={16} />}
                 </button>
               )}
            </div>
            <p className="text-xs text-slate-400 font-medium">per kg</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
          {crop.description}
        </p>
        
        <div className="space-y-2 mb-4">
           {getExpiryDisplay()}
           <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:border-agri-100 transition-colors">
            <div className="flex items-center gap-1.5">
              <ShoppingCart size={14} className="text-slate-400" /> 
              <span>Stock: <span className="font-bold text-slate-700">{crop.quantityKg}kg</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" /> 
              <span>{isFutureHarvest ? 'Available:' : 'Harvested:'} {new Date(crop.harvestDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
            </div>
          </div>
          {crop.aiEstimatedWeight && (
             <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-center font-semibold border border-blue-100">
               Verified by AI Weight Estimation
             </div>
          )}
        </div>

        {isBuyer && (
          <div className="flex gap-2 mt-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); onContact(crop.farmerId); }}
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-agri-300 hover:text-agri-600 hover:bg-agri-50 transition-all active:scale-95"
              title="Chat with Farmer"
            >
              <MessageCircle size={20} />
            </button>
            
            {onAddToCart && (
               <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(crop); }}
                className="flex-1 bg-white border-2 border-agri-600 text-agri-600 py-3 rounded-xl text-sm font-bold hover:bg-agri-50 transition-colors active:scale-95"
               >
                 + Cart
               </button>
            )}

            <button 
              onClick={(e) => { 
                  e.stopPropagation(); 
                  // If details handler exists, prioritize it for the main 'Buy' action as per request
                  if (onViewDetails) onViewDetails(crop);
                  else onBuy(crop);
              }}
              className={`flex-1 ${isFutureHarvest ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-agri-600 hover:bg-agri-700 shadow-agri-200'} text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 transform flex items-center justify-center gap-1`}
            >
              {isFutureHarvest ? 'Pre-book' : 'Buy Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
