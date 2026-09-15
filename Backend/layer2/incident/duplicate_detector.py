"""
Kalakriti Layer 2 — Duplicate Detector.

Uses multiple signals to detect whether a new counterfeit detection is
related to an existing incident. Duplicates are NOT deleted — they are
linked via duplicate_group_id and related_incident_ids.

Signals:
  1. Exact image hash match
  2. Same product ID + close timestamp
  3. Visual feature vector cosine similarity
  4. Geographic proximity (if both have coordinates)
"""

from __future__ import annotations

import logging
import math
from typing import Dict, List, Optional, Tuple

import numpy as np

from layer2.incident.incident_manager import Incident, IncidentManager
from layer2.adapter import DetectionEvent

logger = logging.getLogger(__name__)


def _feature_vector(inc: Incident) -> np.ndarray:
    """Build a normalised feature vector from incident Layer 1 scores."""
    return np.array([
        inc.ransac_inlier_ratio,
        inc.lbp_similarity,
        inc.glcm_similarity,
        max(0.0, 1.0 - min(inc.reprojection_error, 20.0) / 20.0),
        inc.normalized_match_count,
        inc.roi_quality,
    ], dtype=np.float32)


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-9 or norm_b < 1e-9:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _parse_dt(ts: str) -> Optional[float]:
    """Return POSIX timestamp or None."""
    try:
        from datetime import datetime
        return datetime.fromisoformat(ts).timestamp()
    except Exception:
        return None


class DuplicateDetector:
    """
    Detects duplicate/related incidents for a new detection event.

    Configuration keys (from config['layer2']['duplicate_detection']):
        image_hash_exact: True
        feature_similarity_threshold: 0.95   (cosine, [0..1])
        timestamp_window_hours: 1.0          (same product)
        geo_proximity_km: 0.5                (optional geo signal)
    """

    def __init__(self, config: dict):
        cfg = config.get("layer2", {}).get("duplicate_detection", {})
        self.feature_threshold: float = cfg.get("feature_similarity_threshold", 0.95)
        self.timestamp_window_hours: float = cfg.get("timestamp_window_hours", 1.0)
        self.geo_proximity_km: float = cfg.get("geo_proximity_km", 0.5)

    def find_related(
        self,
        event: DetectionEvent,
        existing_incidents: List[Incident],
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Check whether the new event matches an existing incident.

        Returns:
            (duplicate_group_id, related_incident_id) or (None, None)
        """
        event_vec = np.array([
            event.ransac_inlier_ratio,
            event.lbp_similarity,
            event.glcm_similarity,
            max(0.0, 1.0 - min(event.reprojection_error, 20.0) / 20.0),
            event.normalized_match_count,
            event.roi_quality,
        ], dtype=np.float32)

        event_ts = _parse_dt(event.timestamp)
        event_lat = event_lon = None
        # (location not available at detection-event level; checked separately)

        best_related: Optional[str] = None
        best_group: Optional[str] = None
        best_score = 0.0

        for inc in existing_incidents:
            score = 0.0
            reasons = []

            # Signal 1: exact image hash
            if event.image_hash and inc.image_hash and event.image_hash == inc.image_hash:
                score += 1.0
                reasons.append("exact_image_hash")

            # Signal 2: same product + close timestamp
            if event.product_id not in ("UNKNOWN", "") and inc.product_id == event.product_id:
                inc_ts = _parse_dt(inc.timestamp)
                if event_ts and inc_ts:
                    diff_hours = abs(event_ts - inc_ts) / 3600.0
                    if diff_hours <= self.timestamp_window_hours:
                        score += 0.5
                        reasons.append("same_product_close_time")

            # Signal 3: visual feature similarity
            inc_vec = _feature_vector(inc)
            feat_sim = _cosine_similarity(event_vec, inc_vec)
            if feat_sim >= self.feature_threshold:
                score += feat_sim
                reasons.append(f"feature_sim={feat_sim:.3f}")

            if score > best_score:
                best_score = score
                best_related = inc.incident_id
                best_group = inc.duplicate_group_id or inc.incident_id

        # Threshold: needs at least one strong signal
        if best_score >= 0.9:
            logger.info(
                f"Duplicate detected: new event → incident {best_related} "
                f"(score={best_score:.3f})"
            )
            return best_group, best_related

        return None, None
