import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  riskPercentage: number;
  level?: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ riskPercentage, level, size = 'md' }) => {
  let computedLevel: RiskLevel = level || 'low';
  if (!level) {
    if (riskPercentage >= 70) computedLevel = 'high';
    else if (riskPercentage >= 40) computedLevel = 'medium';
    else computedLevel = 'low';
  }

  if (computedLevel === 'high') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A25247]/15 text-[#A25247] border border-[#A25247]/30">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Anomaly Risk: {riskPercentage}% (High)</span>
      </span>
    );
  }

  if (computedLevel === 'medium') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#BC8E6D]/15 text-[#BC8E6D] border border-[#BC8E6D]/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Risk: {riskPercentage}% (Medium)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#5D634C]/15 text-[#5D634C] border border-[#5D634C]/30">
      <CheckCircle className="w-3.5 h-3.5" />
      <span>Low Risk ({riskPercentage}%)</span>
    </span>
  );
};
