import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle, 
  Lock, 
  FileCheck2, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Activity,
  Layers,
  Database,
  ExternalLink,
  Plus,
  Search,
  Check,
  Award,
  Eye,
  Sliders
} from 'lucide-react';
import { mockAdminStats, mockCraftClusters, mockDisputes } from '../../data/mockData';
import { BatchSettlementModal } from './BatchSettlementModal';
import { NationalAuditDossierModal } from './NationalAuditDossierModal';
import { RegisterClusterModal, CraftClusterData } from './RegisterClusterModal';
import { BlockDetailModal, LedgerBlock } from './BlockDetailModal';
import { NationwidePassportsTable } from './NationwidePassportsTable';
import { PolicySimulator } from './PolicySimulator';
import { ProductPassport } from '../../types';

export const NationalAdminDashboard: React.FC = () => {
  const { products, alerts, showNotification, navigate, t, setActiveProductId } = useApp();
  
  // Tab Management
  const [activeTab, setActiveTab] = useState<'overview' | 'passports' | 'clusters' | 'ledger' | 'policy'>('overview');
  
  // Modals
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState<boolean>(false);
  const [isAuditDossierModalOpen, setIsAuditDossierModalOpen] = useState<boolean>(false);
  const [isRegisterClusterModalOpen, setIsRegisterClusterModalOpen] = useState<boolean>(false);
  const [selectedBlockForModal, setSelectedBlockForModal] = useState<LedgerBlock | null>(null);

  // Clusters State
  const [craftClusters, setCraftClusters] = useState<CraftClusterData[]>(mockCraftClusters);
  const [selectedCluster, setSelectedCluster] = useState<CraftClusterData>(mockCraftClusters[0]);
  const [clusterSearch, setClusterSearch] = useState<string>('');

  // Stats State
  const [totalDisbursedDisplay, setTotalDisbursedDisplay] = useState<string>(mockAdminStats.totalEscrowDisbursed);
  const [disbursedCountAdd, setDisbursedCountAdd] = useState<number>(0);

  // Consensus Nodes State
  const [nodes, setNodes] = useState([
    { id: 1, name: 'Node 1: Ministry Root (NIC / GoI)', location: 'New Delhi', status: 'Synced', latency: '0.4s', healthy: true },
    { id: 2, name: 'Node 2: Odisha State Handlooms Node', location: 'Bhubaneswar', status: 'Synced', latency: '0.2s', healthy: true },
    { id: 3, name: 'Node 3: Utkalika Apex Cooperative Node', location: 'Puri', status: 'Synced', latency: '0.1s', healthy: true },
    { id: 4, name: 'Node 4: Karnataka Craft Development Node', location: 'Bengaluru', status: 'Synced', latency: '0.3s', healthy: true },
    { id: 5, name: 'Node 5: Field Biometric Validator Node', location: 'Nationwide (Mobile Edge)', status: 'Synced', latency: '0.5s', healthy: true }
  ]);
  const [isSyncingNodes, setIsSyncingNodes] = useState<boolean>(false);

  // Ledger Blocks State & Filtering
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>([
    {
      blockNumber: 88495,
      blockType: 'PASSPORT_SEALED',
      title: 'Digital Product Passport Sealed',
      actor: 'Utkalika Apex Society',
      signerPublicKey: '0x89f4b3...e912',
      currentHash: '0x3f4a9b2c8e1d5a7f92b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
      parentHash: '0x991a4b8c7e2d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      merkleRoot: '0x7e29b19f39a4c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
      timestamp: 'Today, 10:45 AM',
      details: 'CRAFT-00124 (Peacock Garden Appliqué Pillow Cover) sealed with artisan hardware key.',
      productId: 'CRAFT-00124',
      state: 'Odisha',
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x718a9...b921', timestamp: '10:45:02' },
        { nodeName: 'Odisha State Node', signature: '0x442f1...c810', timestamp: '10:45:03' },
        { nodeName: 'Utkalika Apex Node', signature: '0x991b2...e440', timestamp: '10:45:03' }
      ]
    },
    {
      blockNumber: 88494,
      blockType: 'ESCROW_DISBURSED',
      title: 'Direct Artisan Escrow Settlement',
      actor: 'PFMS Direct Benefit Gateway',
      signerPublicKey: '0x55c3a1...d801',
      currentHash: '0x991a4b8c7e2d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      parentHash: '0x12a884c7e2b992f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      merkleRoot: '0x6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      timestamp: 'Today, 09:30 AM',
      details: '₹3,84,000 disbursed across 18 verified master artisans.',
      amount: '₹3,84,000',
      state: 'Odisha & Bihar',
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x882a1...f012', timestamp: '09:30:01' },
        { nodeName: 'Odisha State Node', signature: '0x331e9...a441', timestamp: '09:30:02' }
      ]
    },
    {
      blockNumber: 88493,
      blockType: 'TAKEDOWN_ISSUED',
      title: 'Automated Counterfeit Notice Dispatched',
      actor: 'National Legal & GI Protection Node',
      signerPublicKey: '0x77e11a...c920',
      currentHash: '0x12a884c7e2b992f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      parentHash: '0x44f881c2d9a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      merkleRoot: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
      timestamp: 'Yesterday, 04:12 PM',
      details: 'Notice ALT-8821 served to marketplace "CraftHubExpress" for synthetic print clone.',
      productId: 'ALT-8821',
      state: 'National Jurisdiction',
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x992c1...d110', timestamp: '16:12:04' },
        { nodeName: 'Field Biometric Node', signature: '0x118a4...e993', timestamp: '16:12:05' }
      ]
    },
    {
      blockNumber: 88492,
      blockType: 'GI_CERTIFIED',
      title: 'Sovereign GI Heritage Verification',
      actor: 'Geographical Indication Registry',
      signerPublicKey: '0x33b991...a781',
      currentHash: '0x44f881c2d9a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      parentHash: '0x88d771c9b2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      merkleRoot: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      timestamp: '18 Aug 2026, 11:20 AM',
      details: 'Sambalpuri Ikat Batch #OD-2026-88 passed tie-dye loom inspection.',
      productId: 'CRAFT-00128',
      state: 'Odisha',
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x449a1...b220', timestamp: '11:20:01' },
        { nodeName: 'Odisha State Node', signature: '0x772c9...f331', timestamp: '11:20:02' }
      ]
    },
    {
      blockNumber: 88491,
      blockType: 'CLUSTER_REGISTERED',
      title: 'New GI Craft Cluster Enrolled',
      actor: 'Directorate of Handicrafts',
      signerPublicKey: '0x22a114...e882',
      currentHash: '0x88d771c9b2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      parentHash: '0x55c441b8a2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      merkleRoot: '0x9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      timestamp: '15 Aug 2026, 09:00 AM',
      details: 'GI-105 (Madhubani Art) enrolled with 440 master folk painters.',
      state: 'Bihar',
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x112b3...a440', timestamp: '09:00:01' },
        { nodeName: 'Karnataka Craft Board Node', signature: '0x664d9...e112', timestamp: '09:00:02' }
      ]
    }
  ]);

  const [ledgerFilterType, setLedgerFilterType] = useState<string>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [isVerifyingChain, setIsVerifyingChain] = useState<boolean>(false);
  const [chainVerified, setChainVerified] = useState<boolean>(false);

  // Settlement Success Handler
  const handleSettlementSuccess = (amount: number, count: number) => {
    setDisbursedCountAdd(prev => prev + count);
    setTotalDisbursedDisplay('₹14.84 Cr');
    showNotification(`Batch settlement of ₹${amount.toLocaleString()} completed to ${count} artisans.`, 'success');

    // Add new block to ledger
    const newBlock: LedgerBlock = {
      blockNumber: ledgerBlocks[0].blockNumber + 1,
      blockType: 'ESCROW_DISBURSED',
      title: 'Batch Wage Escrow Settlement',
      actor: 'PFMS National Settlement Gateway',
      signerPublicKey: '0x55c3a1...d801',
      currentHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      parentHash: ledgerBlocks[0].currentHash,
      merkleRoot: `0x${Math.random().toString(16).slice(2)}`,
      timestamp: 'Just now',
      details: `₹${amount.toLocaleString()} direct settlement released to ${count} registered master artisans.`,
      amount: `₹${amount.toLocaleString()}`,
      state: 'National Jurisdiction',
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x99a1...b22', timestamp: 'Just now' },
        { nodeName: 'Odisha State Node', signature: '0x44c2...f11', timestamp: 'Just now' }
      ]
    };

    setLedgerBlocks([newBlock, ...ledgerBlocks]);
  };

  // Register New Cluster Handler
  const handleClusterCreated = (newCluster: CraftClusterData) => {
    setCraftClusters([newCluster, ...craftClusters]);
    setSelectedCluster(newCluster);
    showNotification(`GI Cluster "${newCluster.clusterName}" successfully registered into Sovereign Registry!`, 'success');

    // Add block commit
    const newBlock: LedgerBlock = {
      blockNumber: ledgerBlocks[0].blockNumber + 1,
      blockType: 'CLUSTER_REGISTERED',
      title: `GI Cluster Enrolled: ${newCluster.clusterName}`,
      actor: 'Geographical Indication Registry',
      signerPublicKey: '0x33b991...a781',
      currentHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      parentHash: ledgerBlocks[0].currentHash,
      merkleRoot: `0x${Math.random().toString(16).slice(2)}`,
      timestamp: 'Just now',
      details: `${newCluster.giTag} enrolled under ${newCluster.cooperativeName} (${newCluster.state}).`,
      state: newCluster.state,
      signatures: [
        { nodeName: 'Ministry Root (NIC)', signature: '0x772a...c01', timestamp: 'Just now' }
      ]
    };
    setLedgerBlocks([newBlock, ...ledgerBlocks]);
  };

  // Node Ping & Sync Handlers
  const handlePingNode = (nodeId: number) => {
    const latencies = ['12ms', '18ms', '24ms', '15ms', '29ms'];
    const newLatency = latencies[Math.floor(Math.random() * latencies.length)];
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, latency: newLatency } : n));
    showNotification(`Node ${nodeId} latency checked: ${newLatency} (Healthy)`, 'info');
  };

  const handleForceSyncNodes = () => {
    setIsSyncingNodes(true);
    setTimeout(() => {
      setIsSyncingNodes(false);
      setNodes(prev => prev.map(n => ({ ...n, status: 'Synced', latency: '0.1s' })));
      showNotification('All 5 Sovereign Consensus Nodes synced to block #88495', 'success');
    }, 1000);
  };

  // Verify Chain Integrity Handler
  const handleVerifyChain = () => {
    setIsVerifyingChain(true);
    setChainVerified(false);
    setTimeout(() => {
      setIsVerifyingChain(false);
      setChainVerified(true);
      showNotification('SHA-256 Hash Chain verification PASSED. Zero block tampering detected.', 'success');
    }, 1200);
  };

  const handleSelectProduct = (product: ProductPassport) => {
    setActiveProductId(product.productId);
    navigate('/verify-passport');
  };

  const handleCertifyProduct = (productId: string) => {
    showNotification(`Passport ${productId} certified with Sovereign GI Gold Seal.`, 'success');
  };

  const handleFlagProduct = (productId: string) => {
    showNotification(`Passport ${productId} flagged for cooperative audit investigation.`, 'info');
  };

  // Filtered Clusters
  const filteredClusters = craftClusters.filter(c => 
    c.clusterName.toLowerCase().includes(clusterSearch.toLowerCase()) ||
    c.state.toLowerCase().includes(clusterSearch.toLowerCase()) ||
    c.giTag.toLowerCase().includes(clusterSearch.toLowerCase())
  );

  // Filtered Ledger Blocks
  const filteredBlocks = ledgerBlocks.filter(b => {
    const matchesType = ledgerFilterType === 'ALL' || b.blockType === ledgerFilterType;
    const matchesSearch = 
      b.title.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.currentHash.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.actor.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.blockNumber.toString().includes(ledgerSearch);
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP SOVEREIGN BANNER */}
      <div className="bg-[#4A4F3C] text-[#FAF8F5] rounded-[36px] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2 text-[10px] text-[#BC8E6D] font-bold uppercase tracking-[0.2em]">
            <Building2 className="w-4 h-4 text-[#BC8E6D]" />
            <span>Ministry of Textiles & Handicrafts • Government of India</span>
          </div>
          <h1 className="font-serif italic text-2xl sm:text-4xl font-bold tracking-tight">
            National Digital Product Passport Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#E8E4DD] max-w-2xl">
            National Craft Provenance Registry & Verification System • Preserving authenticity, preventing counterfeit copies, and protecting India's 7 million traditional artisans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setIsSettlementModalOpen(true)}
            className="px-5 py-3 bg-[#BC8E6D] hover:bg-[#A77756] text-white text-xs font-semibold rounded-full shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Execute Wage Settlement</span>
          </button>

          <button
            onClick={() => setIsAuditDossierModalOpen(true)}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-semibold rounded-full border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>National Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-[#DCD7CF] pb-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'National Overview' },
          { id: 'passports', label: `Passports Registry (${products.length})` },
          { id: 'clusters', label: `Craft Clusters (${craftClusters.length})` },
          { id: 'ledger', label: 'Cryptographic Trust Ledger' },
          { id: 'policy', label: 'GI & Fair Wage Policy Rules' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all rounded-full cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#5D634C] text-[#FAF8F5] shadow-xs'
                : 'text-[#73776A] hover:text-[#2C2E29] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NATIONAL OVERVIEW                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top 6 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div 
              onClick={() => setActiveTab('passports')}
              className="bg-white border border-[#DCD7CF] rounded-2xl p-4 space-y-1 shadow-xs hover:border-[#5D634C] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Total Passports</span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                {mockAdminStats.totalPassportsNationwide.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#5D634C] font-semibold">Across 28 States</span>
            </div>

            <div 
              onClick={() => setActiveTab('clusters')}
              className="bg-white border border-[#DCD7CF] rounded-2xl p-4 space-y-1 shadow-xs hover:border-[#5D634C] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Verified Artisans</span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                {(mockAdminStats.verifiedArtisans + disbursedCountAdd).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#5D634C] font-semibold">Biometric KYC</span>
            </div>

            <div 
              onClick={() => setActiveTab('clusters')}
              className="bg-white border border-[#DCD7CF] rounded-2xl p-4 space-y-1 shadow-xs hover:border-[#5D634C] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Craft Clusters</span>
              <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                {craftClusters.length} Hubs
              </div>
              <span className="text-[10px] text-[#BC8E6D] font-semibold">Protected GI Zones</span>
            </div>

            <div 
              onClick={() => setIsSettlementModalOpen(true)}
              className="bg-[#5D634C]/10 border border-[#5D634C]/25 rounded-2xl p-4 space-y-1 shadow-xs hover:bg-[#5D634C]/15 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#5D634C] uppercase font-bold tracking-wider">Direct Disbursed</span>
              <div className="font-serif italic text-xl font-bold text-[#5D634C]">
                {totalDisbursedDisplay}
              </div>
              <span className="text-[10px] text-[#5D634C] font-semibold">65% Avg Artisan Share</span>
            </div>

            <div 
              onClick={() => navigate('cooperative-counterfeit')}
              className="bg-white border border-[#DCD7CF] rounded-2xl p-4 space-y-1 shadow-xs hover:border-[#A25247] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#A25247] uppercase font-bold tracking-wider">Counterfeit Flags</span>
              <div className="font-serif italic text-2xl font-bold text-[#A25247]">
                {mockAdminStats.counterfeitsNeutralized}
              </div>
              <span className="text-[10px] text-[#A25247] font-semibold">Takedowns Enforced</span>
            </div>

            <div 
              onClick={() => setActiveTab('ledger')}
              className="bg-white border border-[#DCD7CF] rounded-2xl p-4 space-y-1 shadow-xs hover:border-[#5D634C] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#5D634C] uppercase font-bold tracking-wider">Trust Ledger</span>
              <div className="font-serif italic text-2xl font-bold text-[#5D634C]">
                {mockAdminStats.systemUptime}
              </div>
              <span className="text-[10px] text-[#5D634C] font-semibold">Zero Tampering</span>
            </div>

          </div>

          {/* Clusters Deployment & Consensus Node Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* National Clusters Breakdown */}
            <div className="lg:col-span-7 bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                    State Craft Clusters Deployment
                  </h3>
                  <p className="text-xs text-[#73776A]">
                    Real-time registered volume by heritage craft hub
                  </p>
                </div>
                <button
                  onClick={() => setIsRegisterClusterModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#5D634C]/10 hover:bg-[#5D634C]/20 text-[#5D634C] text-xs font-bold rounded-full transition-colors flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register GI Hub</span>
                </button>
              </div>

              <div className="space-y-3">
                {craftClusters.slice(0, 5).map((cluster) => (
                  <div
                    key={cluster.id}
                    onClick={() => { setSelectedCluster(cluster); setActiveTab('clusters'); }}
                    className="p-4 rounded-2xl border border-[#DCD7CF] bg-[#FAF8F5] hover:border-[#5D634C] transition-colors cursor-pointer flex items-center justify-between shadow-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif italic font-bold text-base text-[#2C2E29]">{cluster.clusterName}</span>
                        <span className="text-[10px] font-mono text-[#5D634C] bg-[#E8E4DD] px-2 py-0.5 rounded-full font-semibold">
                          {cluster.giTag}
                        </span>
                      </div>
                      <p className="text-xs text-[#73776A]">{cluster.state} • {cluster.activeArtisans} Artisans</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#2C2E29]">{cluster.totalProducts} Passports</div>
                      <div className="text-[11px] text-[#5D634C] font-semibold">{cluster.totalWageDisbursed} Disbursed</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sovereign Consensus Nodes */}
            <div className="lg:col-span-5 bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                    Consensus Node Architecture
                  </h3>
                  <p className="text-xs text-[#73776A]">
                    Multi-signatory decentralized verification
                  </p>
                </div>
                <button
                  onClick={handleForceSyncNodes}
                  disabled={isSyncingNodes}
                  className="p-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#E8E4DD] text-[#5D634C] transition-colors"
                  title="Force Quorum Re-Sync"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingNodes ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {nodes.map((node) => (
                  <div key={node.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5D634C]" />
                      <div>
                        <div className="font-bold text-[#2C2E29]">{node.name}</div>
                        <div className="text-[10px] text-[#73776A]">{node.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-[#5D634C] font-semibold">
                        {node.latency}
                      </span>
                      <button
                        onClick={() => handlePingNode(node.id)}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#DCD7CF] text-[10px] font-medium text-[#73776A] hover:text-[#2C2E29]"
                      >
                        Ping
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#E8E4DD]/60 border border-[#DCD7CF] text-[11px] text-[#73776A]">
                <strong className="text-[#2C2E29]">Tamper Resistance:</strong> Any single compromised cooperative or seller cannot forge a passport without cryptographic quorum from the artisan's hardware key and state audit nodes.
              </div>
            </div>

          </div>

          {/* Quick Ledger Feed Strip */}
          <div className="bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#5D634C]" />
                <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">
                  Live Cryptographic Ledger Feed
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs font-bold text-[#5D634C] hover:underline"
              >
                Open Full Trust Ledger Explorer →
              </button>
            </div>

            <div className="divide-y divide-[#E8E4DD] text-xs font-mono">
              {ledgerBlocks.slice(0, 3).map((block) => (
                <div 
                  key={block.blockNumber} 
                  onClick={() => setSelectedBlockForModal(block)}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF8F5] p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#2C2E29] text-white text-[10px] font-bold">
                        BLOCK #{block.blockNumber}
                      </span>
                      <span className="font-bold text-[#2C2E29]">{block.blockType}</span>
                      <span className="text-[#5D634C]">{block.title}</span>
                    </div>
                    <p className="text-[11px] text-[#73776A]">{block.details}</p>
                  </div>
                  <div className="text-right text-[10px] text-[#73776A]">
                    <div className="font-bold text-[#2C2E29]">{block.currentHash.slice(0, 18)}...</div>
                    <div>{block.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NATIONWIDE PASSPORTS REGISTRY                                      */}
      {/* ========================================================================= */}
      {activeTab === 'passports' && (
        <NationwidePassportsTable
          products={products}
          onSelectProduct={handleSelectProduct}
          onCertifyProduct={handleCertifyProduct}
          onFlagProduct={handleFlagProduct}
          onShowNotification={showNotification}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CRAFT CLUSTERS MAP & REGISTRY                                     */}
      {/* ========================================================================= */}
      {activeTab === 'clusters' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-[#DCD7CF]">
            <div>
              <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                Registered GI Craft Clusters
              </h2>
              <p className="text-xs text-[#73776A]">
                Official Geographical Indication zones and apex artisan cooperative authorities.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#73776A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cluster, state, GI tag..."
                  value={clusterSearch}
                  onChange={(e) => setClusterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
                />
              </div>

              <button
                onClick={() => setIsRegisterClusterModalOpen(true)}
                className="px-5 py-2.5 bg-[#5D634C] hover:bg-[#4A4F3C] text-white text-xs font-bold rounded-full transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll New Cluster</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Clusters List */}
            <div className="lg:col-span-5 bg-white border border-[#DCD7CF] rounded-[32px] p-6 space-y-3 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                GI Clusters Registry ({filteredClusters.length})
              </span>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredClusters.map((c) => {
                  const isSelected = selectedCluster.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCluster(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-[#E8E4DD] border-[#5D634C] shadow-xs'
                          : 'bg-[#FAF8F5] border-[#DCD7CF] hover:bg-[#E8E4DD]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif italic font-bold text-sm text-[#2C2E29]">{c.clusterName}</h4>
                        <span className="text-[10px] font-mono text-[#5D634C] font-bold">{c.giTag}</span>
                      </div>
                      <p className="text-xs text-[#73776A]">{c.state} • {c.cooperativeName}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#73776A] pt-1">
                        <span>{c.activeArtisans} Artisans</span>
                        <span>{c.totalProducts} Passports</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cluster In-Depth Inspector */}
            <div className="lg:col-span-7 bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8E4DD] pb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-[#5D634C]">{selectedCluster.giTag}</span>
                  <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29] mt-0.5">
                    {selectedCluster.clusterName}
                  </h2>
                  <div className="text-xs text-[#73776A] pt-1 flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#5D634C]" />
                    <span>{selectedCluster.state} • Audit Node: <strong>{selectedCluster.cooperativeName}</strong></span>
                  </div>
                </div>

                <div className="px-4 py-1.5 bg-[#5D634C]/10 rounded-full border border-[#5D634C]/25 text-xs font-bold text-[#5D634C]">
                  ✓ GI Protection Enforced
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD7CF] space-y-1 shadow-xs">
                  <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Artisans</span>
                  <div className="font-serif italic text-xl font-bold text-[#2C2E29]">{selectedCluster.activeArtisans}</div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD7CF] space-y-1 shadow-xs">
                  <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Passports</span>
                  <div className="font-serif italic text-xl font-bold text-[#2C2E29]">{selectedCluster.totalProducts}</div>
                </div>

                <div className="p-4 bg-[#5D634C]/10 rounded-2xl border border-[#5D634C]/25 space-y-1">
                  <span className="text-[10px] text-[#5D634C] uppercase font-bold tracking-wider">Wage Disbursed</span>
                  <div className="font-serif italic text-xl font-bold text-[#5D634C]">{selectedCluster.totalWageDisbursed}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                  Protected Heritage Craft Description
                </h3>
                <p className="text-xs text-[#2C2E29]/80 leading-relaxed">
                  {selectedCluster.description}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs space-y-2 shadow-xs">
                <div className="font-bold text-[#2C2E29]">Cooperative & Guild Leadership</div>
                <div className="grid grid-cols-2 gap-2 text-[#73776A]">
                  <div>Lead Cooperative: <strong>{selectedCluster.cooperativeName}</strong></div>
                  <div>Regional Authority: Directorate of Handicrafts, {selectedCluster.state}</div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsAuditDossierModalOpen(true)}
                  className="px-5 py-2 rounded-full border border-[#DCD7CF] hover:bg-[#E8E4DD] text-xs font-semibold text-[#2C2E29] transition-colors"
                >
                  Generate Cluster Dossier
                </button>
                <button
                  onClick={() => setActiveTab('passports')}
                  className="px-5 py-2 rounded-full bg-[#5D634C] hover:bg-[#4A4F3C] text-white text-xs font-bold transition-colors"
                >
                  View Cluster Passports →
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CRYPTOGRAPHIC TRUST LEDGER                                        */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E4DD] pb-6">
            <div>
              <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                Immutable Sovereign Audit Ledger
              </h2>
              <p className="text-xs text-[#73776A]">
                Chronological block commits of handicraft creation, audit signoffs, and escrow releases.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleVerifyChain}
                disabled={isVerifyingChain}
                className="px-4 py-2 bg-[#5D634C] hover:bg-[#4A4F3C] text-white text-xs font-bold rounded-full transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                {isVerifyingChain ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{isVerifyingChain ? 'Verifying Hash Chain...' : 'Verify Cryptographic Integrity'}</span>
              </button>

              <div className="flex items-center space-x-2 text-xs font-mono text-[#5D634C] font-semibold bg-[#5D634C]/10 px-3 py-2 rounded-full">
                <Lock className="w-4 h-4" />
                <span>SHA-256 Valid</span>
              </div>
            </div>
          </div>

          {/* Verification Banner if Run */}
          {chainVerified && (
            <div className="p-4 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/30 flex items-center justify-between text-xs text-[#5D634C] animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">Cryptographic Quorum Verified: 5 of 5 Consensus Nodes Match State Root #0x7e29b...</span>
              </div>
              <span className="font-mono text-[10px]">Audit timestamp: {new Date().toLocaleTimeString()}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {['ALL', 'PASSPORT_SEALED', 'ESCROW_DISBURSED', 'TAKEDOWN_ISSUED', 'GI_CERTIFIED', 'CLUSTER_REGISTERED'].map(type => (
                <button
                  key={type}
                  onClick={() => setLedgerFilterType(type)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                    ledgerFilterType === type
                      ? 'bg-[#2C2E29] text-white'
                      : 'bg-[#FAF8F5] text-[#73776A] hover:bg-[#E8E4DD]'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#73776A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by block #, hash, actor..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
              />
            </div>
          </div>

          {/* Block Commits Feed */}
          <div className="divide-y divide-[#E8E4DD] font-mono text-xs">
            {filteredBlocks.map((block) => (
              <div 
                key={block.blockNumber} 
                onClick={() => setSelectedBlockForModal(block)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF8F5] p-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2C2E29] text-white text-[10px] font-bold">
                      BLOCK #{block.blockNumber}
                    </span>
                    <span className="font-bold text-[#2C2E29]">{block.blockType}</span>
                    <span className="text-[#5D634C] font-semibold">{block.productId || block.amount || ''}</span>
                  </div>
                  <p className="text-[11px] text-[#73776A]">{block.details}</p>
                  <div className="text-[10px] text-[#73776A]">
                    Actor: {block.actor} • Signer: <span className="text-[#5D634C]">{block.signerPublicKey}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#73776A] space-y-0.5 shrink-0">
                  <div className="font-bold text-[#2C2E29]">{block.currentHash.slice(0, 20)}...</div>
                  <div className="text-[10px] text-[#73776A]">{block.timestamp}</div>
                  <span className="text-[10px] text-[#5D634C] font-semibold underline">Click to inspect payload</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GI & FAIR WAGE POLICY RULES                                       */}
      {/* ========================================================================= */}
      {activeTab === 'policy' && (
        <PolicySimulator 
          products={products}
          onShowNotification={showNotification}
        />
      )}

      {/* MODALS */}
      <BatchSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        onSuccess={handleSettlementSuccess}
      />

      <NationalAuditDossierModal
        isOpen={isAuditDossierModalOpen}
        onClose={() => setIsAuditDossierModalOpen(false)}
        onShowNotification={showNotification}
      />

      <RegisterClusterModal
        isOpen={isRegisterClusterModalOpen}
        onClose={() => setIsRegisterClusterModalOpen(false)}
        onClusterCreated={handleClusterCreated}
      />

      <BlockDetailModal
        block={selectedBlockForModal}
        isOpen={!!selectedBlockForModal}
        onClose={() => setSelectedBlockForModal(null)}
        onShowNotification={showNotification}
      />

    </div>
  );
};
