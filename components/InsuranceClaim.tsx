
import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertTriangle, Loader2, FileText, Upload } from 'lucide-react';
import { estimateCropDamage } from '../services/geminiService';

export const InsuranceClaim: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ percentage: number; report: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const res = await estimateCropDamage(image.split(',')[1]);
      setResult(res);
    } catch(e) {
      alert("Error analyzing image");
    } finally {
      setAnalyzing(false);
    }
  };

  const submitClaim = () => {
    if (!description) {
      alert("Please provide a description of the damage/incident.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-xl border border-green-200 shadow-sm text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Claim Submitted Successfully!</h3>
        <p className="text-slate-600 mb-6">Your claim ID is <span className="font-mono font-bold">#CLM-88392</span>. Our team will process the AI assessment and verify details within 48 hours.</p>
        <button onClick={() => setSubmitted(false)} className="text-agri-600 font-bold hover:underline">Start New Claim</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Crop Insurance Claim Assistant
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload a photo of your damaged crop (flood, drought, or pest). Our AI will estimate the damage percentage and generate a report.
        </p>
      </div>

      <div className="space-y-6">
        {/* Image Upload Area */}
        <div 
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors relative overflow-hidden ${image ? 'border-agri-500 bg-slate-50' : 'border-slate-300 hover:border-agri-400 hover:bg-slate-50'}`}
        >
          {image ? (
            <div className="relative">
               <img src={image} className="max-h-64 mx-auto rounded shadow-sm" alt="Damage" />
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                 <span className="bg-white text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                   <Upload size={12}/> Change Photo
                 </span>
               </div>
            </div>
          ) : (
            <div className="text-slate-400 py-4">
              <Camera className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="font-medium text-slate-600">Upload Damage Photo</p>
              <p className="text-xs mt-1">Supports JPG, PNG</p>
            </div>
          )}
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
        </div>

        {/* AI Analysis Trigger */}
        {image && !result && (
          <button 
            onClick={analyze}
            disabled={analyzing}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900 transition-all"
          >
            {analyzing ? <Loader2 className="animate-spin" /> : '🤖 Estimate Damage with AI'}
          </button>
        )}

        {/* Results & Description Form */}
        {result && (
          <div className="animate-in slide-in-from-bottom-5 fade-in space-y-6">
            <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div>
                 <p className="text-sm font-bold text-red-800 uppercase tracking-wide">AI Estimated Damage</p>
                 <p className="text-xs text-red-600">Based on visual analysis</p>
               </div>
               <span className="text-4xl font-extrabold text-red-600">{result.percentage}%</span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <p className="text-xs font-bold text-slate-500 uppercase mb-2">AI Generated Report</p>
               <p className="text-sm text-slate-700 italic border-l-4 border-agri-400 pl-3 py-1">
                 "{result.report}"
               </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} /> Add Description Details
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none text-sm"
                rows={4}
                placeholder="Describe the cause (e.g., Heavy Rainfall, Pest Attack) and affected area details..."
              />
            </div>

            <button 
              onClick={submitClaim}
              className="w-full bg-agri-600 text-white py-4 rounded-xl font-bold hover:bg-agri-700 shadow-xl shadow-agri-200 transition-all"
            >
              Submit Claim Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
