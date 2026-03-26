"""Shared paths, label loading, and cognitive load mapping for DAiSEE."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent.parent
DAISEE_ROOT = SCRIPT_DIR / "DAiSEE"
DATASET_DIR = DAISEE_ROOT / "DataSet"
LABELS_DIR = DAISEE_ROOT / "Labels"
ARTIFACTS_DIR = SCRIPT_DIR / "artifacts" / "daisee"

LABEL_NAMES = ("Low", "Medium", "High")


def strip_columns(df: pd.DataFrame) -> pd.DataFrame:
    return df.rename(columns={c: c.strip() for c in df.columns})


def affect_to_cognitive_load(row: pd.Series) -> int:
    """
    Map DAiSEE ordinal labels (0-3 each) to 0=Low, 1=Medium, 2=High.

    High: Confusion >= 2 or Frustration >= 2
    Low: Boredom >= 2 and Engagement <= 1
    Else: Medium. High overrides Low if both apply.
    """
    b, e, c, f = int(row["Boredom"]), int(row["Engagement"]), int(row["Confusion"]), int(row["Frustration"])
    if c >= 2 or f >= 2:
        return 2
    if b >= 2 and e <= 1:
        return 0
    return 1


def clip_path(split: str, clip_id: str) -> Path:
    stem = Path(clip_id).stem
    subject_id = stem[:6]
    return DATASET_DIR / split / subject_id / stem / clip_id


def load_split(split_name: str) -> pd.DataFrame:
    csv_map = {
        "Train": LABELS_DIR / "TrainLabels.csv",
        "Validation": LABELS_DIR / "ValidationLabels.csv",
        "Test": LABELS_DIR / "TestLabels.csv",
    }
    df = strip_columns(pd.read_csv(csv_map[split_name]))
    df["cognitive_load"] = df.apply(affect_to_cognitive_load, axis=1)
    df["video_path"] = df["ClipID"].apply(lambda cid: clip_path(split_name, cid))
    return df


def weighted_random_oversample(X: np.ndarray, y: np.ndarray, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    """Balance classes for v3 mini-batch training."""
    classes, counts = np.unique(y, return_counts=True)
    max_c = int(counts.max())
    X_out, y_out = [], []
    for c in classes:
        idx = np.where(y == c)[0]
        need = max_c - len(idx)
        X_out.append(X[idx])
        y_out.append(y[idx])
        if need > 0:
            pick = rng.choice(idx, size=need, replace=True)
            X_out.append(X[pick])
            y_out.append(y[pick])
    X_all = np.concatenate(X_out, axis=0)
    y_all = np.concatenate(y_out, axis=0)
    perm = rng.permutation(len(y_all))
    return X_all[perm], y_all[perm]
