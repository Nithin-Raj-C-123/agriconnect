
import React, { useState } from 'react';
import { Map, Truck, Navigation, Clock } from 'lucide-react';
import { DeliveryRoute } from '../types';

export const RouteOptimizer: React.FC = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);

  const calculateRoute = () => {
    setIsCalculating(true);
    // Mock Calculation
    setTimeout(() => {
      setRoute({
        id: 'r1',
        totalDistance: 145,
        totalCost: 3200, // Adjusted for INR
        stops: [
          { location: 'Warehouse Hub A', action: 'Pickup', time: '08:00 AM' },
          { location: 'Farm Cluster B (Ramesh)', action: 'Pickup', time: '09:30 AM' },
          { location: 'Farm Cluster C (Sarah)', action: 'Pickup', time: '11:15 AM' },
          { location: 'City Market (Buyer)', action: 'Drop', time: '02:00 PM' }
        ]
      });
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
           <Truck className="text-agri-600" /> Smart Delivery Route Optimization
        </h3>
        <button 
          onClick={calculateRoute}
          disabled={isCalculating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isCalculating ? 'Optimizing...' : 'Optimize Route'} <Navigation size={16} />
        </button>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center border border-slate-200 border-dashed">
        {!route ? (
          <div className="text-center text-slate-400">
            <Map className="mx-auto mb-2 opacity-50" size={32} />
            <p>Select orders to generate optimized path.</p>
          </div>
        ) : (
          <div className="w-full">
             <div className="flex justify-between text-sm font-bold text-slate-700 mb-4 bg-white p-3 rounded-lg shadow-sm">
                <span>Total Dist: {route.totalDistance} km</span>
                <span>Est Cost: ₹{route.totalCost}</span>
             </div>
             
             <div className="relative border-l-2 border-blue-300 ml-4 space-y-6 pl-6 py-2">
                {route.stops.map((stop, idx) => (
                  <div key={idx} className="relative">
                     <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${stop.action === 'Pickup' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-bold text-slate-800">{stop.location}</p>
                         <span className={`text-[10px] px-2 py-0.5 rounded text-white ${stop.action === 'Pickup' ? 'bg-blue-500' : 'bg-green-500'}`}>
                           {stop.action}
                         </span>
                       </div>
                       <div className="flex items-center gap-1 text-slate-500 text-xs">
                         <Clock size={12} /> {stop.time}
                       </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
