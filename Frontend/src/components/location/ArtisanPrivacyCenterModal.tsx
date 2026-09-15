import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  CheckCircle2, 
  Sliders,
  HelpCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ArtisanPrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArtisanPrivacyCenterModal: React.FC<ArtisanPrivacyCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showNotification } = useApp();
  const [sharingEnabled, setSharingEnabled] = useState<boolean>(true);
  const [approximateOnly, setApproximateOnly] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSave = () => {
    showNotification('Privacy & location settings updated successfully.', 'success');
    onClose();
  };

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
            <Lock className="w-3.5 h-3.5" />
            <span>Artisan Privacy Center</span>
          </div>
          <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            Location Privacy & Safety
          </h2>
          <p className="text-xs text-[#73776A]">
            Control how your location is shared and protected during craft registration.
          </p>
        </div>

        {/* Setting Items */}
        <div className="space-y-3">
          
          {/* Toggle 1: Location Sharing */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <span className="text-xs font-bold text-[#2C2E29] block">
                Creation Location Sharing
              </span>
              <p className="text-[11px] text-[#73776A]">
                Allow recording of craft cluster coordinates when creating new product passports.
              </p>
            </div>
            <button
              onClick={() => setSharingEnabled(!sharingEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                sharingEnabled ? 'bg-[#5D634C]' : 'bg-[#DCD7CF]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  sharingEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy Level Guarantee Cards */}
          <div className="p-4 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 space-y-2.5 text-xs text-[#2C2E29]">
            <div className="font-bold flex items-center space-x-1.5 text-[#5D634C]">
              <ShieldCheck className="w-4 h-4" />
              <span>Built-in Privacy Guarantees</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-[#2C2E29]/85">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5D634C] shrink-0" />
                <span><strong>Stored Privately:</strong> Exact GPS coordinates only accessible for cooperative quality audits.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5D634C] shrink-0" />
                <span><strong>Public Approximate Only:</strong> Buyers only see the district / certified craft cluster name.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5D634C] shrink-0" />
                <span><strong>Live Verification:</strong> Ephemeral 5-minute sessions only when you explicitly confirm.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E8E4DD]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#DCD7CF] text-[#73776A] text-xs font-semibold rounded-full hover:bg-[#FAF8F5]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs cursor-pointer"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
