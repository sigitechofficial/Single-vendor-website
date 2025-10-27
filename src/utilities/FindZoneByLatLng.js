/**
 * Function to check if a point is inside a polygon using the Ray-Casting algorithm
 * @param {number} lat - The latitude of the user's location
 * @param {number} lng - The longitude of the user's location
 * @param {Array} polygonCoordinates - Array of coordinates for the polygon (zone)
 * @returns {boolean} - Returns true if the point is inside the polygon, false otherwise
 */
const isPointInPolygon = (lat, lng, polygonCoordinates) => {
  let inside = false;
  const x = lng;
  const y = lat;

  for (
    let i = 0, j = polygonCoordinates.length - 1;
    i < polygonCoordinates.length;
    j = i++
  ) {
    const xi = polygonCoordinates[i][1], // Longitude
      yi = polygonCoordinates[i][0]; // Latitude
    const xj = polygonCoordinates[j][1], // Longitude
      yj = polygonCoordinates[j][0]; // Latitude

    // Check if point is on the vertex
    if ((xi === x && yi === y) || (xj === x && yj === y)) {
      return true;
    }

    // Ray-Casting algorithm
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
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

const findZoneByCoordinates = async (zoneList, type, loc) => {
  if (type === "cart") {
    if (Array.isArray(zoneList?.coordinates)) {
      const coordinates = zoneList?.coordinates[0];
      const correctedCoordinates = coordinates?.map((coord) => [
        coord[0], // Swap lat and lng here
        coord[1],
      ]);

      if (isPointInPolygon(loc?.lat, loc?.lng, correctedCoordinates)) {
        return true;
      }
    } else {
      console.warn("Zone coordinates are missing or invalid:");
    }

    return false; // Return false if not inside any zone
  } else {
    const userLocation = await getUserLocation();

    if (!Array.isArray(zoneList)) {
      console.error("zoneList should be an array");
      return null;
    }

    for (let zone of zoneList) {
      if (
        zone &&
        zone.coordinates &&
        Array.isArray(zone?.coordinates?.coordinates)
      ) {
        const coordinates = zone?.coordinates?.coordinates[0];
        const correctedCoordinates = coordinates.map((coord) => [
          coord[0],
          coord[1],
        ]);

        // Check if the user's coordinates are inside this zone's polygon
        if (
          isPointInPolygon(
            userLocation.lat,
            userLocation.lng,
            correctedCoordinates
          )
        ) {
          return zone?.id; // Return the zone ID if inside the zone
        }
      } else {
        console.warn("Zone coordinates are missing or invalid:", zone);
      }
    }

    return null; // If the point is not in any zone, return null
  }
};

export default findZoneByCoordinates;
