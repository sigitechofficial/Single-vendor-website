// sortingFilters.js

/**
 * Sort restaurants and stores based on selected sorting criteria.
 */
export const sortRestaurantsAndStores = (restaurants, stores, sort) => {
  let sortedRestaurants = [...restaurants];
  let sortedStores = [...stores];

  switch (sort) {
    case "Rating":
      sortedRestaurants.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      sortedStores.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;

    case "Recommended":
      sortedRestaurants.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        if (!a.isOpen && b.isOpen) return 1;
        if (a.isOpen && !b.isOpen) return -1;
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
      sortedStores.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        if (!a.isOpen && b.isOpen) return 1;
        if (a.isOpen && !b.isOpen) return -1;
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
      break;

    case "Delivery Price":
      sortedRestaurants.sort((a, b) => parseFloat(a.deliveryFee) - parseFloat(b.deliveryFee));
      sortedStores.sort((a, b) => parseFloat(a.deliveryFee) - parseFloat(b.deliveryFee));
      break;

    case "Delivery Time":
      sortedRestaurants.sort((a, b) => a.deliveryTime - b.deliveryTime);
      sortedStores.sort((a, b) => a.deliveryTime - b.deliveryTime);
      break;

    case "Distance":
      sortedRestaurants.sort((a, b) => calculateDistance(a) - calculateDistance(b));
      sortedStores.sort((a, b) => calculateDistance(a) - calculateDistance(b));
      break;

    default:
      break;
  }

  return { sortedRestaurants, sortedStores };
};

/**
 * Calculate the distance between the user and a restaurant/store.
 */
export const calculateDistance = (location) => {
  const userLat = parseFloat(localStorage.getItem("userLat") || 0);
  const userLng = parseFloat(localStorage.getItem("userLng") || 0);
  const restaurantLat = parseFloat(location.lat);
  const restaurantLng = parseFloat(location.lng);

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(restaurantLat - userLat);
  const dLon = toRadians(restaurantLng - userLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLat)) * Math.cos(toRadians(restaurantLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

/**
 * Convert degrees to radians.
 */
export const toRadians = (degree) => degree * (Math.PI / 180);
