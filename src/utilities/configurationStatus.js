export const determineOrderMessages = (config, t) => {
  const {
    getConfiguration,
    isOpen,
    completelyClosed,
    isRushMode,
    time,
  } = config;

  const { isClose_schedule_pickupOrders, isClose_schedule_deliveryOrders } =
    getConfiguration?.isClosed || {};
  const {
    temporaryClose_pickupOrders,
    temporaryClose_schedule_pickupOrders,
    temporaryClose_schedule_deliveryOrders,
  } = getConfiguration?.temporaryClosed || {};
  const {
    isRushMode_pickupOrders,
    isRushMode_deliveryOrders,
    isRushMode_schedule_pickupOrders,
    isRushMode_schedule_deliveryOrders,
  } = getConfiguration?.isRushMode || {};
  const {
    isOpen_pickupOrders,
    isOpen_deliveryOrders,
    isOpen_schedule_pickupOrders,
    isOpen_schedule_deliveryOrders,
  } = getConfiguration?.isOpen || {};

  const convertToAmPm = (time24) => {
    const [hour, minute] = time24.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute < 10 ? "0" + minute : minute} ${period}`;
  };

  let message = "";
  let configurationMessage = "";

  if (!time || time.length === 0) {
    return { message: t("Closed"), configurationMessage: "" };
  }

  if (!isOpen && !completelyClosed) {
    message = t("Temporarily Closed");

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
      configurationMessage = t("• Pickup Only");
    } else if (
      temporaryClose_schedule_pickupOrders &&
      !temporaryClose_pickupOrders &&
      !temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Pickup for later");
    } else if (
      temporaryClose_schedule_deliveryOrders &&
      !temporaryClose_pickupOrders &&
      !temporaryClose_schedule_pickupOrders
    ) {
      configurationMessage = t("• Delivery for later");
    } else if (
      temporaryClose_pickupOrders &&
      temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Pickup for now • Delivery for later");
    } else if (
      temporaryClose_pickupOrders &&
      temporaryClose_schedule_pickupOrders
    ) {
      configurationMessage = t("• Pickup now or later");
    } else if (
      !temporaryClose_pickupOrders &&
      !temporaryClose_schedule_pickupOrders &&
      !temporaryClose_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Offering no orders");
    } else {
      configurationMessage = t("• Schedule Order");
    }
    return { message, configurationMessage };
  }

  if (completelyClosed) {
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const currentTimeString = currentTime.toTimeString().slice(0, 5);
    const schedule = time;
    const todaySchedule = schedule.find((day) => Number(day.day) === currentDay);
    const nextOpenDay =
      schedule
        .sort((a, b) => a.day - b.day)
        .find((day) => day.status && day.day > currentDay) ||
      schedule.find((day) => day.status);

    if (todaySchedule && todaySchedule.status) {
      if (currentTimeString < todaySchedule.startAt) {
        message = `${t("Opens today at")} ${convertToAmPm(todaySchedule.startAt)}`;
      } else if (currentTimeString > todaySchedule.endAt.trim()) {
        if (nextOpenDay) {
          if (nextOpenDay.day === (currentDay + 1) % 7) {
            message = `${t("Opens tomorrow at")} ${convertToAmPm(nextOpenDay.startAt)}`;
          } else {
            message = `${t("Opens on")} ${nextOpenDay.name} ${t("at")} ${convertToAmPm(nextOpenDay.startAt)}`;
          }
        }
      }
    } else if (nextOpenDay) {
      const nextOpenTime = convertToAmPm(nextOpenDay.startAt);
      if (nextOpenDay.day === (currentDay + 1) % 7) {
        message = t(`Open tomorrow at ${nextOpenTime}`);
      } else {
        message = t(`Open on ${nextOpenDay.name} at ${nextOpenTime}`);
      }
    } else {
      message = t("Closed");
    }
  }

  if (isClose_schedule_pickupOrders && isClose_schedule_deliveryOrders) {
    configurationMessage = t("• Schedule Order");
  } else if (isClose_schedule_pickupOrders) {
    configurationMessage = t("• Pickup for later");
  } else if (isClose_schedule_deliveryOrders) {
    configurationMessage = t("• Delivery for later");
  }

  if (isRushMode && !completelyClosed) {
    message = t("Rush Mode");

    if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Schedule Orders");
    } else if (
      isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Standard Orders • (No schedule order available)");
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Pickup only");
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Delivery only");
    } else if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Schedule Delivery only");
    } else if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t(" • Schedule Pickup only");
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t(" • Pickup Now or Later");
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t(" • Pickup Now • Delivery for Later");
    } else if (
      isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t(" • Pickup Now • Schedule for Later");
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t(" • Delivery Now • Schedule for Later");
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Delivery Now or Later");
    } else if (
      !isRushMode_pickupOrders &&
      isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("• Delivery Now • Pickup Later");
    } else if (
      !isRushMode_pickupOrders &&
      !isRushMode_deliveryOrders &&
      !isRushMode_schedule_deliveryOrders &&
      !isRushMode_schedule_pickupOrders
    ) {
      configurationMessage = t("Offering no Orders");
    } else {
      configurationMessage = "";
    }
  }

  if (
    isOpen &&
    !isRushMode &&
    !completelyClosed &&
    time?.length > 0
  ) {
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
      configurationMessage = t("• Schedule Order");
    } else if (
      isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Standard Order");
    } else if (
      isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Pickup Only");
    } else if (
      !isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Delivery Only");
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Schedule Pickup");
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Schedule Delivery");
    } else if (
      isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Pickup now or later");
    } else if (
      isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Pickup now or schedule later");
    } else if (
      !isOpen_pickupOrders &&
      isOpen_deliveryOrders &&
      isOpen_schedule_pickupOrders &&
      isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Delivery now or later");
    } else if (
      !isOpen_pickupOrders &&
      !isOpen_deliveryOrders &&
      !isOpen_schedule_pickupOrders &&
      !isOpen_schedule_deliveryOrders
    ) {
      configurationMessage = t("• Offering no Orders");
    }
  }

  return { message, configurationMessage };
};
