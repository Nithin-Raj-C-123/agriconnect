
import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { MarketRate } from '../types';

interface MarketRatesProps {
  rates: MarketRate[];
}

export const MarketRates: React.FC<MarketRatesProps> = ({ rates }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-hidden">
      <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2 mb-4">
        <TrendingUp className="text-emerald-600" /> Daily Mandi / Market Rates
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Crop</th>
              <th className="px-4 py-3">Mandi Price</th>
              <th className="px-4 py-3">Market Avg</th>
              <th className="px-4 py-3 text-center rounded-r-lg">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No market rates available today.
                </td>
              </tr>
            ) : (
              rates.map((rate, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{rate.cropName}</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">₹{rate.mandiPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">₹{rate.marketAverage.toFixed(2)}</td>
                  <td className="px-4 py-3 flex justify-center">
                    {rate.trend === 'Up' && <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><ArrowUp size={12}/> Up</span>}
                    {rate.trend === 'Down' && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full"><ArrowDown size={12}/> Down</span>}
                    {rate.trend === 'Stable' && <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full"><Minus size={12}/> Stable</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">Data sourced from local government APIs and private aggregators.</p>
    </div>
  );
};
