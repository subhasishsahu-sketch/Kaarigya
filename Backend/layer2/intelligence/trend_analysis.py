"""
Kalakriti Layer 2 — Time-Series & Trend Analysis.

Aggregates counterfeit incidents over time at multiple granularities
(hourly, daily, weekly, monthly). Detects:
  - moving average
  - growth rate vs historical baseline
  - sudden spikes

All thresholds are configurable — no hard-coded magic numbers.

Config keys (config['layer2']['trend_analysis']):
    moving_average_window: 7      (days)
    spike_multiplier: 2.5         (current count > N × baseline → spike)
    min_history_days: 3           (days before spike detection activates)
"""

from __future__ import annotations

import json
import logging
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from layer2.incident.incident_manager import Incident

logger = logging.getLogger(__name__)


def _day_key(ts: str) -> str:
    try:
        return datetime.fromisoformat(ts).strftime("%Y-%m-%d")
    except Exception:
        return "UNKNOWN"


def _week_key(ts: str) -> str:
    try:
        dt = datetime.fromisoformat(ts)
        iso = dt.isocalendar()
        return f"{iso[0]}-W{iso[1]:02d}"
    except Exception:
        return "UNKNOWN"


def _month_key(ts: str) -> str:
    try:
        return datetime.fromisoformat(ts).strftime("%Y-%m")
    except Exception:
        return "UNKNOWN"


def _hour_key(ts: str) -> str:
    try:
        return datetime.fromisoformat(ts).strftime("%Y-%m-%dT%H")
    except Exception:
        return "UNKNOWN"


class TrendAnalyser:
    """
    Time-series aggregation and trend detection for counterfeit incidents.
    """

    def __init__(self, storage_path: str, config: dict):
        self.storage_path = storage_path
        cfg = config.get("layer2", {}).get("trend_analysis", {})
        self.ma_window: int = int(cfg.get("moving_average_window", 7))
        self.spike_multiplier: float = float(cfg.get("spike_multiplier", 2.5))
        self.min_history_days: int = int(cfg.get("min_history_days", 3))

    def analyse(self, incidents: List[Incident]) -> Dict[str, Any]:
        """
        Compute time-series aggregations and spike detection.

        Returns:
            A rich trend summary dict.
        """
        hourly: Dict[str, int] = defaultdict(int)
        daily: Dict[str, int] = defaultdict(int)
        weekly: Dict[str, int] = defaultdict(int)
        monthly: Dict[str, int] = defaultdict(int)

        for inc in incidents:
            ts = inc.timestamp
            hourly[_hour_key(ts)] += 1
            daily[_day_key(ts)] += 1
            weekly[_week_key(ts)] += 1
            monthly[_month_key(ts)] += 1

        # Sort daily series
        daily_series = [
            {"date": k, "count": v}
            for k, v in sorted(daily.items())
        ]

        # Moving average (last N days)
        ma = self._moving_average(daily_series, self.ma_window)

        # Growth rate (last 7 days vs previous 7 days)
        growth_rate, recent_count, baseline_count = self._growth_rate(daily_series, window=7)

        # Spike detection
        spike_detected = False
        spike_day = None
        if len(daily_series) >= self.min_history_days:
            hist_mean = (
                sum(d["count"] for d in daily_series[:-1]) / max(1, len(daily_series) - 1)
            )
            last = daily_series[-1]["count"] if daily_series else 0
            if hist_mean > 0 and last >= self.spike_multiplier * hist_mean:
                spike_detected = True
                spike_day = daily_series[-1]["date"] if daily_series else None

        result = {
            "updated_at": datetime.now().isoformat(),
            "total_incidents": len(incidents),
            "hourly": dict(sorted(hourly.items())),
            "daily": {d["date"]: d["count"] for d in daily_series},
            "weekly": dict(sorted(weekly.items())),
            "monthly": dict(sorted(monthly.items())),
            "moving_average": ma,
            "moving_average_window_days": self.ma_window,
            "recent_count": recent_count,
            "baseline_count": baseline_count,
            "growth_rate_pct": round(growth_rate * 100, 2),
            "spike_detected": spike_detected,
            "spike_day": spike_day,
            "spike_multiplier_threshold": self.spike_multiplier,
        }

        self._save(result)
        logger.info(
            f"Trend analysis: {len(incidents)} incident(s), "
            f"growth_rate={growth_rate * 100:.1f}%, spike={spike_detected}"
        )
        return result

    def _moving_average(
        self,
        daily_series: List[Dict],
        window: int,
    ) -> Dict[str, float]:
        """Compute trailing moving average for each date."""
        ma: Dict[str, float] = {}
        counts = [d["count"] for d in daily_series]
        dates = [d["date"] for d in daily_series]
        for i, date in enumerate(dates):
            start = max(0, i - window + 1)
            window_vals = counts[start: i + 1]
            ma[date] = round(sum(window_vals) / len(window_vals), 2)
        return ma

    def _growth_rate(
        self,
        daily_series: List[Dict],
        window: int = 7,
    ):
        """
        Compare sum of last `window` days to prior `window` days.

        Returns (growth_rate, recent_count, baseline_count).
        growth_rate > 0 → increasing; < 0 → declining.
        """
        counts = [d["count"] for d in daily_series]
        recent_count = sum(counts[-window:]) if len(counts) >= 1 else 0
        baseline_count = sum(counts[-(2 * window):-window]) if len(counts) >= window + 1 else 0

        if baseline_count == 0:
            growth_rate = 0.0 if recent_count == 0 else 1.0
        else:
            growth_rate = (recent_count - baseline_count) / baseline_count

        return growth_rate, recent_count, baseline_count

    def _save(self, data: Dict[str, Any]):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self) -> Dict[str, Any]:
        if not os.path.exists(self.storage_path):
            return {}
        try:
            with open(self.storage_path) as f:
                return json.load(f)
        except Exception:
            return {}
