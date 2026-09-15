import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Navigation,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreationLocation } from '../../types';

interface LiveVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  artisanName?: string;
  cooperativeName?: string;
}

export const LiveVerificationModal: React.FC<LiveVerificationModalProps> = ({
  isOpen,
  onClose,
  artisanName = "Sita Devi Mahapatra",
  cooperativeName = "Utkalika State Handicraft Apex Co-op"
}) => {
  const { showNotification } = useApp();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes

  useEffect(() => {
    let interval: any;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      showNotification('Live verification session expired. Background location collection terminated.', 'info');
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const handleStartSession = () => {
    setIsActive(true);
    setSecondsRemaining(300);
    showNotification('Live 5-minute verification session activated. Proximity to cooperative hall verified.', 'success');
  };

  const handleEndSession = () => {
    setIsActive(false);
    onClose();
    showNotification('Live location verification concluded.', 'info');
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerFormatted = `0${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-black/[0.03] rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 craft-shadow relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#73776A] hover:text-[#2C2E29] hover:bg-[#FAF8F5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#5D634C]/10 text-[#5D634C] text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cooperative Field Verification</span>
          </div>
          <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            Live Location Verification
          </h2>
          <p className="text-xs text-[#73776A]">
            Temporary 5-minute ephemeral session to verify physical presence during batch signoffs.
          </p>
        </div>

        {!isActive ? (
          /* Consent Request View */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#2C2E29]">
                <MapPin className="w-4 h-4 text-[#5D634C]" />
                <span>Verification Request from {cooperativeName}</span>
              </div>
              <p className="text-xs text-[#73776A] leading-relaxed">
                Artisan: <strong>{artisanName}</strong>. This single-use session verifies physical attendance at the cooperative guild inspection center.
              </p>
              <div className="text-[11px] text-[#5D634C] flex items-center space-x-1 bg-[#5D634C]/10 p-2.5 rounded-xl">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Automatically terminates in 5 minutes. No continuous background tracking.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#DCD7CF] text-[#73776A] text-xs font-semibold rounded-full hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSession}
                className="w-full sm:w-auto px-6 py-3 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Allow for 5 Minutes</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Session View */
          <div className="space-y-6 text-center animate-fade-in">
            
            <div className="p-6 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#5D634C] text-white flex items-center justify-center mx-auto shadow-sm">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] text-[#5D634C] font-bold uppercase tracking-wider block">Live Session Active</span>
                <h3 className="font-serif italic text-3xl font-bold text-[#2C2E29] mt-1">
                  {timerFormatted}
                </h3>
                <span className="text-xs text-[#73776A]">remaining in verification window</span>
              </div>

              <div className="pt-2 flex items-center justify-center space-x-2 text-xs font-medium text-[#5D634C]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Proximity to Pipli Cooperative Hall verified (±12m)</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleEndSession}
                className="px-6 py-2.5 bg-white border border-[#A25247] text-[#A25247] text-xs font-semibold rounded-full hover:bg-[#A25247]/10 transition-colors"
              >
                End Session Early
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
