"""
Kalakriti Layer 2 — Incident Manager.

Manages creation, persistence, and retrieval of counterfeit detection incidents.
Each incident is stored as a JSON file under data/layer2/incidents/.
Incident IDs follow the pattern CF-YYYY-NNNNNN.
"""

from __future__ import annotations

import os
import json
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# =============================================================================
# Constants / Valid Statuses
# =============================================================================

INCIDENT_STATUSES = {
    "NEW",
    "UNDER_REVIEW",
    "CONFIRMED_COUNTERFEIT",
    "SUSPICIOUS",
    "DUPLICATE",
    "RESOLVED",
}


# =============================================================================
# Incident Data Class
# =============================================================================

@dataclass
class Incident:
    """A single counterfeit detection incident record."""

    incident_id: str
    product_id: str
    authentication_status: str
    authentication_score: float
    final_decision: str
    physical_decision: str
    digital_decision: str
    confidence: str
    timestamp: str
    image_hash: str

    # Layer 1 feature references for intelligence use
    ransac_inlier_ratio: float = 0.0
    lbp_similarity: float = 0.0
    glcm_similarity: float = 0.0
    reprojection_error: float = 100.0
    normalized_match_count: float = 0.0
    roi_quality: float = 0.0

    # Location
    location: Optional[Dict[str, Any]] = None
    location_source: str = "UNKNOWN"     # USER_GPS | USER_MAP | USER_MANUAL | IP_ESTIMATED | UNKNOWN

    # Intelligence links (filled by downstream modules)
    duplicate_group_id: Optional[str] = None
    counterfeit_pattern_id: Optional[str] = None
    geographic_cluster_id: Optional[str] = None
    risk_score: Optional[float] = None

    # Alert links
    alert_ids: List[str] = field(default_factory=list)

    # Incident lifecycle
    status: str = "NEW"
    related_incident_ids: List[str] = field(default_factory=list)
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "Incident":
        # Filter only known fields
        known = {f.name for f in Incident.__dataclass_fields__.values()}  # type: ignore[attr-defined]
        filtered = {k: v for k, v in d.items() if k in known}
        return Incident(**filtered)


# =============================================================================
# Incident Manager
# =============================================================================

class IncidentManager:
    """
    Manages persistence, retrieval, and updates of counterfeit incidents.

    Storage layout:
        <storage_dir>/
            counter.json          ← global sequential counter
            incidents/
                CF-YYYY-NNNNNN.json
    """

    COUNTER_FILE = "counter.json"
    INCIDENTS_DIR = "incidents"

    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir
        self.incidents_dir = os.path.join(storage_dir, self.INCIDENTS_DIR)
        os.makedirs(self.incidents_dir, exist_ok=True)

        self._counter_path = os.path.join(storage_dir, self.COUNTER_FILE)
        self._counter = self._load_counter()

    # ------------------------------------------------------------------
    # Counter management
    # ------------------------------------------------------------------

    def _load_counter(self) -> int:
        if os.path.exists(self._counter_path):
            try:
                with open(self._counter_path, "r") as f:
                    return int(json.load(f).get("counter", 0))
            except Exception:
                pass
        return 0

    def _save_counter(self):
        with open(self._counter_path, "w") as f:
            json.dump({"counter": self._counter}, f)

    def _next_id(self) -> str:
        self._counter += 1
        self._save_counter()
        year = datetime.now(tz=timezone.utc).strftime("%Y")
        return f"CF-{year}-{self._counter:06d}"

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def create_incident(
        self,
        product_id: str,
        authentication_status: str,
        authentication_score: float,
        final_decision: str,
        physical_decision: str,
        digital_decision: str,
        confidence: str,
        timestamp: str,
        image_hash: str,
        ransac_inlier_ratio: float = 0.0,
        lbp_similarity: float = 0.0,
        glcm_similarity: float = 0.0,
        reprojection_error: float = 100.0,
        normalized_match_count: float = 0.0,
        roi_quality: float = 0.0,
        location: Optional[Dict[str, Any]] = None,
        location_source: str = "UNKNOWN",
    ) -> Incident:
        """Create and persist a new incident. Returns the Incident object."""
        incident_id = self._next_id()

        incident = Incident(
            incident_id=incident_id,
            product_id=product_id,
            authentication_status=authentication_status,
            authentication_score=float(authentication_score),
            final_decision=final_decision,
            physical_decision=physical_decision,
            digital_decision=digital_decision,
            confidence=confidence,
            timestamp=timestamp,
            image_hash=image_hash,
            ransac_inlier_ratio=float(ransac_inlier_ratio),
            lbp_similarity=float(lbp_similarity),
            glcm_similarity=float(glcm_similarity),
            reprojection_error=float(reprojection_error),
            normalized_match_count=float(normalized_match_count),
            roi_quality=float(roi_quality),
            location=location,
            location_source=location_source,
            status="NEW",
        )

        self._save_incident(incident)
        logger.info(f"Created incident {incident_id} for product '{product_id}'")
        return incident

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Load an incident by ID."""
        path = self._incident_path(incident_id)
        if not os.path.exists(path):
            return None
        try:
            with open(path, "r") as f:
                return Incident.from_dict(json.load(f))
        except Exception as e:
            logger.warning(f"Could not load incident {incident_id}: {e}")
            return None

    def update_incident(self, incident: Incident):
        """Persist updated incident state."""
        self._save_incident(incident)
        logger.debug(f"Updated incident {incident.incident_id}")

    def list_incidents(
        self,
        status_filter: Optional[str] = None,
        product_id_filter: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> List[Incident]:
        """Load all incidents from disk, optionally filtered and limited."""
        incidents: List[Incident] = []

        for fname in sorted(os.listdir(self.incidents_dir)):
            if not fname.endswith(".json"):
                continue
            path = os.path.join(self.incidents_dir, fname)
            try:
                with open(path, "r") as f:
                    inc = Incident.from_dict(json.load(f))
                if status_filter and inc.status != status_filter:
                    continue
                if product_id_filter and inc.product_id != product_id_filter:
                    continue
                incidents.append(inc)
            except Exception as e:
                logger.warning(f"Could not load {fname}: {e}")

        # Newest first
        incidents.sort(key=lambda x: x.timestamp, reverse=True)

        if limit:
            return incidents[:limit]
        return incidents

    def count(self) -> int:
        """Return total number of stored incidents."""
        try:
            return sum(1 for f in os.listdir(self.incidents_dir) if f.endswith(".json"))
        except Exception:
            return 0

    def get_all_with_location(self) -> List[Incident]:
        """Return all incidents that have valid location data."""
        return [
            inc for inc in self.list_incidents()
            if inc.location
            and inc.location.get("latitude") is not None
            and inc.location.get("longitude") is not None
        ]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _incident_path(self, incident_id: str) -> str:
        return os.path.join(self.incidents_dir, f"{incident_id}.json")

    def _save_incident(self, incident: Incident):
        path = self._incident_path(incident.incident_id)
        with open(path, "w") as f:
            json.dump(incident.to_dict(), f, indent=2, default=str)
