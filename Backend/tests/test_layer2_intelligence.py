"""
Tests for Layer 2 — Clustering & Intelligence.
Covers: visual pattern clustering (DBSCAN), geographic clustering (DBSCAN),
risk scoring, and trend/time-series updates.
"""

import os
import shutil
import tempfile
import pytest

from layer2.incident.incident_manager import Incident
from layer2.intelligence.visual_clustering import VisualClusterer
from layer2.intelligence.geographic_clustering import GeoClusterer
from layer2.intelligence.risk_scoring import RiskScorer
from layer2.intelligence.trend_analysis import TrendAnalyser


@pytest.fixture
def tmp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def config():
    return {
        "layer2": {
            "visual_clustering": {"eps": 0.25, "min_samples": 2},
            "geo_clustering": {"eps_km": 50.0, "min_samples": 2},
            "heatmap": {"cell_size_degrees": 1.0},
            "trend_analysis": {
                "moving_average_window": 7,
                "spike_multiplier": 2.0,
                "min_history_days": 2,
            },
            "risk_scoring": {
                "weights": {
                    "detection_volume": 0.3,
                    "recent_activity": 0.25,
                    "growth_rate": 0.2,
                    "pattern_density": 0.15,
                    "geo_density": 0.1,
                }
            },
        }
    }


@pytest.fixture
def sample_incidents():
    # 2 close incidents in Delhi (Pattern A), 2 close incidents in Mumbai (Pattern B)
    return [
        Incident(
            incident_id="CF-001",
            product_id="P001",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.4,
            final_decision="COUNTERFEIT",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-08-25T10:00:00",
            image_hash="h1",
            ransac_inlier_ratio=0.3,
            lbp_similarity=0.6,
            glcm_similarity=0.5,
            reprojection_error=8.0,
            normalized_match_count=0.1,
            roi_quality=0.7,
            location={"latitude": 28.6139, "longitude": 77.2090},  # Delhi
            location_source="USER_GPS",
        ),
        Incident(
            incident_id="CF-002",
            product_id="P001",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.41,
            final_decision="COUNTERFEIT",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-08-26T11:00:00",
            image_hash="h2",
            ransac_inlier_ratio=0.31,
            lbp_similarity=0.61,
            glcm_similarity=0.51,
            reprojection_error=7.9,
            normalized_match_count=0.11,
            roi_quality=0.71,
            location={"latitude": 28.6200, "longitude": 77.2150},  # Delhi close
            location_source="USER_GPS",
        ),
        Incident(
            incident_id="CF-003",
            product_id="P002",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.2,
            final_decision="COUNTERFEIT",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-08-27T12:00:00",
            image_hash="h3",
            ransac_inlier_ratio=0.05,
            lbp_similarity=0.2,
            glcm_similarity=0.15,
            reprojection_error=18.0,
            normalized_match_count=0.01,
            roi_quality=0.5,
            location={"latitude": 19.0760, "longitude": 72.8777},  # Mumbai
            location_source="USER_GPS",
        ),
        Incident(
            incident_id="CF-004",
            product_id="P002",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.21,
            final_decision="COUNTERFEIT",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-08-28T14:00:00",
            image_hash="h4",
            ransac_inlier_ratio=0.06,
            lbp_similarity=0.21,
            glcm_similarity=0.16,
            reprojection_error=17.5,
            normalized_match_count=0.02,
            roi_quality=0.52,
            location={"latitude": 19.0820, "longitude": 72.8820},  # Mumbai close
            location_source="USER_GPS",
        ),
    ]


class TestClusteringAndIntelligence:

    def test_visual_clustering(self, tmp_dir, config, sample_incidents):
        vc = VisualClusterer(
            storage_path=os.path.join(tmp_dir, "visual_clusters.json"),
            config=config,
        )
        mapping = vc.cluster(sample_incidents)

        # CF-001 and CF-002 should share a pattern, CF-003 and CF-004 should share another pattern
        assert mapping["CF-001"] == mapping["CF-002"]
        assert mapping["CF-003"] == mapping["CF-004"]
        assert mapping["CF-001"] != mapping["CF-003"]

        patterns = vc.load_patterns()
        assert len(patterns) == 2

    def test_geographic_clustering(self, tmp_dir, config, sample_incidents):
        gc = GeoClusterer(
            storage_path=os.path.join(tmp_dir, "geo_clusters.json"),
            config=config,
        )
        mapping = gc.cluster(sample_incidents)

        assert mapping["CF-001"] == mapping["CF-002"]
        assert mapping["CF-003"] == mapping["CF-004"]
        assert mapping["CF-001"] != mapping["CF-003"]

        clusters = gc.load_clusters()
        assert len(clusters) == 2

    def test_trend_analysis(self, tmp_dir, config, sample_incidents):
        ta = TrendAnalyser(
            storage_path=os.path.join(tmp_dir, "trends.json"),
            config=config,
        )
        trends = ta.analyse(sample_incidents)

        assert trends["total_incidents"] == 4
        assert len(trends["daily"]) >= 4
        # Since timestamps are spread over 25, 26, 27, 28th
        assert "2026-08-28" in trends["daily"]

    def test_risk_scoring(self, tmp_dir, config, sample_incidents):
        # We need clusters and trend data first
        gc = GeoClusterer(
            storage_path=os.path.join(tmp_dir, "geo_clusters.json"),
            config=config,
        )
        gc.cluster(sample_incidents)
        clusters = gc.load_clusters()

        ta = TrendAnalyser(
            storage_path=os.path.join(tmp_dir, "trends.json"),
            config=config,
        )
        trends = ta.analyse(sample_incidents)

        rs = RiskScorer(
            storage_path=os.path.join(tmp_dir, "risk_scores.json"),
            config=config,
        )
        scores = rs.score_clusters(clusters, trends)

        assert len(scores) == 2
        for score_rec in scores:
            assert "risk_score" in score_rec
            assert "risk_level" in score_rec
            assert score_rec["risk_score"] >= 0.0
