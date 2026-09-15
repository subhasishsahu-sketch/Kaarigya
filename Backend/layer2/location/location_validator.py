"""
Kalakriti Layer 2 — Location Validator.

Validates geographic coordinates and location metadata before storage.
Never treats IP-derived location as precise GPS.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

VALID_SOURCES = {"USER_GPS", "USER_MAP", "USER_MANUAL", "IP_ESTIMATED", "UNKNOWN"}

# Maximum allowed accuracy radius for user-provided GPS (metres)
MAX_ACCURACY_METRES = 10_000


@dataclass
class LocationData:
    """Validated location metadata for a counterfeit incident."""
    latitude: float
    longitude: float
    source: str                        # One of VALID_SOURCES
    accuracy_metres: Optional[float] = None
    country: str = ""
    state: str = ""
    city: str = ""
    area: str = ""                     # Neighbourhood / district
    is_approximate: bool = False       # True for IP_ESTIMATED
    timestamp: str = field(default_factory=lambda: datetime.now(tz=timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "LocationData":
        known = {f.name for f in LocationData.__dataclass_fields__.values()}  # type: ignore
        return LocationData(**{k: v for k, v in d.items() if k in known})


class LocationValidationError(ValueError):
    pass


def validate_location(
    latitude: Any,
    longitude: Any,
    source: str,
    accuracy_metres: Optional[float] = None,
    country: str = "",
    state: str = "",
    city: str = "",
    area: str = "",
) -> LocationData:
    """
    Validate and return a LocationData object.

    Raises LocationValidationError on invalid input.
    """
    # Validate source
    if source not in VALID_SOURCES:
        raise LocationValidationError(
            f"Invalid location source '{source}'. Must be one of {VALID_SOURCES}"
        )

    # Validate coordinates
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (TypeError, ValueError):
        raise LocationValidationError(
            f"Coordinates must be numeric. Got latitude={latitude!r}, longitude={longitude!r}"
        )

    if not (-90.0 <= lat <= 90.0):
        raise LocationValidationError(f"Latitude {lat} is out of range [-90, 90]")

    if not (-180.0 <= lon <= 180.0):
        raise LocationValidationError(f"Longitude {lon} is out of range [-180, 180]")

    # Reject null island (0,0) unless source is IP (could be valid ocean point)
    if lat == 0.0 and lon == 0.0 and source != "IP_ESTIMATED":
        raise LocationValidationError(
            "Coordinates (0.0, 0.0) are unlikely to be valid. "
            "Please provide a real location."
        )

    is_approximate = source == "IP_ESTIMATED"

    return LocationData(
        latitude=lat,
        longitude=lon,
        source=source,
        accuracy_metres=float(accuracy_metres) if accuracy_metres is not None else None,
        country=country or "",
        state=state or "",
        city=city or "",
        area=area or "",
        is_approximate=is_approximate,
    )
