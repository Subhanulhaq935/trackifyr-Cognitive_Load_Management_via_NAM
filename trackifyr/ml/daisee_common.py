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


def label_counts_array(y: np.ndarray) -> np.ndarray:
    """Counts per class 0..2 (Low, Medium, High)."""
    return np.bincount(np.asarray(y, dtype=np.int64).ravel(), minlength=3)


def format_label_counts(y: np.ndarray) -> str:
    c = label_counts_array(y)
    return f"Low={c[0]} Medium={c[1]} High={c[2]} (n={len(y)})"


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
    """
    Load the official DAiSEE split from the dataset release (TrainLabels.csv /
    ValidationLabels.csv / TestLabels.csv). Subjects and clips must not be mixed
    across splits; training only on Train (+ Validation for tuning), Test is held out.
    """
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
    """
    Oversample minority classes so each class count matches the largest class.

    Used after featurization for v1/v2 RandomForest training so the model is not
    dominated by the majority class (DAiSEE cognitive_load is mostly Medium).
    """
    y = np.asarray(y, dtype=np.int64).ravel()
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


def per_sample_class_weights(y: np.ndarray) -> np.ndarray:
    """Inverse-frequency weight per row (for WeightedRandomSampler)."""
    y = np.asarray(y, dtype=np.int64).ravel()
    c = label_counts_array(y).astype(np.float64)
    c[c == 0] = 1.0
    inv = 1.0 / c
    return inv[y]
