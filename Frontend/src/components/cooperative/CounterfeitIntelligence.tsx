import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  ArrowLeft, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Filter, 
  TrendingDown, 
  Scale,
  Eye,
  FileWarning,
  Map as MapIcon,
  Layers,
  Factory,
  Navigation,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { CounterfeitAlert } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { CounterfeitSurveillanceMap } from '../location/CounterfeitSurveillanceMap';

export const CounterfeitIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, resolveAlert, showNotification, t } = useApp();
  const [selectedAlert, setSelectedAlert] = useState<CounterfeitAlert | null>(alerts[0] || null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'resolved'>('all');
  const [activeTab, setActiveTab] = useState<'map_and_cases' | 'map_only' | 'docket_only'>('map_and_cases');
  const [l2Dashboard, setL2Dashboard] = useState<any>(null);
  const [loadingL2, setLoadingL2] = useState<boolean>(false);

  const fetchLayer2Data = async () => {
    setLoadingL2(true);
    try {
      const data = await api.counterfeit.getIntelligenceDashboard();
      if (data) {
        setL2Dashboard(data);
      }
    } catch (err: any) {
      console.warn("Could not fetch Layer 2 intelligence:", err.message);
    } finally {
      setLoadingL2(false);
    }
  };

  useEffect(() => {
    fetchLayer2Data();
  }, []);

  const highRiskCount = alerts.filter(a => a.riskLevel === 'high' && a.status !== 'resolved').length;
  const mediumRiskCount = alerts.filter(a => a.riskLevel === 'medium' && a.status !== 'resolved').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'high') return a.riskLevel === 'high' && a.status !== 'resolved';
    if (filter === 'medium') return a.riskLevel === 'medium' && a.status !== 'resolved';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  const handleIssueTakedown = (alertId: string) => {
    showNotification('Legal notice dispatched to marketplace under GI Act & IP Enforcement.', 'success');
    resolveAlert(alertId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD7CF] pb-4">
        <div>
          <button
            onClick={() => navigate('/coop/overview')}
            className="inline-flex items-center space-x-1.5 text-xs text-[#73776A] hover:text-[#2C2E29] font-bold uppercase tracking-wider mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.overview}</span>
          </button>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-[#A25247]" />
            <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
              Counterfeit Intelligence & Geographic Surveillance
            </h1>
          </div>
          <p className="text-xs text-[#73776A] mt-1">
            Nationwide geospatial radar mapping counterfeit discoveries, industrial imitation mills, and provenance displacement.
          </p>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="flex items-center space-x-1.5 p-1 bg-[#E8E4DD] rounded-full border border-[#DCD7CF] text-xs">
          <button
            onClick={() => setActiveTab('map_and_cases')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'map_and_cases'
                ? 'bg-[#5D634C] text-[#FAF8F5] shadow-xs'
                : 'text-[#73776A] hover:text-[#2C2E29]'
            }`}
          >
            Radar & Cases
          </button>
          <button
            onClick={() => setActiveTab('map_only')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'map_only'
                ? 'bg-[#5D634C] text-[#FAF8F5] shadow-xs'
                : 'text-[#73776A] hover:text-[#2C2E29]'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Map Only</span>
          </button>
          <button
            onClick={() => setActiveTab('docket_only')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'docket_only'
                ? 'bg-[#5D634C] text-[#FAF8F5] shadow-xs'
                : 'text-[#73776A] hover:text-[#2C2E29]'
            }`}
          >
            Docket Only
          </button>
        </div>
      </div>

      {/* 3 Status Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#A25247]/30 rounded-2xl p-5 flex items-center justify-between craft-shadow-subtle">
          <div>
            <span className="text-[10px] text-[#A25247] font-bold uppercase tracking-wider">High Risk Alerts</span>
            <div className="font-serif italic text-3xl font-bold text-[#A25247] mt-0.5">{highRiskCount}</div>
            <span className="text-[10px] text-[#73776A]">Immediate Legal Action Required</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#A25247]/10 text-[#A25247] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#BC8E6D]/30 rounded-2xl p-5 flex items-center justify-between craft-shadow-subtle">
          <div>
            <span className="text-[10px] text-[#BC8E6D] font-bold uppercase tracking-wider">Medium Risk Anomaly</span>
            <div className="font-serif italic text-3xl font-bold text-[#BC8E6D] mt-0.5">{mediumRiskCount}</div>
            <span className="text-[10px] text-[#73776A]">Industrial Mills Under Review</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#BC8E6D]/10 text-[#BC8E6D] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#5D634C]/30 rounded-2xl p-5 flex items-center justify-between craft-shadow-subtle">
          <div>
            <span className="text-[10px] text-[#5D634C] font-bold uppercase tracking-wider">Resolved Takedowns</span>
            <div className="font-serif italic text-3xl font-bold text-[#5D634C] mt-0.5">{resolvedCount}</div>
            <span className="text-[10px] text-[#5D634C] font-semibold">Artisan GI Trademarks Protected</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Geospatial Counterfeit Map Section */}
      {(activeTab === 'map_and_cases' || activeTab === 'map_only') && (
        <section className="space-y-3">
          <CounterfeitSurveillanceMap
            alerts={useMemo(() => {
              if (l2Dashboard && Array.isArray(l2Dashboard.incidents) && l2Dashboard.incidents.length > 0) {
                const backendMapped: CounterfeitAlert[] = l2Dashboard.incidents.map((inc: any) => {
                  const riskPct = Math.round((inc.risk_score || (1.0 - (inc.authentication_score || 0.3))) * 100);
                  const rLevel = riskPct >= 75 ? 'high' : riskPct >= 40 ? 'medium' : 'low';
                  return {
                    id: inc.incident_id,
                    alertCode: inc.incident_id,
                    listingNumber: inc.incident_id,
                    productId: inc.product_id || 'P-001',
                    productName: `Incident ${inc.incident_id} (${inc.product_id || 'Craft'})`,
                    riskPercentage: riskPct,
                    riskLevel: rLevel,
                    reasons: [inc.final_decision || 'COUNTERFEIT / SUSPICIOUS', `Confidence: ${inc.confidence || 'MEDIUM'}`],
                    detectedUrl: inc.location_source || 'Market Surveillance',
                    priceAnomaly: '-45%',
                    imageSimilarity: inc.authentication_score || 0.35,
                    passportReused: false,
                    sellerMismatch: true,
                    detectionLocation: {
                      latitude: inc.latitude ?? 20.8000,
                      longitude: inc.longitude ?? 83.5000,
                      city: inc.city || 'Regional Hub',
                      state: inc.state || 'India',
                      facilityType: inc.facility_type || 'Unverified Marketplace',
                      address: `${inc.city || 'Hub'}, ${inc.state || 'India'}`,
                      region: inc.country || 'India',
                      interceptionType: inc.location_source === 'USER_GPS' ? 'physical_seizure' : 'ip_geolocation'
                    },
                    genuineOrigin: {
                      latitude: 19.9850,
                      longitude: 85.8340,
                      city: 'Pipli',
                      state: 'Odisha',
                      clusterName: 'Pipli Appliqué GI Guild'
                    },
                    distanceFromOriginKm: inc.distance_from_origin_km || 420,
                    seizureVolume: inc.seizure_volume || 150,
                    enforcementAgency: 'GI Taskforce',
                    reportedDate: inc.timestamp || new Date().toISOString().split('T')[0],
                    status: inc.status === 'RESOLVED' ? 'resolved' : 'investigating'
                  };
                });
                return [...backendMapped, ...alerts];
              }
              return alerts;
            }, [l2Dashboard, alerts])}
            selectedAlert={selectedAlert}
            onSelectAlert={(alt) => setSelectedAlert(alt)}
            onIssueTakedown={handleIssueTakedown}
            onRefresh={fetchLayer2Data}
            isLoadingData={loadingL2}
          />
        </section>
      )}

      {/* Main Workspace (Alert List & Case Investigation) */}
      {(activeTab === 'map_and_cases' || activeTab === 'docket_only') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Alert Cards List */}
          <div className="lg:col-span-5 space-y-3">
            
            <div className="flex items-center justify-between border-b border-[#DCD7CF] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C2E29]">
                Active Infringement Docket
              </h3>
              <span className="text-[10px] text-[#73776A] font-mono">
                {filteredAlerts.length} Cases
              </span>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-[#5D634C] text-white shadow-xs' : 'bg-white border border-[#DCD7CF] text-[#73776A]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === 'high' ? 'bg-[#A25247] text-white shadow-xs' : 'bg-white border border-[#DCD7CF] text-[#73776A]'
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === 'medium' ? 'bg-[#BC8E6D] text-white shadow-xs' : 'bg-white border border-[#DCD7CF] text-[#73776A]'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === 'resolved' ? 'bg-[#5D634C] text-white shadow-xs' : 'bg-white border border-[#DCD7CF] text-[#73776A]'
                }`}
              >
                Resolved
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredAlerts.map((alt) => {
                const isSelected = selectedAlert?.id === alt.id;
                return (
                  <div
                    key={alt.id}
                    onClick={() => setSelectedAlert(alt)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-white border-[#A25247] ring-1 ring-[#A25247]/20 craft-shadow-subtle'
                        : 'bg-[#FAF8F5] border-black/[0.03] hover:bg-white hover:border-[#DCD7CF]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#2C2E29]">{alt.listingNumber}</span>
                      <RiskBadge riskPercentage={alt.riskPercentage} level={alt.riskLevel} />
                    </div>

                    <h4 className="text-xs font-bold text-[#2C2E29]">{alt.productName}</h4>
                    
                    {/* Location preview tag */}
                    {alt.detectionLocation && (
                      <div className="flex items-center space-x-1 text-[10px] text-[#A25247] bg-[#A25247]/10 px-2 py-1 rounded-lg">
                        <Factory className="w-3 h-3 shrink-0" />
                        <span className="truncate">Found at: <strong>{alt.detectionLocation.city}</strong> ({alt.distanceFromOriginKm} km from {alt.genuineOrigin?.city || 'Origin'})</span>
                      </div>
                    )}

                    <div className="text-[11px] text-[#73776A] space-y-0.5">
                      <div>Original Artisan: <strong>{alt.originalArtisan}</strong></div>
                      <div>Suspected Seller: <strong className="text-[#A25247]">{alt.suspectedSeller}</strong> ({alt.platform})</div>
                    </div>

                    <div className="pt-2 border-t border-[#E8E4DD] flex items-center justify-between text-[11px]">
                      <span className="text-[#73776A] font-mono">{alt.reportedDate}</span>
                      <span className="text-[#BC8E6D] font-bold uppercase tracking-wider flex items-center space-x-1">
                        <span>Forensic Details</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Alert Investigation Detail */}
          {selectedAlert ? (
            <div className="lg:col-span-7 bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8E4DD] pb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-[#A25247]">{selectedAlert.alertCode}</span>
                    <span className="text-xs text-[#73776A]">• {selectedAlert.reportedDate}</span>
                  </div>
                  <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29] mt-1">
                    {selectedAlert.productName}
                  </h2>
                  <p className="text-xs text-[#73776A]">
                    Detected on marketplace: <strong>{selectedAlert.platform}</strong>
                  </p>
                </div>

                <RiskBadge riskPercentage={selectedAlert.riskPercentage} level={selectedAlert.riskLevel} />
              </div>

              {/* Forensic Findings Box */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                  Forensic Anomaly Findings
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-1 craft-shadow-subtle">
                    <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Image Similarity</span>
                    <div className="font-bold text-[#A25247]">{selectedAlert.imageSimilarity}% Visual Match</div>
                    <p className="text-[11px] text-[#73776A]">Images scraped from original artisan portfolio</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-1 craft-shadow-subtle">
                    <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Price Discrepancy</span>
                    <div className="font-bold text-[#A25247]">{selectedAlert.priceAnomaly}</div>
                    <p className="text-[11px] text-[#73776A]">Far below fair handcrafted wage floor</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-1 craft-shadow-subtle">
                    <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Passport Status</span>
                    <div className="font-bold text-[#2C2E29]">{selectedAlert.passportReused ? '⚠ Tag Reused on Multiple Items' : 'Tag Spoofed'}</div>
                    <p className="text-[11px] text-[#73776A]">Linked to {selectedAlert.productId}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-1 craft-shadow-subtle">
                    <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Seller Association</span>
                    <div className="font-bold text-[#A25247]">Unverified Third-Party</div>
                    <p className="text-[11px] text-[#73776A]">No guild membership or KYC on file</p>
                  </div>

                  {/* Geospatial Discovery Details Box */}
                  {selectedAlert.detectionLocation && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#A25247]/20 space-y-2 craft-shadow-subtle sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#A25247] uppercase font-bold tracking-wider flex items-center space-x-1">
                          <Factory className="w-3.5 h-3.5" />
                          <span>Geospatial Seizure & Production Anomaly</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#A25247]">
                          {selectedAlert.distanceFromOriginKm} km from GI Cluster
                        </span>
                      </div>
                      
                      <div className="font-bold text-[#2C2E29]">
                        Found at: {selectedAlert.detectionLocation.city}, {selectedAlert.detectionLocation.state}
                      </div>

                      <p className="text-[11px] text-[#73776A]">
                        Facility: <strong>{selectedAlert.detectionLocation.facilityType}</strong> ({selectedAlert.detectionLocation.address || selectedAlert.detectionLocation.region}). Registered authentic origin is in <strong>{selectedAlert.genuineOrigin?.city || selectedAlert.registeredLocation}</strong>.
                      </p>

                      <div className="text-[10px] text-[#5D634C] font-semibold flex items-center space-x-1.5 pt-1 border-t border-[#DCD7CF]/60">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Enforcing Agency: {selectedAlert.enforcementAgency || 'National Handloom & GI Registry Squad'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reasons List */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                  Detailed Evidence Chain
                </h3>
                <ul className="space-y-2 text-xs text-[#2C2E29]">
                  {selectedAlert.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#A25247] font-bold mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8E4DD] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleIssueTakedown(selectedAlert.id)}
                  className="px-5 py-2.5 bg-[#A25247] text-white text-xs font-semibold rounded-full hover:bg-[#8B443B] transition-colors shadow-xs cursor-pointer"
                >
                  Issue Automated GI Takedown Notice
                </button>

                <button
                  onClick={() => { resolveAlert(selectedAlert.id); }}
                  className="px-5 py-2.5 bg-white border border-[#5D634C] text-[#5D634C] text-xs font-semibold rounded-full hover:bg-[#5D634C]/10 transition-colors cursor-pointer"
                >
                  {t.statusVerified}
                </button>
              </div>

            </div>
          ) : null}

        </div>
      )}

    </div>
  );
};

