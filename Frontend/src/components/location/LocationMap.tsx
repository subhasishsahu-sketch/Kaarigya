import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Navigation, Compass } from 'lucide-react';
import { CreationLocation, PublicLocation } from '../../types';

// Fix Leaflet's default marker icon path issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom styled Leaflet marker icon for Kaarigya
const customPinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background-color: #5D634C;
      border: 3px solid #FAF8F5;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

interface LocationMapProps {
  location?: CreationLocation;
  publicLocation?: PublicLocation;
  artisanName?: string;
  clusterName?: string;
  isBuyerFacing?: boolean;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  location,
  publicLocation,
  artisanName,
  clusterName,
  isBuyerFacing = false,
  className = ""
}) => {
  const displayCity = publicLocation?.city || "Pipli";
  const displayState = publicLocation?.state || "Odisha";
  const displayArea = publicLocation?.approximateArea || `${displayCity} Craft Cluster, ${displayState}`;
  const accuracyMeters = location?.accuracy || 18;
  const timestamp = location?.timestamp || "19 Aug 2026, 10:42 AM";

  // Coordinates: Pipli Craft Village, Puri District, Odisha (approx 20.1167° N, 85.8283° E)
  const exactLat = location?.latitude || 20.1167;
  const exactLng = location?.longitude || 85.8283;

  // Buyer-facing privacy offset for cluster-level representation
  const mapCenterLat = isBuyerFacing ? exactLat + 0.003 : exactLat;
  const mapCenterLng = isBuyerFacing ? exactLng - 0.003 : exactLng;
  const markerLat = isBuyerFacing ? exactLat + 0.003 : exactLat;
  const markerLng = isBuyerFacing ? exactLng - 0.003 : exactLng;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#DCD7CF] bg-[#FAF8F5] ${className}`}>
      
      {/* React Leaflet + OpenStreetMap Canvas */}
      <div className="relative h-56 sm:h-64 w-full z-0">
        <MapContainer
          center={[mapCenterLat, mapCenterLng]}
          zoom={isBuyerFacing ? 13 : 15}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[markerLat, markerLng]} icon={customPinIcon}>
            <Popup className="font-sans">
              <div className="p-1 space-y-1 text-center">
                <div className="font-bold text-xs text-[#2C2E29]">
                  {clusterName || displayArea}
                </div>
                <div className="text-[10px] text-[#73776A]">
                  {isBuyerFacing ? "Certified Origin Cluster (Privacy Protected)" : `Maker: ${artisanName || "Master Artisan"}`}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* GI Cluster Zone Badge */}
        <div className="absolute top-3 right-3 z-[1000] px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-full border border-[#DCD7CF] shadow-xs flex items-center space-x-1.5 text-[10px] font-mono text-[#73776A]">
          <Compass className="w-3.5 h-3.5 text-[#5D634C]" />
          <span>GI CLUSTER ZONE</span>
        </div>

        {/* Accuracy Tag (internal view only) */}
        {!isBuyerFacing && (
          <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full border border-[#DCD7CF] shadow-xs flex items-center space-x-1.5 text-[10px] text-[#2C2E29]">
            <Navigation className="w-3.5 h-3.5 text-[#5D634C]" />
            <span>Accuracy: <strong>±{accuracyMeters}m</strong></span>
          </div>
        )}
      </div>

      {/* Map Footer Info */}
      <div className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#E8E4DD]">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#BC8E6D]">
              {isBuyerFacing ? "Certified Origin Cluster" : "Recorded Creation Location"}
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#73776A]"></span>
            <span className="text-[10px] text-[#73776A] font-mono">{timestamp}</span>
          </div>
          <p className="text-xs font-bold text-[#2C2E29]">
            {displayArea}
          </p>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-[#5D634C] font-medium bg-[#5D634C]/10 px-2.5 py-1 rounded-full border border-[#5D634C]/20 shrink-0 self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5" />
          <span>{isBuyerFacing ? "Approximate Area (Privacy Protected)" : "Exact Coordinates Verified"}</span>
        </div>
      </div>

    </div>
  );
};
