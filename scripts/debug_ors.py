import os, requests, json
from dotenv import load_dotenv
load_dotenv()

ORS_KEY = os.environ.get("ORS_API_KEY")
url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

coords = [[72.74183349152568, 22.59173350363753], [72.75775617272143, 22.595883873096934], [72.75931683603876, 22.58336260248549], [72.86, 22.69]]

headers = {
    "Authorization": ORS_KEY,
    "Content-Type": "application/json",
}

# Test with radiuses: -1 or 5000 (ORS allows -1 for unlimited or custom radius up to max)
for radius_val in [2000, 5000, -1]:
    payload = {
        "coordinates": coords,
        "radiuses": [radius_val] * len(coords)
    }
    resp = requests.post(url, headers=headers, json=payload)
    print(f"Radius {radius_val} - Status: {resp.status_code}")
    if resp.status_code == 200:
        print("Success! Distance:", resp.json()["features"][0]["properties"]["summary"]["distance"])
        break
    else:
        print("Response:", resp.text)
