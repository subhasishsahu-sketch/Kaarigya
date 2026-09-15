import React from 'react';
import { ShieldCheck, Check, Sparkles, Award } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  maxScore?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  maxScore = 5.0,
  showDetails = false,
  size = 'md'
}) => {
  const percentage = (score / maxScore) * 100;
  
  let colorTheme = 'text-[#5D634C] bg-[#5D634C]/10 border-[#5D634C]/25';
  if (score < 3.0) {
    colorTheme = 'text-[#A25247] bg-[#A25247]/10 border-[#A25247]/25';
  } else if (score < 4.2) {
    colorTheme = 'text-[#BC8E6D] bg-[#BC8E6D]/15 border-[#BC8E6D]/30';
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-full border px-3 py-1 ${colorTheme} font-semibold`}>
      <ShieldCheck className="w-3.5 h-3.5 text-[#5D634C]" />
      <span className="text-xs">
        Trust Score: {score.toFixed(1)} / {maxScore}
      </span>
      {showDetails && (
        <span className="text-[10px] opacity-75 hidden sm:inline uppercase tracking-wider font-semibold">
          ({Math.round(percentage)}% Confidence)
        </span>
      )}
    </div>
  );
};

export const VerificationStatusTag: React.FC<{ status: 'verified' | 'pending' | 'flagged' | 'rejected' }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#5D634C]/15 text-[#5D634C] border border-[#5D634C]/30">
        <Check className="w-3 h-3" />
        <span>Verified Authentic</span>
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#BC8E6D]/15 text-[#BC8E6D] border border-[#BC8E6D]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#BC8E6D] animate-pulse" />
        <span>Pending Guild Audit</span>
      </span>
    );
  }
  if (status === 'flagged') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#A25247]/15 text-[#A25247] border border-[#A25247]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A25247]" />
        <span>Flagged / Anomaly</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8E4DD] text-[#73776A] border border-[#DCD7CF]">
      <span>Changes Requested</span>
    </span>
  );
};
