import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare, 
  ShieldAlert,
  FileCheck,
  Search,
  Filter,
  Plus,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Building2,
  Sparkles,
  User,
  Clock,
  Share2,
  ZoomIn,
  Gavel,
  Microscope,
  HelpCircle,
  AlertCircle,
  TrendingDown,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { DisputeCase, DisputeEvidenceItem } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { SafeImage } from '../common/SafeImage';

export const DisputeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    disputes, 
    products,
    resolveDispute, 
    fileNewDispute,
    addDisputeEvidence,
    generateDisputeLegalNotice,
    releaseDisputeEscrow,
    setActiveProductId,
    showNotification 
  } = useApp();

  // Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>(disputes[0]?.id || '');

  // Modals & UI States
  const [isNewDisputeModalOpen, setIsNewDisputeModalOpen] = useState(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false);
  const [isLegalNoticeModalOpen, setIsLegalNoticeModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Interactive Voice Testimony Player Simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Adjudication Form Inputs
  const [auditorName, setAuditorName] = useState('Bipin Nayak (Senior Guild Inspector)');
  const [tribunalRationale, setTribunalRationale] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // New Dispute Form State
  const [newDisputeForm, setNewDisputeForm] = useState({
    productId: 'CRAFT-00124',
    productName: 'Sacred Lotus Pipli Appliqué Tapestry',
    buyerName: '',
    buyerContact: '',
    buyerComplaint: '',
    buyerClaim: '',
    marketplacePlatform: 'GlobalCraftBazaar.com (Third-Party Seller)',
    escrowAmount: 5200,
    artisanResponse: '',
    aiRiskScore: 85
  });

  // New Evidence Form State
  const [newEvidenceForm, setNewEvidenceForm] = useState({
    title: '',
    type: 'document' as const,
    url: '',
    notes: '',
    submittedBy: 'Regional Guild Field Auditor'
  });

  // Filtered Disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((disp) => {
      const matchesSearch = 
        (disp.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (disp.disputeCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (disp.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (disp.productId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (disp.artisanName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (disp.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' 
          ? true 
          : statusFilter === 'open' 
          ? disp.status === 'open' 
          : disp.status === statusFilter;

      const riskScore = disp.aiRiskScore || disp.aiRiskAssessment || 0;
      const matchesRisk = 
        riskFilter === 'all'
          ? true
          : riskFilter === 'high'
          ? riskScore >= 75
          : riskFilter === 'medium'
          ? riskScore >= 40 && riskScore < 75
          : riskScore < 40;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [disputes, searchTerm, statusFilter, riskFilter]);

  // Selected Dispute
  const selectedDispute = useMemo(() => {
    return disputes.find(d => d.id === selectedDisputeId) || filteredDisputes[0] || disputes[0] || null;
  }, [disputes, selectedDisputeId, filteredDisputes]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = disputes.length;
    const openCount = disputes.filter(d => d.status === 'open').length;
    const authenticCount = disputes.filter(d => d.status === 'approved_authentic').length;
    const counterfeitCount = disputes.filter(d => d.status === 'confirmed_counterfeit').length;
    const needsEvidenceCount = disputes.filter(d => d.status === 'needs_evidence').length;
    const totalEscrow = disputes.reduce((sum, d) => sum + (d.escrowAmount || 4500), 0);

    return { total, openCount, authenticCount, counterfeitCount, needsEvidenceCount, totalEscrow };
  }, [disputes]);

  // Audio Playback Toggle
  const toggleAudioPlayback = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(0);
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 10;
        });
      }, 350);
    }
  };

  // Copy Hash Helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    showNotification('Cryptographic case hash copied to clipboard!', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Adjudication Trigger
  const handleAdjudicate = (verdictType: 'approved_authentic' | 'confirmed_counterfeit' | 'needs_evidence' | 'escalated') => {
    if (!selectedDispute) return;
    
    resolveDispute(
      selectedDispute.id, 
      verdictType, 
      tribunalRationale || undefined, 
      auditorName
    );
    setTribunalRationale('');
  };

  // Submit New Dispute Form
  const handleCreateNewDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisputeForm.buyerName || !newDisputeForm.buyerComplaint) {
      showNotification('Please fill in buyer name and complaint details', 'warning');
      return;
    }

    const created = fileNewDispute({
      productId: newDisputeForm.productId,
      productName: newDisputeForm.productName,
      buyerName: newDisputeForm.buyerName,
      buyerContact: newDisputeForm.buyerContact,
      buyerComplaint: newDisputeForm.buyerComplaint,
      buyerClaim: newDisputeForm.buyerClaim || newDisputeForm.buyerComplaint,
      marketplacePlatform: newDisputeForm.marketplacePlatform,
      escrowAmount: Number(newDisputeForm.escrowAmount) || 5000,
      artisanResponse: newDisputeForm.artisanResponse || 'Artisan affirms traditional GI compliance and hand-loom credentials.',
      aiRiskScore: Number(newDisputeForm.aiRiskScore) || 75,
      assignedAuditor: auditorName
    });

    setSelectedDisputeId(created.id);
    setIsNewDisputeModalOpen(false);
    setNewDisputeForm({
      productId: 'CRAFT-00124',
      productName: 'Sacred Lotus Pipli Appliqué Tapestry',
      buyerName: '',
      buyerContact: '',
      buyerComplaint: '',
      buyerClaim: '',
      marketplacePlatform: 'GlobalCraftBazaar.com (Third-Party Seller)',
      escrowAmount: 5200,
      artisanResponse: '',
      aiRiskScore: 85
    });
  };

  // Submit Add Evidence Form
  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !newEvidenceForm.title) {
      showNotification('Please provide an evidence title', 'warning');
      return;
    }

    addDisputeEvidence(selectedDispute.id, {
      title: newEvidenceForm.title,
      type: newEvidenceForm.type,
      url: newEvidenceForm.url || (newEvidenceForm.type === 'image' ? 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80' : undefined),
      notes: newEvidenceForm.notes,
      submittedBy: newEvidenceForm.submittedBy
    });

    setIsAddEvidenceModalOpen(false);
    setNewEvidenceForm({
      title: '',
      type: 'document',
      url: '',
      notes: '',
      submittedBy: 'Regional Guild Field Auditor'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD7CF] pb-6">
        <div>
          <button
            onClick={() => navigate('/coop/overview')}
            className="inline-flex items-center space-x-1.5 text-xs text-[#73776A] hover:text-[#2C2E29] font-bold uppercase tracking-wider mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cooperative Operations Hub</span>
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#5D634C] text-[#FAF8F5] flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
                Dispute Resolution & Evidence Tribunal
              </h1>
              <p className="text-xs text-[#73776A]">
                Utkalika Apex Node #OD-042 • Sovereign Provenance Forensics & Escrow Arbitration
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewDisputeModalOpen(true)}
            className="px-4 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Dispute Claim</span>
          </button>

          {selectedDispute && (
            <button
              onClick={() => setIsLegalNoticeModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-[#DCD7CF] text-[#2C2E29] text-xs font-semibold rounded-full hover:bg-[#E8E4DD] transition-all shadow-xs flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-[#BC8E6D]" />
              <span>Tribunal Legal Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. EXECUTIVE TRIBUNAL METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Disputes */}
        <div className="bg-white border border-black/[0.03] rounded-2xl p-4 space-y-1 craft-shadow-subtle">
          <div className="flex items-center justify-between text-xs text-[#73776A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Disputes</span>
            <Scale className="w-4 h-4 text-[#73776A]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#2C2E29]">
            {stats.total}
          </div>
          <span className="text-[10px] text-[#73776A]">All Case Records</span>
        </div>

        {/* Awaiting Adjudication */}
        <div 
          onClick={() => setStatusFilter('open')}
          className={`bg-white border rounded-2xl p-4 space-y-1 transition-all cursor-pointer craft-shadow-subtle ${
            statusFilter === 'open' ? 'border-[#BC8E6D] bg-[#BC8E6D]/5 ring-1 ring-[#BC8E6D]' : 'border-black/[0.03] hover:border-[#BC8E6D]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#BC8E6D]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Awaiting Adjudication</span>
            <div className="w-2 h-2 rounded-full bg-[#BC8E6D] animate-pulse" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#BC8E6D]">
            {stats.openCount}
          </div>
          <span className="text-[10px] text-[#BC8E6D] font-bold">Active Cases In-Queue →</span>
        </div>

        {/* Confirmed Counterfeits */}
        <div 
          onClick={() => setStatusFilter('confirmed_counterfeit')}
          className={`bg-white border rounded-2xl p-4 space-y-1 transition-all cursor-pointer craft-shadow-subtle ${
            statusFilter === 'confirmed_counterfeit' ? 'border-[#A25247] bg-[#A25247]/5 ring-1 ring-[#A25247]' : 'border-black/[0.03] hover:border-[#A25247]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#A25247]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Confirmed Fakes</span>
            <AlertTriangle className="w-4 h-4 text-[#A25247]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#A25247]">
            {stats.counterfeitCount}
          </div>
          <span className="text-[10px] text-[#A25247] font-semibold">Takedown Notices Active</span>
        </div>

        {/* Approved Genuine */}
        <div 
          onClick={() => setStatusFilter('approved_authentic')}
          className={`bg-white border rounded-2xl p-4 space-y-1 transition-all cursor-pointer craft-shadow-subtle ${
            statusFilter === 'approved_authentic' ? 'border-[#5D634C] bg-[#5D634C]/5 ring-1 ring-[#5D634C]' : 'border-black/[0.03] hover:border-[#5D634C]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#5D634C]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Approved Genuine</span>
            <CheckCircle2 className="w-4 h-4 text-[#5D634C]" />
          </div>
          <div className="font-serif italic text-2xl font-bold text-[#5D634C]">
            {stats.authenticCount}
          </div>
          <span className="text-[10px] text-[#5D634C] font-semibold">Escrow Released</span>
        </div>

        {/* Escrow in Custody */}
        <div className="col-span-2 sm:col-span-1 bg-[#5D634C]/10 border border-[#5D634C]/25 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#5D634C]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Escrow Custody</span>
            <Lock className="w-4 h-4 text-[#5D634C]" />
          </div>
          <div className="font-serif italic text-xl sm:text-2xl font-bold text-[#5D634C]">
            ₹{stats.totalEscrow.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#5D634C] font-medium">Secured Arbitration Funds</span>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE: CASE LIST (LEFT) & FORENSIC ADJUDICATION CONSOLE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Dispute Filter & List */}
        <div className="lg:col-span-5 bg-white border border-black/[0.03] rounded-[32px] p-5 sm:p-6 space-y-4 craft-shadow-subtle">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#73776A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case #, product ID, buyer, artisan..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAF8F5] border border-[#DCD7CF] rounded-full text-xs text-[#2C2E29] focus:outline-hidden focus:border-[#5D634C]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Cases' },
              { id: 'open', label: 'Open' },
              { id: 'approved_authentic', label: 'Authentic' },
              { id: 'confirmed_counterfeit', label: 'Counterfeit' },
              { id: 'needs_evidence', label: 'Requisition' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all text-[11px] ${
                  statusFilter === tab.id
                    ? 'bg-[#5D634C] text-[#FAF8F5]'
                    : 'bg-[#FAF8F5] text-[#73776A] hover:bg-[#E8E4DD]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Risk Level Filter Pill */}
          <div className="flex items-center justify-between text-[11px] text-[#73776A] pt-1 border-t border-[#E8E4DD]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">AI Risk Level:</span>
            <div className="flex items-center space-x-1">
              {['all', 'high', 'medium', 'low'].map((rf) => (
                <button
                  key={rf}
                  onClick={() => setRiskFilter(rf)}
                  className={`px-2 py-0.5 rounded-md uppercase text-[9px] font-bold ${
                    riskFilter === rf
                      ? 'bg-[#2C2E29] text-white'
                      : 'bg-[#FAF8F5] text-[#73776A] hover:bg-[#E8E4DD]'
                  }`}
                >
                  {rf}
                </button>
              ))}
            </div>
          </div>

          {/* Case Items List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredDisputes.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DCD7CF] space-y-2">
                <Scale className="w-8 h-8 text-[#73776A] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[#2C2E29]">No dispute cases found</p>
                <p className="text-[11px] text-[#73776A]">Try changing the search terms or filters above.</p>
              </div>
            ) : (
              filteredDisputes.map((disp) => {
                const isSelected = selectedDispute?.id === disp.id;
                const riskScore = disp.aiRiskScore || disp.aiRiskAssessment || 0;
                return (
                  <div
                    key={disp.id}
                    onClick={() => setSelectedDisputeId(disp.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-[#E8E4DD]/80 border-[#5D634C] craft-shadow-subtle ring-1 ring-[#5D634C]'
                        : 'bg-[#FAF8F5] border-black/[0.03] hover:bg-[#E8E4DD]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#2C2E29]">
                        {disp.caseNumber || disp.disputeCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        disp.status === 'open' 
                          ? 'bg-[#BC8E6D]/20 text-[#BC8E6D]' 
                          : disp.status === 'confirmed_counterfeit' 
                          ? 'bg-[#A25247]/20 text-[#A25247]' 
                          : disp.status === 'approved_authentic'
                          ? 'bg-[#5D634C]/20 text-[#5D634C]'
                          : 'bg-[#73776A]/20 text-[#73776A]'
                      }`}>
                        {disp.status === 'open' 
                          ? 'Awaiting Adjudication' 
                          : disp.status === 'confirmed_counterfeit'
                          ? 'Counterfeit Takedown'
                          : disp.status === 'approved_authentic'
                          ? 'Approved Authentic'
                          : 'Needs Evidence'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#2C2E29] line-clamp-1">
                      {disp.productName}
                    </h4>

                    <div className="text-[11px] text-[#73776A] flex items-center justify-between">
                      <span className="truncate max-w-[140px]">Buyer: <strong>{disp.buyerName.split(' ')[0]}</strong></span>
                      <span className="truncate max-w-[140px]">Artisan: <strong>{disp.artisanName.split(' ')[0]}</strong></span>
                    </div>

                    <div className="pt-2 border-t border-[#DCD7CF]/70 flex items-center justify-between text-[11px]">
                      <span className={`font-bold ${riskScore >= 75 ? 'text-[#A25247]' : riskScore >= 40 ? 'text-[#BC8E6D]' : 'text-[#5D634C]'}`}>
                        AI Risk: {riskScore}%
                      </span>
                      <span className="font-semibold text-[#5D634C]">
                        ₹{(disp.escrowAmount || 4500).toLocaleString()} Escrow
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Deep Forensic Details & Tribunal Actions */}
        {selectedDispute ? (
          <div className="lg:col-span-7 bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
            
            {/* Header & Risk Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8E4DD] pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#5D634C]/10 text-[#5D634C]">
                    {selectedDispute.caseNumber || selectedDispute.disputeCode}
                  </span>
                  <span className="text-[11px] text-[#73776A]">
                    Filed: {selectedDispute.filingDate || selectedDispute.filedDate || 'Recent'}
                  </span>
                </div>
                
                <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29] mt-1">
                  {selectedDispute.productName}
                </h2>
                
                <div className="flex items-center space-x-3 text-xs text-[#73776A] mt-1">
                  <span>Passport ID: <strong className="font-mono text-[#2C2E29]">{selectedDispute.productId}</strong></span>
                  <span>•</span>
                  <button
                    onClick={() => { setActiveProductId(selectedDispute.productId); navigate('/verify-passport'); }}
                    className="text-[#BC8E6D] hover:underline font-bold inline-flex items-center space-x-1"
                  >
                    <span>Inspect Passport</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <RiskBadge 
                  riskPercentage={selectedDispute.aiRiskScore || selectedDispute.aiRiskAssessment || 50} 
                  level={(selectedDispute.aiRiskScore || selectedDispute.aiRiskAssessment || 50) >= 75 ? 'high' : (selectedDispute.aiRiskScore || 50) >= 40 ? 'medium' : 'low'} 
                />
                <span className="text-[10px] text-[#73776A] font-mono">
                  Auditor: {selectedDispute.assignedAuditor || 'Bipin Nayak'}
                </span>
              </div>
            </div>

            {/* Escrow Status & Blockchain Integrity Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#73776A] uppercase font-bold tracking-wider">Arbitration Escrow Custody</span>
                    <div className="font-bold text-[#2C2E29]">
                      ₹{(selectedDispute.escrowAmount || 5200).toLocaleString()} INR • {selectedDispute.transactionRef || 'TXN-UPI-98210344'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedDispute.escrowStatus === 'released_to_artisan'
                      ? 'bg-[#5D634C]/15 text-[#5D634C]'
                      : selectedDispute.escrowStatus === 'refunded_to_buyer'
                      ? 'bg-[#A25247]/15 text-[#A25247]'
                      : 'bg-[#BC8E6D]/15 text-[#BC8E6D]'
                  }`}>
                    {selectedDispute.escrowStatus === 'released_to_artisan'
                      ? '✓ Released to Artisan PFMS'
                      : selectedDispute.escrowStatus === 'refunded_to_buyer'
                      ? '✓ Refunded to Buyer'
                      : '🔒 Locked in Tribunal Escrow'}
                  </span>
                </div>
              </div>

              {/* Blockchain Root */}
              <div className="pt-2 border-t border-[#E8E4DD] flex items-center justify-between text-[10px] text-[#73776A] font-mono">
                <span className="truncate max-w-[280px] sm:max-w-md">
                  Root Hash: {selectedDispute.blockchainHash || '0x7a8e9d34b67f12e84d2891c9802bf3764812a3d0f7652c4e518b459a'}
                </span>
                <button
                  onClick={() => handleCopyHash(selectedDispute.blockchainHash || '0x7a8e9d34b67f12e84d2891c9802bf3764812a3d0f7652c4e518b459a')}
                  className="text-[#5D634C] hover:underline font-bold inline-flex items-center space-x-1"
                >
                  {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Testimonies Comparative Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Buyer Claim */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#A25247]/20 space-y-2 craft-shadow-subtle">
                <div className="flex items-center justify-between text-xs font-bold text-[#A25247]">
                  <div className="flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Buyer Claim</span>
                  </div>
                  <span className="text-[10px] text-[#73776A] font-normal">{selectedDispute.buyerName}</span>
                </div>
                
                <p className="text-xs text-[#2C2E29]/90 leading-relaxed italic">
                  "{selectedDispute.buyerComplaint || selectedDispute.buyerClaim || 'Buyer disputed fabric composition and print authenticity.'}"
                </p>

                <div className="pt-2 border-t border-[#E8E4DD] text-[10px] text-[#73776A] space-y-0.5">
                  <div>Platform: <strong>{selectedDispute.marketplacePlatform || 'Online Marketplace'}</strong></div>
                  <div>Contact: <strong>{selectedDispute.buyerContact || 'ananya.s@example.com'}</strong></div>
                </div>
              </div>

              {/* Artisan Testimony & Audio Player */}
              <div className="p-4 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#5D634C]">
                  <div className="flex items-center space-x-2">
                    <SafeImage
                      src={selectedDispute.artisanAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"}
                      alt={selectedDispute.artisanName}
                      isAvatar={true}
                      artisanName={selectedDispute.artisanName}
                      className="w-5 h-5 rounded-full object-cover border border-[#5D634C]/30"
                    />
                    <span>Artisan Testimony ({selectedDispute.artisanName})</span>
                  </div>
                </div>

                <p className="text-xs text-[#2C2E29] leading-relaxed italic">
                  "{selectedDispute.artisanResponse}"
                </p>

                {/* Voice Testimony Playback Simulator */}
                <div className="pt-2 border-t border-[#5D634C]/20 flex items-center justify-between gap-3">
                  <button
                    onClick={toggleAudioPlayback}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#5D634C] text-[#FAF8F5] text-[11px] font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs shrink-0"
                  >
                    {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingAudio ? 'Playing Testimony...' : 'Play Voice Recording'}</span>
                  </button>

                  <div className="flex-1 flex items-center space-x-1">
                    <div className="h-1.5 w-full bg-[#5D634C]/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#5D634C] transition-all duration-300"
                        style={{ width: `${isPlayingAudio ? audioProgress : 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#5D634C] font-mono shrink-0">0:42</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Forensic Evidence Locker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Microscope className="w-4 h-4 text-[#5D634C]" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                    Forensic Evidence Locker ({selectedDispute.evidenceList.length} Items)
                  </h3>
                </div>

                <button
                  onClick={() => setIsAddEvidenceModalOpen(true)}
                  className="text-xs text-[#5D634C] hover:underline font-bold inline-flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Supplementary Evidence</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {selectedDispute.evidenceList.map((ev, idx) => {
                  const isObj = typeof ev === 'object' && ev !== null;
                  const title = isObj ? ev.title : ev;
                  const type = isObj ? ev.type : 'document';
                  const verified = isObj ? (ev.verified !== false) : true;
                  const url = isObj ? ev.url : undefined;
                  const notes = isObj ? ev.notes : undefined;
                  const submittedBy = isObj ? ev.submittedBy : 'Auditor Inspection';
                  const timestamp = isObj ? ev.timestamp : undefined;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/[0.03] hover:border-[#DCD7CF] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#DCD7CF] text-[#5D634C] flex items-center justify-center shrink-0 mt-0.5">
                          {type === 'image' ? (
                            <Eye className="w-4 h-4 text-[#BC8E6D]" />
                          ) : type === 'voice' ? (
                            <Volume2 className="w-4 h-4 text-[#5D634C]" />
                          ) : type === 'spectroscopy' ? (
                            <Sparkles className="w-4 h-4 text-[#A25247]" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#5D634C]" />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-[#2C2E29] flex items-center space-x-2">
                            <span>{title}</span>
                            {verified && (
                              <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold text-[#5D634C] bg-[#5D634C]/10 px-1.5 py-0.2 rounded-md">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                          
                          {notes && (
                            <p className="text-[11px] text-[#73776A]">{notes}</p>
                          )}

                          <div className="text-[10px] text-[#73776A] flex items-center space-x-2">
                            <span>By: {submittedBy}</span>
                            {timestamp && <span>• {timestamp}</span>}
                          </div>
                        </div>
                      </div>

                      {url && (
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => setZoomedImage({ url, title })}
                            className="px-3 py-1 bg-white border border-[#DCD7CF] text-xs font-semibold rounded-full text-[#2C2E29] hover:bg-[#E8E4DD] flex items-center space-x-1"
                          >
                            <ZoomIn className="w-3 h-3 text-[#5D634C]" />
                            <span>Inspect Macro</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verdict Display (if already closed) */}
            {selectedDispute.verdict && (
              <div className={`p-4 rounded-2xl border space-y-1.5 ${
                selectedDispute.status === 'confirmed_counterfeit'
                  ? 'bg-[#A25247]/10 border-[#A25247]/30 text-[#A25247]'
                  : selectedDispute.status === 'approved_authentic'
                  ? 'bg-[#5D634C]/10 border-[#5D634C]/30 text-[#5D634C]'
                  : 'bg-[#BC8E6D]/10 border-[#BC8E6D]/30 text-[#BC8E6D]'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-1.5">
                    <Gavel className="w-4 h-4" />
                    <span>Recorded Tribunal Verdict</span>
                  </div>
                  <span className="text-[10px] font-mono">{selectedDispute.verdictDate || 'Signed'}</span>
                </div>
                <p className="text-xs text-[#2C2E29] font-medium leading-relaxed">
                  {selectedDispute.verdict}
                </p>
                {selectedDispute.verdictNotes && (
                  <p className="text-[11px] text-[#73776A] italic">
                    Auditor Notes: {selectedDispute.verdictNotes}
                  </p>
                )}
              </div>
            )}

            {/* Adjudication Tribunal Ruling Workspace */}
            <div className="pt-4 border-t border-[#E8E4DD] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gavel className="w-4 h-4 text-[#5D634C]" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D]">
                    Adjudication Tribunal Ruling Actions
                  </h3>
                </div>
                <span className="text-[10px] text-[#73776A]">
                  Signed by authorized cooperative audit officer
                </span>
              </div>

              {/* Auditor Rationale Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C2E29]">
                  Tribunal Finding & Rationale (Recorded on Ledger):
                </label>
                <textarea
                  rows={2}
                  value={tribunalRationale}
                  onChange={(e) => setTribunalRationale(e.target.value)}
                  placeholder="Enter specific forensic findings, material spectroscopy results, or legal basis for ruling..."
                  className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29] focus:outline-hidden focus:border-[#5D634C]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleAdjudicate('approved_authentic')}
                  className="px-5 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Authentic (Release Escrow)</span>
                </button>

                <button
                  onClick={() => handleAdjudicate('confirmed_counterfeit')}
                  className="px-5 py-2.5 bg-[#A25247] text-white text-xs font-semibold rounded-full hover:bg-[#8B443B] transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Confirm Counterfeit (Takedown & Refund)</span>
                </button>

                <button
                  onClick={() => handleAdjudicate('needs_evidence')}
                  className="px-4 py-2.5 bg-white border border-[#DCD7CF] text-[#2C2E29] text-xs font-semibold rounded-full hover:bg-[#E8E4DD] transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <HelpCircle className="w-4 h-4 text-[#BC8E6D]" />
                  <span>Requisition More Evidence</span>
                </button>

                <button
                  onClick={() => handleAdjudicate('escalated')}
                  className="px-4 py-2.5 bg-white border border-[#A25247]/30 text-[#A25247] text-xs font-semibold rounded-full hover:bg-[#A25247]/10 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Escalate to Ministry</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 bg-white border border-black/[0.03] rounded-[32px] p-12 text-center space-y-3 craft-shadow-subtle">
            <Scale className="w-12 h-12 text-[#73776A] mx-auto opacity-40" />
            <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">No Dispute Selected</h3>
            <p className="text-xs text-[#73776A] max-w-sm mx-auto">
              Select an active case from the left column to view forensic testimonies, evidence logs, and execute tribunal rulings.
            </p>
          </div>
        )}

      </div>

      {/* 4. MODAL: REGISTER NEW DISPUTE CLAIM */}
      {isNewDisputeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#DCD7CF] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5D634C] text-white flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                    Register New Dispute Claim
                  </h3>
                  <p className="text-xs text-[#73776A]">
                    Log buyer counterfeit claim, material anomaly, or artisan IP infringement
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewDisputeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#DCD7CF] text-[#73776A] hover:text-[#2C2E29] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewDispute} className="space-y-4">
              
              {/* Product Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Target Product</label>
                  <select
                    value={newDisputeForm.productId}
                    onChange={(e) => {
                      const found = products.find(p => p.productId === e.target.value);
                      setNewDisputeForm({
                        ...newDisputeForm,
                        productId: e.target.value,
                        productName: found ? found.name : newDisputeForm.productName,
                        escrowAmount: found ? found.price.retail : newDisputeForm.escrowAmount
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.productId}>
                        {p.productId} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Escrow Amount (INR)</label>
                  <input
                    type="number"
                    value={newDisputeForm.escrowAmount}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, escrowAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  />
                </div>
              </div>

              {/* Buyer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Buyer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma (Bengaluru)"
                    value={newDisputeForm.buyerName}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, buyerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Buyer Contact / Email</label>
                  <input
                    type="email"
                    placeholder="buyer@example.com"
                    value={newDisputeForm.buyerContact}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, buyerContact: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  />
                </div>
              </div>

              {/* Marketplace / Platform */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2E29]">Purchased Channel / Suspected Platform</label>
                <input
                  type="text"
                  placeholder="e.g. GlobalCraftBazaar.com (Unauthorized Seller Store)"
                  value={newDisputeForm.marketplacePlatform}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, marketplacePlatform: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                />
              </div>

              {/* Buyer Complaint */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2E29]">Buyer Complaint Statement</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe reported issue: physical difference, synthetic material smell, non-handmade stitch, missing stamp..."
                  value={newDisputeForm.buyerComplaint}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, buyerComplaint: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                />
              </div>

              {/* Artisan Initial Response */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2E29]">Artisan / Guild Response</label>
                <textarea
                  rows={2}
                  placeholder="Artisan statement or guild confirmation of authenticity..."
                  value={newDisputeForm.artisanResponse}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, artisanResponse: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                />
              </div>

              {/* AI Risk Score Slider */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2C2E29]">Initial Forensic Risk Estimation:</span>
                  <span className="font-bold text-[#A25247]">{newDisputeForm.aiRiskScore}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="98"
                  value={newDisputeForm.aiRiskScore}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, aiRiskScore: Number(e.target.value) })}
                  className="w-full accent-[#A25247]"
                />
              </div>

              <div className="pt-4 border-t border-[#E8E4DD] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewDisputeModalOpen(false)}
                  className="px-5 py-2.5 bg-[#FAF8F5] border border-[#DCD7CF] text-xs font-semibold rounded-full text-[#2C2E29] hover:bg-[#E8E4DD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shadow-xs"
                >
                  Register Dispute & Lock Escrow
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. MODAL: SUBMIT FORENSIC EVIDENCE */}
      {isAddEvidenceModalOpen && selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#DCD7CF] rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-4">
              <div className="flex items-center space-x-2">
                <Microscope className="w-5 h-5 text-[#5D634C]" />
                <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                  Submit Forensic Evidence
                </h3>
              </div>
              <button
                onClick={() => setIsAddEvidenceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#DCD7CF] text-[#73776A] hover:text-[#2C2E29] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvidenceSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2E29]">Evidence Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. XRF Spectrometry Metal Analysis Certificate #OD-99"
                  value={newEvidenceForm.title}
                  onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Category</label>
                  <select
                    value={newEvidenceForm.type}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  >
                    <option value="document">Audit Document / Log</option>
                    <option value="image">Macro Craft Photo</option>
                    <option value="spectroscopy">Lab Chemical Spectroscopy</option>
                    <option value="voice">Audio Voice Testimony</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Submitted By</label>
                  <input
                    type="text"
                    value={newEvidenceForm.submittedBy}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, submittedBy: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  />
                </div>
              </div>

              {newEvidenceForm.type === 'image' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2E29]">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newEvidenceForm.url}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, url: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2E29]">Forensic Notes & Conclusions</label>
                <textarea
                  rows={2}
                  placeholder="Notes explaining what this evidentiary piece proves regarding craft authenticity..."
                  value={newEvidenceForm.notes}
                  onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-[#2C2E29]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E4DD] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddEvidenceModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF8F5] border border-[#DCD7CF] text-xs font-semibold rounded-full text-[#2C2E29] hover:bg-[#E8E4DD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shadow-xs"
                >
                  Save to Evidence Locker
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. MODAL: OFFICIAL TRIBUNAL LEGAL NOTICE & DOSSIER */}
      {isLegalNoticeModalOpen && selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#DCD7CF] rounded-[32px] max-w-3xl w-full p-6 sm:p-10 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#5D634C] text-[#FAF8F5] flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-[#2C2E29]">
                    Official Cooperative Tribunal Adjudication Dossier
                  </h3>
                  <p className="text-xs text-[#73776A]">
                    Geographical Indications of Goods (Registration & Protection) Act, 1999 • Ministry of Textiles
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLegalNoticeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#DCD7CF] text-[#73776A] hover:text-[#2C2E29] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Dossier Document Content */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-5 text-xs text-[#2C2E29]">
              
              {/* Document Header */}
              <div className="text-center space-y-1 border-b border-[#DCD7CF] pb-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#BC8E6D]">
                  GOVERNMENT OF INDIA • GEOGRAPHICAL INDICATION REGISTRY
                </div>
                <div className="font-serif italic text-lg font-bold text-[#2C2E29]">
                  COOPERATIVE ARBITRATION TRIBUNAL RULING
                </div>
                <div className="font-mono text-[11px] text-[#73776A]">
                  Reference ID: {selectedDispute.legalNoticeRef || `CD-GI-2026-TRIB-${selectedDispute.disputeCode}`}
                </div>
              </div>

              {/* Case Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white border border-black/[0.03]">
                <div>
                  <span className="text-[9px] text-[#73776A] uppercase font-bold tracking-wider">Dispute Code</span>
                  <div className="font-mono font-bold text-[#2C2E29]">{selectedDispute.disputeCode}</div>
                </div>
                <div>
                  <span className="text-[9px] text-[#73776A] uppercase font-bold tracking-wider">Passport ID</span>
                  <div className="font-mono font-bold text-[#2C2E29]">{selectedDispute.productId}</div>
                </div>
                <div>
                  <span className="text-[9px] text-[#73776A] uppercase font-bold tracking-wider">Master Artisan</span>
                  <div className="font-bold text-[#2C2E29]">{selectedDispute.artisanName}</div>
                </div>
                <div>
                  <span className="text-[9px] text-[#73776A] uppercase font-bold tracking-wider">Escrow Custody</span>
                  <div className="font-bold text-[#5D634C]">₹{(selectedDispute.escrowAmount || 5200).toLocaleString()}</div>
                </div>
              </div>

              {/* Chronology & Findings */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#BC8E6D]">
                  1. Evidentiary Chronology & Submissions
                </h4>
                <div className="p-3 rounded-xl bg-white border border-black/[0.03] space-y-1.5">
                  <p><strong>Complainant:</strong> {selectedDispute.buyerName} ({selectedDispute.marketplacePlatform})</p>
                  <p><strong>Complaint Statement:</strong> "{selectedDispute.buyerComplaint || selectedDispute.buyerClaim}"</p>
                  <p><strong>Artisan Defense:</strong> "{selectedDispute.artisanResponse}"</p>
                </div>
              </div>

              {/* Evidence Exhibits */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#BC8E6D]">
                  2. Registered Forensic Exhibits
                </h4>
                <ul className="space-y-1 pl-4 list-disc text-[11px] text-[#73776A]">
                  {selectedDispute.evidenceList.map((ev, i) => (
                    <li key={i}>
                      {typeof ev === 'object' && ev !== null ? `${ev.title} (${ev.submittedBy || 'Auditor'})` : ev}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Mandate & Finding */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#BC8E6D]">
                  3. Tribunal Finding & Statutory Mandate
                </h4>
                <div className="p-3.5 rounded-xl bg-white border border-[#5D634C]/25 text-[#2C2E29] leading-relaxed">
                  <p>
                    {selectedDispute.verdict || (
                      selectedDispute.status === 'confirmed_counterfeit'
                        ? 'The Tribunal confirms unlawful unauthorized reproduction of Geographical Indication craft markings. In accordance with Section 38 & 39 of the GI Act 1999, immediate cease & desist is ordered, marketplace listing is quarantined, and 100% funds refunded to the buyer.'
                        : 'The Tribunal verifies authentic handcraft provenance meeting all registered GI cluster specifications. Full artisan wage escrow is unlocked.'
                    )}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-[#DCD7CF] flex items-center justify-between text-[11px] text-[#73776A]">
                <div>
                  <div className="font-bold text-[#2C2E29]">{selectedDispute.assignedAuditor || 'Bipin Nayak'}</div>
                  <div>Lead Tribunal Arbitrator • Utkalika Apex Guild</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[#5D634C] font-bold">✓ Blockchain Stamped</div>
                  <div className="font-mono text-[9px]">Root: {selectedDispute.blockchainHash?.slice(0, 20)}...</div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleCopyHash(JSON.stringify(selectedDispute, null, 2))}
                className="px-4 py-2 bg-white border border-[#DCD7CF] text-xs font-semibold rounded-full text-[#2C2E29] hover:bg-[#E8E4DD] flex items-center space-x-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-[#5D634C]" />
                <span>Copy JSON Dossier</span>
              </button>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => {
                    showNotification('Printing Tribunal Dossier...', 'info');
                    window.print();
                  }}
                  className="px-5 py-2 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shadow-xs flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Notice</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. MODAL: HIGH-RES EVIDENCE ZOOM */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">
                {zoomedImage.title}
              </h3>
              <button
                onClick={() => setZoomedImage(null)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#2C2E29] hover:bg-[#E8E4DD] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#DCD7CF] max-h-[65vh] bg-[#FAF8F5] flex items-center justify-center">
              <SafeImage
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#73776A]">
              <span>High-Resolution Craft Inspection View</span>
              <button
                onClick={() => setZoomedImage(null)}
                className="px-4 py-1.5 bg-[#5D634C] text-white text-xs font-semibold rounded-full"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
