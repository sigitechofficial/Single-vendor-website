export const getRestaurantOrderType = (restaurant) => {
  //   console.log("Restaurant Data:", restaurant);

  const { getConfiguration, isOpen, completelyClosed, isRushMode } =
    restaurant || {};
  if (!getConfiguration) {
    return ""; // No configuration data available
  }

  // Determine if the restaurant is open, closed, or in rush mode
  const isClosed = completelyClosed; // If isOpen and isRushMode are false, it's closed
  const isTemporaryClosed = !isOpen; // If isOpen is false, it's temporarily closed
  const isInRushMode = isRushMode;

  //   console.log("Restaurant Status:", {
  //     isOpen,
  //     completelyClosed,
  //     isRushMode,
  //     isClosed,
  //     isTemporaryClosed,
  //   });

  // Now we check for delivery and pickup availability based on the status
  let deliveryAllowed = false;
  let pickupAllowed = false;

  if (isOpen && !isClosed) {
    // Restaurant is open, check for both delivery and pickup availability
    deliveryAllowed =
      getConfiguration.isOpen?.isOpen_deliveryOrders ||
      getConfiguration.isOpen?.isOpen_schedule_deliveryOrders;

    pickupAllowed =
      getConfiguration.isOpen?.isOpen_pickupOrders ||
      getConfiguration.isOpen?.isOpen_schedule_pickupOrders;
  }

  if (isClosed) {
    // If the restaurant is closed or temporarily closed, no orders are allowed
    deliveryAllowed =
      getConfiguration.isClosed?.isClose_schedule_deliveryOrders;
    pickupAllowed = getConfiguration.isClosed?.isClose_schedule_pickupOrders;
  }
  if (isTemporaryClosed && !completelyClosed) {
    // If the restaurant is closed or temporarily closed, no orders are allowed
    deliveryAllowed =
      getConfiguration.temporaryClosed?.temporaryClose_schedule_deliveryOrders;

    pickupAllowed =
      getConfiguration.temporaryClosed?.temporaryClose_pickupOrders ||
      getConfiguration.temporaryClosed?.temporaryClose_schedule_pickupOrders;
  }

  if (isInRushMode) {
    // If the restaurant is in rush mode, allow rush mode orders
    deliveryAllowed =
      getConfiguration.isRushMode?.isRushMode_deliveryOrders ||
      getConfiguration.isRushMode?.isRushMode_schedule_deliveryOrders;

    pickupAllowed =
      getConfiguration.isRushMode?.isRushMode_pickupOrders ||
      getConfiguration.isRushMode?.isRushMode_schedule_pickupOrders;
  }

  // Return the order type based on availability
  if (deliveryAllowed && pickupAllowed) {
    return "both"; // Both Delivery and Pickup are allowed
  } else if (pickupAllowed) {
    return "pickup"; // Only Pickup is allowed
  } else if (deliveryAllowed) {
    return "delivery"; // Only Delivery is allowed
  } else {
    return ""; // Neither is allowed
  }
};
