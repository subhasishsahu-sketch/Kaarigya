"""
Kalakriti Layer 2 — Alert Engine.

Evaluates all alert rules whenever new intelligence data is processed.
Implements alert deduplication and cooldown to prevent endless duplicate alerts.

Config keys (config['layer2']['alerts']):
    cooldown_hours: 24      (suppress duplicate alert of same type within window)

Alert record structure:
    alert_id        UUID-based
    alert_type      A–F
    severity        LOW | MEDIUM | HIGH | CRITICAL
    timestamp       ISO
    related_incidents
    related_pattern
    geographic_cluster
    explanation
    status          ACTIVE | ACKNOWLEDGED | RESOLVED
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from layer2.alerts.alert_rules import (
    rule_A_activity_spike,
    rule_B_high_risk_cluster,
    rule_C_repeated_pattern,
    rule_D_pattern_spread,
    rule_E_high_density_window,
    rule_F_rapid_growth,
)

logger = logging.getLogger(__name__)

SEVERITY_MAP = {
    "A": "HIGH",
    "B": "CRITICAL",
    "C": "MEDIUM",
    "D": "HIGH",
    "E": "MEDIUM",
    "F": "HIGH",
}

ALERT_STATUSES = {"ACTIVE", "ACKNOWLEDGED", "RESOLVED"}


class AlertEngine:
    """
    Evaluates alert rules and manages alert persistence with cooldown deduplication.
    """

    def __init__(self, storage_path: str, config: dict):
        self.storage_path = storage_path
        cfg = config.get("layer2", {}).get("alerts", {})
        self.cooldown_hours: float = float(cfg.get("cooldown_hours", 24.0))
        os.makedirs(os.path.dirname(storage_path), exist_ok=True)

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def evaluate(
        self,
        trend_data: Dict[str, Any],
        risk_scores: List[Dict[str, Any]],
        patterns: List[Dict[str, Any]],
        geo_clusters: List[Dict[str, Any]],
        config: dict,
    ) -> List[Dict[str, Any]]:
        """
        Run all 6 alert rules. Persist new alerts (skipping duplicates within cooldown).

        Returns:
            List of newly generated alert records.
        """
        existing = self._load_all()
        new_alerts = []

        rules = [
            ("A", rule_A_activity_spike(trend_data, config)),
            ("B", rule_B_high_risk_cluster(risk_scores, config)),
            ("C", rule_C_repeated_pattern(patterns, config)),
            ("D", rule_D_pattern_spread(patterns, geo_clusters, config)),
            ("E", rule_E_high_density_window(trend_data, config)),
            ("F", rule_F_rapid_growth(trend_data, config)),
        ]

        for rule_id, (triggered, explanation) in rules:
            if not triggered:
                continue

            if self._in_cooldown(rule_id, existing):
                logger.debug(f"Alert rule {rule_id} is in cooldown window; skipping.")
                continue

            alert = self._create_alert(rule_id, explanation)
            new_alerts.append(alert)
            logger.info(
                f"Alert generated: [{alert['severity']}] Rule {rule_id} — {explanation[:80]}"
            )

        if new_alerts:
            all_alerts = existing + new_alerts
            self._save(all_alerts)

        return new_alerts

    def load_active(self) -> List[Dict[str, Any]]:
        """Return all ACTIVE alerts, newest first."""
        return sorted(
            [a for a in self._load_all() if a.get("status") == "ACTIVE"],
            key=lambda x: x.get("timestamp", ""),
            reverse=True,
        )

    def load_all(self) -> List[Dict[str, Any]]:
        """Return all alerts, newest first."""
        return sorted(
            self._load_all(),
            key=lambda x: x.get("timestamp", ""),
            reverse=True,
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _create_alert(self, rule_id: str, explanation: str) -> Dict[str, Any]:
        return {
            "alert_id": f"ALERT-{rule_id}-{uuid.uuid4().hex[:8].upper()}",
            "alert_type": f"RULE_{rule_id}",
            "severity": SEVERITY_MAP.get(rule_id, "MEDIUM"),
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "explanation": explanation,
            "status": "ACTIVE",
            "rule_id": rule_id,
        }

    def _in_cooldown(self, rule_id: str, existing: List[Dict]) -> bool:
        """Return True if an alert of this rule_id was generated within the cooldown window."""
        cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=self.cooldown_hours)
        for alert in existing:
            if alert.get("rule_id") != rule_id:
                continue
            try:
                ts = datetime.fromisoformat(alert["timestamp"])
                # Ensure timezone-aware comparison
                if ts.tzinfo is None:
                    from datetime import timezone as _tz
                    ts = ts.replace(tzinfo=_tz.utc)
                if ts >= cutoff:
                    return True
            except Exception:
                pass
        return False

    def _load_all(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.storage_path):
            return []
        try:
            with open(self.storage_path) as f:
                return json.load(f).get("alerts", [])
        except Exception:
            return []

    def _save(self, alerts: List[Dict[str, Any]]):
        with open(self.storage_path, "w") as f:
            json.dump(
                {"updated_at": datetime.now().isoformat(), "alerts": alerts},
                f, indent=2,
            )
