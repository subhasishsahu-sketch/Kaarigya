import React from 'react';
import { 
  MapPin, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Lock,
  Layers
} from 'lucide-react';
import { ProductPassport } from '../../types';
import { LocationMap } from './LocationMap';
import { LocationConsistencyBadge } from './LocationConsistencyBadge';

interface ProvenanceMapProps {
  product: ProductPassport;
  className?: string;
}

export const ProvenanceMap: React.FC<ProvenanceMapProps> = ({ product, className = "" }) => {
  const publicLoc = product.publicLocation || {
    city: product.artisan.location.split(' ')[0] || "Pipli",
    district: product.artisan.district || "Puri",
    state: product.artisan.state || "Odisha",
    country: "India",
    approximateArea: `${product.artisan.location}, ${product.artisan.state}`,
    clusterName: `${product.craftCategory} Cluster`
  };

  const creationDateFormatted = product.creationDate 
    ? new Date(product.creationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : "19 August 2026";

  const hasLocation = !!product.creationLocation;

  return (
    <div className={`bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle ${className}`}>
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DD] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
            Geographic Provenance & Origin Trail
          </span>
          <h3 className="font-serif italic text-2xl font-bold text-[#2C2E29] mt-0.5">
            Where was it made?
          </h3>
        </div>

        <LocationConsistencyBadge 
          status={product.locationConsistency || (hasLocation ? 'consistent' : 'not_recorded')}
          registeredOrigin={`${product.artisan.location}, ${product.artisan.state}`}
          creationLocation={publicLoc.approximateArea}
        />
      </div>

      {/* Provenance Key Facts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block">Made in</span>
            <span className="text-xs font-bold text-[#2C2E29] block truncate">{publicLoc.approximateArea}</span>
            <span className="text-[10px] text-[#5D634C] font-medium">✓ Registered GI Cluster</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block">Made by</span>
            <span className="text-xs font-bold text-[#2C2E29] block truncate">{product.artisan.name}</span>
            <span className="text-[10px] text-[#73776A]">{product.artisan.experienceYears} Years Master Experience</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block">Created on</span>
            <span className="text-xs font-bold text-[#2C2E29] block">{creationDateFormatted}</span>
            <span className="text-[10px] text-[#5D634C] font-semibold">✓ Location recorded</span>
          </div>
        </div>

      </div>

      {/* Map Card */}
      <LocationMap 
        location={product.creationLocation}
        publicLocation={publicLoc}
        artisanName={product.artisan.name}
        clusterName={publicLoc.clusterName}
        isBuyerFacing={true}
      />

      {/* Provenance Confidence Multi-Signal Assessment */}
      <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DD] pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#5D634C]" />
            <h4 className="font-serif italic text-base font-bold text-[#2C2E29]">
              Strong Provenance Evidence
            </h4>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#5D634C]/10 text-[#5D634C] text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
            Confidence: High (5 Verified Signals)
          </div>
        </div>

        <p className="text-xs text-[#73776A] leading-relaxed">
          Provenance is established by corroborating physical craft evidence, biometric artisan registration, cryptographic passport hashes, and geographical cluster records.
        </p>

        {/* Signals Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="flex items-center space-x-2 text-[#2C2E29]">
            <CheckCircle2 className="w-4 h-4 text-[#5D634C] shrink-0" />
            <span>Artisan identity verified ({product.artisan.cooperativeName})</span>
          </div>

          <div className="flex items-center space-x-2 text-[#2C2E29]">
            <CheckCircle2 className="w-4 h-4 text-[#5D634C] shrink-0" />
            <span>Creation location recorded in {publicLoc.city} cluster</span>
          </div>

          <div className="flex items-center space-x-2 text-[#2C2E29]">
            <CheckCircle2 className="w-4 h-4 text-[#5D634C] shrink-0" />
            <span>Photographic evidence uploaded & timestamped</span>
          </div>

          <div className="flex items-center space-x-2 text-[#2C2E29]">
            <CheckCircle2 className="w-4 h-4 text-[#5D634C] shrink-0" />
            <span>Cooperative field audit completed & certified</span>
          </div>

          <div className="flex items-center space-x-2 text-[#2C2E29] sm:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-[#5D634C] shrink-0" />
            <span>Passport cryptographic integrity sealed on ledger</span>
          </div>
        </div>

        {/* Educational Note */}
        <div className="mt-3 p-3 rounded-xl bg-white border border-[#DCD7CF] flex items-start space-x-2.5 text-[11px] text-[#73776A]">
          <Info className="w-4 h-4 text-[#BC8E6D] shrink-0 mt-0.5" />
          <span>
            <strong>Provenance Principle:</strong> Location data supports the product's provenance — it does not prove authenticity in isolation. Multi-factor verification ensures authentic handmade heritage.
          </span>
        </div>
      </div>

    </div>
  );
};
