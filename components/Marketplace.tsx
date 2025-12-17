
import React, { useState, useMemo } from 'react';
import { Crop, CropCategory, User, HarvestSchedule } from '../types';
import { CropCard } from './CropCard';
import { Search, Filter, SlidersHorizontal, Calendar, Grid, Loader2 } from 'lucide-react';
import { CropCalendar } from './CropCalendar';
import { useLanguage } from '../contexts/LanguageContext';

interface MarketplaceProps {
  crops: Crop[];
  users: User[];
  onContact: (farmerId: string) => void;
  onBuy: (crop: Crop) => void;
  onAddToCart: (crop: Crop) => void;
  onViewAR: (crop: Crop) => void;
  onViewFarmTour?: (farmerId: string, cropImage?: string) => void;
  onViewDetails?: (crop: Crop) => void;
  isBuyer: boolean;
  harvestSchedules?: HarvestSchedule[];
}

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  crops, users, onContact, onBuy, onAddToCart, onViewAR, onViewFarmTour, onViewDetails, isBuyer, harvestSchedules
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(500); 
  const [showPreOrders, setShowPreOrders] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const { t } = useLanguage();

  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            crop.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
      const matchesPrice = crop.pricePerKg <= maxPrice;
      const isFuture = new Date(crop.harvestDate) > new Date();
      
      if (!showPreOrders && isFuture) return false;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [crops, searchTerm, selectedCategory, maxPrice, showPreOrders]);

  const getFarmerInfo = (farmerId: string) => {
    return users.find(u => u.id === farmerId);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Filters & Search Header */}
      <div className="glass p-4 md:p-5 rounded-3xl shadow-lg border border-white/50 sticky top-20 z-10 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-agri-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder={t('search.placeholder')}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white/80 focus:ring-4 focus:ring-agri-100 focus:border-agri-400 outline-none transition-all shadow-sm focus:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Horizontal Scroll for Categories */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 ${selectedCategory === 'All' ? 'bg-agri-600 text-white shadow-lg shadow-agri-200 scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md'}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {Object.values(CropCategory).map(cat => (
              <button 
                key={cat}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 ${selectedCategory === cat ? 'bg-agri-600 text-white shadow-lg shadow-agri-200 scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="mt-4 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm text-slate-600 pt-4 border-t border-slate-200/50">
           <div className="w-full md:w-auto flex items-center gap-3 bg-white/80 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
             <SlidersHorizontal size={16} className="text-slate-400" />
             <span className="font-medium whitespace-nowrap">Max: ₹{maxPrice}</span>
             <input 
              type="range" 
              min="10" 
              max="1000" 
              step="10" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
              className="accent-agri-600 w-full md:w-32 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
             />
           </div>
           
           <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

           <label className="flex items-center gap-2 cursor-pointer bg-amber-50/80 px-4 py-2 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors shadow-sm w-full md:w-auto">
              <input 
                type="checkbox" 
                checked={showPreOrders} 
                onChange={(e) => setShowPreOrders(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="flex items-center gap-1 font-medium text-amber-900">
                <Calendar size={16} /> Future Harvests
              </span>
           </label>

           <div className="flex-grow flex justify-end gap-2 w-full md:w-auto">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'text-agri-600 bg-agri-50 shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Grid View"
             >
               <Grid size={20} />
             </button>
             <button 
               onClick={() => setViewMode('calendar')}
               className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'calendar' ? 'text-agri-600 bg-agri-50 shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Calendar View"
             >
               <Calendar size={20} />
             </button>
           </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="animate-zoom-in">
          <CropCalendar 
            crops={filteredCrops} 
            isFarmer={false} 
            onPreBook={(crop) => onBuy(crop)} 
            harvestPlans={harvestSchedules || []}
          />
        </div>
      ) : (
        /* Grid */
        filteredCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20">
            {filteredCrops.map((crop, index) => {
              const farmer = getFarmerInfo(crop.farmerId);
              return (
                <CropCard 
                  key={crop.id} 
                  crop={crop} 
                  onContact={onContact} 
                  onBuy={() => onViewDetails ? onViewDetails(crop) : onBuy(crop)} // Prioritize detail view
                  onAddToCart={onAddToCart}
                  onViewAR={onViewAR}
                  onViewFarmTour={onViewFarmTour}
                  onViewDetails={onViewDetails}
                  isBuyer={isBuyer}
                  trustScore={farmer?.trustScore}
                  sustainabilityScore={farmer?.sustainabilityScore}
                  blockchainVerified={farmer?.blockchainVerified}
                  hasFarmTour={farmer?.hasFarmTour}
                  animationDelay={`${index * 100}ms`}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 animate-fade-in flex flex-col items-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
               <Filter className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No crops found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )
      )}
    </div>
  );
};
