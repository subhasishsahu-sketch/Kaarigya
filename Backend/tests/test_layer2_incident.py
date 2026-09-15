"""
Tests for Layer 2 — Incident Manager.
Covers: creation, unique IDs, persistence, status changes.
"""

import os
import shutil
import tempfile
import pytest

from layer2.incident.incident_manager import IncidentManager, Incident


@pytest.fixture
def tmp_storage():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


class TestIncidentManager:

    def test_create_incident_returns_incident(self, tmp_storage):
        mgr = IncidentManager(storage_dir=tmp_storage)
        inc = mgr.create_incident(
            product_id="P001",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.42,
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-01-01T12:00:00",
            image_hash="abc123",
        )
        assert inc.incident_id.startswith("CF-")
        assert inc.product_id == "P001"
        assert inc.status == "NEW"

    def test_incident_ids_are_unique(self, tmp_storage):
        mgr = IncidentManager(storage_dir=tmp_storage)
        ids = set()
        for _ in range(5):
            inc = mgr.create_incident(
                product_id="P001",
                authentication_status="NOT_VERIFIED",
                authentication_score=0.42,
                final_decision="COUNTERFEIT / UNKNOWN",
                physical_decision="NOT_VERIFIED",
                digital_decision="N/A",
                confidence="LOW",
                timestamp="2026-01-01T12:00:00",
                image_hash="hash",
            )
            ids.add(inc.incident_id)
        assert len(ids) == 5, "All incident IDs should be unique"

    def test_incident_persists_to_disk(self, tmp_storage):
        mgr = IncidentManager(storage_dir=tmp_storage)
        inc = mgr.create_incident(
            product_id="P002",
            authentication_status="SUSPICIOUS",
            authentication_score=0.61,
            final_decision="COUNTERFEIT / DIGITAL_ID_INVALID",
            physical_decision="VERIFIED",
            digital_decision="INVALID",
            confidence="MEDIUM",
            timestamp="2026-06-15T08:30:00",
            image_hash="deadbeef",
        )
        # Re-create manager to simulate new process
        mgr2 = IncidentManager(storage_dir=tmp_storage)
        loaded = mgr2.get_incident(inc.incident_id)
        assert loaded is not None
        assert loaded.product_id == "P002"
        assert loaded.authentication_score == pytest.approx(0.61)

    def test_counter_persists_across_instances(self, tmp_storage):
        mgr1 = IncidentManager(storage_dir=tmp_storage)
        inc1 = mgr1.create_incident(
            product_id="P003",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.3,
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-01-01T00:00:00",
            image_hash="h1",
        )

        mgr2 = IncidentManager(storage_dir=tmp_storage)
        inc2 = mgr2.create_incident(
            product_id="P004",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.2,
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-01-01T01:00:00",
            image_hash="h2",
        )

        n1 = int(inc1.incident_id.split("-")[-1])
        n2 = int(inc2.incident_id.split("-")[-1])
        assert n2 == n1 + 1

    def test_status_change_persists(self, tmp_storage):
        mgr = IncidentManager(storage_dir=tmp_storage)
        inc = mgr.create_incident(
            product_id="P005",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.1,
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-01-01T00:00:00",
            image_hash="h3",
        )
        assert inc.status == "NEW"

        inc.status = "CONFIRMED_COUNTERFEIT"
        mgr.update_incident(inc)

        reloaded = mgr.get_incident(inc.incident_id)
        assert reloaded.status == "CONFIRMED_COUNTERFEIT"

    def test_list_incidents_returns_all(self, tmp_storage):
        mgr = IncidentManager(storage_dir=tmp_storage)
        for i in range(3):
            mgr.create_incident(
                product_id=f"P00{i}",
                authentication_status="NOT_VERIFIED",
                authentication_score=0.5,
                final_decision="COUNTERFEIT / UNKNOWN",
                physical_decision="NOT_VERIFIED",
                digital_decision="N/A",
                confidence="LOW",
                timestamp="2026-01-01T00:00:00",
                image_hash=f"hash{i}",
            )
        incidents = mgr.list_incidents()
        assert len(incidents) == 3

    def test_count(self, tmp_storage):
        mgr = IncidentManager(storage_dir=tmp_storage)
        assert mgr.count() == 0
        mgr.create_incident(
            product_id="P001",
            authentication_status="NOT_VERIFIED",
            authentication_score=0.4,
            final_decision="COUNTERFEIT / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            confidence="LOW",
            timestamp="2026-01-01T00:00:00",
            image_hash="h",
        )
        assert mgr.count() == 1
