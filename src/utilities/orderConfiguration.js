export const getRestaurantOrderAvailability = (restaurant) => {
  const { getConfiguration, isOpen, completeClosed, isRushMode } =
    restaurant || {};
  if (!getConfiguration) {
    return {
      isOpen: false,
      isClosed: false,
      isTemporaryClosed: false,
      isRushMode: false,
      canDeliverStandard: false,
      canDeliverSchedule: false,
      canPickupStandard: false,
      canPickupSchedule: false,
    };
  }

  const closed = completeClosed || (!isOpen && !isRushMode);
  const temporaryClosed = !isOpen && !completeClosed && !isRushMode;

  // Section name in config (outer object keys)
  let activeGroup = "isOpen";
  if (completeClosed) activeGroup = "isClosed";
  else if (temporaryClosed) activeGroup = "temporaryClosed";
  else if (isRushMode) activeGroup = "isRushMode";

  // Inner key prefix used by API (note: isClose / temporaryClose)
  const GROUP_PREFIX = {
    isOpen: "isOpen",
    isClosed: "isClose",
    temporaryClosed: "temporaryClose",
    isRushMode: "isRushMode",
  };

  // Suffix parts used by API
  const KEY = {
    deliveryStandard: "deliveryOrders",
    deliverySchedule: "schedule_deliveryOrders",
    pickupStandard: "pickupOrders",
    pickupSchedule: "schedule_pickupOrders",
  };

  const section = getConfiguration?.[activeGroup] || {};
  const prefix = GROUP_PREFIX[activeGroup];

  const pick = (suffix) => section?.[`${prefix}_${suffix}`] ?? false;

  return {
    isOpen: isOpen && !completeClosed,
    isClosed: closed,
    isTemporaryClosed: temporaryClosed,
    isRushMode,

    canDeliverStandard: pick(KEY.deliveryStandard),
    canDeliverSchedule: pick(KEY.deliverySchedule),
    canPickupStandard: pick(KEY.pickupStandard),
    canPickupSchedule: pick(KEY.pickupSchedule),
  };
};

export const determineButtonStates = (availability) => {
  const {
    canDeliverStandard,
    canDeliverSchedule,
    canPickupStandard,
    canPickupSchedule,
  } = availability;

  return {
    disableDelivery: !(canDeliverStandard || canDeliverSchedule),
    disablePickup: !(canPickupStandard || canPickupSchedule),
    disableStandard: !(canDeliverStandard || canPickupStandard),
    disableSchedule: !(canDeliverSchedule || canPickupSchedule),
  };
};
