// server/modules/ai/mlClient.service.ts
import { env } from '../../config/env';

export interface MLFingerprintSummary {
  num_keypoints: number;
  feature_method: string;
  roi_position: [number, number];
  roi_size: [number, number];
  roi_quality: number;
}

export interface MLRegisterResponse {
  success: boolean;
  product_id: string;
  product_name: string;
  manifest_hash: string;
  rsa_signature: string;
  fingerprint_summary: MLFingerprintSummary;
  timestamp: string;
}

export interface MLVerificationCandidate {
  product_id: string;
  similarity_score: number;
  ransac_inliers: number;
  lbp_similarity: number;
  glcm_similarity: number;
}

export interface MLVerificationResult {
  query_image: string;
  product_id: string;
  best_candidate: string;
  similarity: number;
  similarity_percent: string;
  threshold: number;
  threshold_percent: string;
  decision: string;
  physical_decision: string;
  digital_decision: string;
  final_decision: string;
  status: 'AUTHENTIC' | 'SUSPICIOUS' | 'COUNTERFEIT' | 'UNKNOWN' | 'ERROR' | 'INVALID_INPUT';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  roi_quality: number;
  failure_reason: string;
  model_version: string;
  feature_version: string;
  preprocessing_version: string;
  processing_time_seconds: number;
  timestamp: string;
  digital_manifest_summary: Record<string, any>;
  total_candidates_searched: number;
  top_candidates: Array<{
    product_id: string;
    similarity: number;
    ransac_inliers: number;
    lbp_similarity: number;
    glcm_similarity: number;
  }>;
}

export interface MLVerifyResponse {
  success: boolean;
  verification: MLVerificationResult;
  best_candidate?: MLVerificationCandidate;
  layer2_intelligence?: Record<string, any> | null;
}

export class MLClientService {
  private static get baseUrl(): string {
    return process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
  }

  /**
   * Health check for Python ML microservice
   */
  public static async checkHealth(): Promise<{
    status: string;
    model_loaded: boolean;
    registered_products_count: number;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/ml/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) {
        throw new Error(`ML service returned HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn(`[MLClient] Health check failed against ${this.baseUrl}:`, err.message);
      return { status: 'offline', model_loaded: false, registered_products_count: 0 };
    }
  }

  /**
   * Enrolls a product fingerprint & generates RSA manifest signature in Python ML
   */
  public static async registerProduct(params: {
    productId: string;
    name?: string;
    manufacturer?: string;
    category?: string;
    batch?: string;
    location?: string;
    imageBase64?: string;
    imageUrl?: string;
    force?: boolean;
  }): Promise<MLRegisterResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ml/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: params.productId,
          name: params.name || params.productId,
          manufacturer: params.manufacturer || 'KALAKRITI_AUTH_MFG',
          category: params.category || 'handicraft',
          batch: params.batch || 'BATCH_2026_01',
          location: params.location || 'India',
          image_base64: params.imageBase64,
          image_url: params.imageUrl,
          force: params.force ?? true
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error(`[MLClient] Register failed (${res.status}):`, errorBody);
        return null;
      }

      return await res.json();
    } catch (err: any) {
      console.error(`[MLClient] Error during product registration for ${params.productId}:`, err.message);
      return null;
    }
  }

  /**
   * Evaluates query photograph against registered database (1:N) or target product (1:1)
   */
  public static async verifyProduct(params: {
    imageBase64?: string;
    imageUrl?: string;
    productId?: string;
    threshold?: number;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    country?: string;
  }): Promise<MLVerifyResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ml/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: params.imageBase64,
          image_url: params.imageUrl,
          product_id: params.productId,
          threshold: params.threshold,
          latitude: params.latitude,
          longitude: params.longitude,
          city: params.city,
          state: params.state,
          country: params.country,
          trigger_layer2: true
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error(`[MLClient] Verify error (${res.status}):`, errorBody);
        return null;
      }

      return await res.json();
    } catch (err: any) {
      console.error('[MLClient] Verification call failed:', err.message);
      return null;
    }
  }

  /**
   * Fetches Layer 2 Counterfeit Intelligence Dashboard Summary
   */
  public static async getIntelligenceDashboard(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/ml/intelligence/dashboard`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err: any) {
      console.warn('[MLClient] Could not fetch intelligence dashboard:', err.message);
      return null;
    }
  }

  /**
   * Fetches recorded Layer 2 Incidents
   */
  public static async listIncidents(status?: string): Promise<any[]> {
    try {
      const url = status
        ? `${this.baseUrl}/ml/intelligence/incidents?status=${encodeURIComponent(status)}`
        : `${this.baseUrl}/ml/intelligence/incidents`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.incidents || [];
    } catch (err: any) {
      console.warn('[MLClient] Could not fetch incidents:', err.message);
      return [];
    }
  }

  /**
   * Fetches geographical clusters and hotspots
   */
  public static async getHotspots(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/ml/intelligence/hotspots`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.hotspots || [];
    } catch (err: any) {
      console.warn('[MLClient] Could not fetch hotspots:', err.message);
      return [];
    }
  }
}
