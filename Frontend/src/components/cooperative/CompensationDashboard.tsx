import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  TrendingUp, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Download, 
  Building2,
  DollarSign
} from 'lucide-react';

export const CompensationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products, showNotification, t } = useApp();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const totalRetail = products.reduce((acc, p) => acc + p.price.retail, 0);
  const totalArtisan = products.reduce((acc, p) => acc + p.price.artisanCompensation, 0);
  const totalCoop = products.reduce((acc, p) => acc + p.price.cooperativeShare, 0);
  const totalRawLogistics = products.reduce((acc, p) => acc + p.price.rawMaterialsLogistics, 0);

  const handleDisburseEscrow = (productId: string, artisanName: string) => {
    showNotification(`Escrow direct transfer initiated to ${artisanName} via PFMS / UPI.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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
          <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
            {t.navCompensation} — {t.compensationTitle}
          </h1>
          <p className="text-xs text-[#73776A]">
            {t.compensationDesc}
          </p>
        </div>

        <button
          onClick={() => showNotification('Audit ledger export downloaded (.CSV / .PDF)', 'info')}
          className="px-5 py-2.5 bg-white border border-[#DCD7CF] text-[#2C2E29] text-xs font-semibold rounded-full hover:bg-[#E8E4DD] flex items-center space-x-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-[#73776A]" />
          <span>Export Wage Audit Ledger</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-black/[0.03] rounded-2xl p-5 space-y-1 craft-shadow-subtle">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#73776A]">Total Catalog Value</span>
          <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            ₹{totalRetail.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#73776A]">Across all active passports</span>
        </div>

        <div className="bg-[#5D634C]/10 border border-[#5D634C]/25 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D634C]">
            Direct Artisan Share (63%)
          </span>
          <div className="font-serif italic text-2xl font-bold text-[#5D634C]">
            ₹{totalArtisan.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#5D634C] font-semibold">Secured in verified escrow</span>
        </div>

        <div className="bg-white border border-black/[0.03] rounded-2xl p-5 space-y-1 craft-shadow-subtle">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#73776A]">
            Cooperative Guild Share (15%)
          </span>
          <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            ₹{totalCoop.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#73776A]">Quality, insurance & audit</span>
        </div>

        <div className="bg-white border border-black/[0.03] rounded-2xl p-5 space-y-1 craft-shadow-subtle">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#73776A]">
            Raw Materials & Logistics (22%)
          </span>
          <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            ₹{totalRawLogistics.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#73776A]">Organic input verification</span>
        </div>

      </div>

      {/* Itemized Payouts Table */}
      <div className="bg-white border border-black/[0.03] rounded-[32px] overflow-hidden craft-shadow-subtle space-y-0">
        <div className="p-6 sm:p-8 border-b border-[#E8E4DD] flex items-center justify-between">
          <div>
            <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
              Passport-Level Compensation Breakdown
            </h3>
            <p className="text-xs text-[#73776A]">
              Direct trace of customer funds to creator bank accounts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#73776A] uppercase text-[10px] font-bold tracking-wider border-b border-[#E8E4DD]">
              <tr>
                <th className="p-4">{t.passportId}</th>
                <th className="p-4">{t.navProducts}</th>
                <th className="p-4">{t.masterArtisan}</th>
                <th className="p-4">Retail MRP</th>
                <th className="p-4 text-[#5D634C]">{t.artisanDirectPayout}</th>
                <th className="p-4">{t.cooperativeGuild}</th>
                <th className="p-4">Escrow State</th>
                <th className="p-4 text-right">{t.confirm}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DD]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#2C2E29]">{p.productId}</td>
                  <td className="p-4 font-medium text-[#2C2E29]">{p.name}</td>
                  <td className="p-4 text-[#73776A]">{p.artisan.name}</td>
                  <td className="p-4 font-bold text-[#2C2E29]">₹{p.price.retail.toLocaleString()}</td>
                  <td className="p-4 font-bold text-[#5D634C]">
                    ₹{p.price.artisanCompensation.toLocaleString()} ({Math.round((p.price.artisanCompensation/p.price.retail)*100)}%)
                  </td>
                  <td className="p-4 text-[#73776A]">₹{p.price.cooperativeShare.toLocaleString()}</td>
                  <td className="p-4">
                    {p.status === 'verified' ? (
                      <span className="px-3 py-1 rounded-full bg-[#5D634C]/10 text-[#5D634C] text-[10px] font-bold">
                        ✓ {t.statusVerified}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] text-[10px] font-bold">
                        {t.statusPending}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDisburseEscrow(p.productId, p.artisan.name)}
                      className="px-4 py-1.5 bg-[#5D634C] text-[#FAF8F5] text-[10px] font-semibold rounded-full hover:bg-[#4A4F3C]"
                    >
                      Instant Disburse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
