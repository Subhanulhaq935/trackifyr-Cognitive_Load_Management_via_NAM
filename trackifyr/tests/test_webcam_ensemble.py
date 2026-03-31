"""Tests for webcam ensemble logic (no torch/webcam imports required)."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ml.ensemble_vote import ensemble_final_load  # noqa: E402


class TestEnsembleFinalLoad(unittest.TestCase):
    def test_unanimous(self):
        self.assertEqual(ensemble_final_load("High", "High", "High"), "High")

    def test_majority_two_of_three(self):
        self.assertEqual(ensemble_final_load("Low", "Low", "High"), "Low")
        self.assertEqual(ensemble_final_load("Medium", "High", "High"), "High")

    def test_three_way_tie_prefers_v3_then_v2_then_v1(self):
        self.assertEqual(ensemble_final_load("Low", "Medium", "High"), "High")
        self.assertEqual(ensemble_final_load("Low", "High", "Medium"), "Medium")
        self.assertEqual(ensemble_final_load("High", "Low", "Medium"), "Medium")


if __name__ == "__main__":
    unittest.main()
