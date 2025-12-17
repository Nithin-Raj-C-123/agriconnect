
import React from 'react';
import { Order } from '../types';
import { Package, Truck, CheckCircle, Clock, ShoppingBag } from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  buyerId: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, buyerId }) => {
  const myOrders = orders.filter(o => o.buyerId === buyerId).sort((a, b) => b.date - a.date);

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Packed': return 2;
      case 'Shipped': return 2;
      case 'On Route': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <ShoppingBag className="text-agri-600" /> My Orders & Tracking
      </h2>

      <div className="space-y-6">
        {myOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
             <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
             <p className="text-slate-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                   <span className="text-xs text-slate-500 uppercase font-bold">Order ID</span>
                   <p className="text-sm font-bold text-slate-800">#{order.id.slice(-6)}</p>
                 </div>
                 <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Date</span>
                    <p className="text-sm text-slate-800">{new Date(order.date).toLocaleDateString()}</p>
                 </div>
                 <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Total</span>
                    <p className="text-sm font-bold text-agri-700">₹{order.totalAmount.toFixed(2)}</p>
                 </div>
              </div>

              <div className="p-6">
                {/* Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                       <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-slate-100" />
                       <div className="flex-1">
                         <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                         <p className="text-xs text-slate-500">Qty: {item.quantity} (mock) x 10kg</p>
                       </div>
                       <p className="text-sm font-bold text-slate-600">₹{item.price}</p>
                    </div>
                  ))}
                </div>

                {/* Tracking Stepper */}
                <div className="relative mt-8">
                   <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                   <div 
                     className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000"
                     style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}
                   ></div>

                   <div className="relative z-10 flex justify-between">
                      {['Pending', 'Confirmed', 'Packed', 'On Route', 'Delivered'].map((step, idx) => {
                         const currentStep = getStatusStep(order.status);
                         const isCompleted = idx <= currentStep;
                         
                         return (
                           <div key={step} className="flex flex-col items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                                 {idx === 0 && <Clock size={14} />}
                                 {idx === 1 && <CheckCircle size={14} />}
                                 {idx === 2 && <Package size={14} />}
                                 {idx === 3 && <Truck size={14} />}
                                 {idx === 4 && <CheckCircle size={14} />}
                              </div>
                              <span className={`text-[10px] font-bold ${isCompleted ? 'text-green-600' : 'text-slate-400'}`}>{step}</span>
                           </div>
                         )
                      })}
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
