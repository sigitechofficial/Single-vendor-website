import { useState, useEffect } from "react";
import {
  BsEmojiExpressionless,
  BsEmojiHeartEyes,
  BsEmojiSmile,
  BsEmojiSmileFill,
  BsEmojiTear,
} from "react-icons/bs";
import { IoBicycleSharp } from "react-icons/io5";
import { TfiFaceSad } from "react-icons/tfi";
import BannerTicker from "./BannerTicker";
import { useTranslation } from "react-i18next";
import CustomDeliveryIcon from "./CustomDeliveryIcon";
import { CiFaceSmile } from "react-icons/ci";

export default function RestaurantSearchCard(props) {
  const [message, setMessage] = useState("");
  const [configurationMessage, setConfigurationMessage] = useState("");
  const { t, i18n } = useTranslation();

  const getRatingEmoji = (rating) => {
    if (rating <= 1) return <BsEmojiTear size={14} />;
    if (rating <= 3) return <TfiFaceSad size={14} />;
    if (rating <= 5) return <BsEmojiExpressionless size={14} />;
    if (rating <= 7) return <CiFaceSmile size={14} />;
    if (rating <= 9) return <BsEmojiSmile size={14} />;
    return <BsEmojiHeartEyes />;
  };

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
      }
      if (isClose_schedule_pickupOrders && isClose_schedule_deliveryOrders) {
        setConfigurationMessage(t("• Schedule Order"));
      } else if (isClose_schedule_pickupOrders) {
        setConfigurationMessage(t(`• Pickup for later`));
      } else if (isClose_schedule_deliveryOrders) {
        setConfigurationMessage(t(`• Delivery for later`));
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
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("Offering no Orders"));
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
        props?.time?.length > 0
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
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Delivery now or later"));
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
    <>
      <button
        onClick={props.onClick}
        className={`rounded-lg relative bg-white w-full shadow-searchResCardShadow0 hover:shadow-discoveryCardShadow hover:scale-[1.02] duration-200 overflow-hidden`}
      >
        <div
          className={`relative ${
            props.completelyClosed || !props.isOpen || props.isRushMode
              ? "before:absolute before:w-full before:h-full before:rounded-t-lg before:bottom-0 before:left-0 before:bg-black before:bg-opacity-80"
              : !props.completelyClosed &&
                props.isOpen &&
                !props.isRushMode &&
                configurationMessage.length > 0
              ? "before:absolute before:w-full before:h-[37px] before:bottom-0 before:left-0 before:bg-black before:bg-opacity-80"
              : ""
          }`}
        >
          {props.completelyClosed && (
            <div className="text-white w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2   py-1 rounded ">
              <p className="font-bold font-sf  text-base"> {message}</p>
              <p className="font-bold font-sf  text-base">
                {configurationMessage}
              </p>
            </div>
          )}
          {!props.isOpen && (
            <div className="text-white w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2   py-1  ">
              <p className="font-bold font-sf  text-base"> {message}</p>
              <p className="font-bold font-sf  text-base">
                {configurationMessage}
              </p>
            </div>
          )}
          {props.isRushMode && (
            <div className="text-white w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2   py-1 rounded ">
              <p className="font-bold font-sf  text-base"> {message}</p>
              <p className="font-bold font-sf  text-base">
                {configurationMessage}
              </p>
            </div>
          )}
          {props?.isOpen &&
            !props.isRushMode &&
            !props?.completelyClosed &&
            configurationMessage.length > 0 && (
              <div className="text-white w-full absolute  bottom-[5px] left-3   py-1 rounded ">
                {" "}
                <p className="font-semibold font-sf  text-sm text-start">
                  {configurationMessage}
                </p>
              </div>
            )}
          <img
            src={props.img}
            alt={`res-${props.title}`}
            className={`w-full object-cover rounded-t-lg duration-500 ${
              props.size === "sm"
                ? "h-[144px] smallDesktop:h-[140px] desktop:h-[154px] largeDesktop:h-[165px]"
                : "h-[150px] smallDesktop:h-[175px] desktop:h-[215px] largeDesktop:h-[230px]"
            }`}
          />
          <div className="flex absolute top-3 left-3 flex-wrap gap-2">
            {props?.restBanners?.length > 0 &&
              props.restBanners
                .slice(0, 3)
                .map((banner, index) => (
                  <BannerTicker
                    key={index}
                    banner={banner}
                    currency={props?.currency}
                    rating={props?.rating}
                  />
                ))}
          </div>
          {/* {props?.rating <= 0 && <BannerTicker banner={""} text="New" />} */}
        </div>

        <div
          className={`flex justify-between items-center px-4 pt-3 ${
            props.size === "sm" ? "pb-2" : "pb-3"
          }`}
        >
          <div className="">
            <h4 className="text-start font-semibold text-theme-black-2 text-base capitalize font-sf ">
              {props.title}
            </h4>
            <div className="text-start font-normal text-sm text-black text-opacity-60 capitalize line-clamp-1 w-10/12">
              {props.desc}
            </div>
          </div>
          <div className="bg-red-100 font-normal text-xs rounded-lg px-2 py-1.5 text-red-600 whitespace-nowrap space-y-[-2px] min-w-[60px] min-h-[40px] flex flex-col items-center justify-center">
            <button>
              {props.deliveryTime + "-" + (props.deliveryTime + 10)}
            </button>
            <p> min</p>
          </div>
        </div>

        <div className="px-4 py-2 border-t border-dashed font-sf">
          <div className="flex items-center gap-x-2 text-black text-opacity-60 font-normal text-xs">
            <div className="flex items-center gap-x-2">
              <CustomDeliveryIcon color="#0009" size="12" />
              <span
                className={`${
                  props.deliveryFee == 0
                    ? "text-theme-green-2"
                    : "text-black text-opacity-60"
                }`}
              >
                {props.deliveryFee} {props.currency}
              </span>
            </div>
            {/* <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full"></div> */}
            {/* <div>All 240</div> */}
            <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full"></div>
            <div className="flex items-center gap-x-2 text-xs">
              {getRatingEmoji(props?.rating)} {props?.rating}
            </div>
          </div>
        </div>
      </button>
    </>
  );
}
