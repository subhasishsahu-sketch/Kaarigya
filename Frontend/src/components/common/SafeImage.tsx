import React, { useState, useEffect } from 'react';
import { getCraftCategoryFallback, getArtisanAvatar } from '../../utils/craftImages';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  craftCategory?: string;
  productId?: string;
  isAvatar?: boolean;
  artisanName?: string;
  fallbackSrc?: string;
  aspectRatioClass?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  craftCategory,
  productId,
  isAvatar = false,
  artisanName,
  fallbackSrc,
  className = '',
  aspectRatioClass,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (src && src.trim().length > 0) return src;
    if (isAvatar) return getArtisanAvatar(artisanName);
    if (fallbackSrc) return fallbackSrc;
    return getCraftCategoryFallback(craftCategory, productId);
  });

  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (src && src.trim().length > 0) {
      setCurrentSrc(src);
      setHasError(false);
      setRetryCount(0);
      setIsLoaded(false);
    } else {
      const fallback = isAvatar
        ? getArtisanAvatar(artisanName)
        : fallbackSrc || getCraftCategoryFallback(craftCategory, productId);
      setCurrentSrc(fallback);
    }
  }, [src, craftCategory, productId, isAvatar, artisanName, fallbackSrc]);

  const handleError = () => {
    if (retryCount === 0) {
      // First fallback: Use category or artisan curated verified image
      setRetryCount(1);
      const fallback = isAvatar
        ? getArtisanAvatar(artisanName)
        : fallbackSrc || getCraftCategoryFallback(craftCategory, productId);
      
      if (fallback !== currentSrc) {
        setCurrentSrc(fallback);
        return;
      }
    }
    
    // If fallback also fails, render graceful themed SVG fallback
    setHasError(true);
  };

  if (hasError) {
    if (isAvatar) {
      const initial = (artisanName || alt || 'A').trim().charAt(0).toUpperCase();
      return (
        <div 
          className={`bg-[#5D634C] text-[#FAF8F5] font-serif font-bold flex items-center justify-center select-none ${className}`}
          title={alt}
        >
          {initial}
        </div>
      );
    }

    return (
      <div 
        className={`bg-[#E8E4DD] border border-[#DCD7CF] flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden ${className}`}
      >
        <div className="w-8 h-8 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center mb-1.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-serif italic font-bold text-xs text-[#2C2E29] line-clamp-1 max-w-full px-2">
          {alt || "Handcrafted Heritage"}
        </span>
        <span className="text-[9px] uppercase tracking-wider font-mono text-[#73776A] mt-0.5">
          {productId || craftCategory || "Authentic Craft"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={handleError}
      onLoad={() => setIsLoaded(true)}
      className={`${className} ${!isLoaded ? 'opacity-90 blur-[1px]' : 'opacity-100 blur-none'} transition-all duration-300`}
      {...props}
    />
  );
};
