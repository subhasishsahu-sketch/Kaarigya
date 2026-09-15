import React, { useState } from 'react';
import { X, MapPin, Building2, Award, Plus, CheckCircle2 } from 'lucide-react';

export interface CraftClusterData {
  id: string;
  clusterName: string;
  state: string;
  giTag: string;
  cooperativeName: string;
  activeArtisans: number;
  totalProducts: number;
  totalWageDisbursed: string;
  description: string;
}

interface RegisterClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClusterCreated: (cluster: CraftClusterData) => void;
}

export const RegisterClusterModal: React.FC<RegisterClusterModalProps> = ({
  isOpen,
  onClose,
  onClusterCreated
}) => {
  const [clusterName, setClusterName] = useState<string>('Kutch Rogan Painting & Weaving Cluster');
  const [state, setState] = useState<string>('Gujarat');
  const [giTag, setGiTag] = useState<string>('GI-372 (Kutch Rogan Art)');
  const [cooperativeName, setCooperativeName] = useState<string>('Kutch Heritage Artisan Federation');
  const [activeArtisans, setActiveArtisans] = useState<number>(85);
  const [description, setDescription] = useState<string>(
    'Centuries-old rare Persian-origin textile art created using boiled castor seed oil and natural mineral pigments applied with a blunt metal stylus.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clusterName.trim() || !giTag.trim()) return;

    const newCluster: CraftClusterData = {
      id: `cluster-${Date.now()}`,
      clusterName,
      state,
      giTag,
      cooperativeName,
      activeArtisans,
      totalProducts: 1,
      totalWageDisbursed: '₹3.5 Lakh',
      description
    };

    onClusterCreated(newCluster);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DCD7CF] rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="bg-[#4A4F3C] text-[#FAF8F5] p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#BC8E6D]/20 border border-[#BC8E6D]/40 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#BC8E6D]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-[#BC8E6D] tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geographical Indication Registry</span>
              </div>
              <h2 className="font-serif italic text-xl font-bold">
                Register New GI Craft Cluster
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#E8E4DD] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-[#2C2E29]">Craft Cluster Name</label>
            <input
              type="text"
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
              placeholder="e.g. Kutch Rogan Painting Cluster"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#2C2E29]">State / Region</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
              >
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Odisha">Odisha</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Bihar">Bihar</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Assam">Assam</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#2C2E29]">Official GI Registration Tag</label>
              <input
                type="text"
                value={giTag}
                onChange={(e) => setGiTag(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
                placeholder="e.g. GI-372 (Rogan Art)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#2C2E29]">Apex Cooperative / Guild</label>
              <input
                type="text"
                value={cooperativeName}
                onChange={(e) => setCooperativeName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
                placeholder="e.g. Kutch Heritage Federation"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#2C2E29]">Active Master Artisans</label>
              <input
                type="number"
                min="1"
                value={activeArtisans}
                onChange={(e) => setActiveArtisans(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#2C2E29]">Heritage Craft & Technique Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
              placeholder="Describe materials, traditional tools, and historical lineage..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#DCD7CF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#DCD7CF] text-xs font-semibold text-[#73776A] hover:bg-[#E8E4DD] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#5D634C] hover:bg-[#4A4F3C] text-white text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Cluster into Sovereign Registry</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
