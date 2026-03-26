"""Download + wrap MediaPipe Face Landmarker (Tasks API, mediapipe >= 0.10)."""

from __future__ import annotations

import urllib.request
from pathlib import Path

import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

MODEL_DIR = Path(__file__).resolve().parent / "mediapipe_models"
MODEL_NAME = "face_landmarker.task"
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
)


def ensure_face_landmarker_model() -> Path:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    path = MODEL_DIR / MODEL_NAME
    if path.is_file() and path.stat().st_size > 1_000_000:
        return path
    print(f"Downloading MediaPipe face landmarker to {path} ...")
    urllib.request.urlretrieve(MODEL_URL, path)
    return path


def create_landmarker_image(model_path: Path) -> vision.FaceLandmarker:
    opts = vision.FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
        running_mode=vision.RunningMode.IMAGE,
        num_faces=1,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
        output_face_blendshapes=False,
    )
    return vision.FaceLandmarker.create_from_options(opts)


def create_landmarker_video(model_path: Path) -> vision.FaceLandmarker:
    opts = vision.FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
        running_mode=vision.RunningMode.VIDEO,
        num_faces=1,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
        output_face_blendshapes=False,
    )
    return vision.FaceLandmarker.create_from_options(opts)


def frame_to_mp_image(frame_bgr) -> mp.Image:
    import cv2

    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
