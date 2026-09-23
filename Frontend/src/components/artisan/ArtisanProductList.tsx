import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  ExternalLink,
  QrCode
} from 'lucide-react';
import { VerificationStatusTag } from '../common/TrustBadge';
import { SafeImage } from '../common/SafeImage';

export const ArtisanProductList: React.FC = () => {
  const { currentArtisan, navigate, t } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [artisanProducts, setArtisanProducts] = useState<any[]>([]);

  useEffect(() => {
    api.products.list().then(data => {
      const filtered = data.filter((p: any) => 
        p.artisanId === currentArtisan.id || 
        (currentArtisan.email && p.artisan?.email && p.artisan.email.toLowerCase() === currentArtisan.email.toLowerCase()) ||
        (p.artisan?.name && p.artisan.name.toLowerCase() === currentArtisan.name.toLowerCase())
      );
      setArtisanProducts(filtered);
    }).catch(err => console.error("Failed to load products", err));
  }, [currentArtisan]);

  const filtered = artisanProducts.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.productId.toLowerCase().includes(q) || p.craftCategory.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('artisan-dashboard')}
            className="inline-flex items-center space-x-1 text-xs text-[#765C48] hover:text-[#25352F] font-semibold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.dashboard}</span>
          </button>
          <h1 className="font-serif text-2xl font-bold text-[#25352F]">
            {t.navProducts}
          </h1>
          <p className="text-xs text-[#6F746F]">
            Manage your registered handicraft passports and verification states.
          </p>
        </div>

        <button
          onClick={() => navigate('artisan-register')}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#B85C45] text-white text-xs font-semibold rounded-lg hover:bg-[#A34E39] shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.registerProductBtn}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#765C48] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or craft name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#D5C9B8] rounded-lg text-[#202522] focus:outline-none focus:ring-1 focus:ring-[#B85C45]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'verified', 'pending', 'flagged'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filter === st
                  ? 'bg-[#25352F] text-white'
                  : 'bg-[#FAF7F2] border border-[#D5C9B8] text-[#6F746F] hover:bg-[#E9E0D2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#D5C9B8] rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-serif font-bold text-[#25352F]">
            No products match your filter
          </p>
          <p className="text-xs text-[#6F746F]">
            "Your first product can start its digital story."
          </p>
          <button
            onClick={() => navigate('artisan-register')}
            className="px-4 py-2 bg-[#B85C45] text-white text-xs font-semibold rounded-lg"
          >
            + Register Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigate('verify-passport', prod.productId)}
              className="bg-[#FAF7F2] border border-[#D5C9B8] rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#B85C45] transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-3">
                <SafeImage
                  src={prod.primaryImage}
                  alt={prod.name}
                  craftCategory={prod.craftCategory}
                  productId={prod.productId}
                  className="w-20 h-20 rounded-lg object-cover border border-[#D5C9B8] shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#25352F]">{prod.productId}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#25352F] line-clamp-1 group-hover:text-[#B85C45] transition-colors">
                    {prod.name}
                  </h3>
                  <div className="text-[11px] text-[#765C48]">
                    {prod.craftCategory}
                  </div>
                  <div className="text-[10px] text-[#6F746F]">
                    Created: {prod.creationDate} • {prod.productionDuration}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E9E0D2] flex items-center justify-between text-xs">
                <VerificationStatusTag status={prod.status} />
                <span className="text-[#B85C45] font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Passport</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
