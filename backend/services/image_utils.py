"""Shared image decoding helpers.

Several services (calibration, screen-recapture detection, perceptual hashing,
quality grading) each accepted the same three input shapes — raw bytes, a
base64 data URL, or a plain base64 string — with a near-identical copy of the
same decoding code. Centralising it here keeps the accepted inputs consistent
and means a fix (e.g. tolerating whitespace in base64) only has to land once.
"""

import base64
import io
import logging
from typing import Optional

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger("kisansetu.image_utils")


def image_to_bytes(image_input) -> Optional[bytes]:
    """Normalise ``bytes`` / data URL / plain base64 into raw image bytes.

    Returns ``None`` for unsupported types or undecodable base64 so callers can
    keep their existing "no image" handling.
    """
    if isinstance(image_input, bytes):
        return image_input
    if isinstance(image_input, str):
        data = image_input
        if data.startswith("data:"):
            data = data.split(",", 1)[1] if "," in data else data
        try:
            return base64.b64decode(data)
        except Exception as e:
            logger.warning(f"Error decoding base64 image: {e}")
            return None
    return None


def decode_image_bgr(image_input) -> Optional[np.ndarray]:
    """Decode any accepted input to an OpenCV BGR image, or ``None`` on failure."""
    try:
        img_bytes = image_to_bytes(image_input)
        if not img_bytes:
            return None
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        logger.warning(f"Error decoding image: {e}")
        return None


def decode_image_pil(image_input) -> Optional[Image.Image]:
    """Decode any accepted input to a PIL image, or ``None`` on failure."""
    try:
        img_bytes = image_to_bytes(image_input)
        if not img_bytes:
            return None
        return Image.open(io.BytesIO(img_bytes))
    except Exception as e:
        logger.warning(f"Error decoding image to PIL: {e}")
        return None
