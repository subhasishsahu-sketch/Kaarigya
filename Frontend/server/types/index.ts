// server/types/index.ts
// Domain Types and DB Entities for S8 Traditional Craft Digital Passport Platform

export type UserRole = 'ARTISAN' | 'BUYER' | 'COOPERATIVE' | 'REVIEWER' | 'ADMIN';

export type ArtisanVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CoopVerificationStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED';
export type ProductStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'ACTIVE' | 'SOLD' | 'DISPUTED' | 'ARCHIVED';
export type EvidenceType = 'WORKSHOP_PHOTO' | 'PROCESS_VIDEO' | 'RAW_MATERIAL_SLIP' | 'AUDIO_TESTIMONY' | 'GI_CERTIFICATE';
export type PassportStatus = 'ACTIVE' | 'FLAGGED' | 'REVOKED';
export type PassportTagType = 'QR_PRINT' | 'NFC_STICKER' | 'TAMPER_SEAL';
export type VerifierRole = 'COOPERATIVE' | 'REVIEWER' | 'ADMIN';
export type VerificationDecision = 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';

export type ProvenanceEventType =
  | 'PRODUCT_CREATED'
  | 'PASSPORT_CREATED'
  | 'ARTISAN_VERIFIED'
  | 'COOPERATIVE_VERIFIED'
  | 'EVIDENCE_ADDED'
  | 'PRODUCT_VERIFIED'
  | 'PHYSICAL_VERIFIED'
  | 'PRODUCT_SOLD'
  | 'OWNERSHIP_TRANSFERRED'
  | 'COUNTERFEIT_FLAGGED'
  | 'COUNTERFEIT_REVIEWED'
  | 'DISPUTE_CREATED'
  | 'DISPUTE_RESOLVED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FraudReviewStatus = 'PENDING' | 'CONFIRMED_COUNTERFEIT' | 'FALSE_POSITIVE' | 'RESOLVED';
export type PayoutStatus = 'PENDING' | 'ESCROWED' | 'DISBURSED' | 'DISPUTED';
export type DisputeReason = 'COUNTERFEIT_CLAIM' | 'MATERIAL_MISMATCH' | 'COMPENSATION_UNPAID' | 'UNAUTHORIZED_LISTING';
export type DisputeStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED_VALID' | 'RESOLVED_REJECTED';
export type TransferType = 'PRIMARY_SALE' | 'SECONDARY_TRANSFER' | 'GIFT';
export type NotificationType = 'VERIFICATION_UPDATE' | 'FRAUD_ALERT' | 'PAYOUT_READY' | 'DISPUTE_UPDATE';

// Authenticated User Context attached by AuthContext middleware
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber?: string;
  cooperativeId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cooperative {
  id: string;
  name: string;
  registrationNo?: string;
  regionState: string;
  district: string;
  headArtisanName?: string;
  verificationStatus: CoopVerificationStatus;
  bankAccountHash?: string;
  establishedYear?: number;
  memberCount?: number;
  createdAt: string;
}

export interface Artisan {
  id: string;
  cooperativeId?: string;
  cooperativeName?: string;
  fullName: string;
  craftSpecialties: string[];
  experienceYears: number;
  regionState: string;
  district: string;
  clusterName?: string;
  preferredLang: string;
  bio?: string;
  avatarUrl?: string;
  giAuthorizedNo?: string;
  verificationStatus: ArtisanVerificationStatus;
  kalakritiArtisanId?: string;
  createdAt: string;
}

export interface ProductMaterial {
  id: string;
  productId: string;
  name: string;
  source: string;
  organicCert?: string;
  percentage: number;
}

export interface ProductEvidence {
  id: string;
  productId: string;
  uploadedBy: string;
  evidenceType: EvidenceType;
  label: string;
  fileUrl: string;
  fileHash: string;
  geoLat?: number;
  geoLng?: number;
  geoTagLabel?: string;
  capturedAt: string;
  createdAt: string;
}

export interface Product {
  id: string;
  productId: string; // Exactly 7 alphanumeric characters, globally unique
  productCode: string;
  artisanId: string;
  cooperativeId?: string;
  title: string;
  description: string;
  craftType: string;
  giTagName?: string;
  technique: string;
  originState: string;
  originDistrict: string;
  creationDate: string;
  dimensions?: { widthCm?: number; heightCm?: number; depthCm?: number };
  weightGrams?: number;
  status: ProductStatus;
  materials?: ProductMaterial[];
  evidence?: ProductEvidence[];
  artisan?: Partial<Artisan>;
  cooperative?: Partial<Cooperative>;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  fingerprintImageDataUrl?: string;
  primaryImageUrl?: string;
  processVideoUrl?: string;
  processVideoStatus?: 'SUBMITTED' | 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  processVideoDuration?: number;
  processVideoTimestamp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalPassport {
  id: string;
  productId: string;
  passportVersion: number;
  status: PassportStatus;
  qrCodeHash: string;
  nfcTagUid?: string;
  publicUrlSlug: string;
  latestEventHash: string;
  product?: Product;
  tags?: PassportTag[];
  trustScore?: TrustScore;
  createdAt: string;
  updatedAt: string;
}

export interface PassportTag {
  id: string;
  passportId: string;
  tagType: PassportTagType;
  physicalSerialNo: string;
  activatedAt: string;
  isRevoked: boolean;
}

export interface TrustScore {
  id: string;
  productId: string;
  compositeScore: number;
  artisanFactor: number;
  coopFactor: number;
  evidenceFactor: number;
  provenanceFactor: number;
  calculatedAt: string;
}

export interface ProvenanceEvent {
  id: string;
  productId: string;
  actorId: string;
  actorName?: string;
  actorRole?: UserRole;
  eventType: ProvenanceEventType;
  timestamp: string;
  metadata: Record<string, any>;
  previousEventHash: string;
  currentEventHash: string;
}

export interface MarketplaceListing {
  id: string;
  platformName: string;
  externalUrl: string;
  claimedSellerName: string;
  scrapedTitle: string;
  scrapedDescription?: string;
  scrapedPrice?: number;
  currency: string;
  scrapedImages: string[];
  claimedPassportId?: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  listingId?: string;
  productId?: string;
  aiRiskScore: number;
  aiRiskLevel: RiskLevel;
  detectedReasons: string[];
  evidencePayload: {
    priceDiscrepancyPercent?: number;
    visualSimilarityScore?: number;
    passportReuseDetected?: boolean;
    unauthorizedSeller?: boolean;
    unregisteredCluster?: boolean;
    explanation?: string;
    matchedEvidenceUrls?: string[];
  };
  humanReviewStatus: FraudReviewStatus;
  reviewerId?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  listing?: MarketplaceListing;
  product?: Product;
  createdAt: string;
}

export interface CompensationRecord {
  id: string;
  productId: string;
  grossSaleAmount: number;
  artisanPayout: number;
  cooperativeFee: number;
  logisticsMaterials: number;
  platformFee: number;
  currency: string;
  payoutStatus: PayoutStatus;
  disbursementTxId?: string;
  disbursedAt?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  productId: string;
  initiatorId: string;
  initiatorName?: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

// API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
