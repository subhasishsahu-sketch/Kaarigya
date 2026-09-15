import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Printer, 
  RefreshCw, 
  Lock, 
  Users, 
  CreditCard,
  FileCheck2
} from 'lucide-react';

interface SettlementItem {
  id: string;
  artisanName: string;
  artisanAvatar: string;
  cooperativeName: string;
  state: string;
  productId: string;
  productName: string;
  retailPrice: number;
  artisanCompensation: number;
  percentage: number;
  bankAccountMasked: string;
  status: 'pending' | 'processing' | 'settled';
  timestamp: string;
}

interface BatchSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amountDisbursed: number, count: number) => void;
}

export const BatchSettlementModal: React.FC<BatchSettlementModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [settlementList, setSettlementList] = useState<SettlementItem[]>([
    {
      id: 'SETTLE-001',
      artisanName: 'Sita Devi Mahapatra',
      artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      cooperativeName: 'Utkalika Apex Society',
      state: 'Odisha',
      productId: 'CRAFT-00124',
      productName: 'Peacock Garden Appliqué Pillow Cover',
      retailPrice: 5000,
      artisanCompensation: 3250,
      percentage: 65,
      bankAccountMasked: 'SBIN••••4921',
      status: 'pending',
      timestamp: 'Today, 08:30 AM'
    },
    {
      id: 'SETTLE-002',
      artisanName: 'Ramesh Kumar Sahu',
      artisanAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      cooperativeName: 'Dhenkanal Bell Metal Society',
      state: 'Odisha',
      productId: 'CRAFT-00125',
      productName: 'Ancient Tribal Dhokra Dancing Trio',
      retailPrice: 12500,
      artisanCompensation: 8125,
      percentage: 65,
      bankAccountMasked: 'HDFC••••8102',
      status: 'pending',
      timestamp: 'Today, 09:15 AM'
    },
    {
      id: 'SETTLE-003',
      artisanName: 'Meenakshi Devi',
      artisanAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      cooperativeName: 'Mithila Folk Artists Guild',
      state: 'Bihar',
      productId: 'CRAFT-00126',
      productName: 'Tree of Life Madhubani Silk Scroll',
      retailPrice: 8500,
      artisanCompensation: 5950,
      percentage: 70,
      bankAccountMasked: 'PUNB••••1209',
      status: 'pending',
      timestamp: 'Yesterday, 04:20 PM'
    },
    {
      id: 'SETTLE-004',
      artisanName: 'Venkatesh Rao',
      artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      cooperativeName: 'Karnataka Craft Development Board',
      state: 'Karnataka',
      productId: 'CRAFT-00127',
      productName: 'Royal Lacquer Turned Toy Set',
      retailPrice: 3200,
      artisanCompensation: 2080,
      percentage: 65,
      bankAccountMasked: 'CANR••••9932',
      status: 'pending',
      timestamp: 'Yesterday, 06:10 PM'
    },
    {
      id: 'SETTLE-005',
      artisanName: 'Santosh Meher',
      artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      cooperativeName: 'Bargarh Weavers Apex Society',
      state: 'Odisha',
      productId: 'CRAFT-00128',
      productName: 'Sambalpuri Double Ikat Silk Dupatta',
      retailPrice: 18000,
      artisanCompensation: 11700,
      percentage: 65,
      bankAccountMasked: 'BARB••••7419',
      status: 'pending',
      timestamp: '18 Aug 2026'
    }
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>(['SETTLE-001', 'SETTLE-002', 'SETTLE-003', 'SETTLE-004', 'SETTLE-005']);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [settlementStep, setSettlementStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [transactionRef, setTransactionRef] = useState<string>('');

  if (!isOpen) return null;

  const totalSelectedAmount = settlementList
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.artisanCompensation, 0);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === settlementList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(settlementList.map(i => i.id));
    }
  };

  const handleExecuteSettlement = () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    setSettlementStep(1);

    setTimeout(() => {
      setSettlementStep(2);
      setTimeout(() => {
        setSettlementStep(3);
        setTimeout(() => {
          setIsProcessing(false);
          setIsCompleted(true);
          const ref = `PFMS-IND-${Math.floor(100000 + Math.random() * 900000)}`;
          setTransactionRef(ref);
          setSettlementList(prev => 
            prev.map(item => 
              selectedIds.includes(item.id) 
                ? { ...item, status: 'settled' } 
                : item
            )
          );
          onSuccess(totalSelectedAmount, selectedIds.length);
        }, 800);
      }, 900);
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DCD7CF] rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="bg-[#4A4F3C] text-[#FAF8F5] p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#BC8E6D]/20 border border-[#BC8E6D]/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#BC8E6D]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-[#BC8E6D] tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>National Escrow & PFMS Direct Settlement</span>
              </div>
              <h2 className="font-serif italic text-xl font-bold">
                Direct Artisan Wage Settlement Batch
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#E8E4DD] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isCompleted ? (
          <div className="p-6 space-y-6">
            
            {/* Context Notice */}
            <div className="p-4 rounded-2xl bg-[#E8E4DD]/60 border border-[#DCD7CF] text-xs text-[#5D634C] flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#5D634C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C2E29]">Sovereign Fair Wage Guarantee:</strong>{' '}
                These funds were locked in escrow when the respective Digital Product Passports passed cooperative physical audit. Upon execution, funds are directly remitted to verified artisan bank accounts via PFMS / UPI.
              </div>
            </div>

            {/* Selection Summary Bar */}
            <div className="flex items-center justify-between border-b border-[#DCD7CF] pb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAll}
                  className="text-xs font-bold text-[#5D634C] hover:underline"
                >
                  {selectedIds.length === settlementList.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs text-[#73776A]">
                  ({selectedIds.length} of {settlementList.length} selected)
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#73776A] font-bold block">
                  Total Disbursable Amount
                </span>
                <span className="font-serif italic text-xl font-bold text-[#5D634C]">
                  ₹{totalSelectedAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Artisan Wage Queue */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {settlementList.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white border-[#5D634C] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#DCD7CF]/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C] cursor-pointer"
                      />
                      <img
                        src={item.artisanAvatar}
                        alt={item.artisanName}
                        className="w-9 h-9 rounded-full object-cover border border-[#DCD7CF]"
                      />
                      <div className="space-y-0.5">
                        <div className="font-serif italic font-bold text-sm text-[#2C2E29]">
                          {item.artisanName}
                        </div>
                        <p className="text-[11px] text-[#73776A]">
                          {item.productName} • <span className="font-mono">{item.productId}</span>
                        </p>
                        <div className="text-[10px] text-[#5D634C] font-semibold">
                          {item.cooperativeName} ({item.state}) • {item.bankAccountMasked}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="font-serif italic font-bold text-base text-[#2C2E29]">
                        ₹{item.artisanCompensation.toLocaleString()}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#5D634C]/10 text-[10px] font-bold text-[#5D634C]">
                        {item.percentage}% of ₹{item.retailPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Processing Steps Status */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-white border border-[#5D634C]/30 space-y-3 animate-fade-in">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#5D634C]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#BC8E6D]" />
                  <span>Processing Sovereign National Settlement...</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className={`flex items-center space-x-2 ${settlementStep >= 1 ? 'text-[#5D634C] font-semibold' : 'text-[#73776A]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step 1: Validating Escrow Locks & KYC Biometrics</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${settlementStep >= 2 ? 'text-[#5D634C] font-semibold' : 'text-[#73776A]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step 2: Committing Block Settlement to National Sovereign Trust Ledger</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${settlementStep >= 3 ? 'text-[#5D634C] font-semibold' : 'text-[#73776A]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step 3: Direct Bank Remittance via PFMS Direct Benefit Transfer</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DCD7CF]">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-full border border-[#DCD7CF] text-xs font-semibold text-[#73776A] hover:bg-[#E8E4DD] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteSettlement}
                disabled={selectedIds.length === 0 || isProcessing}
                className="px-6 py-3 rounded-full bg-[#BC8E6D] hover:bg-[#A77756] text-white text-xs font-bold shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Execute Batch Settlement (₹{totalSelectedAmount.toLocaleString()})</span>
              </button>
            </div>

          </div>
        ) : (
          /* Settlement Confirmation & Receipt */
          <div className="p-8 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#5D634C]/10 text-[#5D634C] border border-[#5D634C]/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                Government of India • PFMS Gateway
              </span>
              <h3 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                Settlement Completed Successfully
              </h3>
              <p className="text-xs text-[#73776A]">
                ₹{totalSelectedAmount.toLocaleString()} disbursed across {selectedIds.length} verified traditional artisans.
              </p>
            </div>

            {/* Transaction Receipt Card */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-white border border-[#DCD7CF] text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-[#E8E4DD] pb-2">
                <span className="text-[#73776A]">Transaction Ref:</span>
                <span className="font-bold text-[#2C2E29]">{transactionRef}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E4DD] pb-2">
                <span className="text-[#73776A]">Settlement Mode:</span>
                <span className="font-bold text-[#5D634C]">PFMS / Aadhaar DBT</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E4DD] pb-2">
                <span className="text-[#73776A]">Total Value:</span>
                <span className="font-bold text-[#2C2E29]">₹{totalSelectedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E4DD] pb-2">
                <span className="text-[#73776A]">Artisans Benefited:</span>
                <span className="font-bold text-[#2C2E29]">{selectedIds.length} Master Craftsmen</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#73776A]">
                <span>Ledger Commit:</span>
                <span>BLOCK #88496 (Confirmed)</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-full bg-white border border-[#DCD7CF] text-xs font-semibold text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#5D634C]" />
                <span>Print Official Voucher</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-bold hover:bg-[#4A4F3C] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
