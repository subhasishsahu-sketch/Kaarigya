"""
Kalakriti Layer 2 — Location Manager.

Acquires location for a counterfeit incident via:
  1. User prompt (manual city/area/lat-lon entry)
  2. IP geolocation fallback (explicitly opt-in)

Location is NEVER silently collected. The user is always informed why it is
being requested and how it will be used.
"""

from __future__ import annotations

import logging
from typing import Optional

from layer2.location.location_validator import LocationData, validate_location, LocationValidationError
from layer2.location.ip_geolocation import get_ip_location

logger = logging.getLogger(__name__)


def acquire_location_interactive(skip_prompt: bool = False) -> Optional[LocationData]:
    """
    Prompt the user to provide a location for counterfeit-intelligence reporting.

    Args:
        skip_prompt: If True, skip all prompts and return None (for non-interactive/test use).

    Returns:
        LocationData or None if the user declined / input failed.
    """
    if skip_prompt:
        return None

    print("\n" + "=" * 60)
    print("LAYER 2 — COUNTERFEIT INTELLIGENCE")
    print("=" * 60)
    print(
        "\nA counterfeit / suspicious detection has occurred.\n"
        "To support counterfeit-intelligence reporting, the system can\n"
        "record the approximate location of this detection.\n"
        "\nThis location is used ONLY for counterfeit activity mapping\n"
        "and is NOT used in the product authentication decision.\n"
    )
    print("Options:")
    print("  [1] Enter city / area name")
    print("  [2] Enter latitude and longitude manually")
    print("  [3] Use approximate location from IP address")
    print("  [4] Skip (no location recorded)")
    print()

    choice = input("Your choice [1-4]: ").strip()

    if choice == "1":
        return _prompt_manual_city()
    elif choice == "2":
        return _prompt_latlon()
    elif choice == "3":
        return _use_ip_fallback()
    else:
        print("\n[INFO] No location recorded for this incident.")
        return None


def acquire_location_noninteractive(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    city: str = "",
    state: str = "",
    country: str = "",
    use_ip_fallback: bool = False,
) -> Optional[LocationData]:
    """
    Non-interactive location acquisition for programmatic / API use.

    Priority: explicit lat/lon > city string > IP fallback > None
    """
    if latitude is not None and longitude is not None:
        try:
            return validate_location(
                latitude=latitude,
                longitude=longitude,
                source="USER_MANUAL",
                city=city,
                state=state,
                country=country,
            )
        except LocationValidationError as e:
            logger.warning(f"Provided coordinates invalid: {e}")

    if city:
        return LocationData(
            latitude=0.0,
            longitude=0.0,
            source="USER_MANUAL",
            city=city,
            state=state,
            country=country,
            is_approximate=True,
        )

    if use_ip_fallback:
        return get_ip_location()

    return None


# =============================================================================
# Interactive helpers
# =============================================================================

def _prompt_manual_city() -> Optional[LocationData]:
    city = input("  City / area name: ").strip()
    state = input("  State / region (optional): ").strip()
    country = input("  Country (optional): ").strip()

    if not city:
        print("[WARNING] No city provided. Location not recorded.")
        return None

    loc = LocationData(
        latitude=0.0,
        longitude=0.0,
        source="USER_MANUAL",
        city=city,
        state=state,
        country=country,
        is_approximate=True,
    )
    print(f"\n[INFO] Location recorded: {city}, {state}, {country} (city name, approximate)")
    return loc


def _prompt_latlon() -> Optional[LocationData]:
    print("  Enter decimal degrees (e.g. 28.6139, 77.2090)")
    try:
        lat_str = input("  Latitude: ").strip()
        lon_str = input("  Longitude: ").strip()
        lat = float(lat_str)
        lon = float(lon_str)
        city = input("  City (optional): ").strip()
        state = input("  State / region (optional): ").strip()
        country = input("  Country (optional): ").strip()

        loc = validate_location(
            latitude=lat,
            longitude=lon,
            source="USER_MANUAL",
            city=city,
            state=state,
            country=country,
        )
        print(f"\n[INFO] Location recorded: ({lat:.4f}, {lon:.4f}) [USER_MANUAL]")
        return loc

    except LocationValidationError as e:
        print(f"[WARNING] Invalid coordinates: {e}. Location not recorded.")
        return None
    except ValueError:
        print("[WARNING] Could not parse coordinates. Location not recorded.")
        return None


def _use_ip_fallback() -> Optional[LocationData]:
    print("\n[INFO] Attempting to resolve approximate location from IP address...")
    print("       NOTE: This location is approximate and may not be precise.")
    loc = get_ip_location()
    if loc:
        print(
            f"[INFO] Approximate IP location: {loc.city}, {loc.state}, {loc.country} "
            f"({loc.latitude:.3f}, {loc.longitude:.3f}) [IP_ESTIMATED — APPROXIMATE]"
        )
    else:
        print("[WARNING] IP geolocation failed. Location not recorded.")
    return loc
