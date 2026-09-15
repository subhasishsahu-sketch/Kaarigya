import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  Lock,
  Layers,
  Navigation,
  Sparkles
} from 'lucide-react';
import { ProductPassport } from '../../types';
import { LocationConsistencyBadge } from '../location/LocationConsistencyBadge';
import { LiveVerificationModal } from '../location/LiveVerificationModal';
import { SafeImage } from '../common/SafeImage';

export const VerificationQueue: React.FC = () => {
  const navigate = useNavigate();
  const { 
    products, 
    approveProductVerification, 
    rejectProductVerification, 
    showNotification,
    t
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<ProductPassport | null>(() => {
    return products.find(p => p.status === 'pending') || products[0];
  });
  const [auditNotes, setAuditNotes] = useState<string>('Physical craft geometry matches master guild standard. Pure natural dyes and organic cotton certified.');
  const [isLiveModalOpen, setIsLiveModalOpen] = useState<boolean>(false);

  const pendingList = products.filter(p => p.status === 'pending');

  const handleApprove = (productId: string) => {
    approveProductVerification(productId, auditNotes);
    const remaining = products.filter(p => p.productId !== productId && p.status === 'pending');
    setSelectedProduct(remaining[0] || null);
  };

  const handleReject = (productId: string) => {
    rejectProductVerification(productId, 'Additional high-resolution maker-mark photo required.');
    const remaining = products.filter(p => p.productId !== productId && p.status === 'pending');
    setSelectedProduct(remaining[0] || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD7CF] pb-4">
        <div>
          <button
            onClick={() => navigate('/coop/overview')}
            className="inline-flex items-center space-x-1.5 text-xs text-[#73776A] hover:text-[#2C2E29] font-bold uppercase tracking-wider mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cooperative Hub</span>
          </button>
          <h1 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            Product Verification Queue
          </h1>
          <p className="text-xs text-[#73776A]">
            Inspect craft evidence, verify maker attribution, review provenance signals, and seal digital passports.
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-[#BC8E6D]/15 border border-[#BC8E6D]/30 text-xs text-[#BC8E6D] font-bold uppercase tracking-wider">
          {pendingList.length} Items Awaiting Verification
        </div>
      </div>

      {/* Main Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Pending List */}
        <div className="lg:col-span-4 bg-white border border-black/[0.03] rounded-[32px] p-6 space-y-3 craft-shadow-subtle">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D] px-1">
            Pending Queue ({pendingList.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pendingList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#73776A]">
                ✓ All queue items processed.
              </div>
            ) : (
              pendingList.map((p) => {
                const isSelected = selectedProduct?.productId === p.productId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      isSelected
                        ? 'bg-[#E8E4DD] border-[#5D634C] shadow-xs'
                        : 'bg-[#FAF8F5] border-black/[0.03] hover:bg-[#E8E4DD]/50'
                    }`}
                  >
                    <SafeImage
                      src={p.primaryImage}
                      alt={p.name}
                      craftCategory={p.craftCategory}
                      productId={p.productId}
                      className="w-14 h-14 rounded-xl object-cover border border-[#DCD7CF] shrink-0"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-[#73776A]">{p.productId}</span>
                      <h4 className="text-xs font-bold text-[#2C2E29] truncate">{p.name}</h4>
                      <p className="text-[11px] text-[#73776A]">By {p.artisan.name}</p>
                      <div className="pt-1">
                        <LocationConsistencyBadge status={p.locationConsistency} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Evidence Review Card */}
        {selectedProduct ? (
          <div className="lg:col-span-8 bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
            
            {/* Header with Product & Artisan Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8E4DD] pb-6">
              <div>
                <span className="text-xs font-mono font-bold text-[#5D634C]">
                  Audit Case: {selectedProduct.productId}
                </span>
                <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29] mt-0.5">
                  {selectedProduct.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#73776A] pt-1">
                  <span>Craft: <strong>{selectedProduct.craftCategory}</strong></span>
                  <span>•</span>
                  <span>Origin: <strong>{selectedProduct.artisan.location}</strong></span>
                  <span>•</span>
                  <span>Wage Escrow: <strong className="text-[#5D634C]">₹{selectedProduct.price.artisanCompensation.toLocaleString()} (65%)</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <SafeImage
                  src={selectedProduct.artisan.avatar}
                  alt={selectedProduct.artisan.name}
                  isAvatar={true}
                  artisanName={selectedProduct.artisan.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#DCD7CF]"
                />
                <div className="text-xs">
                  <div className="font-bold text-[#2C2E29]">{selectedProduct.artisan.name}</div>
                  <div className="text-[10px] text-[#5D634C] font-semibold">✓ Biometrics Authenticated</div>
                </div>
              </div>
            </div>

            {/* Provenance Signals & Location Signal */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#5D634C]" />
                  <span className="text-xs font-bold text-[#2C2E29]">Artisan Provenance Signal</span>
                </div>
                <LocationConsistencyBadge status={selectedProduct.locationConsistency} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#73776A]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73776A] block">Registered Workshop</span>
                  <span className="font-medium text-[#2C2E29]">{selectedProduct.artisan.location}, {selectedProduct.artisan.district}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73776A] block">Creation Timestamp</span>
                  <span className="font-mono text-[#2C2E29]">{selectedProduct.creationLocation?.timestamp || selectedProduct.creationDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DCD7CF] flex items-center justify-between text-[11px]">
                <span className="text-[#73776A] italic">
                  Location supports provenance as part of the multi-factor trust profile.
                </span>
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="px-3 py-1 bg-white border border-[#DCD7CF] rounded-full text-[#5D634C] font-semibold hover:bg-[#E8E4DD] transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Request Live 5m Verification</span>
                </button>
              </div>
            </div>

            {/* Evidence Photo Grid */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                Submitted Photographic Evidence ({selectedProduct.evidenceImages.length || 1})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-48 rounded-2xl overflow-hidden border border-[#DCD7CF] bg-[#E8E4DD]">
                    <SafeImage
                      src={selectedProduct.primaryImage}
                      alt="Primary Finished"
                      craftCategory={selectedProduct.craftCategory}
                      productId={selectedProduct.productId}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-[#73776A] block font-medium">Finished Craft Overall Inspection</span>
                </div>

                {selectedProduct.evidenceImages.slice(1, 2).map((ev) => (
                  <div key={ev.id} className="space-y-1.5">
                    <div className="h-48 rounded-2xl overflow-hidden border border-[#DCD7CF] bg-[#E8E4DD]">
                      <SafeImage 
                        src={ev.url} 
                        alt={ev.label} 
                        craftCategory={selectedProduct.craftCategory}
                        productId={selectedProduct.productId}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-[11px] text-[#73776A] block font-medium">{ev.label} ({ev.geoTag})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials & Technique Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] text-xs">
              <div>
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block mb-2">Declared Materials</span>
                <ul className="space-y-1.5">
                  {selectedProduct.materials.map((m, i) => (
                    <li key={i} className="flex items-center space-x-2 text-[#2C2E29]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5D634C]" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block mb-2">Traditional Technique</span>
                <div className="font-medium text-[#2C2E29]">{selectedProduct.techniques.join(', ')}</div>
                <div className="text-[11px] text-[#73776A] mt-1.5">Duration: {selectedProduct.productionDuration}</div>
              </div>
            </div>

            {/* Auditor Notes Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2E29]">
                Cooperative Auditor Signoff Notes
              </label>
              <textarea
                rows={2}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                className="w-full p-3.5 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>

            {/* Approval / Rejection Actions */}
            <div className="pt-4 border-t border-[#E8E4DD] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReject(selectedProduct.productId)}
                  className="px-5 py-2.5 bg-white border border-[#A25247] text-[#A25247] text-xs font-semibold rounded-full hover:bg-[#A25247]/10 transition-colors cursor-pointer"
                >
                  Request Changes
                </button>
              </div>

              <button
                onClick={() => handleApprove(selectedProduct.productId)}
                className="px-6 py-3 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#FAF8F5]" />
                <span>Approve & Seal Digital Passport</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 bg-white border border-black/[0.03] rounded-[32px] p-12 text-center text-xs text-[#73776A]">
            Select a product from the left queue to inspect evidence.
          </div>
        )}

      </div>

      {/* Live Verification Modal */}
      {selectedProduct && (
        <LiveVerificationModal
          isOpen={isLiveModalOpen}
          onClose={() => setIsLiveModalOpen(false)}
          artisanName={selectedProduct.artisan.name}
          cooperativeName={selectedProduct.artisan.cooperativeName}
        />
      )}

    </div>
  );
};
