import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Crop, User, Role } from '../types';
import { ShieldAlert, Users, TrendingUp, Activity, AlertOctagon } from 'lucide-react';

interface AdminDashboardProps {
  crops: Crop[];
  users: User[];
}

const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ crops, users }) => {
  
  // Prepare data for charts
  const categoryData = crops.reduce((acc: any[], crop) => {
    const existing = acc.find(item => item.name === crop.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: crop.category, value: 1 });
    }
    return acc;
  }, []);

  const priceData = crops.map(crop => ({
    name: crop.name,
    price: crop.pricePerKg,
    quantity: crop.quantityKg
  })).slice(0, 10); // Top 10

  // Filter high risk users
  const riskyUsers = users.filter(u => (u.riskScore || 0) > 50);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm text-slate-500 font-medium">Total Users</h3>
             <Users size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{users.length}</p>
          <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm text-slate-500 font-medium">Active Listings</h3>
             <Activity size={20} className="text-agri-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{crops.length}</p>
          <p className="text-xs text-green-600 mt-1">↑ 5 new today</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm text-slate-500 font-medium">Flagged Items</h3>
             <ShieldAlert size={20} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">2</p>
          <p className="text-xs text-slate-400 mt-1">Requires review</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm text-slate-500 font-medium">Volume Traded</h3>
             <TrendingUp size={20} className="text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">12.5T</p>
          <p className="text-xs text-green-600 mt-1">All time</p>
        </div>
      </div>

      {/* AI Fraud Detection Panel */}
      {riskyUsers.length > 0 && (
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-4">
             <AlertOctagon /> AI Fraud Detection Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskyUsers.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-start">
                 <div>
                   <h4 className="font-bold text-slate-800">{user.name} <span className="text-xs text-slate-500">({user.role})</span></h4>
                   <p className="text-sm text-slate-500">Risk Score: <span className="text-red-600 font-bold">{user.riskScore}/100</span></p>
                   {user.flags && (
                     <div className="flex gap-1 flex-wrap mt-2">
                       {user.flags.map((flag, i) => (
                         <span key={i} className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full">{flag}</span>
                       ))}
                     </div>
                   )}
                 </div>
                 <button className="text-xs bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700">Ban User</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Crop Categories</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pricing Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Pricing Overview ($/kg)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={priceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
