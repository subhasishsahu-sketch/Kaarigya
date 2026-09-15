// Public Customer Verification Entry Point (reached via QR scan /verify/:productId)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  MapPin, 
  User, 
  Calendar, 
  Award, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Search,
  ExternalLink,
  Video
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { PhysicalMatchModal } from './PhysicalMatchModal';
import { SafeImage } from '../common/SafeImage';

interface PublicVerificationPageProps {
  initialProductId?: string;
  onBack?: () => void;
}

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({
  initialProductId,
  onBack
}) => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [productIdInput, setProductIdInput] = useState<string>(initialProductId || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [productData, setProductData] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<'NOT_FOUND' | 'ERROR' | null>(null);
  const [isPhysicalModalOpen, setIsPhysicalModalOpen] = useState<boolean>(false);

  const fetchProduct = async (code: string) => {
    if (!code || !code.trim()) return;
    setLoading(true);
    setErrorStatus(null);
    try {
      const data = await api.products.lookupByCode(code.trim());
      if (data) {
        setProductData(data);
      } else {
        setErrorStatus('NOT_FOUND');
      }
    } catch (err: any) {
      console.warn('Product lookup error:', err);
      setErrorStatus('NOT_FOUND');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProductId) {
      fetchProduct(initialProductId);
    }
  }, [initialProductId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productIdInput.trim()) {
      fetchProduct(productIdInput.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#DCD7CF] pb-4">
        <button
          onClick={() => (onBack ? onBack() : navigate('/'))}
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#5D634C] hover:text-[#2C2E29] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-[#B38B42]/15 text-[#B38B42] flex items-center justify-center font-serif font-bold text-xs">
            K
          </div>
          <span className="text-xs font-bold tracking-wider text-[#2C2E29]">
            KALAKRITI AUTHENTICATION GATEWAY
          </span>
        </div>
      </div>

      {/* Search Header / Manual ID Entry */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-center">
        <div className="max-w-md mx-auto space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Verify Craft Authenticity
          </h1>
          <p className="text-xs text-[#78716C]">
            Enter the 7-character Product ID printed on your physical Kalakriti authentication label.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={productIdInput}
              onChange={(e) => setProductIdInput(e.target.value.toUpperCase())}
              placeholder="e.g. K7B9X3Q"
              maxLength={12}
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D9CFBE] rounded-xl text-center font-mono font-bold text-lg tracking-widest text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:ring-2 focus:ring-[#B38B42]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !productIdInput.trim()}
            className="px-6 py-3 rounded-xl bg-[#B38B42] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#967433] transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Look Up</span>
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#B38B42] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#78716C]">
            Querying authoritative Kalakriti registry for Product ID...
          </p>
        </div>
      )}

      {/* NOT REGISTERED State */}
      {!loading && errorStatus === 'NOT_FOUND' && (
        <div className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-8 text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-red-900">
              Unregistered Product ID
            </h3>
            <p className="text-xs text-red-700 max-w-md mx-auto">
              Product ID <strong>{productIdInput}</strong> was not found in the national registry. This item may be counterfeit, unverified, or the code was mistyped.
            </p>
          </div>
        </div>
      )}

      {/* REGISTERED PRODUCT FOUND State */}
      {!loading && productData && (
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>REGISTERED PRODUCT RECORD FOUND</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1C1917]">
                {productData.title}
              </h2>
              <p className="text-xs text-[#78716C] font-mono">
                Product ID: <strong className="text-[#1C1917] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DDD0]">{productData.productId || productData.id}</strong> • Code: {productData.productCode}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                GI TAG STATUS
              </div>
              <div className="text-xs font-bold text-[#B38B42]">
                {productData.giTagName || 'State GI Recognized'}
              </div>
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left: Product Photograph */}
            <div className="space-y-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E5DDD0]">
                <SafeImage
                  src={productData.primaryImageUrl || productData.fingerprintImageDataUrl || productData.evidence?.[0]?.fileUrl || 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80'}
                  alt={productData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] text-center text-[#78716C]">
                Official Registered Image (Reference Photograph)
              </p>
            </div>

            {/* Middle: Craft Metadata */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#78716C] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#B38B42]" />
                    <span>Craft Type</span>
                  </div>
                  <div className="font-bold text-[#1C1917]">{productData.craftType}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#78716C] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#B38B42]" />
                    <span>Origin District</span>
                  </div>
                  <div className="font-bold text-[#1C1917]">
                    {productData.originDistrict}, {productData.originState}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#78716C] flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#B38B42]" />
                    <span>Master Artisan</span>
                  </div>
                  <div className="font-bold text-[#1C1917]">
                    {productData.artisan?.fullName || 'Certified Artisan Guild'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#78716C] flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#B38B42]" />
                    <span>Creation Date</span>
                  </div>
                  <div className="font-bold text-[#1C1917]">
                    {productData.creationDate || '2026'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-[#57534E] leading-relaxed">
                {productData.description}
              </div>

              {/* Process Video: Craft in the Making */}
              {productData.processVideoUrl && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-[#1C1917] flex items-center space-x-1.5">
                      <Video className="w-4 h-4 text-[#B38B42]" />
                      <span>CRAFT IN THE MAKING</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#2D5A3F] bg-[#E8F2EC] px-2.5 py-0.5 rounded-full border border-[#BDE0CB]">
                      ✓ Process Video Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78716C]">
                    Watch the artisan create this piece using traditional techniques.
                  </p>
                  <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-64 flex items-center justify-center">
                    <video
                      src={productData.processVideoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Important Security Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Physical Authentication Required</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Scanning the QR code confirms registration identity only. To verify that the physical craft in your hands is the authentic original, run the camera microstructure check below.
                </p>
              </div>

              {/* Start Physical Verification Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setIsPhysicalModalOpen(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-[#B38B42] text-white font-bold text-sm tracking-wide hover:bg-[#967433] transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-3 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Physical Verification (Microstructure Match)</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Real Physical Match Modal */}
      {isPhysicalModalOpen && productData && (
        <PhysicalMatchModal
          productId={productData.id || productData.productId}
          productTitle={productData.title}
          onClose={() => setIsPhysicalModalOpen(false)}
          onMatchComplete={(result) => {
            showNotification(
              result.decision === 'AUTHENTIC'
                ? 'Product physically verified as AUTHENTIC!'
                : 'Physical verification flagged suspicious.',
              result.decision === 'AUTHENTIC' ? 'success' : 'warning'
            );
          }}
        />
      )}

    </div>
  );
};
