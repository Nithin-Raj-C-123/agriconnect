
import React, { useState } from 'react';
import { User, Crop, Order, Role, MarketRate } from '../types';
import { Printer, Users, ShoppingBag, Sprout, LogOut, Search, FileText, Key, Mail, Phone, MapPin, CreditCard, TrendingUp, Plus, Trash2, ChevronDown, ChevronUp, Clock, CheckCircle, Package, Truck, Edit } from 'lucide-react';

interface OwnerDashboardProps {
  users: User[];
  crops: Crop[];
  orders: Order[];
  marketRates: MarketRate[];
  onLogout: () => void;
  onLoginAs: (user: User) => void;
  onUpdateRates: (rates: MarketRate[]) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ users, crops, orders, marketRates, onLogout, onLoginAs, onUpdateRates }) => {
  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers' | 'mandi'>('farmers');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // State for adding new rate
  const [newRate, setNewRate] = useState({
    cropName: '',
    mandiPrice: '',
    marketAverage: '',
    trend: 'Stable'
  });

  const farmers = users.filter(u => u.role === Role.FARMER);
  const buyers = users.filter(u => u.role === Role.BUYER);

  const handlePrint = () => {
    window.print();
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRate.cropName && newRate.mandiPrice && newRate.marketAverage) {
        const rate: MarketRate = {
            cropName: newRate.cropName,
            mandiPrice: parseFloat(newRate.mandiPrice),
            marketAverage: parseFloat(newRate.marketAverage),
            minPrice: parseFloat(newRate.mandiPrice) * 0.9,
            maxPrice: parseFloat(newRate.mandiPrice) * 1.1,
            trend: newRate.trend as 'Up' | 'Down' | 'Stable'
        };
        // Update global rates
        onUpdateRates([rate, ...marketRates]);
        setNewRate({ cropName: '', mandiPrice: '', marketAverage: '', trend: 'Stable' });
        alert("Market Rate Updated!");
    }
  };

  const renderFarmersTable = () => (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-sm text-left text-slate-500 print:text-black">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 print:bg-white print:border-b-2 print:border-black">
          <tr>
            <th className="px-6 py-3">Farmer Details</th>
            <th className="px-6 py-3">Contact</th>
            <th className="px-6 py-3">Farm Stats</th>
            <th className="px-6 py-3 print:hidden">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 print:divide-black">
          {farmers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(farmer => {
            const farmerCrops = crops.filter(c => c.farmerId === farmer.id);
            const farmerOrders = orders.filter(o => o.farmerId === farmer.id);
            const isExpanded = expandedRow === farmer.id;

            return (
            <React.Fragment key={farmer.id}>
            <tr className={`bg-white border-b hover:bg-slate-50 print:break-inside-avoid ${isExpanded ? 'bg-slate-50' : ''}`}>
              <td className="px-6 py-4 align-top">
                 <div className="flex items-center gap-3">
                    <img src={farmer.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 print:hidden" />
                    <div>
                       <div className="font-bold text-slate-900 text-base">{farmer.name}</div>
                       <div className="text-xs font-mono text-slate-400 print:text-slate-600">ID: {farmer.id}</div>
                       <div className="text-xs text-green-600 font-bold mt-1">Verified: {farmer.kycStatus || 'Pending'}</div>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-4 align-top">
                 <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><Phone size={12}/> {farmer.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={12}/> {farmer.email}</div>
                    <div className="flex items-center gap-2"><MapPin size={12}/> {farmer.location}</div>
                    <div className="flex items-center gap-2 font-mono"><FileText size={12}/> Aadhar: {farmer.aadharNumber}</div>
                 </div>
              </td>
              <td className="px-6 py-4 align-top">
                 <div className="space-y-1 text-xs">
                    <div>Active Listings: <span className="font-bold">{farmerCrops.length}</span></div>
                    <div>Orders Received: <span className="font-bold">{farmerOrders.length}</span></div>
                    <div>Wallet: <span className="font-bold text-green-600">₹{farmer.walletBalance?.toLocaleString()}</span></div>
                 </div>
              </td>
              <td className="px-6 py-4 print:hidden">
                 <button 
                   onClick={() => setExpandedRow(isExpanded ? null : farmer.id)}
                   className="text-slate-500 hover:text-agri-600 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-full hover:bg-white"
                 >
                   {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {isExpanded ? 'Hide Details' : 'View Full Details'}
                 </button>
              </td>
            </tr>
            {/* Expanded Content: Login Logs, Crops, Orders */}
            <tr className={`bg-slate-50 print:bg-white print:table-row ${isExpanded ? 'table-row' : 'hidden'}`}>
                <td colSpan={4} className="p-0">
                    <div className="p-6 border-b border-slate-200 space-y-6">
                        
                        {/* Login Logs */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2 border-b pb-1"><Key size={14}/> Login Activity Log</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {farmer.securityLogs?.map((log, i) => (
                                    <div key={i} className="text-xs bg-white p-2 rounded border border-slate-100 text-slate-600">
                                        <div className="font-bold">{new Date(log.timestamp).toLocaleString()}</div>
                                        <div>{log.device} • {log.ip}</div>
                                        <div>{log.location}</div>
                                    </div>
                                ))}
                                {(!farmer.securityLogs || farmer.securityLogs.length === 0) && <p className="text-xs text-slate-400 italic">No login logs available.</p>}
                            </div>
                        </div>

                        {/* Crop Details */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2 border-b pb-1"><Sprout size={14}/> Crop Listings Details</h4>
                            <table className="w-full text-xs text-left border border-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-2 border-r">Crop Name</th>
                                        <th className="p-2 border-r">Details</th>
                                        <th className="p-2 border-r">Quantity/Price</th>
                                        <th className="p-2">Timestamps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {farmerCrops.map(c => (
                                        <tr key={c.id} className="border-t bg-white">
                                            <td className="p-2 border-r font-medium">{c.name} <span className="text-[10px] text-slate-400 block">{c.category}</span></td>
                                            <td className="p-2 border-r">{c.description.substring(0, 50)}...</td>
                                            <td className="p-2 border-r font-mono">{c.quantityKg}kg @ ₹{c.pricePerKg}</td>
                                            <td className="p-2">
                                                Posted: {new Date(c.createdAt).toLocaleDateString()}<br/>
                                                Harvest: {new Date(c.harvestDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {farmerCrops.length === 0 && <tr><td colSpan={4} className="p-2 text-center text-slate-400">No crops listed.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {/* Orders Received */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2 border-b pb-1"><ShoppingBag size={14}/> Orders Received & Fulfillment</h4>
                            <table className="w-full text-xs text-left border border-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-2 border-r">Order ID</th>
                                        <th className="p-2 border-r">Buyer</th>
                                        <th className="p-2 border-r">Items</th>
                                        <th className="p-2 border-r">Amount</th>
                                        <th className="p-2">Status Timeline (Time & Date)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {farmerOrders.map(o => (
                                        <tr key={o.id} className="border-t bg-white">
                                            <td className="p-2 border-r font-mono">#{o.id.slice(-6)}</td>
                                            <td className="p-2 border-r">{o.buyerName}</td>
                                            <td className="p-2 border-r">{o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                                            <td className="p-2 border-r font-bold">₹{o.totalAmount}</td>
                                            <td className="p-2">
                                                <div className="space-y-1">
                                                    {o.trackingUpdates.map((u, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            {u.status === 'Confirmed' && <CheckCircle size={10} className="text-blue-500"/>}
                                                            {u.status === 'Packed' && <Package size={10} className="text-amber-500"/>}
                                                            {u.status === 'On Route' && <Truck size={10} className="text-indigo-500"/>}
                                                            {u.status === 'Delivered' && <CheckCircle size={10} className="text-green-500"/>}
                                                            <span className="font-bold w-24">{u.status}:</span>
                                                            <span className="text-slate-600">{new Date(u.timestamp).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {farmerOrders.length === 0 && <tr><td colSpan={5} className="p-2 text-center text-slate-400">No orders received.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
            </React.Fragment>
          )})}
        </tbody>
      </table>
    </div>
  );

  const renderBuyersTable = () => (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-sm text-left text-slate-500 print:text-black">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 print:bg-white print:border-b-2 print:border-black">
          <tr>
            <th className="px-6 py-3">Buyer Details</th>
            <th className="px-6 py-3">Contact</th>
            <th className="px-6 py-3">Purchase Stats</th>
            <th className="px-6 py-3 print:hidden">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 print:divide-black">
          {buyers.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map(buyer => {
            const buyerOrders = orders.filter(o => o.buyerId === buyer.id);
            const isExpanded = expandedRow === buyer.id;

            return (
            <React.Fragment key={buyer.id}>
            <tr className={`bg-white border-b hover:bg-slate-50 print:break-inside-avoid ${isExpanded ? 'bg-slate-50' : ''}`}>
              <td className="px-6 py-4 align-top">
                 <div className="flex items-center gap-3">
                    <img src={buyer.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 print:hidden" />
                    <div>
                       <div className="font-bold text-slate-900 text-base">{buyer.name}</div>
                       <div className="text-xs font-mono text-slate-400 print:text-slate-600">ID: {buyer.id}</div>
                       <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">{buyer.buyerType}</span>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-4 align-top">
                 <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><Phone size={12}/> {buyer.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={12}/> {buyer.email}</div>
                    <div className="flex items-center gap-2"><MapPin size={12}/> {buyer.location}</div>
                    <div className="flex items-center gap-2 font-mono"><FileText size={12}/> Aadhar: {buyer.aadharNumber}</div>
                 </div>
              </td>
              <td className="px-6 py-4 align-top">
                 <div className="space-y-1 text-xs">
                    <div>Total Orders: <span className="font-bold">{buyerOrders.length}</span></div>
                    <div>Total Spent: <span className="font-bold text-green-600">₹{buyerOrders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}</span></div>
                 </div>
              </td>
              <td className="px-6 py-4 print:hidden">
                 <button 
                   onClick={() => setExpandedRow(isExpanded ? null : buyer.id)}
                   className="text-slate-500 hover:text-agri-600 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-full hover:bg-white"
                 >
                   {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {isExpanded ? 'Hide Details' : 'View Full Details'}
                 </button>
              </td>
            </tr>
            {/* Expanded Content: Login Logs, Full Orders */}
            <tr className={`bg-slate-50 print:bg-white print:table-row ${isExpanded ? 'table-row' : 'hidden'}`}>
                <td colSpan={4} className="p-0">
                    <div className="p-6 border-b border-slate-200 space-y-6">
                        
                        {/* Login Logs */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2 border-b pb-1"><Key size={14}/> Login Activity Log</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {buyer.securityLogs?.map((log, i) => (
                                    <div key={i} className="text-xs bg-white p-2 rounded border border-slate-100 text-slate-600">
                                        <div className="font-bold">{new Date(log.timestamp).toLocaleString()}</div>
                                        <div>{log.device} • {log.ip}</div>
                                        <div>{log.location}</div>
                                    </div>
                                ))}
                                {(!buyer.securityLogs || buyer.securityLogs.length === 0) && <p className="text-xs text-slate-400 italic">No login logs available.</p>}
                            </div>
                        </div>

                        {/* Order History Detailed */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2 border-b pb-1"><ShoppingBag size={14}/> Complete Order History & Tracking</h4>
                            <table className="w-full text-xs text-left border border-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-2 border-r">Order ID</th>
                                        <th className="p-2 border-r">Farmer</th>
                                        <th className="p-2 border-r">Items</th>
                                        <th className="p-2 border-r">Amount</th>
                                        <th className="p-2">Status Timeline (Time & Date)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buyerOrders.map(o => (
                                        <tr key={o.id} className="border-t bg-white">
                                            <td className="p-2 border-r font-mono">#{o.id.slice(-6)}</td>
                                            <td className="p-2 border-r">{users.find(u => u.id === o.farmerId)?.name || 'Unknown'}</td>
                                            <td className="p-2 border-r">{o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                                            <td className="p-2 border-r font-bold">₹{o.totalAmount}</td>
                                            <td className="p-2">
                                                <div className="space-y-1">
                                                    {o.trackingUpdates.map((u, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            {u.status === 'Confirmed' && <CheckCircle size={10} className="text-blue-500"/>}
                                                            {u.status === 'Packed' && <Package size={10} className="text-amber-500"/>}
                                                            {u.status === 'On Route' && <Truck size={10} className="text-indigo-500"/>}
                                                            {u.status === 'Delivered' && <CheckCircle size={10} className="text-green-500"/>}
                                                            <span className="font-bold w-24">{u.status}:</span>
                                                            <span className="text-slate-600">{new Date(u.timestamp).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {buyerOrders.length === 0 && <tr><td colSpan={5} className="p-2 text-center text-slate-400">No orders placed.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
            </React.Fragment>
          )})}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @media print {
          header, button, .print-hide { display: none !important; }
          .print-show { display: block !important; }
          body { background: white; font-size: 10px; }
          .bg-slate-50 { background: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 4px; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50 print-hide">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
              <Key size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Owner Dashboard</h1>
              <p className="text-xs text-slate-400">Administrator Access</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handlePrint} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
              <Printer size={18} /> Print Report
            </button>
            <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold shadow-lg">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6 print:p-0 print:max-w-none">
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 print:hidden">
            <div className="flex bg-slate-200/50 rounded-lg p-1 overflow-x-auto">
              <button onClick={() => setActiveTab('farmers')} className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === 'farmers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Detailed Farmer Reports</button>
              <button onClick={() => setActiveTab('buyers')} className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === 'buyers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Detailed Buyer Reports</button>
              <button onClick={() => setActiveTab('mandi')} className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === 'mandi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Mandi Rates</button>
            </div>
            
            {activeTab !== 'mandi' && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 transition-all shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Printable Content */}
          <div className="p-0">
            {activeTab === 'farmers' && (
                <div>
                    <h2 className="hidden print:block text-2xl font-bold mb-4 p-4 border-b">Full Farmer Detail Report</h2>
                    {renderFarmersTable()}
                </div>
            )}
            {activeTab === 'buyers' && (
                <div>
                    <h2 className="hidden print:block text-2xl font-bold mb-4 p-4 border-b">Full Buyer Detail Report</h2>
                    {renderBuyersTable()}
                </div>
            )}
            {activeTab === 'mandi' && (
                <div className="p-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 print:hidden">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Edit size={18} className="text-agri-600"/> Update Daily Market Rates</h3>
                        <form onSubmit={handleAddRate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Crop Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Potato" 
                                    value={newRate.cropName}
                                    onChange={e => setNewRate({...newRate, cropName: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mandi Price (₹)</label>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={newRate.mandiPrice}
                                    onChange={e => setNewRate({...newRate, mandiPrice: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Market Avg (₹)</label>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={newRate.marketAverage}
                                    onChange={e => setNewRate({...newRate, marketAverage: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trend</label>
                                <select 
                                    value={newRate.trend}
                                    onChange={e => setNewRate({...newRate, trend: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="Stable">Stable</option>
                                    <option value="Up">Up</option>
                                    <option value="Down">Down</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
                                Update Rate
                            </button>
                        </form>
                    </div>

                    <h3 className="font-bold text-lg mb-4 hidden print:block">Current Market Rates</h3>
                    <div className="overflow-x-auto border rounded-xl border-slate-200">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="bg-slate-50 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-3">Crop</th>
                                    <th className="p-3">Mandi Price</th>
                                    <th className="p-3">Market Avg</th>
                                    <th className="p-3">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketRates.map((r, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3 font-bold">{r.cropName}</td>
                                        <td className="p-3 font-mono text-green-600">₹{r.mandiPrice}</td>
                                        <td className="p-3">₹{r.marketAverage}</td>
                                        <td className="p-3">{r.trend}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
