"""Majority vote over model labels with tie-break v3 > v2 > v1."""

from __future__ import annotations

from collections import Counter


def ensemble_final_load(v1_label: str, v2_label: str, v3_label: str) -> str:
    """Majority vote over Low/Medium/High; ties broken by priority v3 > v2 > v1."""
    cnt = Counter([v1_label, v2_label, v3_label])
    best_n = max(cnt.values())
    top = [lab for lab, n in cnt.items() if n == best_n]
    if len(top) == 1:
        return top[0]
    for pref in (v3_label, v2_label, v1_label):
        if pref in top:
            return pref
    return v3_label
