import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Award
} from 'lucide-react';
import { TrustBadge, VerificationStatusTag } from '../common/TrustBadge';
import { SafeImage } from '../common/SafeImage';

export const BuyerLanding: React.FC = () => {
  const navigate = useNavigate();
  const { 
    t, 
    setIsQRScannerOpen, 
    products, 
    setRole, 
    setActiveProductId,
    showNotification
  } = useApp();

  const [inputProductId, setInputProductId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputProductId.trim()) {
      const code = inputProductId.trim().toUpperCase();
      setActiveProductId(code);
      navigate('/verify-passport');
    } else {
      setActiveProductId('CRAFT-00124');
      navigate('/verify-passport');
    }
  };

  const categories = ['All', 'Appliqué & Needlework', 'Metalwork & Lost-Wax', 'Handloom & Silk', 'Woodcraft'];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.craftCategory.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]));

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. EDITORIAL TWO-COLUMN HERO SECTION */}
      <section className="relative overflow-hidden">
        
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#5D634C_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-12 md:py-16 lg:py-[64px] pb-[80px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(460px,500px)] gap-8 md:gap-12 lg:gap-[90px] items-center">
            
            {/* Left Column: Eyebrow, Headline, Description & CTAs */}
            <div className="space-y-6 max-w-[600px]">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8E4DD] border border-[#DCD7CF] text-[#5D634C] text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#BC8E6D]" />
                <span className="uppercase text-[10px] tracking-[0.2em] font-bold">Tamper-Evident Handcraft Provenance</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-[#5D634C] leading-[1.08] font-bold tracking-tight max-w-[600px]">
                {t.heroTitle}
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#73776A] max-w-[560px] leading-relaxed font-normal">
                {t.heroSubtitle}
              </p>

              {/* Primary & Secondary Action Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-[560px]">
                
                <button
                  onClick={() => setIsQRScannerOpen(true)}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#5D634C] text-[#FAF8F5] rounded-xl font-semibold text-sm hover:bg-[#4A4F3C] transition-all shadow-sm group h-12"
                >
                  <QrCode className="w-4 h-4 text-[#E8E4DD] group-hover:scale-105 transition-transform" />
                  <span>{t.scanProductBtn}</span>
                </button>

                <button
                  onClick={() => { setRole('artisan'); navigate('/artisan/register'); }}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white text-[#2C2E29] border border-[#DCD7CF] rounded-xl font-semibold text-sm hover:bg-[#E8E4DD] transition-all shadow-2xs h-12"
                >
                  <span>{t.registerProductBtn}</span>
                  <ArrowRight className="w-4 h-4 text-[#73776A]" />
                </button>

                <button
                  onClick={() => { setRole('artisan'); navigate('/artisan/dashboard'); }}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-3.5 text-xs text-[#5D634C] hover:text-[#2C2E29] font-bold uppercase tracking-wider h-12"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t.artisanLoginBtn}</span>
                </button>

              </div>

              {/* Instant Verification Search Field */}
              <form onSubmit={handleVerifySubmit} className="pt-2 max-w-[560px]">
                <div className="relative flex items-center shadow-2xs">
                  <Search className="w-4 h-4 text-[#73776A] absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={inputProductId}
                    onChange={(e) => setInputProductId(e.target.value)}
                    placeholder="Enter Product ID (e.g., CRAFT-00124)"
                    className="w-full pl-11 pr-28 py-3 text-xs bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] placeholder-[#73776A]/60 focus:outline-none focus:ring-1 focus:ring-[#5D634C] focus:border-[#5D634C] h-12"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-2 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-lg hover:bg-[#4A4F3C] transition-colors cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {/* Interactive Sample Passports */}
                <div className="pt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-[#73776A]">
                  <span className="font-semibold text-[#2C2E29]">Try sample passports:</span>
                  <button 
                    type="button" 
                    onClick={() => { setActiveProductId('CRAFT-00124'); navigate('/verify-passport'); }} 
                    className="px-2.5 py-1 rounded-full bg-white border border-[#DCD7CF] text-[#BC8E6D] font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Pipli Appliqué
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setActiveProductId('CRAFT-00125'); navigate('/verify-passport'); }} 
                    className="px-2.5 py-1 rounded-full bg-white border border-[#DCD7CF] text-[#BC8E6D] font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Dhokra Metal
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setActiveProductId('CRAFT-00126'); navigate('/verify-passport'); }} 
                    className="px-2.5 py-1 rounded-full bg-white border border-[#DCD7CF] text-[#BC8E6D] font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Sambalpuri Silk
                  </button>
                </div>
              </form>

            </div>

            {/* Right Column: Digital Passport Preview Card */}
            <div className="w-full flex justify-center lg:justify-end">
              
              <div className="w-full max-w-[500px]">
                
                <div className="bg-white border border-black/[0.04] rounded-[28px] p-6 craft-shadow-certificate space-y-4 relative overflow-hidden">
                  
                  {/* Watermark Seal */}
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-[#5D634C]/15 flex items-center justify-center pointer-events-none transform rotate-12">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#5D634C]/40 font-bold">
                      Kaarigya Verified
                    </span>
                  </div>

                  {/* Passport Header */}
                  <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#5D634C] flex items-center justify-center text-[#FAF8F5] text-[11px] font-serif font-bold">
                        क
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#73776A]">
                          Digital Product Passport
                        </div>
                        <div className="text-xs font-mono font-bold text-[#2C2E29]">
                          ID: CRAFT-00124
                        </div>
                      </div>
                    </div>
                    <VerificationStatusTag status="verified" />
                  </div>

                  {/* Product Photograph */}
                  <div className="relative h-48 rounded-xl overflow-hidden bg-[#E8E4DD]">
                    <SafeImage
                      src="https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80"
                      alt="Sacred Lotus Pipli Appliqué Tapestry"
                      craftCategory="Appliqué & Needlework"
                      productId="CRAFT-00124"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#2C2E29]/90 text-[#FAF8F5] text-[10px] font-semibold backdrop-blur-xs">
                      GI Tagged: Pipli Appliqué #GI-89
                    </div>
                  </div>

                  {/* Clean Label/Value Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#73776A] font-bold block">Master Artisan</span>
                      <span className="font-semibold text-[#2C2E29]">Sita Devi Mahapatra</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#73776A] font-bold block">Made in</span>
                      <span className="font-semibold text-[#2C2E29]">Pipli, Puri, Odisha</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#73776A] font-bold block">Handcrafted Time</span>
                      <span className="font-semibold text-[#2C2E29]">3 Days (24 Hours)</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#73776A] font-bold block">Artisan earnings</span>
                      <span className="font-semibold text-[#5D634C]">₹3,250 (65% of MRP)</span>
                    </div>
                  </div>

                  {/* Trust Score & Passport Link */}
                  <div className="pt-3 border-t border-[#E8E4DD] flex items-center justify-between">
                    <TrustBadge score={4.8} maxScore={5.0} />
                    <button
                      onClick={() => { setActiveProductId('CRAFT-00124'); navigate('/verify-passport'); }}
                      className="inline-flex items-center space-x-1 text-xs text-[#5D634C] font-bold hover:underline cursor-pointer"
                    >
                      <span>Explore Passport</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST / FEATURE STRIP: FOUR CORE PRINCIPLES */}
      <section className="bg-white/80 border-y border-[#DCD7CF] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 01 Provenance */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-2 border-l-4 border-l-[#5D634C]">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5D634C]">01 / Origin</span>
              <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">{t.provenanceTitle}</h3>
              <p className="text-xs text-[#73776A] leading-relaxed">
                {t.provenanceDesc}
              </p>
            </div>

            {/* 02 Authenticity */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-2 border-l-4 border-l-[#BC8E6D]">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#BC8E6D]">02 / Trust</span>
              <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">{t.authenticityTitle}</h3>
              <p className="text-xs text-[#73776A] leading-relaxed">
                {t.authenticityDesc}
              </p>
            </div>

            {/* 03 Maker Attribution */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-2 border-l-4 border-l-[#5D634C]">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5D634C]">03 / Artisan</span>
              <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">{t.attributionTitle}</h3>
              <p className="text-xs text-[#73776A] leading-relaxed">
                {t.attributionDesc}
              </p>
            </div>

            {/* 04 Fair Compensation */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-2 border-l-4 border-l-[#BC8E6D]">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#BC8E6D]">04 / Equity</span>
              <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">{t.compensationTitle}</h3>
              <p className="text-xs text-[#73776A] leading-relaxed">
                {t.compensationDesc}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
            Authentic • Traceable • Direct
          </span>
          <h2 className="font-serif italic text-2xl sm:text-4xl text-[#5D634C] font-bold">
            How Kaarigya Works
          </h2>
          <p className="text-xs sm:text-sm text-[#73776A]">
            From artisan hands to your home, every step is preserved with transparency and respect for the craft.
          </p>
        </div>

        {/* 4 Connected Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white rounded-[24px] p-6 border border-[#DCD7CF] space-y-3 craft-shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-[#E8E4DD] text-[#5D634C] font-serif italic font-bold text-base flex items-center justify-center">
              01
            </div>
            <h4 className="font-serif font-bold text-base text-[#2C2E29]">
              Artisan Records Craft
            </h4>
            <p className="text-xs text-[#73776A] leading-relaxed">
              Using simple voice narration in regional languages and workshop evidence photos, the artisan documents their craft origin.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-[24px] p-6 border border-[#DCD7CF] space-y-3 craft-shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-[#E8E4DD] text-[#5D634C] font-serif italic font-bold text-base flex items-center justify-center">
              02
            </div>
            <h4 className="font-serif font-bold text-base text-[#2C2E29]">
              Guild Verifies & Seals
            </h4>
            <p className="text-xs text-[#73776A] leading-relaxed">
              The cooperative confirms authentic handmade techniques, certifies fair wage floors, and seals a digital passport hash.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-[24px] p-6 border border-[#DCD7CF] space-y-3 craft-shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-[#E8E4DD] text-[#5D634C] font-serif italic font-bold text-base flex items-center justify-center">
              03
            </div>
            <h4 className="font-serif font-bold text-base text-[#2C2E29]">
              Buyer Discovers Story
            </h4>
            <p className="text-xs text-[#73776A] leading-relaxed">
              Anyone can scan the QR code to hear the maker's voice, verify cluster location, and inspect cryptographic authenticity.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-[24px] p-6 border border-[#DCD7CF] space-y-3 craft-shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-[#E8E4DD] text-[#5D634C] font-serif italic font-bold text-base flex items-center justify-center">
              04
            </div>
            <h4 className="font-serif font-bold text-base text-[#2C2E29]">
              Heritage Protection
            </h4>
            <p className="text-xs text-[#73776A] leading-relaxed">
              Shields authentic handcrafts from factory counterfeits and safeguards traditional artisan livelihoods across India.
            </p>
          </div>

        </div>
      </section>

      {/* 4. PRODUCT CATALOG GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DCD7CF] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
              Curated Craft Catalog
            </span>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-[#5D634C] font-bold">
              Authentic Indian Handicrafts with Live Passports
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-xs rounded-xl border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#5D634C] text-[#FAF8F5] border-[#5D634C] font-semibold'
                    : 'bg-white text-[#73776A] border-[#DCD7CF] hover:bg-[#E8E4DD]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => { setActiveProductId(product.productId); navigate('/verify-passport'); }}
              className="bg-white border border-[#DCD7CF] rounded-[24px] overflow-hidden craft-shadow-subtle hover:border-[#5D634C]/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative h-56 overflow-hidden bg-[#E8E4DD]">
                  <SafeImage
                    src={product.primaryImage}
                    alt={product.name}
                    craftCategory={product.craftCategory}
                    productId={product.productId}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <VerificationStatusTag status={product.status} />
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#2C2E29]/90 text-[#FAF8F5] text-[10px] font-mono font-medium">
                    {product.productId}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <div className="text-[10px] text-[#BC8E6D] font-bold uppercase tracking-[0.2em]">
                    {product.craftCategory}
                  </div>
                  <h3 className="font-serif italic text-lg font-bold text-[#2C2E29] group-hover:text-[#5D634C] transition-colors leading-snug">
                    {product.name}
                  </h3>

                  {/* Artisan Mini Profile */}
                  <div className="flex items-center space-x-2.5 pt-1">
                    <SafeImage
                      src={product.artisan.avatar}
                      alt={product.artisan.name}
                      isAvatar={true}
                      artisanName={product.artisan.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#DCD7CF]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#2C2E29] block leading-none">{product.artisan.name}</span>
                      <span className="text-[10px] text-[#73776A]">{product.artisan.location}, {product.artisan.state}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#73776A] line-clamp-2 leading-relaxed pt-1">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Footer Row */}
              <div className="px-6 py-4 border-t border-[#E8E4DD] flex items-center justify-between text-xs">
                <TrustBadge score={product.trustLevel.score} maxScore={5.0} />
                <span className="text-[#5D634C] font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>View Passport</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          ))}
        </div>

      </section>

    </div>
  );
};
