import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Award, 
  FileCheck2,
  Lock,
  Layers
} from 'lucide-react';
import { mockAdminStats, mockCraftClusters } from '../../data/mockData';

interface NationalAuditDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'info') => void;
}

export const NationalAuditDossierModal: React.FC<NationalAuditDossierModalProps> = ({
  isOpen,
  onClose,
  onShowNotification
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `NATIONAL DIGITAL PRODUCT PASSPORT REGISTRY
Ministry of Textiles & Handicrafts • Government of India
Official Compliance & Geographical Indication Audit Dossier (Ref: GOI-MOT-2026-D981)

• Total Registered Passports: 18,450
• Verified Biometric Artisans: 4,820
• Active Apex Cooperative Nodes: 142
• Total Direct Wage Disbursed: ₹14.8 Crore (Average 65% Direct Share)
• Neutralized Counterfeits: 342
• Cryptographic Ledger Integrity: 100% Valid (99.98% System Uptime)

Active GI Craft Hubs:
${mockCraftClusters.map(c => `- ${c.clusterName} (${c.giTag}) - ${c.state}: ${c.totalProducts} Passports, ${c.totalWageDisbursed} Disbursed`).join('\n')}

Issued by: Directorate of Handicraft Development & GI Preservation`;

    navigator.clipboard?.writeText(summary);
    onShowNotification('National Audit Dossier summary copied to clipboard', 'success');
  };

  const handleExportJSON = () => {
    const dossierData = {
      registryTitle: "National Digital Product Passport Registry",
      authority: "Ministry of Textiles, Government of India",
      dossierReference: "GOI-MOT-2026-D981",
      generatedAt: new Date().toISOString(),
      stats: mockAdminStats,
      activeClusters: mockCraftClusters,
      nodeConsensus: [
        { node: "Node 1 (NIC / GoI Root)", status: "HEALTHY", latencyMs: 24 },
        { node: "Node 2 (Odisha State Apex Node)", status: "HEALTHY", latencyMs: 18 },
        { node: "Node 3 (Karnataka Craft Board Node)", status: "HEALTHY", latencyMs: 21 },
        { node: "Node 4 (Bihar Folk Guild Node)", status: "HEALTHY", latencyMs: 26 },
        { node: "Node 5 (Field Biometric Validator Node)", status: "HEALTHY", latencyMs: 31 }
      ],
      complianceCertification: {
        giProtectionStandard: "Compliant with GI Act 1999",
        minimumWageFloorEnforced: true,
        wageFloorPercentage: 60,
        tamperEvidentLedgerRoot: "0x7e29b19...f39a4"
      }
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `National_Handicraft_Audit_Dossier_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowNotification('Audit dossier exported as JSON', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DCD7CF] rounded-[32px] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Top Modal Bar (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-[#4A4F3C] text-[#FAF8F5] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-5 h-5 text-[#BC8E6D]" />
            <div>
              <h2 className="font-serif italic text-lg font-bold">
                National Handicraft Compliance & GI Audit Dossier
              </h2>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#BC8E6D]">
                Ref: GOI-MOT-2026-D981 • Official Government Record
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs transition-colors"
              title="Copy Summary Text"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportJSON}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs transition-colors"
              title="Export JSON Data"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-[#BC8E6D] hover:bg-[#A77756] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#E8E4DD] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-[#FAF8F5]">
          
          {/* Printable Document Header */}
          <div className="border-b-2 border-[#5D634C] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full bg-[#5D634C]/10 border border-[#5D634C]/30 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-[#5D634C]" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#BC8E6D]">
                  Government of India • Ministry of Textiles
                </div>
                <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
                  National Craft Provenance Audit Dossier
                </h1>
                <div className="text-xs text-[#73776A]">
                  Office of the Development Commissioner for Handicrafts • GI Protection Authority
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-[#73776A] space-y-0.5">
              <div><strong>Audit Code:</strong> MOT-GI-2026-981</div>
              <div><strong>Audit Period:</strong> FY 2026-27 (Q2)</div>
              <div><strong>Status:</strong> <span className="text-[#5D634C] font-bold">SOVEREIGN COMPLIANT</span></div>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-[#DCD7CF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#73776A] tracking-wider">Registered Passports</span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">18,450</div>
              <span className="text-[10px] text-[#5D634C] font-semibold">100% Cryptographic Trace</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DCD7CF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#73776A] tracking-wider">Verified Artisans</span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">4,820</div>
              <span className="text-[10px] text-[#5D634C] font-semibold">Biometric KYC Linked</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DCD7CF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#73776A] tracking-wider">Direct Payout</span>
              <div className="font-serif italic text-2xl font-bold text-[#5D634C]">₹14.80 Cr</div>
              <span className="text-[10px] text-[#5D634C] font-semibold">Zero Intermediary Leakage</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DCD7CF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#73776A] tracking-wider">Neutralized Clones</span>
              <div className="font-serif italic text-2xl font-bold text-[#A25247]">342</div>
              <span className="text-[10px] text-[#A25247] font-semibold">Legal Takedowns Enforced</span>
            </div>
          </div>

          {/* Section 1: Geographical Indication Cluster Audit */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#BC8E6D]">
              <MapPin className="w-4 h-4" />
              <span>1. Geographical Indication (GI) Registered Craft Hubs</span>
            </div>
            
            <div className="border border-[#DCD7CF] rounded-2xl overflow-hidden bg-white text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#DCD7CF] text-[10px] font-bold uppercase text-[#73776A] tracking-wider">
                  <tr>
                    <th className="p-3">Craft Cluster & GI Tag</th>
                    <th className="p-3">State & Guild</th>
                    <th className="p-3 text-center">Artisans</th>
                    <th className="p-3 text-right">Passports</th>
                    <th className="p-3 text-right">Direct Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DD]">
                  {mockCraftClusters.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/50">
                      <td className="p-3 font-serif font-bold text-[#2C2E29]">
                        {c.clusterName}
                        <span className="block text-[10px] font-mono font-normal text-[#5D634C]">{c.giTag}</span>
                      </td>
                      <td className="p-3 text-[#73776A]">
                        {c.state} • <span className="text-[#2C2E29] font-medium">{c.cooperativeName}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-[#2C2E29]">{c.activeArtisans}</td>
                      <td className="p-3 text-right font-mono font-semibold text-[#2C2E29]">{c.totalProducts}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#5D634C]">{c.totalWageDisbursed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Fair Wage Floor & Escrow Compliance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#BC8E6D]">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Artisan Direct Wage Floor & Escrow Policy Audit</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#DCD7CF] text-xs space-y-3">
              <p className="text-[#73776A] leading-relaxed">
                Under the National Handicraft Provenance Mandate, all products cataloged under sovereign GI tags must adhere to a minimum <strong>60% direct artisan compensation floor</strong>. During the current audit cycle:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#73776A]">Compliance Rate</div>
                  <div className="font-serif italic text-lg font-bold text-[#5D634C]">99.8% Compliant</div>
                  <p className="text-[10px] text-[#73776A]">18,414 of 18,450 met 60%+ wage floor.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#73776A]">Average Artisan Share</div>
                  <div className="font-serif italic text-lg font-bold text-[#5D634C]">65.4% of MRP</div>
                  <p className="text-[10px] text-[#73776A]">Direct PFMS transfer with no intermediary cuts.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#73776A]">Quarantined Violations</div>
                  <div className="font-serif italic text-lg font-bold text-[#A25247]">36 Flagged</div>
                  <p className="text-[10px] text-[#73776A]">Suspended pending cooperative wage adjustment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Sovereign Trust Architecture & Sign-off */}
          <div className="border-t border-[#DCD7CF] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1 text-xs text-[#73776A]">
              <div className="flex items-center space-x-1.5 font-mono text-[#5D634C] font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>SHA-256 State Root: 0x7e29b19...f39a4 (Quorum Confirmed)</span>
              </div>
              <p>Generated by Kalakriti Sovereign National Registry Architecture</p>
            </div>

            <div className="text-right space-y-1 border-t sm:border-t-0 sm:border-l border-[#DCD7CF] pt-4 sm:pt-0 sm:pl-6">
              <div className="font-serif italic font-bold text-sm text-[#2C2E29]">
                Dr. Alok Verma, IAS
              </div>
              <div className="text-[11px] text-[#73776A]">
                Development Commissioner (Handicrafts)<br />Ministry of Textiles, Government of India
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#5D634C]/10 text-[10px] font-mono font-bold text-[#5D634C] mt-1">
                ✓ Digitally Signed & Sealed
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
