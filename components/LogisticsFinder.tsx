
import React, { useState } from 'react';
import { Truck, MapPin, Search } from 'lucide-react';
import { LOGISTICS_OPTIONS } from '../services/mockStore';

export const LogisticsFinder: React.FC = () => {
  const [distance, setDistance] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2 mb-4">
        <Truck className="text-blue-600" /> Logistics Partner Matching
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Estimated Distance (km)</label>
          <div className="relative">
             <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="number" 
               value={distance}
               onChange={(e) => setDistance(parseFloat(e.target.value))}
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder="e.g., 50"
             />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Load Weight (kg)</label>
          <div className="relative">
             <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="number" 
               value={weight}
               onChange={(e) => setWeight(parseFloat(e.target.value))}
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder="e.g., 1000"
             />
          </div>
        </div>
        <div className="flex items-end">
          <button 
            onClick={() => setShowResults(true)}
            disabled={!distance || !weight}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} /> Find Partners
          </button>
        </div>
      </div>

      {showResults && distance && weight && (
        <div className="space-y-3 animate-in fade-in">
          {LOGISTICS_OPTIONS.filter(opt => opt.capacityKg >= (weight as number)).map(opt => (
            <div key={opt.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                   {opt.type[0]}
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">{opt.providerName}</h4>
                   <p className="text-xs text-slate-500">{opt.type} • {opt.estimatedTime}</p>
                 </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-slate-800">
                  ₹{(opt.pricePerKm * (distance as number)).toFixed(2)}
                </p>
                <button className="text-xs text-blue-600 font-bold hover:underline">Book Now</button>
              </div>
            </div>
          ))}
          {LOGISTICS_OPTIONS.filter(opt => opt.capacityKg >= (weight as number)).length === 0 && (
             <p className="text-center text-slate-400 text-sm py-4">No vehicles available for this weight capacity.</p>
          )}
        </div>
      )}
    </div>
  );
};
