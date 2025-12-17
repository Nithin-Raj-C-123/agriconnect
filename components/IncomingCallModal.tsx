
import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, PhoneOff, Check, X, Camera } from 'lucide-react';
import { CallSignal } from '../types';

interface IncomingCallModalProps {
  call: CallSignal;
  onAccept: () => void;
  onReject: () => void;
  callerRole: string;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ call, onAccept, onReject, callerRole }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Play ringtone
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Autoplay blocked"));
    audioRef.current = audio;

    // Start local camera preview immediately if it's a video call
    if (call.type === 'video') {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false }) 
          .then(s => {
            setStream(s);
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              videoRef.current.play().catch(e => console.log("Video Play Error", e));
            }
          })
          .catch(err => console.error("Camera preview failed", err));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAccept = () => {
    // Stop the local preview stream so the main chat page can request a fresh one with audio
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    onAccept();
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 animate-slide-in-from-top">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden flex flex-col relative">
        
        {/* Background Video Preview (Subtle) */}
        {call.type === 'video' && (
            <div className="absolute inset-0 z-0 bg-black">
                {stream ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover opacity-60 transform scale-x-[-1]" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Camera size={48} />
                    </div>
                )}
            </div>
        )}

        <div className="relative z-10 p-4 flex items-center gap-4">
            {/* Avatar with Pulse */}
            <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-slate-800">
                    <img src={call.callerAvatar} alt={call.callerName} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping"></div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{call.callerName}</h3>
                <p className="text-sm text-slate-300 flex items-center gap-1.5">
                    {call.type === 'video' ? <Video size={14} className="text-blue-400"/> : <Phone size={14} className="text-green-400"/>}
                    <span className="font-medium">{callerRole} calling...</span>
                </p>
            </div>
        </div>

        {/* Action Buttons Row */}
        <div className="relative z-10 grid grid-cols-2 border-t border-white/10 backdrop-blur-lg">
            <button 
                onClick={onReject}
                className="flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 hover:text-white transition-colors text-red-400 font-bold text-sm uppercase tracking-wider group"
            >
                <div className="p-2 rounded-full bg-red-600 text-white group-hover:scale-110 transition-transform shadow-lg">
                    <PhoneOff size={20} />
                </div>
                Reject
            </button>
            <button 
                onClick={handleAccept}
                className="flex items-center justify-center gap-2 py-4 bg-green-600/10 hover:bg-green-600 hover:text-white transition-colors text-green-400 font-bold text-sm uppercase tracking-wider group"
            >
                <div className="p-2 rounded-full bg-green-600 text-white group-hover:scale-110 transition-transform animate-pulse shadow-lg">
                    {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                </div>
                Attend
            </button>
        </div>
      </div>
    </div>
  );
};
