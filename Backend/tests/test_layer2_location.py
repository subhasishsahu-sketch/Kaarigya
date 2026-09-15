"""
Tests for Layer 2 — Location components.
Covers: valid GPS, invalid GPS, manual, IP fallback, approximate labeling.
"""

import pytest
from layer2.location.location_validator import (
    validate_location,
    LocationValidationError,
    LocationData,
)
from layer2.location.location_manager import acquire_location_noninteractive


# =============================================================================
# Location Validator Tests
# =============================================================================

class TestLocationValidator:

    def test_valid_gps_coordinates(self):
        loc = validate_location(28.6139, 77.2090, "USER_GPS", city="New Delhi")
        assert loc.latitude == pytest.approx(28.6139)
        assert loc.longitude == pytest.approx(77.2090)
        assert loc.source == "USER_GPS"
        assert loc.city == "New Delhi"
        assert not loc.is_approximate

    def test_valid_manual_coordinates(self):
        loc = validate_location(-33.8688, 151.2093, "USER_MANUAL", city="Sydney")
        assert loc.latitude == pytest.approx(-33.8688)
        assert not loc.is_approximate

    def test_ip_estimated_is_approximate(self):
        loc = validate_location(51.5074, -0.1278, "IP_ESTIMATED", city="London")
        assert loc.is_approximate
        assert loc.source == "IP_ESTIMATED"

    def test_invalid_latitude_too_high(self):
        with pytest.raises(LocationValidationError, match="out of range"):
            validate_location(91.0, 0.0, "USER_MANUAL")

    def test_invalid_latitude_too_low(self):
        with pytest.raises(LocationValidationError, match="out of range"):
            validate_location(-91.0, 0.0, "USER_MANUAL")

    def test_invalid_longitude_too_high(self):
        with pytest.raises(LocationValidationError, match="out of range"):
            validate_location(0.0, 181.0, "USER_MANUAL")

    def test_invalid_longitude_too_low(self):
        with pytest.raises(LocationValidationError, match="out of range"):
            validate_location(0.0, -181.0, "USER_MANUAL")

    def test_null_island_rejected_for_user_gps(self):
        with pytest.raises(LocationValidationError, match="unlikely"):
            validate_location(0.0, 0.0, "USER_GPS")

    def test_null_island_allowed_for_ip_estimated(self):
        # IP estimated may theoretically land at 0,0
        loc = validate_location(0.0, 0.0, "IP_ESTIMATED")
        assert loc.is_approximate

    def test_invalid_source(self):
        with pytest.raises(LocationValidationError, match="Invalid location source"):
            validate_location(10.0, 10.0, "UNKNOWN_SOURCE")

    def test_non_numeric_coordinates(self):
        with pytest.raises(LocationValidationError, match="must be numeric"):
            validate_location("abc", "xyz", "USER_MANUAL")

    def test_to_dict_round_trip(self):
        loc = validate_location(48.8566, 2.3522, "USER_GPS", city="Paris")
        d = loc.to_dict()
        restored = LocationData.from_dict(d)
        assert restored.latitude == pytest.approx(48.8566)
        assert restored.city == "Paris"


# =============================================================================
# Location Manager Non-Interactive Tests
# =============================================================================

class TestLocationManagerNonInteractive:

    def test_explicit_latlon(self):
        loc = acquire_location_noninteractive(latitude=19.076, longitude=72.877, city="Mumbai")
        assert loc is not None
        assert loc.latitude == pytest.approx(19.076)
        assert loc.source == "USER_MANUAL"

    def test_city_only_returns_approximate(self):
        loc = acquire_location_noninteractive(city="Jaipur", state="Rajasthan", country="India")
        assert loc is not None
        assert loc.city == "Jaipur"
        assert loc.is_approximate

    def test_no_input_returns_none(self):
        loc = acquire_location_noninteractive()
        assert loc is None

    def test_invalid_latlon_returns_none(self):
        loc = acquire_location_noninteractive(latitude=200.0, longitude=77.0)
        assert loc is None
