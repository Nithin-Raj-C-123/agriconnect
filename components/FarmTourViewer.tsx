
import React, { useState, useEffect, useRef } from 'react';
import { X, Map, Compass, Rotate3D, Eye, ChevronRight, Layers } from 'lucide-react';
import { MOCK_USERS } from '../services/mockStore';

interface FarmTourViewerProps {
  onClose: () => void;
  farmerName: string;
  farmerId?: string; // To look up 3D profile
  initialImage?: string; // Optional direct image override (e.g. for specific crop)
}

export const FarmTourViewer: React.FC<FarmTourViewerProps> = ({ onClose, farmerName, farmerId, initialImage }) => {
  const [isVRMode, setIsVRMode] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [manualRotation, setManualRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  // Get farm profile views
  const farmer = MOCK_USERS.find(u => u.id === farmerId);
  const scenes = initialImage 
    ? [{ id: 'crop-specific', name: 'Crop Land View', type: 'Field', imageUrl: initialImage }] 
    : (farmer?.farm3dProfile || [{ id: 'default', name: 'Farm View', type: 'Field', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop' }]);

  const currentScene = scenes[currentSceneIndex] || scenes[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const delta = e.clientX - startX.current;
      setManualRotation(prev => prev - delta * 0.2); // Sensitivity
      startX.current = e.clientX;
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // VR View Component (Repeated for left/right eye)
  const VRView = ({ eye }: { eye: 'left' | 'right' }) => (
    <div className={`relative w-full h-full overflow-hidden ${eye === 'left' ? 'border-r-2 border-black' : ''}`}>
       {/* Simulated Panoramic Image */}
       <div 
         className="absolute inset-0 bg-cover bg-center h-full w-[200%] origin-center"
         style={{ 
           backgroundImage: `url("${currentScene.imageUrl}")`,
           transform: `translateX(-${(manualRotation % 100) / 2}%) scale(1.1)`, 
           transition: isDragging ? 'none' : 'transform 0.1s ease-out'
         }}
       ></div>
       
       <div className="absolute bottom-10 left-10 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-md">
         {currentScene.name} ({eye === 'left' ? 'L' : 'R'})
       </div>
       
       {/* Reticle for VR */}
       <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black animate-in fade-in">
      <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
        
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
           <div className="flex items-center gap-3 pointer-events-auto">
             <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
               <Compass className="text-white" size={24} />
             </div>
             <div>
               <h2 className="text-white font-bold text-lg drop-shadow-md">360° Farm Tour</h2>
               <p className="text-slate-300 text-xs drop-shadow-md">{farmerName}'s Farm</p>
             </div>
           </div>
           
           <div className="flex items-center gap-4 pointer-events-auto">
             {/* Scene Switcher */}
             {scenes.length > 1 && !isVRMode && (
               <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1">
                 {scenes.map((scene, idx) => (
                   <button 
                     key={scene.id}
                     onClick={() => setCurrentSceneIndex(idx)}
                     className={`px-3 py-1 rounded text-xs font-bold transition-colors ${currentSceneIndex === idx ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                   >
                     {scene.type}
                   </button>
                 ))}
               </div>
             )}

             <button 
               onClick={() => setIsVRMode(!isVRMode)}
               className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${isVRMode ? 'bg-purple-600 text-white' : 'bg-white text-black hover:bg-slate-200'}`}
             >
               <Eye size={18} /> {isVRMode ? 'Exit VR' : 'Enter VR Mode'}
             </button>
             
             <button 
               onClick={onClose}
               className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
             >
               <X size={24} />
             </button>
           </div>
        </div>

        {/* Main Viewport */}
        <div 
           className="flex-1 relative flex cursor-grab active:cursor-grabbing"
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
        >
           {isVRMode ? (
             <div className="flex w-full h-full">
               <div className="w-1/2 h-full relative border-r-4 border-black"><VRView eye="left"/></div>
               <div className="w-1/2 h-full relative"><VRView eye="right"/></div>
             </div>
           ) : (
             <div className="w-full h-full relative overflow-hidden bg-slate-900">
                {/* 360 Image Simulation */}
                <div 
                  className="absolute inset-0 bg-cover bg-center h-full w-full"
                  style={{ 
                     backgroundImage: `url("${currentScene.imageUrl}")`,
                     backgroundPosition: `${manualRotation}% center`,
                     // Add subtle zoom animation if not dragging
                     animation: !isDragging ? 'breathe 20s infinite alternate' : 'none',
                     transform: 'scale(1.05)'
                  }}
                ></div>

                {/* Overlay UI elements only in standard mode */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold mb-2">
                       {currentScene.name}
                    </div>
                    <div className="bg-black/40 text-slate-300 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                       <Rotate3D size={14}/> Drag to Rotate View
                    </div>
                </div>

                {/* Hotspots (Mock) */}
                <div 
                   className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 border-2 border-white/50 rounded-full animate-ping pointer-events-none"
                   style={{ transform: `translateX(${Math.sin(manualRotation/20)*100}px)` }}
                ></div>
             </div>
           )}
        </div>

        <style>{`
          @keyframes breathe {
            0% { transform: scale(1.0); }
            100% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
};
