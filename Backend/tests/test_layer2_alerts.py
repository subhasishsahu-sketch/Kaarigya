"""
Tests for Layer 2 — Alert Engine.
Covers: alert engine evaluation, alert suppression / cooldowns.
"""

import os
import shutil
import tempfile
import pytest

from layer2.alerts.alert_engine import AlertEngine


@pytest.fixture
def tmp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def config():
    return {
        "layer2": {
            "alerts": {
                "cooldown_hours": 24.0,
                "high_risk_score_threshold": 61,
                "pattern_repeat_threshold": 3,
                "pattern_spread_cluster_threshold": 2,
                "density_count_threshold": 5,
                "growth_rate_threshold_pct": 50.0,
            }
        }
    }


class TestAlertEngine:

    def test_alert_not_triggered_when_normal(self, tmp_dir, config):
        ae = AlertEngine(
            storage_path=os.path.join(tmp_dir, "alerts.json"),
            config=config,
        )

        trend_data = {
            "spike_detected": False,
            "growth_rate_pct": 10.0,
            "hourly": {"2026-08-28T12": 1},
        }
        risk_scores = [{"cluster_id": "GEO-CLUSTER-001", "risk_score": 10.0, "risk_level": "LOW"}]
        patterns = [{"pattern_id": "PATTERN-001", "detection_count": 1}]
        geo_clusters = [{"cluster_id": "GEO-CLUSTER-001", "unique_patterns": ["PATTERN-001"]}]

        new_alerts = ae.evaluate(trend_data, risk_scores, patterns, geo_clusters, config)
        assert len(new_alerts) == 0

    def test_alerts_triggered_by_rules(self, tmp_dir, config):
        ae = AlertEngine(
            storage_path=os.path.join(tmp_dir, "alerts.json"),
            config=config,
        )

        # Trigger Rule A (spike), Rule B (high-risk cluster), Rule C (repeated pattern)
        trend_data = {
            "spike_detected": True,
            "spike_day": "2026-08-28",
            "growth_rate_pct": 200.0,
            "hourly": {"2026-08-28T12": 1},
        }
        risk_scores = [{"cluster_id": "GEO-CLUSTER-001", "risk_score": 85.0, "risk_level": "CRITICAL"}]
        patterns = [{"pattern_id": "PATTERN-001", "detection_count": 5}]
        geo_clusters = [{"cluster_id": "GEO-CLUSTER-001", "unique_patterns": ["PATTERN-001"]}]

        new_alerts = ae.evaluate(trend_data, risk_scores, patterns, geo_clusters, config)
        assert len(new_alerts) == 3

        types = {a["alert_type"] for a in new_alerts}
        assert "RULE_A" in types
        assert "RULE_B" in types
        assert "RULE_C" in types

    def test_alert_suppression_due_to_cooldown(self, tmp_dir, config):
        ae = AlertEngine(
            storage_path=os.path.join(tmp_dir, "alerts.json"),
            config=config,
        )

        trend_data = {
            "spike_detected": True,
            "spike_day": "2026-08-28",
            "growth_rate_pct": 200.0,
            "hourly": {"2026-08-28T12": 1},
        }

        # First evaluation generates Rule A alert
        first_round = ae.evaluate(trend_data, [], [], [], config)
        assert len(first_round) == 1
        assert first_round[0]["alert_type"] == "RULE_A"

        # Second evaluation with same trigger should skip Rule A alert due to cooldown
        second_round = ae.evaluate(trend_data, [], [], [], config)
        assert len(second_round) == 0
