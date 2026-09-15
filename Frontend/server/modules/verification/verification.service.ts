// server/modules/verification/verification.service.ts
import { db } from '../../config/supabase';
import { AuthUser, TrustScore, VerificationDecision } from '../../types';
import { ProvenanceService } from '../provenance/provenance.service';
import { matchPhysicalProduct, PhysicalMatchResult } from '../ai/visionMatcher.service';
import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES, TRUST_WEIGHTS } from '../../config/constants';

export class VerificationService {
  /**
   * Evaluates and records a formal cooperative or expert review decision on a handicraft product.
   */
  public static async verifyProduct(
    productId: string,
    input: {
      decision: VerificationDecision;
      notes?: string;
      checklist?: Record<string, boolean>;
    },
    verifier: AuthUser
  ): Promise<{
    verificationId: string;
    productStatus: string;
    trustScore: TrustScore;
  }> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${productId}' not found.`, 404);
    }

    const verificationId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Update product status
    if (input.decision === 'APPROVED') {
      product.status = 'VERIFIED';
    } else if (input.decision === 'REJECTED') {
      product.status = 'DISPUTED';
    }
    product.updatedAt = new Date().toISOString();

    // Calculate multi-factor trust score
    const trustScore = await this.calculateTrustScore(productId, input.decision);

    // Record in immutable provenance ledger
    await ProvenanceService.recordEvent({
      productId,
      actorId: verifier.id,
      actorName: verifier.fullName,
      actorRole: verifier.role,
      eventType: verifier.role === 'COOPERATIVE' ? 'COOPERATIVE_VERIFIED' : 'PRODUCT_VERIFIED',
      metadata: {
        decision: input.decision,
        notes: input.notes,
        checklist: input.checklist,
        trustScore: trustScore.compositeScore
      }
    });

    return {
      verificationId,
      productStatus: product.status,
      trustScore
    };
  }

  /**
   * Computes an evidence-grounded Trust Score between 0.00 and 1.00.
   * Avoids simplistic "100% authentic" claims by assessing distinct provenance dimensions.
   */
  public static async calculateTrustScore(
    productId: string,
    recentDecision?: VerificationDecision
  ): Promise<TrustScore> {
    const product = db.products.get(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${productId}' not found.`, 404);
    }

    const artisan = db.artisans.get(product.artisanId);
    const cooperative = product.cooperativeId ? db.cooperatives.get(product.cooperativeId) : null;
    const evidenceCount = product.evidence?.length || 0;
    const provenanceAudit = await ProvenanceService.getProductProvenance(productId);

    // Factor 1: Artisan Accreditation & GI registry status
    const artisanFactor = artisan?.verificationStatus === 'VERIFIED'
      ? (artisan.giAuthorizedNo ? 1.0 : 0.90)
      : artisan?.verificationStatus === 'PENDING' ? 0.60 : 0.20;

    // Factor 2: Cooperative Audit
    const coopFactor = cooperative
      ? (cooperative.verificationStatus === 'VERIFIED' ? 0.98 : 0.70)
      : 0.50;

    // Factor 3: Evidence completeness (workshop photo, process video, raw material slip)
    const evidenceFactor = Math.min(1.0, 0.40 + (evidenceCount * 0.25));

    // Factor 4: Provenance Chain Cryptographic Integrity
    const provenanceFactor = provenanceAudit.isChainValid
      ? Math.min(1.0, 0.60 + (provenanceAudit.totalEvents * 0.10))
      : 0.10;

    const compositeScore = Number(
      (
        artisanFactor * TRUST_WEIGHTS.ARTISAN_VERIFICATION +
        coopFactor * TRUST_WEIGHTS.COOPERATIVE_AUDIT +
        evidenceFactor * TRUST_WEIGHTS.EVIDENCE_INTEGRITY +
        provenanceFactor * TRUST_WEIGHTS.PROVENANCE_HISTORY
      ).toFixed(2)
    );

    const trustScore: TrustScore = {
      id: `ts-${productId}`,
      productId,
      compositeScore,
      artisanFactor: Number(artisanFactor.toFixed(2)),
      coopFactor: Number(coopFactor.toFixed(2)),
      evidenceFactor: Number(evidenceFactor.toFixed(2)),
      provenanceFactor: Number(provenanceFactor.toFixed(2)),
      calculatedAt: new Date().toISOString()
    };

    db.trustScores.set(productId, trustScore);
    return trustScore;
  }

  /**
   * Physical Product Verification Endpoint (Targeted 1:1 or Product-Specific)
   * Compares an in-hand physical photo against registered archive evidence.
   */
  public static async physicalCheck(
    productId: string,
    imageBase64OrUrl: string,
    locationMeta?: { latitude?: number; longitude?: number; city?: string; state?: string; country?: string },
    user?: AuthUser
  ): Promise<PhysicalMatchResult> {
    const cleanId = (productId || '').trim().toUpperCase();
    const internalId = db.productsBy7CharId.get(cleanId);
    let product = internalId ? db.products.get(internalId) : db.products.get(productId);
    if (!product) {
      for (const p of db.products.values()) {
        if (p.productId?.toUpperCase() === cleanId || p.productCode?.toUpperCase() === cleanId) {
          product = p;
          break;
        }
      }
    }
    if (!product) {
      throw new AppError(ERROR_CODES.NOT_FOUND, `Product '${productId}' not found.`, 404);
    }

    const registeredEvidence = (product.evidence || []).map(e => ({
      id: e.id,
      label: e.label,
      fileUrl: e.fileUrl,
      fileHash: e.fileHash
    }));

    const result = await matchPhysicalProduct(productId, imageBase64OrUrl, registeredEvidence, locationMeta);

    // Record physical verification audit event in provenance ledger
    await ProvenanceService.recordEvent({
      productId,
      actorId: user?.id || 'buyer-anonymous',
      actorName: user?.fullName || 'Customer / Buyer App',
      actorRole: user?.role || 'BUYER',
      eventType: result.status === 'AUTHENTIC' ? 'PHYSICAL_VERIFIED' : 'COUNTERFEIT_FLAGGED',
      metadata: {
        similarityScore: result.similarityScore,
        decision: result.decision || result.status,
        ransacInliers: result.metrics?.ransacInliers,
        lbpSimilarity: result.metrics?.lbpSimilarity,
        glcmSimilarity: result.metrics?.glcmSimilarity,
        rsaVerified: result.digitalIdentity?.hasSignature,
        location: locationMeta
      }
    });

    // If counterfeit or suspicious, create a fraud alert in the Node database if not already present
    if (result.status === 'COUNTERFEIT' || result.status === 'SUSPICIOUS' || (result.similarityScore < 0.60 && result.status !== 'ERROR')) {
      const alertId = `fa-phys-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      db.fraudAlerts.set(alertId, {
        id: alertId,
        productId,
        aiRiskScore: Number((1 - result.similarityScore).toFixed(2)),
        aiRiskLevel: result.riskLevel || 'HIGH',
        detectedReasons: ['PHYSICAL_TEXTURE_ANOMALY', 'GEOMETRIC_ALIGNMENT_FAILURE', 'RANSAC_HOMOGRAPHY_REJECTION'],
        evidencePayload: {
          visualSimilarityScore: result.similarityScore,
          explanation: result.explanation,
          matchedEvidenceUrls: registeredEvidence.map(e => e.fileUrl)
        },
        humanReviewStatus: 'PENDING',
        product,
        createdAt: new Date().toISOString()
      });
    }

    return result;
  }

  /**
   * 1:N Physical Verification Endpoint
   * Takes an unknown query photograph and searches all registered craft fingerprints.
   */
  public static async physicalCheck1ToN(
    imageBase64OrUrl: string,
    locationMeta?: { latitude?: number; longitude?: number; city?: string; state?: string; country?: string },
    user?: AuthUser
  ): Promise<PhysicalMatchResult> {
    return matchPhysicalProduct('1-to-n-query', imageBase64OrUrl, [], locationMeta);
  }
}
