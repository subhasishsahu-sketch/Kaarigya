import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  ChevronRight, 
  Mic, 
  User, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Lock,
  Navigation
} from 'lucide-react';
import { VerificationStatusTag } from '../common/TrustBadge';
import { ArtisanPrivacyCenterModal } from '../location/ArtisanPrivacyCenterModal';
import { LiveVerificationModal } from '../location/LiveVerificationModal';

export const ArtisanDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentArtisan, 
    products, 
    t, 
    setIsQRScannerOpen,
    language 
  } = useApp();

  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isLiveVerificationOpen, setIsLiveVerificationOpen] = useState<boolean>(false);

  // Filter products by artisan strictly using ID, email, or exact name
  const artisanProducts = products.filter(p => 
    p.artisan.id === currentArtisan.id || 
    (currentArtisan.email && p.artisan.email && p.artisan.email.toLowerCase() === currentArtisan.email.toLowerCase()) ||
    (p.artisan.name.toLowerCase() === currentArtisan.name.toLowerCase())
  );

  const totalCount = currentArtisan.isNewProfile && artisanProducts.length === 0 
    ? 0 
    : (currentArtisan.totalProducts !== undefined ? currentArtisan.totalProducts : artisanProducts.length);
  const verifiedCount = currentArtisan.isNewProfile && artisanProducts.length === 0
    ? 0
    : (artisanProducts.length > 0 ? artisanProducts.filter(p => p.status === 'verified').length : (currentArtisan.verifiedProducts ?? 0));
  const pendingCount = artisanProducts.filter(p => p.status === 'pending').length;
  const flaggedCount = artisanProducts.filter(p => p.status === 'flagged').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. WELCOME HEADER (MOBILE FIRST) */}
      <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 craft-shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentArtisan.avatar}
            alt={currentArtisan.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#5D634C] shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif italic text-xl sm:text-2xl font-bold text-[#2C2E29]">
                Hello, {currentArtisan.name.split(' ')[0]} 👋
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5D634C]/15 text-[#5D634C] text-[10px] font-bold uppercase tracking-wider">
                {currentArtisan.isNewProfile ? 'Profile Active' : 'KYC Verified'}
              </span>
            </div>
            <p className="text-xs text-[#73776A] mt-0.5 font-medium">
              "Your craft, documented." • {currentArtisan.cooperativeName}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('artisan-profile')}
          className="text-xs text-[#5D634C] font-bold uppercase tracking-wider hover:text-[#2C2E29] flex items-center space-x-1 cursor-pointer"
        >
          <span>View Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. PRIMARY HERO ACTION: + REGISTER PRODUCT */}
      <button
        onClick={() => navigate('/artisan/register')}
        className="w-full py-5 px-7 rounded-[28px] bg-[#5D634C] hover:bg-[#4A4F3C] text-white font-medium shadow-md flex items-center justify-between transition-all transform active:scale-98 group cursor-pointer"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-serif italic text-lg font-bold text-white">
              + Register Product
            </div>
            <div className="text-xs text-white/80">
              Create a new Digital Product Passport with Provenance & Voice in 2 minutes
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-white/90">
          <Mic className="w-4 h-4 text-[#BC8E6D]" />
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* 3. ESSENTIAL METRICS (4 CLEAR NUMBERS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Products */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#73776A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Products</span>
            <Package className="w-3.5 h-3.5 text-[#73776A]" />
          </div>
          <div className="font-serif italic text-3xl font-bold text-[#2C2E29]">
            {totalCount}
          </div>
          <span className="text-[10px] text-[#73776A]">Total Recorded</span>
        </div>

        {/* Verified */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#5D634C]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5D634C]" />
          </div>
          <div className="font-serif italic text-3xl font-bold text-[#5D634C]">
            {verifiedCount}
          </div>
          <span className="text-[10px] text-[#5D634C]">Passport Sealed</span>
        </div>

        {/* Pending */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#BC8E6D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending</span>
            <Clock className="w-3.5 h-3.5 text-[#BC8E6D]" />
          </div>
          <div className="font-serif italic text-3xl font-bold text-[#BC8E6D]">
            {pendingCount}
          </div>
          <span className="text-[10px] text-[#BC8E6D]">In Audit Queue</span>
        </div>

        {/* Flagged */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#A25247]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Flagged</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#A25247]" />
          </div>
          <div className="font-serif italic text-3xl font-bold text-[#A25247]">
            {flaggedCount}
          </div>
          <span className="text-[10px] text-[#A25247]">Copy Detected</span>
        </div>

      </div>

      {/* 4. LIVE ARTISAN PROVENANCE & PRIVACY CONTROL STRIP */}
      <div className="p-5 rounded-[28px] bg-white border border-black/[0.03] craft-shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-[#2C2E29]">
                Live Provenance & Privacy Center
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#5D634C]/10 text-[#5D634C] text-[10px] font-bold">
                Cluster Protected
              </span>
            </div>
            <p className="text-[11px] text-[#73776A] mt-0.5">
              Creation locations are stored privately in {currentArtisan.location || currentArtisan.district || 'Craft Cluster'}, {currentArtisan.state || 'India'}. Buyers only see approximate cluster areas.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsLiveVerificationOpen(true)}
            className="px-3.5 py-2 bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-xs font-semibold text-[#5D634C] hover:bg-[#E8E4DD] transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Live Audit (5m)</span>
          </button>

          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="px-3.5 py-2 bg-[#5D634C] text-[#FAF8F5] rounded-full text-xs font-semibold hover:bg-[#4A4F3C] transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Settings</span>
          </button>
        </div>
      </div>

      {/* 5. DIRECT EARNINGS STRIP */}
      <div className="p-5 rounded-[24px] bg-[#5D634C]/10 border border-[#5D634C]/25 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#5D634C] text-[#FAF8F5] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C2E29]">
              Total Fair Wage Escrow Disbursed
            </div>
            <div className="text-[11px] text-[#5D634C] font-semibold">
              Direct to {currentArtisan.name} Bank A/c • Verified by {currentArtisan.cooperativeName}
            </div>
          </div>
        </div>
        <div className="font-serif italic text-2xl font-bold text-[#5D634C]">
          {currentArtisan.totalPayouts}
        </div>
      </div>

      {/* 6. RECENT PRODUCTS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-xl font-bold text-[#2C2E29]">
            Recent Products
          </h2>
          <button
            onClick={() => navigate('/artisan/products')}
            className="text-xs text-[#BC8E6D] font-bold uppercase tracking-wider hover:underline cursor-pointer"
          >
            View All ({artisanProducts.length}) →
          </button>
        </div>

        {artisanProducts.length === 0 ? (
          <div className="bg-white border border-black/[0.03] rounded-2xl p-8 text-center space-y-3 craft-shadow-subtle">
            <div className="w-12 h-12 rounded-full bg-[#5D634C]/10 text-[#5D634C] mx-auto flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <p className="font-serif italic text-base font-bold text-[#2C2E29]">
              No products registered yet
            </p>
            <p className="text-xs text-[#73776A] max-w-md mx-auto">
              Register your first craft product to generate a Digital Product Passport and log your provenance timeline.
            </p>
            <button
              onClick={() => navigate('/artisan/register')}
              className="px-5 py-2.5 bg-[#5D634C] text-white text-xs font-bold rounded-full hover:bg-[#4A4F3C] transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {artisanProducts.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                onClick={() => navigate('verify-passport', prod.productId)}
                className="bg-white border border-black/[0.03] rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-[#5D634C]/40 transition-all cursor-pointer group craft-shadow-subtle"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <img
                    src={prod.primaryImage}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#DCD7CF] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#2C2E29]">{prod.productId}</span>
                      <span className="text-[10px] text-[#73776A]">• {prod.creationDate}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#2C2E29] truncate group-hover:text-[#5D634C] transition-colors">
                      {prod.name}
                    </h3>
                    <div className="text-[11px] text-[#73776A] truncate">
                      {prod.craftCategory} • {prod.productionDuration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <VerificationStatusTag status={prod.status} />
                  <ChevronRight className="w-4 h-4 text-[#73776A] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ArtisanPrivacyCenterModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <LiveVerificationModal
        isOpen={isLiveVerificationOpen}
        onClose={() => setIsLiveVerificationOpen(false)}
        artisanName={currentArtisan.name}
        cooperativeName={currentArtisan.cooperativeName}
      />

    </div>
  );
};
