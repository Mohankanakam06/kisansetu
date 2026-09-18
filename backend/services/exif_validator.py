import math
import logging
from datetime import datetime
from PIL import Image, ExifTags
import io
import json

logger = logging.getLogger("kisansetu.exif_validator")

# GPS constants
GPS_LAT_REF = 1
GPS_LAT = 2
GPS_LON_REF = 3
GPS_LON = 4
GPS_TIMESTAMP = 7

def get_decimal_from_dms(dms, ref):
    degrees = float(dms[0])
    minutes = float(dms[1])
    seconds = float(dms[2])
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ['S', 'W']:
        decimal = -decimal
    return decimal

def haversine(lat1, lon1, lat2, lon2):
    R = 6371 * 1000  # Earth radius in meters
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def validate(image_bytes, farmer_lat, farmer_lng, drift_radius=200):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif = img._getexif()
        if not exif:
            return {"valid": False, "error": "ERR_NO_EXIF"}

        # Parse EXIF
        exif_data = {ExifTags.TAGS.get(k, k): v for k, v in exif.items()}

        # GPSInfo is a dict with keys as INTs, need to map to TAGS if possible,
        # but PIL's _getexif() returns them indexed by ID.
        # ExifTags.GPSTAGS maps ID to name, but for parsing we need IDs.
        gps_info = exif_data.get('GPSInfo')
        if not gps_info:
            return {"valid": False, "error": "ERR_NO_GPS"}

        # Parse based on standard EXIF GPS IDs
        lat_dms = gps_info.get(GPS_LAT)
        lat_ref = gps_info.get(GPS_LAT_REF)
        lon_dms = gps_info.get(GPS_LON)
        lon_ref = gps_info.get(GPS_LON_REF)

        if not lat_dms or not lat_ref or not lon_dms or not lon_ref:
            return {"valid": False, "error": "ERR_NO_GPS"}

        lat = get_decimal_from_dms(lat_dms, lat_ref)
        lng = get_decimal_from_dms(lon_dms, lon_ref)

        # Distance
        dist = haversine(lat, lng, farmer_lat, farmer_lng)
        if dist > drift_radius:
            return {"valid": False, "error": "ERR_LOCATION_MISMATCH", "details": f"Drift: {dist:.1f}m"}

        # Timestamp
        date_str = exif_data.get('DateTimeOriginal') or exif_data.get('DateTime')
        if not date_str:
            return {"valid": False, "error": "ERR_NO_TIMESTAMP"}

        # Parse timestamp (YYYY:MM:DD HH:MM:SS)
        photo_ts = datetime.strptime(str(date_str), '%Y:%m:%d %H:%M:%S')
        now = datetime.now()

        if (now - photo_ts).total_seconds() > 30 * 60:
            return {"valid": False, "error": "ERR_STALE_TIMESTAMP"}

        return {"valid": True, "data": {"lat": lat, "lng": lng, "timestamp": str(photo_ts), "raw_exif": str(exif_data)}}
    except Exception as e:
        logger.error(f"EXIF extraction error: {e}")
        return {"valid": False, "error": "ERR_EXIF_EXTRACTION_FAILURE"}
