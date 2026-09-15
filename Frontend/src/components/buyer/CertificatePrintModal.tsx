import React, { useState, useRef } from 'react';
import { ProductPassport } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Award, 
  MapPin, 
  Calendar, 
  Sparkles,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface CertificatePrintModalProps {
  product: ProductPassport;
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  product,
  isOpen,
  onClose,
  onShowNotification
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
    onShowNotification('Print dialog opened for authentic craft certificate', 'info');
  };

  const handleCopySummary = () => {
    const summary = `=== KALASÈTU OFFICIAL CERTIFICATE OF AUTHENTICITY ===
Product: ${product.name}
Passport ID: ${product.productId}
NFC Tag UID: ${product.nfcUid}
Craft Category: ${product.craftCategory}
Master Artisan: ${product.artisan.name} (${product.artisan.craftTradition})
Cooperative Guild: ${product.artisan.cooperativeName}
Origin: ${product.publicLocation?.approximateArea || product.artisan.location}
Creation Date: ${product.creationDate}
Artisan Wage Floor: ₹${product.price.artisanCompensation.toLocaleString()} (${Math.round((product.price.artisanCompensation / product.price.retail) * 100)}% of Retail ₹${product.price.retail.toLocaleString()})
Verification Status: ${product.status.toUpperCase()} (Tamper-Evident Protected)
Verify Online: ${window.location.origin}?passport=${product.productId}`;

    navigator.clipboard?.writeText(summary);
    setCopiedSummary(true);
    onShowNotification('Certificate verification summary copied to clipboard', 'success');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleCopyHash = () => {
    const mockHash = `0x9a8f2e4b7c1d3e5a6f8b0c2d4e6f8a0b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e0f`;
    navigator.clipboard?.writeText(mockHash);
    setCopiedHash(true);
    onShowNotification('Provenance cryptographic hash copied', 'success');
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2C2E29]/80 backdrop-blur-sm overflow-y-auto animate-fade-in print:bg-white print:p-0 print:static print:overflow-visible">
      <div className="bg-[#FAF8F5] border border-[#DCD7CF] rounded-[32px] max-w-4xl w-full my-auto overflow-hidden shadow-2xl space-y-0 print:border-none print:shadow-none print:rounded-none print:max-w-none">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DD] bg-white print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5D634C]/15 text-[#5D634C] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2C2E29]">Official Certificate of Authenticity</h2>
              <p className="text-[11px] text-[#73776A]">Ready for high-resolution printing & documentation</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF8F5] border border-[#DCD7CF] text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors"
              title="Copy verification summary"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-[#5D634C]" /> : <Copy className="w-3.5 h-3.5 text-[#73776A]" />}
              <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#5D634C] text-[#FAF8F5] hover:bg-[#4A4F3C] shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#DCD7CF] flex items-center justify-center text-[#73776A] hover:text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE PRINTABLE CERTIFICATE DOCUMENT BODY */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          <div 
            ref={certificateRef}
            id="printable-certificate" 
            className="bg-white border-8 border-double border-[#5D634C]/40 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-sm print:border-8 print:border-double print:border-[#5D634C] print:shadow-none print:rounded-none"
          >
            {/* Ornate Corner Accents */}
            <div className="absolute top-2 left-2 text-[#5D634C]/40 font-serif text-lg select-none">❖</div>
            <div className="absolute top-2 right-2 text-[#5D634C]/40 font-serif text-lg select-none">❖</div>
            <div className="absolute bottom-2 left-2 text-[#5D634C]/40 font-serif text-lg select-none">❖</div>
            <div className="absolute bottom-2 right-2 text-[#5D634C]/40 font-serif text-lg select-none">❖</div>

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="font-serif italic text-9xl font-bold">KALAKRITI</span>
            </div>

            {/* 1. Header & Government GI Registry Seal */}
            <div className="text-center space-y-2 border-b-2 border-[#5D634C]/20 pb-6 relative">
              <div className="flex items-center justify-center space-x-3 mb-1">
                <div className="w-10 h-10 rounded-full border border-[#BC8E6D] bg-[#FAF8F5] flex items-center justify-center text-[#BC8E6D] shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold tracking-[0.25em] text-[#5D634C] uppercase">
                    National Handicraft Provenance Registry
                  </div>
                  <div className="text-xs font-serif font-bold text-[#2C2E29]">
                    Kalakriti Provenance & GI Verification
                  </div>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2E29] tracking-wide uppercase pt-1">
                Certificate of Authenticity
              </h1>
              <p className="text-xs text-[#73776A] max-w-lg mx-auto italic font-serif">
                This document certifies that the handicraft described herein is an authentic, verified piece created through registered traditional techniques.
              </p>
            </div>

            {/* 2. Primary Product Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6 items-center">
              
              {/* Product Photo & Tag Stamp */}
              <div className="sm:col-span-4 text-center space-y-2">
                <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden border-2 border-[#DCD7CF] shadow-xs bg-[#FAF8F5]">
                  <SafeImage
                    src={product.primaryImage}
                    alt={product.name}
                    craftCategory={product.craftCategory}
                    productId={product.productId}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[10px] font-mono font-bold text-[#5D634C] bg-[#5D634C]/10 px-2 py-0.5 rounded-full inline-block">
                  {product.productId}
                </div>
              </div>

              {/* Core Details */}
              <div className="sm:col-span-8 space-y-3 text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#BC8E6D]">
                    {product.craftCategory}
                  </span>
                  <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-[#2C2E29]">
                    {product.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-[#73776A] block text-[10px] uppercase font-semibold">Master Artisan</span>
                    <strong className="text-[#2C2E29]">{product.artisan.name}</strong>
                  </div>
                  <div>
                    <span className="text-[#73776A] block text-[10px] uppercase font-semibold">Cooperative Guild</span>
                    <strong className="text-[#2C2E29] truncate block">{product.artisan.cooperativeName}</strong>
                  </div>
                  <div>
                    <span className="text-[#73776A] block text-[10px] uppercase font-semibold">Geographical Origin</span>
                    <strong className="text-[#2C2E29]">{product.publicLocation?.approximateArea || product.artisan.location}</strong>
                  </div>
                  <div>
                    <span className="text-[#73776A] block text-[10px] uppercase font-semibold">Creation Date</span>
                    <strong className="text-[#2C2E29]">{product.creationDate}</strong>
                  </div>
                </div>

                {/* Materials & Technique */}
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E4DD] text-[11px] space-y-1">
                  <div>
                    <strong className="text-[#2C2E29]">Registered Materials:</strong>{' '}
                    <span className="text-[#73776A]">{product.materials.join(', ')}</span>
                  </div>
                  <div>
                    <strong className="text-[#2C2E29]">Authentic Technique:</strong>{' '}
                    <span className="text-[#73776A]">{product.techniques.join(' • ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Wage & Fair Compensation Seal */}
            <div className="my-5 p-3.5 rounded-xl bg-[#5D634C]/10 border border-[#5D634C]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#5D634C]" />
                <div>
                  <div className="font-bold text-[#2C2E29]">Direct Artisan Wage Floor Guarantee</div>
                  <div className="text-[11px] text-[#73776A]">Verified through Cooperative Banking smart registry</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#5D634C]">Artisan Compensation</span>
                <div className="font-serif italic font-bold text-base text-[#2C2E29]">
                  ₹{product.price.artisanCompensation.toLocaleString()} ({Math.round((product.price.artisanCompensation / product.price.retail) * 100)}% of Retail)
                </div>
              </div>
            </div>

            {/* 4. Verification Stamp, Signatures & QR Seal */}
            <div className="border-t-2 border-[#5D634C]/20 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center sm:text-left">
              
              {/* QR Code & Digital Hash */}
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-white border border-[#DCD7CF] rounded-lg shrink-0">
                  <SafeImage
                    src={product.qrCodeUrl}
                    alt="Passport QR"
                    className="w-16 h-16"
                  />
                </div>
                <div className="text-left space-y-0.5">
                  <div className="text-[9px] font-bold text-[#73776A] uppercase">Tamper-Evident ID</div>
                  <div className="text-[11px] font-mono font-bold text-[#2C2E29]">{product.productId}</div>
                  <div className="text-[9px] font-mono text-[#73776A]">NFC: {product.nfcUid}</div>
                  <button 
                    onClick={handleCopyHash}
                    className="text-[9px] text-[#5D634C] hover:underline flex items-center space-x-1 font-mono print:hidden cursor-pointer"
                  >
                    <span>{copiedHash ? '✓ Hash Copied' : 'Copy SHA-256'}</span>
                  </button>
                </div>
              </div>

              {/* Artisan Signature */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-lg text-[#2C2E29] border-b border-dashed border-[#73776A] pb-1 px-4">
                  {product.artisan.name}
                </div>
                <div className="text-[9px] uppercase font-bold text-[#73776A]">
                  Master Artisan Signature
                </div>
              </div>

              {/* Cooperative Guild Seal */}
              <div className="text-center sm:text-right space-y-1">
                <div className="inline-block border-2 border-[#5D634C] text-[#5D634C] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  ✓ Guild Verified
                </div>
                <div className="text-[9px] uppercase font-bold text-[#73776A]">
                  Audited by {product.artisan.cooperativeName}
                </div>
              </div>

            </div>

            {/* Certificate Footer Notice */}
            <div className="mt-6 pt-4 border-t border-[#E8E4DD] text-center text-[9px] text-[#73776A]">
              Issued under the National Artisan Protection Framework • Immutable Electronic Record #KS-{product.productId}
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="p-4 bg-white border-t border-[#E8E4DD] flex items-center justify-between text-xs text-[#73776A] print:hidden">
          <span>Formatted for standard A4 / Letter paper with color & monochrome print support.</span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#5D634C] text-white font-semibold hover:bg-[#4A4F3C] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
