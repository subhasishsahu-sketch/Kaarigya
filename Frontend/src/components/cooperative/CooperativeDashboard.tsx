import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  IndianRupee, 
  ShieldAlert, 
  Scale, 
  FileCheck2, 
  ChevronRight,
  TrendingUp,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { mockCooperativeStats } from '../../data/mockData';
import { VerificationStatusTag } from '../common/TrustBadge';

export const CooperativeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products, alerts, disputes, artisans, t, setActiveProductId } = useApp();

  const pendingVerification = products.filter(p => p.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP HEADER & OPERATIONAL CLUSTER INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCD7CF] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] text-[#BC8E6D] font-bold uppercase tracking-[0.2em]">
            <Building2 className="w-4 h-4 text-[#5D634C]" />
            <span>Utkalika Apex Society • Regional Audit Node #OD-042</span>
          </div>
          <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29] mt-1">
            {t.overview} — Cooperative Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#73776A]">
            {t.compensationDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/coop/verification')}
            className="px-4 py-2 bg-[#5D634C] text-[#FAF8F5] rounded-full text-xs font-semibold hover:bg-[#4A4F3C] shadow-xs flex items-center space-x-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{t.navVerificationQueue} ({pendingVerification.length})</span>
          </button>

          <button
            onClick={() => navigate('/coop/disputes')}
            className="px-4 py-2 bg-[#BC8E6D] text-white rounded-full text-xs font-semibold hover:bg-[#9c6e4f] shadow-xs flex items-center space-x-2"
          >
            <Scale className="w-4 h-4" />
            <span>{t.navDisputes} ({disputes.filter(d => d.status === 'open').length})</span>
          </button>

          <button
            onClick={() => navigate('/coop/alerts')}
            className="px-4 py-2 bg-white border border-[#DCD7CF] text-[#2C2E29] rounded-full text-xs font-semibold hover:bg-[#E8E4DD] flex items-center space-x-2 shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-[#A25247]" />
            <span>{t.navAlerts} ({alerts.filter(a => a.status === 'investigating').length})</span>
          </button>
        </div>
      </div>

      {/* 2. SIX ESSENTIAL OPERATIONAL METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Metric 1: Products */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#73776A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Products</span>
            <Package className="w-4 h-4 text-[#73776A]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            {mockCooperativeStats.totalProducts.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#73776A]">Total Catalogued</span>
        </div>

        {/* Metric 2: Verified */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#5D634C]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Verified</span>
            <CheckCircle2 className="w-4 h-4 text-[#5D634C]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#5D634C]">
            {mockCooperativeStats.verifiedProducts.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#5D634C]">Passports Sealed</span>
        </div>

        {/* Metric 3: Pending */}
        <div 
          onClick={() => navigate('/coop/verification')}
          className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 hover:border-[#BC8E6D] transition-colors cursor-pointer craft-shadow-subtle"
        >
          <div className="flex items-center justify-between text-xs text-[#BC8E6D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending</span>
            <Clock className="w-4 h-4 text-[#BC8E6D]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#BC8E6D]">
            {pendingVerification.length}
          </div>
          <span className="text-[10px] text-[#BC8E6D] font-bold">Review In Queue →</span>
        </div>

        {/* Metric 4: Suspicious */}
        <div 
          onClick={() => navigate('/coop/alerts')}
          className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 hover:border-[#A25247] transition-colors cursor-pointer craft-shadow-subtle"
        >
          <div className="flex items-center justify-between text-xs text-[#A25247]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-[#A25247]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#A25247]">
            {mockCooperativeStats.suspiciousAlerts}
          </div>
          <span className="text-[10px] text-[#A25247] font-bold">Anomaly Alerts →</span>
        </div>

        {/* Metric 5: Artisans */}
        <div 
          onClick={() => navigate('/coop/artisans')}
          className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 hover:border-[#5D634C] transition-colors cursor-pointer craft-shadow-subtle"
        >
          <div className="flex items-center justify-between text-xs text-[#73776A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Artisans</span>
            <Users className="w-4 h-4 text-[#73776A]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            {mockCooperativeStats.activeArtisans}
          </div>
          <span className="text-[10px] text-[#73776A]">Active Guild Members</span>
        </div>

        {/* Metric 6: Compensation */}
        <div 
          onClick={() => navigate('/coop/compensation')}
          className="bg-[#5D634C]/10 border border-[#5D634C]/25 rounded-2xl p-4 space-y-1 hover:border-[#5D634C] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-[#5D634C]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Compensation</span>
            <TrendingUp className="w-4 h-4 text-[#5D634C]" />
          </div>
          <div className="font-serif italic text-xl font-bold text-[#5D634C]">
            {mockCooperativeStats.totalCompensationFormatted}
          </div>
          <span className="text-[10px] text-[#5D634C] font-semibold">Direct Disbursed</span>
        </div>

      </div>

      {/* 3. OPERATIONAL SECTIONS: VERIFICATION QUEUE, COUNTERFEIT INTELLIGENCE & DISPUTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Pending Verification Queue */}
        <div className="lg:col-span-7 bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-4 craft-shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                {t.navVerificationQueue}
              </h3>
              <p className="text-xs text-[#73776A]">
                {t.provenanceDesc}
              </p>
            </div>
            <button
              onClick={() => navigate('/coop/verification')}
              className="text-xs text-[#BC8E6D] font-bold uppercase tracking-wider hover:underline"
            >
              {t.navVerificationQueue} →
            </button>
          </div>

          <div className="divide-y divide-[#E8E4DD]">
            {pendingVerification.length === 0 ? (
              <p className="text-xs text-[#73776A] py-6 text-center">
                No items pending verification.
              </p>
            ) : (
              pendingVerification.map((prod) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img
                      src={prod.primaryImage}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#DCD7CF] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-[#2C2E29]">{prod.productId}</span>
                      <h4 className="text-xs font-bold text-[#2C2E29] truncate">{prod.name}</h4>
                      <p className="text-[11px] text-[#73776A]">
                        {t.masterArtisan}: {prod.artisan.name} • {prod.craftCategory}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveProductId(prod.productId); navigate('/coop/verification'); }}
                    className="px-4 py-2 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shrink-0 shadow-xs"
                  >
                    {t.viewEvidence}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Counterfeit Intelligence Snapshot */}
        <div className="lg:col-span-5 bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-4 craft-shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                Counterfeit Intelligence
              </h3>
              <p className="text-xs text-[#73776A]">
                Online listing scrapers & anomaly alerts
              </p>
            </div>
            <button
              onClick={() => navigate('/coop/alerts')}
              className="text-xs text-[#BC8E6D] font-bold uppercase tracking-wider hover:underline"
            >
              {t.navAlerts} →
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                onClick={() => navigate('/coop/alerts')}
                className="p-4 rounded-2xl border border-black/[0.03] bg-[#FAF8F5] hover:border-[#A25247] transition-colors cursor-pointer space-y-1.5 craft-shadow-subtle"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#A25247]">{alt.listingNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A25247]/10 text-[#A25247] text-[10px] font-bold">
                    Risk: {alt.riskPercentage}%
                  </span>
                </div>
                <div className="text-xs font-bold text-[#2C2E29] truncate">
                  {alt.productName}
                </div>
                <div className="text-[11px] text-[#73776A] line-clamp-1">
                  {alt.reasons[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. DISPUTES & EVIDENCE TRIBUNAL QUICK SUMMARY */}
      <div className="bg-[#FAF8F5] border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#BC8E6D]/15 text-[#BC8E6D] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg sm:text-xl font-bold text-[#2C2E29]">
                Dispute Resolution & Evidence Tribunal
              </h3>
              <p className="text-xs text-[#73776A]">
                Fair adjudication between buyer claims, artisan testimonies, and cryptographic logs.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/coop/disputes')}
            className="px-5 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shadow-xs flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <span>{t.navDisputes}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {disputes.slice(0, 3).map((disp) => (
            <div
              key={disp.id}
              onClick={() => navigate('/coop/disputes')}
              className="p-4 rounded-2xl bg-white border border-black/[0.03] hover:border-[#BC8E6D] transition-colors cursor-pointer space-y-2 craft-shadow-subtle"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#2C2E29]">{disp.caseNumber || disp.disputeCode}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  disp.status === 'open' 
                    ? 'bg-[#BC8E6D]/15 text-[#BC8E6D]' 
                    : disp.status === 'confirmed_counterfeit' 
                    ? 'bg-[#A25247]/15 text-[#A25247]' 
                    : 'bg-[#5D634C]/15 text-[#5D634C]'
                }`}>
                  {disp.status === 'open' ? 'Awaiting Adjudication' : disp.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-xs font-bold text-[#2C2E29] truncate">{disp.productName}</div>
              <div className="text-[11px] text-[#73776A] truncate">
                Buyer: <strong>{disp.buyerName}</strong> vs <strong>{disp.artisanName}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E8E4DD]">
                <span className="font-semibold text-[#A25247]">Risk: {disp.aiRiskScore || disp.aiRiskAssessment}%</span>
                <span className="text-[#5D634C] font-semibold">₹{(disp.escrowAmount || 5000).toLocaleString()} in Escrow</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
