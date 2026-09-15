export type UserRole = 'buyer' | 'artisan' | 'cooperative' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber?: string;
  cooperativeId?: string;
  avatar?: string;
}

export type LanguageCode = 'en' | 'hi' | 'or' | 'bn' | 'ta' | 'te' | 'kn' | 'mr' | 'gu';

export type VerificationStatus = 'verified' | 'pending' | 'flagged' | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high';

export type LocationConsistencyStatus = 'consistent' | 'inconsistent_review' | 'not_recorded';

export interface CreationLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // e.g. 18 (in meters)
  timestamp: string;
  address?: string;
  isSimulated?: boolean;
}

export interface PublicLocation {
  city: string;
  district: string;
  state: string;
  country: string;
  approximateArea: string; // e.g. "Pipli Craft Cluster, Odisha"
  clusterName?: string;
}

export interface LiveVerificationSession {
  active: boolean;
  artisanId: string;
  artisanName: string;
  remainingSeconds: number;
  totalDurationSeconds: number;
  startedAt: string;
  location?: CreationLocation;
  clusterName?: string;
}

export interface EvidenceItem {
  id: string;
  url: string;
  category: 'finished' | 'artisan_with_product' | 'craft_process' | 'makers_mark' | 'raw_material';
  label: string;
  timestamp: string;
  geoTag?: string;
  hash?: string;
}

export interface TrustFactor {
  id: string;
  label: string;
  verified: boolean;
  description: string;
  evidenceType: string;
  authority: string;
}

export interface ProvenanceEvent {
  id: string;
  date: string;
  timestamp: string;
  title: string;
  actor: string;
  role: string;
  location: string;
  status: 'completed' | 'in_progress' | 'pending';
  txRef?: string;
  description: string;
  eventType?: 'creation_location' | 'artisan_verified' | 'evidence_uploaded' | 'cooperative_verified' | 'passport_issued' | 'buyer_verified';
}

export interface ArtisanProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  title: string;
  bio: string;
  location: string;
  district: string;
  state: string;
  cooperativeName: string;
  cooperativeId: string;
  experienceYears: number;
  craftTradition: string;
  storyAudioUrl?: string;
  phone: string;
  verifiedAt: string;
  totalProducts: number;
  totalPayouts: string;
  rating: number;
  defaultCluster?: string;
  approxCoords?: { latitude: number; longitude: number };
  isNewProfile?: boolean;
  kalakritiArtisanId?: string;
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface PriceBreakdown {
  retail: number;
  artisanCompensation: number;
  cooperativeShare: number;
  rawMaterialsLogistics: number;
  currency: string;
}

export interface PhysicalMatchResult {
  similarityPercentage: number;
  status: 'LIKELY_MATCH' | 'INCONCLUSIVE' | 'MISMATCH';
  patternMatch: boolean;
  makerMarkDetected: boolean;
  evidenceConsistency: boolean;
  notes: string;
  capturedImageUrl?: string;
}

export interface ProductPassport {
  id: string;
  productId: string; // e.g. "CRAFT-00124"
  name: string;
  craftCategory: string;
  productType: string;
  description: string;
  artisan: ArtisanProfile;
  materials: string[];
  techniques: string[];
  creationDate: string;
  productionDuration: string;
  price: PriceBreakdown;
  primaryImage: string;
  evidenceImages: EvidenceItem[];
  careInstructions: string[];
  
  // Location & Provenance Signals
  creationLocation?: CreationLocation;
  publicLocation?: PublicLocation;
  locationConsistency?: LocationConsistencyStatus;
  
  trustLevel: {
    score: number;
    maxScore: number;
    factors: TrustFactor[];
  };
  physicalMatch: PhysicalMatchResult;
  provenanceTimeline: ProvenanceEvent[];
  qrCodeUrl: string;
  nfcUid: string;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  fingerprintImageDataUrl?: string;
  processVideoUrl?: string;
  processVideoStatus?: 'SUBMITTED' | 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  processVideoDuration?: number;
  processVideoTimestamp?: string;
  status: VerificationStatus;
  verificationHistory: Array<{
    id: string;
    date: string;
    reviewer: string;
    action: string;
    notes: string;
  }>;
  flagDetails?: {
    isSuspicious: boolean;
    riskLevel: RiskLevel;
    reasons: string[];
    investigationStatus: 'pending' | 'resolved' | 'escalated';
  };
}

export interface CounterfeitDetectionLocation {
  latitude: number;
  longitude: number;
  city: string;
  district?: string;
  state: string;
  facilityType: string; // e.g. "Industrial Synthetic Mill", "Die-Cast Foundry", "Drop-Shipping Hub"
  address?: string;
  region: string;
  interceptionType?: 'physical_seizure' | 'ip_geolocation' | 'shipping_origin' | 'market_inspection';
}

export interface CounterfeitGenuineOrigin {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  clusterName: string;
}

export interface CounterfeitAlert {
  id: string;
  alertCode: string;
  listingNumber: string;
  productId: string;
  productName: string;
  riskPercentage: number;
  riskLevel: RiskLevel;
  reasons: string[];
  detectedUrl: string;
  priceAnomaly: string;
  imageSimilarity: number;
  passportReused: boolean;
  sellerMismatch: boolean;
  locationMismatch?: boolean;
  creationLocationMismatch?: boolean;
  listingLocation?: string;
  registeredLocation?: string;
  detectionLocation?: CounterfeitDetectionLocation;
  genuineOrigin?: CounterfeitGenuineOrigin;
  distanceFromOriginKm?: number;
  seizureVolume?: number;
  enforcementAgency?: string;
  reportedDate: string;
  status: 'investigating' | 'resolved' | 'escalated';
  originalArtisan: string;
  suspectedSeller: string;
  platform: string;
}

export interface DisputeEvidenceItem {
  id?: string;
  title: string;
  type?: 'image' | 'document' | 'voice' | 'spectroscopy' | 'location_log' | 'testimony' | string;
  verified?: boolean;
  url?: string;
  timestamp?: string;
  submittedBy?: string;
  notes?: string;
}

export interface DisputeCase {
  id: string;
  disputeCode: string;
  caseNumber?: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerClaim?: string;
  buyerComplaint?: string;
  buyerContact?: string;
  artisanName: string;
  artisanAvatar?: string;
  artisanResponse?: string;
  artisanTestimony?: string;
  cooperativeName: string;
  cooperativeId?: string;
  aiRiskAssessment?: number;
  aiRiskScore: number;
  evidenceList: Array<DisputeEvidenceItem | string>;
  filedDate?: string;
  filingDate: string;
  status: 'open' | 'resolved' | 'approved_authentic' | 'confirmed_counterfeit' | 'needs_evidence' | 'escalated';
  assignedAuditor: string;
  verdict?: string;
  verdictNotes?: string;
  verdictDate?: string;
  escrowStatus?: 'locked_in_escrow' | 'released_to_artisan' | 'refunded_to_buyer' | 'frozen_for_investigation';
  escrowAmount?: number;
  currency?: string;
  transactionRef?: string;
  marketplacePlatform?: string;
  legalNoticeGenerated?: boolean;
  legalNoticeRef?: string;
  blockchainHash?: string;
}

export interface VoiceUnderstandingResult {
  transcript: string;
  language: string;
  extracted: {
    productName?: string;
    materials: string[];
    technique: string;
    productionTime: string;
    location?: string;
    storySummary?: string;
  };
}

export interface ArtisanLocationSettings {
  shareCreationLocation: boolean;
  allowPublicApproximate: boolean;
  liveVerificationConsent: boolean;
}
