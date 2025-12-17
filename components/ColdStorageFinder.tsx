
import React, { useState } from 'react';
import { STORAGE_FACILITIES } from '../services/mockStore';
import { Warehouse, MapPin, Thermometer, Calendar } from 'lucide-react';

export const ColdStorageFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFacilities = STORAGE_FACILITIES.filter(f => 
    f.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2 mb-4">
        <Warehouse className="text-blue-600" /> Cold Storage & Warehousing
      </h3>

      <div className="relative mb-6">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search location or facility name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacilities.map(facility => (
          <div key={facility.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-800">{facility.name}</h4>
              <span className={`px-2 py-1 rounded text-xs font-bold ${facility.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {facility.available ? 'Available' : 'Full'}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-slate-600 mb-4">
              <p className="flex items-center gap-2"><MapPin size={14}/> {facility.location}</p>
              <p className="flex items-center gap-2"><Thermometer size={14}/> Temp: {facility.temperature}</p>
              <p className="flex items-center gap-2"><Warehouse size={14}/> Capacity: {facility.capacityKg} kg</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
               <div>
                 <span className="font-bold text-lg text-blue-600">₹{facility.pricePerDay}</span>
                 <span className="text-xs text-slate-400"> / 100kg / day</span>
               </div>
               <button 
                 disabled={!facility.available}
                 className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
               >
                 <Calendar size={14} /> Book Slot
               </button>
            </div>
          </div>
        ))}
        {filteredFacilities.length === 0 && (
          <p className="col-span-2 text-center text-slate-400 py-4">No facilities found in this area.</p>
        )}
      </div>
    </div>
  );
};
