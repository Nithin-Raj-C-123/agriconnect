
import React, { useState } from 'react';
import { Crop, HarvestSchedule } from '../types';
import { ChevronLeft, ChevronRight, Sprout, ShoppingCart, Calendar as CalendarIcon, Plus, Loader2, Sparkles, Scissors, Droplets } from 'lucide-react';
import { predictHarvestSchedule } from '../services/geminiService';

interface CropCalendarProps {
  crops: Crop[];
  isFarmer: boolean;
  onPreBook?: (crop: Crop) => void;
  harvestPlans?: HarvestSchedule[];
  onAddPlan?: (plan: HarvestSchedule) => void;
}

export const CropCalendar: React.FC<CropCalendarProps> = ({ crops, isFarmer, onPreBook, harvestPlans = [], onAddPlan }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // AI Harvest Planner State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanSowingDate, setNewPlanSowingDate] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Get Actual Crops listed for sale
  const getCropsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return crops.filter(c => new Date(c.harvestDate).toDateString() === dateStr);
  };

  // Get AI Predicted Harvest Plans
  const getPlansForDate = (day: number) => {
    const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return harvestPlans.filter(plan => {
      const start = new Date(plan.harvestStartDate);
      const end = new Date(plan.harvestEndDate);
      // Check if current date falls within the harvest window
      return current >= start && current <= end;
    });
  };

  // Check special dates for visual markers
  const getPlanMarkers = (day: number) => {
    const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = current.toDateString();
    
    const sowing = harvestPlans.find(p => new Date(p.sowingDate).toDateString() === dateStr);
    const cutoff = harvestPlans.find(p => new Date(p.harvestEndDate).toDateString() === dateStr);
    
    return { sowing, cutoff };
  };

  const handlePredictAndAdd = async () => {
    if (!newPlanName || !newPlanSowingDate) return;
    setIsPredicting(true);
    try {
      const result = await predictHarvestSchedule(newPlanName, newPlanSowingDate);
      if (result) {
        if (onAddPlan) {
            onAddPlan({ id: `h-${Date.now()}`, ...result });
        }
        setShowAddModal(false);
        setNewPlanName('');
        setNewPlanSowingDate('');
        alert("Harvest Plan Added! Check the calendar highlights.");
      } else {
        alert("Could not predict harvest. Please check inputs.");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to AI service.");
    } finally {
      setIsPredicting(false);
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[80px] bg-slate-50/50 border border-slate-100"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCrops = getCropsForDate(day);
      const dayPlans = getPlansForDate(day);
      const { sowing, cutoff } = getPlanMarkers(day);
      const isSelected = selectedDate?.getDate() === day;
      const hasActivity = dayCrops.length > 0 || dayPlans.length > 0 || sowing || cutoff;
      
      // Determine background color based on activity type
      let bgColor = 'bg-white';
      if (dayPlans.length > 0) bgColor = 'bg-amber-50'; // Harvest window
      if (sowing) bgColor = 'bg-blue-50'; // Sowing date
      if (cutoff) bgColor = 'bg-red-50'; // Cutoff date
      if (isSelected) bgColor = 'bg-agri-100 ring-2 ring-agri-500 z-10';

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`min-h-[80px] border border-slate-100 p-2 cursor-pointer transition-all hover:shadow-md relative group ${bgColor}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold ${hasActivity ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
            <div className="flex gap-1">
              {sowing && <span title="Sowing Date"><Droplets size={12} className="text-blue-500" /></span>}
              {cutoff && <span title="Harvest Cutoff"><Scissors size={12} className="text-red-500" /></span>}
            </div>
          </div>
          
          <div className="mt-1 flex flex-col gap-1">
            {dayCrops.slice(0, 2).map((crop, idx) => (
              <div key={`c-${idx}`} className="h-1.5 w-full rounded-full bg-agri-500" title={`Listing: ${crop.name}`}></div>
            ))}
            {dayPlans.map((plan, idx) => (
              <div key={`p-${idx}`} className="h-1.5 w-full rounded-full bg-amber-400 opacity-80" title={`Harvest Window: ${plan.cropName}`}></div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <CalendarIcon className="text-agri-600" /> {isFarmer ? 'Harvest Schedule' : 'Crop Availability'}
        </h2>
        
        <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full shadow-sm transition-all"><ChevronLeft size={16}/></button>
          <span className="font-bold text-slate-700 w-32 text-center text-sm">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full shadow-sm transition-all"><ChevronRight size={16}/></button>
        </div>
        
        {isFarmer && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-agri-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-agri-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Plus size={16} /> Add Harvest Plan
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Calendar Grid */}
        <div className="flex-1 lg:border-r border-slate-100 p-4">
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-3 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500 justify-center">
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-agri-500 rounded-full"></div> Active Listing</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded-full"></div> Harvest Window</div>
             <div className="flex items-center gap-1"><Droplets size={12} className="text-blue-500"/> Sowing Date</div>
             <div className="flex items-center gap-1"><Scissors size={12} className="text-red-500"/> Cutoff Date</div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:w-80 bg-slate-50 p-6 overflow-y-auto border-t lg:border-t-0 border-slate-100">
           <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-200 pb-2">
             {selectedDate 
               ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'}) 
               : "Select a date"}
           </h3>
           
           {selectedDate ? (
             <div className="space-y-4">
                {/* Active Listings */}
                {getCropsForDate(selectedDate.getDate()).map(crop => (
                    <div key={crop.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex items-center gap-3 mb-2">
                         <img src={crop.images[0]} className="w-12 h-12 rounded-lg object-cover" alt={crop.name} />
                         <div>
                           <h4 className="font-bold text-slate-800 text-sm">{crop.name}</h4>
                           <p className="text-xs text-slate-500">{crop.quantityKg} kg available</p>
                         </div>
                       </div>
                       {!isFarmer && onPreBook && (
                         <button 
                           onClick={() => onPreBook(crop)}
                           className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                         >
                           <ShoppingCart size={14} /> Pre-book
                         </button>
                       )}
                       {isFarmer && (
                         <div className="text-xs text-center text-green-700 font-bold bg-green-50 py-1 rounded-lg border border-green-100">
                           Listed for Sale
                         </div>
                       )}
                    </div>
                  ))}

                {/* AI Planned Harvests */}
                {getPlanMarkers(selectedDate.getDate()).sowing && (
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900 text-sm font-bold flex items-center gap-2">
                     <Droplets className="text-blue-500" size={16} />
                     Sowing Day for {getPlanMarkers(selectedDate.getDate()).sowing?.cropName}
                   </div>
                )}
                
                {getPlanMarkers(selectedDate.getDate()).cutoff && (
                   <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-red-900 text-sm font-bold flex items-center gap-2">
                     <Scissors className="text-red-500" size={16} />
                     Harvest Cutoff for {getPlanMarkers(selectedDate.getDate()).cutoff?.cropName}
                   </div>
                )}

                {getPlansForDate(selectedDate.getDate()).map(plan => (
                  <div key={plan.id} className="bg-white p-4 rounded-xl border-l-4 border-amber-400 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                       {!isFarmer ? 'EXPECTED' : 'AI PLAN'}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-amber-500"/>
                      <h4 className="font-bold text-slate-800">{plan.cropName}</h4>
                    </div>
                    
                    {/* Timeline Notes */}
                    <div className="bg-amber-50 p-3 rounded-lg text-xs text-slate-700 italic mb-3 border border-amber-100">
                      "{plan.notes}"
                    </div>

                    <div className="space-y-2 text-xs">
                      {isFarmer && (
                        <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                           <span className="text-slate-500">Sowing</span>
                           <span className="font-mono text-slate-700">{new Date(plan.sowingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                         <span className="text-slate-500">Harvest Start</span>
                         <span className="font-mono text-slate-700">{new Date(plan.harvestStartDate).toLocaleDateString()}</span>
                      </div>
                       <div className="flex justify-between items-center">
                         <span className="text-slate-500 font-bold">Cutoff</span>
                         <span className="font-mono text-red-600 font-bold">{new Date(plan.harvestEndDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!hasActivity(selectedDate.getDate()) && (
                  <div className="text-center py-12 px-4 opacity-50">
                    <CalendarIcon className="mx-auto mb-2 text-slate-400" size={32} />
                    <p className="text-sm text-slate-500">No scheduled activities.</p>
                  </div>
                )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
               <div className="bg-slate-100 p-4 rounded-full mb-3">
                 <CalendarIcon size={32} className="text-slate-300" />
               </div>
               <p className="font-medium text-slate-600">Select a Date</p>
               <p className="text-sm">Click any date on the grid to view detailed harvest plans.</p>
             </div>
           )}
        </div>
      </div>

      {/* Add Plan Modal (Only for Farmer) */}
      {showAddModal && isFarmer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
           <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-100">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-agri-50 rounded-full mb-4">
                  <Sparkles className="text-agri-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">AI Harvest Planner</h3>
                <p className="text-slate-500 mt-2">Enter crop details, and our AI will calculate the optimal harvest window and cutoff times.</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Crop Name</label>
                  <input 
                    type="text" 
                    value={newPlanName} 
                    onChange={e => setNewPlanName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-4 focus:ring-agri-100 focus:border-agri-500 outline-none transition-all"
                    placeholder="e.g. Carrot"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Sowing Date</label>
                  <input 
                    type="date" 
                    value={newPlanSowingDate} 
                    onChange={e => setNewPlanSowingDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-4 focus:ring-agri-100 focus:border-agri-500 outline-none transition-all"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                   <button 
                     onClick={() => setShowAddModal(false)}
                     className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handlePredictAndAdd}
                     disabled={isPredicting || !newPlanName || !newPlanSowingDate}
                     className="flex-1 py-3 bg-agri-600 text-white font-bold rounded-xl text-sm hover:bg-agri-700 flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                   >
                     {isPredicting ? <Loader2 className="animate-spin" size={18}/> : 'Analyze & Add Plan'}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  // Helper to check for activity in render to clean up code
  function hasActivity(day: number) {
     const dayCrops = getCropsForDate(day);
     const dayPlans = getPlansForDate(day);
     const { sowing, cutoff } = getPlanMarkers(day);
     return dayCrops.length > 0 || dayPlans.length > 0 || sowing || cutoff;
  }
};
