/**
 * Function to check if a point is inside a polygon using the Ray-Casting algorithm
 * @param {number} lat - The latitude of the user's location
 * @param {number} lng - The longitude of the user's location
 * @param {Array} polygonCoordinates - Array of coordinates for the polygon (zone)
 * @returns {boolean} - Returns true if the point is inside the polygon, false otherwise
 */
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  const x = parseFloat(lat);
  const y = parseFloat(lng);

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

const findZoneByCoordinatesLocal = (zoneList) => {
  const lat = localStorage.getItem("lat");
  const lng = localStorage.getItem("lng");

  if (!Array.isArray(zoneList)) {
    console.error("Invalid zone list");
    return false;
  }

  for (let zone of zoneList) {
    if (
      zone &&
      zone.coordinates &&
      Array.isArray(zone.coordinates.coordinates)
    ) {
      const coordinates = zone.coordinates.coordinates[0];
      const polygon = coordinates.map((coord) => [coord[0], coord[1]]); // [lat, lng]

      if (isPointInPolygon(lat, lng, polygon)) {
        localStorage.setItem("zoneId", zone.id); // :white_check_mark: store zoneId
        return zone.id; // or return true if needed
      }
    } else {
      console.warn("Invalid zone format:", zone);
    }
  }

  localStorage.removeItem("zoneId"); // :x: Not in any zone
  return null;
};

// Get the user's current location (lat, lng)
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true }
      );
    } else {
      reject("Geolocation not supported");
    }
  });
};

export default findZoneByCoordinatesLocal;
