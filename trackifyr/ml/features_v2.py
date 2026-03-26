"""v2: MediaPipe Face Landmarker (Tasks API) — EAR-style blink proxy, head/mouth heuristics."""

from __future__ import annotations

import os
from collections import deque
from pathlib import Path

import cv2
import numpy as np

from ml.mediapipe_face import (
    create_landmarker_image,
    create_landmarker_video,
    ensure_face_landmarker_model,
    frame_to_mp_image,
)

NUM_SAMPLE_FRAMES = 16

# Landmark indices (MediaPipe face mesh / landmarker topology)
_LEFT_EYE = [33, 160, 158, 133, 153, 144]
_RIGHT_EYE = [362, 385, 387, 263, 373, 380]
_MOUTH_VERT = [13, 14]
_NOSE_TIP = 1
_CHIN = 152
_LEFT_FACE = 234
_RIGHT_FACE = 454


def _eye_aspect_ratio(lm, w: int, h: int, indices: list[int]) -> float:
    pts = np.array([[lm[i].x * w, lm[i].y * h] for i in indices], dtype=np.float64)
    v1 = np.linalg.norm(pts[1] - pts[5])
    v2 = np.linalg.norm(pts[2] - pts[4])
    h_line = np.linalg.norm(pts[0] - pts[3])
    if h_line < 1e-6:
        return 0.0
    return float((v1 + v2) / (2.0 * h_line))


def _mouth_open_ratio(lm, w: int, h: int) -> float:
    a = np.array([lm[_MOUTH_VERT[0]].x * w, lm[_MOUTH_VERT[0]].y * h])
    b = np.array([lm[_MOUTH_VERT[1]].x * w, lm[_MOUTH_VERT[1]].y * h])
    nose = np.array([lm[_NOSE_TIP].x * w, lm[_NOSE_TIP].y * h])
    chin = np.array([lm[_CHIN].x * w, lm[_CHIN].y * h])
    face_h = np.linalg.norm(nose - chin) + 1e-6
    return float(np.linalg.norm(a - b) / face_h)


def _head_yaw_proxy(lm, w: int, h: int) -> float:
    lx = lm[_LEFT_FACE].x * w
    rx = lm[_RIGHT_FACE].x * w
    nx = lm[_NOSE_TIP].x * w
    mid = 0.5 * (lx + rx)
    span = abs(rx - lx) + 1e-6
    return float((nx - mid) / span)


def _per_frame_feats(lm_list, w: int, h: int) -> np.ndarray:
    ear_l = _eye_aspect_ratio(lm_list, w, h, _LEFT_EYE)
    ear_r = _eye_aspect_ratio(lm_list, w, h, _RIGHT_EYE)
    mouth = _mouth_open_ratio(lm_list, w, h)
    yaw = _head_yaw_proxy(lm_list, w, h)
    return np.array([ear_l, ear_r, 0.5 * (ear_l + ear_r), mouth, yaw], dtype=np.float32)


class FaceMeshExtractor:
    """Face landmarks via MediaPipe Tasks (image or video running mode)."""

    def __init__(self, static_image: bool) -> None:
        model_path = ensure_face_landmarker_model()
        if static_image:
            self._det = create_landmarker_image(model_path)
            self._video = False
            self._ts = 0
        else:
            self._det = create_landmarker_video(model_path)
            self._video = True
            self._ts = 0

    def close(self) -> None:
        self._det.close()

    def process_frame(self, frame_bgr: np.ndarray) -> np.ndarray | None:
        h, w = frame_bgr.shape[:2]
        if self._video:
            self._ts += 33
            res = self._det.detect_for_video(frame_to_mp_image(frame_bgr), self._ts)
        else:
            res = self._det.detect(frame_to_mp_image(frame_bgr))
        if not res.face_landmarks:
            return None
        lm = res.face_landmarks[0]
        max_i = max(_LEFT_EYE + _RIGHT_EYE + _MOUTH_VERT + [_NOSE_TIP, _CHIN, _LEFT_FACE, _RIGHT_FACE])
        if len(lm) <= max_i:
            return None
        return _per_frame_feats(lm, w, h)


def extract_features_v2(video_path: Path, extractor: FaceMeshExtractor | None = None) -> np.ndarray | None:
    path = str(video_path)
    if not os.path.isfile(path):
        return None
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None
    n_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    if n_frames <= 0:
        cap.release()
        return None

    if n_frames <= NUM_SAMPLE_FRAMES:
        indices = list(range(n_frames))
    else:
        indices = [int(round(i)) for i in np.linspace(0, n_frames - 1, NUM_SAMPLE_FRAMES)]

    own = extractor is None
    if own:
        extractor = FaceMeshExtractor(static_image=True)

    per_frame: list[np.ndarray] = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        row = extractor.process_frame(frame)
        if row is not None:
            per_frame.append(row)

    cap.release()
    if own:
        extractor.close()

    return v2_aggregate(per_frame, n_frames)


def v2_aggregate(per_frame: list[np.ndarray], total_frames_hint: int) -> np.ndarray | None:
    if len(per_frame) < 2:
        return None
    X = np.stack(per_frame, axis=0)
    mean = X.mean(axis=0)
    std = X.std(axis=0)
    ear_mean = 0.5 * (mean[0] + mean[1])
    ear_std = 0.5 * (std[0] + std[1])
    ear_seq = X[:, 2]
    blink_proxy = float(np.sum(ear_seq < (ear_mean - 0.5 * (ear_std + 1e-6)))) / max(len(ear_seq), 1)
    feat = np.concatenate(
        [
            mean,
            std,
            np.array(
                [
                    blink_proxy,
                    float(total_frames_hint),
                    float(np.ptp(ear_seq)),
                    float(np.mean(np.abs(np.diff(ear_seq)))),
                ],
                dtype=np.float32,
            ),
        ]
    )
    return feat.astype(np.float32)


class V2Rolling:
    """Recent per-frame v2 vectors for live inference."""

    def __init__(self, maxlen: int = NUM_SAMPLE_FRAMES) -> None:
        self._buf: deque[np.ndarray] = deque(maxlen=maxlen)
        self._frame_count = 0

    def update(self, row: np.ndarray | None) -> np.ndarray | None:
        self._frame_count += 1
        if row is not None:
            self._buf.append(row)
        if len(self._buf) < 4:
            return None
        return v2_aggregate(list(self._buf), self._frame_count)
