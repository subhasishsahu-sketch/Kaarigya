import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Camera, 
  QrCode, 
  Share2, 
  Printer, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  Info, 
  Building2, 
  ArrowLeft,
  Award,
  Maximize2,
  FileCheck2,
  Lock,
  Video,
  Film
} from 'lucide-react';
import { TrustBadge, VerificationStatusTag } from '../common/TrustBadge';
import { SafeImage } from '../common/SafeImage';
import { PhysicalMatchModal } from './PhysicalMatchModal';
import { CounterfeitAlertView } from './CounterfeitAlertView';
import { ProvenanceMap } from '../location/ProvenanceMap';
import { CertificatePrintModal } from './CertificatePrintModal';
import { ShareModal } from './ShareModal';
import { ArtisanVoiceStoryPlayer } from './ArtisanVoiceStoryPlayer';

export const ProductPassportView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeProduct, 
    products, 
    setIsQRScannerOpen,
    setIsPhysicalMatchOpen,
    isPhysicalMatchOpen,
    showNotification,
    t
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState<number>(0);
  const [showTrustDetails, setShowTrustDetails] = useState<boolean>(false);
  const [showFullEvidenceModal, setShowFullEvidenceModal] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Scroll to top on load to fix blank screen illusions on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!activeProduct) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-[#73776A]">No product passport selected.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#5D634C] text-white rounded-full text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // If the product is flagged as counterfeit
  if (activeProduct.status === 'flagged' || activeProduct.productId === 'CRAFT-00999') {
    return <CounterfeitAlertView product={activeProduct} />;
  }

  const toggleAudioStory = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      showNotification(`Playing voice testimony in Odia/Hindi from ${activeProduct.artisan.name}`, 'info');
    }
  };

  const handlePrintCertificate = () => {
    setIsCertificateModalOpen(true);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD7CF] pb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-1.5 text-xs text-[#5D634C] hover:text-[#2C2E29] font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToCatalog}</span>
        </button>

        <div className="flex items-center space-x-2">
          
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-[#DCD7CF] rounded-full text-xs font-semibold text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#73776A]" />
            <span>{t.share}</span>
          </button>

          <button
            onClick={handlePrintCertificate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-[#DCD7CF] rounded-full text-xs font-semibold text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors hidden sm:inline-flex shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#73776A]" />
            <span>{t.printCertificate}</span>
          </button>

          <button
            onClick={() => setIsPhysicalMatchOpen(true)}
            className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#5D634C] text-[#FAF8F5] rounded-full text-xs font-semibold hover:bg-[#4A4F3C] transition-all shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.verifyPhysicalItem}</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE MASTER DIGITAL PRODUCT PASSPORT (Natural Tones Physical Certificate) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-black/[0.04] rounded-[36px] p-6 sm:p-10 craft-shadow-certificate space-y-10 relative overflow-hidden bg-parchment">
        
        {/* Subtle Watermark Stamp */}
        <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
          <div className="w-64 h-64 rounded-full border-4 border-[#5D634C] flex items-center justify-center font-serif italic text-6xl font-bold">
            क
          </div>
        </div>

        {/* 1. TOP HEADER & PASSPORT IDENTITY */}
        <div className="space-y-4 border-b border-[#E8E4DD] pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5D634C]" />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#73776A] uppercase">
                {t.tamperEvidentPassport}
              </span>
            </div>
            <VerificationStatusTag status={activeProduct.status} />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[10px] text-[#BC8E6D] font-bold uppercase tracking-[0.2em]">
                {activeProduct.craftCategory}
              </div>
              <h1 className="font-serif italic text-2xl sm:text-4xl font-bold text-[#2C2E29] tracking-tight mt-1">
                {activeProduct.name}
              </h1>
            </div>

            {/* Passport ID & Cryptographic Seal */}
            <div className="flex items-center space-x-3 bg-[#E8E4DD]/50 border border-[#DCD7CF] px-4 py-2.5 rounded-2xl text-right">
              <div>
                <div className="text-[9px] text-[#73776A] font-mono uppercase tracking-wider font-bold">{t.passportId}</div>
                <div className="text-sm font-mono font-bold text-[#2C2E29]">{activeProduct.productId}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#5D634C] text-white flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#E8E4DD]" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. MAIN GRID: PRODUCT IMAGE & CORE SPECIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Product Media Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-[#E8E4DD] border border-[#DCD7CF] group">
              <SafeImage
                src={activeProduct.evidenceImages[selectedEvidenceIndex]?.url || activeProduct.primaryImage}
                alt={activeProduct.name}
                craftCategory={activeProduct.craftCategory}
                productId={activeProduct.productId}
                className="w-full h-full object-cover"
              />
              
              {/* Image Label & Geotag */}
              <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-[#2C2E29]/85 text-[#FAF8F5] text-xs backdrop-blur-xs flex items-center justify-between">
                <span className="font-medium truncate">
                  {activeProduct.evidenceImages[selectedEvidenceIndex]?.label || "Master Craft Finished View"}
                </span>
                <span className="text-[10px] text-[#E8E4DD] shrink-0 font-mono">
                  {activeProduct.evidenceImages[selectedEvidenceIndex]?.geoTag || "Pipli Workshop"}
                </span>
              </div>
            </div>

            {/* Thumbnails of Evidence / Angle Photos */}
            {activeProduct.evidenceImages.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {activeProduct.evidenceImages.map((ev, idx) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvidenceIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedEvidenceIndex === idx ? 'border-[#5D634C] scale-105' : 'border-[#DCD7CF] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage 
                      src={ev.url} 
                      alt={ev.label} 
                      craftCategory={activeProduct.craftCategory}
                      productId={activeProduct.productId}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Specifications & Artisan Link */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                {t.craftHeritageProvenance}
              </h3>
              <p className="text-xs sm:text-sm text-[#2C2E29]/80 leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* 4 Essential Craft Data Points */}
            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-[#E8E4DD]/40 border border-[#DCD7CF] text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">{t.masterArtisan}</span>
                <div className="font-bold text-[#2C2E29]">{activeProduct.artisan.name}</div>
                <div className="text-[11px] text-[#73776A]">{activeProduct.artisan.experienceYears} Years Heritage</div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">{t.clusterOrigin}</span>
                <div className="font-bold text-[#2C2E29]">{activeProduct.artisan.location}</div>
                <div className="text-[11px] text-[#73776A]">{activeProduct.artisan.district}, {activeProduct.artisan.state}</div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">{t.craftDuration}</span>
                <div className="font-bold text-[#25352F]">{activeProduct.productionDuration}</div>
                <div className="text-[11px] text-[#73776A]">{t.hoursCraftwork}</div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">{t.cooperativeGuild}</span>
                <div className="font-bold text-[#2C2E29]">{activeProduct.artisan.cooperativeName}</div>
                <div className="text-[11px] text-[#5D634C] font-semibold">KYC Verified Guild</div>
              </div>
            </div>

            {/* Natural Materials Used */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                {t.materialsLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeProduct.materials.map((mat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white border border-[#DCD7CF] text-xs text-[#2C2E29] font-medium shadow-xs"
                  >
                    ✓ {mat}
                  </span>
                ))}
              </div>
            </div>

            {/* Techniques */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                {t.stepTechnique}
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeProduct.techniques.map((tec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white border border-[#DCD7CF] text-xs text-[#5D634C] font-medium shadow-xs"
                  >
                    • {tec}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 3. PROVENANCE & GEOGRAPHIC CLUSTER MAP */}
        <ProvenanceMap product={activeProduct} />

        {/* 4. TRUST LEVEL BREAKDOWN: WHY IS THIS TRUSTED? */}
        <div className="border-t border-[#E8E4DD] pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#5D634C]" />
                <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                  {t.trustIndexScore}
                </h3>
              </div>
              <p className="text-xs text-[#73776A]">
                {t.verifiedFactors}
              </p>
            </div>
            
            <TrustBadge score={activeProduct.trustLevel.score} maxScore={5.0} showDetails />
          </div>

          {/* 5-Factor Verified Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {activeProduct.trustLevel.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-4 rounded-2xl border border-black/[0.03] bg-white space-y-1 craft-shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {factor.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5D634C]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#BC8E6D]" />
                    )}
                    <span className="text-xs font-bold text-[#2C2E29]">{factor.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5D634C] bg-[#E8E4DD] px-2 py-0.5 rounded-full font-semibold">
                    {factor.authority}
                  </span>
                </div>
                <p className="text-xs text-[#73776A] leading-snug pl-6">
                  {factor.description}
                </p>
                <div className="text-[10px] text-[#73776A] font-mono pl-6 opacity-80">
                  Proof: {factor.evidenceType}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CRAFT IN THE MAKING — ARTISAN PROCESS VIDEO */}
        <div className="border-t border-[#E8E4DD] pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-[#5D634C]" />
                <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                  {t.craftInTheMaking || "CRAFT IN THE MAKING"}
                </h3>
              </div>
              <p className="text-xs text-[#73776A]">
                {t.watchMakingProcess || "Watch the artisan create this piece using traditional techniques."}
              </p>
            </div>

            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#5D634C]/15 text-[#5D634C] text-[10px] font-bold uppercase tracking-wider border border-[#5D634C]/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {activeProduct.processVideoStatus === 'VERIFIED'
                  ? (t.processVideoVerified || "Process Video: Verified")
                  : activeProduct.processVideoStatus === 'REJECTED'
                    ? (t.processVideoRejected || "Process Video: Rejected")
                    : (t.processVideoSubmitted || "Process Video: Submitted")}
              </span>
            </span>
          </div>

          {activeProduct.processVideoUrl ? (
            <div className="p-4 sm:p-6 bg-[#FAF8F5] border border-[#DCD7CF] rounded-[28px] space-y-3 craft-shadow-subtle">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-80 flex items-center justify-center">
                <video
                  src={activeProduct.processVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[#73776A] px-1 pt-1">
                <div className="flex items-center space-x-2">
                  <Film className="w-4 h-4 text-[#BC8E6D]" />
                  <span className="font-medium">Artisan Crafting Evidence • {activeProduct.artisan.name}</span>
                </div>
                {activeProduct.processVideoDuration && (
                  <span className="font-mono text-[11px] font-semibold bg-[#E8E4DD] px-2.5 py-0.5 rounded-full text-[#2C2E29]">
                    Duration: {Math.floor(activeProduct.processVideoDuration / 60).toString().padStart(2, '0')}:{(activeProduct.processVideoDuration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#73776A] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Film className="w-4 h-4 text-[#BC8E6D]" />
                <span>Process Evidence: Verified Benchwork Photos Attached to Passport</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D634C]">
                ✓ Photos Logged
              </span>
            </div>
          )}
        </div>

        {/* 5. THE ARTISAN'S VOICE STORY & HUMAN CONNECTION */}
        <div className="border-t border-[#E8E4DD] pt-8 space-y-4">
          <div className="bg-[#4A4F3C] text-[#FAF8F5] rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
            
            <div className="flex items-center space-x-4">
              <img
                src={activeProduct.artisan.avatar}
                alt={activeProduct.artisan.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#BC8E6D] shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#BC8E6D] font-bold">
                  {t.meetTheMaker}
                </span>
                <h4 className="font-serif italic text-xl font-bold text-[#FAF8F5]">
                  {activeProduct.artisan.name}
                </h4>
                <p className="text-xs text-[#E8E4DD] leading-relaxed max-w-md">
                  "{activeProduct.artisan.bio}"
                </p>
              </div>
            </div>

            {/* Listen to Multilingual Voice Story Player */}
            <ArtisanVoiceStoryPlayer artisan={activeProduct.artisan} />

          </div>
        </div>

        {/* 5. PROVENANCE TIMELINE */}
        <div className="border-t border-[#E8E4DD] pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                {t.provenanceChainOfCustody}
              </h3>
              <p className="text-xs text-[#73776A]">
                {t.provenanceTimeline}
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5D634C] font-bold bg-[#E8E4DD] px-3 py-1 rounded-full">
              {t.cryptographicallySealed}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCD7CF]">
            {activeProduct.provenanceTimeline.map((item, idx) => (
              <div key={item.id} className="relative space-y-1">
                
                {/* Node marker */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                  item.status === 'completed' ? 'border-[#5D634C] text-[#5D634C]' : 'border-[#BC8E6D] text-[#BC8E6D]'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#2C2E29]">{item.title}</span>
                    <span className="text-[10px] text-[#5D634C] bg-[#E8E4DD] px-2 py-0.5 rounded-full font-semibold">
                      {item.role}: {item.actor}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#73776A] font-mono">{item.date} • {item.timestamp}</span>
                </div>

                <p className="text-xs text-[#73776A] leading-relaxed">
                  {item.description}
                </p>

                {item.txRef && (
                  <div className="text-[10px] font-mono text-[#73776A]">
                    Ref: {item.txRef} ({item.location})
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* 6. TRANSPARENT VALUE DISTRIBUTION (FAIR COMPENSATION) */}
        <div className="border-t border-[#E8E4DD] pt-8 space-y-3">
          <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
            Transparent Fair Compensation
          </h3>
          <p className="text-xs text-[#73776A]">
            Direct financial distribution breakdown ensuring economic equity for the creator.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5D634C]">
                Direct to Master Artisan ({Math.round((activeProduct.price.artisanCompensation / activeProduct.price.retail)*100)}%)
              </span>
              <div className="font-serif italic text-2xl font-bold text-[#5D634C]">
                ₹{activeProduct.price.artisanCompensation.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#5D634C]/80">
                Direct UPI / Bank Escrow payout to {activeProduct.artisan.name}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-black/[0.03] space-y-1 craft-shadow-subtle">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#73776A]">
                Cooperative Guild ({Math.round((activeProduct.price.cooperativeShare / activeProduct.price.retail)*100)}%)
              </span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                ₹{activeProduct.price.cooperativeShare.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#73776A]">
                Quality inspection, insurance & welfare fund
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-black/[0.03] space-y-1 craft-shadow-subtle">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#73776A]">
                Materials & Logistics ({Math.round((activeProduct.price.rawMaterialsLogistics / activeProduct.price.retail)*100)}%)
              </span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                ₹{activeProduct.price.rawMaterialsLogistics.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#73776A]">
                Khadi cotton, mirror embellishments & packing
              </p>
            </div>
          </div>
        </div>

        {/* 7. CARE FOR YOUR CRAFT */}
        <div className="border-t border-[#E8E4DD] pt-8 space-y-3">
          <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
            Care for Your Craft
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {activeProduct.careInstructions.map((instruction, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-black/[0.03] bg-white text-xs text-[#2C2E29] flex items-start space-x-2.5 craft-shadow-subtle">
                <span className="text-[#5D634C] font-bold mt-0.5">•</span>
                <span>{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. QR CODE & CERTIFICATE STAMP FOOTER */}
        <div className="border-t border-[#E8E4DD] pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-2xl border border-[#DCD7CF] shadow-xs shrink-0">
              <SafeImage
                src={activeProduct.qrCodeUrl}
                alt="Product Passport QR"
                className="w-20 h-20 rounded-xl"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-[10px] text-[#BC8E6D] uppercase font-bold tracking-wider">Cryptographic Tag Identifier</span>
              <div className="font-mono text-sm font-bold text-[#2C2E29]">{activeProduct.productId}</div>
              <div className="font-mono text-[10px] text-[#73776A]">NFC UID: {activeProduct.nfcUid}</div>
              <div className="text-[10px] text-[#5D634C] font-semibold">✓ Verified on National Trust Node</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPhysicalMatchOpen(true)}
              className="px-6 py-3 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] transition-all shadow-xs"
            >
              Verify Physical Pattern Match
            </button>
          </div>
        </div>

      </div>

      {/* Physical Match Modal */}
      {isPhysicalMatchOpen && <PhysicalMatchModal product={activeProduct} />}

      {/* Certificate Print & Export Modal */}
      <CertificatePrintModal
        product={activeProduct}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        onShowNotification={showNotification}
      />

      {/* Multi-Channel Share Modal */}
      <ShareModal
        product={activeProduct}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowNotification={showNotification}
      />

    </div>
  );
};
