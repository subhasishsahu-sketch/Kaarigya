"""
Tests for Layer 2 — Duplicate Detector.
Covers: exact duplicate (image hash), similar duplicate (visual features),
timestamp proximity, and unrelated detections.
"""

import pytest
from datetime import datetime, timedelta

from layer2.incident.incident_manager import Incident
from layer2.incident.duplicate_detector import DuplicateDetector
from layer2.adapter import DetectionEvent


@pytest.fixture
def base_config():
    return {
        "layer2": {
            "duplicate_detection": {
                "image_hash_exact": True,
                "feature_similarity_threshold": 0.95,
                "timestamp_window_hours": 1.0,
            }
        }
    }


@pytest.fixture
def sample_incident():
    return Incident(
        incident_id="CF-2026-000001",
        product_id="P001",
        authentication_status="NOT_VERIFIED",
        authentication_score=0.40,
        final_decision="COUNTERFEIT / UNKNOWN",
        physical_decision="NOT_VERIFIED",
        digital_decision="N/A",
        confidence="LOW",
        timestamp="2026-08-28T12:00:00",
        image_hash="hash123",
        ransac_inlier_ratio=0.30,
        lbp_similarity=0.60,
        glcm_similarity=0.55,
        reprojection_error=8.0,
        normalized_match_count=0.15,
        roi_quality=0.75,
    )


class TestDuplicateDetector:

    def test_exact_image_hash_duplicate(self, base_config, sample_incident):
        detector = DuplicateDetector(base_config)
        event = DetectionEvent(
            query_name="test_query.jpg",
            product_id="P002",  # Different product ID, but same image hash
            best_candidate_id="NONE",
            layer1_status="NOT_VERIFIED",
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            similarity=0.40,
            threshold=0.85,
            roi_quality=0.75,
            ransac_inlier_ratio=0.30,
            lbp_similarity=0.60,
            glcm_similarity=0.55,
            reprojection_error=8.0,
            normalized_match_count=0.15,
            image_hash="hash123",  # Matches sample_incident
            timestamp="2026-08-28T12:05:00",
        )

        group, related = detector.find_related(event, [sample_incident])
        assert related == "CF-2026-000001"
        assert group == "CF-2026-000001"

    def test_similar_features_duplicate(self, base_config, sample_incident):
        detector = DuplicateDetector(base_config)
        # Event with identical/highly similar feature vectors but different hash
        event = DetectionEvent(
            query_name="test_query_2.jpg",
            product_id="P001",
            best_candidate_id="NONE",
            layer1_status="NOT_VERIFIED",
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            similarity=0.40,
            threshold=0.85,
            roi_quality=0.75,
            ransac_inlier_ratio=0.30,
            lbp_similarity=0.60,
            glcm_similarity=0.55,
            reprojection_error=8.0,
            normalized_match_count=0.15,
            image_hash="hash999",  # Different
            timestamp="2026-08-28T12:10:00",
        )

        group, related = detector.find_related(event, [sample_incident])
        assert related == "CF-2026-000001"

    def test_unrelated_detection(self, base_config, sample_incident):
        detector = DuplicateDetector(base_config)
        # Different features, different hash
        event = DetectionEvent(
            query_name="test_query_unrelated.jpg",
            product_id="P005",
            best_candidate_id="NONE",
            layer1_status="NOT_VERIFIED",
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            similarity=0.10,
            threshold=0.85,
            roi_quality=0.20,
            ransac_inlier_ratio=0.01,
            lbp_similarity=0.15,
            glcm_similarity=0.10,
            reprojection_error=18.0,
            normalized_match_count=0.01,
            image_hash="hash_diff",
            timestamp="2026-08-28T12:00:00",
        )

        group, related = detector.find_related(event, [sample_incident])
        assert related is None
        assert group is None
