
import React, { useState, useRef } from 'react';
import { MOCK_SOIL_DATA } from '../services/mockStore';
import { Droplets, Thermometer, Activity, Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { analyzeSoilReport } from '../services/geminiService';
import { SoilDoctorResult } from '../types';

export const SoilTester: React.FC = () => {
  const [reportPreview, setReportPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SoilDoctorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setReportPreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const runSoilDoctor = async () => {
    if (!reportPreview) return;
    setLoading(true);
    try {
      const result = await analyzeSoilReport(reportPreview.split(',')[1]);
      setAnalysis(result);
    } catch (e) {
      alert("Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Smart Farm Command Center</h2>
      
      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
           <div className="flex items-center gap-2 text-blue-600 mb-2">
             <Droplets size={20} /> <span className="font-bold">Moisture</span>
           </div>
           <p className="text-3xl font-extrabold text-slate-800">{MOCK_SOIL_DATA.moisture}%</p>
           <p className="text-xs text-slate-500">Live Sensor</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
           <div className="flex items-center gap-2 text-orange-600 mb-2">
             <Thermometer size={20} /> <span className="font-bold">Temp</span>
           </div>
           <p className="text-3xl font-extrabold text-slate-800">{MOCK_SOIL_DATA.temperature}°C</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
           <div className="flex items-center gap-2 text-green-600 mb-2">
             <Activity size={20} /> <span className="font-bold">pH Level</span>
           </div>
           <p className="text-3xl font-extrabold text-slate-800">{MOCK_SOIL_DATA.phLevel}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
           <div className="flex items-center gap-2 text-purple-600 mb-2">
             <span className="font-bold">NPK Status</span>
           </div>
           <div className="text-sm font-medium">
             <p>N: {MOCK_SOIL_DATA.npk.n}</p>
             <p>P: {MOCK_SOIL_DATA.npk.p}</p>
             <p>K: {MOCK_SOIL_DATA.npk.k}</p>
           </div>
        </div>
      </div>

      {/* Action Needed */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
         <AlertTriangle className="text-amber-600 mt-1" />
         <div>
           <h4 className="font-bold text-amber-800">Action Needed</h4>
           <p className="text-amber-700 text-sm">{MOCK_SOIL_DATA.actionNeeded}</p>
         </div>
      </div>

      {/* AI Soil Doctor */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="text-agri-600" /> AI Soil Doctor
        </h3>
        <p className="text-sm text-slate-500 mb-4">Upload your lab report or a photo of your soil for instant analysis.</p>

        {!analysis ? (
          <div className="space-y-4">
            <div 
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {reportPreview ? (
                <img src={reportPreview} alt="Report" className="h-40 mx-auto object-contain" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload size={32} />
                  <span className="mt-2 text-sm">Click to upload report</span>
                </div>
              )}
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            {reportPreview && (
              <button 
                onClick={runSoilDoctor} 
                disabled={loading}
                className="w-full bg-agri-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin"/> : 'Analyze Report'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-bold text-lg mb-2 text-slate-800">Analysis Result</h4>
            <p className="font-medium text-slate-700 mb-2">Diagnosis: {analysis.diagnosis}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-red-500 uppercase">Deficiencies</p>
                <ul className="list-disc ml-4 text-sm text-slate-600">
                  {analysis.deficiencies.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-green-500 uppercase">Recommendations</p>
                <ul className="list-disc ml-4 text-sm text-slate-600">
                  {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
            <button onClick={() => {setAnalysis(null); setReportPreview(null)}} className="mt-4 text-sm text-agri-600 hover:underline">Analyze Another</button>
          </div>
        )}
      </div>
    </div>
  );
};
