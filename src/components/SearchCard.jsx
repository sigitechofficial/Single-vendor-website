import { useState, useEffect } from "react";
import CustomDeliveryIcon from "./CustomDeliveryIcon";
import { searchCardStatus } from "../utilities/searchCardStatus";
import { getRestaurantStatus } from "../utilities/restuarantTimeMessage";
import { useTranslation } from "react-i18next";

const SearchCard = (props) => {
  const [message, setMessage] = useState("");
  const [configurationMessage, setConfigurationMessage] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const determineMessage = () => {
      const { isClose_schedule_pickupOrders, isClose_schedule_deliveryOrders } =
        props?.configuration || {};
      const {
        temporaryClose_pickupOrders,
        temporaryClose_schedule_pickupOrders,
        temporaryClose_schedule_deliveryOrders,
      } = props?.configuration || {};
      const {
        isRushMode_pickupOrders,
        isRushMode_deliveryOrders,
        isRushMode_schedule_pickupOrders,
        isRushMode_schedule_deliveryOrders,
      } = props?.configuration || {};

      const {
        isOpen_pickupOrders,
        isOpen_deliveryOrders,
        isOpen_schedule_pickupOrders,
        isOpen_schedule_deliveryOrders,
      } = props?.configuration || {};

      const allTemporaryClosedFlagsFalse =
        !props.configuration?.temporaryClosed?.temporaryClose_pickupOrders &&
        !props.configuration?.temporaryClosed
          ?.temporaryClose_schedule_pickupOrders &&
        !props.configuration?.temporaryClosed
          ?.temporaryClose_schedule_deliveryOrders;

      const convertToAmPm = (time24) => {
        const [hour, minute] = time24.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${
          minute < 10 ? "0" + minute : minute
        } ${period}`;
      };

      if (!props.times || props.times.length === 0) {
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

        // Move this inside the block so it only runs if completelyClosed is true
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
        }
        // When accepting only standard orders (no schedule orders)
        else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Standard Orders • (No schedule order available)")
          );
        }
        // When accepting only standard pickup orders
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Pickup only"));
        }
        // When accepting only standard delivery orders
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery only"));
        }
        // When accepting only schedule delivery orders
        else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Schedule Delivery only"));
        }
        // When accepting only schedule pickup orders
        else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Schedule Pickup only"));
        }
        // When accepting pickup now or later
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now or Later"));
        }
        // When accepting pickup now and delivery for later
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now • Delivery for Later"));
        }
        // When accepting pickup now and schedule for later
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now • Schedule for Later"));
        }
        // When accepting delivery now and schedule for later
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Delivery Now • Schedule for Later"));
        }
        // When accepting delivery now or later
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery Now or Later"));
        }
        // When accepting delivery now and pickup for later
        else if (
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
        }
        // Default case
        else {
          setConfigurationMessage("");
        }
      }

      //   is resturant is open and it offer sceduale and pcikup orders only
      if (
        props?.isOpen &&
        !props?.isRushMode &&
        !props?.completeClosed &&
        props?.times?.length > 0
      ) {
        // setMessage("");

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

  return (
    <div className="relative rounded-lg overflow-hidden duration-200 border bg-white w-full hover:shadow-discoveryCardShadow hover:scale-[1.02] cursor-pointer">
      <div className="relative">
        {(message || configurationMessage) && (
          <div className="absolute bottom-0 w-full bg-black text-white px-3 py-2 text-sm bg-opacity-80">
            {message && <div>{message}</div>}
            {configurationMessage && <div>{configurationMessage}</div>}
          </div>
        )}
        <img
          className="w-full h-[160px] sm:h-[100px] mx-auto object-cover"
          src={props.img}
          alt=""
        />
      </div>
      <div className="px-3 pt-1.5 font-sf mb-1.5">
        <div className="">
          <h4 className="text-base line-clamp-1">{props.restaurantName}</h4>
          <p className="text-xs font-light text-gray-600 line-clamp-1">
            {props.text || "."}
          </p>
        </div>
      </div>
      <div className="border-t border-dashed px-3 py-2 mt-1.5 text-sm font-sf flex gap-x-1 items-center">
        <CustomDeliveryIcon color="#0009" size="12" />
        <p className="text-gray-500 font-sf text-xs line-clamp-1">
          {props.unit} {props.deliveryCharges || "0.00"} . {props.subtext}
        </p>
      </div>
    </div>
  );
};

export default SearchCard;
