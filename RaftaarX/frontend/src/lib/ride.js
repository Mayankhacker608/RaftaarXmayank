const CITY_POINTS = {
  "Indore Rajwada": { lat: 22.7196, lng: 75.8577 },
  "Vijay Nagar Square": { lat: 22.7533, lng: 75.8937 },
  "Palasia Square": { lat: 22.7246, lng: 75.8839 },
  "Bhawarkuan": { lat: 22.6928, lng: 75.8673 },
  "Geeta Bhawan": { lat: 22.7106, lng: 75.879 },
  "Airport Road": { lat: 22.7282, lng: 75.8011 },
  "MR 10 Bridge": { lat: 22.7518, lng: 75.8382 },
  "LIG Square": { lat: 22.7296, lng: 75.8928 },
  "Annapurna Temple": { lat: 22.7016, lng: 75.8418 },
  "Rau Circle": { lat: 22.6403, lng: 75.8061 },
  "Bapat Square": { lat: 22.7455, lng: 75.9108 },
  "Khajrana Square": { lat: 22.7201, lng: 75.9061 },
};

const VEHICLE_BASE = {
  bike: 35,
  auto: 55,
  cab: 80,
};

const VEHICLE_RATE = {
  bike: 10,
  auto: 14,
  cab: 18,
};

function normalize(text) {
  return text.trim().toLowerCase();
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function getLocationPoint(label) {
  if (CITY_POINTS[label]) {
    return { label, ...CITY_POINTS[label] };
  }

  const labels = Object.keys(CITY_POINTS);
  const match = labels.find((item) => normalize(item) === normalize(label));

  if (match) {
    return { label: match, ...CITY_POINTS[match] };
  }

  return null;
}

export function suggestLocations(query) {
  const value = normalize(query || "");

  return Object.keys(CITY_POINTS)
    .filter((location) => normalize(location).includes(value))
    .slice(0, 5);
}

export function calculateDistanceKm(start, end) {
  if (!start || !end) {
    return 0;
  }

  const earthRadiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(1));
}

export function calculateFare(vehicle, distanceKm) {
  const base = VEHICLE_BASE[vehicle] || 30;
  const rate = VEHICLE_RATE[vehicle] || 10;

  return Math.round(base + distanceKm * rate);
}

export function calculateDurationMinutes(vehicle, distanceKm) {
  const averageSpeeds = {
    bike: 24,
    auto: 19,
    cab: 22,
  };
  const speed = averageSpeeds[vehicle] || 20;
  const rideMinutes = (distanceKm / speed) * 60;

  return Math.max(6, Math.round(rideMinutes + 4));
}

export function buildRideSuggestions(vehicle, distanceKm) {
  const suggestions = [];

  if (distanceKm <= 3) {
    suggestions.push("Short city hop hai, pickup usually fast milta hai.");
  } else if (distanceKm >= 8) {
    suggestions.push("Longer route ke liye comfort aur luggage ko dhyan me rakhna better rahega.");
  }

  if (vehicle === "bike") {
    suggestions.push("Bike traffic-heavy corridors me sabse quick arrival deti hai.");
  }

  if (vehicle === "cab") {
    suggestions.push("Cab suited hai agar aapko smoother ride aur extra comfort chahiye.");
  }

  if (vehicle === "auto") {
    suggestions.push("Auto mid-range routes ke liye balanced and budget-friendly option hota hai.");
  }

  if (!suggestions.length) {
    suggestions.push("Current route aur vehicle pairing practical lag rahi hai.");
  }

  return suggestions;
}

export const mockLocations = Object.keys(CITY_POINTS);
