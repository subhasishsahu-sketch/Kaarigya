import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ProductPassport } from '../../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft, 
  ExternalLink, 
  FileWarning, 
  Info, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const CounterfeitAlertView: React.FC<{ product?: ProductPassport }> = ({ product }) => {
  const navigate = useNavigate();
  const { showNotification, setRole } = useApp();

  const handleReport = () => {
    showNotification('Report filed with Utkalika Cooperative Legal & Trust Desk.', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center space-x-2 text-xs text-[#73776A] hover:text-[#2C2E29] font-bold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Safe Catalog</span>
      </button>

      {/* Main Alert Warning Banner */}
      <div className="bg-white border-2 border-[#A25247] rounded-[36px] p-6 sm:p-10 space-y-6 craft-shadow-subtle relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#A25247]/20 pb-6">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#A25247]/10 text-[#A25247] flex items-center justify-center shrink-0 border border-[#A25247]/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-[#A25247] uppercase tracking-[0.2em]">
                  Counterfeit Intelligence Alert
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A25247] text-white text-[10px] font-bold">
                  HIGH RISK (87%)
                </span>
              </div>
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29] mt-1">
                Product Requires Attention
              </h1>
              <p className="text-xs text-[#73776A] mt-1">
                Our anomaly detection protocol detected critical inconsistencies between this item and registered provenance evidence.
              </p>
            </div>
          </div>

          <RiskBadge riskPercentage={87} level="high" />
        </div>

        {/* Verification Summary Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#BC8E6D]/10 border border-[#BC8E6D]/25 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#BC8E6D]">Passport ID Status</span>
            <div className="font-bold text-[#2C2E29]">Valid (Reused)</div>
            <p className="text-[11px] text-[#73776A]">Original issued for CRAFT-00124</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#A25247]/10 border border-[#A25247]/25 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A25247]">Physical Craft Match</span>
            <div className="font-bold text-[#A25247]">Low (38% Similarity)</div>
            <p className="text-[11px] text-[#73776A]">Machine screen print on polyester</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#A25247]/10 border border-[#A25247]/25 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A25247]">Seller Affiliation</span>
            <div className="font-bold text-[#A25247]">Unlinked Seller</div>
            <p className="text-[11px] text-[#73776A]">No guild or cooperative record</p>
          </div>
        </div>

        {/* Detailed Reasons */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
            Evidence-Based Risk Findings
          </h3>
          <ul className="space-y-2.5 text-xs text-[#2C2E29]">
            <li className="flex items-start space-x-2">
              <span className="text-[#A25247] font-bold">•</span>
              <span><strong>Product Texture Mismatch:</strong> Imagery shows synthetic 2D screen printing rather than authentic hand-cut 3D Pipli appliqué needlework.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#A25247] font-bold">•</span>
              <span><strong>Passport Reuse:</strong> The QR code links to Sita Devi's one-of-a-kind tapestry, but is being reused on 14 bulk factory inventory items.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#A25247] font-bold">•</span>
              <span><strong>Seller Identity:</strong> The merchant <em>'CraftHubExpress'</em> has no registered artisan affiliation with Utkalika Cooperative.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#A25247] font-bold">•</span>
              <span><strong>Severe Price Anomaly:</strong> Offered for ₹899 vs the verified artisan minimum cost-of-production floor of ₹5,000.</span>
            </li>
          </ul>
        </div>

        {/* Advisory Note */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] text-[11px] text-[#73776A] space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-[#2C2E29]">
            <Info className="w-3.5 h-3.5 text-[#BC8E6D]" />
            <span>Advisory Notice</span>
          </div>
          <p>
            Kalakriti provides evidence-based risk assessment to protect consumers and heritage artisans. This is not a formal legal determination, but strongly indicates non-authentic manufacture.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#A25247]/20">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReport}
              className="px-5 py-2.5 bg-[#A25247] text-white text-xs font-semibold rounded-full hover:bg-[#8B443B] transition-colors shadow-xs"
            >
              Report Suspicious Listing
            </button>
            <button
              onClick={() => { setRole('cooperative'); navigate('coop-disputes'); }}
              className="px-5 py-2.5 bg-white border border-[#DCD7CF] text-xs font-semibold text-[#2C2E29] rounded-full hover:bg-[#E8E4DD] transition-colors"
            >
              Open Dispute File (Cooperative View)
            </button>
          </div>

          <button
            onClick={() => navigate('/verify-passport')}
            className="text-xs text-[#BC8E6D] font-bold uppercase tracking-wider hover:underline"
          >
            View Original Authentic Passport →
          </button>
        </div>

      </div>

    </div>
  );
};
