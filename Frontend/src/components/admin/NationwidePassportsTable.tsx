import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Award,
  Eye,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { ProductPassport } from '../../types';
import { SafeImage } from '../common/SafeImage';

interface NationwidePassportsTableProps {
  products: ProductPassport[];
  onSelectProduct: (product: ProductPassport) => void;
  onFlagProduct: (productId: string) => void;
  onCertifyProduct: (productId: string) => void;
  onShowNotification: (msg: string, type?: 'success' | 'info') => void;
}

export const NationwidePassportsTable: React.FC<NationwidePassportsTableProps> = ({
  products,
  onSelectProduct,
  onFlagProduct,
  onCertifyProduct,
  onShowNotification
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.craftCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = stateFilter === 'all' || p.artisan.state.toLowerCase() === stateFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesState && matchesStatus;
  });

  return (
    <div className="bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E4DD] pb-6">
        <div>
          <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            Nationwide Digital Product Passports Registry
          </h2>
          <p className="text-xs text-[#73776A]">
            Comprehensive registry of authentic Indian handicrafts with cryptographic tamper-evident seals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#73776A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, artisan, craft..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
            />
          </div>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
          >
            <option value="all">All States</option>
            <option value="Odisha">Odisha</option>
            <option value="Bihar">Bihar</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Gujarat">Gujarat</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Sovereign</option>
            <option value="pending">Pending Audit</option>
            <option value="flagged">Flagged / Review</option>
          </select>
        </div>
      </div>

      {/* Passports Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#DCD7CF] text-[10px] font-bold uppercase text-[#73776A] tracking-wider">
            <tr>
              <th className="p-3.5">Product & Passport ID</th>
              <th className="p-3.5">Master Artisan</th>
              <th className="p-3.5">Craft Origin & Guild</th>
              <th className="p-3.5 text-right">Artisan Share</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Registry Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E4DD]">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const artisanPct = Math.round((p.price.artisanCompensation / p.price.retail) * 100);
                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    
                    {/* Product & ID */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <SafeImage
                          src={p.primaryImage}
                          alt={p.name}
                          craftCategory={p.craftCategory}
                          productId={p.productId}
                          className="w-10 h-10 rounded-xl object-cover border border-[#DCD7CF]"
                        />
                        <div>
                          <div className="font-serif font-bold text-sm text-[#2C2E29] line-clamp-1">
                            {p.name}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#5D634C]">
                            <span>{p.productId}</span>
                            <span>•</span>
                            <span className="text-[#73776A]">{p.craftCategory}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Artisan */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#2C2E29]">{p.artisan.name}</div>
                      <div className="text-[10px] text-[#73776A]">{p.artisan.title}</div>
                    </td>

                    {/* Origin & Guild */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1 text-[#2C2E29] font-medium">
                        <MapPin className="w-3 h-3 text-[#5D634C]" />
                        <span>{p.artisan.location}, {p.artisan.state}</span>
                      </div>
                      <div className="text-[10px] text-[#73776A]">{p.artisan.cooperativeName}</div>
                    </td>

                    {/* Price & Artisan Split */}
                    <td className="p-3.5 text-right">
                      <div className="font-serif font-bold text-sm text-[#5D634C]">
                        ₹{p.price.artisanCompensation.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#73776A]">
                        {artisanPct}% of ₹{p.price.retail.toLocaleString()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'verified'
                          ? 'bg-[#5D634C]/10 text-[#5D634C] border border-[#5D634C]/25'
                          : p.status === 'flagged'
                          ? 'bg-[#A25247]/10 text-[#A25247] border border-[#A25247]/25'
                          : 'bg-[#BC8E6D]/10 text-[#BC8E6D] border border-[#BC8E6D]/25'
                      }`}>
                        {p.status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                        {p.status === 'flagged' && <AlertTriangle className="w-3 h-3" />}
                        <span className="capitalize">{p.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectProduct(p)}
                          className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DCD7CF] hover:bg-[#E8E4DD] text-[#2C2E29] text-[11px] font-semibold transition-colors flex items-center space-x-1"
                          title="Open Digital Product Passport"
                        >
                          <Eye className="w-3 h-3 text-[#5D634C]" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => onCertifyProduct(p.productId)}
                          className="p-1.5 rounded-full bg-[#5D634C]/10 hover:bg-[#5D634C]/20 text-[#5D634C] transition-colors"
                          title="Certify Sovereign GI Status"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onFlagProduct(p.productId)}
                          className="p-1.5 rounded-full bg-[#A25247]/10 hover:bg-[#A25247]/20 text-[#A25247] transition-colors"
                          title="Quarantine / Flag for Inspection"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#73776A]">
                  No digital passports found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[#73776A] border-t border-[#E8E4DD] pt-4">
        <span>Showing {filteredProducts.length} of {products.length} registered passports nationwide</span>
        <span className="font-mono text-[10px] text-[#5D634C] font-semibold">100% Cryptographic Ledger Anchored</span>
      </div>

    </div>
  );
};
