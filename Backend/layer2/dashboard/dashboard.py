"""
Kalakriti Layer 2 — Counterfeit Intelligence Dashboard.

Renders the full Layer 2 intelligence state to:
  - Human-readable terminal output
  - Structured JSON report (machine-readable)

All data displayed comes from real stored detection data.
No fake/placeholder data is ever shown.
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from layer2.incident.incident_manager import Incident, IncidentManager


# =============================================================================
# Terminal dashboard
# =============================================================================

def print_dashboard(
    incident_manager: IncidentManager,
    trend_data: Dict[str, Any],
    geo_clusters: List[Dict[str, Any]],
    patterns: List[Dict[str, Any]],
    risk_scores: List[Dict[str, Any]],
    active_alerts: List[Dict[str, Any]],
    new_incident: Optional[Incident] = None,
):
    """Print the full Layer 2 counterfeit intelligence dashboard to stdout."""

    all_incidents = incident_manager.list_incidents()
    total = len(all_incidents)
    recent_24h = _count_recent(all_incidents, hours=24)

    print(f"\n{'=' * 65}")
    print("   KALAKRITI — COUNTERFEIT INTELLIGENCE DASHBOARD")
    print(f"{'=' * 65}")
    print(f"   Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 65}\n")

    # ------------------------------------------------------------------
    # Summary Cards
    # ------------------------------------------------------------------
    print("  ┌─ SUMMARY ────────────────────────────────────────────────┐")
    print(f"  │  Total Counterfeit Detections : {total:<6}                   │")
    print(f"  │  Last 24h                     : {recent_24h:<6}                   │")
    print(f"  │  Active Geographic Hotspots   : {len(geo_clusters):<6}                   │")
    print(f"  │  Counterfeit Patterns Found   : {len(patterns):<6}                   │")
    print(f"  │  Active Alerts                : {len(active_alerts):<6}                   │")
    print("  └──────────────────────────────────────────────────────────┘\n")

    # ------------------------------------------------------------------
    # New Incident banner
    # ------------------------------------------------------------------
    if new_incident:
        print(f"  ⚠  NEW INCIDENT CREATED: {new_incident.incident_id}")
        print(f"     Product    : {new_incident.product_id}")
        print(f"     Decision   : {new_incident.final_decision}")
        loc = new_incident.location or {}
        if loc:
            loc_str = ", ".join(filter(None, [
                loc.get("city", ""), loc.get("state", ""), loc.get("country", "")
            ])) or f"({loc.get('latitude', '?')}, {loc.get('longitude', '?')})"
            approx = " [APPROXIMATE]" if loc.get("is_approximate") else ""
            print(f"     Location   : {loc_str}{approx} [{new_incident.location_source}]")
        print()

    # ------------------------------------------------------------------
    # Active Alerts
    # ------------------------------------------------------------------
    if active_alerts:
        print("  ─── ACTIVE ALERTS ─────────────────────────────────────────")
        for alert in active_alerts[:5]:
            sev = alert.get("severity", "?")
            atype = alert.get("alert_type", "?")
            ts = alert.get("timestamp", "")[:16]
            expl = alert.get("explanation", "")[:70]
            print(f"  [{sev:8s}] {atype} ({ts})")
            print(f"           {expl}")
        print()

    # ------------------------------------------------------------------
    # Trend Summary
    # ------------------------------------------------------------------
    if trend_data:
        print("  ─── TREND ANALYSIS ─────────────────────────────────────────")
        growth = trend_data.get("growth_rate_pct", 0.0)
        spike = trend_data.get("spike_detected", False)
        spike_day = trend_data.get("spike_day", "")
        ma_win = trend_data.get("moving_average_window_days", 7)
        print(f"  Growth Rate ({ma_win}d window) : {growth:+.1f}%")
        if spike:
            print(f"  ⚠  SPIKE DETECTED on {spike_day}")
        recent_daily = trend_data.get("daily", {})
        if recent_daily:
            last_days = sorted(recent_daily.items())[-7:]
            print(f"  Daily detections (last 7 days):")
            for day, cnt in last_days:
                bar = "█" * min(cnt, 20) + ("+" if cnt > 20 else "")
                print(f"    {day}: {bar} {cnt}")
        print()

    # ------------------------------------------------------------------
    # Geographic Risk Scores / Hotspots
    # ------------------------------------------------------------------
    if risk_scores:
        print("  ─── GEOGRAPHIC HOTSPOTS ────────────────────────────────────")
        for rs in risk_scores[:5]:
            cid = rs.get("cluster_id", "")
            score = rs.get("risk_score", 0.0)
            level = rs.get("risk_level", "")
            count = rs.get("detection_count", 0)
            centroid = rs.get("centroid", {})
            lat = centroid.get("latitude", "?")
            lon = centroid.get("longitude", "?")
            print(
                f"  {cid}  Risk={level}({score:.0f})  Detections={count}  "
                f"Centre=({lat}, {lon})"
            )
        print()

    # ------------------------------------------------------------------
    # Counterfeit Pattern Groups
    # ------------------------------------------------------------------
    if patterns:
        print("  ─── COUNTERFEIT PATTERN GROUPS ─────────────────────────────")
        for p in patterns[:5]:
            pid = p.get("pattern_id", "")
            cnt = p.get("detection_count", 0)
            first = (p.get("first_seen", "") or "")[:10]
            last = (p.get("last_seen", "") or "")[:10]
            print(f"  {pid}  Detections={cnt}  First={first}  Last={last}")
        print()

    # ------------------------------------------------------------------
    # Recent Incidents Table
    # ------------------------------------------------------------------
    recent_incidents = all_incidents[:10]
    if recent_incidents:
        print("  ─── RECENT INCIDENTS ───────────────────────────────────────")
        header = f"  {'INCIDENT ID':<20} {'PRODUCT':<12} {'SCORE':>6} {'STATUS':<20} {'TIMESTAMP':<20}"
        print(header)
        print("  " + "─" * 80)
        for inc in recent_incidents:
            score_pct = f"{inc.authentication_score * 100:.1f}%"
            ts = inc.timestamp[:16]
            print(
                f"  {inc.incident_id:<20} {inc.product_id[:11]:<12} "
                f"{score_pct:>6} {inc.status:<20} {ts:<20}"
            )
        print()

    print(f"{'=' * 65}\n")


# =============================================================================
# Incident detail view
# =============================================================================

def print_incident_detail(incident: Incident):
    """Print a full evidence view of a single incident."""
    print(f"\n{'=' * 60}")
    print(f"  INCIDENT #{incident.incident_id}")
    print(f"{'=' * 60}\n")

    print("  PRODUCT INFORMATION")
    print("  ─────────────────────────────")
    print(f"  Product ID : {incident.product_id}")
    print()

    print("  AUTHENTICATION (Layer 1)")
    print("  ─────────────────────────────")
    print(f"  Status           : {incident.authentication_status}")
    print(f"  Final Decision   : {incident.final_decision}")
    print(f"  Physical Decision: {incident.physical_decision}")
    print(f"  Digital Decision : {incident.digital_decision}")
    print(f"  Auth Score       : {incident.authentication_score * 100:.1f}%")
    print(f"  Confidence       : {incident.confidence}")
    print(f"  RANSAC Inlier    : {incident.ransac_inlier_ratio:.3f}")
    print(f"  LBP Similarity   : {incident.lbp_similarity:.3f}")
    print(f"  ROI Quality      : {incident.roi_quality:.3f}")
    print()

    print("  LOCATION")
    print("  ─────────────────────────────")
    loc = incident.location or {}
    if loc:
        approx = " [APPROXIMATE]" if loc.get("is_approximate") else ""
        print(f"  Source    : {incident.location_source}{approx}")
        print(f"  City      : {loc.get('city', 'N/A')}")
        print(f"  State     : {loc.get('state', 'N/A')}")
        print(f"  Country   : {loc.get('country', 'N/A')}")
        lat = loc.get("latitude")
        lon = loc.get("longitude")
        if lat is not None and lon is not None and not (lat == 0.0 and lon == 0.0):
            print(f"  Coords    : ({lat:.4f}, {lon:.4f})")
        acc = loc.get("accuracy_metres")
        if acc:
            print(f"  Accuracy  : ±{acc:.0f} m")
    else:
        print("  No location recorded.")
    print()

    print("  INTELLIGENCE")
    print("  ─────────────────────────────")
    print(f"  Duplicate Group  : {incident.duplicate_group_id or 'None'}")
    print(f"  Pattern ID       : {incident.counterfeit_pattern_id or 'None'}")
    print(f"  Geo Cluster      : {incident.geographic_cluster_id or 'None'}")
    print(f"  Risk Score       : {incident.risk_score if incident.risk_score is not None else 'N/A'}")
    print()

    print("  TIMELINE")
    print("  ─────────────────────────────")
    print(f"  Recorded   : {incident.timestamp}")
    print(f"  Status     : {incident.status}")
    if incident.related_incident_ids:
        print(f"  Related    : {', '.join(incident.related_incident_ids)}")
    if incident.alert_ids:
        print(f"  Alerts     : {', '.join(incident.alert_ids)}")
    print()

    print("  IMAGE EVIDENCE")
    print("  ─────────────────────────────")
    print(f"  Image Hash : {incident.image_hash or 'N/A'}")
    print(f"{'=' * 60}\n")


# =============================================================================
# JSON report
# =============================================================================

def build_json_report(
    incident_manager: IncidentManager,
    trend_data: Dict[str, Any],
    geo_clusters: List[Dict[str, Any]],
    patterns: List[Dict[str, Any]],
    risk_scores: List[Dict[str, Any]],
    active_alerts: List[Dict[str, Any]],
    new_incident: Optional[Incident] = None,
) -> Dict[str, Any]:
    """Build a full machine-readable intelligence report dict."""
    all_incidents = incident_manager.list_incidents()
    return {
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "total_incidents": len(all_incidents),
            "recent_24h": _count_recent(all_incidents, hours=24),
            "active_hotspots": len(geo_clusters),
            "active_patterns": len(patterns),
            "active_alerts": len(active_alerts),
        },
        "new_incident": new_incident.to_dict() if new_incident else None,
        "trend": trend_data,
        "geo_clusters": geo_clusters,
        "patterns": patterns,
        "risk_scores": risk_scores,
        "active_alerts": active_alerts,
        "recent_incidents": [
            {
                "incident_id": inc.incident_id,
                "product_id": inc.product_id,
                "authentication_score": inc.authentication_score,
                "final_decision": inc.final_decision,
                "status": inc.status,
                "timestamp": inc.timestamp,
                "location_source": inc.location_source,
                "pattern_id": inc.counterfeit_pattern_id,
                "cluster_id": inc.geographic_cluster_id,
            }
            for inc in all_incidents[:20]
        ],
    }


# =============================================================================
# Helpers
# =============================================================================

def _count_recent(incidents: List[Incident], hours: int = 24) -> int:
    from datetime import timezone
    cutoff = datetime.now(tz=timezone.utc).timestamp() - hours * 3600
    count = 0
    for inc in incidents:
        try:
            ts = datetime.fromisoformat(inc.timestamp)
            if ts.tzinfo is None:
                from datetime import timezone as _tz
                ts = ts.replace(tzinfo=_tz.utc)
            if ts.timestamp() >= cutoff:
                count += 1
        except Exception:
            pass
    return count
