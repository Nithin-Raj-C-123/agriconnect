
import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, CreditCard, Banknote, CheckSquare, Upload, Lock, CheckCircle } from 'lucide-react';
import { Crop, PaymentMethod } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Crop[];
  onRemove: (id: string) => void;
  onCheckout: (method: PaymentMethod, total: number) => void;
}

type CheckoutStep = 'cart' | 'payment' | 'pin' | 'check-details' | 'success';

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onCheckout }) => {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | ''>('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [checkDetails, setCheckDetails] = useState({ id: '', signature: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.pricePerKg * 10), 0); // Mock 10kg

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setError('');
    if (method === 'Cash on Delivery') {
      processSuccess();
    } else if (method === 'Check Deposit') {
      setStep('check-details');
    } else {
      setStep('pin');
    }
  };

  const verifyPin = () => {
    if (pin.join('') === '123456') {
      processSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  };

  const verifyCheckDetails = () => {
    if (checkDetails.id && checkDetails.signature) {
      processSuccess();
    } else {
      setError('Please provide Check ID and upload Signature.');
    }
  };

  const processSuccess = () => {
    setStep('success');
    setTimeout(() => {
      onCheckout(selectedPayment as PaymentMethod, total);
      // Reset state after closing happens in parent
      setTimeout(() => {
        setStep('cart');
        setPin(['', '', '', '', '', '']);
        setSelectedPayment('');
      }, 500); 
    }, 3000);
  };

  const handleClose = () => {
    setStep('cart');
    onClose();
  };

  const renderCart = () => (
    <>
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p>Your cart is empty.</p>
              <button onClick={handleClose} className="mt-4 text-agri-600 font-medium hover:underline">Continue Browsing</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.farmerName}</p>
                  <p className="text-sm font-bold text-agri-600 mt-1">₹{item.pricePerKg}/kg</p>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
             <div className="flex justify-between items-center mb-4">
               <span className="text-slate-600">Total (Est. 10kg/item):</span>
               <span className="text-xl font-bold text-slate-900">₹{total.toFixed(2)}</span>
             </div>
             <button 
               onClick={() => setStep('payment')}
               className="w-full bg-agri-600 text-white py-3 rounded-xl font-bold hover:bg-agri-700 transition-colors shadow-lg shadow-agri-200"
             >
               Proceed to Pay
             </button>
          </div>
        )}
    </>
  );

  const renderPaymentSelection = () => (
    <div className="p-4 flex-1 flex flex-col">
       <h3 className="font-bold text-slate-800 mb-4">Select Payment Method</h3>
       <div className="space-y-3">
         {['Google Pay', 'PhonePe', 'Paytm'].map(method => (
           <button key={method} onClick={() => handlePaymentSelect(method as PaymentMethod)} className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">{method[0]}</div>
               <span className="font-medium text-slate-800">{method}</span>
             </div>
             <CreditCard size={18} className="text-slate-400" />
           </button>
         ))}
         
         <button onClick={() => handlePaymentSelect('Check Deposit')} className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all">
            <div className="flex items-center gap-3">
              <CheckSquare className="text-purple-600" />
              <span className="font-medium text-slate-800">Check Deposit</span>
            </div>
         </button>

         <button onClick={() => handlePaymentSelect('Cash on Delivery')} className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
            <div className="flex items-center gap-3">
              <Banknote className="text-green-600" />
              <span className="font-medium text-slate-800">Cash on Delivery</span>
            </div>
         </button>
       </div>
    </div>
  );

  const renderPinEntry = () => (
    <div className="p-4 flex-1 flex flex-col items-center justify-center">
       <div className="bg-slate-100 p-4 rounded-full mb-4">
         <Lock size={32} className="text-slate-500" />
       </div>
       <h3 className="font-bold text-lg text-slate-800 mb-2">Enter UPI PIN</h3>
       <p className="text-sm text-slate-500 mb-6">Completing payment via {selectedPayment}</p>
       
       <div className="flex gap-2 mb-6">
         {pin.map((digit, i) => (
           <input 
             key={i}
             id={`pin-${i}`}
             type="password" 
             value={digit}
             onChange={(e) => handlePinChange(i, e.target.value)}
             className="w-10 h-12 border-b-2 border-slate-300 text-center text-xl font-bold outline-none focus:border-agri-600 bg-transparent"
             maxLength={1}
           />
         ))}
       </div>

       {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}
       <p className="text-xs text-slate-400 mb-6">Demo PIN: 123456</p>

       <button onClick={verifyPin} className="w-full bg-agri-600 text-white py-3 rounded-xl font-bold shadow-lg">
         Pay ₹{total.toFixed(2)}
       </button>
    </div>
  );

  const renderCheckDetails = () => (
    <div className="p-4 flex-1 flex flex-col">
       <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
         <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2"><CheckSquare size={18}/> Check Deposit</h3>
         <p className="text-sm text-purple-800">
           We will collect the check physically. Please ensure details match exactly.
         </p>
       </div>

       <div className="space-y-4 mb-6">
         <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">Check ID / Number</label>
           <input 
             type="text" 
             value={checkDetails.id}
             onChange={e => setCheckDetails({...checkDetails, id: e.target.value})}
             className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
             placeholder="e.g. 001234"
           />
         </div>
         <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">Digital Signature</label>
           <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer relative">
             <Upload className="mx-auto text-slate-400 mb-2" />
             <p className="text-xs text-slate-500">{checkDetails.signature ? "Signature Uploaded" : "Upload Photo of Signature"}</p>
             <input 
               type="file" 
               className="absolute inset-0 opacity-0 cursor-pointer" 
               onChange={(e) => {
                 if(e.target.files?.[0]) setCheckDetails({...checkDetails, signature: 'uploaded'});
               }}
             />
             {checkDetails.signature && <CheckCircle size={16} className="text-green-500 absolute top-2 right-2" />}
           </div>
         </div>
       </div>

       {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}

       <button onClick={verifyCheckDetails} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg mt-auto">
         Confirm Deposit
       </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
         <CheckCircle size={48} className="text-green-600" />
       </div>
       <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Paid!</h2>
       <p className="text-slate-500 mb-8">Your order has been confirmed securely.</p>
       <div className="bg-slate-50 p-4 rounded-xl w-full border border-slate-100">
         <div className="flex justify-between text-sm mb-2">
           <span className="text-slate-500">Amount Paid</span>
           <span className="font-bold text-slate-900">₹{total.toFixed(2)}</span>
         </div>
         <div className="flex justify-between text-sm">
           <span className="text-slate-500">Method</span>
           <span className="font-bold text-slate-900">{selectedPayment}</span>
         </div>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        
        {step !== 'success' && (
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-agri-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="text-agri-600" /> 
              {step === 'cart' ? 'Your Cart' : step === 'payment' ? 'Checkout' : 'Confirm Payment'}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        )}

        {step === 'cart' && renderCart()}
        {step === 'payment' && renderPaymentSelection()}
        {step === 'pin' && renderPinEntry()}
        {step === 'check-details' && renderCheckDetails()}
        {step === 'success' && renderSuccess()}
        
      </div>
    </div>
  );
};
