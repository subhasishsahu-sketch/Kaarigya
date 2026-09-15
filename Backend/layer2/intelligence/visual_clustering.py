"""
Kalakriti Layer 2 — Visual Counterfeit Pattern Clustering.

Uses DBSCAN on Layer 1 feature vectors extracted from incidents to discover
visually/technically related counterfeit detections (PATTERN-001, PATTERN-002, …).

A pattern cluster means "these detections have similar authentication
characteristics." It does NOT imply a common manufacturer or source.

Config keys (config['layer2']['visual_clustering']):
    eps: 0.25           DBSCAN epsilon (cosine distance space)
    min_samples: 2      minimum cluster size
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional

import numpy as np

from layer2.incident.incident_manager import Incident

logger = logging.getLogger(__name__)


# =============================================================================
# Pattern data class
# =============================================================================

@dataclass
class CounterfeitPattern:
    pattern_id: str
    incident_ids: List[str]
    detection_count: int
    first_seen: str
    last_seen: str
    centroid_features: Dict[str, float]   # mean of feature vector components


# =============================================================================
# Clustering engine
# =============================================================================

class VisualClusterer:
    """
    Clusters incidents by their Layer 1 visual/authentication feature vectors
    using DBSCAN in a cosine-distance-aware space.
    """

    def __init__(self, storage_path: str, config: dict):
        self.storage_path = storage_path
        cfg = config.get("layer2", {}).get("visual_clustering", {})
        self.eps: float = cfg.get("eps", 0.25)
        self.min_samples: int = int(cfg.get("min_samples", 2))

    def _feature_matrix(self, incidents: List[Incident]) -> np.ndarray:
        """Build (N, 6) feature matrix from incidents."""
        rows = []
        for inc in incidents:
            rows.append([
                inc.ransac_inlier_ratio,
                inc.lbp_similarity,
                inc.glcm_similarity,
                max(0.0, 1.0 - min(inc.reprojection_error, 20.0) / 20.0),
                inc.normalized_match_count,
                inc.roi_quality,
            ])
        return np.array(rows, dtype=np.float32)

    def _l2_normalise(self, X: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(X, axis=1, keepdims=True)
        norms = np.where(norms < 1e-9, 1.0, norms)
        return X / norms

    def cluster(self, incidents: List[Incident]) -> Dict[str, str]:
        """
        Cluster incidents by visual features.

        Returns:
            mapping of incident_id → pattern_id (e.g. "PATTERN-001")
            Noise points get pattern_id = "NOISE"
        """
        if len(incidents) < self.min_samples:
            logger.info(
                f"Visual clustering skipped: only {len(incidents)} incident(s), "
                f"need >= {self.min_samples}"
            )
            return {}

        X = self._feature_matrix(incidents)
        X_norm = self._l2_normalise(X)

        try:
            from sklearn.cluster import DBSCAN
            db = DBSCAN(
                eps=self.eps,
                min_samples=self.min_samples,
                metric="euclidean",   # operating on L2-normalised vectors → cosine-like
            )
            labels = db.fit_predict(X_norm)
        except ImportError:
            logger.warning("scikit-learn not available; skipping visual clustering")
            return {}
        except Exception as e:
            logger.warning(f"Visual clustering failed: {e}")
            return {}

        id_to_pattern: Dict[str, str] = {}
        for inc, label in zip(incidents, labels):
            if label < 0:
                id_to_pattern[inc.incident_id] = "NOISE"
            else:
                id_to_pattern[inc.incident_id] = f"PATTERN-{label + 1:03d}"

        self._save_patterns(incidents, id_to_pattern)
        logger.info(
            f"Visual clustering: {len(set(l for l in labels if l >= 0))} pattern(s) "
            f"from {len(incidents)} incident(s)"
        )
        return id_to_pattern

    def _save_patterns(
        self,
        incidents: List[Incident],
        id_to_pattern: Dict[str, str],
    ):
        """Persist cluster summary."""
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)

        # Group incidents by pattern
        groups: Dict[str, List[Incident]] = {}
        for inc in incidents:
            pid = id_to_pattern.get(inc.incident_id, "NOISE")
            groups.setdefault(pid, []).append(inc)

        patterns = []
        for pid, incs in sorted(groups.items()):
            if pid == "NOISE":
                continue
            vec = self._l2_normalise(self._feature_matrix(incs))
            centroid = vec.mean(axis=0)
            keys = [
                "ransac_inlier_ratio", "lbp_similarity", "glcm_similarity",
                "reproj_score", "norm_matches", "roi_quality"
            ]
            centroid_dict = {k: round(float(v), 4) for k, v in zip(keys, centroid)}
            times = sorted(inc.timestamp for inc in incs)
            patterns.append({
                "pattern_id": pid,
                "incident_ids": [inc.incident_id for inc in incs],
                "detection_count": len(incs),
                "first_seen": times[0],
                "last_seen": times[-1],
                "centroid_features": centroid_dict,
            })

        with open(self.storage_path, "w") as f:
            json.dump(
                {"updated_at": datetime.now().isoformat(), "patterns": patterns},
                f, indent=2,
            )

    def load_patterns(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.storage_path):
            return []
        try:
            with open(self.storage_path) as f:
                return json.load(f).get("patterns", [])
        except Exception:
            return []
