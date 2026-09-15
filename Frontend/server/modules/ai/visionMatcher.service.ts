// server/modules/ai/visionMatcher.service.ts
import { MLClientService, MLVerifyResponse } from './mlClient.service';

export interface PhysicalMatchResult {
  similarityScore: number;
  similarityPercent?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: string;
  decision?: string;
  physicalDecision?: string;
  digitalDecision?: string;
  finalDecision?: string;
  matchedEvidence: Array<{
    evidenceId: string;
    label: string;
    imageUrl: string;
    confidence: number;
  }>;
  explanation: string;
  keyFeaturePoints: {
    weaveDensityMatch: boolean;
    motifAlignmentMatch: boolean;
    colorPaletteVariance: number; // 0.00 to 1.00
    patinaTextureAuthenticity: number; // 0.00 to 1.00
  };
  metrics?: {
    ransacInliers: number;
    lbpSimilarity: number;
    glcmSimilarity: number;
    roiQuality: number;
    processingTimeSeconds: number;
  };
  digitalIdentity?: {
    manifestHash?: string;
    hasSignature?: boolean;
    digitalDecision?: string;
  };
  layer2Incident?: Record<string, any> | null;
}

/**
 * Computer Vision & Feature Matching Service
 * Delegates physical image analysis to the Python ML Engine (ORB/AKAZE + LBP + GLCM + RANSAC + RSA Manifest Signature).
 */
export async function matchPhysicalProduct(
  productId: string,
  uploadedImageBase64OrUrl: string,
  registeredEvidence: Array<{ id: string; label: string; fileUrl: string; fileHash: string }>,
  locationMeta?: { latitude?: number; longitude?: number; city?: string; state?: string; country?: string }
): Promise<PhysicalMatchResult> {
  const isBase64 = uploadedImageBase64OrUrl.startsWith('data:') || uploadedImageBase64OrUrl.length > 500;
  
  // Dispatch verification to Python ML Service
  const mlResponse: MLVerifyResponse | null = await MLClientService.verifyProduct({
    imageBase64: isBase64 ? uploadedImageBase64OrUrl : undefined,
    imageUrl: !isBase64 ? uploadedImageBase64OrUrl : undefined,
    productId,
    latitude: locationMeta?.latitude,
    longitude: locationMeta?.longitude,
    city: locationMeta?.city,
    state: locationMeta?.state,
    country: locationMeta?.country,
  });

  if (mlResponse && mlResponse.success && mlResponse.verification) {
    const v = mlResponse.verification;
    const similarity = v.similarity ?? 0.0;
    const isAuthentic = v.status === 'AUTHENTIC';
    const isSuspicious = v.status === 'SUSPICIOUS';

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = isAuthentic
      ? 'LOW'
      : isSuspicious
      ? 'MEDIUM'
      : similarity < 0.40
      ? 'CRITICAL'
      : 'HIGH';

    const bestCand = mlResponse.best_candidate;
    const inliers = bestCand?.ransac_inliers ?? 0;
    const lbpSim = bestCand?.lbp_similarity ?? 0.0;
    const glcmSim = bestCand?.glcm_similarity ?? 0.0;

    const explanation = isAuthentic
      ? `Real-time physical pattern matching confirmed authentic craft morphology (${v.similarity_percent || Math.round(similarity * 100) + '%'} similarity, ${inliers} RANSAC inliers, RSA-2048 Digital Manifest verified).`
      : `Physical inspection detected anomaly: ${v.final_decision || v.decision} (${v.similarity_percent || Math.round(similarity * 100) + '%'} similarity against registered reference).`;

    return {
      similarityScore: similarity,
      similarityPercent: v.similarity_percent || `${Math.round(similarity * 100)}%`,
      riskLevel,
      status: v.status,
      decision: v.decision,
      physicalDecision: v.physical_decision,
      digitalDecision: v.digital_decision,
      finalDecision: v.final_decision,
      matchedEvidence: registeredEvidence.map(e => ({
        evidenceId: e.id,
        label: e.label,
        imageUrl: e.fileUrl,
        confidence: similarity
      })),
      explanation,
      keyFeaturePoints: {
        weaveDensityMatch: inliers >= 10 || similarity >= 0.70,
        motifAlignmentMatch: lbpSim >= 0.65 || similarity >= 0.75,
        colorPaletteVariance: Number((1 - similarity).toFixed(2)),
        patinaTextureAuthenticity: Number(similarity.toFixed(2))
      },
      metrics: {
        ransacInliers: inliers,
        lbpSimilarity: lbpSim,
        glcmSimilarity: glcmSim,
        roiQuality: v.roi_quality || 0.0,
        processingTimeSeconds: v.processing_time_seconds || 0.0
      },
      digitalIdentity: {
        manifestHash: v.digital_manifest_summary?.manifest_hash,
        hasSignature: Boolean(v.digital_manifest_summary?.rsa_signature),
        digitalDecision: v.digital_decision
      },
      layer2Incident: mlResponse.layer2_intelligence
    };
  }

  // Fallback when ML engine is unreachable or returns error
  // Never report fake AUTHENTIC on failure
  console.warn(`[VisionMatcher] ML service unavailable or failed for product ${productId}. Returning structured unverified state.`);

  return {
    similarityScore: 0.0,
    similarityPercent: 'N/A',
    riskLevel: 'HIGH',
    status: 'ERROR',
    decision: 'ML_SERVICE_UNAVAILABLE',
    physicalDecision: 'NOT_VERIFIED',
    digitalDecision: 'N/A',
    finalDecision: 'SERVICE_OFFLINE',
    matchedEvidence: registeredEvidence.map(e => ({
      evidenceId: e.id,
      label: e.label,
      imageUrl: e.fileUrl,
      confidence: 0.0
    })),
    explanation: 'Python Physical Authentication Engine is currently unreachable. Verification could not be computed.',
    keyFeaturePoints: {
      weaveDensityMatch: false,
      motifAlignmentMatch: false,
      colorPaletteVariance: 1.0,
      patinaTextureAuthenticity: 0.0
    }
  };
}
