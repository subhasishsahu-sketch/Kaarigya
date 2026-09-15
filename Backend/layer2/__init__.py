"""
Kalakriti — Layer 2: Counterfeit Intelligence & Detection System.

Consumes Layer 1 VerificationResult objects and orchestrates the full
counterfeit-intelligence pipeline: location acquisition, incident management,
duplicate detection, visual/geographic clustering, trend analysis, risk scoring,
alert generation, and dashboard reporting.
"""

from layer2.pipeline import run_layer2  # noqa: F401

__all__ = ["run_layer2"]
