import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Award, 
  MapPin, 
  TrendingUp, 
  Package, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  XCircle,
  Filter,
  Check,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ArtisanProfile } from '../../types';
import { LocationMap } from '../location/LocationMap';
import { SafeImage } from '../common/SafeImage';

export const ArtisanManagement: React.FC = () => {
  const navigate = useNavigate();
  const { artisans, products, setActiveProductId, currentUser, acceptArtisan, rejectArtisan, t } = useApp();
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanProfile | null>(artisans[0] || null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Routing: Current logged in cooperative's ID
  const myCoopId = currentUser?.id || '11111111-1111-1111-1111-111111111111';

  // Strict Cooperative Routing: Filter pending artisans for THIS cooperative only
  const pendingRequests = artisans.filter(a => {
    if (a.verificationStatus !== 'PENDING') return false;
    // Match cooperative ID or fallback for demo seed cooperatives
    return (
      a.cooperativeId === myCoopId || 
      (myCoopId === '11111111-1111-1111-1111-111111111111' && (a.cooperativeId === 'COOP-OD-1984-092' || a.cooperativeId === 'COOP-OD-042')) ||
      (myCoopId === '22222222-2222-2222-2222-222222222222' && (a.cooperativeId === 'COOP-CG-1996-310' || a.cooperativeId === 'COOP-CG-108'))
    );
  });

  const verifiedArtisans = artisans.filter(a => a.verificationStatus !== 'PENDING' && a.verificationStatus !== 'REJECTED');

  const filteredArtisans = verifiedArtisans.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.title.toLowerCase().includes(q);
  });

  const artisanProducts = selectedArtisan 
    ? products.filter(p => p.artisan.id === selectedArtisan.id || p.artisan.name === selectedArtisan.name)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD7CF] pb-4">
        <div>
          <button
            onClick={() => navigate('/coop/overview')}
            className="inline-flex items-center space-x-1.5 text-xs text-[#73776A] hover:text-[#2C2E29] font-bold uppercase tracking-wider mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.overview}</span>
          </button>
          <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
            {t.navArtisans} — Cooperative Verification & Registry
          </h1>
          <p className="text-xs text-[#73776A]">
            Review artisan registration requests, approve Kalakriti Artisan IDs, and manage active guild members.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {pendingRequests.length > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] border border-[#BC8E6D]/30 uppercase tracking-wider animate-pulse">
              {pendingRequests.length} Pending Approval
            </span>
          )}
          <div className="text-xs font-bold px-4 py-2 rounded-full bg-[#5D634C]/10 text-[#5D634C] border border-[#5D634C]/25 uppercase tracking-wider">
            {verifiedArtisans.length} Active Verified Artisans
          </div>
        </div>
      </div>

      {/* PENDING ARTISAN REQUESTS SECTION */}
      <div className="bg-[#FAF8F5] border border-[#BC8E6D]/40 rounded-[32px] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#BC8E6D]/20 text-[#BC8E6D] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif italic text-lg sm:text-xl font-bold text-[#2C2E29]">
                PENDING ARTISAN REQUESTS ({pendingRequests.length})
              </h2>
              <p className="text-xs text-[#73776A]">
                Newly registered artisans requesting membership approval in your Cooperative Guild.
              </p>
            </div>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#73776A] bg-white rounded-2xl border border-black/[0.03]">
            ✓ No pending artisan registration requests for your Cooperative at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((art) => (
              <div 
                key={art.id}
                className="bg-white border border-[#DCD7CF] rounded-2xl p-4 space-y-3 hover:border-[#BC8E6D] transition-all craft-shadow-subtle"
              >
                <div className="flex items-start space-x-3">
                  <SafeImage
                    src={art.avatar}
                    alt={art.name}
                    isAvatar={true}
                    artisanName={art.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#DCD7CF] shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2C2E29] truncate">{art.name}</h4>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        STATUS: PENDING
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#5D634C] truncate">{art.title || art.craftTradition}</p>
                    <p className="text-[10px] text-[#73776A] truncate">
                      {art.location}, {art.district}, {art.state} • {art.experienceYears} Yrs Exp
                    </p>
                    <p className="text-[10px] text-[#9A9E93] truncate">
                      Email: {art.email} • Phone: {art.phone}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E4DD] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#73776A] italic">
                    Requires Guild Verification
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => rejectArtisan(art.id)}
                      className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full hover:bg-rose-100 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>[REJECT]</span>
                    </button>
                    <button
                      onClick={() => acceptArtisan(art.id)}
                      className="px-4 py-1.5 bg-[#5D634C] text-white text-xs font-bold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>[ACCEPT]</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Artisans List */}
        <div className="lg:col-span-5 bg-white border border-black/[0.03] rounded-[32px] p-6 space-y-4 craft-shadow-subtle">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#73776A] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artisan by name or cluster..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
            />
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredArtisans.map((art) => {
              const isSelected = selectedArtisan?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArtisan(art)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#E8E4DD] border-[#5D634C] shadow-xs'
                      : 'bg-[#FAF8F5] border-black/[0.03] hover:bg-[#E8E4DD]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <SafeImage
                      src={art.avatar}
                      alt={art.name}
                      isAvatar={true}
                      artisanName={art.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#DCD7CF] shrink-0"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-[#2C2E29] truncate">{art.name}</h4>
                        <span className="text-[10px] text-[#5D634C] font-semibold bg-[#5D634C]/10 px-2 py-0.5 rounded-full">✓ KYC</span>
                      </div>
                      <p className="text-[11px] text-[#73776A] truncate">{art.title}</p>
                      <div className="text-[10px] text-[#73776A]">
                        {art.location} • {art.experienceYears} Yrs Experience
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#73776A] shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Artisan In-Depth Profile */}
        {selectedArtisan ? (
          <div className="lg:col-span-7 bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-[#E8E4DD] pb-6">
              <SafeImage
                src={selectedArtisan.avatar}
                alt={selectedArtisan.name}
                isAvatar={true}
                artisanName={selectedArtisan.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#5D634C] shadow-sm shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                    {selectedArtisan.name}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-[#5D634C]/10 text-[#5D634C] text-[10px] font-bold border border-[#5D634C]/25">
                    KYC Verified
                  </span>
                  {selectedArtisan.kalakritiArtisanId && (
                    <span className="px-3 py-1 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] text-[10px] font-mono font-bold border border-[#BC8E6D]/30">
                      ID: {selectedArtisan.kalakritiArtisanId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#BC8E6D] font-bold uppercase tracking-wider">{selectedArtisan.title}</p>
                <div className="text-xs text-[#73776A] flex items-center justify-center sm:justify-start space-x-2 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5D634C]" />
                  <span>{selectedArtisan.location}, {selectedArtisan.state}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-black/[0.03] space-y-1 craft-shadow-subtle">
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Cataloged Passports</span>
                <div className="font-serif italic text-xl font-bold text-[#2C2E29]">{selectedArtisan.totalProducts}</div>
              </div>

              <div className="p-4 bg-[#5D634C]/10 rounded-2xl border border-[#5D634C]/25 space-y-1">
                <span className="text-[10px] text-[#5D634C] uppercase font-bold tracking-wider">Total Wage Disbursed</span>
                <div className="font-serif italic text-xl font-bold text-[#5D634C]">{selectedArtisan.totalPayouts}</div>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-black/[0.03] space-y-1 craft-shadow-subtle">
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Trust Rating</span>
                <div className="font-serif italic text-xl font-bold text-[#2C2E29]">{selectedArtisan.rating} / 5.0</div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                Craft Heritage & Bio
              </h3>
              <p className="text-xs text-[#2C2E29]/80 leading-relaxed">
                {selectedArtisan.bio}
              </p>
            </div>

            {/* Registered Workshop Cluster Map */}
            <div className="space-y-2 pt-1">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                Registered Workshop & Craft Cluster
              </h3>
              <LocationMap 
                locationName={`${selectedArtisan.location}, ${selectedArtisan.state}`}
                clusterName={`${selectedArtisan.district} Artisan Guild Cluster`}
                heightClass="h-44"
                mode="approximate"
              />
            </div>

            {/* Registered Products by this Artisan */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                Registered Products in Ledger ({artisanProducts.length})
              </h3>
              
              <div className="space-y-2.5">
                {artisanProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => { setActiveProductId(p.productId); navigate('/verify-passport'); }}
                    className="p-3.5 bg-[#FAF8F5] border border-black/[0.03] rounded-2xl flex items-center justify-between hover:border-[#5D634C]/40 transition-colors cursor-pointer group craft-shadow-subtle"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img src={p.primaryImage} alt={p.name} className="w-11 h-11 rounded-xl object-cover" />
                      <div>
                        <span className="text-[10px] font-mono text-[#73776A]">{p.productId}</span>
                        <h5 className="text-xs font-bold text-[#2C2E29] group-hover:text-[#5D634C]">{p.name}</h5>
                      </div>
                    </div>
                    <span className="text-xs text-[#5D634C] font-semibold">
                      ₹{p.price.artisanCompensation.toLocaleString()} (Artisan Share)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};
