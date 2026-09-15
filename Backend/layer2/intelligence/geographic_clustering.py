"""
Kalakriti Layer 2 — Geographic Clustering.

Clusters geolocated incidents using DBSCAN on (lat, lon) converted to
approximate Cartesian distance. Produces geographic_cluster_id values
(GEO-CLUSTER-001, …).

Config keys (config['layer2']['geo_clustering']):
    eps_km: 50.0        radius in km for DBSCAN neighbourhood
    min_samples: 2      minimum cluster size
"""

from __future__ import annotations

import json
import logging
import math
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

import numpy as np

from layer2.incident.incident_manager import Incident

logger = logging.getLogger(__name__)

EARTH_RADIUS_KM = 6371.0


def _lat_lon_to_xyz(lat: float, lon: float) -> np.ndarray:
    """Convert lat/lon (degrees) to unit-sphere Cartesian."""
    lat_r = math.radians(lat)
    lon_r = math.radians(lon)
    x = math.cos(lat_r) * math.cos(lon_r)
    y = math.cos(lat_r) * math.sin(lon_r)
    z = math.sin(lat_r)
    return np.array([x, y, z], dtype=np.float64)


class GeoClusterer:
    """
    Geographic clustering of incidents with valid coordinates.
    """

    def __init__(self, storage_path: str, config: dict):
        self.storage_path = storage_path
        cfg = config.get("layer2", {}).get("geo_clustering", {})
        self.eps_km: float = cfg.get("eps_km", 50.0)
        self.min_samples: int = int(cfg.get("min_samples", 2))

    def cluster(self, incidents: List[Incident]) -> Dict[str, str]:
        """
        Cluster incidents by geographic proximity.

        Returns:
            mapping of incident_id → cluster_id (e.g. "GEO-CLUSTER-001")
            Incidents with no coordinates or in noise get "NO_GEO_CLUSTER"
        """
        # Filter incidents with valid coordinates
        geo_incidents = [
            inc for inc in incidents
            if inc.location
            and inc.location.get("latitude") is not None
            and inc.location.get("longitude") is not None
            and not (inc.location["latitude"] == 0.0 and inc.location["longitude"] == 0.0)
        ]

        id_to_cluster: Dict[str, str] = {}

        if len(geo_incidents) < self.min_samples:
            logger.info(
                f"Geographic clustering skipped: only {len(geo_incidents)} "
                f"geolocated incident(s), need >= {self.min_samples}"
            )
            return id_to_cluster

        # Build XYZ coordinates on unit sphere
        coords = np.array([
            _lat_lon_to_xyz(
                inc.location["latitude"],
                inc.location["longitude"],
            )
            for inc in geo_incidents
        ])

        # Convert eps from km to chord distance on unit sphere
        eps_chord = 2.0 * math.sin(self.eps_km / (2.0 * EARTH_RADIUS_KM))

        try:
            from sklearn.cluster import DBSCAN
            db = DBSCAN(
                eps=eps_chord,
                min_samples=self.min_samples,
                metric="euclidean",
            )
            labels = db.fit_predict(coords)
        except ImportError:
            logger.warning("scikit-learn not available; skipping geographic clustering")
            return id_to_cluster
        except Exception as e:
            logger.warning(f"Geographic clustering failed: {e}")
            return id_to_cluster

        for inc, label in zip(geo_incidents, labels):
            if label < 0:
                id_to_cluster[inc.incident_id] = "NO_GEO_CLUSTER"
            else:
                id_to_cluster[inc.incident_id] = f"GEO-CLUSTER-{label + 1:03d}"

        self._save_clusters(geo_incidents, id_to_cluster)
        n_clusters = len({l for l in labels if l >= 0})
        logger.info(
            f"Geographic clustering: {n_clusters} cluster(s) "
            f"from {len(geo_incidents)} geolocated incident(s)"
        )
        return id_to_cluster

    def _save_clusters(
        self,
        incidents: List[Incident],
        id_to_cluster: Dict[str, str],
    ):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)

        groups: Dict[str, List[Incident]] = {}
        for inc in incidents:
            cid = id_to_cluster.get(inc.incident_id, "NO_GEO_CLUSTER")
            groups.setdefault(cid, []).append(inc)

        clusters = []
        for cid, incs in sorted(groups.items()):
            if cid == "NO_GEO_CLUSTER":
                continue

            lats = [
                inc.location["latitude"] for inc in incs
                if inc.location and inc.location.get("latitude") is not None
            ]
            lons = [
                inc.location["longitude"] for inc in incs
                if inc.location and inc.location.get("longitude") is not None
            ]
            centroid_lat = sum(lats) / len(lats) if lats else 0.0
            centroid_lon = sum(lons) / len(lons) if lons else 0.0

            times = sorted(inc.timestamp for inc in incs)
            recent = times[-1] if times else ""

            products: Set[str] = {inc.product_id for inc in incs}
            patterns: Set[str] = {
                inc.counterfeit_pattern_id
                for inc in incs
                if inc.counterfeit_pattern_id
            }

            clusters.append({
                "cluster_id": cid,
                "centroid": {"latitude": round(centroid_lat, 4), "longitude": round(centroid_lon, 4)},
                "detection_count": len(incs),
                "unique_products": sorted(products),
                "unique_patterns": sorted(patterns),
                "first_seen": times[0],
                "last_seen": times[-1],
                "recent_activity": recent,
                "incident_ids": [inc.incident_id for inc in incs],
            })

        with open(self.storage_path, "w") as f:
            json.dump(
                {"updated_at": datetime.now().isoformat(), "clusters": clusters},
                f, indent=2,
            )

    def load_clusters(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.storage_path):
            return []
        try:
            with open(self.storage_path) as f:
                return json.load(f).get("clusters", [])
        except Exception:
            return []
