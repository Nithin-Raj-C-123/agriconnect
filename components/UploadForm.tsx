
import React, { useState, useRef } from 'react';
import { CropCategory, AIAnalysisResult, Crop, EcoScore } from '../types';
import { analyzeCropImage } from '../services/geminiService';
import { Upload, Loader2, CheckCircle, Camera, MapPin, Save, Leaf, Compass, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { VoiceInput } from './VoiceInput';

interface UploadFormProps {
  onUpload: (data: any) => void;
  currentUser: any;
  existingCrops: Crop[];
}

export const UploadForm: React.FC<UploadFormProps> = ({ onUpload, currentUser }) => {
  const [images, setImages] = useState<string[]>([]);
  const [image360, setImage360] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CropCategory>(CropCategory.VEGETABLE);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [ecoScore, setEcoScore] = useState<EcoScore>(EcoScore.C);
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);

  // Refs for Voice Navigation
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const file360Ref = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result as string]); // Single image for now as per prompt flow
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handle360FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage360(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        // Format as string for the input
        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }, () => {
        alert("Location access denied.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleAIAnalysis = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    try {
      const base64Data = images[0].split(',')[1];
      const result = await analyzeCropImage(base64Data);
      
      setName(result.cropName);
      setPrice(result.estimatedPriceInr.toString());
      setDescription(result.description);
      
      const matchedCategory = Object.values(CropCategory).find(c => c.toLowerCase() === result.category.toLowerCase()) || CropCategory.OTHER;
      setCategory(matchedCategory);
      
      // Map AI Eco Score letter to Enum
      const mapEco = { 'A': EcoScore.A, 'B': EcoScore.B, 'C': EcoScore.C, 'D': EcoScore.D };
      setEcoScore(mapEco[result.ecoScoreEstimate as keyof typeof mapEco] || EcoScore.C);

    } catch (err) {
      alert("AI Analysis failed. Please fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (images.length === 0 || !name || !price || !quantity) {
      alert("Please fill required fields.");
      return;
    }

    // Auto-assign inbuilt 360 image if not provided based on category
    let final360Image = image360;
    if (!final360Image) {
        if (category === CropCategory.GRAIN) final360Image = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop';
        else if (category === CropCategory.VEGETABLE) final360Image = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2940&auto=format&fit=crop';
        else final360Image = 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2940&auto=format&fit=crop';
    }

    const newCrop: Crop = {
      id: `c${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      name,
      category,
      pricePerKg: parseFloat(price),
      quantityKg: parseFloat(quantity),
      description,
      images: images,
      location: location || currentUser.location,
      harvestDate,
      verified: true,
      createdAt: new Date().toISOString(),
      ecoScore,
      isOrganic,
      field360Image: final360Image || undefined
    };

    onUpload(newCrop);
    alert("Harvest Posted Successfully! 360° View has been generated.");
    // Reset form
    setImages([]);
    setImage360(null);
    setName('');
    setPrice('');
    setQuantity('');
    setLocation('');
    setCoords(null);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Leaf className="text-agri-600" /> {t('dash.sell')}
      </h2>

      <div className="space-y-6">
        {/* Photo Upload */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-agri-500 hover:bg-agri-50 transition-all relative overflow-hidden"
        >
          {images.length > 0 ? (
            <img src={images[0]} alt="Crop" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-slate-500">
              <Camera size={48} className="mx-auto mb-2 text-agri-400" />
              <p className="font-medium">Click to upload crop photo</p>
              <p className="text-xs">We will autofill details for you</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        {images.length > 0 && (
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" /> : "✨ Autofill Details with AI"}
          </button>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <VoiceInput
              label={t('form.crop_name')}
              value={name}
              onChange={setName}
              inputRef={nameRef}
              onNext={() => categoryRef.current?.focus()}
              placeholder="e.g. Organic Tomatoes"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
            <select 
              ref={categoryRef}
              value={category} 
              onChange={e => setCategory(e.target.value as CropCategory)} 
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-agri-500"
            >
              {Object.values(CropCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
             <VoiceInput
               label={t('form.price')}
               value={price}
               onChange={setPrice}
               type="number"
               isCurrency
               inputRef={priceRef}
               onNext={() => quantityRef.current?.focus()}
               placeholder="e.g. 40"
             />
          </div>

          <div>
            <VoiceInput
              label={t('form.qty')}
              value={quantity}
              onChange={setQuantity}
              type="number"
              isQuantity
              inputRef={quantityRef}
              onNext={() => locationRef.current?.focus()}
              placeholder="e.g. 1000"
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">{t('form.location')}</label>
             <div className="flex gap-2">
               <div className="flex-1">
                 <VoiceInput 
                   label="" // Embedded, no label here
                   value={location} 
                   onChange={setLocation}
                   inputRef={locationRef}
                   onNext={() => dateRef.current?.focus()}
                   placeholder="e.g. Address or City"
                 />
               </div>
               <button type="button" onClick={getLiveLocation} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 h-[50px]" title="Get Live Location">
                 <MapPin size={20} className="text-blue-600" />
               </button>
             </div>
             {/* Map Preview */}
             {location && (
               <div className="mt-2 h-40 w-full rounded-lg overflow-hidden border border-slate-200">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=14&output=embed`}
                    title="Location Preview"
                  ></iframe>
               </div>
             )}
          </div>

          <div>
            <VoiceInput
              label="Harvest Date"
              value={harvestDate}
              onChange={setHarvestDate}
              type="date"
              inputRef={dateRef}
              onNext={() => descRef.current?.focus()}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Eco Score</label>
            <select value={ecoScore} onChange={e => setEcoScore(e.target.value as EcoScore)} className="w-full p-3 border border-slate-300 rounded-lg bg-green-50 text-green-800 font-medium outline-none">
              {Object.values(EcoScore).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <VoiceInput
              label={t('form.description')}
              value={description}
              onChange={setDescription}
              type="textarea"
              inputRef={descRef}
              onNext={() => submitRef.current?.focus()}
              onSubmit={() => handleSubmit()}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border w-full h-[42px]">
              <input type="checkbox" checked={isOrganic} onChange={e => setIsOrganic(e.target.checked)} className="w-5 h-5 text-agri-600" />
              <span className="font-bold text-slate-700">Certified Organic</span>
              {isOrganic && <CheckCircle size={16} className="text-green-600 ml-auto" />}
            </label>
          </div>

          {/* 360 Image Upload */}
          <div className="md:col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <div className="flex justify-between items-center mb-2">
               <label className="font-bold text-indigo-900 flex items-center gap-2">
                 <Globe size={18} /> 360° Field View
               </label>
               <span className="text-xs text-indigo-600 bg-white px-2 py-1 rounded-full">Optional</span>
             </div>
             
             <div 
               onClick={() => file360Ref.current?.click()}
               className="border-2 border-dashed border-indigo-200 bg-white rounded-lg p-4 cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-center gap-3"
             >
               <Compass className="text-indigo-400" size={24} />
               {image360 ? (
                 <span className="text-sm font-bold text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Panorama Uploaded</span>
               ) : (
                 <span className="text-sm text-slate-500">Upload 360° image of the land. <br/> <span className="text-xs text-indigo-500">If empty, AI will generate a stock view based on crop.</span></span>
               )}
             </div>
             <input type="file" ref={file360Ref} className="hidden" accept="image/*" onChange={handle360FileChange} />
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4">
            <button type="button" onClick={() => {setImages([]); setName('')}} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
            <button 
              ref={submitRef}
              type="submit" 
              className="flex-1 py-3 bg-agri-600 text-white font-bold rounded-lg hover:bg-agri-700 shadow-lg"
            >
              {t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
