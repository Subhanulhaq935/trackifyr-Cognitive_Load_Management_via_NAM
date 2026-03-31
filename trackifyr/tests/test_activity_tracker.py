"""Unit tests for activity_tracker JSON streaming (no pynput listeners)."""

from __future__ import annotations

import io
import json
import sys
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
# Repo root: trackifyr/
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from activity_tracker import ActivityTracker  # noqa: E402


class TestActivityTracker(unittest.TestCase):
    def test_calculate_activity_percentage_bounds(self):
        t = ActivityTracker(interval_seconds=10)
        self.assertEqual(t.calculate_activity_percentage(0, 10), 0.0)
        self.assertEqual(t.calculate_activity_percentage(10, 10), 100.0)
        self.assertEqual(t.calculate_activity_percentage(5, 10), 50.0)
        self.assertEqual(t.calculate_activity_percentage(1, 0), 0.0)

    def test_invalid_interval_raises(self):
        with self.assertRaises(ValueError):
            ActivityTracker(interval_seconds=0)

    def test_generate_summary_json_schema_and_reset(self):
        t = ActivityTracker(interval_seconds=10)
        t.active_seconds.update({100, 101, 102})
        t.mouse_events = 3
        t.keyboard_events = 2

        buf = io.StringIO()
        with redirect_stdout(buf):
            t.generate_summary(100.0, 110.0)

        line = buf.getvalue().strip()
        data = json.loads(line)
        self.assertIn("timestamp", data)
        self.assertEqual(data["active_seconds"], 3)
        self.assertEqual(data["mouse_events"], 3)
        self.assertEqual(data["keyboard_events"], 2)
        self.assertAlmostEqual(data["activity_percentage"], (3 / 10.0) * 100.0, places=5)
        self.assertIsInstance(data["timestamp"], (int, float))

        self.assertEqual(t.mouse_events, 0)
        self.assertEqual(t.keyboard_events, 0)
        self.assertEqual(len(t.active_seconds), 0)

    def test_generate_summary_invalid_range_no_stdout(self):
        t = ActivityTracker(interval_seconds=10)
        buf = io.StringIO()
        err = io.StringIO()
        with redirect_stdout(buf):
            with redirect_stderr(err):
                t.generate_summary(10.0, 10.0)
        self.assertEqual(buf.getvalue(), "")
        self.assertIn("Invalid", err.getvalue())


if __name__ == "__main__":
    unittest.main()
