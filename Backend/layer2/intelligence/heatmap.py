"""
Kalakriti Layer 2 — Heatmap Data Generator.

Builds geographic density grids and individual detection point lists
from counterfeit incidents. Outputs JSON consumed by the dashboard.

Does NOT render images — produces structured data for the dashboard
to visualise in any way appropriate.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from layer2.incident.incident_manager import Incident

logger = logging.getLogger(__name__)


def _round_to_grid(value: float, cell_size: float) -> float:
    """Round coordinate to nearest grid cell centre."""
    import math
    return math.floor(value / cell_size) * cell_size + cell_size / 2.0


class HeatmapBuilder:
    """
    Aggregates incident locations into:
      - Individual detection points list
      - Geographic density grid (configurable cell size)
    """

    def __init__(self, storage_path: str, config: dict):
        self.storage_path = storage_path
        cfg = config.get("layer2", {}).get("heatmap", {})
        # Cell size in degrees (≈ 1° lat ≈ 111 km; 0.5° ≈ 55 km)
        self.cell_size_degrees: float = cfg.get("cell_size_degrees", 1.0)

    def build(self, incidents: List[Incident]) -> Dict[str, Any]:
        """
        Build heatmap data from all incidents with valid coordinates.

        Returns:
            {
              "points": [...],          individual detection points
              "grid": [...],            density grid cells
              "updated_at": "..."
            }
        """
        points = []
        grid_counts: Dict[Tuple[float, float], int] = {}

        for inc in incidents:
            loc = inc.location
            if not loc:
                continue
            lat = loc.get("latitude")
            lon = loc.get("longitude")
            if lat is None or lon is None:
                continue
            if lat == 0.0 and lon == 0.0:
                continue

            is_approx = loc.get("is_approximate", False)
            points.append({
                "incident_id": inc.incident_id,
                "latitude": lat,
                "longitude": lon,
                "product_id": inc.product_id,
                "timestamp": inc.timestamp,
                "pattern_id": inc.counterfeit_pattern_id or "",
                "cluster_id": inc.geographic_cluster_id or "",
                "is_approximate": is_approx,
                "final_decision": inc.final_decision,
            })

            cell = (
                _round_to_grid(lat, self.cell_size_degrees),
                _round_to_grid(lon, self.cell_size_degrees),
            )
            grid_counts[cell] = grid_counts.get(cell, 0) + 1

        grid = [
            {
                "lat": cell[0],
                "lon": cell[1],
                "count": count,
                "intensity": min(1.0, count / max(v for v in grid_counts.values())),
            }
            for cell, count in sorted(grid_counts.items(), key=lambda x: -x[1])
        ] if grid_counts else []

        data = {
            "updated_at": datetime.now().isoformat(),
            "total_points": len(points),
            "grid_cell_size_degrees": self.cell_size_degrees,
            "points": points,
            "grid": grid,
        }

        self._save(data)
        logger.info(
            f"Heatmap: {len(points)} detection point(s), "
            f"{len(grid)} grid cell(s)"
        )
        return data

    def _save(self, data: Dict[str, Any]):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self) -> Dict[str, Any]:
        if not os.path.exists(self.storage_path):
            return {"points": [], "grid": []}
        try:
            with open(self.storage_path) as f:
                return json.load(f)
        except Exception:
            return {"points": [], "grid": []}
