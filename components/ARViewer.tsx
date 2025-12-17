import React, { useEffect, useRef } from 'react';
import { X, Box, Rotate3D, ZoomIn } from 'lucide-react';

interface ARViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export const ARViewer: React.FC<ARViewerProps> = ({ imageUrl, onClose }) => {
  // Simple CSS 3D simulation
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let angle = 0;
    const interval = setInterval(() => {
      if (imageRef.current) {
        angle = (angle + 1) % 360;
        imageRef.current.style.transform = `rotateY(${angle}deg)`;
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white w-full max-w-lg rounded-2xl overflow-hidden p-6 text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
           <Box className="text-indigo-600" /> AR Crop Visualization
        </h3>
        <p className="text-slate-500 text-sm mb-8">
          Inspect the crop in 3D. <span className="hidden sm:inline">Use mouse to rotate (simulated).</span>
        </p>

        <div className="perspective-[1000px] h-64 flex items-center justify-center mb-6">
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="3D View" 
            className="h-48 object-contain rounded-lg shadow-xl"
            style={{ transformStyle: 'preserve-3d' }}
          />
        </div>

        <div className="flex justify-center gap-4 text-sm font-medium text-slate-600">
          <div className="flex flex-col items-center gap-1">
             <div className="p-3 bg-indigo-50 rounded-full text-indigo-600"><Rotate3D size={20}/></div>
             <span>Auto-Rotate</span>
          </div>
          <div className="flex flex-col items-center gap-1">
             <div className="p-3 bg-indigo-50 rounded-full text-indigo-600"><ZoomIn size={20}/></div>
             <span>Zoom Detail</span>
          </div>
        </div>
      </div>
    </div>
  );
};