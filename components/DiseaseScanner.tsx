import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Activity, Loader2, X } from 'lucide-react';
import { analyzeCropDisease } from '../services/geminiService';
import { DiseaseAnalysis } from '../types';

interface DiseaseScannerProps {
  onClose?: () => void;
}

export const DiseaseScanner: React.FC<DiseaseScannerProps> = ({ onClose }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Data = preview.split(',')[1];
      const analysis = await analyzeCropDisease(base64Data);
      setResult(analysis);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-red-500" /> AI Crop Disease Scanner
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Take a clear photo of the leaf or fruit. AI will detect diseases and suggest treatments.
      </p>

      <div className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${preview ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                <span className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">Change Photo</span>
              </div>
            </div>
          ) : (
            <div>
              <Camera className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">Tap to Scan Crop</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {preview && !result && (
          <button
            onClick={handleScan}
            disabled={isAnalyzing}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" /> : "Diagnose Now"}
          </button>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {result && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-start mb-3">
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Diagnosis</p>
                 <h4 className={`text-lg font-bold ${result.diseaseName.toLowerCase().includes('healthy') ? 'text-green-600' : 'text-red-600'}`}>
                   {result.diseaseName}
                 </h4>
               </div>
               <span className={`px-2 py-1 rounded text-xs font-bold ${result.severity === 'High' ? 'bg-red-100 text-red-800' : result.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                 {result.severity} Severity
               </span>
             </div>

             <div className="space-y-3">
               <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Recommended Treatment</p>
                  <p className="text-sm text-slate-800">{result.treatment}</p>
               </div>

               <div className="flex items-center gap-2 text-sm">
                 <span className="font-semibold text-slate-600">Market Status:</span>
                 {result.isSellable ? (
                   <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={14} /> Sellable</span>
                 ) : (
                   <span className="flex items-center gap-1 text-red-600 font-bold"><X size={14} /> Not Recommended for Sale</span>
                 )}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
