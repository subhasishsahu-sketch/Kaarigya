"""
Kalakriti Layer 2 — Detection Event Adapter.

Converts a Layer 1 VerificationResult into a DetectionEvent that Layer 2
consumes without being coupled to Layer 1 internal structures.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any, Dict, Optional


@dataclass
class DetectionEvent:
    """
    Normalised representation of a single counterfeit/suspicious detection
    produced by Layer 1 and consumed by Layer 2.
    """
    # Core identification
    query_name: str
    product_id: str                 # Matched product ID or "UNKNOWN"
    best_candidate_id: str

    # Layer 1 outcome
    layer1_status: str              # VerificationStatus.value
    final_decision: str             # "AUTHENTIC", "COUNTERFEIT / UNKNOWN", etc.
    physical_decision: str
    digital_decision: str
    confidence: str                 # ConfidenceLevel.value

    # Layer 1 scores — used for visual fingerprinting & duplicate detection
    similarity: float               # [0, 1]
    threshold: float                # [0, 1]
    roi_quality: float              # [0, 1]
    ransac_inlier_ratio: float      # derived from best candidate features
    lbp_similarity: float
    glcm_similarity: float
    reprojection_error: float
    normalized_match_count: float

    # Identity
    image_hash: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    # Extra metadata
    extra: Dict[str, Any] = field(default_factory=dict)

    def is_counterfeit_or_suspicious(self) -> bool:
        """Return True if Layer 2 should create an incident for this event."""
        final = self.final_decision.upper()
        return "COUNTERFEIT" in final or self.layer1_status in (
            "SUSPICIOUS", "NOT_VERIFIED"
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def build_detection_event(verification_result) -> DetectionEvent:
    """
    Build a DetectionEvent from a VerificationResult (Layer 1 output).

    Uses to_dict() so we remain decoupled from internal Layer 1 dataclass.
    """
    import hashlib

    d = verification_result.to_dict()

    # Best candidate features from candidate_rankings
    best = None
    if (
        hasattr(verification_result, "candidate_rankings")
        and verification_result.candidate_rankings
    ):
        best = verification_result.candidate_rankings[0]

    ransac_inlier_ratio = 0.0
    lbp_sim = 0.0
    glcm_sim = 0.0
    reproj_err = 100.0
    norm_matches = 0.0

    if best is not None:
        feat = best.feature_dict if hasattr(best, "feature_dict") else {}
        ransac_inlier_ratio = float(feat.get("ransac_inlier_ratio", 0.0))
        lbp_sim = float(feat.get("lbp_similarity", best.lbp_similarity if hasattr(best, "lbp_similarity") else 0.0))
        glcm_sim = float(feat.get("glcm_similarity", best.glcm_similarity if hasattr(best, "glcm_similarity") else 0.0))
        reproj_err = float(feat.get("reprojection_error", best.reprojection_error if hasattr(best, "reprojection_error") else 100.0))
        norm_matches = float(feat.get("normalized_match_count", 0.0))

    # Stable image hash — use query_name + timestamp as a proxy when image bytes
    # are not available at this stage
    image_hash = hashlib.sha256(
        (d.get("query_image", "") + d.get("timestamp", "")).encode()
    ).hexdigest()[:32]

    return DetectionEvent(
        query_name=d.get("query_image", ""),
        product_id=d.get("product_id", "UNKNOWN"),
        best_candidate_id=d.get("best_candidate", "NONE"),
        layer1_status=d.get("status", ""),
        final_decision=d.get("final_decision", ""),
        physical_decision=d.get("physical_decision", ""),
        digital_decision=d.get("digital_decision", ""),
        confidence=d.get("confidence", "LOW"),
        similarity=float(d.get("similarity", 0.0)),
        threshold=float(d.get("threshold", 0.85)),
        roi_quality=float(d.get("roi_quality", 0.0)),
        ransac_inlier_ratio=ransac_inlier_ratio,
        lbp_similarity=lbp_sim,
        glcm_similarity=glcm_sim,
        reprojection_error=reproj_err,
        normalized_match_count=norm_matches,
        image_hash=image_hash,
        timestamp=d.get("timestamp", datetime.now().isoformat()),
        extra={
            "model_version": d.get("model_version", ""),
            "feature_version": d.get("feature_version", ""),
            "processing_time_seconds": d.get("processing_time_seconds", 0.0),
            "total_candidates_searched": d.get("total_candidates_searched", 0),
        },
    )
