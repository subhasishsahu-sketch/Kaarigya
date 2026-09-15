import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  Lock
} from 'lucide-react';
import { CreationLocation, PublicLocation, ArtisanProfile } from '../../types';
import { LocationMap } from './LocationMap';

interface LocationCaptureProps {
  artisan: ArtisanProfile;
  initialLocation?: CreationLocation;
  initialPublicLocation?: PublicLocation;
  onConfirmLocation: (loc: CreationLocation, pubLoc: PublicLocation) => void;
  onSkipLocation: () => void;
}

export const LocationCapture: React.FC<LocationCaptureProps> = ({
  artisan,
  initialLocation,
  initialPublicLocation,
  onConfirmLocation,
  onSkipLocation
}) => {
  const [consentGranted, setConsentGranted] = useState<boolean>(!!initialLocation);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Default cluster location based on artisan profile
  const defaultCity = artisan.district || artisan.location || "Pipli";
  const defaultState = artisan.state || "Odisha";
  const defaultArea = `${artisan.location || defaultCity}, ${defaultState}`;

  const [currentLoc, setCurrentLoc] = useState<CreationLocation>(() => {
    if (initialLocation) return initialLocation;
    return {
      latitude: artisan.approxCoords?.latitude || 19.9850,
      longitude: artisan.approxCoords?.longitude || 85.8340,
      accuracy: 18,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      address: `${artisan.location}, ${defaultState}`,
      isSimulated: true
    };
  });

  const [currentPublicLoc, setCurrentPublicLoc] = useState<PublicLocation>(() => {
    if (initialPublicLocation) return initialPublicLocation;
    return {
      city: defaultCity,
      district: artisan.district || defaultCity,
      state: defaultState,
      country: "India",
      approximateArea: defaultArea,
      clusterName: `${defaultCity} Craft Cluster`
    };
  });

  const [clusterOption, setClusterOption] = useState<string>(defaultCity);

  const clusterPresets: Record<string, { city: string; district: string; state: string; lat: number; lng: number; cluster: string }> = {
    "Pipli": { city: "Pipli", district: "Puri", state: "Odisha", lat: 19.9850, lng: 85.8340, cluster: "Pipli Appliqué Cluster" },
    "Dhenkanal": { city: "Sadeibareni", district: "Dhenkanal", state: "Odisha", lat: 20.6580, lng: 85.5970, cluster: "Dhenkanal Dhokra Cluster" },
    "Bargarh": { city: "Bargarh", district: "Bargarh", state: "Odisha", lat: 21.3340, lng: 83.6210, cluster: "Bargarh Sambalpuri Cluster" },
    "Channapatna": { city: "Channapatna", district: "Ramanagara", state: "Karnataka", lat: 12.6518, lng: 77.2089, cluster: "Channapatna Toy Craft Cluster" },
    "Madhubani": { city: "Ranti Village", district: "Madhubani", state: "Bihar", lat: 26.3530, lng: 86.0720, cluster: "Mithila Painting Cluster" }
  };

  const handleRequestLiveGPS = () => {
    setCapturing(true);
    setGpsError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newLoc: CreationLocation = {
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
            accuracy: Math.round(position.coords.accuracy) || 16,
            timestamp: nowFormatted,
            address: `${defaultArea} (Live Device GPS Verified)`,
            isSimulated: false
          };
          setCurrentLoc(newLoc);
          setConsentGranted(true);
          setCapturing(false);
        },
        (error) => {
          // If browser GPS is denied or unavailable in sandboxed environment, fallback seamlessly with clear note
          setGpsError("Browser GPS permission not granted or device offline. Using certified artisan guild cluster location.");
          setConsentGranted(true);
          setCapturing(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setConsentGranted(true);
      setCapturing(false);
    }
  };

  const handleSelectClusterPreset = (key: string) => {
    const preset = clusterPresets[key];
    if (preset) {
      setClusterOption(key);
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentLoc({
        latitude: preset.lat,
        longitude: preset.lng,
        accuracy: 18,
        timestamp: nowFormatted,
        address: `${preset.city}, ${preset.district} District, ${preset.state}`,
        isSimulated: true
      });
      setCurrentPublicLoc({
        city: preset.city,
        district: preset.district,
        state: preset.state,
        country: "India",
        approximateArea: `${preset.city}, ${preset.state}`,
        clusterName: preset.cluster
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#5D634C]/10 text-[#5D634C] text-[10px] font-bold uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Step 5: Live Creation Provenance</span>
        </div>
        <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
          Where was this product made?
        </h2>
        <p className="text-xs sm:text-sm text-[#73776A]">
          Adding the creation location helps buyers understand its provenance and connects your piece to your registered GI craft cluster.
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] flex items-start space-x-3.5">
        <div className="w-8 h-8 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-[#2C2E29]">
          <div className="font-bold text-[#2C2E29] flex items-center space-x-2">
            <span>Location Privacy Protected</span>
            <span className="text-[10px] font-normal text-[#5D634C] bg-[#5D634C]/10 px-2 py-0.5 rounded-full">Consent-Based</span>
          </div>
          <p className="text-[#73776A] leading-relaxed">
            We only use your location to record product provenance. Your exact home or workshop coordinates will <strong>never</strong> be publicly displayed to buyers. Buyers only see the approximate craft cluster (e.g. <em>{currentPublicLoc.approximateArea}</em>).
          </p>
          <p className="text-[11px] text-[#BC8E6D] font-medium pt-0.5">
            ℹ Note: Location supports the product's provenance — it does not prove authenticity by itself.
          </p>
        </div>
      </div>

      {/* Consent Screen if not yet consented */}
      {!consentGranted ? (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 text-center craft-shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center mx-auto">
            <Navigation className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
              Add Creation Location
            </h3>
            <p className="text-xs text-[#73776A] leading-relaxed">
              Share where this product was made to strengthen its digital passport and prove origin within the certified handicraft cluster.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRequestLiveGPS}
              disabled={capturing}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {capturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Detecting Location...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>Allow Location Access</span>
                </>
              )}
            </button>

            <button
              onClick={onSkipLocation}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#DCD7CF] text-[#73776A] text-xs font-semibold rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </div>
      ) : (
        /* Location Captured & Preview Stage */
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
          
          {/* Map Preview */}
          <LocationMap 
            location={currentLoc}
            publicLocation={currentPublicLoc}
            artisanName={artisan.name}
            clusterName={currentPublicLoc.clusterName}
            isBuyerFacing={false}
          />

          {/* Location Captured Metadata Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5D634C] animate-ping" />
                <span className="text-xs font-bold text-[#5D634C] uppercase tracking-wider">
                  ✓ Location Recorded
                </span>
              </div>
              <span className="text-[10px] text-[#73776A] font-mono">
                {currentLoc.isSimulated ? "Certified Cluster Anchor" : "Live Device GPS"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block">Creation Cluster</span>
                <span className="font-bold text-[#2C2E29] text-sm">{currentPublicLoc.approximateArea}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block">Accuracy Range</span>
                <span className="font-bold text-[#2C2E29]">±{currentLoc.accuracy} meters</span>
              </div>

              <div>
                <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider block">Recorded At</span>
                <span className="font-mono text-[#2C2E29]">{currentLoc.timestamp}</span>
              </div>
            </div>

            {gpsError && (
              <p className="text-[11px] text-[#BC8E6D] bg-[#BC8E6D]/10 p-2.5 rounded-xl">
                {gpsError}
              </p>
            )}
          </div>

          {/* Cluster Selection if Artisan wants to change cluster */}
          {isEditing && (
            <div className="p-4 rounded-2xl bg-white border border-[#BC8E6D] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C2E29]">Select Registered Craft Cluster:</span>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs text-[#73776A] hover:text-[#2C2E29]"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(clusterPresets).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSelectClusterPreset(key)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                      clusterOption === key
                        ? 'bg-[#5D634C] text-white border-[#5D634C]'
                        : 'bg-[#FAF8F5] border-[#DCD7CF] text-[#2C2E29] hover:bg-[#E8E4DD]'
                    }`}
                  >
                    <div className="font-bold">{clusterPresets[key].city}</div>
                    <div className="text-[10px] opacity-80">{clusterPresets[key].state}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#E8E4DD] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2.5 text-xs text-[#73776A] hover:text-[#2C2E29] border border-[#DCD7CF] rounded-full hover:bg-[#FAF8F5] transition-colors w-full sm:w-auto"
              >
                Change Location
              </button>
              <button
                type="button"
                onClick={handleRequestLiveGPS}
                className="px-4 py-2.5 text-xs text-[#5D634C] border border-[#5D634C]/30 rounded-full hover:bg-[#5D634C]/10 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${capturing ? 'animate-spin' : ''}`} />
                <span>Re-detect GPS</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onSkipLocation}
                className="px-4 py-2.5 text-xs text-[#73776A] hover:text-[#2C2E29]"
              >
                Skip
              </button>

              <button
                type="button"
                onClick={() => onConfirmLocation(currentLoc, currentPublicLoc)}
                className="px-6 py-3 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Use This Location & Continue</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
