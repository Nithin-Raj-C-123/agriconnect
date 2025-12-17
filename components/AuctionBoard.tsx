
import React, { useState, useEffect } from 'react';
import { MOCK_AUCTIONS } from '../services/mockStore';
import { Gavel, Timer, TrendingUp, AlertCircle } from 'lucide-react';

export const AuctionBoard: React.FC = () => {
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS);

  // Mock Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(current => current.map(a => ({...a}))); // Force re-render for timer
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const placeBid = (auctionId: string, currentBid: number) => {
    const newBid = currentBid + 5; // INR increment
    setAuctions(prev => prev.map(a => 
      a.id === auctionId ? { ...a, currentBid: newBid, highestBidder: 'Me' } : a
    ));
    alert(`Bid placed at ₹${newBid.toFixed(2)}`);
  };

  const getTimeLeft = (endTime: number) => {
    const diff = endTime - Date.now();
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gavel className="text-amber-600" /> Live Bulk Auctions
          </h2>
          <p className="text-slate-500">Bid on bulk quantities directly from farm clusters.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 bg-red-600 rounded-full"></span> LIVE NOW
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctions.map(auction => (
          <div key={auction.id} className="border-2 border-slate-100 rounded-xl p-5 hover:border-amber-200 transition-colors relative">
             <div className="absolute top-4 right-4 text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded flex items-center gap-1">
               <Timer size={12} /> {getTimeLeft(auction.endTime)} left
             </div>
             
             <h3 className="font-bold text-lg text-slate-800">{auction.cropName}</h3>
             <p className="text-sm text-slate-500 mb-4">{auction.quantityKg} kg • Base Price: ₹{auction.basePrice}</p>

             <div className="bg-slate-50 p-4 rounded-lg mb-4 flex justify-between items-center">
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Current Bid</p>
                 <p className="text-2xl font-extrabold text-green-600">₹{auction.currentBid.toFixed(2)}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-slate-500 uppercase font-bold">Highest Bidder</p>
                 <p className="font-medium text-slate-800">{auction.highestBidder || 'None'}</p>
               </div>
             </div>

             <button 
               onClick={() => placeBid(auction.id, auction.currentBid)}
               className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
             >
               <TrendingUp size={18} /> Place Bid (+ ₹5)
             </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5" />
        <p>Auction winners must complete payment within 24 hours. Failure to do so impacts your Trust Score.</p>
      </div>
    </div>
  );
};
