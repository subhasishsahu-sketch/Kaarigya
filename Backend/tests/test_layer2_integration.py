"""
Integration tests for Layer 1 -> Layer 2 Counterfeit Intelligence Pipeline.
"""

import os
import shutil
import tempfile
import pytest

from src.utils import VerificationStatus, ConfidenceLevel
from src.verification import VerificationResult
from layer2.pipeline import run_layer2


@pytest.fixture
def tmp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def config(tmp_dir):
    return {
        "layer2": {
            "storage_dir": os.path.join(tmp_dir, "layer2_data"),
            "duplicate_detection": {
                "image_hash_exact": True,
                "feature_similarity_threshold": 0.95,
                "timestamp_window_hours": 1.0,
            },
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
            "alerts": {
                "cooldown_hours": 24.0,
                "high_risk_score_threshold": 61,
            },
        }
    }


class TestPipelineIntegration:

    def test_full_pipeline_run_on_counterfeit_result(self, config, tmp_dir):
        # Create a mock VerificationResult where final_decision is counterfeit
        result = VerificationResult(
            query_name="suspect_query_image.jpg",
            status=VerificationStatus.NOT_VERIFIED,
            decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            final_decision="COUNTERFEIT / UNKNOWN",
            confidence=ConfidenceLevel.LOW,
            matched_product_id="UNKNOWN",
            best_candidate_id="NONE",
            similarity=0.45,
            threshold=0.85,
            roi_quality=0.78,
            timestamp="2026-08-28T20:00:00",
        )

        # Run non-interactively with a simulated location
        report = run_layer2(
            verification_result=result,
            config=config,
            project_root=tmp_dir,
            interactive=False,
            output_json=True,
            latitude=28.6139,
            longitude=77.2090,
            city="New Delhi",
            country="India",
        )

        assert report is not None
        assert report["summary"]["total_incidents"] == 1
        assert report["new_incident"]["incident_id"].startswith("CF-")
        assert report["new_incident"]["location_source"] == "USER_MANUAL"

        # Verify incident is written to disk
        l2_storage = os.path.join(tmp_dir, config["layer2"]["storage_dir"])
        inc_dir = os.path.join(l2_storage, "incidents")
        files = os.listdir(inc_dir)
        assert len(files) == 1
        assert files[0].endswith(".json")
