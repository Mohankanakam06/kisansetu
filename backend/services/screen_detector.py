import cv2
import numpy as np
import logging

from backend.services.image_utils import decode_image_bgr

logger = logging.getLogger("kisansetu.screen_detector")

def decode_image(image_input):
    """
    Accepts raw bytes, base64 data URL, or standard base64 string and returns OpenCV BGR image.
    """
    return decode_image_bgr(image_input)

def detect_moire_pattern(gray_img):
    """
    Analyzes 2D Fast Fourier Transform (FFT) spectrum of the image to detect
    high-frequency periodic spikes characteristic of digital screen subpixel grids.
    """
    try:
        h, w = gray_img.shape
        # Resize to fixed dimension for consistent FFT spectral analysis
        dim = 512
        resized = cv2.resize(gray_img, (dim, dim))

        # Compute 2D FFT and shift zero-frequency component to center
        f = np.fft.fft2(resized.astype(np.float32))
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-7)

        # Mask out DC and low frequencies (center circle of radius 35)
        center = dim // 2
        y, x = np.ogrid[:dim, :dim]
        dist_from_center = np.sqrt((x - center)**2 + (y - center)**2)
        high_pass_mask = dist_from_center > 35

        high_freq_spectrum = magnitude_spectrum * high_pass_mask

        # Look for anomalous peak clusters (spikes > 3.2 standard deviations above high-freq mean)
        mean_val = np.mean(high_freq_spectrum[high_pass_mask])
        std_val = np.std(high_freq_spectrum[high_pass_mask]) + 1e-6
        peak_count = np.sum(high_freq_spectrum > (mean_val + 3.2 * std_val))

        # Normalize score between 0.0 and 1.0
        moire_score = min(1.0, max(0.0, float(peak_count) / 450.0))
        return moire_score, int(peak_count)
    except Exception as e:
        logger.warning(f"Moiré detection error: {e}")
        return 0.0, 0

def detect_specular_glare(bgr_img):
    """
    Examines HSV V-channel and Saturation to find high-intensity specular reflection
    clusters with sharp gradient edges, common in screen captures under ambient light.
    """
    try:
        hsv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)

        # Screen glare highlights: high brightness (V > 238) and low saturation (S < 35)
        glare_mask = (v > 238) & (s < 35)
        glare_pixels = np.sum(glare_mask)
        total_pixels = bgr_img.shape[0] * bgr_img.shape[1]
        glare_ratio = glare_pixels / float(total_pixels)

        # Calculate edge sharpness around glare areas
        glare_uint8 = (glare_mask * 255).astype(np.uint8)
        contours, _ = cv2.findContours(glare_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        sharp_glare_clusters = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 100: # Significant cluster
                perimeter = cv2.arcLength(cnt, True)
                if perimeter > 0:
                    compactness = (perimeter ** 2) / (4 * np.pi * area)
                    if compactness > 1.8: # Irregular reflection hotspot
                        sharp_glare_clusters += 1

        # Combined glare score
        glare_score = min(1.0, max(0.0, (glare_ratio * 15.0) + (sharp_glare_clusters * 0.12)))
        return glare_score, float(glare_ratio)
    except Exception as e:
        logger.warning(f"Glare detection error: {e}")
        return 0.0, 0.0

def detect_screen_bezel(bgr_img):
    """
    Performs edge detection and contour approximation to identify nested rectangular
    monitor/phone bezel borders in the camera frame.
    """
    try:
        gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        img_area = bgr_img.shape[0] * bgr_img.shape[1]

        bezel_candidates = 0
        for cnt in contours:
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

            # Rectangular contour with 4 vertices
            if len(approx) == 4:
                area = cv2.contourArea(approx)
                # Bezel must occupy between 12% and 92% of the frame
                if 0.12 * img_area < area < 0.92 * img_area:
                    x, y, w, h = cv2.boundingRect(approx)
                    aspect_ratio = float(w) / float(h) if h > 0 else 0
                    # Common screen aspect ratios: 16:9 (1.77), 4:3 (1.33), 19.5:9 (2.16)
                    if 0.45 <= aspect_ratio <= 2.3:
                        bezel_candidates += 1

        bezel_score = min(1.0, bezel_candidates * 0.45)
        return bezel_score, bezel_candidates
    except Exception as e:
        logger.warning(f"Bezel detection error: {e}")
        return 0.0, 0

def analyze_screen_recapture(image_input):
    """
    Main classical CV entrypoint combining Moiré FFT, Glare HSV, and Bezel contour analysis.
    Returns screen_recapture_score (0.0 to 1.0) and flag for manual review.
    """
    img = decode_image(image_input)
    if img is None:
        return {
            "screen_recapture_score": 0.0,
            "flagged_for_review": False,
            "risk_level": "LOW",
            "details": {"error": "Could not decode image for CV analysis"}
        }

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    moire_score, peak_count = detect_moire_pattern(gray)
    glare_score, glare_ratio = detect_specular_glare(img)
    bezel_score, bezel_count = detect_screen_bezel(img)

    # Weighted composite score
    composite_score = (0.45 * moire_score) + (0.35 * glare_score) + (0.20 * bezel_score)
    composite_score = round(min(1.0, max(0.0, composite_score)), 3)

    flagged = composite_score >= 0.65
    risk = "HIGH" if composite_score >= 0.65 else "MEDIUM" if composite_score >= 0.40 else "LOW"

    return {
        "screen_recapture_score": composite_score,
        "flagged_for_review": flagged,
        "risk_level": risk,
        "breakdown": {
            "moire_score": round(moire_score, 3),
            "moire_peaks": peak_count,
            "glare_score": round(glare_score, 3),
            "glare_ratio": round(glare_ratio, 4),
            "bezel_score": round(bezel_score, 3),
            "bezel_contours": bezel_count
        }
    }
