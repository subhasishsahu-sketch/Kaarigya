import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Factory, 
  Package, 
  Navigation, 
  Compass, 
  Layers, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  ShieldCheck,
  Scale,
  Sparkles,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { CounterfeitAlert } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface CounterfeitSurveillanceMapProps {
  alerts: CounterfeitAlert[];
  selectedAlert: CounterfeitAlert | null;
  onSelectAlert: (alert: CounterfeitAlert) => void;
  onIssueTakedown?: (alertId: string) => void;
  onRefresh?: () => void;
  isLoadingData?: boolean;
  loadError?: string | null;
  className?: string;
}

export const CounterfeitSurveillanceMap: React.FC<CounterfeitSurveillanceMapProps> = ({
  alerts,
  selectedAlert,
  onSelectAlert,
  onIssueTakedown,
  onRefresh,
  isLoadingData = false,
  loadError = null,
  className = ""
}) => {
  const [showArcs, setShowArcs] = useState<boolean>(true);
  const [showGenuineOrigins, setShowGenuineOrigins] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'high' | 'mills' | 'resolved'>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter alerts for map display
  const displayAlerts = useMemo(() => {
    return alerts.filter(alt => {
      if (!alt.detectionLocation || typeof alt.detectionLocation.latitude !== 'number' || typeof alt.detectionLocation.longitude !== 'number') return false;
      if (filterType === 'high') return alt.riskLevel === 'high' && alt.status !== 'resolved';
      if (filterType === 'mills') return (alt.detectionLocation.facilityType || '').toLowerCase().includes('mill') || (alt.detectionLocation.facilityType || '').toLowerCase().includes('foundry');
      if (filterType === 'resolved') return alt.status === 'resolved';
      return true;
    });
  }, [alerts, filterType]);

  // Statistics
  const totalSeized = useMemo(() => {
    return alerts.reduce((acc, curr) => acc + (curr.seizureVolume || 0), 0);
  }, [alerts]);

  const maxDistance = useMemo(() => {
    const distances = alerts.map(a => a.distanceFromOriginKm || 0).filter(d => d > 0);
    return distances.length > 0 ? Math.max(...distances) : 0;
  }, [alerts]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Center around India / Odisha (20.8000, 83.5000)
      const map = L.map(mapContainerRef.current, {
        center: [20.8000, 83.5000],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap tiles — completely free, no API key required
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      heatmapLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    // Resize map when fullscreen changes or component mounts
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Leaflet Map Markers & Layers when alerts, filters, or selection change
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = markersLayerRef.current;
    const heatmapGroup = heatmapLayerRef.current;

    if (!map || !markersGroup || !heatmapGroup) return;

    markersGroup.clearLayers();
    heatmapGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Render Genuine GI Origins (Green / Moss icons)
    if (showGenuineOrigins) {
      const addedOrigins = new Set<string>();

      alerts.forEach(alt => {
        if (!alt.genuineOrigin || typeof alt.genuineOrigin.latitude !== 'number' || typeof alt.genuineOrigin.longitude !== 'number') return;
        const originKey = `${alt.genuineOrigin.latitude.toFixed(3)}_${alt.genuineOrigin.longitude.toFixed(3)}`;
        if (addedOrigins.has(originKey)) return;
        addedOrigins.add(originKey);

        const latLng: [number, number] = [alt.genuineOrigin.latitude, alt.genuineOrigin.longitude];
        bounds.extend(latLng);

        const originIcon = L.divIcon({
          className: 'custom-gi-origin-icon',
          html: `
            <div style="
              width: 24px; height: 24px; 
              background: #5D634C; 
              border: 2px solid #FFFFFF; 
              border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; 
              box-shadow: 0 2px 8px rgba(93,99,76,0.4);
            ">
              <span style="color: white; font-size: 11px; font-weight: bold;">✓</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker(latLng, { icon: originIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; color: #2C2E29; min-width: 160px;">
            <div style="font-weight: bold; color: #5D634C; font-size: 13px;">✓ ${alt.genuineOrigin.city} Authentic Craft Hub</div>
            <div style="font-size: 11px; color: #73776A; margin-top: 2px;">Cluster: <strong>${alt.genuineOrigin.clusterName || "Registered GI Guild"}</strong></div>
            <div style="font-size: 10px; color: #5D634C; font-weight: bold; margin-top: 4px; background: #5D634C/10; padding: 2px 6px; border-radius: 4px; display: inline-block;">Authentic GI Craft Origin</div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 2. Render Counterfeit Seizure & Discovery Site Markers
    displayAlerts.forEach(alt => {
      if (!alt.detectionLocation || typeof alt.detectionLocation.latitude !== 'number' || typeof alt.detectionLocation.longitude !== 'number') return;

      const latLng: [number, number] = [alt.detectionLocation.latitude, alt.detectionLocation.longitude];
      bounds.extend(latLng);

      const isSelected = selectedAlert?.id === alt.id;
      const isHigh = alt.riskLevel === 'high';
      const isResolved = alt.status === 'resolved';

      const color = isResolved ? "#5D634C" : isHigh ? "#A25247" : "#BC8E6D";
      const size = isSelected ? 30 : 22;

      // Location Source Label Indicator (USER_GPS vs IP_ESTIMATED)
      const locSource = alt.detectionLocation.interceptionType === 'physical_seizure' ? 'USER_GPS' : 
                        alt.detectionLocation.interceptionType === 'shipping_origin' ? 'USER_MAP' : 'IP_ESTIMATED';
      const locSourceBadge = locSource === 'USER_GPS' ? 'GPS (Precise)' : locSource === 'USER_MAP' ? 'User Pinned' : 'IP Estimated (Approx)';

      const markerIcon = L.divIcon({
        className: 'custom-counterfeit-icon',
        html: `
          <div style="position: relative; width: ${size}px; height: ${size}px;">
            ${isHigh && !isResolved ? `
              <div style="
                position: absolute; inset: -4px; 
                border-radius: 50%; 
                border: 2px solid ${color}; 
                opacity: 0.6;
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            ` : ''}
            <div style="
              width: ${size}px; height: ${size}px; 
              background: ${color}; 
              border: ${isSelected ? '3px' : '2px'} solid #FFFFFF; 
              border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; 
              box-shadow: 0 4px 12px ${color}66;
            ">
              <span style="color: white; font-size: ${size > 24 ? '13px' : '10px'}; font-weight: bold;">!</span>
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker(latLng, { icon: markerIcon });

      marker.on('click', () => {
        onSelectAlert(alt);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 6px; color: #2C2E29; min-width: 200px;">
          <div style="font-weight: bold; color: ${color}; font-size: 13px;">${alt.productName}</div>
          <div style="font-size: 11px; color: #73776A; margin-top: 2px;">Discovery: <strong>${alt.detectionLocation.city}, ${alt.detectionLocation.state}</strong></div>
          <div style="font-size: 11px; color: ${color}; font-weight: bold; margin-top: 4px;">Risk Score: ${alt.riskPercentage}% (${alt.riskLevel.toUpperCase()})</div>
          <div style="font-size: 10px; color: #73776A; margin-top: 2px;">Location Source: <strong>${locSourceBadge}</strong></div>
          ${alt.distanceFromOriginKm ? `<div style="font-size: 10px; color: #BC8E6D; font-weight: bold; margin-top: 2px;">Displacement: ${alt.distanceFromOriginKm} km Anomaly</div>` : ''}
          ${alt.seizureVolume ? `<div style="font-size: 10px; color: #A25247; font-weight: bold;">Seized Volume: ${alt.seizureVolume} Units</div>` : ''}
        </div>
      `);

      markersGroup.addLayer(marker);

      // 3. Render Heatmap Density Rings if enabled
      if (showHeatmap && !isResolved) {
        const heatCircle = L.circle(latLng, {
          radius: Math.max(15000, (alt.seizureVolume || 100) * 150),
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 1
        });
        heatmapGroup.addLayer(heatCircle);
      }

      // 4. Render Supply Anomaly Polylines connecting Origin -> Discovery
      if (showArcs && alt.genuineOrigin && typeof alt.genuineOrigin.latitude === 'number' && typeof alt.genuineOrigin.longitude === 'number') {
        const originLatLng: [number, number] = [alt.genuineOrigin.latitude, alt.genuineOrigin.longitude];
        
        const polyline = L.polyline([originLatLng, latLng], {
          color: isSelected ? "#A25247" : color,
          weight: isSelected ? 3 : 2,
          opacity: isSelected ? 0.9 : 0.6,
          dashArray: '6, 8'
        });

        polyline.on('click', () => {
          onSelectAlert(alt);
        });

        markersGroup.addLayer(polyline);
      }
    });

    // Auto-fit map bounds if markers exist
    if (displayAlerts.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

  }, [displayAlerts, showArcs, showGenuineOrigins, showHeatmap, selectedAlert, alerts]);

  return (
    <div 
      className={`bg-white border border-black/[0.04] rounded-[32px] overflow-hidden craft-shadow-subtle transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto bg-white/98 backdrop-blur-md p-6' : 'p-5 sm:p-7'
      } ${className}`}
    >
      
      {/* Top Header & Map Surveillance Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCD7CF] pb-5 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#A25247]/15 text-[#A25247] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D] block">
                Geospatial Counterfeit Radar • Pan-India
              </span>
              <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-[#2C2E29]">
                Where Counterfeits Have Been Found
              </h3>
            </div>
          </div>
          <p className="text-xs text-[#73776A] mt-1">
            Visualizing physical seizures, industrial imitation mills, drop-shipping hubs, and provenance distance offsets from registered GI clusters.
          </p>
        </div>

        {/* Quick Stats Badges & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoadingData}
              className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-[#73776A] hover:text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors cursor-pointer flex items-center space-x-1"
              title="Refresh Counterfeit Feed Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>
          )}

          <div className="px-3.5 py-1.5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs">
            <span className="text-[10px] text-[#73776A] uppercase font-bold block">Units Intercepted</span>
            <span className="font-mono font-bold text-[#A25247] text-sm">{totalSeized.toLocaleString()} Units</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs">
            <span className="text-[10px] text-[#73776A] uppercase font-bold block">Max Displacement</span>
            <span className="font-mono font-bold text-[#5D634C] text-sm">{maxDistance} km</span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-[#73776A] hover:text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Pills and Layer Switches */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#5D634C] text-[#FAF8F5] shadow-xs'
                : 'bg-[#FAF8F5] text-[#73776A] border border-[#DCD7CF] hover:bg-[#E8E4DD]'
            }`}
          >
            All Incident Nodes ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('high')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              filterType === 'high'
                ? 'bg-[#A25247] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#73776A] border border-[#DCD7CF] hover:bg-[#E8E4DD]'
            }`}
          >
            High Risk Seizures
          </button>
          <button
            onClick={() => setFilterType('mills')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              filterType === 'mills'
                ? 'bg-[#BC8E6D] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#73776A] border border-[#DCD7CF] hover:bg-[#E8E4DD]'
            }`}
          >
            Industrial Mills & Foundries
          </button>
          <button
            onClick={() => setFilterType('resolved')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              filterType === 'resolved'
                ? 'bg-[#5D634C] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#73776A] border border-[#DCD7CF] hover:bg-[#E8E4DD]'
            }`}
          >
            Resolved Takedowns
          </button>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center space-x-3 text-[11px] text-[#73776A]">
          <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showArcs} 
              onChange={(e) => setShowArcs(e.target.checked)} 
              className="rounded text-[#5D634C] focus:ring-[#5D634C]"
            />
            <span className="font-medium">Provenance Arcs</span>
          </label>

          <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={(e) => setShowHeatmap(e.target.checked)} 
              className="rounded text-[#5D634C] focus:ring-[#5D634C]"
            />
            <span className="font-medium">Density Heatmap</span>
          </label>

          <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showGenuineOrigins} 
              onChange={(e) => setShowGenuineOrigins(e.target.checked)} 
              className="rounded text-[#5D634C] focus:ring-[#5D634C]"
            />
            <span className="font-medium">Genuine GI Hubs</span>
          </label>
        </div>
      </div>

      {/* Geospatial Map Canvas Container */}
      <div className="relative w-full rounded-3xl bg-[#EBE7DF] border border-[#DCD7CF] overflow-hidden min-h-[480px]">
        
        {/* Compass and Radar Badge */}
        <div className="absolute top-4 right-4 z-[400] px-3 py-1.5 bg-white/90 backdrop-blur-xs rounded-full border border-[#DCD7CF] flex items-center space-x-1.5 text-[10px] font-mono text-[#2C2E29] shadow-xs">
          <Compass className="w-3.5 h-3.5 text-[#5D634C]" />
          <span className="font-bold">SURVEILLANCE RADAR</span>
          <span className="text-[#73776A]">| 2026 AUDIT</span>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[400] px-3 py-1.5 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#DCD7CF] text-[10px] text-[#2C2E29] shadow-xs space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A25247] inline-block"></span>
            <span>Counterfeit Discovery / Seizure Site</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5D634C] inline-block"></span>
            <span>Authentic Registered GI Craft Cluster</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 border-t border-dashed border-[#A25247] inline-block"></span>
            <span className="text-[#73776A]">Provenance Distance Vector</span>
          </div>
        </div>

        {/* Empty State Overlay */}
        {displayAlerts.length === 0 && !loadError && !isLoadingData && (
          <div className="absolute inset-0 z-[500] bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#5D634C]" />
            <h4 className="font-bold text-sm text-[#2C2E29]">Map Loaded Successfully</h4>
            <p className="text-xs text-[#73776A] max-w-md">
              No counterfeit detections available for the selected filters. Change filter options or refresh to view active infringement nodes.
            </p>
          </div>
        )}

        {/* Backend API Load Error State */}
        {loadError && (
          <div className="absolute inset-0 z-[500] bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-[#A25247]" />
            <h4 className="font-bold text-sm text-[#2C2E29]">Unable to load counterfeit map data</h4>
            <p className="text-xs text-[#73776A] max-w-sm">{loadError}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-[#5D634C] text-white text-xs font-bold rounded-full hover:bg-[#4A4F3C] cursor-pointer"
              >
                Retry Loading Data
              </button>
            )}
          </div>
        )}

        {/* Map Viewport Area */}
        <div className="w-full h-full min-h-[480px] aspect-[4/3] sm:aspect-[16/10] max-h-[560px] relative">
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />
        </div>

      </div>

      {/* Selected Incident Detail Tray Below Map */}
      {selectedAlert && selectedAlert.detectionLocation && (
        <div className="mt-5 p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD7CF] pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A25247]/15 text-[#A25247] flex items-center justify-center font-bold font-mono text-xs">
                {selectedAlert.alertCode}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm sm:text-base font-bold text-[#2C2E29]">
                    {selectedAlert.productName}
                  </h4>
                  <RiskBadge riskPercentage={selectedAlert.riskPercentage} level={selectedAlert.riskLevel} />
                </div>
                <span className="text-[11px] text-[#73776A]">
                  Discovered on: <strong>{selectedAlert.detectedUrl || 'Marketplace Surveillance'}</strong> • Ref: {selectedAlert.listingNumber}
                </span>
              </div>
            </div>

            {onIssueTakedown && selectedAlert.status !== 'resolved' && (
              <button
                onClick={() => onIssueTakedown(selectedAlert.id)}
                className="px-4 py-2 bg-[#A25247] hover:bg-[#8B443B] text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                Dispatch GI Enforcement Notice
              </button>
            )}
          </div>

          {/* Location Comparative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            
            {/* Box 1: Discovery Site Details */}
            <div className="p-4 rounded-2xl bg-white border border-[#DCD7CF] space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-[#A25247] font-bold text-[11px] uppercase tracking-wider">
                <Factory className="w-3.5 h-3.5" />
                <span>Counterfeit Discovery Location</span>
              </div>
              <div className="font-bold text-[#2C2E29] text-sm">
                {selectedAlert.detectionLocation.city}, {selectedAlert.detectionLocation.state}
              </div>
              <p className="text-[11px] text-[#73776A]">
                {selectedAlert.detectionLocation.address || selectedAlert.detectionLocation.facilityType}
              </p>
              <div className="pt-1 text-[10px] text-[#A25247] font-semibold">
                Facility: {selectedAlert.detectionLocation.facilityType}
              </div>
            </div>

            {/* Box 2: Genuine Origin */}
            <div className="p-4 rounded-2xl bg-white border border-[#DCD7CF] space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-[#5D634C] font-bold text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Genuine Registered GI Origin</span>
              </div>
              <div className="font-bold text-[#2C2E29] text-sm">
                {selectedAlert.genuineOrigin?.city || selectedAlert.registeredLocation || 'Odisha'}, {selectedAlert.genuineOrigin?.state || 'India'}
              </div>
              <p className="text-[11px] text-[#73776A]">
                Registered Master Artisan / Guild
              </p>
              <div className="pt-1 text-[10px] text-[#5D634C] font-semibold">
                Cluster: {selectedAlert.genuineOrigin?.clusterName || "Registered GI Guild"}
              </div>
            </div>

            {/* Box 3: Forensic Geographic Distance Anomaly */}
            <div className="p-4 rounded-2xl bg-white border border-[#DCD7CF] space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-[#BC8E6D] font-bold text-[11px] uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5" />
                <span>Provenance Displacement</span>
              </div>
              <div className="font-bold text-[#A25247] text-sm font-mono">
                {selectedAlert.distanceFromOriginKm ? `${selectedAlert.distanceFromOriginKm.toLocaleString()} km Offset` : 'Geographic Mismatch'}
              </div>
              <p className="text-[11px] text-[#73776A]">
                Physical seizure: <strong>{selectedAlert.seizureVolume || 0} illicit units</strong>
              </p>
              <div className="pt-1 text-[10px] text-[#73776A] italic">
                Enforcement: <strong className="text-[#A25247]">{selectedAlert.enforcementAgency || 'GI Taskforce'}</strong>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
