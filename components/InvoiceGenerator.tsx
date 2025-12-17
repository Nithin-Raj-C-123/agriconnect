
import React from 'react';
import { Invoice } from '../types';
import { FileText, Download, Printer, ArrowLeft } from 'lucide-react';

interface InvoiceGeneratorProps {
  invoices: Invoice[];
  onBack: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ invoices, onBack }) => {
  const handlePrint = (invoiceId: string) => {
    // In a real app, this would generate a PDF via a library like jsPDF.
    // For this demo, we trigger the browser print dialog.
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Documents</h2>
          <p className="text-slate-500">Automated invoices and tax reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {invoices.map(invoice => (
          <div key={invoice.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Invoice #{invoice.id}</h3>
                <p className="text-sm text-slate-500">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => handlePrint(invoice.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                 >
                   <Printer size={16} /> Print
                 </button>
                 <button className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                   <Download size={16} /> PDF
                 </button>
                 <button className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
                   <FileText size={16} /> Tax Report
                 </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
               <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                 <span>Item</span>
                 <span>Amount</span>
               </div>
               {invoice.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between text-sm text-slate-800 mb-1">
                   <span>{item.name} x {item.qty}kg</span>
                   <span>₹{(item.qty * item.price).toFixed(2)}</span>
                 </div>
               ))}
               <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm">
                 <span className="text-slate-500">Tax (GST/VAT)</span>
                 <span className="text-slate-500">₹{invoice.taxAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between font-bold text-lg text-slate-900">
                 <span>Total</span>
                 <span>₹{(invoice.totalAmount + invoice.taxAmount).toFixed(2)}</span>
               </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Buyer: {invoice.buyerName} • Order ID: {invoice.orderId}
            </p>
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400">No invoices generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
