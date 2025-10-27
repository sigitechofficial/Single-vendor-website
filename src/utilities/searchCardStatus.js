// src/utils/restaurantUtils.js

/**
 * Converts 24-hour time format to 12-hour AM/PM format.
 * @param {string} time24 - Time in "HH:MM" format.
 * @returns {string} Time in "h:MM AM/PM" format.
 */
export const convertToAmPm = (time24) => {
  const [hour, minute] = time24.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:${minute < 10 ? "0" + minute : minute} ${period}`;
};

/**
 * Determines the status messages based on restaurant data.
 * @param {object} restaurant - The restaurant data object.
 * @param {Date} [currentTime=new Date()] - The current date and time.
 * @returns {object} An object containing `message` and `configurationMessage`.
 */
export const searchCardStatus = (props, currentTime = new Date()) => {
  if (!props) {
    return { message: "", configurationMessage: "" };
  }

  const { isOpen, completeClosed, getConfiguration, times, isRushMode } = props;

  const {
    isClosed,
    temporaryClosed,
    isRushMode: configIsRushMode,
    isOpen: configIsOpen,
  } = getConfiguration || {};

  const { isClose_schedule_pickupOrders, isClose_schedule_deliveryOrders } =
    isClosed || {};

  const {
    temporaryClose_pickupOrders,
    temporaryClose_schedule_pickupOrders,
    temporaryClose_schedule_deliveryOrders,
  } = temporaryClosed || {};

  const {
    isRushMode_pickupOrders,
    isRushMode_deliveryOrders,
    isRushMode_schedule_pickupOrders,
    isRushMode_schedule_deliveryOrders,
  } = configIsRushMode || {};

  const {
    isOpen_pickupOrders,
    isOpen_deliveryOrders,
    isOpen_schedule_pickupOrders,
    isOpen_schedule_deliveryOrders,
  } = configIsOpen || {};

  // Helper function to convert 24-hour time to 12-hour AM/PM format
  // Defined outside to avoid redundancy

  // Initialize messages
  let message = "";
  let configurationMessage = "";

  // Handle Temporarily Closed
  if (!isOpen && !completeClosed) {
    message = "Temporarily Closed";

    if (
      temporaryClose_pickupOrders &&
      temporaryClose_schedule_pickupOrders &&
      temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = "";
    } else if (
      temporaryClose_pickupOrders &&
      !temporaryClose_schedule_pickupOrders &&
      !temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = "Pickup Only";
    } else if (
      temporaryClose_schedule_pickupOrders &&
      !temporaryClose_pickupOrders &&
      !temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = "Pickup for later";
    } else if (
      temporaryClose_schedule_deliveryOrders &&
      !temporaryClose_pickupOrders &&
      !temporaryClose_schedule_pickupOrders
    ) {
      configurationMessage = "Delivery for later";
    } else if (
      temporaryClose_pickupOrders &&
      temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = "Pickup for now • Delivery for later";
    } else if (
      temporaryClose_pickupOrders &&
      temporaryClose_schedule_pickupOrders
    ) {
      configurationMessage = "Pickup now or later";
    } else if (
      !temporaryClose_pickupOrders &&
      !temporaryClose_schedule_pickupOrders &&
      !temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = "Offering no orders";
    } else {
      configurationMessage = "Schedule Order";
    }
    return { message, configurationMessage };
  }

  // Handle Completely Closed
  if (completeClosed) {
    const currentDay = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentTimeString = currentTime.toTimeString().slice(0, 5); // "HH:MM"

    // Find today's schedule
    const todaySchedule = times.find((day) => Number(day.day) === currentDay);

    // Sort schedules by day
    const sortedSchedules = [...times].sort(
      (a, b) => Number(a.day) - Number(b.day)
    );

    // Find the next open day
    let nextOpenDay = sortedSchedules.find(
      (day) => day.status && Number(day.day) > currentDay
    );
    if (!nextOpenDay) {
      // Wrap around to the first open day of the week
      nextOpenDay = sortedSchedules.find((day) => day.status);
    }

    if (todaySchedule && todaySchedule.status) {
      if (currentTimeString < todaySchedule.startAt) {
        message = `Opens today at ${convertToAmPm(todaySchedule.startAt)}`;
      } else if (currentTimeString > todaySchedule.endAt.trim()) {
        if (nextOpenDay) {
          if (nextOpenDay.day === (currentDay + 1) % 7) {
            message = `Opens tomorrow at ${convertToAmPm(nextOpenDay.startAt)}`;
          } else {
            message = `Opens on ${nextOpenDay.dayName} at ${convertToAmPm(
              nextOpenDay.startAt
            )}`;
          }
        } else {
          message = "Closed";
        }
      } else {
        message = ""; // Currently open
      }
    } else if (nextOpenDay) {
      const nextOpenTime = convertToAmPm(nextOpenDay.startAt);
      if (nextOpenDay.day === (currentDay + 1) % 7) {
        message = `Opens tomorrow at ${nextOpenTime}`;
      } else {
        message = `Opens on ${nextOpenDay.dayName} at ${nextOpenTime}`;
      }
    } else {
      message = "Closed";
    }

    if (isClose_schedule_pickupOrders && isClose_schedule_deliveryOrders) {
      configurationMessage = "Schedule Order";
    } else if (isClose_schedule_pickupOrders) {
      configurationMessage = "Pickup for later";
    } else if (isClose_schedule_deliveryOrders) {
      configurationMessage = " Delivery for later";
    }
  } else {
    message = "Open";
  }

  // Handle Rush Mode
  if (isRushMode && !completeClosed) {
    message = "Rush Mode";

    if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = " Schedule Orders";
    } else if (
      isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Standard Orders";
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Pickup only";
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Delivery only";
    } else if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Schedule Delivery only";
    } else if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = " Schedule Pickup only";
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Pickup Now or Later";
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Pickup Now  Delivery  Later";
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Pickup Now  Schedule  Later";
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Delivery Now  Schedule for Later";
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Delivery Now or Later";
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Delivery Now  Pickup Later";
    } else if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = "Offering no Orders";
    } else {
      configurationMessage = "";
    }
  } // Additional configurations based on isClosed flags

  if (isOpen && !isRushMode && !completeClosed) {
    message = "";

    if (
      isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "";
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Schedule Orders";
    } else if (
      isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Standards Orders";
    } else if (
      isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Pickup only";
    } else if (
      !isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Delivery only";
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Schedule Pickup only";
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Schedule Delivery Only";
    } else if (
      isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Pickup Now or Later";
    } else if (
      isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Pickup Now  Delivery  Later";
    } else if (
      !isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Delivery Now  Schedule  Later";
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = "Offering no Order";
    }
  }

  return { message, configurationMessage };
};
