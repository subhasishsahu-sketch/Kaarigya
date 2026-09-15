"""
Kalakriti Layer 2 — Alert Rules.

Defines the 6 configurable alert rule types (A–F) from the spec.
Each rule is a function that evaluates current intelligence state
and returns (triggered: bool, explanation: str).

Config keys (config['layer2']['alerts']):
    spike_window_hours: 24
    spike_count_threshold: 5
    high_risk_score_threshold: 61
    pattern_repeat_threshold: 3
    pattern_spread_cluster_threshold: 2
    density_window_hours: 1
    density_count_threshold: 5
    growth_rate_threshold_pct: 50.0
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple


def _alert_cfg(config: dict) -> dict:
    return config.get("layer2", {}).get("alerts", {})


# =============================================================================
# Rule A — Sudden Activity Spike
# =============================================================================

def rule_A_activity_spike(
    trend_data: Dict[str, Any],
    config: dict,
) -> Tuple[bool, str]:
    """
    Triggered when spike_detected flag is set in trend analysis.
    Configurable via: spike_multiplier in trend_analysis config.
    """
    if trend_data.get("spike_detected", False):
        day = trend_data.get("spike_day", "today")
        growth = trend_data.get("growth_rate_pct", 0.0)
        return True, (
            f"Sudden activity spike detected on {day}. "
            f"Growth rate: {growth:.1f}% vs baseline."
        )
    return False, ""


# =============================================================================
# Rule B — High-Risk Geographic Cluster
# =============================================================================

def rule_B_high_risk_cluster(
    risk_scores: List[Dict[str, Any]],
    config: dict,
) -> Tuple[bool, str]:
    """
    Triggered when any geographic cluster exceeds the configured risk score.
    """
    cfg = _alert_cfg(config)
    threshold = cfg.get("high_risk_score_threshold", 61)

    for cluster in risk_scores:
        score = cluster.get("risk_score", 0.0)
        if score >= threshold:
            cid = cluster.get("cluster_id", "")
            level = cluster.get("risk_level", "")
            return True, (
                f"Geographic cluster {cid} has reached risk level {level} "
                f"(score={score:.1f}). Counterfeit detection activity is elevated."
            )
    return False, ""


# =============================================================================
# Rule C — Repeated Counterfeit Pattern
# =============================================================================

def rule_C_repeated_pattern(
    patterns: List[Dict[str, Any]],
    config: dict,
) -> Tuple[bool, str]:
    """
    Triggered when any visual counterfeit pattern has repeated >= threshold times.
    """
    cfg = _alert_cfg(config)
    threshold = int(cfg.get("pattern_repeat_threshold", 3))

    for p in patterns:
        count = p.get("detection_count", 0)
        if count >= threshold:
            pid = p.get("pattern_id", "")
            return True, (
                f"Counterfeit pattern {pid} has been detected {count} time(s). "
                f"This pattern is recurring."
            )
    return False, ""


# =============================================================================
# Rule D — Pattern Geographic Spread
# =============================================================================

def rule_D_pattern_spread(
    patterns: List[Dict[str, Any]],
    geo_clusters: List[Dict[str, Any]],
    config: dict,
) -> Tuple[bool, str]:
    """
    Triggered when the same visual pattern appears in >= N geographic clusters.
    """
    cfg = _alert_cfg(config)
    threshold = int(cfg.get("pattern_spread_cluster_threshold", 2))

    # Build: pattern_id → set of cluster IDs
    from collections import defaultdict
    pattern_clusters: Dict[str, set] = defaultdict(set)

    for cluster in geo_clusters:
        cid = cluster.get("cluster_id", "")
        for pid in cluster.get("unique_patterns", []):
            if pid:
                pattern_clusters[pid].add(cid)

    for pid, cluster_set in pattern_clusters.items():
        if len(cluster_set) >= threshold:
            return True, (
                f"Counterfeit pattern {pid} has appeared in {len(cluster_set)} "
                f"geographic cluster(s): {', '.join(sorted(cluster_set))}. "
                f"The same pattern is spreading geographically."
            )
    return False, ""


# =============================================================================
# Rule E — High-Density Detection Window
# =============================================================================

def rule_E_high_density_window(
    trend_data: Dict[str, Any],
    config: dict,
) -> Tuple[bool, str]:
    """
    Triggered when an unusually high number of detections occurs within
    a short recent time period (based on hourly aggregation).
    """
    cfg = _alert_cfg(config)
    threshold = int(cfg.get("density_count_threshold", 5))

    hourly = trend_data.get("hourly", {})
    if not hourly:
        return False, ""

    recent_hours = sorted(hourly.keys())[-3:]  # last 3 hours
    for hour_key in recent_hours:
        count = hourly.get(hour_key, 0)
        if count >= threshold:
            return True, (
                f"High-density detection window: {count} counterfeit detection(s) "
                f"recorded in hour {hour_key}."
            )
    return False, ""


# =============================================================================
# Rule F — Rapid Growth vs Baseline
# =============================================================================

def rule_F_rapid_growth(
    trend_data: Dict[str, Any],
    config: dict,
) -> Tuple[bool, str]:
    """
    Triggered when recent growth rate significantly exceeds configured threshold.
    """
    cfg = _alert_cfg(config)
    threshold_pct = float(cfg.get("growth_rate_threshold_pct", 50.0))

    growth = trend_data.get("growth_rate_pct", 0.0)
    recent = trend_data.get("recent_count", 0)
    baseline = trend_data.get("baseline_count", 0)

    if baseline > 0 and growth >= threshold_pct:
        return True, (
            f"Rapid growth detected: counterfeit activity increased by {growth:.1f}% "
            f"(recent={recent}, baseline={baseline})."
        )
    return False, ""
