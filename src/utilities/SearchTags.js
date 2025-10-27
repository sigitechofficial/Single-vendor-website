// src/utils/restaurantUtils.js

/**
 * Determines the status message for a restaurant based on its state.
 * @param {object} restaurant - The restaurant object.
 * @returns {string} The status message to display.
 */
export const SearchTags = (item) => {
  console.log("tag", item);
  if (item.completeClosed) {
    return "Closed";
  }
  if (!item?.product?.R_MCLink?.restaurant?.isOpen) {
    return "Temporarily Closed";
  }
  if (item?.product?.R_MCLink?.restaurant?.isRushMode) {
    return "Rush Mode";
  }
  return "";
};
