import logging
import imagehash

from backend.services.image_utils import decode_image_pil

logger = logging.getLogger("kisansetu.phash_service")

# In-memory mock database for perceptual hashes
# In production, this would be a PostGIS/PostgreSQL table:
# CREATE TABLE produce_image_hashes (listing_id varchar, photo_hash varchar, created_at timestamp);
HASH_DB = [
    # Examples of seed duplicate hashes
    {"listing_id": "list-demo-01", "hash": "ffff00000000ffff"},
    {"listing_id": "list-demo-02", "hash": "f0f0f0f00f0f0f0f"},
]

def get_pil_image(image_input):
    return decode_image_pil(image_input)

def compute_phash(image_input):
    """
    Computes a 64-bit Discrete Cosine Transform (DCT) based perceptual hash.
    Resilient to scaling, minor crops, and slight color alterations.
    """
    try:
        pil_img = get_pil_image(image_input)
        if pil_img is None:
            return None

        # pHash provides robustness against format changes and minor edits
        h = imagehash.phash(pil_img, hash_size=8, highfreq_factor=4)
        return str(h)
    except Exception as e:
        logger.error(f"pHash computation failed: {e}")
        return None

def hamming_distance(hash1_str, hash2_str):
    """
    Computes the Hamming distance between two hex string hashes.
    """
    try:
        h1 = imagehash.hex_to_hash(hash1_str)
        h2 = imagehash.hex_to_hash(hash2_str)
        return h1 - h2
    except Exception:
        return 64 # Max distance on failure

def check_duplicate_image(image_input, threshold=10):
    """
    Compares the incoming image pHash against the internal database.
    If the minimum Hamming distance < 5: likely an exact structural duplicate.
    If 5 <= dist < 10: heavily cropped, resized, or filtered variant.
    """
    new_hash_str = compute_phash(image_input)
    if not new_hash_str:
        return {"is_duplicate": False, "error": "HASH_FAILED"}

    min_dist = 64
    closest_match_id = None
    closest_hash = None

    for record in HASH_DB:
        dist = hamming_distance(new_hash_str, record["hash"])
        if dist < min_dist:
            min_dist = dist
            closest_match_id = record["listing_id"]
            closest_hash = record["hash"]

    is_dup = min_dist < threshold

    # Normally we would persist the new hash here if not a duplicate
    # if not is_dup:
    #     save_to_db(new_hash_str, listing_id)

    return {
        "is_duplicate": is_dup,
        "new_hash": new_hash_str,
        "closest_match_id": closest_match_id if is_dup else None,
        "closest_match_hash": closest_hash if is_dup else None,
        "hamming_distance": min_dist
    }
