"""v1: Lightweight OpenCV grayscale statistics (no face model)."""

from __future__ import annotations

import os
from pathlib import Path

import cv2
import numpy as np

NUM_SAMPLE_FRAMES = 10
RESIZE = 64


def extract_features_v1(video_path: Path) -> np.ndarray | None:
    path = str(video_path)
    if not os.path.isfile(path):
        return None

    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None

    n_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    fps = float(cap.get(cv2.CAP_PROP_FPS)) or 0.0

    if n_frames <= 0:
        cap.release()
        return None

    if n_frames <= NUM_SAMPLE_FRAMES:
        indices = list(range(n_frames))
    else:
        indices = [int(round(i)) for i in np.linspace(0, n_frames - 1, NUM_SAMPLE_FRAMES)]

    means: list[float] = []
    stds: list[float] = []
    prev_mean: float | None = None
    diffs: list[float] = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, (RESIZE, RESIZE), interpolation=cv2.INTER_AREA)
        m = float(np.mean(gray))
        s = float(np.std(gray))
        means.append(m)
        stds.append(s)
        if prev_mean is not None:
            diffs.append(abs(m - prev_mean))
        prev_mean = m

    cap.release()

    if len(means) < 3:
        return None

    return v1_vector_from_series(means, stds, fps=fps, n_frames_reported=float(n_frames))


def v1_vector_from_series(
    means: list[float],
    stds: list[float],
    fps: float = 30.0,
    n_frames_reported: float | None = None,
) -> np.ndarray:
    """Build the v1 feature vector from per-frame mean/std lists (webcam: rolling window)."""
    if len(means) < 3:
        means = list(means) + [means[-1]] * (3 - len(means)) if means else [0.0, 0.0, 0.0]
        stds = list(stds) + [stds[-1]] * (3 - len(stds)) if stds else [0.0, 0.0, 0.0]
    nfr = float(len(means)) if n_frames_reported is None else n_frames_reported
    prev_mean: float | None = None
    diffs: list[float] = []
    for m in means:
        if prev_mean is not None:
            diffs.append(abs(m - prev_mean))
        prev_mean = m
    means = means[:NUM_SAMPLE_FRAMES]
    stds = stds[:NUM_SAMPLE_FRAMES]
    while len(means) < NUM_SAMPLE_FRAMES:
        means.append(means[-1])
        stds.append(stds[-1])
    feat: list[float] = [
        fps,
        nfr,
        float(np.mean(means)),
        float(np.std(means)),
        float(np.mean(stds)),
        float(np.std(stds)),
        float(np.mean(diffs)) if diffs else 0.0,
        float(np.std(diffs)) if diffs else 0.0,
    ]
    feat.extend(means)
    feat.extend(stds)
    return np.array(feat, dtype=np.float32)


def frame_mean_std(frame_bgr: np.ndarray) -> tuple[float, float]:
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (RESIZE, RESIZE), interpolation=cv2.INTER_AREA)
    return float(np.mean(gray)), float(np.std(gray))
