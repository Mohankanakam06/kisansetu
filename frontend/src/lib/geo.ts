export interface ReverseGeocodeResult {
  formattedAddress: string;
  district: string;
  state: string;
  pincode?: string;
  village?: string;
}

export async function getCurrentHighAccuracyGPS(): Promise<{ lat: number; lng: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  // First try the free Nominatim OpenStreetMap API
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "hi,mr,en;q=0.9", // Prefer local languages
        // Add minimal User-Agent to comply with Nominatim guidelines
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;

        // Extract village / subdistrict
        const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city;

        // Extract district
        const district = addr.state_district || addr.district || addr.city || "Unknown District";

        // Extract state
        const state = addr.state || "Chhattisgarh"; // fallback if unknown entirely

        // Extract pincode
        const pincode = addr.postcode;

        // Reconstruct formatted address string properly
        const parts = [];
        if (village) parts.push(village);
        if (addr.road || addr.county) parts.push(addr.road || addr.county);
        if (district) parts.push(district);
        if (state) parts.push(state);
        if (pincode) parts.push(pincode);

        const formattedAddress = parts.join(", ");

        return {
          formattedAddress: data.display_name || formattedAddress,
          district,
          state,
          pincode,
          village,
        };
      }
    }
  } catch (error) {
    console.warn("Nominatim reverse geocode failed, falling back to BigDataCloud", error);
  }

  // Fallback to Free BigDataCloud Reverse Geocoding
  try {
    const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const response = await fetch(fallbackUrl);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        const district = data.principalSubdivision || data.city || "Unknown District";
        const state = data.principalSubdivision || "";
        const formattedAddress = [data.locality, data.city, data.principalSubdivision, data.countryName]
          .filter(Boolean)
          .join(", ");

        return {
          formattedAddress: formattedAddress || `GPS Location Area (Near ${district})`,
          district,
          state,
          village: data.locality,
        };
      }
    }
  } catch (error) {
    console.warn("BigDataCloud fallback failed", error);
  }

  // Final deterministic fallback strictly using LatLng for approximate estimation mapping
  return fallbackGeocodeEstimator(lat, lng);
}

// Very basic local fallback box estimators for offline Indian users
function fallbackGeocodeEstimator(lat: number, lng: number): ReverseGeocodeResult {
  let district = "Unknown";
  let state = "Chhattisgarh";
  let formattedAddress = `Farm Gate GPS Pin (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;

  // Extremely rough bounding box checks to give decent mock locations
  if (lat >= 21.0 && lat <= 21.5 && lng >= 81.4 && lng <= 81.8) {
    district = "Raipur";
    formattedAddress = "Raipur Agri Basin, Chhattisgarh";
  } else if (lat >= 21.1 && lat <= 21.3 && lng >= 81.2 && lng <= 81.4) {
    district = "Durg";
    formattedAddress = "Durg Mandi, Chhattisgarh";
  } else if (lat >= 21.9 && lat <= 22.2 && lng >= 81.9 && lng <= 82.3) {
    district = "Bilaspur";
    formattedAddress = "Bilaspur Mandi, Chhattisgarh";
  } else if (lat >= 19.8 && lat <= 20.2 && lng >= 73.6 && lng <= 73.9) {
    district = "Nashik";
    state = "Maharashtra";
    formattedAddress = "Nashik Onion Belt, Maharashtra";
  } else if (lat >= 18.3 && lat <= 18.7 && lng >= 73.7 && lng <= 74.3) {
    district = "Pune";
    state = "Maharashtra";
    formattedAddress = "Pune Region, Maharashtra";
  } else if (lat >= 13.0 && lat <= 13.3 && lng >= 77.5 && lng <= 78.0) {
    district = "Bangalore Rural";
    state = "Karnataka";
    formattedAddress = "Bangalore Rural, Karnataka";
  }

  return {
    formattedAddress,
    district,
    state,
  };
}