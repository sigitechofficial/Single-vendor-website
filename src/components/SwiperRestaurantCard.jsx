import { useState, useEffect } from "react";
import { FaStar, FaClock, FaMotorcycle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getRestaurantStatus } from "../utilities/restuarantTimeMessage";

export default function SwiperRestaurantCard(props) {
  const [message, setMessage] = useState("");
  const [configurationMessage, setConfigurationMessage] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const determineMessage = () => {
      const { isClose_schedule_pickupOrders, isClose_schedule_deliveryOrders } =
        props?.getConfiguration?.isClosed || {};
      const {
        temporaryClose_pickupOrders,
        temporaryClose_schedule_pickupOrders,
        temporaryClose_schedule_deliveryOrders,
      } = props?.getConfiguration?.temporaryClosed || {};
      const {
        isRushMode_pickupOrders,
        isRushMode_deliveryOrders,
        isRushMode_schedule_pickupOrders,
        isRushMode_schedule_deliveryOrders,
      } = props?.getConfiguration?.isRushMode || {};

      const {
        isOpen_pickupOrders,
        isOpen_deliveryOrders,
        isOpen_schedule_pickupOrders,
        isOpen_schedule_deliveryOrders,
      } = props?.getConfiguration?.isOpen || {};

      const allTemporaryClosedFlagsFalse =
        !props.getConfiguration?.temporaryClosed?.temporaryClose_pickupOrders &&
        !props.getConfiguration?.temporaryClosed
          ?.temporaryClose_schedule_pickupOrders &&
        !props.getConfiguration?.temporaryClosed
          ?.temporaryClose_schedule_deliveryOrders;

      const convertToAmPm = (time24) => {
        const [hour, minute] = time24.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${
          minute < 10 ? "0" + minute : minute
        } ${period}`;
      };

      if (!props.time || props.time.length === 0) {
        setMessage(t("Closed"));
      }

      if (!props.isOpen && !props.completelyClosed) {
        setMessage(t("Temporarily Closed"));

        if (
          temporaryClose_pickupOrders &&
          temporaryClose_schedule_pickupOrders &&
          temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage("");
        } else if (
          temporaryClose_pickupOrders &&
          !temporaryClose_schedule_pickupOrders &&
          !temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup Only"));
        } else if (
          temporaryClose_schedule_pickupOrders &&
          !temporaryClose_pickupOrders &&
          !temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup for later"));
        } else if (
          temporaryClose_schedule_deliveryOrders &&
          !temporaryClose_pickupOrders &&
          !temporaryClose_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery for later"));
        } else if (
          temporaryClose_pickupOrders &&
          temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup for now • Delivery for later"));
        } else if (
          temporaryClose_pickupOrders &&
          temporaryClose_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Pickup now or later"));
        } else if (
          !temporaryClose_pickupOrders &&
          !temporaryClose_schedule_pickupOrders &&
          !temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Offering no orders"));
        } else {
          setConfigurationMessage(t("• Schedule Order"));
        }
        return;
      }

      if (props.completelyClosed) {
        const currentTime = new Date();
        const currentDay = currentTime.getDay();
        const currentTimeString = currentTime.toTimeString().slice(0, 5);
        const schedule = props?.time;
        const todaySchedule = schedule.find(
          (day) => Number(day.day) === currentDay
        );
        const nextOpenDay =
          schedule
            .sort((a, b) => a.day - b.day)
            .find((day) => day.status && day.day > currentDay) ||
          schedule.find((day) => day.status);

        if (todaySchedule && todaySchedule.status) {
          if (currentTimeString < todaySchedule.startAt) {
            setMessage(
              `${t("Opens today at")} ${convertToAmPm(todaySchedule.startAt)}`
            );
          } else if (currentTimeString > todaySchedule.endAt.trim()) {
            if (nextOpenDay) {
              if (nextOpenDay.day === (currentDay + 1) % 7) {
                setMessage(
                  `${t("Opens tomorrow at")} ${convertToAmPm(
                    nextOpenDay.startAt
                  )}`
                );
              } else {
                setMessage(
                  `${t("Opens on")} ${nextOpenDay.name} ${t(
                    "at"
                  )} ${convertToAmPm(nextOpenDay.startAt)}`
                );
              }
            }
          } else {
            setMessage("");
          }
        } else if (nextOpenDay) {
          const nextOpenTime = convertToAmPm(nextOpenDay.startAt);
          if (nextOpenDay.day === (currentDay + 1) % 7) {
            setMessage(t(`Open tomorrow at ${nextOpenTime}`));
          } else {
            setMessage(t(`Open on ${nextOpenDay.name} at ${nextOpenTime}`));
          }
        } else {
          setMessage(t(`Closed`));
        }

        if (isClose_schedule_pickupOrders && isClose_schedule_deliveryOrders) {
          setConfigurationMessage(t("• Schedule Order"));
        } else if (isClose_schedule_pickupOrders) {
          setConfigurationMessage(t(`• Pickup for later`));
        } else if (isClose_schedule_deliveryOrders) {
          setConfigurationMessage(t(`• Delivery for later`));
        }
      }

      if (props.isRushMode && !props.completelyClosed) {
        setMessage(t("Rush Mode"));

        if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Schedule Orders"));
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Standard Orders • (No schedule order available)")
          );
        } else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Pickup only"));
        } else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery only"));
        } else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Schedule Delivery only"));
        } else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Schedule Pickup only"));
        } else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now or Later"));
        } else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now • Delivery for Later"));
        } else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now • Schedule for Later"));
        } else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Delivery Now • Schedule for Later"));
        } else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery Now or Later"));
        } else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery Now • Pickup Later"));
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Pickup nor or later • Delivery for now")
          );
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Delivery nor or later , pickup for now")
          );
        } else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("Offering no Orders"));
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setMessage("");
          setConfigurationMessage(t("Rush Mode"));
        } else {
          setConfigurationMessage("");
        }
      }

      if (
        props?.isOpen &&
        !props?.isRushMode &&
        !props?.completeClosed &&
        props?.time?.length > 0
      ) {
        if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage("");
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Schedule Order"));
        } else if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Standard Order"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(
            t("Delivery now or later • pickup for later")
          );
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup Only"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("Delivery now  or later"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("Delivery now • pickup for later"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Delivery Only"));
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Schedule Pickup"));
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Schedule Delivery"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup now or later"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup now or schedule later"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(
            t("Pickup now or later • Delivery for later")
          );
        } else if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("standard orders •  schedule pickup only"));
        } else if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("standard orders •  schedule delivery "));
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage("• Offering no Orders");
        }
      }
    };
    determineMessage();
  }, [props]);

  const getRestaurantStatusInfo = (restaurant) => {
    const status = getRestaurantStatus(restaurant);
    return status.message || "Open";
  };

  const statusMessage = getRestaurantStatusInfo(props);
  const isOpen = statusMessage.includes("Open");
  const isTemporaryClosed = statusMessage.includes("Temporarily Closed");

  return (
    <button
      onClick={props.onClick}
      className={`w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] ${
        props?.isSelected ? "ring-1 ring-theme-green-2" : ""
      }`}
    >
      <div className="flex items-center p-3 space-x-3">
        {/* Restaurant Image */}
        <div className="relative flex-shrink-0">
          <div className="relative">
            <img
              src={props.logo}
              alt={props.title}
              className="w-20 h-20 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = "/images/restaurants/restaurant.png";
              }}
            />

            {/* Status overlay */}
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 text-start">
              <h3 className="text-base font-semibold text-theme-black-2 truncate">
                {props.title}
              </h3>
              <p className="text-sm text-gray-600 truncate mt-1">
                {props.desc || "\u00A0"}
              </p>
            </div>

            {/* Status Badge */}
            <dipp className="flex-shrink-0 ml-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {statusMessage}
              </span>
            </dipp>
          </div>

          {/* Rating and Info */}
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-xs" />
              <span className="text-xs text-gray-600">
                {parseFloat(props.rating).toFixed(1)}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <FaClock className="text-gray-400 text-xs" />
              <span className="text-xs text-gray-600">
                {props.deliveryTime} min
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <FaMotorcycle className="text-gray-400 text-xs" />
              <span
                className={`text-xs ${
                  props.deliveryFee == 0
                    ? "text-green-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                {props.deliveryFee} {props.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

