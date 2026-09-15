"""
Kalakriti Layer 2 — Main Orchestration Pipeline.

Entry point for the complete Layer 2 Counterfeit Intelligence pipeline.

Usage (called from verify.py after Layer 1 produces a result):

    from layer2.pipeline import run_layer2
    run_layer2(
        verification_result=result,
        config=config,
        project_root=project_root,
        interactive=True,        # prompt user for location
        output_json=False,       # True to print JSON instead of terminal dashboard
    )

The pipeline:
    1. Adapt Layer 1 result → DetectionEvent
    2. Check trigger condition (counterfeit / suspicious)
    3. Acquire location (interactive or non-interactive)
    4. Create incident
    5. Run duplicate detection
    6. Run visual pattern clustering
    7. Run geographic clustering
    8. Update heatmap
    9. Update time-series trends
    10. Update risk scores
    11. Evaluate alert rules
    12. Render dashboard

Each step is independent and fails gracefully — a failure in intelligence
does NOT crash the Layer 1 authentication result.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def run_layer2(
    verification_result,
    config: Dict[str, Any],
    project_root: str,
    interactive: bool = True,
    output_json: bool = False,
    # Non-interactive overrides
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    city: str = "",
    state: str = "",
    country: str = "",
    use_ip_fallback: bool = False,
) -> Optional[Dict[str, Any]]:
    """
    Execute the full Layer 2 counterfeit intelligence pipeline.

    Args:
        verification_result: VerificationResult from Layer 1 (src/verification.py)
        config: Merged config dict
        project_root: Absolute path to project root
        interactive: If True, prompt user for location input
        output_json: If True, return JSON report dict (also prints it)
        latitude/longitude/city/state/country: Non-interactive location override
        use_ip_fallback: Use IP geolocation if no explicit location given

    Returns:
        JSON report dict if output_json=True, else None
    """
    try:
        return _run_pipeline(
            verification_result=verification_result,
            config=config,
            project_root=project_root,
            interactive=interactive,
            output_json=output_json,
            latitude=latitude,
            longitude=longitude,
            city=city,
            state=state,
            country=country,
            use_ip_fallback=use_ip_fallback,
        )
    except Exception as exc:
        logger.error(f"Layer 2 pipeline encountered an unexpected error: {exc}", exc_info=True)
        return None


def _run_pipeline(
    verification_result,
    config: Dict[str, Any],
    project_root: str,
    interactive: bool,
    output_json: bool,
    latitude: Optional[float],
    longitude: Optional[float],
    city: str,
    state: str,
    country: str,
    use_ip_fallback: bool,
) -> Optional[Dict[str, Any]]:
    """Internal pipeline — individual steps wrapped in try/except."""

    from layer2.adapter import build_detection_event

    # ── Step 1: Build detection event ──────────────────────────────────
    try:
        event = build_detection_event(verification_result)
    except Exception as e:
        logger.error(f"[L2] Failed to build detection event: {e}")
        return None

    # ── Step 2: Trigger check ───────────────────────────────────────────
    if not event.is_counterfeit_or_suspicious():
        logger.debug(
            "[L2] Layer 1 result is AUTHENTIC — Layer 2 pipeline not triggered."
        )
        return None

    logger.info(
        f"[L2] Triggered for '{event.query_name}' — "
        f"decision='{event.final_decision}'"
    )

    # ── Storage paths ───────────────────────────────────────────────────
    l2_dir = _l2_dir(config, project_root)
    intelligence_dir = os.path.join(l2_dir, "intelligence")
    alerts_dir = os.path.join(l2_dir, "alerts")
    os.makedirs(intelligence_dir, exist_ok=True)
    os.makedirs(alerts_dir, exist_ok=True)

    # ── Step 3: Location acquisition ───────────────────────────────────
    location = None
    location_source = "UNKNOWN"
    try:
        if interactive:
            from layer2.location.location_manager import acquire_location_interactive
            loc_data = acquire_location_interactive()
        else:
            from layer2.location.location_manager import acquire_location_noninteractive
            loc_data = acquire_location_noninteractive(
                latitude=latitude,
                longitude=longitude,
                city=city,
                state=state,
                country=country,
                use_ip_fallback=use_ip_fallback,
            )

        if loc_data:
            location = loc_data.to_dict()
            location_source = loc_data.source
    except Exception as e:
        logger.warning(f"[L2] Location acquisition failed: {e}. Continuing without location.")

    # ── Step 4: Create incident ─────────────────────────────────────────
    new_incident = None
    try:
        from layer2.incident.incident_manager import IncidentManager
        inc_manager = IncidentManager(storage_dir=l2_dir)
        new_incident = inc_manager.create_incident(
            product_id=event.product_id,
            authentication_status=event.layer1_status,
            authentication_score=event.similarity,
            final_decision=event.final_decision,
            physical_decision=event.physical_decision,
            digital_decision=event.digital_decision,
            confidence=event.confidence,
            timestamp=event.timestamp,
            image_hash=event.image_hash,
            ransac_inlier_ratio=event.ransac_inlier_ratio,
            lbp_similarity=event.lbp_similarity,
            glcm_similarity=event.glcm_similarity,
            reprojection_error=event.reprojection_error,
            normalized_match_count=event.normalized_match_count,
            roi_quality=event.roi_quality,
            location=location,
            location_source=location_source,
        )
    except Exception as e:
        logger.error(f"[L2] Incident creation failed: {e}")
        return None

    # ── Step 5: Duplicate detection ─────────────────────────────────────
    try:
        from layer2.incident.duplicate_detector import DuplicateDetector
        dup_detector = DuplicateDetector(config=config)
        all_incidents = inc_manager.list_incidents()
        # Exclude the new incident itself
        prior_incidents = [i for i in all_incidents if i.incident_id != new_incident.incident_id]
        dup_group, related_id = dup_detector.find_related(event, prior_incidents)

        if dup_group:
            new_incident.duplicate_group_id = dup_group
            new_incident.status = "DUPLICATE"
            if related_id:
                new_incident.related_incident_ids.append(related_id)
                # Also update the original incident to link back
                try:
                    orig = inc_manager.get_incident(related_id)
                    if orig:
                        if new_incident.incident_id not in orig.related_incident_ids:
                            orig.related_incident_ids.append(new_incident.incident_id)
                        if not orig.duplicate_group_id:
                            orig.duplicate_group_id = dup_group
                        inc_manager.update_incident(orig)
                except Exception:
                    pass
            inc_manager.update_incident(new_incident)
            logger.info(
                f"[L2] Incident {new_incident.incident_id} linked to duplicate group {dup_group}"
            )
    except Exception as e:
        logger.warning(f"[L2] Duplicate detection failed: {e}")

    # ── Reload all incidents for intelligence ───────────────────────────
    try:
        all_incidents = inc_manager.list_incidents()
    except Exception:
        all_incidents = [new_incident]

    # ── Step 6: Visual pattern clustering ──────────────────────────────
    id_to_pattern: Dict[str, str] = {}
    try:
        from layer2.intelligence.visual_clustering import VisualClusterer
        vc = VisualClusterer(
            storage_path=os.path.join(intelligence_dir, "visual_clusters.json"),
            config=config,
        )
        id_to_pattern = vc.cluster(all_incidents)
        # Update incidents with pattern IDs
        for inc in all_incidents:
            pid = id_to_pattern.get(inc.incident_id)
            if pid and pid != "NOISE" and inc.counterfeit_pattern_id != pid:
                inc.counterfeit_pattern_id = pid
                inc_manager.update_incident(inc)
    except Exception as e:
        logger.warning(f"[L2] Visual clustering failed: {e}")

    # ── Step 7: Geographic clustering ──────────────────────────────────
    id_to_geo_cluster: Dict[str, str] = {}
    try:
        from layer2.intelligence.geographic_clustering import GeoClusterer
        gc = GeoClusterer(
            storage_path=os.path.join(intelligence_dir, "geo_clusters.json"),
            config=config,
        )
        id_to_geo_cluster = gc.cluster(all_incidents)
        for inc in all_incidents:
            cid = id_to_geo_cluster.get(inc.incident_id)
            if cid and cid != "NO_GEO_CLUSTER" and inc.geographic_cluster_id != cid:
                inc.geographic_cluster_id = cid
                inc_manager.update_incident(inc)
    except Exception as e:
        logger.warning(f"[L2] Geographic clustering failed: {e}")

    # ── Step 8: Heatmap update ──────────────────────────────────────────
    try:
        from layer2.intelligence.heatmap import HeatmapBuilder
        hb = HeatmapBuilder(
            storage_path=os.path.join(intelligence_dir, "heatmap.json"),
            config=config,
        )
        hb.build(all_incidents)
    except Exception as e:
        logger.warning(f"[L2] Heatmap update failed: {e}")

    # ── Step 9: Trend analysis ──────────────────────────────────────────
    trend_data: Dict[str, Any] = {}
    try:
        from layer2.intelligence.trend_analysis import TrendAnalyser
        ta = TrendAnalyser(
            storage_path=os.path.join(intelligence_dir, "trends.json"),
            config=config,
        )
        trend_data = ta.analyse(all_incidents)
    except Exception as e:
        logger.warning(f"[L2] Trend analysis failed: {e}")

    # ── Step 10: Risk scoring ───────────────────────────────────────────
    risk_scores = []
    geo_clusters = []
    try:
        from layer2.intelligence.geographic_clustering import GeoClusterer
        from layer2.intelligence.risk_scoring import RiskScorer
        gc = GeoClusterer(
            storage_path=os.path.join(intelligence_dir, "geo_clusters.json"),
            config=config,
        )
        geo_clusters = gc.load_clusters()
        rs = RiskScorer(
            storage_path=os.path.join(intelligence_dir, "risk_scores.json"),
            config=config,
        )
        risk_scores = rs.score_clusters(geo_clusters, trend_data)
    except Exception as e:
        logger.warning(f"[L2] Risk scoring failed: {e}")

    # ── Load patterns for alert evaluation ─────────────────────────────
    patterns = []
    try:
        from layer2.intelligence.visual_clustering import VisualClusterer
        vc = VisualClusterer(
            storage_path=os.path.join(intelligence_dir, "visual_clusters.json"),
            config=config,
        )
        patterns = vc.load_patterns()
    except Exception as e:
        logger.warning(f"[L2] Could not load patterns: {e}")

    # ── Step 11: Alert evaluation ───────────────────────────────────────
    new_alerts = []
    try:
        from layer2.alerts.alert_engine import AlertEngine
        ae = AlertEngine(
            storage_path=os.path.join(alerts_dir, "alerts.json"),
            config=config,
        )
        new_alerts = ae.evaluate(trend_data, risk_scores, patterns, geo_clusters, config)
        active_alerts = ae.load_active()

        # Link alert IDs to the new incident
        if new_alerts and new_incident:
            for alert in new_alerts:
                new_incident.alert_ids.append(alert["alert_id"])
            inc_manager.update_incident(new_incident)
    except Exception as e:
        logger.warning(f"[L2] Alert evaluation failed: {e}")
        active_alerts = []

    # ── Step 12: Dashboard ──────────────────────────────────────────────
    try:
        # Reload new incident after all updates
        new_incident = inc_manager.get_incident(new_incident.incident_id)
    except Exception:
        pass

    try:
        from layer2.dashboard.dashboard import print_dashboard, build_json_report

        if output_json:
            report = build_json_report(
                incident_manager=inc_manager,
                trend_data=trend_data,
                geo_clusters=geo_clusters,
                patterns=patterns,
                risk_scores=risk_scores,
                active_alerts=active_alerts,
                new_incident=new_incident,
            )
            print(json.dumps(report, indent=2, default=str))
            return report
        else:
            print_dashboard(
                incident_manager=inc_manager,
                trend_data=trend_data,
                geo_clusters=geo_clusters,
                patterns=patterns,
                risk_scores=risk_scores,
                active_alerts=active_alerts,
                new_incident=new_incident,
            )
    except Exception as e:
        logger.warning(f"[L2] Dashboard rendering failed: {e}")

    return None


# =============================================================================
# Storage path helpers
# =============================================================================

def _l2_dir(config: Dict[str, Any], project_root: str) -> str:
    """Return the Layer 2 data directory, creating it if needed."""
    rel = config.get("layer2", {}).get("storage_dir", "data/layer2")
    path = os.path.join(project_root, rel)
    os.makedirs(path, exist_ok=True)
    return path
