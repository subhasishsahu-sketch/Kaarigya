// src/components/label/AuthenticationLabel.tsx
// Visual React Component & Canvas Exporter for the Kalakriti Physical Authentication Label

import React, { useRef, useEffect, useState } from 'react';
import { Download, Printer, QrCode, Sparkles, Check, Copy } from 'lucide-react';
import { 
  renderAuthenticationLabelCanvas, 
  downloadCanvasAsPng, 
  downloadQrDataUrl, 
  printCanvasLabel, 
  LabelData 
} from '../../utils/labelGenerator';

interface AuthenticationLabelProps {
  productId: string; // 7-character ID
  productTitle?: string;
  qrCodeDataUrl: string;
  fingerprintImageDataUrl?: string;
  verificationUrl?: string;
  className?: string;
  onCopied?: () => void;
}

export const AuthenticationLabel: React.FC<AuthenticationLabelProps> = ({
  productId,
  productTitle,
  qrCodeDataUrl,
  fingerprintImageDataUrl,
  verificationUrl,
  className = '',
  onCopied
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const labelData: LabelData = {
    productId,
    productTitle,
    qrCodeDataUrl,
    fingerprintImageDataUrl,
    verificationUrl
  };

  // Re-render canvas whenever data changes
  useEffect(() => {
    if (canvasRef.current && qrCodeDataUrl) {
      renderAuthenticationLabelCanvas(canvasRef.current, labelData).catch(err => {
        console.warn('Canvas render error:', err);
      });
    }
  }, [productId, qrCodeDataUrl, fingerprintImageDataUrl]);

  const handleDownloadLabel = async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);
    try {
      await renderAuthenticationLabelCanvas(canvasRef.current, labelData);
      downloadCanvasAsPng(canvasRef.current, `KALAKRITI_LABEL_${productId}.png`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQr = () => {
    if (qrCodeDataUrl) {
      downloadQrDataUrl(qrCodeDataUrl, `KALAKRITI_QR_${productId}.png`);
    }
  };

  const handlePrint = async () => {
    if (!canvasRef.current) return;
    await renderAuthenticationLabelCanvas(canvasRef.current, labelData);
    printCanvasLabel(canvasRef.current);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(productId);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Hidden high-res canvas used for 300 DPI exports */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Visual Label Card replicating the reference design */}
      <div className="relative w-full max-w-2xl mx-auto bg-[#FAF7F2] border-2 border-[#D9CFBE] rounded-3xl p-4 sm:p-7 shadow-lg overflow-hidden select-none font-sans">
        
        {/* Subtle background luxury texture glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#B38B42]/5 pointer-events-none" />

        {/* Main Grid: Left (Fingerprint) & Right (Branding + QR) */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
          
          {/* LEFT SIDE: Physical Fingerprint / Microstructure */}
          <div className="flex flex-col items-center justify-center p-2">
            
            {/* Fingerprint Framing Box with 4 Golden Corner Brackets */}
            <div className="relative w-full aspect-[4/3] max-h-56 bg-[#F2ECE1] rounded-lg overflow-hidden border border-[#E2D8C7] flex items-center justify-center shadow-inner group">
              
              {/* Corner Brackets */}
              <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-2 border-l-2 border-[#B38B42] z-10" />
              <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-2 border-r-2 border-[#B38B42] z-10" />
              <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-2 border-l-2 border-[#B38B42] z-10" />
              <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-2 border-r-2 border-[#B38B42] z-10" />

              {/* Physical Texture / Fingerprint Image */}
              {fingerprintImageDataUrl ? (
                <img
                  src={fingerprintImageDataUrl}
                  alt="Physical Craft Fingerprint"
                  className="w-full h-full object-cover grayscale contrast-125 filter group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-12 h-12 rounded-full border border-[#B38B42]/40 flex items-center justify-center mb-1">
                    <Sparkles className="w-6 h-6 text-[#B38B42]" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#73776A]">
                    Craft Microstructure ROI
                  </span>
                </div>
              )}
            </div>

            {/* Sub-caption under fingerprint */}
            <div className="flex items-center space-x-2 mt-3 text-[10px] font-bold tracking-widest uppercase text-[#57534E]">
              <span className="w-4 h-px bg-[#B38B42]" />
              <span>SCAN QR TO START VERIFICATION</span>
              <span className="w-4 h-px bg-[#B38B42]" />
            </div>

          </div>

          {/* RIGHT SIDE: Branding, QR, and 7-char Product ID */}
          <div className="flex flex-col justify-between space-y-4 sm:pl-2">
            
            {/* Header: Shield Logo + KALAKRITI AUTHENTICITY */}
            <div>
              <div className="flex items-center space-x-3">
                {/* Shield Logo */}
                <div className="w-10 h-12 border-2 border-[#B38B42] rounded-b-xl flex items-center justify-center bg-[#FAF7F2] shadow-xs">
                  <span className="font-serif font-bold text-lg text-[#B38B42]">K</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl tracking-wide text-[#1C1917] leading-none">
                    KALAKRITI
                  </h3>
                  <div className="text-[10px] font-bold tracking-[0.25em] text-[#B38B42] uppercase mt-0.5">
                    AUTHENTICITY
                  </div>
                </div>
              </div>

              {/* Gold Divider Rule with Node */}
              <div className="relative flex items-center mt-3">
                <div className="flex-1 h-px bg-[#B38B42]" />
                <div className="w-2 h-2 rounded-full bg-[#B38B42]" />
              </div>
            </div>

            {/* Bottom Content: Product ID and QR Code */}
            <div className="flex items-end justify-between gap-3">
              
              {/* Product ID Section */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  PRODUCT ID:
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-xl sm:text-2xl text-[#1C1917] tracking-wider bg-white/60 px-2 py-0.5 rounded border border-[#E5DDD0]">
                    {productId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy Product ID"
                    className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center">
                <div className="p-1.5 bg-white border border-[#E5DDD0] rounded-xl shadow-xs">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR Code for ${productId}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-stone-100 rounded">
                      <QrCode className="w-8 h-8 text-stone-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Banner: • KALAKRITI PHYSICAL AUTHENTICATION SYSTEM • */}
        <div className="mt-5 pt-3 border-t border-[#E5DDD0] flex items-center justify-center space-x-2 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-[#78716C] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B38B42]" />
          <span>KALAKRITI PHYSICAL AUTHENTICATION SYSTEM</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B38B42]" />
        </div>

      </div>

      {/* Download & Print Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handleDownloadLabel}
          disabled={isGenerating}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#B38B42] text-white text-xs font-bold hover:bg-[#967433] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Authentication Label</span>
        </button>

        <button
          onClick={handleDownloadQr}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white border border-[#D9CFBE] text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition-colors shadow-2xs cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-[#B38B42]" />
          <span>Download QR</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white border border-[#D9CFBE] text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition-colors shadow-2xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#57534E]" />
          <span>Print Label</span>
        </button>
      </div>

    </div>
  );
};
