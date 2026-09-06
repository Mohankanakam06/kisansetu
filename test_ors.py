import os, requests
from dotenv import load_dotenv
load_dotenv()

ORS_KEY = os.environ.get("ORS_API_KEY")
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

coords = [[72.8618, 22.6939], [72.8600, 22.6900]]
print("Testing ORS API with key:", ORS_KEY[:10] + "..." if ORS_KEY else "None")

try:
    resp = requests.post(
        ORS_URL,
        headers={"Authorization": ORS_KEY, "Content-Type": "application/json"},
        json={"coordinates": coords},
        timeout=10,
    )
    print("Status:", resp.status_code)
    print("Response:", resp.text[:300])
except Exception as e:
    print("Error:", e)
