import React from 'react';
import { X, Lock, CheckCircle2, Copy, ShieldCheck, Database, Layers, ArrowRight } from 'lucide-react';

export interface LedgerBlock {
  blockNumber: number;
  blockType: 'PASSPORT_SEALED' | 'ESCROW_DISBURSED' | 'TAKEDOWN_ISSUED' | 'GI_CERTIFIED' | 'CLUSTER_REGISTERED' | 'NODE_CONSENSUS';
  title: string;
  actor: string;
  signerPublicKey: string;
  currentHash: string;
  parentHash: string;
  merkleRoot: string;
  timestamp: string;
  details: string;
  amount?: string;
  productId?: string;
  state: string;
  signatures: Array<{ nodeName: string; signature: string; timestamp: string }>;
}

interface BlockDetailModalProps {
  block: LedgerBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'info') => void;
}

export const BlockDetailModal: React.FC<BlockDetailModalProps> = ({
  block,
  isOpen,
  onClose,
  onShowNotification
}) => {
  if (!isOpen || !block) return null;

  const handleCopyHash = (hash: string, label: string) => {
    navigator.clipboard?.writeText(hash);
    onShowNotification(`${label} copied to clipboard`, 'info');
  };

  const getBadgeColor = (type: LedgerBlock['blockType']) => {
    switch (type) {
      case 'PASSPORT_SEALED':
        return 'bg-[#5D634C] text-[#FAF8F5]';
      case 'ESCROW_DISBURSED':
        return 'bg-[#BC8E6D] text-white';
      case 'TAKEDOWN_ISSUED':
        return 'bg-[#A25247] text-white';
      case 'GI_CERTIFIED':
        return 'bg-[#5D634C] text-[#FAF8F5]';
      default:
        return 'bg-[#2C2E29] text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DCD7CF] rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="bg-[#4A4F3C] text-[#FAF8F5] p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#BC8E6D]/20 border border-[#BC8E6D]/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#BC8E6D]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-[#BC8E6D] tracking-wider">
                <Database className="w-3.5 h-3.5" />
                <span>Sovereign Ledger Block Explorer</span>
              </div>
              <h2 className="font-serif italic text-xl font-bold">
                Block #{block.blockNumber} Commit Inspector
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

        {/* Body */}
        <div className="p-6 space-y-6 text-xs font-mono">
          
          {/* Top Status Strip */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#DCD7CF]">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getBadgeColor(block.blockType)}`}>
                {block.blockType}
              </span>
              <span className="font-bold text-[#2C2E29]">{block.title}</span>
            </div>
            <span className="text-[11px] text-[#73776A]">{block.timestamp}</span>
          </div>

          {/* Cryptographic Hashes */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#DCD7CF]">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#73776A] uppercase font-bold">
                <span>Block SHA-256 State Root</span>
                <button
                  onClick={() => handleCopyHash(block.currentHash, 'Block Hash')}
                  className="text-[#5D634C] hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] text-[11px] text-[#2C2E29] break-all font-semibold select-all">
                {block.currentHash}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#73776A] uppercase font-bold">
                <span>Parent Block Hash</span>
                <button
                  onClick={() => handleCopyHash(block.parentHash, 'Parent Hash')}
                  className="text-[#5D634C] hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] text-[11px] text-[#73776A] break-all select-all">
                {block.parentHash}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#73776A] uppercase font-bold">
                <span>Merkle Transaction Root</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] text-[11px] text-[#73776A] break-all">
                {block.merkleRoot}
              </div>
            </div>
          </div>

          {/* Actor & Signer Payload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[#DCD7CF]">
            <div className="space-y-1">
              <span className="text-[10px] text-[#73776A] uppercase font-bold">Transacting Authority</span>
              <div className="font-bold text-[#2C2E29]">{block.actor}</div>
              <div className="text-[10px] text-[#73776A]">Public Key: {block.signerPublicKey}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#73776A] uppercase font-bold">Transaction Reference</span>
              <div className="font-bold text-[#5D634C]">{block.productId || block.amount || 'GOI-ROOT-SYNC'}</div>
              <div className="text-[10px] text-[#73776A]">State Jurisdiction: {block.state}</div>
            </div>
          </div>

          {/* Multi-Node Consensus Signatures */}
          <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#DCD7CF]">
            <div className="flex items-center justify-between text-[10px] text-[#73776A] uppercase font-bold">
              <span>Consensus Quorum Signatures ({block.signatures.length}/5 Required Nodes)</span>
              <span className="text-[#5D634C] font-bold">✓ 100% VALIDATED</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {block.signatures.map((sig, idx) => (
                <div key={idx} className="p-2 bg-[#FAF8F5] rounded-xl border border-[#E8E4DD] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5D634C]" />
                    <span className="font-semibold text-[#2C2E29]">{sig.nodeName}</span>
                  </div>
                  <span className="text-[10px] text-[#73776A] font-mono">{sig.signature.slice(0, 16)}...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-2 border-t border-[#DCD7CF]">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#5D634C] hover:bg-[#4A4F3C] text-[#FAF8F5] text-xs font-sans font-bold transition-colors"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
