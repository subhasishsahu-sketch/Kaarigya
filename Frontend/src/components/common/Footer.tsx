import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, t } = useApp();

  return (
    <footer className="bg-[#4A4F3C] text-[#F4F1ED] border-t border-[#5D634C]/40 pt-12 pb-8 mt-20 relative overflow-hidden">
      {/* Decorative top motif */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#BC8E6D] to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#5D634C]/50">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#BC8E6D] flex items-center justify-center text-white font-serif font-bold text-base">
                क
              </div>
              <span className="font-serif italic text-xl font-bold tracking-tight text-[#FAF8F5]">Kaarigya</span>
            </div>
            <p className="text-xs text-[#E8E4DD] leading-relaxed">
              Where Craft Meets Trust. Authentic provenance and tamper-evident Digital Product Passports dedicated to Indian handicrafts and heritage artisans.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#BC8E6D] font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>National Handicraft Provenance Registry</span>
            </div>
          </div>

          {/* Core Principles */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">{t.provenanceTitle}</h4>
            <ul className="space-y-2 text-xs text-[#E8E4DD]">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8E4DD]" />
                <span>Verified Handcrafted Identity</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8E4DD]" />
                <span>Master Artisan Attribution</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8E4DD]" />
                <span>Geographical Indication (GI)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8E4DD]" />
                <span>Transparent Artisan Earnings</span>
              </li>
            </ul>
          </div>

          {/* Quick Workspaces */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">Workspaces</h4>
            <ul className="space-y-2 text-xs text-[#E8E4DD]">
              <li>
                <button onClick={() => { setRole('buyer'); navigate('/'); }} className="hover:text-white transition-colors">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => { setRole('artisan'); navigate('/artisan/dashboard'); }} className="hover:text-white transition-colors">
                  {t.dashboard}
                </button>
              </li>
              <li>
                <button onClick={() => { setRole('cooperative'); navigate('/coop/overview'); }} className="hover:text-white transition-colors">
                  {t.overview}
                </button>
              </li>
              <li>
                <button onClick={() => { setRole('admin'); navigate('/admin/overview'); }} className="hover:text-white transition-colors">
                  {t.systemAudit}
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">Standards Alignment</h4>
            <p className="text-[11px] text-[#D5CFC5] leading-relaxed">
              Aligned with EU DPP standards, ONDC craft taxonomy, GI Registry of India, and Silk Mark Certification.
            </p>
            <div className="pt-2 text-[11px] text-[#E8E4DD] flex items-center space-x-1.5">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-[#BC8E6D] inline fill-[#BC8E6D]" />
              <span>for Indian Artisans</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#D5CFC5]/80">
          <div>
            © 2026 Kaarigya. Where Craft Meets Trust — Preserving Indian craft heritage and empowering traditional artisans.
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>Privacy & Evidence Security</span>
            <span>•</span>
            <span>Immutable Provenance Ledger</span>
            <span>•</span>
            <span>GI Protection Act</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
