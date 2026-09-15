"""
Kalakriti Layer 2 — IP Geolocation Provider.

Provides approximate geographic location via the public ip-api.com JSON
endpoint (no API key required for non-commercial use, max 45 requests/min).

The resolved location is always marked as IP_ESTIMATED and is_approximate=True.
It is NEVER represented as precise GPS.
"""

from __future__ import annotations

import logging
from typing import Optional

from layer2.location.location_validator import LocationData, validate_location, LocationValidationError

logger = logging.getLogger(__name__)

_IP_API_URL = "http://ip-api.com/json/?fields=status,message,country,regionName,city,district,lat,lon,query"


def get_ip_location(timeout_seconds: float = 5.0) -> Optional[LocationData]:
    """
    Attempt to resolve approximate location via IP geolocation.

    Returns LocationData with source=IP_ESTIMATED, or None on failure.
    The caller must display this as "Approximate location based on IP address".
    """
    try:
        import urllib.request
        import json as _json

        req = urllib.request.Request(_IP_API_URL, headers={"User-Agent": "Kalakriti/1.0"})
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            data = _json.loads(resp.read().decode("utf-8"))

        if data.get("status") != "success":
            msg = data.get("message", "unknown error")
            logger.warning(f"IP geolocation failed: {msg}")
            return None

        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            logger.warning("IP geolocation returned no coordinates")
            return None

        location = validate_location(
            latitude=lat,
            longitude=lon,
            source="IP_ESTIMATED",
            country=data.get("country", ""),
            state=data.get("regionName", ""),
            city=data.get("city", ""),
            area=data.get("district", ""),
        )

        logger.info(
            f"IP geolocation resolved: {location.city}, {location.state}, "
            f"{location.country} ({lat:.4f}, {lon:.4f}) [APPROXIMATE]"
        )
        return location

    except ImportError:
        logger.warning("urllib not available; cannot perform IP geolocation")
        return None
    except LocationValidationError as e:
        logger.warning(f"IP geolocation returned invalid coordinates: {e}")
        return None
    except Exception as e:
        logger.warning(f"IP geolocation request failed: {e}")
        return None
