import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Award, 
  MapPin, 
  Building2, 
  Phone, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { SafeImage } from '../common/SafeImage';

export const ArtisanProfileView: React.FC = () => {
  const { currentArtisan, navigate, t } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <button
        onClick={() => navigate('artisan-dashboard')}
        className="inline-flex items-center space-x-1 text-xs text-[#765C48] hover:text-[#25352F] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t.dashboard}</span>
      </button>

      {/* Main Profile Card */}
      <div className="bg-[#FAF7F2] border border-[#D5C9B8] rounded-xl p-6 sm:p-8 space-y-6 craft-shadow-subtle">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <SafeImage
            src={currentArtisan.avatar}
            alt={currentArtisan.name}
            isAvatar={true}
            artisanName={currentArtisan.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#B85C45] shadow-md shrink-0"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#25352F]">
                {currentArtisan.name}
              </h1>
              {currentArtisan.verificationStatus === 'VERIFIED' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F2EC] text-[#3F7654] text-xs font-bold border border-[#BDE0CB]">
                  ✓ VERIFIED ARTISAN
                </span>
              ) : currentArtisan.verificationStatus === 'REJECTED' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                  ✕ REJECTED BY GUILD
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                  ⏳ PENDING APPROVAL
                </span>
              )}
              {currentArtisan.kalakritiArtisanId && (
                <span className="px-3 py-0.5 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] text-xs font-mono font-bold border border-[#BC8E6D]/30">
                  ID: {currentArtisan.kalakritiArtisanId}
                </span>
              )}
            </div>
            <p className="text-xs text-[#765C48] font-medium">
              {currentArtisan.title}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#6F746F] pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#B85C45]" />
                <span>{currentArtisan.location}, {currentArtisan.district}, {currentArtisan.state}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#3D5268]" />
                <span>{currentArtisan.cooperativeName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bio & Craft Tradition */}
        <div className="border-t border-[#E9E0D2] pt-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#765C48]">
            {t.craftHeritageProvenance}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A504B] leading-relaxed">
            {currentArtisan.bio}
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-[#E9E0D2]/40 rounded-lg border border-[#D5C9B8] space-y-1">
            <span className="text-[10px] text-[#6F746F] uppercase font-semibold">Experience</span>
            <div className="font-serif text-lg font-bold text-[#25352F]">{currentArtisan.experienceYears} Years</div>
          </div>

          <div className="p-3 bg-[#E9E0D2]/40 rounded-lg border border-[#D5C9B8] space-y-1">
            <span className="text-[10px] text-[#6F746F] uppercase font-semibold">{t.navProducts}</span>
            <div className="font-serif text-lg font-bold text-[#25352F]">{currentArtisan.totalProducts}</div>
          </div>

          <div className="p-3 bg-[#E8F2EC] rounded-lg border border-[#BDE0CB] space-y-1">
            <span className="text-[10px] text-[#3F7654] uppercase font-semibold">{t.artisanDirectPayout}</span>
            <div className="font-serif text-lg font-bold text-[#3F7654]">{currentArtisan.totalPayouts}</div>
          </div>

          <div className="p-3 bg-[#E9E0D2]/40 rounded-lg border border-[#D5C9B8] space-y-1">
            <span className="text-[10px] text-[#6F746F] uppercase font-semibold">{t.trustIndexScore}</span>
            <div className="font-serif text-lg font-bold text-[#25352F]">{currentArtisan.rating} / 5.0</div>
          </div>
        </div>

        {/* Verified Guild Credentials */}
        <div className="border-t border-[#E9E0D2] pt-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#765C48]">
            Government & Cooperative Affiliations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-[#D5C9B8] bg-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#B85C45]" />
              <div>
                <div className="font-bold text-[#25352F]">National Handicrafts Registry</div>
                <div className="text-[10px] text-[#6F746F]">Reg ID: OD-ART-8821</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[#D5C9B8] bg-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#3F7654]" />
              <div>
                <div className="font-bold text-[#25352F]">Direct PFMS / UPI Escrow Link</div>
                <div className="text-[10px] text-[#3F7654]">A/c Verified (State Bank of India)</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
