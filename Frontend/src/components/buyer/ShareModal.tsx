import React, { useState } from 'react';
import { ProductPassport } from '../../types';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Twitter, 
  Mail, 
  QrCode, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ShareModalProps {
  product: ProductPassport;
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  product,
  isOpen,
  onClose,
  onShowNotification
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedDetails, setCopiedDetails] = useState<boolean>(false);
  const [showQRCard, setShowQRCard] = useState<boolean>(false);

  if (!isOpen) return null;

  // Build the sharable passport URL
  const shareUrl = `${window.location.origin}${window.location.pathname}?passport=${encodeURIComponent(product.productId)}`;
  
  const shareTitle = `Authentic ${product.name} by ${product.artisan.name}`;
  const shareText = `Discover this authentic handcrafted ${product.name} by Master Artisan ${product.artisan.name} (${product.craftCategory}, ${product.publicLocation?.approximateArea || product.artisan.location}). Verified with a tamper-evident digital product passport on Kalakriti.`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    onShowNotification('Passport link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyFullStory = () => {
    const fullText = `🪡 ${product.name} — Handcrafted Heritage
Artisan: ${product.artisan.name} (${product.artisan.craftTradition})
Cooperative: ${product.artisan.cooperativeName}
Origin: ${product.publicLocation?.approximateArea || product.artisan.location}
Materials: ${product.materials.join(', ')}
Fair Compensation: ₹${product.price.artisanCompensation.toLocaleString()} (${Math.round((product.price.artisanCompensation / product.price.retail) * 100)}% of retail price)
Tamper-Evident Passport ID: ${product.productId}

Verify authenticity & story on Kalakriti:
${shareUrl}`;

    navigator.clipboard?.writeText(fullText);
    setCopiedDetails(true);
    onShowNotification('Authenticity story copied to clipboard!', 'success');
    setTimeout(() => setCopiedDetails(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        onShowNotification('Shared successfully!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n🔗 View Passport: ${shareUrl}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this authentic ${product.name} handcrafted by ${product.artisan.name}. Verified by Kalakriti Digital Product Passport.`)}&url=${encodeURIComponent(shareUrl)}&hashtags=HandmadeInIndia,GICraft,AuthenticHeritage,Kalakriti`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailShare = () => {
    const mailSubject = encodeURIComponent(`Authentic Craft Passport: ${product.name} by ${product.artisan.name}`);
    const mailBody = encodeURIComponent(`${shareText}\n\nView the verified digital passport here:\n${shareUrl}\n\nPassport ID: ${product.productId}\nNFC Tag: ${product.nfcUid}`);
    window.open(`mailto:?subject=${mailSubject}&body=${mailBody}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2E29]/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-black/[0.04] rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DD] bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5D634C]/15 text-[#5D634C] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2C2E29]">Share Product Passport</h2>
              <p className="text-[11px] text-[#73776A]">Spread the artisan's verified story & provenance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#DCD7CF] flex items-center justify-center text-[#73776A] hover:text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Mini Craft Card Preview */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#DCD7CF] flex items-center space-x-3.5">
            <img
              src={product.primaryImage}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover border border-[#DCD7CF]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold uppercase text-[#BC8E6D]">{product.craftCategory}</span>
                <span className="text-[9px] font-mono text-[#5D634C] bg-[#5D634C]/10 px-1.5 py-0.2 rounded font-semibold">
                  ✓ {product.status.toUpperCase()}
                </span>
              </div>
              <h4 className="font-serif italic font-bold text-sm text-[#2C2E29] truncate">{product.name}</h4>
              <p className="text-[11px] text-[#73776A] truncate">By {product.artisan.name} • {product.publicLocation?.approximateArea || product.artisan.location}</p>
            </div>
          </div>

          {/* Quick Copy Link Bar */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#73776A]">
              Direct Passport Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl px-3 py-2 text-xs font-mono text-[#2C2E29] truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#5D634C] text-[#FAF8F5] rounded-xl text-xs font-semibold hover:bg-[#4A4F3C] transition-colors flex items-center space-x-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share Channels Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#73776A]">
              Share Across Platforms
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] hover:bg-[#25D366]/20 transition-all text-xs font-semibold space-y-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#0c80c6] hover:bg-[#1DA1F2]/20 transition-all text-xs font-semibold space-y-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Twitter className="w-4 h-4" />
                </div>
                <span>Twitter / X</span>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#D93025] hover:bg-[#EA4335]/20 transition-all text-xs font-semibold space-y-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Email</span>
              </button>

              {/* Native Device Share */}
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/30 text-[#5D634C] hover:bg-[#5D634C]/20 transition-all text-xs font-semibold space-y-1.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#5D634C] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>Device Share</span>
              </button>

            </div>
          </div>

          {/* QR Code Card Accordion */}
          <div className="rounded-2xl border border-[#DCD7CF] overflow-hidden bg-[#FAF8F5]">
            <button
              onClick={() => setShowQRCard(!showQRCard)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-[#2C2E29] hover:bg-[#E8E4DD]/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-[#5D634C]" />
                <span>Show Printable QR Code Stamp</span>
              </div>
              <span className="text-[11px] text-[#73776A]">{showQRCard ? 'Hide' : 'Expand'}</span>
            </button>

            {showQRCard && (
              <div className="p-4 border-t border-[#DCD7CF] bg-white text-center space-y-3">
                <div className="p-3 bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl inline-block">
                  <img
                    src={product.qrCodeUrl}
                    alt="Passport QR"
                    className="w-36 h-36 mx-auto rounded-lg"
                  />
                  <div className="pt-2 text-[10px] font-mono font-bold text-[#5D634C]">
                    ID: {product.productId}
                  </div>
                </div>
                <p className="text-[11px] text-[#73776A] max-w-xs mx-auto">
                  Physical tags, invoices, or display booths can scan this QR code directly to verify authenticity.
                </p>
              </div>
            )}
          </div>

          {/* Additional Action: Copy Full Provenance Summary */}
          <button
            onClick={handleCopyFullStory}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#DCD7CF] text-xs font-semibold text-[#2C2E29] hover:bg-[#FAF8F5] hover:border-[#BC8E6D] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
          >
            {copiedDetails ? <Check className="w-4 h-4 text-[#5D634C]" /> : <Copy className="w-4 h-4 text-[#73776A]" />}
            <span>{copiedDetails ? '✓ Full Story & Provenance Copied' : 'Copy Full Provenance Summary (for Invoices/Receipts)'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
