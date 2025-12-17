
import React from 'react';
import { User } from '../types';
import { Users, Star, MessageCircle, MapPin, UserCheck, ShieldCheck, Ban, Flag } from 'lucide-react';

interface BuyerNetworkProps {
  currentUser: User;
  allUsers: User[];
  onOpenChat: (user: User) => void;
  onUnfollow: (farmerId: string) => void;
  onViewProfile: (farmerId: string) => void; // Could navigate to storefront
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
}

export const BuyerNetwork: React.FC<BuyerNetworkProps> = ({ currentUser, allUsers, onOpenChat, onUnfollow, onViewProfile, onBlock, onReport }) => {
  const following = allUsers.filter(u => currentUser.following?.includes(u.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-agri-600" /> My Network
          </h2>
          <p className="text-slate-500 mt-1">Farmers you follow for instant updates and direct deals.</p>
        </div>
      </div>

      {following.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
           <Users size={64} className="mx-auto text-slate-200 mb-4" />
           <h3 className="text-xl font-bold text-slate-700">You aren't following anyone yet</h3>
           <p className="text-slate-400 mt-2">Follow farmers in the marketplace to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {following.map(farmer => (
             <div key={farmer.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-4">
                      <img src={farmer.avatar} alt={farmer.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover" />
                      <div>
                        <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                           {farmer.name}
                           {farmer.blockchainVerified && (
                             <span title="Verified">
                               <ShieldCheck size={16} className="text-blue-500" />
                             </span>
                           )}
                        </h4>
                        <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                           <Star size={14} fill="currentColor" /> {farmer.trustScore}
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-1">
                     <button 
                       onClick={() => onUnfollow(farmer.id)}
                       className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                       title="Unfollow"
                     >
                       <UserCheck size={18} />
                     </button>
                     {onBlock && (
                        <button 
                          onClick={() => {
                            if(window.confirm(`Block ${farmer.name}?`)) onBlock(farmer.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          title="Block User"
                        >
                          <Ban size={18} />
                        </button>
                     )}
                     {onReport && (
                        <button 
                          onClick={() => onReport(farmer.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                          title="Report User"
                        >
                          <Flag size={18} />
                        </button>
                     )}
                   </div>
                </div>
                
                <div className="space-y-2 mb-6">
                   <p className="text-sm text-slate-600 flex items-center gap-2">
                     <MapPin size={16} className="text-slate-400" /> {farmer.location}
                   </p>
                   {farmer.sustainabilityScore && (
                     <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit font-bold">
                       Sustainability Score: {farmer.sustainabilityScore}
                     </p>
                   )}
                </div>

                <div className="flex gap-3">
                   <button 
                     onClick={() => onOpenChat(farmer)}
                     className="flex-1 bg-agri-600 text-white py-2.5 rounded-xl font-bold hover:bg-agri-700 transition-colors flex items-center justify-center gap-2"
                   >
                     <MessageCircle size={18} /> Chat
                   </button>
                   <button 
                     onClick={() => onViewProfile(farmer.id)} // In real app, route to storefront
                     className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                   >
                     View Profile
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
