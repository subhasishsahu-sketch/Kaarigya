"""
Kalakriti Layer 2 — Geographic Risk Scoring.

Scores geographic clusters / areas based on counterfeit activity.
The score (0–100) represents detection activity risk, NOT an accusation
against any individual, business, or location.

Score interpretation (configurable):
    0–20    LOW
    21–40   MODERATE
    41–60   ELEVATED
    61–80   HIGH
    81–100  CRITICAL

Config keys (config['layer2']['risk_scoring']):
    weights:
        detection_volume: 0.30
        recent_activity: 0.25
        growth_rate: 0.20
        pattern_density: 0.15
        geo_density: 0.10
    thresholds:
        low: 20
        moderate: 40
        elevated: 60
        high: 80
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from layer2.incident.incident_manager import Incident

logger = logging.getLogger(__name__)


RISK_LEVELS = [
    (20, "LOW"),
    (40, "MODERATE"),
    (60, "ELEVATED"),
    (80, "HIGH"),
    (101, "CRITICAL"),
]


def _classify_risk(score: float, thresholds: Optional[Dict] = None) -> str:
    if thresholds:
        # User-configured
        levels = [
            (thresholds.get("low", 20), "LOW"),
            (thresholds.get("moderate", 40), "MODERATE"),
            (thresholds.get("elevated", 60), "ELEVATED"),
            (thresholds.get("high", 80), "HIGH"),
            (101, "CRITICAL"),
        ]
    else:
        levels = RISK_LEVELS
    for boundary, label in levels:
        if score <= boundary:
            return label
    return "CRITICAL"


class RiskScorer:
    """
    Computes 0–100 geographic risk score for each geographic cluster
    based on counterfeit activity metrics.
    """

    def __init__(self, storage_path: str, config: dict):
        self.storage_path = storage_path
        cfg = config.get("layer2", {}).get("risk_scoring", {})
        weights = cfg.get("weights", {})
        self.w_volume: float = weights.get("detection_volume", 0.30)
        self.w_recent: float = weights.get("recent_activity", 0.25)
        self.w_growth: float = weights.get("growth_rate", 0.20)
        self.w_pattern: float = weights.get("pattern_density", 0.15)
        self.w_geo: float = weights.get("geo_density", 0.10)
        self.thresholds = cfg.get("thresholds", None)

    def score_clusters(
        self,
        geo_clusters: List[Dict[str, Any]],
        trend_data: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Score each geographic cluster.

        Args:
            geo_clusters: Output from GeoClusterer.load_clusters()
            trend_data:   Output from TrendAnalyser.load()

        Returns:
            List of cluster risk records with risk_score and risk_level.
        """
        if not geo_clusters:
            return []

        max_count = max(c.get("detection_count", 1) for c in geo_clusters) or 1
        growth_rate = trend_data.get("growth_rate_pct", 0.0) / 100.0  # normalise

        results = []
        for cluster in geo_clusters:
            cid = cluster.get("cluster_id", "")
            count = cluster.get("detection_count", 0)
            unique_patterns = len(cluster.get("unique_patterns", []))

            # Normalised component scores [0, 1]
            vol_score = min(1.0, count / max_count)

            # Recent activity: last 7 days vs cluster total
            recent = cluster.get("recent_activity", "")
            rec_score = 0.5  # default medium if unknown

            # Growth rate (global trend as proxy since we lack per-cluster growth)
            grow_score = min(1.0, max(0.0, growth_rate))

            # Pattern density
            pat_score = min(1.0, unique_patterns / 5.0)

            # Geographic density — use count / max as proxy
            geo_score = vol_score

            raw = (
                self.w_volume * vol_score
                + self.w_recent * rec_score
                + self.w_growth * grow_score
                + self.w_pattern * pat_score
                + self.w_geo * geo_score
            )
            risk_score = round(raw * 100.0, 1)
            risk_level = _classify_risk(risk_score, self.thresholds)

            results.append({
                "cluster_id": cid,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "detection_count": count,
                "unique_patterns": unique_patterns,
                "centroid": cluster.get("centroid", {}),
                "first_seen": cluster.get("first_seen", ""),
                "last_seen": cluster.get("last_seen", ""),
                "incident_ids": cluster.get("incident_ids", []),
            })

        results.sort(key=lambda x: -x["risk_score"])
        self._save(results)
        logger.info(
            f"Risk scoring: {len(results)} cluster(s) scored"
        )
        return results

    def _save(self, results: List[Dict[str, Any]]):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, "w") as f:
            json.dump(
                {"updated_at": datetime.now().isoformat(), "risk_scores": results},
                f, indent=2,
            )

    def load(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.storage_path):
            return []
        try:
            with open(self.storage_path) as f:
                return json.load(f).get("risk_scores", [])
        except Exception:
            return []
