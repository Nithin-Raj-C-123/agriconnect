
import React, { useState, useRef } from 'react';
import { User, BuyerRequest } from '../types';
import { VoiceInput } from './VoiceInput';
import { MapPin, Calendar, ClipboardList, Plus, Search, Tag, DollarSign, Package, CheckCircle } from 'lucide-react';

interface BuyerRequestsProps {
  currentUser: User;
  requests: BuyerRequest[];
  onRequestAdd: (request: BuyerRequest) => void;
}

export const BuyerRequests: React.FC<BuyerRequestsProps> = ({ currentUser, requests, onRequestAdd }) => {
  const [isPosting, setIsPosting] = useState(false);
  
  // Form State
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [location, setLocation] = useState(currentUser.location || '');

  // Refs for navigation
  const cropRef = useRef(null);
  const qtyRef = useRef(null);
  const priceRef = useRef(null);
  const dateRef = useRef(null);
  const locRef = useRef(null);

  const getLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }, () => alert("Location denied"));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!cropName || !quantity || !targetPrice || !requiredDate) {
      alert("Please fill all required fields");
      return;
    }

    const newRequest: BuyerRequest = {
      id: `req-${Date.now()}`,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      cropName,
      quantity: parseFloat(quantity),
      targetPrice: parseFloat(targetPrice),
      requiredDate,
      location,
      status: 'Open',
      createdAt: Date.now()
    };

    onRequestAdd(newRequest);
    setIsPosting(false);
    // Reset form
    setCropName(''); setQuantity(''); setTargetPrice(''); setRequiredDate('');
    alert("Request Posted Successfully! Farmers will be notified.");
  };

  const myRequests = requests.filter(r => r.buyerId === currentUser.id).sort((a,b) => b.createdAt - a.createdAt);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-agri-600" /> My Sourcing Requests
          </h2>
          <p className="text-slate-500 mt-1">Tell farmers what you need, and let them come to you.</p>
        </div>
        <button 
          onClick={() => setIsPosting(!isPosting)}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 ${isPosting ? 'bg-slate-100 text-slate-600' : 'bg-agri-600 text-white hover:bg-agri-700'}`}
        >
          {isPosting ? 'Cancel' : <><Plus size={20}/> Post New Request</>}
        </button>
      </div>

      {isPosting && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 mb-8 animate-in zoom-in-95">
           <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Create New Request</h3>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <VoiceInput 
                   label="Crop Needed"
                   value={cropName}
                   onChange={setCropName}
                   inputRef={cropRef}
                   onNext={() => qtyRef.current?.focus()}
                   placeholder="e.g. Red Onions"
                 />
              </div>
              <div>
                 <VoiceInput 
                   label="Quantity Needed (kg)"
                   value={quantity}
                   onChange={setQuantity}
                   type="number"
                   isQuantity
                   inputRef={qtyRef}
                   onNext={() => priceRef.current?.focus()}
                   placeholder="e.g. 500"
                 />
              </div>
              <div>
                 <VoiceInput 
                   label="Target Price (₹/kg)"
                   value={targetPrice}
                   onChange={setTargetPrice}
                   type="number"
                   isCurrency
                   inputRef={priceRef}
                   onNext={() => dateRef.current?.focus()}
                   placeholder="e.g. 25"
                 />
              </div>
              <div>
                 <VoiceInput 
                   label="Required By Date"
                   value={requiredDate}
                   onChange={setRequiredDate}
                   type="date"
                   inputRef={dateRef}
                   onNext={() => locRef.current?.focus()}
                 />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-1">Delivery Location</label>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      ref={locRef}
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-agri-500"
                      placeholder="Enter address or city"
                    />
                    <button type="button" onClick={getLiveLocation} className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200" title="Use GPS">
                       <MapPin className="text-blue-600" />
                    </button>
                 </div>
              </div>
              <div className="md:col-span-2 pt-4">
                 <button type="submit" className="w-full bg-agri-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-agri-700 transition-colors">
                    Post Request
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* List of Requests */}
      <div className="space-y-4">
         {myRequests.length === 0 && !isPosting ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
               <ClipboardList size={64} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-xl font-bold text-slate-700">No Active Requests</h3>
               <p className="text-slate-400 mt-2">Post a request to attract farmers with your specific needs.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {myRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                     <div className="absolute top-0 right-0 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-bl-lg uppercase">
                        {req.status}
                     </div>
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h4 className="text-xl font-bold text-slate-800">{req.cropName}</h4>
                           <p className="text-xs text-slate-500">Posted on {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-center min-w-[80px]">
                           <span className="block text-xs text-slate-400 font-bold uppercase">Target</span>
                           <span className="block font-extrabold text-agri-600">₹{req.targetPrice}</span>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4 bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                           <Package size={16} className="text-blue-500" /> 
                           <span className="font-bold">{req.quantity} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Calendar size={16} className="text-amber-500" /> 
                           <span>By: {new Date(req.requiredDate).toLocaleDateString()}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                           <MapPin size={16} className="text-red-500" /> 
                           <span className="truncate">{req.location}</span>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors">
                           Edit
                        </button>
                        <button className="flex-1 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100 transition-colors">
                           Close Request
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};
