"""v3: MobileNetV3-small + GRU temporal head; GPU for train/infer when available."""

from __future__ import annotations

import os
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision.models import MobileNet_V3_Small_Weights, mobilenet_v3_small

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(3, 1, 1)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(3, 1, 1)

NUM_TEMPORAL_FRAMES = 16
INPUT_SIZE = 112


class CognitiveLoadNet3(nn.Module):
    def __init__(self, n_classes: int = 3, hidden: int = 128, dropout: float = 0.35, pretrained: bool = True):
        super().__init__()
        w = MobileNet_V3_Small_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = mobilenet_v3_small(weights=w)
        self.features = backbone.features
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.gru = nn.GRU(576, hidden, batch_first=True)
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden, n_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, t, c, h, w = x.shape
        u = x.view(b * t, c, h, w)
        feat = self.features(u)
        feat = self.pool(feat).flatten(1)
        feat = feat.view(b, t, -1)
        out, _ = self.gru(feat)
        return self.fc(self.dropout(out[:, -1]))


def load_clip_tensor_v3(video_path: Path, t: int = NUM_TEMPORAL_FRAMES, size: int = INPUT_SIZE) -> torch.Tensor | None:
    """Return tensor (T, 3, H, W) float32 normalized, or None."""
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
    if n_frames <= t:
        indices = list(range(n_frames))
    else:
        indices = [int(round(i)) for i in np.linspace(0, n_frames - 1, t)]

    frames: list[np.ndarray] = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb = cv2.resize(rgb, (size, size), interpolation=cv2.INTER_AREA)
        x = rgb.astype(np.float32) / 255.0
        x = np.transpose(x, (2, 0, 1))
        x = (x - IMAGENET_MEAN) / IMAGENET_STD
        frames.append(x)
    cap.release()
    if len(frames) < max(4, t // 2):
        return None
    while len(frames) < t:
        frames.append(frames[-1].copy())
    frames = frames[:t]
    return torch.from_numpy(np.stack(frames, axis=0))


def frame_to_tensor_v3(frame_bgr: np.ndarray, size: int = INPUT_SIZE) -> torch.Tensor:
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    rgb = cv2.resize(rgb, (size, size), interpolation=cv2.INTER_AREA)
    x = rgb.astype(np.float32) / 255.0
    x = np.transpose(x, (2, 0, 1))
    x = (x - IMAGENET_MEAN) / IMAGENET_STD
    return torch.from_numpy(x)


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


class V3FrameBuffer:
    def __init__(self, maxlen: int = NUM_TEMPORAL_FRAMES) -> None:
        self._frames: list[torch.Tensor] = []
        self._max = maxlen

    def push(self, frame_tensor_chw: torch.Tensor) -> torch.Tensor | None:
        self._frames.append(frame_tensor_chw)
        if len(self._frames) > self._max:
            self._frames = self._frames[-self._max :]
        if len(self._frames) < self._max:
            return None
        return torch.stack(self._frames, dim=0)
