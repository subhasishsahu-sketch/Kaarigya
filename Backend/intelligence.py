#!/usr/bin/env python3
"""
Kalakriti — Layer 2 Intelligence Dashboard CLI.

View the counterfeit intelligence dashboard, list incidents, and inspect
individual incident details without running a new verification.

Usage examples:
    python intelligence.py                          # show dashboard
    python intelligence.py --json                   # JSON report
    python intelligence.py --incident CF-2026-000001  # incident detail
    python intelligence.py --list                   # list all incidents
    python intelligence.py --list --status NEW      # filter by status
"""

import os
import sys
import json
import argparse
import logging


def parse_args():
    parser = argparse.ArgumentParser(
        description="Kalakriti — Counterfeit Intelligence Dashboard"
    )
    parser.add_argument(
        "--incident", "-i",
        default=None,
        help="Show detail for a specific incident ID (e.g. CF-2026-000001)"
    )
    parser.add_argument(
        "--list", "-l",
        action="store_true",
        help="List all incidents"
    )
    parser.add_argument(
        "--status",
        default=None,
        help="Filter incidents by status (NEW, DUPLICATE, CONFIRMED_COUNTERFEIT, etc.)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON"
    )
    parser.add_argument(
        "--config", "-c",
        default=None,
        help="Path to custom config.yaml"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    project_root = os.path.dirname(os.path.abspath(__file__))

    logging.basicConfig(level=logging.WARNING)

    from src.utils import load_config
    config = load_config(args.config)

    from layer2.pipeline import _l2_dir
    l2_dir = _l2_dir(config, project_root)
    intelligence_dir = os.path.join(l2_dir, "intelligence")
    alerts_dir = os.path.join(l2_dir, "alerts")

    from layer2.incident.incident_manager import IncidentManager
    inc_manager = IncidentManager(storage_dir=l2_dir)

    # ── Incident detail ──────────────────────────────────────────────
    if args.incident:
        incident = inc_manager.get_incident(args.incident)
        if incident is None:
            print(f"\n[ERROR] Incident '{args.incident}' not found.")
            sys.exit(1)
        if args.json:
            print(json.dumps(incident.to_dict(), indent=2, default=str))
        else:
            from layer2.dashboard.dashboard import print_incident_detail
            print_incident_detail(incident)
        return

    # ── Incident list ────────────────────────────────────────────────
    if args.list:
        incidents = inc_manager.list_incidents(status_filter=args.status)
        if args.json:
            print(json.dumps(
                [i.to_dict() for i in incidents], indent=2, default=str
            ))
        else:
            if not incidents:
                print("\nNo incidents found.")
                return
            print(f"\n{'INCIDENT ID':<22} {'PRODUCT':<14} {'SCORE':>6} {'STATUS':<22} {'TIMESTAMP'}")
            print("─" * 85)
            for inc in incidents:
                score = f"{inc.authentication_score * 100:.1f}%"
                ts = inc.timestamp[:16]
                print(f"{inc.incident_id:<22} {inc.product_id[:13]:<14} {score:>6} {inc.status:<22} {ts}")
        return

    # ── Full dashboard ───────────────────────────────────────────────
    def _load_json(path):
        if os.path.exists(path):
            try:
                with open(path) as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    trend_data = _load_json(os.path.join(intelligence_dir, "trends.json"))
    geo_data = _load_json(os.path.join(intelligence_dir, "geo_clusters.json"))
    geo_clusters = geo_data.get("clusters", []) if isinstance(geo_data, dict) else []
    pattern_data = _load_json(os.path.join(intelligence_dir, "visual_clusters.json"))
    patterns = pattern_data.get("patterns", []) if isinstance(pattern_data, dict) else []
    risk_data = _load_json(os.path.join(intelligence_dir, "risk_scores.json"))
    risk_scores = risk_data.get("risk_scores", []) if isinstance(risk_data, dict) else []

    from layer2.alerts.alert_engine import AlertEngine
    ae = AlertEngine(
        storage_path=os.path.join(alerts_dir, "alerts.json"),
        config=config,
    )
    active_alerts = ae.load_active()

    if args.json:
        from layer2.dashboard.dashboard import build_json_report
        report = build_json_report(
            incident_manager=inc_manager,
            trend_data=trend_data,
            geo_clusters=geo_clusters,
            patterns=patterns,
            risk_scores=risk_scores,
            active_alerts=active_alerts,
        )
        print(json.dumps(report, indent=2, default=str))
    else:
        from layer2.dashboard.dashboard import print_dashboard
        print_dashboard(
            incident_manager=inc_manager,
            trend_data=trend_data,
            geo_clusters=geo_clusters,
            patterns=patterns,
            risk_scores=risk_scores,
            active_alerts=active_alerts,
        )


if __name__ == "__main__":
    main()
