
import React from 'react';
import { LOAN_OFFERS } from '../services/mockStore';
import { User } from '../types';
import { CreditCard, CheckCircle, Lock, ExternalLink } from 'lucide-react';

interface LoanEligibilityProps {
  user: User;
}

export const LoanEligibility: React.FC<LoanEligibilityProps> = ({ user }) => {
  const score = user.creditScore || 650;
  const scoreColor = score > 750 ? 'text-green-600' : score > 650 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Farmer Credit & Loans</h2>
        <p className="text-slate-500 mb-6">Based on your sales history and platform activity.</p>

        <div className="flex items-center gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
           <div className="text-center">
             <p className="text-sm font-bold text-slate-500 uppercase">Estimated Credit Score</p>
             <p className={`text-5xl font-extrabold ${scoreColor} mt-2`}>{score}</p>
             <p className="text-xs text-slate-400 mt-1">Updated today</p>
           </div>
           <div className="flex-1 border-l border-slate-200 pl-8">
              <h3 className="font-bold text-slate-700 mb-2">Why is this important?</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Lower interest rates on equipment</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Instant approval for seed funding</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Trust badge for buyers</li>
              </ul>
           </div>
        </div>

        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-blue-600"/> Pre-Qualified Offers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LOAN_OFFERS.map(offer => (
            <div key={offer.id} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all relative overflow-hidden">
               {offer.probability === 'High' && (
                 <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                   98% Approval Chance
                 </div>
               )}
               <h4 className="font-bold text-lg text-slate-800">{offer.type}</h4>
               <p className="text-slate-500 text-sm">{offer.provider}</p>
               
               <div className="my-4 space-y-1">
                 <div className="flex justify-between">
                   <span className="text-slate-600 text-sm">Amount</span>
                   <span className="font-bold text-slate-900">₹{offer.amount.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-600 text-sm">Interest</span>
                   <span className="font-bold text-green-600">{offer.interestRate}% / yr</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-600 text-sm">Tenure</span>
                   <span className="font-bold text-slate-900">{offer.tenureMonths} months</span>
                 </div>
               </div>

               <button 
                 onClick={() => window.open(offer.link, '_blank')}
                 className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
               >
                 <ExternalLink size={14} /> Apply Securely
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
