import React from 'react';
import { CheckCircle2, AlertTriangle, MapPin, HelpCircle } from 'lucide-react';
import { LocationConsistencyStatus } from '../../types';

interface LocationConsistencyBadgeProps {
  status?: LocationConsistencyStatus;
  registeredOrigin?: string;
  creationLocation?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const LocationConsistencyBadge: React.FC<LocationConsistencyBadgeProps> = ({
  status = 'consistent',
  registeredOrigin = 'Pipli, Odisha',
  creationLocation = 'Pipli Craft Cluster',
  size = 'md',
  showDetails = false
}) => {
  if (status === 'consistent') {
    return (
      <div className="inline-flex flex-col space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#5D634C]/10 text-[#5D634C] border border-[#5D634C]/25 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Location Consistent</span>
        </div>
        {showDetails && (
          <p className="text-[11px] text-[#73776A] pl-1">
            Creation coordinate falls within registered craft cluster ({registeredOrigin}).
          </p>
        )}
      </div>
    );
  }

  if (status === 'inconsistent_review') {
    return (
      <div className="inline-flex flex-col space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] border border-[#BC8E6D]/30 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Location Requires Review</span>
        </div>
        {showDetails && (
          <p className="text-[11px] text-[#73776A] pl-1">
            Registered: <strong>{registeredOrigin}</strong> vs Captured: <strong>{creationLocation}</strong>.
            <span className="block text-[10px] text-[#73776A] italic mt-0.5">
              *Location supports provenance; differences may occur during travel or cooperative events.
            </span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#E8E4DD] text-[#73776A] text-xs font-medium">
      <MapPin className="w-3 h-3 text-[#73776A]" />
      <span>Location Not Recorded (Optional)</span>
    </div>
  );
};
